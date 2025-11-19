import { markdownToHtml } from "../../common/scripts/markdown.js";

const appEl = document.querySelector("#app");
const bodyEl = document.querySelector(".slide-body");
const containerEl = document.querySelector(".slide-container");
const progressEl = document.querySelector(".slide-progress");
const debugEl = document.querySelector(".debug");

const params = new URLSearchParams(window.location.search);
const statePath = params.get("statePath") || "../data/slides.state.json";
const pollInterval = Number(params.get("pollInterval") || "1000");
const showDebug = params.get("debug") === "1";
const showMeta = params.get("showMeta") === "1";
const supportsChannel = typeof BroadcastChannel !== "undefined";
let stateMode = (params.get("mode") || (supportsChannel ? "channel" : "json")).toLowerCase();

let lastUpdatedAt = "";
let currentIndex = -1;

if (debugEl && (showDebug || showMeta)) {
  debugEl.hidden = false;
  debugEl.querySelector(".debug__state").textContent = "state: booting";
}

let channel = null;
if (supportsChannel) {
  channel = new BroadcastChannel("obs-text-slides");
  channel.addEventListener("message", (event) => {
    const payload = event?.data;
    if (!payload || typeof payload !== "object") return;
    if (payload.type === "state") {
      handleState(payload.payload);
    }
  });
  channel.postMessage({ type: "request-state", source: "browser-overlay" });
} else if (stateMode === "channel") {
  console.warn("BroadcastChannel is unavailable; falling back to JSON polling.");
  stateMode = "json";
}

async function fetchState() {
  if (stateMode !== "json") return;
  try {
    const response = await fetch(`${statePath}?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    handleState(data);
  } catch (error) {
    setState("error");
    if (bodyEl) {
      bodyEl.innerHTML = "<p>Unable to load slides from JSON.</p>";
    }
    if (debugEl && (showDebug || showMeta)) {
      debugEl.querySelector(".debug__state").textContent = `state: error (${error.message})`;
    }
  }
}

function handleState(data) {
  const slides = Array.isArray(data?.slides) ? data.slides : [];
  if (!slides.length) {
    setState("empty");
    if (bodyEl) {
      bodyEl.innerHTML = "<p>Waiting for the dock to publish…</p>";
    }
    resetProgress();
    return;
  }

  const index = Math.min(Math.max(data.activeSlideIndex ?? 0, 0), slides.length - 1);
  if (data.updatedAt === lastUpdatedAt && index === currentIndex) {
    return;
  }
  lastUpdatedAt = data.updatedAt;
  currentIndex = index;

  const slide = slides[index];
  const settings = data.settings || {};

  setState("ready");
  applyTypography(slide, settings);
  swapContent(slide);
  updateProgress(slide.durationMs || data.playlist?.autoAdvanceMs || 0);

  if (debugEl && (showDebug || showMeta)) {
    debugEl.querySelector(".debug__state").textContent = `state: ready (#${index + 1}/${slides.length})`;
  }
}

function applyTypography(slide, settings) {
  if (!bodyEl) return;
  const fontFamily = slide.fontFamily || settings.defaultFontFamily || "Inter, 'Segoe UI', sans-serif";
  const fontSizePx = slide.fontSizePx || settings.defaultFontSizePx || 36;
  const textAlign = slide.textAlign || settings.textAlign || "center";
  const lineHeight = slide.lineHeight || settings.lineHeight || 1.2;
  const verticalAlign = slide.verticalAlign || settings.verticalAlign || "center";

  bodyEl.style.fontFamily = fontFamily;
  bodyEl.style.textAlign = textAlign;
  bodyEl.style.lineHeight = lineHeight;
  document.documentElement.style.setProperty("--font-size-target", fontSizePx);
  
  if (containerEl) {
    // Apply vertical alignment properly
    containerEl.style.justifyContent = verticalAlign;
    containerEl.style.alignItems = textAlign === "left" ? "flex-start" : 
                                    textAlign === "right" ? "flex-end" : "center";
  }
}

function swapContent(slide) {
  if (!bodyEl) return;
  const markdown = slide.raw ?? slide.body ?? "";
  bodyEl.classList.add("is-hidden");
  setTimeout(() => {
    bodyEl.innerHTML = markdown ? markdownToHtml(markdown) : "<p>(empty slide)</p>";
    bodyEl.classList.remove("is-hidden");
  }, 120);
}

function updateProgress(durationMs) {
  if (!progressEl) return;
  if (!durationMs) {
    resetProgress();
    return;
  }
  progressEl.hidden = false;
  progressEl.style.transition = "none";
  progressEl.style.width = "0%";
  requestAnimationFrame(() => {
    progressEl.style.transition = `width ${durationMs}ms linear`;
    progressEl.style.width = "100%";
  });
}

function resetProgress() {
  if (!progressEl) return;
  progressEl.hidden = true;
  progressEl.style.transition = "none";
  progressEl.style.width = "0%";
}

function setState(value) {
  if (appEl) {
    appEl.dataset.state = value;
  }
}

setState("loading");
if (stateMode === "json") {
  fetchState();
  setInterval(fetchState, pollInterval);
}

