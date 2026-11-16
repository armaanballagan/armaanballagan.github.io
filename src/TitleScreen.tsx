import { useEffect, useRef, useState } from "react";

/* =============================================================================
   TITLE SCREEN — "press any key" before the site starts.

   Browsers block every sound until the visitor clicks, taps or presses a key,
   so the hero's typing voice was always silent on first load. This screen asks
   for that first press: it calls `onStart` right inside the click / key event
   (so music can start), then fades away. The name intro and hero text wait for
   `onStart` before they play.

   Shown on every page load (the browser forgets the click on refresh).
============================================================================= */

const IGNORED_KEYS = new Set(["Tab", "Shift", "Control", "Alt", "Meta", "CapsLock", "Escape"]);

export function TitleScreen({ onStart }: { onStart: () => void }) {
  const [state, setState] = useState<"waiting" | "leaving" | "gone">("waiting");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const startedRef = useRef(false);
  const onStartRef = useRef(onStart);
  onStartRef.current = onStart;

  const start = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    onStartRef.current();
    setState("leaving");
  };
  const startRef = useRef(start);
  startRef.current = start;

  // Any key starts. Capture it first so the About game (or anything else) never sees it.
  useEffect(() => {
    if (state !== "waiting") return;
    const onKey = (event: KeyboardEvent) => {
      if (IGNORED_KEYS.has(event.key)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (!event.repeat) startRef.current();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [state]);

  // No scrolling the page behind it.
  useEffect(() => {
    if (state === "gone") return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [state]);

  useEffect(() => {
    buttonRef.current?.focus({ preventScroll: true });
  }, []);

  if (state === "gone") return null;

  return (
    <button
      ref={buttonRef}
      type="button"
      className={`title-screen ${state === "leaving" ? "is-leaving" : ""}`}
      onClick={start}
      onAnimationEnd={(event) => {
        if (event.animationName === "title-screen-out") setState("gone");
      }}
      aria-label="Start: click or press any key"
    >
      <span className="title-screen-name">ARMAAN_BALLAGAN.EXE</span>
      <span className="title-screen-prompt">
        <span className="title-prompt-desktop">[ CLICK OR PRESS ANY KEY ]</span>
        <span className="title-prompt-touch">[ TAP TO START ]</span>
      </span>
      <span className="title-screen-note">SOUND ON</span>
    </button>
  );
}
