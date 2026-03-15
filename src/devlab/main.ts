import "./styles.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Dev lab root element not found.");
}

const isDev = import.meta.env.DEV;
const dockPath = isDev ? "../dock/index.html" : "./Dock.html";
const sourcePath = isDev ? "../source/index.html?debug=1" : "./Source.html?debug=1";

root.innerHTML = `
  <div class="lab-shell">
    <header class="lab-toolbar">
      <div>
        <p class="lab-eyebrow">OBS Text Slideshow</p>
        <h1>Dev Lab</h1>
      </div>
      <div class="lab-actions">
        <button type="button" data-action="reload-dock">Reload dock</button>
        <button type="button" data-action="reload-source">Reload source</button>
        <button type="button" data-action="reload-both">Reload both</button>
        <a href="${dockPath}" target="_blank" rel="noreferrer">Open dock</a>
        <a href="${sourcePath}" target="_blank" rel="noreferrer">Open source</a>
      </div>
    </header>
    <main class="lab-grid" data-orientation="horizontal">
      <section class="lab-panel lab-panel--dock">
        <div class="lab-panel__header">
          <span>Dock</span>
          <code>${dockPath}</code>
        </div>
        <iframe title="Dock preview" data-frame="dock" src="${dockPath}"></iframe>
      </section>
      <div class="lab-splitter" data-role="splitter" role="separator" aria-label="Resize panels" aria-orientation="vertical" tabindex="0">
        <span></span>
      </div>
      <section class="lab-panel lab-panel--source">
        <div class="lab-panel__header">
          <span>Source</span>
          <code>${sourcePath}</code>
        </div>
        <iframe title="Source preview" data-frame="source" src="${sourcePath}"></iframe>
      </section>
    </main>
  </div>
`;

const dockFrame = root.querySelector<HTMLIFrameElement>("[data-frame='dock']");
const sourceFrame = root.querySelector<HTMLIFrameElement>("[data-frame='source']");
const labGrid = root.querySelector<HTMLElement>(".lab-grid");
const splitter = root.querySelector<HTMLElement>("[data-role='splitter']");

function syncOrientation() {
  if (!labGrid || !splitter) {
    return;
  }
  const stacked = window.matchMedia("(max-width: 1100px)").matches;
  labGrid.dataset.orientation = stacked ? "vertical" : "horizontal";
  splitter.setAttribute("aria-orientation", stacked ? "horizontal" : "vertical");
}

function reloadFrame(frame: HTMLIFrameElement | null) {
  if (!frame) {
    return;
  }
  const currentSrc = frame.getAttribute("src") || "";
  const separator = currentSrc.includes("?") ? "&" : "?";
  frame.setAttribute("src", `${currentSrc.split(/[?&]t=/)[0]}${separator}t=${Date.now()}`);
}

root.querySelector("[data-action='reload-dock']")?.addEventListener("click", () => reloadFrame(dockFrame));
root.querySelector("[data-action='reload-source']")?.addEventListener("click", () => reloadFrame(sourceFrame));
root.querySelector("[data-action='reload-both']")?.addEventListener("click", () => {
  reloadFrame(dockFrame);
  reloadFrame(sourceFrame);
});

syncOrientation();
window.addEventListener("resize", syncOrientation);

if (labGrid && splitter) {
  let isDragging = false;

  const updateSplit = (clientX: number, clientY: number) => {
    const rect = labGrid.getBoundingClientRect();
    const orientation = labGrid.dataset.orientation;

    if (orientation === "vertical") {
      const next = ((clientY - rect.top) / rect.height) * 100;
      const clamped = Math.min(Math.max(next, 20), 80);
      labGrid.style.setProperty("--split-primary", `${clamped}%`);
      return;
    }

    const next = ((clientX - rect.left) / rect.width) * 100;
    const clamped = Math.min(Math.max(next, 20), 80);
    labGrid.style.setProperty("--split-primary", `${clamped}%`);
  };

  splitter.addEventListener("pointerdown", (event) => {
    isDragging = true;
    splitter.setPointerCapture(event.pointerId);
    document.body.classList.add("is-resizing");
  });

  splitter.addEventListener("pointermove", (event) => {
    if (!isDragging) {
      return;
    }
    updateSplit(event.clientX, event.clientY);
  });

  const stopDragging = (event?: PointerEvent) => {
    if (!isDragging) {
      return;
    }
    isDragging = false;
    document.body.classList.remove("is-resizing");
    if (event && splitter.hasPointerCapture(event.pointerId)) {
      splitter.releasePointerCapture(event.pointerId);
    }
  };

  splitter.addEventListener("pointerup", stopDragging);
  splitter.addEventListener("pointercancel", stopDragging);

  splitter.addEventListener("keydown", (event) => {
    const orientation = labGrid.dataset.orientation;
    const current = Number.parseFloat(labGrid.style.getPropertyValue("--split-primary") || "50");
    const delta = event.key === "ArrowLeft" || event.key === "ArrowUp" ? -5 : event.key === "ArrowRight" || event.key === "ArrowDown" ? 5 : 0;
    if (!delta) {
      return;
    }
    if (orientation === "horizontal" && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
      return;
    }
    if (orientation === "vertical" && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
      return;
    }
    event.preventDefault();
    const next = Math.min(Math.max(current + delta, 20), 80);
    labGrid.style.setProperty("--split-primary", `${next}%`);
  });
}
