# OBS HTML Text Slideshow

Toolkit for controlling on-stream text slides inside OBS using nothing but HTML browser sources and a lightweight Lua script. The workflow mirrors the excellent [Animated-Lower-Thirds](https://github.com/noeal-dac/Animated-Lower-Thirds) project while being purpose-built for text blocks instead of lower thirds.

![Dock Preview](docs/assets/dock-preview.png)

## Components

- `apps/dock-ui/` – GitHub-themed dock with markdown-aware editor and JSON publisher.
- `apps/browser-overlay/` – Transparent browser source that renders the active slide responsively within whatever viewport size OBS provides.
- `lua/obs-text-slides.lua` – Hotkey-friendly script that reads the shared JSON file, updates the active slide, and exposes shortcuts inside OBS.
- `data/slides.state.json` – File-system bridge between every component. Dock writes, overlay reads, Lua updates metadata.
- `docs/` – Specifications, contracts, and OBS-specific operating notes.
- `common/` – Placeholder for shared assets such as fonts, icons, or utility scripts once implementation begins.

## Quick Start

1. Clone or download this repository anywhere OBS can reach (e.g., `D:\OBS\text-slideshow`).
2. Add a **Custom Browser Dock** in OBS that points to `apps/dock-ui/index.html`.
3. Add a **Browser Source** pointing to the overlay via a `file:///…` URL (example: `file:///D:/GitHub/obs-htmlTextSlideshow/apps/browser-overlay/index.html`). OBS Browser Source always expects a URL, so use the format `file:///path/to/index.html` (not "Local file"). Adjust the width/height for the desired canvas (e.g., `800x200`). The overlay auto-fits the text to the viewport you define.
4. Load the Lua script from `lua/obs-text-slides.lua` through `Tools → Scripts`. Bind any hotkeys you like for "Next"/"Previous"/"First"; the script mirrors Animated Lower Thirds by writing to `data/hotkeys.js`.
5. Start typing inside the dock. Slides live in OBS’s localStorage, are auto-saved ~1 s after edits, and are pushed to every overlay over `BroadcastChannel`—no file prompts or manual publishing.

## Everyday workflow

- **Edit slides:** Paste or type text in the Text input field, use `---` on a blank line to split slides, then click **"Add slides"** to publish them.
  - **Markdown support:** The text input supports full Markdown syntax including:
    - **Bold** (`**text**` or `__text__`), *Italic* (`*text*` or `_text_`), ~~Strikethrough~~ (`~~text~~`)
    - Headings (`# H1`, `## H2`, etc.)
    - Links (`[text](url)`) and Images (`![alt](url)`)
    - Lists (unordered with `-`, `*`, `+` and ordered with `1.`)
    - Code inline (`` `code` ``) and blocks (` ```code``` `)
    - Blockquotes (`> quote`)
    - Line breaks are preserved automatically
- **Typography controls:** Customize your text appearance with:
  - **Font selection:** Choose from Google Fonts (Montserrat, Roboto, Open Sans, etc.) or system fonts
  - **Text color & opacity:** Click the color button to open a picker with hex input and opacity slider (0-100%)
  - **Font size:** Adjustable from 18px to 120px (no viewport limits, supports full-width rendering)
  - **Alignment:** Horizontal (left/center/right) and vertical (top/middle/bottom)
  - **Text shadow:** Adjustable intensity (0-100) - higher values create stronger, more spread-out shadows
  - **Text stroke:** Adjustable outline thickness (0-10) with paint-order ensuring stroke renders behind text
- **Slide transitions:** Choose from multiple transition types:
  - Crossfade, Fade (sequential), Slide (left/right/up/down)
  - Zoom (in/out), Push (left/right/up/down), or None (instant)
  - Adjustable duration (0-2000ms)
  - Transitions only play when navigating slides or previewing effects (not when changing formatting)
- **Auto-sync:** The dock saves locally and broadcasts the payload over `BroadcastChannel` immediately when you add slides, change settings, or navigate. Nothing else to click.
- **Overlay:** The browser source listens to that channel by default (add `?mode=json` only if you need legacy polling for tests).
- **Lua hotkeys:** Bind "Next", "Previous", and "First" in OBS. The script overwrites `data/hotkeys.js`, the dock polls it (just like the original lower thirds), and applies the commands.
- **Loop control:** Enable/disable the "Loop" checkbox in the slides preview section to automatically restart at the first slide when reaching the end (default: enabled).

### Testing outside OBS

If you want to run the HTML files inside a desktop browser without OBS, launch Chromium with `--allow-file-access-from-files --disable-site-isolation-trials`. This matches OBS’s permissive sandbox so BroadcastChannel + `data/hotkeys.js` polling works the same way.


## 🤖 About the Development

**Disclaimer:** This project was created entirely using **AI-assisted coding tools (LLMs via Cursor)**.

I am an **OBS Power User** with extensive broadcasting experience, but I am **not a professional programmer**. 
- **100% AI-Generated**: Every line of code here was generated by AI.
- **Function over Form**: The priority was creating a functional tool for my personal workflow. The code might lack optimizations or follow unconventional patterns.
- **Community Driven**: If you are a developer and see ways to improve the architecture, performance, or code quality, your Pull Requests are extremely welcome!

## Status

This repo currently contains a fully functional text slideshow system:

- Layout + docs describing every moving part.
- LocalStorage schema, delimiter rules, and UI/UX expectations.
- Dock UI with live markdown preview, local presets, auto-sync, and BroadcastChannel support.
- Advanced typography controls: font selection, color picker with opacity, shadow, stroke, and alignment options.
- Overlay with responsive typography (unlimited font size), transition system, progress bar, and channel/json modes.
- Smart transition system that only animates on slide changes (instant updates for formatting changes).
- Lua hotkey script that mirrors Animated Lower Thirds (writes `data/hotkeys.js` for the dock to consume).
- Comprehensive text effects with unified opacity control (shadow, stroke, and text as a single composited layer).

## Roadmap

| Phase | Summary |
| --- | --- |
| 1 | ✅ Dock editor with Markdown, auto-sync. |
| 2 | ✅ Overlay rendering via BroadcastChannel + JSON fallback. |
| 3 | ✅ Lua script syncing `activeSlideIndex`. |
| 4 | ✅ Advanced typography: color picker, shadow, stroke, alignment. |
| 5 | ✅ Smart transitions (only on slide changes, not formatting). |
| 6 | 🎯 Next: preset export/import, per-slide overrides, animation library expansion.

## Contributing

See `CONTRIBUTING.md` for coding standards, environment expectations, and workflow tips tailored for OBS browser sources running locally.

## Credits

- Inspired by the craftsmanship in [Animated-Lower-Thirds](https://github.com/noeal-dac/Animated-Lower-Thirds).
- Fonts, icons, and third-party libraries will be documented in `docs/` as we add them.

