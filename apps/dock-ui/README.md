# Dock UI Placeholder

This directory hosts the OBS dock interface used to edit, preview, and auto-sync Markdown slides via localStorage + `BroadcastChannel`.

## Files

- `index.html` – Entry point loaded by OBS as a custom dock.
- `styles.css` – GitHub-inspired styling tokens.
- `main.js` – Delimiters, markdown preview, typography controls, BroadcastChannel bridge, and Lua hotkey polling.

## Implementation Notes

- Everything ships without bundlers; the ES modules import helpers directly from `common/scripts`.
- No file-system prompts: slides live in OBS’s localStorage and mirror to every overlay over the `obs-text-slides` channel.
- Panels collapse below 960 px so the dock fits even in narrow OBS layouts.

Refer to `docs/dock-ui.md` for the full UX blueprint.

