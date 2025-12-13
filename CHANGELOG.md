# Changelog

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
