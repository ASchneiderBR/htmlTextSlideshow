# Architecture Overview

## High-Level Flow

1. **Dock UI (`apps/dock-ui/`)**
   - Power-user editor that accepts large bodies of text inside a single textarea.
   - Uses a delimiter helper (`---` on a blank line) to split the textarea into slide chunks.
   - Renders live previews (GitHub-flavored markdown) and tracks metadata (font, alignment, automation flags).
   - Persists slides + presets via `localStorage` and replays the JSON payload through `BroadcastChannel` (`obs-text-slides`) so every browser source stays in sync.

2. **Browser Overlay (`apps/browser-overlay/`)**
   - Listens to the dock via `BroadcastChannel` for near-real-time updates.
   - Can optionally poll `data/slides.state.json` on an adjustable interval (default 1000 ms) when running outside OBS.
   - Keeps background transparent and auto-fits typography to source dimensions using CSS clamp variables.

3. **Lua Script (`lua/obs-text-slides.lua`)**
   - Registers hotkeys for `Next` and `Previous`.
   - Mirrors Animated Lower Thirds by overwriting `data/hotkeys.js`; the dock polls that file (simply by appending a `<script>` tag with a cache-buster) and applies the commands to the active slide.

4. **Shared Assets (`common/`)**
   - Fonts, SVG icons, and utilities such as `common/scripts/markdown.js`, shared between dock and overlay.

## File System Layout

```
obs-htmlTextSlideshow/
├── apps/
│   ├── dock-ui/
│   └── browser-overlay/
├── common/
├── data/
│   └── slides.state.json
├── docs/
├── lua/
└── README.md
```

## Data Synchronization

- LocalStorage is the canonical source. Every edit updates it and emits the same JSON payload through `BroadcastChannel`. JSON exports/imports use the same schema for portability.
- Lua-based hotkeys rely on the `data/hotkeys.js` bridge (identical to Animated Lower Thirds). Only the Lua script writes to the filesystem; the dock simply reads the generated JS file.
- To prevent race conditions:
  - Each payload carries `updatedAt` and `metadata.lastWriter`.
  - Overlay only reads; it never writes.

## Next Implementation Steps

- Add richer entrance/exit animations and timers while keeping the browser source lightweight.
- Explore richer communication for Lua (e.g., metadata hints) without depending on polling.
- Ship preset export/import flows so multiple OBS instances can share slide packets.

