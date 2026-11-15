import { useEffect, useRef } from "react";
import { mkFrames, type MkFrame } from "./monsterKidFrames";

/* =============================================================================
   NAME INTRO — Monster Kid runs in and "spells out" the name on page load.

   1. Walks right along the top line, revealing ARMAAN behind her.
   2. At the end of the N, walks down to the bottom line.
   3. Walks left, revealing BALLAGAN backwards (N, A, G, A, L…).
   4. Right at the LL she trips, slides, gets back up…
   5. …and runs off the left side of the screen.

   Positions below are in the name image's own pixels (name-logo.png is 990×429).
   Click the name to skip. Visitors with "reduce motion" on just see the name.
============================================================================= */

const LOGO_W = 990;
const LOGO_H = 429;
const TOP_BASELINE = 163; // bottom of ARMAAN
const BOTTOM_BASELINE = 428; // bottom of BALLAGAN
const TOP_END = 981; // right edge of the N in ARMAAN
const BOTTOM_START = 980; // where she lands on the bottom line
const TRIP_AT = 446; // right edge of the second L in BALLAGAN
const LINE_HEIGHT = 164;

const WALK_SPEED = 1150; // name-image px per second
const RUN_SPEED = 1500;
const WALK_FPS = 16;
const RUN_FPS = 14;

// Trip timing per frame (ms): run, leap, slide x8, lie still x4, get up x6.
const TRIP_DURATIONS = [70, 90, 45, 45, 45, 45, 45, 45, 45, 60, 110, 110, 110, 160, 90, 90, 90, 90, 100, 110];

type Phase = "walkRight" | "walkDown" | "walkLeft" | "trip" | "runLeft" | "done";

const SPRITE_URL = `${import.meta.env.BASE_URL}undertale/monster-kid.png`;
const LOGO_URL = `${import.meta.env.BASE_URL}name-logo.png`;

export function NameIntro() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLImageElement>(null);
  const bottomRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const skipRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    const wrap = wrapRef.current;
    const top = topRef.current;
    const bottom = bottomRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !top || !bottom || !canvas) return;

    // How much of each line is showing (in name-image px).
    const setReveal = (topRight: number, bottomLeft: number) => {
      const topPct = Math.max(0, Math.min(100, (topRight / LOGO_W) * 100));
      const bottomPct = Math.max(0, Math.min(100, (bottomLeft / LOGO_W) * 100));
      top.style.clipPath = `inset(0 ${100 - topPct}% 50% 0)`;
      bottom.style.clipPath = `inset(50% 0 0 ${bottomPct}%)`;
    };

    let raf = 0;
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(raf);
      setReveal(LOGO_W, 0);
      canvas.style.display = "none";
    };
    skipRef.current = finish;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      finish();
      return;
    }
    setReveal(0, LOGO_W); // hide the name until she walks past

    const sprite = new Image();
    sprite.src = SPRITE_URL;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      finish();
      return;
    }

    let phase: Phase = "walkRight";
    let phaseStart = 0;
    let x = 0; // her centre, in name-image px
    let startX = 0;
    let topReveal = 0;
    let bottomReveal = LOGO_W;
    let tripCellLeft = 0; // during the trip the sprite cell stays put; the sheet's own frames do the sliding
    let runFromX = 0;

    const scaleNow = () => wrap.clientWidth / LOGO_W; // display px per name-image px
    const spriteScale = (s: number) => (LINE_HEIGHT * s * 0.95) / 28; // display px per sprite px

    const draw = (frame: MkFrame, cellLeftLogo: number, baseline: number) => {
      const s = scaleNow();
      const k = spriteScale(s);
      const dpr = window.devicePixelRatio || 1;
      const cssW = frame.w * k;
      const cssH = frame.h * k;
      if (canvas.width !== Math.round(cssW * dpr) || canvas.height !== Math.round(cssH * dpr)) {
        canvas.width = Math.round(cssW * dpr);
        canvas.height = Math.round(cssH * dpr);
        canvas.style.width = `${cssW}px`;
        canvas.style.height = `${cssH}px`;
      }
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(sprite, frame.x, 0, frame.w, frame.h, 0, 0, canvas.width, canvas.height);
      const left = cellLeftLogo * s;
      const topPx = baseline * s - (frame.by1 + 1) * k;
      canvas.style.transform = `translate(${left}px, ${topPx}px)`;
    };

    /** Cell left edge (name px) that puts this frame's sprite centre at `centre`. */
    const cellLeftFor = (frame: MkFrame, centre: number) => {
      const k = spriteScale(scaleNow()) / scaleNow(); // sprite px → name px
      return centre - ((frame.bx0 + frame.bx1 + 1) / 2) * k;
    };
    const centreOf = (frame: MkFrame, cellLeft: number) => {
      const k = spriteScale(scaleNow()) / scaleNow();
      return cellLeft + ((frame.bx0 + frame.bx1 + 1) / 2) * k;
    };

    const offscreenLeft = () => {
      const s = scaleNow();
      const k = spriteScale(s) / s;
      return -wrap.getBoundingClientRect().left / s - 30 * k;
    };

    const go = (next: Phase, now: number) => {
      phase = next;
      phaseStart = now;
    };

    const tick = (now: number) => {
      if (finished) return;
      if (!phaseStart) {
        phaseStart = now;
        startX = offscreenLeft();
        x = startX;
      }
      const t = (now - phaseStart) / 1000;

      if (phase === "walkRight") {
        x = startX + WALK_SPEED * t;
        const frame = mkFrames.walkRight[Math.floor(t * WALK_FPS) % 4];
        topReveal = Math.max(topReveal, x);
        if (x >= TOP_END) {
          x = TOP_END;
          topReveal = LOGO_W;
          go("walkDown", now);
        }
        draw(frame, cellLeftFor(frame, x), TOP_BASELINE);
      } else if (phase === "walkDown") {
        const distance = BOTTOM_BASELINE - TOP_BASELINE;
        const progress = Math.min(1, (WALK_SPEED * 0.75 * t) / distance);
        x = TOP_END + (BOTTOM_START - TOP_END) * progress;
        const baseline = TOP_BASELINE + distance * progress;
        const frame = mkFrames.walkDown[Math.floor(t * WALK_FPS) % 4];
        draw(frame, cellLeftFor(frame, x), baseline);
        if (progress >= 1) {
          startX = x;
          go("walkLeft", now);
        }
      } else if (phase === "walkLeft") {
        x = startX - WALK_SPEED * t;
        const frame = mkFrames.walkLeft[Math.floor(t * WALK_FPS) % 4];
        bottomReveal = Math.min(bottomReveal, x);
        if (x <= TRIP_AT) {
          x = TRIP_AT;
          tripCellLeft = cellLeftFor(mkFrames.tripLeft[0], x);
          go("trip", now);
        }
        draw(frame, cellLeftFor(frame, x), BOTTOM_BASELINE);
      } else if (phase === "trip") {
        let elapsed = now - phaseStart;
        let index = 0;
        while (index < TRIP_DURATIONS.length - 1 && elapsed >= TRIP_DURATIONS[index]) {
          elapsed -= TRIP_DURATIONS[index];
          index += 1;
        }
        const frame = mkFrames.tripLeft[index];
        x = centreOf(frame, tripCellLeft);
        bottomReveal = Math.min(bottomReveal, x);
        draw(frame, tripCellLeft, BOTTOM_BASELINE);
        const total = TRIP_DURATIONS.reduce((sum, d) => sum + d, 0);
        if (now - phaseStart >= total) {
          runFromX = x;
          go("runLeft", now);
        }
      } else if (phase === "runLeft") {
        x = runFromX - RUN_SPEED * t;
        const frame = mkFrames.runLeft[Math.floor(t * RUN_FPS) % 2];
        bottomReveal = Math.min(bottomReveal, x);
        draw(frame, cellLeftFor(frame, x), BOTTOM_BASELINE);
        if (x < offscreenLeft()) {
          finish();
          return;
        }
      }

      setReveal(topReveal, bottomReveal);
      raf = requestAnimationFrame(tick);
    };

    let delay = 0;
    const start = () => {
      delay = window.setTimeout(() => {
        canvas.style.display = "block";
        raf = requestAnimationFrame(tick);
      }, 250);
    };
    if (sprite.complete && sprite.naturalWidth) start();
    else {
      sprite.onload = start;
      sprite.onerror = finish;
    }

    return () => {
      window.clearTimeout(delay);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <h1>
      <span className="sr-only">Armaan Ballagan</span>
      <div
        ref={wrapRef}
        className="relative w-full max-w-[576px]"
        style={{ aspectRatio: `${LOGO_W} / ${LOGO_H}` }}
        onClick={() => skipRef.current()}
        aria-hidden="true"
      >
        <img
          ref={topRef}
          src={LOGO_URL}
          alt=""
          width={LOGO_W}
          height={LOGO_H}
          className="image-smooth absolute inset-0 block h-full w-full"
          style={{ clipPath: "inset(0 100% 50% 0)" }}
        />
        <img
          ref={bottomRef}
          src={LOGO_URL}
          alt=""
          width={LOGO_W}
          height={LOGO_H}
          className="image-smooth absolute inset-0 block h-full w-full"
          style={{ clipPath: "inset(50% 0 0 100%)" }}
        />
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute left-0 top-0 z-20"
          style={{ display: "none", imageRendering: "pixelated" }}
        />
      </div>
    </h1>
  );
}
