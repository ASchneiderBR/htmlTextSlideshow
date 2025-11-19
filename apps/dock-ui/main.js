import { markdownToHtml } from "../../common/scripts/markdown.js";

const textarea = document.querySelector("#slidesTextarea");
const preview = document.querySelector("#preview");
const insertDelimiterBtn = document.querySelector("[data-action='insert-delimiter']");
const addSlidesBtn = document.querySelector("[data-action='add-slides']");
const clearAllBtn = document.querySelector("[data-action='clear-all']");
const statusLogEl = document.querySelector("#statusLog");
const previewCountEl = document.querySelector("[data-preview-count]");

const fontSelect = document.querySelector("#fontFamily");
const fontSizeInput = document.querySelector("#fontSize");
const textAlignSelect = document.querySelector("#textAlign");
const verticalAlignSelect = document.querySelector("#verticalAlign");
const transitionTypeSelect = document.querySelector("#transitionType");
const transitionDurationInput = document.querySelector("#transitionDuration");
const statusPill = document.querySelector("[data-status-pill]");

let draggedSlideIndex = null;

const STATE_STORAGE_KEY = "obsTextSlides.state";
const DELIMITER = "\n\n---\n\n";

const clone = (value) => JSON.parse(JSON.stringify(value));

// Função debounce para otimizar atualizações frequentes
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Função throttle para limitar execuções
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Cache para renderização de markdown
const markdownCache = new Map();
const MAX_CACHE_SIZE = 100;

function cachedMarkdownToHtml(markdown) {
  if (markdownCache.has(markdown)) {
    return markdownCache.get(markdown);
  }
  
  const html = markdownToHtml(markdown);
  
  // Limitar tamanho do cache
  if (markdownCache.size >= MAX_CACHE_SIZE) {
    const firstKey = markdownCache.keys().next().value;
    markdownCache.delete(firstKey);
  }
  
  markdownCache.set(markdown, html);
  return html;
}

const DEFAULT_STATE = {
  version: "1.0.0",
  updatedAt: new Date().toISOString(),
  metadata: {
    lastWriter: "dock-ui",
    source: "control-panel",
    notes: "initial",
  },
  settings: {
    defaultFontFamily: "'Montserrat', sans-serif",
    defaultFontSizePx: 42,
    lineHeight: 1.25,
    textAlign: "center",
    verticalAlign: "center",
    markdown: true,
    transitionType: "crossfade",
    transitionDuration: 200,
  },
  slides: [
    {
      id: "slide-001",
      title: "Welcome",
      body: "### Hello!\nUse `---` on a blank line to create the next slide.",
      raw: "Welcome\n\n### Hello!\nUse `---` on a blank line to create the next slide.",
      fontFamily: null,
      fontSizePx: null,
      textAlign: null,
      notes: "",
      durationMs: 0,
    },
    {
      id: "slide-002",
      title: "Demo",
      body: "- Edit everything inside the dock\n- Auto-sync pushes changes every second",
      raw: "Demo\n\n- Edit everything inside the dock\n- Auto-sync pushes changes every second",
      fontFamily: null,
      fontSizePx: null,
      textAlign: null,
      notes: "",
      durationMs: 0,
    },
  ],
  activeSlideIndex: 0,
  playlist: {
    mode: "manual",
    loop: true,
    autoAdvanceMs: 0,
  },
};

let state = loadStateFromStorage();
let luaSeq = 0;

const channel = new BroadcastChannel("obs-text-slides");
channel.addEventListener("message", (event) => {
  const payload = event?.data;
  if (!payload || typeof payload !== "object") return;
  if (payload.type === "request-state") {
    channel.postMessage({ type: "state", source: "dock-ui", payload: state });
    appendStatusLog("Shared current state with overlay.");
  }
}, { passive: true });

function loadStateFromStorage() {
  try {
    const raw = localStorage.getItem(STATE_STORAGE_KEY);
    if (!raw) return clone(DEFAULT_STATE);
    const parsed = JSON.parse(raw);
    // If slides is not an array, use default. But if it's empty array, keep it empty (user cleared)
    if (!Array.isArray(parsed.slides)) {
      return clone(DEFAULT_STATE);
    }
    return {
      ...clone(DEFAULT_STATE),
      ...parsed,
      settings: { ...DEFAULT_STATE.settings, ...(parsed.settings || {}) },
    };
  } catch {
    return clone(DEFAULT_STATE);
  }
}

function persistState(reason = "auto") {
  state.updatedAt = new Date().toISOString();
  state.metadata = {
    lastWriter: "dock-ui",
    source: "control-panel",
    notes: reason,
  };
  localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(state));
  channel.postMessage({ type: "state", source: "dock-ui", payload: state });
  renderStatus("Auto-sync ready", "success");
  appendStatusLog(`Saved ${state.slides.length} slides (${reason}).`);
}

function applyStateToUi() {
  if (fontSelect) fontSelect.value = state.settings.defaultFontFamily;
  if (fontSizeInput) fontSizeInput.value = String(state.settings.defaultFontSizePx);
  if (textAlignSelect) textAlignSelect.value = state.settings.textAlign;
  if (verticalAlignSelect) verticalAlignSelect.value = state.settings.verticalAlign;
  if (transitionTypeSelect) transitionTypeSelect.value = state.settings.transitionType || "crossfade";
  if (transitionDurationInput) transitionDurationInput.value = String(state.settings.transitionDuration || 200);
  renderPreview();
  updateClearAllButton();
}

function renderPreview() {
  if (!preview) return;
  
  if (!state.slides || state.slides.length === 0) {
    preview.innerHTML = '<p class="preview__empty">No slides yet. Add content using the editor above.</p>';
    if (previewCountEl) {
      previewCountEl.textContent = "0 slides";
    }
    return;
  }

  // Usar DocumentFragment para melhor performance
  const fragment = document.createDocumentFragment();
  const tempDiv = document.createElement('div');
  
  const html = state.slides
    .map(
      (slide, index) => `
      <article class="preview__slide ${index === state.activeSlideIndex ? 'preview__slide--active' : ''}" draggable="true" data-slide-index="${index}">
        <div class="preview__slide-header">
          <div class="preview__slide-title">
            <span class="preview__slide-drag-handle">⋮⋮</span>
            <span>Slide ${index + 1}</span>
          </div>
          <div class="preview__slide-actions">
            <button type="button" class="preview__slide-play" data-play-index="${index}" title="Show this slide">▶</button>
            <button type="button" class="preview__slide-delete" data-delete-index="${index}" title="Delete this slide">Delete</button>
          </div>
        </div>
        <div class="preview__slide-content">${cachedMarkdownToHtml(slide.raw || "")}</div>
      </article>
    `
    )
    .join("");
  
  tempDiv.innerHTML = html;
  while (tempDiv.firstChild) {
    fragment.appendChild(tempDiv.firstChild);
  }
  
  preview.innerHTML = '';
  preview.appendChild(fragment);
  
  if (previewCountEl) {
    previewCountEl.textContent = `${state.slides.length} ${
      state.slides.length === 1 ? "slide" : "slides"
    }`;
  }

  attachSlideEventListeners();
}

function parseSlides(value) {
  return (value ? value.split(/\n\s*---\s*\n/g) : [])
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk, index) => ({
      id: `slide-${index + 1}`.padStart(10, "0"),
      title: chunk.split("\n")[0] || `Slide ${index + 1}`,
      body: chunk,
      raw: chunk,
      fontFamily: null,
      fontSizePx: null,
      textAlign: null,
      notes: "",
      durationMs: 0,
    }));
}

function addSlides() {
  if (!textarea || !textarea.value.trim()) return;
  
  const newSlides = parseSlides(textarea.value);
  if (!newSlides.length) return;
  
  // Add new slides to existing ones
  state.slides.push(...newSlides);
  
  // Clear textarea
  textarea.value = "";
  
  // Update UI and persist
  renderPreview();
  updateClearAllButton();
  persistState("add-slides");
  appendStatusLog(`Added ${newSlides.length} slide${newSlides.length > 1 ? 's' : ''}.`);
}

function deleteSlide(index) {
  if (index < 0 || index >= state.slides.length) return;
  
  state.slides.splice(index, 1);
  
  // Adjust active slide index if needed
  if (state.activeSlideIndex >= state.slides.length) {
    state.activeSlideIndex = Math.max(0, state.slides.length - 1);
  }
  
  renderPreview();
  updateClearAllButton();
  persistState("delete-slide");
  appendStatusLog(`Deleted slide ${index + 1}.`);
}

function clearAllSlides() {
  if (!state.slides.length) return;
  
  const count = state.slides.length;
  state.slides = [];
  state.activeSlideIndex = 0;
  
  renderPreview();
  updateClearAllButton();
  persistState("clear-all");
  appendStatusLog(`Cleared all ${count} slides.`);
}

function updateClearAllButton() {
  if (!clearAllBtn) return;
  clearAllBtn.disabled = !state.slides || state.slides.length === 0;
}

function insertDelimiter() {
  if (!textarea) return;
  const { selectionStart, selectionEnd, value } = textarea;
  textarea.value = `${value.slice(0, selectionStart)}${DELIMITER}${value.slice(selectionEnd)}`;
  textarea.focus();
  textarea.selectionStart = textarea.selectionEnd = selectionStart + DELIMITER.length;
}

function attachSlideEventListeners() {
  // Play buttons
  const playButtons = document.querySelectorAll(".preview__slide-play");
  playButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const index = parseInt(btn.dataset.playIndex, 10);
      setActiveSlide(index, "manual-play");
    }, { passive: false });
  });

  // Delete buttons
  const deleteButtons = document.querySelectorAll(".preview__slide-delete");
  deleteButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const index = parseInt(btn.dataset.deleteIndex, 10);
      deleteSlide(index);
    }, { passive: false });
  });

  // Drag and drop - não pode ser passive pois usa preventDefault
  const slides = document.querySelectorAll(".preview__slide");
  slides.forEach((slide) => {
    slide.addEventListener("dragstart", handleDragStart, { passive: true });
    slide.addEventListener("dragover", handleDragOver, { passive: false }); // Precisa preventDefault
    slide.addEventListener("drop", handleDrop, { passive: false }); // Precisa preventDefault
    slide.addEventListener("dragend", handleDragEnd, { passive: true });
    slide.addEventListener("dragenter", handleDragEnter, { passive: true });
    slide.addEventListener("dragleave", handleDragLeave, { passive: true });
  });
}

function handleDragStart(e) {
  draggedSlideIndex = parseInt(e.currentTarget.dataset.slideIndex, 10);
  e.currentTarget.classList.add("dragging");
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/html", e.currentTarget.innerHTML);
}

function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  e.dataTransfer.dropEffect = "move";
  return false;
}

function handleDragEnter(e) {
  e.currentTarget.classList.add("drag-over");
}

function handleDragLeave(e) {
  e.currentTarget.classList.remove("drag-over");
}

function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }
  e.preventDefault();

  const dropIndex = parseInt(e.currentTarget.dataset.slideIndex, 10);
  
  if (draggedSlideIndex !== null && draggedSlideIndex !== dropIndex) {
    // Reorder slides
    const draggedSlide = state.slides[draggedSlideIndex];
    state.slides.splice(draggedSlideIndex, 1);
    state.slides.splice(dropIndex, 0, draggedSlide);
    
    // Update active slide index if needed
    if (state.activeSlideIndex === draggedSlideIndex) {
      state.activeSlideIndex = dropIndex;
    } else if (draggedSlideIndex < state.activeSlideIndex && dropIndex >= state.activeSlideIndex) {
      state.activeSlideIndex--;
    } else if (draggedSlideIndex > state.activeSlideIndex && dropIndex <= state.activeSlideIndex) {
      state.activeSlideIndex++;
    }
    
    renderPreview();
    persistState("reorder-slides");
    appendStatusLog(`Moved slide ${draggedSlideIndex + 1} to position ${dropIndex + 1}.`);
  }

  return false;
}

function handleDragEnd(e) {
  e.currentTarget.classList.remove("dragging");
  document.querySelectorAll(".preview__slide").forEach((slide) => {
    slide.classList.remove("drag-over");
  });
  draggedSlideIndex = null;
}

function updateSettings(reason = "settings") {
  state.settings.defaultFontFamily = fontSelect?.value || state.settings.defaultFontFamily;
  state.settings.defaultFontSizePx = Number(fontSizeInput?.value) || state.settings.defaultFontSizePx;
  state.settings.textAlign = textAlignSelect?.value || state.settings.textAlign;
  state.settings.verticalAlign = verticalAlignSelect?.value || state.settings.verticalAlign;
  state.settings.transitionType = transitionTypeSelect?.value || state.settings.transitionType;
  state.settings.transitionDuration = Number(transitionDurationInput?.value) || state.settings.transitionDuration;
  persistState(reason);
}

// Versões com debounce para inputs que atualizam frequentemente
const debouncedUpdateSettings = debounce(updateSettings, 300);

function renderStatus(text, tone = "neutral") {
  if (!statusPill) return;
  statusPill.textContent = text;
  statusPill.className = `pill pill--${tone}`;
}

const MAX_LOG_ENTRIES = 50; // Limitar histórico de logs

function appendStatusLog(message) {
  if (!statusLogEl) return;
  const entry = document.createElement("li");
  entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
  statusLogEl.prepend(entry);
  
  // Remover entradas antigas para economizar memória
  while (statusLogEl.children.length > MAX_LOG_ENTRIES) {
    statusLogEl.removeChild(statusLogEl.lastChild);
  }
}


function setActiveSlide(index, reason = "manual") {
  if (!state.slides.length) return;
  const clamped = Math.max(0, Math.min(index, state.slides.length - 1));
  if (clamped === state.activeSlideIndex) return;
  state.activeSlideIndex = clamped;
  renderPreview();
  persistState(reason);
}

let pendingScript = null;

function pollLuaCommands() {
  // Evitar criar múltiplos scripts pendentes
  if (pendingScript) return;
  
  pendingScript = document.createElement("script");
  pendingScript.src = `../../data/hotkeys.js?t=${Date.now()}`;
  pendingScript.onload = () => {
    const payload = window.__obsTextSlidesHotkey;
    if (payload && typeof payload.seq === "number" && payload.seq > luaSeq) {
      luaSeq = payload.seq;
      if (payload.command === "next") {
        setActiveSlide(state.activeSlideIndex + 1, "lua-next");
      } else if (payload.command === "prev") {
        setActiveSlide(state.activeSlideIndex - 1, "lua-prev");
      } else if (typeof payload.command === "number") {
        setActiveSlide(payload.command, "lua-jump");
      }
    }
    if (pendingScript) {
      pendingScript.remove();
      pendingScript = null;
    }
  };
  pendingScript.onerror = () => {
    if (pendingScript) {
      pendingScript.remove();
      pendingScript = null;
    }
  };
  document.body.appendChild(pendingScript);
}

function init() {
  insertDelimiterBtn?.addEventListener("click", insertDelimiter);
  addSlidesBtn?.addEventListener("click", addSlides);
  clearAllBtn?.addEventListener("click", clearAllSlides);
  fontSelect?.addEventListener("change", () => updateSettings("font family"));
  fontSizeInput?.addEventListener("input", () => debouncedUpdateSettings("font size"));
  textAlignSelect?.addEventListener("change", () => updateSettings("horizontal alignment"));
  verticalAlignSelect?.addEventListener("change", () => updateSettings("vertical alignment"));
  transitionTypeSelect?.addEventListener("change", () => updateSettings("transition type"));
  transitionDurationInput?.addEventListener("input", () => debouncedUpdateSettings("transition duration"));

  applyStateToUi();
  renderStatus("Ready", "success");
  appendStatusLog("Dock ready. Add slides using the editor.");
  channel.postMessage({ type: "state", source: "dock-ui", payload: state });
  setInterval(pollLuaCommands, 1000); // Aumentado de 500ms para 1000ms
}

init();

