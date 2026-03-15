export type ThemeName = "dark" | "light";
export type HorizontalAlign = "left" | "center" | "right";
export type VerticalAlign = "flex-start" | "center" | "flex-end";
export type TransitionType =
  | "crossfade"
  | "fade"
  | "slide-left"
  | "slide-right"
  | "slide-up"
  | "slide-down"
  | "zoom-in"
  | "zoom-out"
  | "none";

export interface Slide {
  id: string;
  title: string;
  body: string;
  raw: string;
  fontFamily: string | null;
  fontSizePx: number | null;
  textAlign: HorizontalAlign | null;
  notes: string;
  durationMs: number;
}

export interface SlideshowSettings {
  defaultFontFamily: string;
  defaultFontSizePx: number;
  lineHeight: number;
  textAlign: HorizontalAlign;
  verticalAlign: VerticalAlign;
  textColor: string;
  textOpacity: number;
  shadowIntensity: number;
  strokeIntensity: number;
  markdown: boolean;
  transitionType: TransitionType;
  transitionDuration: number;
  showProgressBar: boolean;
  theme: ThemeName;
}

export interface PlaylistState {
  mode: "manual";
  loop: boolean;
  autoAdvanceMs: number;
  isPlaying: boolean;
}

export interface SlideshowMetadata {
  lastWriter: string;
  source: string;
  notes: string;
}

export interface SlideshowState {
  version: string;
  updatedAt: string;
  metadata: SlideshowMetadata;
  settings: SlideshowSettings;
  slides: Slide[];
  activeSlideIndex: number;
  playlist: PlaylistState;
}

export interface HotkeyPayload {
  seq: number;
  command: "next" | "prev" | "first" | number | null;
  updatedAt?: string;
}

export interface StateMessage {
  type: "state" | "request-state";
  source: "dock-ui" | "browser-overlay";
  payload?: SlideshowState;
}
