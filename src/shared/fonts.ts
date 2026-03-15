import { FONT_OPTIONS } from "./constants";

const loadedFonts = new Set<string>();

export function ensureFontLoaded(fontFamily: string) {
  const match = FONT_OPTIONS.find((option) => option.value === fontFamily || option.label === fontFamily.replace(/['"]/g, ""));
  if (!match?.googleFamily || loadedFonts.has(match.googleFamily)) {
    return;
  }

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${match.googleFamily}&display=swap`;
  document.head.appendChild(link);
  loadedFonts.add(match.googleFamily);
}
