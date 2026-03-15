---
description: Project standards, architecture, and privacy rules for OBS Text Slideshow
globs:
  - "**/*"
alwaysApply: true
---
# OBS Text Slideshow - Project Rules (v3.0)

## Project Overview

Version 3.0 uses a modern source architecture with static output for OBS:

1. `src/dock/` contains the React + TypeScript dock.
2. `src/source/` contains the lightweight TypeScript overlay runtime.
3. `src/shared/` contains shared state, markdown, transport, and font helpers.
4. `dist/` contains the built OBS runtime (`Dock.html`, `Source.html`, assets, `hotkeys.js`, `slides.json`).
5. `text-slides.lua` handles OBS hotkeys and setup paths.

Distribution ships the root Lua script plus a `dist/` folder with the built runtime.

## Tech Stack

- Frontend dock: React + TypeScript
- Overlay runtime: TypeScript without a heavy framework
- Build tooling: Vite
- OBS integration: Lua (`obslua`)
- Runtime contract: OBS consumes static local files from `dist/`

## Architecture & Data Flow

### Slide State

- Source of truth lives in the dock runtime.
- Primary persistence is localStorage.
- Fallbacks are storage polling and optional JSON polling.
- Slide content is user data and should be treated as such.

### Communication

- Primary: BroadcastChannel
- Secondary: localStorage polling
- Tertiary: JSON polling via `dist/slides.json`

### Hotkeys

- `text-slides.lua` writes commands into `dist/hotkeys.js`.
- The dock polls that file and updates slideshow state.
- The source reacts to dock state updates through the transport chain.

## Coding Rules

- Edit source files under `src/`, not generated files under `dist/`.
- Keep shared state contracts aligned between dock and source.
- Keep the overlay runtime lightweight and deterministic.
- Prefer shared utilities under `src/shared/` over duplicated logic.
- Lua should remain compatible with OBS Lua runtime conventions.

## Critical Files

- `dist/hotkeys.js`: generated bridge file, do not edit manually.
- `dist/slides.json`: fallback transport file, treat as runtime data.
- `dist/Dock.html` and `dist/Source.html`: generated runtime assets, do not edit manually.
- `src/dock/App.tsx`: primary dock feature entry point.
- `src/source/main.ts`: primary overlay runtime entry point.

## Common Tasks

- Add transitions: update `src/source/styles.css` and `src/source/main.ts`.
- Add hotkeys: update `text-slides.lua` and the dock hotkey polling logic in `src/dock/App.tsx`.
- Change typography controls: update dock settings UI in `src/dock/App.tsx` and source application logic in `src/source/main.ts`.

## Debugging

- Hotkeys failing: verify `dist/hotkeys.js` is updating and the built dock is the one loaded in OBS.
- Sync failing: check BroadcastChannel support first, then storage fallback behavior.
- Source not displaying: verify OBS points to `dist/Source.html` and that `npm run build` has been executed.

## Performance Guidance

- Keep the source runtime smaller and simpler than the dock.
- Avoid heavy overlay-only dependencies.
- Build before validating OBS behavior, since `dist/` is the runtime contract.

## Release Process

- Update `CHANGELOG.md` first.
- Run the release workflow or `npm run build` plus `npm run package:release`.
- The ZIP should contain `dist/`, `text-slides.lua`, `README.md`, and `LICENSE`.
