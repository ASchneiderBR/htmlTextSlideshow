# Changelog

## [2.0.0] - 2024-11-20

### 🎉 Major Release - Complete Architecture Overhaul

#### Breaking Changes
- **Simplified file structure**: From 15+ files to just 3 core files
- **No more external dependencies**: All CSS and JavaScript bundled inline
- **ES5 compatibility**: Removed ES6 modules for maximum OBS CEF compatibility

#### Added
- **Advanced Typography**:
  - Shadow intensity control (0-100) with dramatic blur effects
  - Stroke (outline) intensity control (0-10) for text outlines
  - Unified color picker with opacity control
  - Opacity applies to entire layer (text + shadow + stroke) for consistent look
- **Improved Installation**:
  - Script properties display exact file paths with `file:///` prefix
  - Easy copy/paste URLs for Dock and Source
  - No manual path editing required
- **Better Performance**:
  - Debounced inputs (300ms) to reduce excessive updates
  - Markdown rendering cache (100 entries)
  - GPU-accelerated animations with `translateZ(0)`
  - Lazy-loaded Google Fonts
  - Memory-limited status log (50 entries max)
- **Smart Transitions**:
  - Transitions only animate when changing slides or previewing
  - No animation when editing formatting (instant updates)

#### Changed
- **File Structure**:
  - `apps/dock-ui/` → `Dock.html` (standalone)
  - `apps/browser-overlay/` → `Source.html` (standalone)
  - `lua/obs-text-slides.lua` → `text-slides.lua` (root)
  - `data/hotkeys.js` → `hotkeys.js` (root, auto-generated)
  - `data/slides.state.json` → `slides.json` (root, auto-generated)
- **Code Style**:
  - Converted all JavaScript to ES5 (no `const`/`let`, no arrow functions, no modules)
  - Removed `type="module"` from all scripts
  - All CSS inlined in `<style>` tags
  - All JS inlined in `<script>` tags
- **Communication**:
  - BroadcastChannel is now the primary sync method
  - JSON polling is fallback-only (not actively written by Dock)
  - Hotkey polling interval increased to 1000ms (from 500ms)

#### Fixed
- **OBS Compatibility**:
  - Removed ES6 module dependencies that caused silent failures
  - Fixed localStorage corruption handling
  - Added graceful fallback for unsupported BroadcastChannel
- **Visual Consistency**:
  - Shadow and stroke now respect global opacity setting
  - Text wrapping respects canvas boundaries
  - Font size no longer capped at arbitrary limits

#### Removed
- `apps/` directory structure
- `common/scripts/` directory
- `docs/` directory (to be recreated if needed)
- `CONTRIBUTING.md` (to be recreated if needed)
- All external CSS/JS references

---

## [1.0.0] - Initial Release

- Basic slideshow functionality
- Markdown support
- Font and alignment controls
- Transition animations
- OBS hotkey integration
- BroadcastChannel sync

