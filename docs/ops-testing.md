# Operations & Testing Guide

## OBS Setup Checklist

1. **Folder placement** – Keep repo on a fast local drive (`D:\GitHub\obs-htmlTextSlideshow`). Avoid cloud-sync folders that may lock `slides.state.json`.
2. **Browser Dock** – `View → Docks → Custom Browser Dock`. Name it “Text Slides Dock” and point to `file:///D:/GitHub/obs-htmlTextSlideshow/apps/dock-ui/index.html`.
3. **Browser Source** – Add a source named “Text Slides Overlay” pointing to the same folder, but use a `file:///…` URL as bem (example: `file:///D:/GitHub/obs-htmlTextSlideshow/apps/browser-overlay/index.html`). OBS Browser Source sempre espera uma URL, não “Local file”, então o esquema `file:///` é obrigatório. Set width/height to the desired viewport (e.g., 800×200) and enable “Refresh browser when scene becomes active” if you want cache invalidation.
4. **Lua Script** – `Tools → Scripts`. Add `lua/obs-text-slides.lua` and bind hotkeys (Next/Previous). The script simply overwrites `data/hotkeys.js`, just like the Animated Lower Thirds project.

## Manual Test Matrix

| Scenario | Steps | Expected Result |
| --- | --- | --- |
| Auto-sync flow | Paste text with delimiters, tweak settings, wait ~1s | Status log logs success, overlay refreshes slide via BroadcastChannel |
| Typography change | Adjust font/align options | Dock preview updates immediately, overlay reflects new styling |
| Markdown edge cases | Add code fences, lists, blockquotes | Dock preview and overlay render identically |
| Font scaling | Change default font size to 72 px, shrink browser source | Overlay text clamps without clipping |
| Hotkey next/prev | Use bound keys while live | Lua rewrites `data/hotkeys.js`, dock detects the change, overlay advances |

## Troubleshooting Tips

- **Hotkey file locked** – If Lua can’t update `data/hotkeys.js`, close external editors or ensure OBS has write permissions to the repo folder.
- **OBS cache** – Use the browser source “Refresh cache of current page” option if CSS appears stale.
- **Lua logging** – Open `Help → Log Files → View Current Log` to inspect script prints when debugging hotkeys.
- **Testing outside OBS** – Launch Chrome/Edge with `--allow-file-access-from-files --disable-site-isolation-trials` so the `file://` BroadcastChannel + hotkey polling behave like OBS.

## Release Steps

1. Update docs if schema or hotkey bindings change.
2. Reset sample data (`data/hotkeys.js`, optional `data/slides.state.json`) to simple placeholders.
3. Bump version in the documented schema and add release notes to `README.md`.

## Future Automation Ideas

- Add `npm` scripts for linting HTML/CSS/JS if we adopt tooling.
- Create a GitHub Action that validates JSON schema and lint rules.

