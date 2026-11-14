import { useEffect, useRef, useState } from "react";
import { startVoice, type VoiceName } from "./audio";

/** A piece of text, optionally styled (e.g. a highlighted word). */
export type TypewriterPart = string | { text: string; className: string };

type TypewriterProps = {
  parts: TypewriterPart[];
  /** Which dialogue voice plays while typing (see src/audio.ts). */
  voice?: VoiceName;
  /** Milliseconds per character. */
  speed?: number;
  className?: string;
};

const PAUSE_AFTER = /[.,!?;:—]/;

/**
 * Types its text out character by character while a dialogue voice plays.
 * - Starts the first time it scrolls into view.
 * - Re-types whenever it is re-mounted (give it a new `key` to replay).
 * - Click anywhere on it to finish instantly.
 * - The full text reserves its space up front, so the layout never jumps.
 */
export function Typewriter({ parts, voice = "typewriter", speed = 22, className }: TypewriterProps) {
  const fullText = parts.map((part) => (typeof part === "string" ? part : part.text)).join("");
  const reduceMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const [shown, setShown] = useState(reduceMotion ? fullText.length : 0);
  const [started, setStarted] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const stopVoiceRef = useRef<(() => void) | null>(null);

  const finished = shown >= fullText.length;

  // Start when visible.
  useEffect(() => {
    if (reduceMotion || started) return;
    const element = containerRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [reduceMotion, started]);

  // Voice on while typing.
  useEffect(() => {
    if (!started || finished) return;
    stopVoiceRef.current = startVoice(voice);
    return () => {
      stopVoiceRef.current?.();
      stopVoiceRef.current = null;
    };
  }, [started, finished, voice]);

  // Advance one character at a time.
  useEffect(() => {
    if (!started || finished) return;
    const previous = fullText[shown - 1] ?? "";
    const delay = PAUSE_AFTER.test(previous) ? speed * 4 : speed;
    const timer = window.setTimeout(() => setShown((count) => count + 1), delay);
    return () => window.clearTimeout(timer);
  }, [started, finished, shown, fullText, speed]);

  const skip = () => setShown(fullText.length);

  const render = (limit: number) => {
    let remaining = limit;
    return parts.map((part, index) => {
      const text = typeof part === "string" ? part : part.text;
      const visible = text.slice(0, Math.max(0, remaining));
      remaining -= text.length;
      if (typeof part === "string") return <span key={index}>{visible}</span>;
      return (
        <span key={index} className={part.className}>
          {visible}
        </span>
      );
    });
  };

  return (
    <span
      ref={containerRef}
      className={`relative block ${finished ? "" : "cursor-pointer"} ${className ?? ""}`}
      onClick={finished ? undefined : skip}
    >
      <span className="sr-only">{fullText}</span>
      {/* Invisible full text holds the final size so nothing shifts while typing. */}
      <span className="invisible block" aria-hidden="true">
        {render(fullText.length)}
      </span>
      <span className="absolute inset-0 block" aria-hidden="true">
        {render(shown)}
      </span>
    </span>
  );
}
