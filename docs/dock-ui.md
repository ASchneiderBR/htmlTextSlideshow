# Dock UI Blueprint (`apps/dock-ui/`)

## Goals

- Live inside an OBS Custom Browser Dock.
- Embrace GitHub’s neutral dark theme (variables pulled from `primer-primitives`) for familiarity.
- Optimize for fast keyboard workflows (power user focus) while remaining approachable.

## Layout

```
┌───────────────────────────────────────────┐
│ Header                                    │
├────────────────┬──────────────────────────┤
│ Sidebar        │ Main stack               │
│ - Typography   │ - Editor + helper text   │
│                │ - Live preview           │
├────────────────┴──────────────────────────┤
│ Status (collapsible)                      │
└───────────────────────────────────────────┘
Footer: reminder that auto-sync is always on
```

### Key Panels

- **Settings Drawer**
  - Font family select (system stack + optional `common/fonts` entries).
  - Font size field (18–120 px).
  - Alignment select (left/center/right).
  - More controls (transitions, timers) can be appended later.

- **Editor + Preview**
  - Shared toolbar with:
    - `Insert delimiter` (drops `\n\n---\n\n` at the cursor).
    - Markdown helper link.
  - Helper text reminds users about the auto-sync delay (~1s).
  - Preview renders Markdown via `common/scripts/markdown.js` and shows a slide counter badge.

- **Footer**
  - No buttons. Simply communicates that the dock saves to localStorage and mirrors the payload over `BroadcastChannel`.

## Interactions

- **Adding Slides**: Typing in the editor does not live-sync content. Users must click "Add Slides" to parse markdown and push to the live deck.
- **Settings Updates**: Changing font/transitions updates the live deck immediately (debounced for inputs).
- Navigation/Reordering updates the preview instantly and schedules an auto-sync run.

## Theming

- Use CSS custom properties:

```css
:root {
  --bg: #0d1117;
  --panel: #161b22;
  --border: #30363d;
  --text: #c9d1d9;
  --accent: #2f81f7;
  --success: #3fb950;
  --danger: #f85149;
  --font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace;
}
```

- Respect OBS docking constraints (min width ≈ 300px) by stacking panels vertically below 960px.

## Auto-Sync Flow

1. Serialize slides using delimiter rules.
2. Merge with `settings` + `playlist` state.
3. Update metadata (`updatedAt`, `lastWriter`) and save everything to `localStorage["obsTextSlides.state"]`.
4. Broadcast the same JSON payload via `BroadcastChannel` so every overlay refreshes.
5. Update the status log (timestamp, reason, slide count). Lua hotkey commands (written to `data/hotkeys.js`) reuse the same flow after the dock applies them.

## Pending Implementation Artifacts

- `apps/dock-ui/index.html`
- `apps/dock-ui/styles.css`
- `apps/dock-ui/main.js`
- Optional `apps/dock-ui/src/` if we decide to modularize JS; for now files sit next to HTML.

