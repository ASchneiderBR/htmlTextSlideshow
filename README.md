# OBS HTML Text Slideshow

Modern text slideshow tooling for OBS Studio with a React dock, a typed overlay runtime, markdown support, theme-aware editing, and static build output ready for local-file Browser Sources.

## Version 3.0

Version 3.0 modernizes the project architecture without changing its core OBS workflow:

- React + TypeScript dock
- TypeScript overlay runtime
- Shared state, transport, and markdown utilities
- Static OBS-ready assets generated under `dist/`
- Lua still handles OBS hotkeys and installation paths

The runtime files OBS uses are now built artifacts, not handwritten root HTML files.
The final `dist` output is generated as standalone HTML files again for easier OBS compatibility.

## Quick Start

### Using a release ZIP

1. Download the latest release from GitHub Releases.
2. Extract the ZIP to a local folder.
3. Load `text-slides.lua` in OBS through `Tools > Scripts`.
4. Open the script Properties panel and copy the generated paths.
5. Add a custom dock using the `Dock URL` value.
6. Add a Browser Source pointing to `dist/Source.html`.

### Using this repository directly

1. Install dependencies:

```bash
npm install
```

2. Start the split-screen dev environment:

```bash
npm run dev:lab
```

3. Build the OBS runtime:

```bash
npm run build
```

4. Load `text-slides.lua` in OBS.
5. Use the generated paths to `dist/Dock.html` and `dist/Source.html`.

If the VS Code NPM Scripts panel does not list the scripts, run `Terminal > Run Task` and use `Dev Lab` or `Build OBS Files`.

## Repository Structure

- `src/dock/` — React dock application
- `src/source/` — lightweight overlay runtime
- `src/shared/` — shared state, transport, markdown, and font helpers
- `dist/` — generated OBS-ready runtime output
- `text-slides.lua` — OBS bridge and hotkey registration
- `scripts/` — build finalization and release packaging helpers

## Features

### Dock

- Markdown slide authoring with delimiter-based parsing
- Drag-and-drop playlist reordering
- Active slide selection and playback control
- Backup and restore with JSON files
- Autoplay and loop controls
- Theme-aware interface with dark and light modes
- Transport and storage status feedback

### Source

- Lightweight overlay runtime for OBS Browser Source
- Crossfade, fade, directional slide, zoom, and instant transitions
- BroadcastChannel sync with storage and JSON fallback modes
- Progress bar support for autoplay or timed slides
- On-demand font loading

### OBS Integration

- Global hotkeys via Lua (`Next`, `Previous`, `First`)
- Generated hotkey bridge at `dist/hotkeys.js`
- Installation paths shown directly in the OBS script properties panel

## Development Workflow

### Build

```bash
npm run build
```

This produces:

- `dist/DevLab.html`
- `dist/Dock.html`
- `dist/Source.html`
- `dist/hotkeys.js`
- `dist/slides.json`

The HTML files are self-contained so OBS does not need companion JS or CSS asset files beside them.

### Dev Lab

For testing and debugging during development:

- run `npm run dev:lab` to open the split-screen page automatically
- or open `src/devlab/index.html` while Vite dev is running
- or open `dist/DevLab.html` after `npm run build`

This page renders the dock and source side by side in a split-screen layout and includes quick reload buttons for both frames.

### Release packaging

```bash
npm run build
npm run package:release
```

This creates `release-package/` containing:

- `dist/`
- `text-slides.lua`
- `README.md`
- `LICENSE`

## Browser Compatibility

- OBS Studio 28+
- Modern Chromium-based browsers for local testing

## License

This project is licensed under GPL v2.0 or later. See `LICENSE` for details.
