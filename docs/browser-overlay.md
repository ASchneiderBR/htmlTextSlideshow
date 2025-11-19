# Browser Overlay Blueprint (`apps/browser-overlay/`)

## Requirements

- Runs as a transparent OBS Browser Source.
- Automatically resizes typography according to source dimensions (e.g., 800×200).
- Renders markdown safely and supports per-slide font overrides.
- Provides subtle transitions and optional auto-advance indicators.

## DOM Structure

```html
<body>
  <div id="app" data-state="loading">
    <div class="slide-container">
      <div class="slide-body" aria-live="polite"></div>
      <div class="slide-progress"></div>
    </div>
  </div>
</body>
```

## Styling Notes

- Keep background `transparent`.
- Use `vw/vh` plus CSS clamp to maintain responsiveness:

```css
:root {
  --font-scale: 1vw;
}
.slide-body {
  font-size: clamp(18px, var(--font-scale) * 2, 72px);
  line-height: 1.2;
}
```

- Provide CSS custom properties for foreground/background, highlight, emphasis, etc., enabling later customization from JSON.

## Rendering Pipeline

1. Parse query params (e.g., `mode=channel|json`, `statePath`, `pollInterval`, `font`).
2. Default mode uses `BroadcastChannel` (`obs-text-slides`) to receive payloads from the dock instantly.
3. Optional JSON mode (`?mode=json`) polls `slides.state.json` every `pollInterval` milliseconds for legacy flows.
4. Whenever a new payload arrives:
   - Diff `updatedAt` and `activeSlideIndex`.
   - Update `#app` data-state (`ready|empty|error|loading`).
   - Render Markdown through `common/scripts/markdown.js` to stay in sync with the dock preview.
5. Apply transitions:
   - Fade out (200 ms) the current slide.
   - Update the DOM.
   - Fade in (200 ms) the new slide.
6. If `playlist.autoAdvanceMs` or `slide.durationMs` is set, animate the progress bar using CSS transitions.

## Error UI

- When JSON missing: show `Waiting for slides...`.
- When invalid JSON: show `Could not parse slides` with `updatedAt` timestamp from last working state.

## Fonts

- Load default variable font (e.g., `Inter var`) from `common/fonts/`.
- Accept `fontFamily` per slide; if a custom font is requested, inject a `<style>` block with `@font-face` pointing to `common/fonts/<name>.woff2` if available.

## Debug Helpers

- Query param `?debug=1` overlays developer grid and logs to console.
- Query param `?showMeta=1` renders slide index + `metadata.lastWriter` in a corner badge (useful in rehearsals; hide in production).

## Pending Files

- `apps/browser-overlay/index.html`
- `apps/browser-overlay/styles.css`
- `apps/browser-overlay/main.js`

