# Browser Overlay Placeholder

Transparent HTML overlay consumed as an OBS Browser Source. It listens to the dock via `BroadcastChannel`, renders Markdown, applies smooth transitions, and respects per-slide typography overrides. A JSON polling mode is available for legacy setups.

## Files

- `index.html` – Transparent entry document with minimal DOM.
- `styles.css` – Responsive typography + transition tokens.
- `main.js` – BroadcastChannel bridge, optional JSON polling, Markdown renderer, progress bar, debug HUD.

Full behavior is documented in `docs/browser-overlay.md`.

