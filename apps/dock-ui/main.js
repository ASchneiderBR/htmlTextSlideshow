import { markdownToHtml } from "../../common/scripts/markdown.js";

const textarea = document.querySelector("#slidesTextarea");
const preview = document.querySelector("#preview");
const insertDelimiterBtn = document.querySelector("[data-action='insert-delimiter']");
const cheatsheetBtn = document.querySelector("[data-action='open-cheatsheet']");
const addSlidesBtn = document.querySelector("[data-action='add-slides']");
const clearAllBtn = document.querySelector("[data-action='clear-all']");
const statusLogEl = document.querySelector("#statusLog");
const previewCountEl = document.querySelector("[data-preview-count]");

const fontSelect = document.querySelector("#fontFamily");
const fontSizeInput = document.querySelector("#fontSize");
const textAlignSelect = document.querySelector("#textAlign");
const verticalAlignSelect = document.querySelector("#verticalAlign");
const statusPill = document.querySelector("[data-status-pill]");

let draggedSlideIndex = null;

const STATE_STORAGE_KEY = "obsTextSlides.state";
const DELIMITER = "\n\n---\n\n";

const clone = (value) => JSON.parse(JSON.stringify(value));

const DEFAULT_STATE = {
  version: "1.0.0",
  updatedAt: new Date().toISOString(),
  metadata: {
    lastWriter: "dock-ui",
    source: "control-panel",
    notes: "initial",
  },
  settings: {
    defaultFontFamily: "Inter, 'Segoe UI', sans-serif",
    defaultFontSizePx: 42,
    lineHeight: 1.25,
    textAlign: "center",
    verticalAlign: "center",
    markdown: true,
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
});

function loadStateFromStorage() {
  try {
    const raw = localStorage.getItem(STATE_STORAGE_KEY);
    if (!raw) return clone(DEFAULT_STATE);
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.slides) || !parsed.slides.length) {
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

  const html = state.slides
    .map(
      (slide, index) => `
      <article class="preview__slide" draggable="true" data-slide-index="${index}">
        <div class="preview__slide-header">
          <div class="preview__slide-title">
            <span class="preview__slide-drag-handle">⋮⋮</span>
            <span>Slide ${index + 1}</span>
          </div>
          <div class="preview__slide-actions">
            <button type="button" class="preview__slide-delete" data-delete-index="${index}">Delete</button>
          </div>
        </div>
        <div class="preview__slide-content">${markdownToHtml(slide.raw || "")}</div>
      </article>
    `
    )
    .join("");
  
  preview.innerHTML = html;
  
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
  // Delete buttons
  const deleteButtons = document.querySelectorAll(".preview__slide-delete");
  deleteButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const index = parseInt(btn.dataset.deleteIndex, 10);
      deleteSlide(index);
    });
  });

  // Drag and drop
  const slides = document.querySelectorAll(".preview__slide");
  slides.forEach((slide) => {
    slide.addEventListener("dragstart", handleDragStart);
    slide.addEventListener("dragover", handleDragOver);
    slide.addEventListener("drop", handleDrop);
    slide.addEventListener("dragend", handleDragEnd);
    slide.addEventListener("dragenter", handleDragEnter);
    slide.addEventListener("dragleave", handleDragLeave);
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
  persistState(reason);
}

function renderStatus(text, tone = "neutral") {
  if (!statusPill) return;
  statusPill.textContent = text;
  statusPill.className = `pill pill--${tone}`;
}

function appendStatusLog(message) {
  if (!statusLogEl) return;
  const entry = document.createElement("li");
  entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
  statusLogEl.prepend(entry);
}


function setActiveSlide(index, reason = "manual") {
  if (!state.slides.length) return;
  const clamped = Math.max(0, Math.min(index, state.slides.length - 1));
  if (clamped === state.activeSlideIndex) return;
  state.activeSlideIndex = clamped;
  persistState(reason);
}

function pollLuaCommands() {
  const script = document.createElement("script");
  script.src = `../../data/hotkeys.js?t=${Date.now()}`;
  script.onload = () => {
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
    script.remove();
  };
  script.onerror = () => script.remove();
  document.body.appendChild(script);
}

function init() {
  insertDelimiterBtn?.addEventListener("click", insertDelimiter);
  addSlidesBtn?.addEventListener("click", addSlides);
  clearAllBtn?.addEventListener("click", clearAllSlides);
  cheatsheetBtn?.addEventListener("click", () =>
    window.open("https://www.markdownguide.org/cheat-sheet/", "_blank", "noopener")
  );
  fontSelect?.addEventListener("change", () => updateSettings("font family"));
  fontSizeInput?.addEventListener("input", () => updateSettings("font size"));
  textAlignSelect?.addEventListener("change", () => updateSettings("horizontal alignment"));
  verticalAlignSelect?.addEventListener("change", () => updateSettings("vertical alignment"));

  applyStateToUi();
  renderStatus("Ready", "success");
  appendStatusLog("Dock ready. Add slides using the editor.");
  channel.postMessage({ type: "state", source: "dock-ui", payload: state });
  setInterval(pollLuaCommands, 500);
}

init();

