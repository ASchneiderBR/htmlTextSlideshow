import { startTransition, useDeferredValue, useEffect, useRef, useState } from "react";
import {
  DEFAULT_DELIMITER,
  FONT_OPTIONS,
  HOTKEY_FILE_NAME,
  HOTKEY_GLOBAL_NAME,
  MIN_POLL_INTERVAL,
  TRANSITION_OPTIONS
} from "../shared/constants";
import { renderMarkdown } from "../shared/markdown";
import { cloneState, DEFAULT_STATE, mergeStateWithDefaults, parseSlidesFromText, stampState } from "../shared/state";
import { canUseStorage, loadStoredState, saveStoredState } from "../shared/storage";
import { createStateChannel, publishState } from "../shared/transport";
import type { HotkeyPayload, Slide, SlideshowState, ThemeName } from "../shared/types";

declare global {
  interface Window {
    __textSlidesHotkey?: HotkeyPayload;
  }
}

const MAX_LOG_ENTRIES = 60;

type PendingMap = Record<string, number>;

type StatusTone = "success" | "warning" | "neutral";

type AlignmentOption = {
  label: string;
  horizontal: SlideshowState["settings"]["textAlign"];
  vertical: SlideshowState["settings"]["verticalAlign"];
};

const ALIGNMENT_OPTIONS: AlignmentOption[] = [
  { label: "Top left", horizontal: "left", vertical: "flex-start" },
  { label: "Top center", horizontal: "center", vertical: "flex-start" },
  { label: "Top right", horizontal: "right", vertical: "flex-start" },
  { label: "Middle left", horizontal: "left", vertical: "center" },
  { label: "Middle center", horizontal: "center", vertical: "center" },
  { label: "Middle right", horizontal: "right", vertical: "center" },
  { label: "Bottom left", horizontal: "left", vertical: "flex-end" },
  { label: "Bottom center", horizontal: "center", vertical: "flex-end" },
  { label: "Bottom right", horizontal: "right", vertical: "flex-end" }
];

function formatLog(message: string) {
  return `[${new Date().toLocaleTimeString()}] ${message}`;
}

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getThemeIcon(theme: ThemeName) {
  return theme === "dark" ? "☀" : "☾";
}

function getThemeLabel(theme: ThemeName) {
  return theme === "dark" ? "Switch to light theme" : "Switch to dark theme";
}

export default function App() {
  const enableHotkeyPolling = !import.meta.env.DEV;
  const [state, setState] = useState<SlideshowState>(() => mergeStateWithDefaults(loadStoredState()));
  const [draft, setDraft] = useState("");
  const [statusLog, setStatusLog] = useState<string[]>([formatLog("Dock initialized.")]);
  const [statusTone, setStatusTone] = useState<StatusTone>("success");
  const [statusText, setStatusText] = useState("Ready");
  const [logsOpen, setLogsOpen] = useState(false);
  const [alignmentOpen, setAlignmentOpen] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [draggedSlideId, setDraggedSlideId] = useState<string | null>(null);
  const [pendingAnimations, setPendingAnimations] = useState<PendingMap>({});

  const channelRef = useRef<BroadcastChannel | null>(null);
  const stateRef = useRef(state);
  const lastPersistReasonRef = useRef("initial-load");
  const luaSequenceRef = useRef(0);
  const pendingScriptRef = useRef<HTMLScriptElement | null>(null);
  const pendingScriptTimeoutRef = useRef<number | null>(null);
  const lastAnimationFinishRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const alignmentRef = useRef<HTMLDivElement | null>(null);

  const deferredSlides = useDeferredValue(state.slides);

  useEffect(() => {
    stateRef.current = state;
    document.documentElement.dataset.theme = state.settings.theme;
  }, [state]);

  useEffect(() => {
    if (!alignmentOpen) {
      return;
    }

    function handleClickOutside(event: MouseEvent) {
      if (!alignmentRef.current) {
        return;
      }
      if (!alignmentRef.current.contains(event.target as Node)) {
        setAlignmentOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setAlignmentOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [alignmentOpen]);

  function appendLog(message: string) {
    setStatusLog((previous) => [formatLog(message), ...previous].slice(0, MAX_LOG_ENTRIES));
  }

  function commitState(reason: string, producer: (draftState: SlideshowState) => SlideshowState) {
    lastPersistReasonRef.current = reason;
    setState((previous) => {
      const next = producer(cloneState(previous));
      return stampState(next, reason);
    });
  }

  useEffect(() => {
    const channel = createStateChannel(
      "dock-ui",
      () => undefined,
      () => {
        publishState(channelRef.current, stateRef.current);
      }
    );
    channelRef.current = channel;
    if (!channel) {
      setStatusTone("neutral");
      setStatusText("Local only");
      appendLog("BroadcastChannel unavailable. Using storage-based sync.");
    }

    return () => {
      channel?.close();
      channelRef.current = null;
    };
  }, []);

  useEffect(() => {
    const saved = saveStoredState(state);
    const published = publishState(channelRef.current, state);

    if (!saved) {
      setStatusTone("warning");
      setStatusText("Storage off");
      appendLog("Could not persist state to localStorage in this browser context.");
    } else if (published) {
      setStatusTone("success");
      setStatusText("Synced");
    } else {
      setStatusTone("neutral");
      setStatusText("Local only");
    }

    appendLog(`Saved ${state.slides.length} slides (${lastPersistReasonRef.current}).`);
  }, [state]);

  useEffect(() => {
    if (!state.playlist.isPlaying || state.slides.length === 0) {
      return;
    }

    const timeout = window.setTimeout(() => {
      handleNextSlide("autoplay");
    }, state.playlist.autoAdvanceMs);

    return () => window.clearTimeout(timeout);
  }, [state.playlist.isPlaying, state.playlist.autoAdvanceMs, state.activeSlideIndex, state.slides.length]);

  useEffect(() => {
    if (!enableHotkeyPolling) {
      return;
    }

    const interval = window.setInterval(() => {
      if (pendingScriptRef.current) {
        return;
      }
      const script = document.createElement("script");
      script.async = true;
      script.src = `./${HOTKEY_FILE_NAME}?t=${Date.now()}`;
      pendingScriptRef.current = script;
      pendingScriptTimeoutRef.current = window.setTimeout(cleanupPendingScript, MIN_POLL_INTERVAL * 3);
      script.onload = () => {
        const payload = window[HOTKEY_GLOBAL_NAME as keyof Window] as HotkeyPayload | undefined;
        if (payload && payload.seq > luaSequenceRef.current) {
          luaSequenceRef.current = payload.seq;
          if (payload.command === "next") {
            handleNextSlide("lua-next");
          } else if (payload.command === "prev") {
            activateSlide(Math.max(0, stateRef.current.activeSlideIndex - 1), "lua-prev");
          } else if (payload.command === "first") {
            activateSlide(0, "lua-first");
          } else if (typeof payload.command === "number") {
            activateSlide(payload.command, "lua-jump");
          }
        }
        cleanupPendingScript();
      };
      script.onerror = cleanupPendingScript;
      document.body.appendChild(script);
    }, MIN_POLL_INTERVAL);

    return () => {
      window.clearInterval(interval);
      cleanupPendingScript();
    };
  }, [enableHotkeyPolling]);

  function cleanupPendingScript() {
    if (pendingScriptTimeoutRef.current) {
      window.clearTimeout(pendingScriptTimeoutRef.current);
      pendingScriptTimeoutRef.current = null;
    }
    if (pendingScriptRef.current) {
      pendingScriptRef.current.remove();
      pendingScriptRef.current = null;
    }
  }

  function activateSlide(index: number, reason: string) {
    const clampedIndex = clamp(index, 0, stateRef.current.slides.length - 1);
    const duration = stateRef.current.settings.transitionDuration || 250;
    const now = Date.now();
    const startTime = Math.max(now, lastAnimationFinishRef.current);
    const endTime = startTime + duration + 50;
    lastAnimationFinishRef.current = endTime;
    const slideId = stateRef.current.slides[clampedIndex]?.id;

    if (slideId) {
      setPendingAnimations((previous) => ({ ...previous, [slideId]: endTime }));
      window.setTimeout(() => {
        setPendingAnimations((previous) => {
          if (previous[slideId] !== endTime) {
            return previous;
          }
          const next = { ...previous };
          delete next[slideId];
          return next;
        });
      }, endTime - now);
    }

    commitState(reason, (draftState) => {
      draftState.activeSlideIndex = clampedIndex;
      return draftState;
    });
  }

  function handleNextSlide(reason: string) {
    const currentState = stateRef.current;
    if (currentState.slides.length === 0) {
      return;
    }
    const nextIndex = currentState.activeSlideIndex + 1;
    if (nextIndex >= currentState.slides.length) {
      if (currentState.playlist.loop) {
        activateSlide(0, reason);
        appendLog("Loop returned to the first slide.");
      } else if (currentState.playlist.isPlaying) {
        commitState("autoplay-finished", (draftState) => {
          draftState.playlist.isPlaying = false;
          return draftState;
        });
        appendLog("Autoplay stopped at the end of the playlist.");
      }
      return;
    }
    activateSlide(nextIndex, reason);
  }

  function handlePreviousSlide(reason: string) {
    const currentState = stateRef.current;
    if (currentState.slides.length === 0) {
      return;
    }
    const previousIndex = currentState.activeSlideIndex - 1;
    if (previousIndex < 0) {
      if (currentState.playlist.loop) {
        activateSlide(currentState.slides.length - 1, reason);
        appendLog("Loop returned to the last slide.");
      }
      return;
    }
    activateSlide(previousIndex, reason);
  }

  function handleRestart() {
    if (stateRef.current.slides.length === 0) {
      return;
    }
    activateSlide(0, "restart-playlist");
    appendLog("Playlist restarted from slide 1.");
  }

  function handleAddSlides() {
    const parsedSlides = parseSlidesFromText(draft);
    if (!parsedSlides.length) {
      return;
    }
    startTransition(() => {
      commitState("add-slides", (draftState) => {
        draftState.slides = [...draftState.slides, ...parsedSlides];
        return draftState;
      });
    });
    setDraft("");
  }

  function handleDeleteSlide(slideId: string) {
    commitState("delete-slide", (draftState) => {
      draftState.slides = draftState.slides.filter((slide) => slide.id !== slideId);
      draftState.activeSlideIndex = clamp(draftState.activeSlideIndex, 0, Math.max(draftState.slides.length - 1, 0));
      return draftState;
    });
  }

  function handleClearAll() {
    commitState("clear-all", (draftState) => {
      draftState.slides = [];
      draftState.activeSlideIndex = 0;
      draftState.playlist.isPlaying = false;
      return draftState;
    });
    setShowConfirmClear(false);
  }

  function handleExport() {
    downloadJson(`slides-backup-${new Date().toISOString().slice(0, 10)}.json`, state);
    appendLog("Backup exported.");
  }

  function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const importedState = mergeStateWithDefaults(parsed);
        startTransition(() => {
          setState(stampState(importedState, "restore-backup"));
        });
        appendLog(`Imported ${importedState.slides.length} slides from backup.`);
      } catch {
        appendLog("Backup import failed: invalid JSON.");
        setStatusTone("warning");
        setStatusText("Import failed");
      } finally {
        event.target.value = "";
      }
    };
    reader.readAsText(file);
  }

  function handleReorder(targetSlideId: string) {
    if (!draggedSlideId || draggedSlideId === targetSlideId) {
      return;
    }

    commitState("reorder-slides", (draftState) => {
      const fromIndex = draftState.slides.findIndex((slide) => slide.id === draggedSlideId);
      const toIndex = draftState.slides.findIndex((slide) => slide.id === targetSlideId);
      if (fromIndex === -1 || toIndex === -1) {
        return draftState;
      }
      const [moved] = draftState.slides.splice(fromIndex, 1);
      draftState.slides.splice(toIndex, 0, moved);
      draftState.activeSlideIndex = draftState.slides.findIndex((slide) => slide.id === stateRef.current.slides[stateRef.current.activeSlideIndex]?.id);
      if (draftState.activeSlideIndex === -1) {
        draftState.activeSlideIndex = 0;
      }
      return draftState;
    });
  }

  function setTheme(theme: ThemeName) {
    commitState("theme-change", (draftState) => {
      draftState.settings.theme = theme;
      return draftState;
    });
  }

  function updateSetting<K extends keyof SlideshowState["settings"]>(key: K, value: SlideshowState["settings"][K], reason: string) {
    commitState(reason, (draftState) => {
      draftState.settings[key] = value;
      return draftState;
    });
  }

  function toggleAutoplay() {
    commitState("toggle-autoplay", (draftState) => {
      draftState.playlist.isPlaying = !draftState.playlist.isPlaying;
      return draftState;
    });
  }

  function toggleLoop() {
    commitState("toggle-loop", (draftState) => {
      draftState.playlist.loop = !draftState.playlist.loop;
      return draftState;
    });
  }

  function applyAlignment(horizontal: SlideshowState["settings"]["textAlign"], vertical: SlideshowState["settings"]["verticalAlign"]) {
    commitState("alignment-grid", (draftState) => {
      draftState.settings.textAlign = horizontal;
      draftState.settings.verticalAlign = vertical;
      return draftState;
    });
    setAlignmentOpen(false);
  }

  const currentAlignmentLabel =
    ALIGNMENT_OPTIONS.find((option) => option.horizontal === state.settings.textAlign && option.vertical === state.settings.verticalAlign)?.label ||
    "Middle center";

  return (
    <div className="app-shell">
      <header className="topbar glass">
        <div>
          <h1>OBS Text Slideshow</h1>
        </div>
        <div className="topbar__actions">
          <button
            className="theme-toggle"
            type="button"
            aria-label={getThemeLabel(state.settings.theme)}
            title={getThemeLabel(state.settings.theme)}
            onClick={() => setTheme(state.settings.theme === "dark" ? "light" : "dark")}
          >
            <span aria-hidden="true">{getThemeIcon(state.settings.theme)}</span>
          </button>
        </div>
      </header>

      <main className="workspace">
        <aside className="sidebar-stack">
          <section className="sidebar-card glass">
            <div className="section-heading">
              <h2>Typography</h2>
            </div>
            <div className="control-grid">
              <label className="full-row">
                <span>Font family</span>
                <select value={state.settings.defaultFontFamily} onChange={(event) => updateSetting("defaultFontFamily", event.target.value, "font-family")}>
                  {FONT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>Font size</span>
                <input type="number" min={18} max={120} value={state.settings.defaultFontSizePx} onChange={(event) => updateSetting("defaultFontSizePx", Number(event.target.value), "font-size")} />
              </label>
              <div className="alignment-control" ref={alignmentRef}>
                <span>Alignment</span>
                <button
                  type="button"
                  className="alignment-trigger"
                  onClick={() => setAlignmentOpen((current) => !current)}
                  aria-expanded={alignmentOpen}
                  aria-haspopup="dialog"
                >
                  <span>{currentAlignmentLabel}</span>
                  <span className="alignment-trigger__preview" aria-hidden="true">
                    {ALIGNMENT_OPTIONS.map((option) => {
                      const active = option.horizontal === state.settings.textAlign && option.vertical === state.settings.verticalAlign;
                      return <span key={option.label} className={`alignment-dot ${active ? "is-active" : ""}`} />;
                    })}
                  </span>
                </button>
                {alignmentOpen ? (
                  <div className="alignment-popover" role="dialog" aria-label="Alignment picker">
                    <div className="alignment-grid">
                      {ALIGNMENT_OPTIONS.map((option) => {
                        const active = option.horizontal === state.settings.textAlign && option.vertical === state.settings.verticalAlign;
                        return (
                          <button
                            key={option.label}
                            type="button"
                            className={`alignment-option ${active ? "is-active" : ""}`}
                            aria-label={option.label}
                            title={option.label}
                            onClick={() => applyAlignment(option.horizontal, option.vertical)}
                          >
                            <span className="alignment-option__dot" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
              <label>
                <span>Color</span>
                <input type="color" value={state.settings.textColor} onChange={(event) => updateSetting("textColor", event.target.value, "text-color")} />
              </label>
              <label>
                <span>Opacity</span>
                <input type="range" min={0} max={100} value={state.settings.textOpacity} onChange={(event) => updateSetting("textOpacity", Number(event.target.value), "text-opacity")} />
                <strong>{state.settings.textOpacity}%</strong>
              </label>
              <label>
                <span>Shadow</span>
                <input type="number" min={0} max={100} value={state.settings.shadowIntensity} onChange={(event) => updateSetting("shadowIntensity", Number(event.target.value), "shadow-intensity")} />
              </label>
              <label>
                <span>Stroke</span>
                <input type="number" min={0} max={10} value={state.settings.strokeIntensity} onChange={(event) => updateSetting("strokeIntensity", Number(event.target.value), "stroke-intensity")} />
              </label>
            </div>
          </section>

          <section className="sidebar-card glass">
            <div className="section-heading">
              <h2>Playback</h2>
            </div>
            <div className="control-grid">
              <label>
                <span>Autoplay interval</span>
                <input type="number" min={500} max={60000} step={100} value={state.playlist.autoAdvanceMs} onChange={(event) => commitState("autoplay-interval", (draftState) => {
                  draftState.playlist.autoAdvanceMs = Number(event.target.value);
                  return draftState;
                })} />
              </label>
              <label>
                <span>Duration</span>
                <input type="number" min={0} max={3000} step={50} value={state.settings.transitionDuration} onChange={(event) => updateSetting("transitionDuration", Number(event.target.value), "transition-duration")} />
              </label>
              <label className="full-row">
                <span>Transition</span>
                <select value={state.settings.transitionType} onChange={(event) => updateSetting("transitionType", event.target.value as SlideshowState["settings"]["transitionType"], "transition-type")}>
                  {TRANSITION_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
              <div className="action-cluster full-row">
                <button className="button button--primary" onClick={toggleAutoplay}>{state.playlist.isPlaying ? "Stop autoplay" : "Start autoplay"}</button>
                <button className={`button ${state.playlist.loop ? "button--ghost-active" : "button--ghost"}`} onClick={toggleLoop}>{state.playlist.loop ? "Loop on" : "Loop off"}</button>
                <button className={`button ${state.settings.showProgressBar ? "button--ghost-active" : "button--ghost"}`} onClick={() => updateSetting("showProgressBar", !state.settings.showProgressBar, "toggle-progress-bar")}>{state.settings.showProgressBar ? "Progress on" : "Progress off"}</button>
              </div>
            </div>
          </section>
        </aside>

        <section className="editor-column glass">
          <div className="section-heading">
            <p className="eyebrow">Author</p>
            <h2>Compose slides</h2>
          </div>
          <div className="toolbar-row">
            <button className="button button--ghost" onClick={() => setDraft((current) => `${current}${current ? DEFAULT_DELIMITER : "---\n"}`)}>Insert delimiter</button>
            <button className="button button--primary" onClick={handleAddSlides}>Add slides</button>
          </div>
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Type slides here. Use --- on a blank line to split slides."
          />
          <div className="markdown-note">
            Supports headings, bold, italic, code, links, lists, blockquotes and images.
          </div>
          <div className="editor-actions">
            <button className="button button--ghost" onClick={handleExport}>Backup</button>
            <button className="button button--ghost" onClick={() => fileInputRef.current?.click()}>Restore</button>
            <button className="button button--danger" onClick={() => setShowConfirmClear(true)} disabled={state.slides.length === 0}>Clear all</button>
            <input ref={fileInputRef} type="file" hidden accept=".json" onChange={handleImport} />
          </div>
        </section>

        <section className="preview-column glass">
          <div className="section-heading">
            <p className="eyebrow">Playlist</p>
            <h2>Slides</h2>
          </div>
          <div className="transport-bar" role="toolbar" aria-label="Slide controls">
            <button className="button button--small button--ghost" onClick={() => handlePreviousSlide("manual-prev")} disabled={state.slides.length === 0}>Previous</button>
            <button className="button button--small button--primary" onClick={toggleAutoplay} disabled={state.slides.length === 0}>{state.playlist.isPlaying ? "Pause" : "Play"}</button>
            <button className="button button--small button--ghost" onClick={handleRestart} disabled={state.slides.length === 0}>Restart</button>
            <button className="button button--small button--ghost" onClick={() => handleNextSlide("manual-next")} disabled={state.slides.length === 0}>Next</button>
          </div>
          <div className="preview-list" role="list">
            {deferredSlides.length === 0 ? (
              <div className="empty-state">No slides yet. Add content from the editor.</div>
            ) : (
              deferredSlides.map((slide, index) => {
                const isActive = index === state.activeSlideIndex;
                const isPending = pendingAnimations[slide.id] && pendingAnimations[slide.id] > Date.now();
                return (
                  <article
                    key={slide.id}
                    className={`preview-card ${isActive ? "is-active" : ""}`}
                    draggable
                    onDragStart={() => setDraggedSlideId(slide.id)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => handleReorder(slide.id)}
                    onDragEnd={() => setDraggedSlideId(null)}
                  >
                    <header>
                      <div>
                        <p className="card-index">Slide {index + 1}</p>
                      </div>
                    </header>
                    <div className="preview-markdown" dangerouslySetInnerHTML={{ __html: renderMarkdown(slide.raw) }} />
                    <div className="card-actions">
                      <button className="button button--small button--primary" onClick={() => activateSlide(index, "manual-play")}>
                        {isPending ? "Queued" : "Show"}
                      </button>
                      <button className="button button--small button--ghost" onClick={() => handleDeleteSlide(slide.id)}>Delete</button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </main>

      <section className={`log-drawer glass ${logsOpen ? "is-open" : ""}`}>
        <button className="log-drawer__toggle" type="button" onClick={() => setLogsOpen((current) => !current)}>
          <span className="log-drawer__summary">
            <strong className="log-drawer__status">{statusText}</strong>
            <span className={`status-pill status-pill--${statusTone}`}>{logsOpen ? "Hide log" : "Show log"}</span>
          </span>
        </button>
        {logsOpen ? (
          <div className="log-panel">
            <ul>
              {statusLog.map((entry, index) => (
                <li key={`${index}-${entry}`}>{entry}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      {showConfirmClear ? (
        <div className="modal-backdrop" role="presentation" onClick={() => setShowConfirmClear(false)}>
          <div className="modal-card glass" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <h2>Clear every slide?</h2>
            <p>This removes the whole playlist and stops autoplay.</p>
            <div className="modal-actions">
              <button className="button button--ghost" onClick={() => setShowConfirmClear(false)}>Cancel</button>
              <button className="button button--danger" onClick={handleClearAll}>Clear all</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
