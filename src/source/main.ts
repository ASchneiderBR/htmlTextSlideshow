import { DEFAULT_POLL_INTERVAL, MIN_POLL_INTERVAL, STORAGE_KEY } from "../shared/constants";
import { ensureFontLoaded } from "../shared/fonts";
import { renderMarkdown } from "../shared/markdown";
import { loadStoredState } from "../shared/storage";
import { createStateChannel, requestState } from "../shared/transport";
import type { Slide, SlideshowSettings, SlideshowState, TransitionType } from "../shared/types";
import "./styles.css";

type TransportMode = "channel" | "storage" | "json";

const app = document.getElementById("app");

if (!app) {
  throw new Error("Source root element not found.");
}

app.innerHTML = `
  <div class="source-shell" data-state="loading" data-theme="dark">
    <div class="source-stage">
      <div class="slide-body"><div class="slide-content"><p>Waiting for slides...</p></div></div>
      <div class="slide-progress" hidden></div>
    </div>
    <div class="debug-panel" hidden>state: loading</div>
  </div>
`;

const shellEl = app.querySelector<HTMLElement>(".source-shell")!;
const stageEl = app.querySelector<HTMLElement>(".source-stage")!;
const bodyEl = app.querySelector<HTMLElement>(".slide-body")!;
const contentEl = app.querySelector<HTMLElement>(".slide-content")!;
const progressEl = app.querySelector<HTMLElement>(".slide-progress")!;
const debugEl = app.querySelector<HTMLElement>(".debug-panel")!;
const params = new URLSearchParams(window.location.search);
const requestedMode = (params.get("mode") || "channel").toLowerCase() as TransportMode;
const pollInterval = Math.max(MIN_POLL_INTERVAL, Number(params.get("pollInterval") || DEFAULT_POLL_INTERVAL));
const statePath = params.get("statePath") || "./slides.json";
const showDebug = params.get("debug") === "1" || params.get("showMeta") === "1";

let transportMode: TransportMode = requestedMode;
let channel: BroadcastChannel | null = null;
let pollTimer = 0;
let animationTimer = 0;
let progressFrame = 0;
let currentIndex = -1;
let lastUpdatedAt = "";
let lastSlideId = "";
let lastTransitionType: TransitionType | "" = "";
let lastAppliedState: SlideshowState | null = null;
let isAnimating = false;
let activeGhost: HTMLElement | null = null;
const stateQueue: SlideshowState[] = [];

if (showDebug) {
  debugEl.hidden = false;
}

function setDebug(text: string) {
  if (showDebug) {
    debugEl.textContent = text;
  }
}

function setShellState(state: string) {
  shellEl.dataset.state = state;
}

function renderMessage(message: string) {
  contentEl.innerHTML = `<p>${message}</p>`;
}

function renderSlideHtml(html: string) {
  contentEl.innerHTML = html;
}

function canUseStorage() {
  try {
    localStorage.setItem(`${STORAGE_KEY}.probe`, "1");
    localStorage.removeItem(`${STORAGE_KEY}.probe`);
    return true;
  } catch {
    return false;
  }
}

function resolveFallbackMode(): TransportMode {
  return canUseStorage() ? "storage" : "json";
}

if (!["channel", "storage", "json"].includes(transportMode)) {
  transportMode = resolveFallbackMode();
}

function cleanupGhost() {
  if (activeGhost?.parentNode) {
    activeGhost.parentNode.removeChild(activeGhost);
  }
  activeGhost = null;
}

function cleanupAnimationTimer() {
  if (animationTimer) {
    window.clearTimeout(animationTimer);
    animationTimer = 0;
  }
}

function cleanupProgressFrame() {
  if (progressFrame) {
    window.cancelAnimationFrame(progressFrame);
    progressFrame = 0;
  }
}

function stopPolling() {
  if (pollTimer) {
    window.clearInterval(pollTimer);
    pollTimer = 0;
  }
}

function startPolling() {
  stopPolling();
  if (transportMode === "storage") {
    const storedState = loadStoredState();
    if (storedState) {
      enqueueState(storedState);
    }
    pollTimer = window.setInterval(() => {
      const nextState = loadStoredState();
      enqueueState(nextState);
    }, pollInterval);
  } else if (transportMode === "json") {
    fetchState();
    pollTimer = window.setInterval(fetchState, pollInterval);
  }
}

function switchTransportMode(reason: string) {
  if (transportMode === "storage" || transportMode === "json") {
    return;
  }
  transportMode = resolveFallbackMode();
  console.warn(`${reason} Falling back to ${transportMode} mode.`);
  startPolling();
  setDebug(`state: fallback (${transportMode})`);
}

function onAnimationComplete() {
  isAnimating = false;
  if (stateQueue.length > 0) {
    const nextState = stateQueue.shift();
    if (nextState) {
      window.setTimeout(() => applyState(nextState), 0);
    }
  }
}

function enqueueState(state: SlideshowState) {
  if (!state) {
    return;
  }
  if (state.updatedAt && state.updatedAt === lastUpdatedAt && state.activeSlideIndex === currentIndex) {
    return;
  }
  if (isAnimating) {
    stateQueue.push(state);
    return;
  }
  applyState(state);
}

function fetchState() {
  if (transportMode !== "json") {
    return;
  }

  fetch(`${statePath}?t=${Date.now()}`, { cache: "no-store" })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.json() as Promise<SlideshowState>;
    })
    .then((nextState) => enqueueState(nextState))
    .catch(() => {
      setShellState("error");
      renderMessage("Unable to load slides.");
      setDebug("state: error");
    });
}

function applyTypography(slide: Slide, settings: SlideshowSettings) {
  const fontFamily = slide.fontFamily || settings.defaultFontFamily;
  const fontSizePx = slide.fontSizePx || settings.defaultFontSizePx;
  const textAlign = slide.textAlign || settings.textAlign;
  const horizontalAlign = textAlign === "left" ? "flex-start" : textAlign === "right" ? "flex-end" : "center";

  shellEl.dataset.theme = settings.theme;
  ensureFontLoaded(fontFamily);

  bodyEl.style.justifyContent = settings.verticalAlign;
  bodyEl.style.alignItems = horizontalAlign;

  contentEl.style.fontFamily = fontFamily;
  contentEl.style.fontSize = `${fontSizePx}px`;
  contentEl.style.lineHeight = String(settings.lineHeight);
  contentEl.style.textAlign = textAlign;
  contentEl.style.color = settings.textColor;
  contentEl.style.opacity = String(settings.textOpacity / 100);
  contentEl.style.textShadow = settings.shadowIntensity > 0
    ? `${settings.shadowIntensity * 0.18}px ${settings.shadowIntensity * 0.18}px ${settings.shadowIntensity * 0.45}px rgba(0,0,0,0.9)`
    : "none";
  contentEl.style.webkitTextStroke = settings.strokeIntensity > 0 ? `${settings.strokeIntensity * 1.6}px rgba(0,0,0,0.95)` : "0";
  contentEl.style.paintOrder = settings.strokeIntensity > 0 ? "stroke fill" : "normal";
}

function resetBodyClasses() {
  bodyEl.className = "slide-body";
  bodyEl.style.willChange = "auto";
}

function syncGhostStyles(ghost: HTMLElement) {
  ghost.className = `${bodyEl.className} slide-ghost`;
  ghost.style.justifyContent = bodyEl.style.justifyContent;
  ghost.style.alignItems = bodyEl.style.alignItems;
}

function updateProgress(durationMs: number, show: boolean) {
  cleanupProgressFrame();
  if (!show || !durationMs) {
    progressEl.hidden = true;
    progressEl.style.transition = "none";
    progressEl.style.width = "0%";
    return;
  }

  progressEl.hidden = false;
  progressEl.style.transition = "none";
  progressEl.style.width = "0%";
  progressFrame = window.requestAnimationFrame(() => {
    progressEl.style.transition = `width ${durationMs}ms linear`;
    progressEl.style.width = "100%";
  });
}

function swapContent(slide: Slide, settings: SlideshowSettings, shouldAnimate: boolean) {
  cleanupAnimationTimer();
  cleanupGhost();

  const html = renderMarkdown(slide.raw || slide.body);
  const transition = shouldAnimate ? settings.transitionType : "none";
  const duration = Math.max(0, settings.transitionDuration);
  shellEl.style.setProperty("--transition-duration", `${duration}ms`);

  if (transition === "none" || duration === 0) {
    resetBodyClasses();
    renderSlideHtml(html);
    onAnimationComplete();
    return;
  }

  if (transition === "fade") {
    resetBodyClasses();
    bodyEl.classList.add("transition-fade-out");
    animationTimer = window.setTimeout(() => {
      renderSlideHtml(html);
      bodyEl.classList.remove("transition-fade-out");
      bodyEl.classList.add("transition-fade-in");
      animationTimer = window.setTimeout(() => {
        resetBodyClasses();
        onAnimationComplete();
      }, duration);
    }, duration);
    return;
  }

  const ghost = bodyEl.cloneNode(true) as HTMLElement;
  syncGhostStyles(ghost);

  const outClass = `transition-${transition}-out`;
  const inClass = `transition-${transition}-in`;
  ghost.classList.add(outClass);

  window.requestAnimationFrame(() => {
    const rect = bodyEl.getBoundingClientRect();
    ghost.style.position = "fixed";
    ghost.style.left = `${rect.left}px`;
    ghost.style.top = `${rect.top}px`;
    ghost.style.width = `${rect.width}px`;
    ghost.style.height = `${rect.height}px`;
    ghost.style.margin = "0";
    activeGhost = ghost;
    document.body.appendChild(ghost);

    resetBodyClasses();
    renderSlideHtml(html);
    bodyEl.classList.add(inClass);

    animationTimer = window.setTimeout(() => {
      cleanupGhost();
      resetBodyClasses();
      onAnimationComplete();
    }, duration);
  });
}

function applyState(nextState: SlideshowState) {
  const slides = Array.isArray(nextState.slides) ? nextState.slides : [];
  if (slides.length === 0) {
    setShellState("empty");
    renderMessage("Waiting for the dock to publish...");
    updateProgress(0, false);
    setDebug("state: empty");
    onAnimationComplete();
    return;
  }

  const index = Math.max(0, Math.min(nextState.activeSlideIndex, slides.length - 1));
  const slide = slides[index];
  const transitionType = nextState.settings.transitionType;
  const shouldAnimate = slide.id !== lastSlideId || transitionType !== lastTransitionType;

  lastUpdatedAt = nextState.updatedAt;
  currentIndex = index;
  lastSlideId = slide.id;
  lastTransitionType = transitionType;
  lastAppliedState = nextState;
  setShellState("ready");
  setDebug(`state: ready (#${index + 1}/${slides.length}) via ${transportMode}`);

  try {
    applyTypography(slide, nextState.settings);
    if (shouldAnimate) {
      isAnimating = true;
    }
    swapContent(slide, nextState.settings, shouldAnimate);
    const progressDuration = slide.durationMs || (nextState.playlist.isPlaying ? nextState.playlist.autoAdvanceMs : 0);
    updateProgress(progressDuration, nextState.settings.showProgressBar);
  } catch (error) {
    console.error(error);
    setShellState("error");
    renderMessage("Unable to render the current slide.");
    onAnimationComplete();
  }
}

channel = createStateChannel("browser-overlay", (nextState) => enqueueState(nextState));
if (requestedMode === "channel" && channel) {
  requestState(channel);
} else if (requestedMode === "channel") {
  switchTransportMode("BroadcastChannel unavailable.");
}

window.addEventListener("storage", (event) => {
  if (transportMode !== "storage") {
    return;
  }
  if (event.key !== STORAGE_KEY || !event.newValue) {
    return;
  }
  try {
    enqueueState(JSON.parse(event.newValue) as SlideshowState);
  } catch {
    // Ignore malformed values.
  }
});

if (transportMode !== "channel") {
  startPolling();
}

window.addEventListener("beforeunload", () => {
  cleanupGhost();
  cleanupAnimationTimer();
  cleanupProgressFrame();
  stopPolling();
  channel?.close();
});

if (lastAppliedState === null) {
  const storedState = loadStoredState();
  if (storedState) {
    enqueueState(storedState);
  } else {
    renderMessage("Waiting for the dock to publish...");
  }
}
