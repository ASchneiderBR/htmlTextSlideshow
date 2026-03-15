import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "vite";
import react from "@vitejs/plugin-react";

const rootDir = fileURLToPath(new URL("..", import.meta.url));
const distDir = path.join(rootDir, "dist");
const buildRoot = path.join(distDir, ".pages");

const pages = [
  { name: "Dock", source: path.join(rootDir, "src", "dock", "index.html"), outDir: path.join(buildRoot, "dock") },
  { name: "Source", source: path.join(rootDir, "src", "source", "index.html"), outDir: path.join(buildRoot, "source") },
  { name: "DevLab", source: path.join(rootDir, "src", "devlab", "index.html"), outDir: path.join(buildRoot, "devlab") }
];

const sampleSlidesState = {
  version: "3.0.0",
  updatedAt: new Date().toISOString(),
  metadata: {
    lastWriter: "build",
    source: "release-package",
    notes: "sample-markdown-slides"
  },
  settings: {
    defaultFontFamily: "'Montserrat', sans-serif",
    defaultFontSizePx: 42,
    lineHeight: 1.25,
    textAlign: "center",
    verticalAlign: "center",
    textColor: "#ffffff",
    textOpacity: 100,
    shadowIntensity: 0,
    strokeIntensity: 0,
    markdown: true,
    transitionType: "crossfade",
    transitionDuration: 250,
    showProgressBar: true,
    theme: "dark"
  },
  slides: [
    {
      id: "slide-001",
      title: "Headline",
      body: "# Markdown check\n## Headings, emphasis and inline code\nThis slide tests **bold**, *italic*, ~~strike~~ and `inline code`.",
      raw: "Headline\n\n# Markdown check\n## Headings, emphasis and inline code\nThis slide tests **bold**, *italic*, ~~strike~~ and `inline code`.",
      fontFamily: null,
      fontSizePx: null,
      textAlign: null,
      notes: "Headings and inline formatting.",
      durationMs: 0
    },
    {
      id: "slide-002",
      title: "Bullets",
      body: "### Bullet list\n- First talking point\n- Second talking point\n- Third talking point with **highlight**",
      raw: "Bullets\n\n### Bullet list\n- First talking point\n- Second talking point\n- Third talking point with **highlight**",
      fontFamily: null,
      fontSizePx: null,
      textAlign: null,
      notes: "Unordered list.",
      durationMs: 0
    },
    {
      id: "slide-003",
      title: "Numbered",
      body: "### Ordered list\n1. Open OBS\n2. Reload the Browser Source\n3. Confirm the slide alignment",
      raw: "Numbered\n\n### Ordered list\n1. Open OBS\n2. Reload the Browser Source\n3. Confirm the slide alignment",
      fontFamily: null,
      fontSizePx: null,
      textAlign: null,
      notes: "Ordered list.",
      durationMs: 0
    },
    {
      id: "slide-004",
      title: "Quote",
      body: "> Browser Source should stay transparent.\n> Alignment must follow the viewport.",
      raw: "Quote\n\n> Browser Source should stay transparent.\n> Alignment must follow the viewport.",
      fontFamily: null,
      fontSizePx: null,
      textAlign: "left",
      notes: "Blockquote with left alignment.",
      durationMs: 0
    },
    {
      id: "slide-005",
      title: "Code Block",
      body: "### Fenced code\n```lua\nobs.script_log(obs.LOG_INFO, \"hotkey triggered\")\n```",
      raw: "Code Block\n\n### Fenced code\n```lua\nobs.script_log(obs.LOG_INFO, \"hotkey triggered\")\n```",
      fontFamily: "'JetBrains Mono', monospace",
      fontSizePx: 34,
      textAlign: "left",
      notes: "Fenced code block.",
      durationMs: 0
    },
    {
      id: "slide-006",
      title: "Rule",
      body: "### Divider test\nLine before the rule\n\n---\n\nLine after the rule",
      raw: "Rule\n\n### Divider test\nLine before the rule\n\n---\n\nLine after the rule",
      fontFamily: null,
      fontSizePx: null,
      textAlign: "center",
      notes: "Horizontal rule inside Markdown.",
      durationMs: 0
    },
    {
      id: "slide-007",
      title: "Link",
      body: "### Link rendering\n[OBS Studio](https://obsproject.com) and [GitHub](https://github.com) should render as anchors.",
      raw: "Link\n\n### Link rendering\n[OBS Studio](https://obsproject.com) and [GitHub](https://github.com) should render as anchors.",
      fontFamily: null,
      fontSizePx: null,
      textAlign: "center",
      notes: "Link markdown.",
      durationMs: 0
    },
    {
      id: "slide-008",
      title: "Table",
      body: "### GFM table\n| Item | Status |\n| --- | --- |\n| Markdown | OK |\n| Source | Test |\n| OBS | Ready |",
      raw: "Table\n\n### GFM table\n| Item | Status |\n| --- | --- |\n| Markdown | OK |\n| Source | Test |\n| OBS | Ready |",
      fontFamily: null,
      fontSizePx: 32,
      textAlign: "center",
      notes: "GitHub-flavored table.",
      durationMs: 0
    },
    {
      id: "slide-009",
      title: "Mixed Alignment",
      body: "### Right-aligned test\nThis slide should hug the right side of the viewport.",
      raw: "Mixed Alignment\n\n### Right-aligned test\nThis slide should hug the right side of the viewport.",
      fontFamily: null,
      fontSizePx: null,
      textAlign: "right",
      notes: "Horizontal alignment check.",
      durationMs: 0
    },
    {
      id: "slide-010",
      title: "Long Form",
      body: "### Multi-paragraph\nFirst paragraph with **strong emphasis** and a manual line break.\nSecond line stays in the same paragraph.\n\nSecond paragraph to test spacing, wrapping and viewport anchoring over a longer block of text.",
      raw: "Long Form\n\n### Multi-paragraph\nFirst paragraph with **strong emphasis** and a manual line break.\nSecond line stays in the same paragraph.\n\nSecond paragraph to test spacing, wrapping and viewport anchoring over a longer block of text.",
      fontFamily: null,
      fontSizePx: 30,
      textAlign: "left",
      notes: "Paragraph spacing and wrapping.",
      durationMs: 0
    }
  ],
  activeSlideIndex: 0,
  playlist: {
    mode: "manual",
    loop: true,
    autoAdvanceMs: 5000,
    isPlaying: false
  }
};

async function buildPage(page, emptyOutDir) {
  await build({
    configFile: false,
    root: rootDir,
    base: "./",
    plugins: [react()],
    build: {
      outDir: page.outDir,
      emptyOutDir,
      target: "chrome103",
      cssCodeSplit: false,
      modulePreload: {
        polyfill: false
      },
      codeSplitting: false,
      rollupOptions: {
        input: page.source
      }
    }
  });
}

function resolveAssetPath(htmlPath, assetPath) {
  return path.resolve(path.dirname(htmlPath), assetPath);
}

function escapeForRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripInlinedImports(scriptContent, inlinedFiles) {
  let cleaned = scriptContent;

  for (const fileName of inlinedFiles) {
    const escaped = escapeForRegex(fileName);
    cleaned = cleaned.replace(new RegExp(`import\\s*\"\\./${escaped}\";?`, "g"), "");
    cleaned = cleaned.replace(new RegExp(`import\\s*'\\./${escaped}';?`, "g"), "");
    cleaned = cleaned.replace(new RegExp(`import\\s*\"\\.\\/assets\\/${escaped}\";?`, "g"), "");
    cleaned = cleaned.replace(new RegExp(`import\\s*'\\.\\/assets\\/${escaped}';?`, "g"), "");
  }

  return cleaned;
}

async function inlineHtml(page) {
  const htmlPath = path.join(page.outDir, path.relative(rootDir, page.source));
  let html = await fs.readFile(htmlPath, "utf8");

  const stylesheetMatches = [...html.matchAll(/<link\s+rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g)];
  for (const match of stylesheetMatches) {
    const cssPath = resolveAssetPath(htmlPath, match[1]);
    const cssContent = await fs.readFile(cssPath, "utf8");
    html = html.replace(match[0], () => `<style>\n${cssContent}\n</style>`);
  }

  const modulePreloads = [...html.matchAll(/<link\s+rel="modulepreload"[^>]*href="([^"]+)"[^>]*>/g)];
  const preloadContents = [];
  const preloadFileNames = [];

  for (const match of modulePreloads) {
    const preloadPath = resolveAssetPath(htmlPath, match[1]);
    preloadFileNames.push(path.basename(preloadPath));
    preloadContents.push(await fs.readFile(preloadPath, "utf8"));
    html = html.replace(match[0], () => "");
  }

  const scriptMatches = [...html.matchAll(/<script\s+type="module"[^>]*src="([^"]+)"[^>]*><\/script>/g)];
  for (const match of scriptMatches) {
    const scriptPath = resolveAssetPath(htmlPath, match[1]);
    let scriptContent = await fs.readFile(scriptPath, "utf8");
    scriptContent = stripInlinedImports(scriptContent, preloadFileNames);

    const inlinedScript = `<script type="module">\n${preloadContents.join("\n")}\n${scriptContent}\n</script>`;
    html = html.replace(match[0], () => inlinedScript);
  }

  if (/from\"\.\//.test(html) || /from'\.\//.test(html) || /import\"\.\//.test(html) || /import'\.\//.test(html)) {
    throw new Error(`Unresolved relative module imports remained in ${page.name}.`);
  }

  await fs.writeFile(path.join(distDir, `${page.name}.html`), html, "utf8");
}

async function writeSupportFiles() {
  const hotkeysContent = "window.__textSlidesHotkey={seq:0,command:null,updatedAt:new Date().toISOString()};\n";
  const slidesContent = JSON.stringify(sampleSlidesState, null, 2);

  await fs.writeFile(path.join(distDir, "hotkeys.js"), hotkeysContent, "utf8");
  await fs.writeFile(path.join(distDir, "slides.json"), slidesContent, "utf8");
}

await fs.rm(distDir, { recursive: true, force: true });

for (const [index, page] of pages.entries()) {
  await buildPage(page, index === 0);
  await inlineHtml(page);
}

await writeSupportFiles();
await fs.rm(buildRoot, { recursive: true, force: true });