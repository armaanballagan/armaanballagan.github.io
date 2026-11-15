import { useCallback, useEffect, useState } from "react";
import { asset, startVoice } from "./audio";
import { flowey } from "./floweyEvents";

/* =============================================================================
   FLOWEY PEEK — easter egg in the Save Files section.

   Flowey (official yellow overworld sprite, 4x) pops his head over the top
   edge of the save-file box every few seconds (timing: `flowey-peek` in
   index.css). Clicking him blacks out the page, he says a few lines, then he
   leaves for the About game (room 3, on the grass patch) and the page scrolls
   there. After the fight he comes back here so the egg can be found again.

   EDIT HIS LINES in `LINES` below.
============================================================================= */

const LINES: { text: string; portrait: "nice" | "wink" }[] = [
  { text: "* Ohh! Howdy!", portrait: "nice" },
  { text: "* Golly... you found me, huh?", portrait: "nice" },
  { text: "* Well, I can't stick around here.\n* See ya later!", portrait: "wink" },
];

const portraitSrc = {
  nice: asset("game/flowey-portrait.png"),
  wink: asset("game/flowey-portrait-wink.png"),
};

export function FloweyPeek() {
  const [present, setPresent] = useState(() => !flowey.found);
  const [line, setLine] = useState<number | null>(null);
  const [typed, setTyped] = useState(0);

  useEffect(() => flowey.onGone(() => setPresent(true)), []);

  const text = line === null ? "" : LINES[line].text;
  const typingDone = typed >= text.length;

  useEffect(() => {
    if (line === null || typingDone) return;
    const stop = startVoice("flowey");
    const timer = window.setInterval(() => setTyped((count) => count + 1), 38);
    return () => {
      window.clearInterval(timer);
      stop();
    };
  }, [line, typingDone]);

  const finish = useCallback(() => {
    setLine(null);
    setPresent(false);
    flowey.emitFound();
    // Send the visitor to the game so they can go and find him.
    window.setTimeout(() => {
      document.querySelector("#about canvas")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 250);
  }, []);

  const advance = useCallback(() => {
    if (line === null) return;
    if (!typingDone) setTyped(text.length);
    else if (line < LINES.length - 1) {
      setLine(line + 1);
      setTyped(0);
    } else finish();
  }, [finish, line, text.length, typingDone]);

  useEffect(() => {
    if (line === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (["z", "Z", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        if (!event.repeat) advance();
      } else if (["x", "X", "Shift"].includes(event.key)) {
        setTyped(text.length);
      } else if (event.key === "Escape") {
        finish();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [advance, finish, line, text.length]);

  return (
    <>
      {present && line === null && (
        <button
          type="button"
          className="flowey-peek"
          aria-label="A flower is peeking out from behind the save files"
          onClick={() => {
            setLine(0);
            setTyped(0);
          }}
        >
          <img src={asset("game/flowey-peek.png")} alt="" draggable={false} />
        </button>
      )}

      {line !== null && (
        <div className="flowey-blackout" role="dialog" aria-modal="true" aria-label="Flowey" onClick={advance}>
          <div className="flowey-dialog">
            <img src={portraitSrc[LINES[line].portrait]} alt="" className="flowey-dialog-portrait" />
            <p className="whitespace-pre-line">{text.slice(0, typed)}</p>
            {typingDone && <span className="dialog-caret">▼</span>}
          </div>
        </div>
      )}
    </>
  );
}
