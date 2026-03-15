import { STORAGE_KEY } from "./constants";
import { DEFAULT_STATE, mergeStateWithDefaults } from "./state";
import type { SlideshowState } from "./types";

export function canUseStorage() {
  try {
    localStorage.setItem(`${STORAGE_KEY}.probe`, "1");
    localStorage.removeItem(`${STORAGE_KEY}.probe`);
    return true;
  } catch {
    return false;
  }
}

export function loadStoredState(): SlideshowState {
  if (!canUseStorage()) {
    return DEFAULT_STATE;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_STATE;
    }
    return mergeStateWithDefaults(JSON.parse(raw));
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveStoredState(state: SlideshowState) {
  if (!canUseStorage()) {
    return false;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
