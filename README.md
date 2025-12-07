# OBS HTML Text Slideshow

**Version 2.0** – A complete, standalone text slideshow system for OBS Studio. Control on-stream text slides with a modern browser dock, smooth transitions, and global hotkeys. Inspired by [Animated-Lower-Thirds](https://github.com/noeal-dac/Animated-Lower-Thirds), reimagined for text presentations.

![Dock Preview](https://i.imgur.com/dfnu3HP.png)

## 🚀 Quick Start (Super Easy Install)

1. **Download** this repository (or the release zip).
2. **Extract** the folder anywhere on your computer (e.g., `Documents\HTML-Text-Slideshow`).
3. In OBS, go to **Tools → Scripts**, click the `+` button, and load **`text-slides.lua`**.
4. In the **Script Properties** panel, you'll see two file paths:
   - **Dock Path** – Copy this path.
   - **Source Path** – Copy this path.
5. **Add the Dock**: Go to `View > Docks > Custom Browser Docks...`
   - **Dock Name**: `Text Slides` (or any name you like)
   - **URL**: Paste the **Dock Path** from step 4.
6. **Add the Source**: Add a **Browser Source** to your scene.
   - Check **"Local file"** and browse to select **`Source.html`**, or paste the **Source Path** into the URL field.
   - Set width/height to match your canvas (e.g., 1920x1080).
7. **Configure Hotkeys** (optional): Go to `Settings > Hotkeys`, search for "Text Slides", and bind keys for Next/Previous/First Slide.
8. **Done!** Type in the dock, click "Add slides", and control your show.

## 📁 Files (All-In-One Design)

Version 2.0 simplifies everything into just **3 files**:

- **`text-slides.lua`** – The installer script. Manages hotkeys and displays file paths.
- **`Dock.html`** – The control panel (standalone, all CSS/JS bundled inside).
- **`Source.html`** – The overlay display (standalone, all CSS/JS bundled inside).
- **`hotkeys.js`** – (Auto-generated) Bridges Lua hotkey commands to the Dock.
- **`slides.json`** – (Auto-generated) Fallback storage for slides if BroadcastChannel fails.

## ✨ Features

### Typography & Styling
- **Markdown support:**
  - **Bold** (`**text**` or `__text__`), *Italic* (`*text*` or `_text_`), ~~Strikethrough~~ (`~~text~~`)
  - Headings (`# H1` through `###### H6`)
  - Lists: unordered (`- item`) and ordered (`1. item`)
  - Code blocks (` ```code``` `), inline code (`` `code` ``), blockquotes (`> quote`)
  - Links (`[text](url)`), images (`![alt](url)`)
- **Font control:**
  - 30+ fonts: Google Fonts (Montserrat, Roboto, Open Sans, Poppins, etc.) and System fonts
  - Custom font size (18px - 120px, respects line breaks)
- **Advanced text effects:**
  - **Color picker** with transparency control (applies to entire layer for consistent look)
  - **Shadow intensity** (0-100): from subtle to dramatic black shadow with increasing blur
  - **Stroke (outline)** intensity (0-10): adjustable text outline that renders behind characters
- **Alignment:**
  - Horizontal: Left, Center, Right
  - Vertical: Top, Middle, Bottom

### Slide Management
- **Slide transitions:**
  - 13 transition types: Crossfade, Fade, Slide (Left/Right/Up/Down), Zoom (In/Out), Push (Left/Right/Up/Down), None (instant)
  - Adjustable duration (0-2000ms)
  - **Smart transitions**: Only animates when changing slides or previewing transitions, not when editing formatting
- **Preview panel:**
  - Live markdown rendering
  - Drag-and-drop reordering
  - One-click slide activation
  - Active slide highlighting
- **Loop mode:** Auto-return to first slide after the last one
- **Persistent state:** All slides saved to browser localStorage and synced instantly

### OBS Integration
- **Global hotkeys:** Next, Previous, First Slide (bind in OBS Settings > Hotkeys)
- **Real-time sync:** Changes appear instantly via BroadcastChannel API
- **Fallback mode:** JSON polling if BroadcastChannel is unavailable
- **Zero dependencies:** No installation, no npm, no build process

## 🎬 Everyday Workflow

1. **Edit slides:** Type or paste text in the Dock. Use `---` on a blank line to separate slides.
2. **Style it:** Adjust font, color, shadow, stroke, and alignment in real-time.
3. **Publish:** Click **"Add slides"** to add them to your show.
4. **Present:** Click **Play** buttons in the preview, or use **Hotkeys** during your stream.

## 🔧 Technical Details

### Architecture (v2.0)
- **Standalone HTML files**: All CSS and JavaScript bundled inline—no external dependencies.
- **ES5 compatibility**: Pure JavaScript (no modules) for maximum OBS CEF browser compatibility.
- **BroadcastChannel sync**: Real-time communication between Dock and Source within the same OBS instance.
- **localStorage persistence**: Slides saved per OBS profile, survives restarts.
- **Lua bridge**: Hotkey commands written to `hotkeys.js`, polled by the Dock every second.

### What's New in v2.0
- **Simplified structure**: From 15+ files to just 3 core files (Dock.html, Source.html, text-slides.lua).
- **No build process**: Everything works directly from source—open the HTML in any browser.
- **Better installation**: Script properties display exact file paths with `file:///` prefix for easy copy/paste.
- **Enhanced typography**: Shadow and stroke effects, unified opacity control, better font rendering.
- **Improved performance**: Debounced inputs, markdown caching, optimized animations with GPU acceleration.

### Browser Compatibility
- **OBS Studio 28+** (Chromium Embedded Framework)
- **Any modern browser** (for testing the Dock outside OBS)

## 🤖 About the Development

**Disclaimer:** This project was created entirely using **AI-assisted coding tools (LLMs via Cursor)**.

- **100% AI-Generated**: Every line of code (v1.0 and v2.0) was generated by AI.
- **Human-Guided**: Direction, testing, and refinement by a human with zero coding knowledge.
- **Function over Form**: The priority was creating a robust, user-friendly tool.
- **Community Driven**: Pull Requests, bug reports, and feature requests are welcome!

## 💡 Use Cases

- **Live streaming**: Display talking points, quotes, lyrics, or audience questions.
- **Presentations**: Professional slide transitions without leaving OBS.
- **Church services**: Scripture verses, song lyrics, announcements.
- **Education**: Lecture notes, formulas, code snippets (with syntax highlighting via markdown).
- **Gaming**: Quest objectives, story text, patch notes.

## 📝 License

This project is licensed under the **GNU General Public License v2.0 or later** (GPL v2.0+), which is compatible with OBS Studio's license requirements.

This means:
- ✅ Free to use, modify, and distribute
- ✅ Source code must remain open and available
- ✅ Derivative works must also be licensed under GPL v2.0+

For the full license text, see the [LICENSE](LICENSE) file in this repository.

## 🙏 Credits

- Inspired by [Animated-Lower-Thirds](https://github.com/noeal-dac/Animated-Lower-Thirds) by noeal-dac.
- Developed with [Cursor](https://cursor.sh) AI assistance.
