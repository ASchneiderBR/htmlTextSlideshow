# OBS HTML Text Slideshow Suite

Toolkit for controlling on-stream text slides inside OBS using nothing but HTML browser sources and a lightweight Lua script. The workflow mirrors the excellent [Animated-Lower-Thirds](https://github.com/noeal-dac/Animated-Lower-Thirds) project while being purpose-built for text blocks instead of lower thirds.

## Components

- `apps/dock-ui/` – GitHub-themed dock with markdown-aware editor, preset manager, and JSON publisher.
- `apps/browser-overlay/` – Transparent browser source that renders the active slide responsively within whatever viewport size OBS provides.
- `lua/obs-text-slides.lua` – Hotkey-friendly script that reads the shared JSON file, updates the active slide, and exposes shortcuts inside OBS.
- `data/slides.state.json` – File-system bridge between every component. Dock writes, overlay reads, Lua updates metadata.
- `docs/` – Specifications, contracts, and OBS-specific operating notes.
- `common/` – Placeholder for shared assets such as fonts, icons, or utility scripts once implementation begins.

## Quick Start

1. Clone or download this repository anywhere OBS can reach (e.g., `D:\OBS\text-slideshow`).
2. Add a **Custom Browser Dock** in OBS that points to `apps/dock-ui/index.html`.
3. Add a **Browser Source** pointing to the overlay via a `file:///…` URL (example: `file:///D:/GitHub/obs-htmlTextSlideshow/apps/browser-overlay/index.html`). OBS Browser Source sempre espera uma URL, então use o formato `file:///caminho/até/index.html` (não “Local file”). Ajuste a largura/altura para o canvas desejado (e.g., `800x200`). O overlay auto-fits o texto à viewport que você definir.
4. Load the Lua script from `lua/obs-text-slides.lua` through `Tools → Scripts`. Bind any hotkeys you like for "Next"/"Previous"/"First"; the script mirrors Animated Lower Thirds by writing to `data/hotkeys.js`.
5. Start typing inside the dock. Slides live in OBS’s localStorage, are auto-saved ~1 s after edits, and are pushed to every overlay over `BroadcastChannel`—no file prompts or manual publishing.

## Everyday workflow

- **Edit slides:** Paste or type text in the Text input field, use `---` on a blank line to split slides, tweak font/size/alignment, and preview the Markdown live.
  - **Markdown support:** The text input supports full Markdown syntax including:
    - **Bold** (`**text**` or `__text__`), *Italic* (`*text*` or `_text_`), ~~Strikethrough~~ (`~~text~~`)
    - Headings (`# H1`, `## H2`, etc.)
    - Links (`[text](url)`) and Images (`![alt](url)`)
    - Lists (unordered with `-`, `*`, `+` and ordered with `1.`)
    - Code inline (`` `code` ``) and blocks (` ```code``` `)
    - Blockquotes (`> quote`)
    - Line breaks are preserved automatically
- **Local presets:** Press “Save preset” to store the textarea + settings inside localStorage (each portable OBS build keeps its own presets, just like the lower-thirds repo).
- **Auto-sync:** The dock saves locally ~1 s after edits and broadcasts the same payload over `BroadcastChannel`. Nothing else to click.
- **Overlay:** The browser source listens to that channel by default (add `?mode=json` only if you need legacy polling for tests).
- **Lua hotkeys:** Bind "Next", "Previous", and "First" in OBS. The script overwrites `data/hotkeys.js`, the dock polls it (just like the original lower thirds), and applies the commands.
- **Loop control:** Enable/disable the "Loop" checkbox in the slides preview section to automatically restart at the first slide when reaching the end (default: enabled).

### Testing outside OBS

If you want to run the HTML files inside a desktop browser without OBS, launch Chromium with `--allow-file-access-from-files --disable-site-isolation-trials`. This matches OBS’s permissive sandbox so BroadcastChannel + `data/hotkeys.js` polling works the same way.

## Status

This repo currently contains scaffolding, specs, and placeholders so we can iterate deliberately:

- Layout + docs describing every moving part.
- LocalStorage schema, delimiter rules, and UI/UX expectations.
- Dock UI with live markdown preview, local presets, auto-sync, and BroadcastChannel support.
- Overlay with responsive typography, transition hooks, progress bar, and channel/json modes.
- Lua hotkey script that mirrors Animated Lower Thirds (writes `data/hotkeys.js` for the dock to consume).

## Roadmap

| Phase | Summary |
| --- | --- |
| 1 | ✅ Dock editor with Markdown, presets, auto-sync. |
| 2 | ✅ Overlay rendering via BroadcastChannel + JSON fallback. |
| 3 | ✅ Lua script syncing `activeSlideIndex`. |
| 4 | 🎯 Next: richer transitions, shared preset export, validation. |

## Contributing

See `CONTRIBUTING.md` for coding standards, environment expectations, and workflow tips tailored for OBS browser sources running locally.

## Credits

- Inspired by the craftsmanship in [Animated-Lower-Thirds](https://github.com/noeal-dac/Animated-Lower-Thirds).
- Fonts, icons, and third-party libraries will be documented in `docs/` as we add them.

