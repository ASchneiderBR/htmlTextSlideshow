# Lua Hotkey Script Blueprint (`lua/obs-text-slides.lua`)

## Responsibilities

- Register configurable hotkeys inside OBS for navigating slides.
- Mirror the Animated Lower Thirds pattern by overwriting `data/hotkeys.js`. The dock polls that file (via `<script src="../data/hotkeys.js?t=...">`) and applies the commands to the active slide.

## Hotkeys

| Action | Default | Behavior |
| --- | --- | --- |
| Next slide | `Ctrl+Right` | Writes `{command: 'next'}` to `data/hotkeys.js`. Respects loop setting when at the end. |
| Previous slide | `Ctrl+Left` | Writes `{command: 'prev'}` to `data/hotkeys.js`. |
| First slide | (unbound) | Writes `{command: 'first'}` to `data/hotkeys.js`. Jumps to the first slide. |

Implementation details:

- Use `obs.obs_hotkey_register_frontend` for each action.
- Persist hotkey bindings via `script_save`.

## File Handling

- The script writes directly to `../data/hotkeys.js` (relative to `lua/`). Keep the repo structure intact when copying between OBS instances.
- Each write replaces the entire file with a tiny JS snippet: `window.__obsTextSlidesHotkey = { seq, command, updatedAt }`.
- The dock polls the file a few times per second by injecting a `<script>` tag with a cache-busting query parameter—no special browser permissions required.

## Error States

- If `data/hotkeys.js` can’t be opened, log a warning in OBS (usually caused by read-only folders or antivirus locks).
- If nothing happens when pressing a hotkey, confirm that the dock log shows “Shared current state…” and that the polling interval is running (500 ms by default).

## Loop Behavior

When the "Loop" checkbox is enabled in the dock UI (default: enabled):
- Pressing "Next" on the last slide will jump back to the first slide automatically.
- When disabled, pressing "Next" on the last slide has no effect (stays on the last slide).

## Future Enhancements

- Support extra commands (`jumpToSlide`, `toggleAutomation`, etc.) by extending the JS payload shape.
- Display a lightweight status label in OBS (current seq, last command) for debugging.

