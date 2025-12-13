# Changelog

## [2.2.0] - 2025-12-13
### Features
- **Backup & Restore**: Added ability to export and import slideshow configurations (JSON).
- **Global Animation Upgrade**: Implemented "Double Buffer" logic for all transitions, enabling simultaneous smooth animations.
- **Safety Modal**: Replaced browser alerts with a custom OBS-themed confirmation modal for "Clear All".

### Improvements
- **Push Animation**: Revamped to a "Screen Push" effect using viewport units (`100vw`/`100vh`) for perfect lockstep motion (no gaps/overlaps). Added "Expo Soft Stop" easing.
- **Slide Animation**: Updated to a "Cover" effect (Parallax).
- **Zoom Animation**: Refined to a cleaner "Static Fade Out / Active Zoom In" style.
- **Crossfade**: Fixed to be a True Crossfade (overlapping).
- **UI**: Simplified transition options (Removed legacy/rough Push variants).

### Removed
- **Legacy Push**: Removed rough percentage-based Push animations from UI and CSS.

## [2.1.0] - 2024-03-20
### Features
- Auto-loop functionality.
- Markdown support enhancements.

## [2.0.0] - 2024-01-15
### Features
- Initial Release.
