import { CHANNEL_NAME } from "./constants";
import type { SlideshowState, StateMessage } from "./types";

export function createStateChannel(source: StateMessage["source"], onState: (state: SlideshowState) => void, onRequest?: () => void) {
  if (typeof BroadcastChannel === "undefined") {
    return null;
  }

  try {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.addEventListener("message", (event: MessageEvent<StateMessage>) => {
      const payload = event.data;
      if (!payload || typeof payload !== "object") {
        return;
      }
      if (payload.type === "state" && payload.payload) {
        onState(payload.payload);
      }
      if (payload.type === "request-state" && payload.source !== source) {
        onRequest?.();
      }
    });
    return channel;
  } catch {
    return null;
  }
}

export function publishState(channel: BroadcastChannel | null, state: SlideshowState) {
  if (!channel) {
    return false;
  }
  try {
    channel.postMessage({ type: "state", source: "dock-ui", payload: state } satisfies StateMessage);
    return true;
  } catch {
    return false;
  }
}

export function requestState(channel: BroadcastChannel | null) {
  if (!channel) {
    return false;
  }
  try {
    channel.postMessage({ type: "request-state", source: "browser-overlay" } satisfies StateMessage);
    return true;
  } catch {
    return false;
  }
}
