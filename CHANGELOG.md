# Changelog

## [3.0.0] - 2026-03-14

### Added
- Modern frontend architecture with Vite, React, and TypeScript.
- New dock UI with tokenized dark/light themes and a more fluid presentation workflow.
- Typed overlay runtime with modular source code and OBS-ready static build output in `dist/`.
- Build finalization and release packaging scripts for generating OBS-compatible assets.
- Dev Lab split-screen page for dock/source testing with draggable resize support.
- Built-in sample slideshow with 10 Markdown test slides covering headings, lists, quotes, links, tables, code blocks, and alignment cases.
- Automatic release publishing for pushes to `main`, including generated ZIP artifacts.
- Sortable playlist powered by `dnd-kit`, including drag handle and smoother drag/drop interactions.

### Changed
- OBS now consumes `dist/Dock.html` and `dist/Source.html` instead of root HTML files.
- Dock and source logic moved from giant inline documents into shared TypeScript modules.
- Release packaging now ships `Dock.html`, `Source.html`, `text-slides.lua`, and `README.md` at the root of the ZIP.
- Dock controls were simplified and compacted, including smaller transport buttons, a single-icon theme toggle, and a reduced status/log bar.
- Playlist cards now prioritize slide number and rendered content, with slide actions moved below the preview.
- Sidebar spacing and responsive behavior were refined to work better in single-column layouts.
- Dock layout now uses separated parent containers for Typography, Playback, Author, Playlist, and Synced.
- Typography/Playback controls were reorganized into paired rows (size+alignment, color+opacity, shadow+stroke) with transition controls moved to Playback.

### Fixed
- Hotkey bridge now initializes in `dist/hotkeys.js`, matching the dock runtime path.
- Dist output is normalized for local file loading in OBS.
- Build output now restores standalone `dist/Dock.html`, `dist/Source.html`, and `dist/DevLab.html` files without external JS or CSS assets.
- Development startup is easier through explicit `dev:lab` scripts and VS Code tasks.
- Source alignment now follows the Browser Source viewport more reliably while keeping the overlay fully transparent.
- Development hotkey polling no longer spams missing `hotkeys.js` requests in Dev Lab.
- Dock dropdowns, log drawer layout, and compact control sizing were cleaned up for dark/light theme consistency.
- Drag interactions no longer trigger unwanted horizontal scrollbar overflow in the playlist area.

### Removed
- Legacy root-level HTML runtime from the active distribution path.

---

## [2.3.1] - 2025-12-13

### Fixed
- Dock responsive layout: up to 3 columns, consistent spacing between columns, improved slides preview responsiveness, and better dropdown chevron spacing.

---

## [2.3.0] - 2025-12-13

### Added
- Autoplay system: dedicated Autoplay panel with configurable interval, stop/start toggle, and loop integration.
- Loading animations: Play buttons display a spinner while a slide transition is active.
- Queue system: animation queue to handle multiple rapid clicks smoothly without glitches.
- Progress bar control: option to show/hide the progress bar during transitions/autoplay.

### Fixed
- New slide bug: newly added slides wouldn't animate due to duplicate IDs.
- Layout shifts: play button resizing when spinner is active.
- UI: aligned Autoplay panel styling with other setting sections.

---

## [2.2.0] - 2025-12-13

### Added
- Backup & Restore: export/import slideshow configurations (JSON).
- Global animation upgrade: "Double Buffer" logic for all transitions.
- Safety modal: replaced browser alerts with a custom confirmation modal for "Clear All".

### Changed
- Push animation: revamped to a "Screen Push" effect using viewport units (`100vw`/`100vh`) for perfect lockstep motion (no gaps/overlaps); added "Expo Soft Stop" easing.
- Slide animation: updated to a "Cover" effect (parallax).
- Zoom animation: refined to a cleaner "Static Fade Out / Active Zoom In" style.
- Crossfade: fixed to be a true crossfade (overlapping).
- UI: simplified transition options (removed legacy/rough Push variants).

### Removed
- Legacy Push: removed rough percentage-based Push animations from UI and CSS.

---

## [2.1.0] - 2024-03-20

### Added
- Auto-loop functionality.
- Markdown support enhancements.

---

## [2.0.0] - 2024-01-15

### Added
- Initial release.

---
