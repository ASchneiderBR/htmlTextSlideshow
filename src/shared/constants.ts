export const STORAGE_KEY = "htmlTextSlideshow.state";
export const CHANNEL_NAME = "text-slides";
export const HOTKEY_GLOBAL_NAME = "__textSlidesHotkey";
export const HOTKEY_FILE_NAME = "hotkeys.js";
export const DEFAULT_POLL_INTERVAL = 500;
export const MIN_POLL_INTERVAL = 250;
export const DEFAULT_DELIMITER = "\n\n---\n\n";

export const FONT_OPTIONS = [
  { label: "Montserrat", value: "'Montserrat', sans-serif", googleFamily: "Montserrat:wght@400;500;600;700" },
  { label: "Poppins", value: "'Poppins', sans-serif", googleFamily: "Poppins:wght@400;500;600;700" },
  { label: "Open Sans", value: "'Open Sans', sans-serif", googleFamily: "Open+Sans:wght@400;600;700" },
  { label: "Roboto", value: "'Roboto', sans-serif", googleFamily: "Roboto:wght@400;500;700" },
  { label: "Lato", value: "'Lato', sans-serif", googleFamily: "Lato:wght@400;700" },
  { label: "Raleway", value: "'Raleway', sans-serif", googleFamily: "Raleway:wght@400;500;700" },
  { label: "Ubuntu", value: "'Ubuntu', sans-serif", googleFamily: "Ubuntu:wght@400;500;700" },
  { label: "Nunito", value: "'Nunito', sans-serif", googleFamily: "Nunito:wght@400;600;700" },
  { label: "Playfair Display", value: "'Playfair Display', serif", googleFamily: "Playfair+Display:wght@400;600;700" },
  { label: "Merriweather", value: "'Merriweather', serif", googleFamily: "Merriweather:wght@400;700" },
  { label: "PT Sans", value: "'PT Sans', sans-serif", googleFamily: "PT+Sans:wght@400;700" },
  { label: "Oswald", value: "'Oswald', sans-serif", googleFamily: "Oswald:wght@400;600;700" },
  { label: "System UI", value: "system-ui, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Courier New", value: "'Courier New', monospace" }
] as const;

export const TRANSITION_OPTIONS = [
  { label: "Crossfade", value: "crossfade" },
  { label: "Fade", value: "fade" },
  { label: "Slide Left", value: "slide-left" },
  { label: "Slide Right", value: "slide-right" },
  { label: "Slide Up", value: "slide-up" },
  { label: "Slide Down", value: "slide-down" },
  { label: "Zoom In", value: "zoom-in" },
  { label: "Zoom Out", value: "zoom-out" },
  { label: "None", value: "none" }
] as const;
