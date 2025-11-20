import { markdownToHtml } from "../../common/scripts/markdown.js";

const appEl = document.querySelector("#app");
const bodyEl = document.querySelector(".slide-body");
const containerEl = document.querySelector(".slide-container");
const progressEl = document.querySelector(".slide-progress");
const debugEl = document.querySelector(".debug");

const params = new URLSearchParams(window.location.search);
const statePath = params.get("statePath") || "../data/slides.state.json";
const pollInterval = Number(params.get("pollInterval") || "2000"); // Increased from 1000ms to 2000ms
const showDebug = params.get("debug") === "1";
const showMeta = params.get("showMeta") === "1";
const supportsChannel = typeof BroadcastChannel !== "undefined";
let stateMode = (params.get("mode") || (supportsChannel ? "channel" : "json")).toLowerCase();

let lastUpdatedAt = "";
let currentIndex = -1;
let lastTransitionType = null;
const loadedFonts = new Set();

// Function to load fonts dynamically only when needed
function loadGoogleFont(fontFamily) {
  const fontName = fontFamily.split(',')[0].replace(/['"]/g, '').trim();
  
  // Map Google Fonts
  const googleFonts = {
    'Montserrat': 'Montserrat:wght@400;600;700',
    'Roboto': 'Roboto:wght@400;700',
    'Open Sans': 'Open+Sans:wght@400;600;700',
    'Lato': 'Lato:wght@400;700',
    'Poppins': 'Poppins:wght@400;600;700',
    'Raleway': 'Raleway:wght@400;600;700',
    'Ubuntu': 'Ubuntu:wght@400;700',
    'Nunito': 'Nunito:wght@400;700',
    'Playfair Display': 'Playfair+Display:wght@400;700',
    'Merriweather': 'Merriweather:wght@400;700',
    'PT Sans': 'PT+Sans:wght@400;700',
    'Oswald': 'Oswald:wght@400;700'
  };
  
  if (googleFonts[fontName] && !loadedFonts.has(fontName)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${googleFonts[fontName]}&display=swap`;
    document.head.appendChild(link);
    loadedFonts.add(fontName);
  }
}

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
  }, { passive: true });
  channel.postMessage({ type: "request-state", source: "browser-overlay" });
} else if (stateMode === "channel") {
  console.warn("BroadcastChannel is unavailable; falling back to JSON polling.");
  stateMode = "json";
}

let lastETag = null;
let lastModified = null;

async function fetchState() {
  if (stateMode !== "json") return;
  try {
    // Use conditional headers to avoid unnecessary downloads
    const headers = {};
    if (lastETag) headers['If-None-Match'] = lastETag;
    if (lastModified) headers['If-Modified-Since'] = lastModified;
    
    const response = await fetch(`${statePath}?t=${Date.now()}`, { 
      cache: "no-store",
      headers
    });
    
    // If returns 304, no changes
    if (response.status === 304) return;
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    // Store headers for next check
    lastETag = response.headers.get('ETag');
    lastModified = response.headers.get('Last-Modified');
    
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

  const settings = data.settings || {};
  const currentTransitionType = settings.transitionType || "crossfade";

  // Animate only if slide changed or transition type changed (to preview it)
  // Also animate on first load (currentIndex === -1)
  const shouldAnimate = index !== currentIndex || (lastTransitionType !== null && currentTransitionType !== lastTransitionType);

  lastUpdatedAt = data.updatedAt;
  currentIndex = index;
  lastTransitionType = currentTransitionType;

  const slide = slides[index];

  setState("ready");
  applyTypography(slide, settings);
  swapContent(slide, settings, shouldAnimate);
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

  // New settings
  const textColor = settings.textColor || "#ffffff";
  const textOpacity = (settings.textOpacity ?? 100) / 100;
  const shadowIntensity = settings.shadowIntensity ?? 0; // Default to 0 if undefined, but old default was strong shadow? 
  // Note: Old CSS had a default shadow. If we want to respect user input 0=off, we should default to something reasonable if not set, 
  // but since we added it to default state as 0 (wait, in dock-ui I added it as 0. In CSS it was strong).
  // To preserve backward compat for existing overlays without state update, we might want to check if 'shadowIntensity' is in settings.
  // But 'settings' comes from state. if it's missing (old state), we might want to default to a middle value? 
  // The user asked to "create shadow... 0 off 10 strong".
  // I'll implement it strictly.
  const strokeIntensity = settings.strokeIntensity ?? 0;

  // Load font dynamically if needed
  loadGoogleFont(fontFamily);

  bodyEl.style.fontFamily = fontFamily;
  bodyEl.style.textAlign = textAlign;
  bodyEl.style.lineHeight = lineHeight;
  
  // Apply Color
  // Use hex directly for color, opacity is handled globally on the element
  bodyEl.style.color = textColor;
  // Apply opacity to the entire element to composite all layers (text, shadow, stroke) together
  bodyEl.style.opacity = textOpacity;

  // Apply Shadow
  if (shadowIntensity > 0) {
    // Shadow 0-100
    // Increase blur and spread significantly as requested
    const blur = shadowIntensity * 0.5; // Up to 50px blur
    const offset = shadowIntensity * 0.2; // Up to 20px offset
    
    // Base alpha for shadow is high (black), but the whole element opacity will scale it down
    // We use a solid black shadow (alpha 1.0) to let the element opacity handle the fade
    // However, to keep the shadow distinct from the text if both are opaque, we might want it slightly lighter?
    // No, usually shadow is just black with blur.
    const shadowColor = `rgba(0, 0, 0, 1)`; 
    
    if (shadowIntensity > 40) {
      // Multiple layers for richer shadow at high intensity
      // Using offset and negative offset to simulate "spread"
      bodyEl.style.textShadow = `
        ${offset}px ${offset}px ${blur}px ${shadowColor},
        -${offset/2}px -${offset/2}px ${blur}px ${shadowColor}
      `;
    } else {
      bodyEl.style.textShadow = `${offset}px ${offset}px ${blur}px ${shadowColor}`;
    }
  } else {
    bodyEl.style.textShadow = "none";
  }

  // Apply Stroke
  if (strokeIntensity > 0) {
    // Map 1-10 to much thicker stroke widths
    const width = strokeIntensity * 1.2; 
    // Stroke color is solid black, opacity is handled by the element
    bodyEl.style.webkitTextStroke = `${width}px black`; 
    bodyEl.style.paintOrder = "stroke fill";
  } else {
    bodyEl.style.webkitTextStroke = "0";
    bodyEl.style.paintOrder = "normal";
  }

  document.documentElement.style.setProperty("--font-size-target", fontSizePx);
  
  if (containerEl) {
    // Apply vertical alignment properly
    containerEl.style.justifyContent = verticalAlign;
    containerEl.style.alignItems = textAlign === "left" ? "flex-start" : 
                                    textAlign === "right" ? "flex-end" : "center";
  }
}

function swapContent(slide, settings, shouldAnimate = true) {
  if (!bodyEl) return;
  const markdown = slide.raw ?? slide.body ?? "";
  // If not animating, force 'none'
  const transitionType = shouldAnimate ? (settings?.transitionType || "crossfade") : "none";
  const duration = settings?.transitionDuration || 200;
  
  // Update CSS variable for duration
  document.documentElement.style.setProperty("--transition-duration", `${duration}ms`);
  
  // Remove all transition classes and clean will-change after animation
  const cleanupClasses = () => {
    bodyEl.className = "slide-body";
    // Remove will-change after animation to save resources
    bodyEl.style.willChange = "auto";
  };
  
  cleanupClasses();
  
  if (transitionType === "none") {
    // No animation, instant change
    bodyEl.innerHTML = markdown ? markdownToHtml(markdown) : "<p>(empty slide)</p>";
    return;
  }
  
  if (transitionType === "crossfade") {
    // Crossfade: fade out and fade in simultaneously
    bodyEl.classList.add("transition-out");
    setTimeout(() => {
      bodyEl.innerHTML = markdown ? markdownToHtml(markdown) : "<p>(empty slide)</p>";
      bodyEl.classList.remove("transition-out");
      bodyEl.classList.add("transition-in");
      setTimeout(cleanupClasses, duration);
    }, duration / 2);
  } else if (transitionType === "fade") {
    // Sequential fade: fade out completely, then fade in
    bodyEl.classList.add("transition-out");
    setTimeout(() => {
      bodyEl.innerHTML = markdown ? markdownToHtml(markdown) : "<p>(empty slide)</p>";
      bodyEl.classList.remove("transition-out");
      bodyEl.classList.add("transition-in");
      setTimeout(cleanupClasses, duration);
    }, duration);
  } else {
    // All other transitions (slide, zoom, push)
    bodyEl.classList.add(`transition-${transitionType}-out`);
    setTimeout(() => {
      bodyEl.innerHTML = markdown ? markdownToHtml(markdown) : "<p>(empty slide)</p>";
      bodyEl.classList.remove(`transition-${transitionType}-out`);
      bodyEl.classList.add(`transition-${transitionType}-in`);
      setTimeout(cleanupClasses, duration);
    }, duration);
  }
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
  
  // Use setTimeout instead of requestAnimationFrame to save resources
  setTimeout(() => {
    progressEl.style.transition = `width ${durationMs}ms linear`;
    progressEl.style.width = "100%";
  }, 10);
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

