import { DEFAULT_DELIMITER } from "./constants";
import type { Slide, SlideshowState, ThemeName } from "./types";

const VERSION = "3.0.0";

function nowIso() {
  return new Date().toISOString();
}

export function createSlideId(index: number) {
  return `slide-${Date.now()}-${index}-${Math.floor(Math.random() * 100000)}`;
}

export function cloneState<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export const DEFAULT_STATE: SlideshowState = {
  version: VERSION,
  updatedAt: nowIso(),
  metadata: {
    lastWriter: "dock-ui",
    source: "control-panel",
    notes: "initial"
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

function sanitizeTheme(theme: unknown): ThemeName {
  return theme === "light" ? "light" : "dark";
}

function sanitizeSlide(input: Partial<Slide>, index: number): Slide {
  const raw = typeof input.raw === "string" && input.raw.trim() ? input.raw : typeof input.body === "string" ? input.body : "";
  const title = typeof input.title === "string" && input.title.trim() ? input.title.trim() : `Slide ${index + 1}`;
  return {
    id: typeof input.id === "string" && input.id ? input.id : createSlideId(index),
    title,
    body: typeof input.body === "string" && input.body ? input.body : raw,
    raw,
    fontFamily: typeof input.fontFamily === "string" ? input.fontFamily : null,
    fontSizePx: typeof input.fontSizePx === "number" ? input.fontSizePx : null,
    textAlign: input.textAlign === "left" || input.textAlign === "center" || input.textAlign === "right" ? input.textAlign : null,
    notes: typeof input.notes === "string" ? input.notes : "",
    durationMs: typeof input.durationMs === "number" ? input.durationMs : 0
  };
}

export function mergeStateWithDefaults(input: unknown): SlideshowState {
  const base = cloneState(DEFAULT_STATE);
  if (!input || typeof input !== "object") {
    return base;
  }

  const parsed = input as Partial<SlideshowState>;
  if (typeof parsed.version === "string") base.version = parsed.version;
  if (typeof parsed.updatedAt === "string") base.updatedAt = parsed.updatedAt;
  if (parsed.metadata && typeof parsed.metadata === "object") {
    base.metadata = {
      lastWriter: typeof parsed.metadata.lastWriter === "string" ? parsed.metadata.lastWriter : base.metadata.lastWriter,
      source: typeof parsed.metadata.source === "string" ? parsed.metadata.source : base.metadata.source,
      notes: typeof parsed.metadata.notes === "string" ? parsed.metadata.notes : base.metadata.notes
    };
  }
  if (parsed.settings && typeof parsed.settings === "object") {
    base.settings = {
      ...base.settings,
      ...parsed.settings,
      theme: sanitizeTheme(parsed.settings.theme)
    };
  }
  if (Array.isArray(parsed.slides) && parsed.slides.length > 0) {
    base.slides = parsed.slides.map((slide, index) => sanitizeSlide(slide, index));
  }
  if (typeof parsed.activeSlideIndex === "number") {
    base.activeSlideIndex = Math.max(0, Math.min(parsed.activeSlideIndex, base.slides.length - 1));
  }
  if (parsed.playlist && typeof parsed.playlist === "object") {
    base.playlist = {
      ...base.playlist,
      ...parsed.playlist
    };
  }
  return base;
}

export function stampState(state: SlideshowState, reason: string): SlideshowState {
  return {
    ...state,
    version: VERSION,
    updatedAt: nowIso(),
    metadata: {
      lastWriter: "dock-ui",
      source: "control-panel",
      notes: reason
    }
  };
}

export function parseSlidesFromText(input: string): Slide[] {
  return input
    .split(/\n\s*---\s*\n/g)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk, index) => {
      const lines = chunk.split("\n");
      return {
        id: createSlideId(index),
        title: lines[0]?.trim() || `Slide ${index + 1}`,
        body: chunk,
        raw: chunk,
        fontFamily: null,
        fontSizePx: null,
        textAlign: null,
        notes: "",
        durationMs: 0
      } satisfies Slide;
    });
}

export function createDelimitedText(slides: Slide[]) {
  return slides.map((slide) => slide.raw).join(DEFAULT_DELIMITER);
}
