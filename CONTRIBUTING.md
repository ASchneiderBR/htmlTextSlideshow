# Contributing

Thanks for helping shape the OBS HTML Text Slideshow Suite. The repo is optimized for fast iteration without requiring native OBS plugins.

## Workflow

1. **Specs first** – Update the relevant doc in `docs/` before touching code.
2. **Isolate changes** – Each component (dock, overlay, Lua) lives inside its own folder. Keep shared logic under `common/`.
3. **Manual OBS checks** – Browser sources and docks can behave differently than Chromium in a desktop browser. Test inside OBS whenever a change affects rendering or file access.
4. **Follow data contract** – `data/slides.state.json` is the single source of truth. Never break its schema without updating `docs/data-contract.md` and sample data.

## Coding Standards

- Plain HTML/CSS/JavaScript to keep OBS compatibility high. If a build step becomes necessary, document it in `docs/ops-testing.md`.
- Use semantic HTML and accessible forms (labels, keyboard navigation) for the dock UI.
- Prefer CSS custom properties for theming so we can later expose a settings panel.
- Lua style: lower_snake_case for variables/functions, descriptive comments, minimal globals.

## Commit Style

```
<component>: <summary in imperative>

Optional detail body...
```

Examples:

- `dock-ui: add markdown preview pane`
- `overlay: support font scaling per slide`

## Testing

- Describe any manual verification steps you performed in the PR description.
- When editing Lua, include screenshots or short notes verifying hotkeys are registered inside OBS.

## Questions

Open a discussion/issue outlining the scenario, OBS version, and operating system. Links to [Animated-Lower-Thirds](https://github.com/noeal-dac/Animated-Lower-Thirds) behavior are welcome when proposing improvements.

