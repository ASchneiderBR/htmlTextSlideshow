# Data Contract

The dock persists slides under `localStorage["obsTextSlides.state"]` and replays the same payload over the `obs-text-slides` BroadcastChannel. The JSON shape below is the canonical format for exports, backups, and channel messages.

## Slide Delimiter

- Dock UI expects slide bodies pasted into a single textarea separated by a blank line containing exactly three hyphens: `---`.
- Example:

```
Slide title
Slide body paragraph

---

Another title
More content
```

- The parser trims whitespace around each slide chunk but preserves intentional blank lines within a slide.

## JSON Shape

```json
{
  "version": "1.0.0",
  "updatedAt": "2025-11-19T15:36:00.000Z",
  "metadata": {
    "lastWriter": "dock-ui",
    "source": "apps/dock-ui",
    "notes": "Optional free-form string for debugging"
  },
  "settings": {
    "defaultFontFamily": "Inter, 'Segoe UI', sans-serif",
    "defaultFontSizePx": 32,
    "lineHeight": 1.25,
    "textAlign": "center",
    "markdown": true,
    "transition": "fade",
    "pollIntervalMs": 1000
  },
  "slides": [
    {
      "id": "slide-001",
      "title": "Welcome",
      "body": "## Hello stream\nLet's kick things off.",
      "raw": "Welcome\n\n## Hello stream\nLet's kick things off.",
      "fontFamily": "inherit",
      "fontSizePx": null,
      "textAlign": "inherit",
      "notes": "Optional operator notes",
      "durationMs": 0
    }
  ],
  "activeSlideIndex": 0,
  "playlist": {
    "mode": "manual",
    "loop": true,
    "autoAdvanceMs": 0
  }
}
```

### Field Notes

- `version` increments when we change schema. Writers must refuse to downgrade.
- `raw` preserves the untouched textarea chunk, while `body` stores sanitized markdown for preview/overlay to consume directly.
- `fontFamily`/`fontSizePx` may be `null` meaning “inherit from settings”. Overlay resolves them at render time.
- `durationMs` > 0 enables auto-advance for that slide only (Lua script tracks timers when this mode is active).

## LocalStorage Presets

- Key namespace: `obsTextSlides.presets`.
- Each preset stores:

```json
{
  "id": "preset-2025-11-19T15:45",
  "label": "Show intro quotes",
  "textarea": "raw combined text with --- delimiters",
  "settings": {
    "defaultFontFamily": "...",
    "defaultFontSizePx": 36
  }
}
```

- Dock UI renders presets in a sidebar. Selecting one loads the textarea, updates styling controls, and schedules the next auto-sync cycle.

## Persistence Strategy

- Every edit updates localStorage and emits the same JSON payload through `BroadcastChannel`, so overlay/browser sources stay synced without any file-system prompts.
- Optional backups can simply save/load the JSON blob described above.
- Lua mirrors the Animated Lower Thirds flow: the hotkey script writes `data/hotkeys.js`, the dock polls it, and applies `next/previous` commands accordingly.

## Error Handling

- `metadata.lastWriter` helps detect stomps: if Lua updates `activeSlideIndex`, dock sees the change and updates its UI accordingly.
- Overlay primarily receives state through `BroadcastChannel`, but it can also poll the JSON file if launched with `?mode=json`. It shows “Waiting for slides” whenever the payload is missing or invalid.

