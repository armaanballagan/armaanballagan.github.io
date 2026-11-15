import { useCallback, useEffect, useRef, useState } from "react";
import { startVoice } from "./audio";
import { friskFrames, type FriskFrame } from "./friskFrames";

/* =============================================================================
   ABOUT GAME — the About section as a tiny playable Ruins area.

   Arrow keys / WASD walk (only while the game is on screen), Z / Enter / Space
   reads the sign Frisk is facing. Three rooms, joined left-to-right. All
   coordinates are in the game's native 320×240 pixels.

   EDIT THE ABOUT TEXT in `ROOMS[n].signs[].pages` below.
============================================================================= */

const W = 320;
const H = 240;
const SPEED = 92; // px per second
const FOOT_HALF = 6; // half-width of Frisk's feet for collisions
const asset = (path: string) => `${import.meta.env.BASE_URL}game/${path}`;

type Rect = { x0: number; y0: number; x1: number; y1: number };
type Dir = "down" | "up" | "left" | "right";
type Sign = { zone: Rect; pages: string[] };
type Room = {
  image: string;
  walk: Rect[]; // where Frisk's feet may go
  exitLeft?: { to: number; x: number };
  exitRight?: { to: number; x: number };
  signs: Sign[];
};

const ROOMS: Room[] = [
  {
    image: "room1.png",
    walk: [
      { x0: 22, y0: 96, x1: 298, y1: 222 },
      { x0: 290, y0: 116, x1: 330, y1: 186 },
    ],
    exitRight: { to: 1, x: 6 },
    signs: [
      {
        zone: { x0: 40, y0: 74, x1: 112, y1: 104 },
        pages: [
          "* (It's a plaque.)",
          "* ARMAAN BALLAGAN.\n* Computer Science @ UBC, class of 2029.",
        ],
      },
      {
        zone: { x0: 112, y0: 134, x1: 208, y1: 206 },
        pages: ["* A bed of golden flowers.", "* They broke your fall."],
      },
    ],
  },
  {
    image: "room2.png",
    walk: [{ x0: -10, y0: 116, x1: 330, y1: 178 }],
    exitLeft: { to: 0, x: 312 },
    exitRight: { to: 2, x: 6 },
    signs: [
      {
        zone: { x0: 56, y0: 94, x1: 128, y1: 118 },
        pages: [
          "* Originally from the Cayman Islands.",
          "* Now exploring the Underground.\n* ...I mean, Vancouver.",
        ],
      },
      {
        zone: { x0: 192, y0: 94, x1: 264, y1: 118 },
        pages: [
          "* Learns by building.",
          "* Most projects start at hackathons like nwHacks, StormHacks and HackCamp.",
          "* A weekend is enough to wire up something a little ridiculous.",
        ],
      },
    ],
  },
  {
    image: "room3.png",
    walk: [{ x0: -10, y0: 130, x1: 314, y1: 232 }],
    exitLeft: { to: 1, x: 312 },
    signs: [
      {
        zone: { x0: 66, y0: 100, x1: 138, y1: 126 },
        pages: ["* Favourite place: where hardware, AI and solid software engineering meet."],
      },
      {
        zone: { x0: 182, y0: 100, x1: 254, y1: 126 },
        pages: ["* STATS\n* YEAR 3 @ UBC.  4 HACKATHONS.\n* 8 PROJECTS.  COFFEE: ∞"],
      },
      {
        zone: { x0: 130, y0: 100, x1: 190, y1: 126 },
        pages: [
          "* The door won't budge.",
          "* A note is pinned to it:\n* \"Currently looking for co-op and internship roles.\"",
        ],
      },
    ],
  },
];

const inside = (r: Rect, x: number, y: number) => x >= r.x0 && x <= r.x1 && y >= r.y0 && y <= r.y1;
const walkable = (room: Room, x: number, y: number) =>
  [x - FOOT_HALF, x + FOOT_HALF].every((fx) => room.walk.some((r) => inside(r, fx, y)));

const KEY_DIRS: Record<string, Dir> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  s: "down",
  a: "left",
  d: "right",
  W: "up",
  S: "down",
  A: "left",
  D: "right",
};
const ACTION_KEYS = new Set(["z", "Z", "Enter", " "]);

type Phase = "waiting" | "falling" | "landed" | "play";

export function AboutGame() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dialog, setDialog] = useState<{ pages: string[]; page: number } | null>(null);
  const [typed, setTyped] = useState(0);
  const [isTouch] = useState(() => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches);

  // Mutable game state (kept out of React to avoid re-rendering every frame).
  const game = useRef({
    room: 0,
    x: 160,
    y: 172,
    dir: "down" as Dir,
    walkTime: 0,
    moving: false,
    phase: "waiting" as Phase,
    phaseTime: 0,
    held: new Set<Dir>(),
    active: false, // section on screen → keyboard controls the game
    fade: 0,
  });
  if (import.meta.env.DEV) (window as unknown as { __aboutGame: unknown }).__aboutGame = game.current;
  const dialogRef = useRef(dialog);
  dialogRef.current = dialog;
  const typedRef = useRef(typed);
  typedRef.current = typed;

  const currentText = dialog ? dialog.pages[dialog.page] : "";
  const typingDone = typed >= currentText.length;

  /* ── Dialogue typing (uses the site's typewriter voice + mute button) ── */
  useEffect(() => {
    if (!dialog || typingDone) return;
    const stop = startVoice("typewriter");
    const timer = window.setInterval(() => setTyped((count) => count + 1), 28);
    return () => {
      window.clearInterval(timer);
      stop();
    };
  }, [dialog, typingDone]);

  const advanceDialog = useCallback(() => {
    const current = dialogRef.current;
    if (!current) return;
    const text = current.pages[current.page];
    if (typedRef.current < text.length) {
      setTyped(text.length); // finish the line instantly
    } else if (current.page < current.pages.length - 1) {
      setDialog({ pages: current.pages, page: current.page + 1 });
      setTyped(0);
    } else {
      setDialog(null);
    }
  }, []);

  const interact = useCallback(() => {
    const g = game.current;
    if (g.phase !== "play") return;
    if (dialogRef.current) {
      advanceDialog();
      return;
    }
    const reach = 14;
    const probe = {
      up: [g.x, g.y - reach],
      down: [g.x, g.y + reach],
      left: [g.x - reach, g.y - 4],
      right: [g.x + reach, g.y - 4],
    }[g.dir];
    const sign = ROOMS[g.room].signs.find((s) => inside(s.zone, probe[0], probe[1]) || inside(s.zone, g.x, g.y - 6));
    if (sign) {
      g.held.clear();
      setDialog({ pages: sign.pages, page: 0 });
      setTyped(0);
    }
  }, [advanceDialog]);

  /* ── Keyboard: only while the game is on screen ── */
  useEffect(() => {
    const onDown = (event: KeyboardEvent) => {
      const g = game.current;
      if (!g.active || document.querySelector("[aria-modal='true']")) return;
      const dir = KEY_DIRS[event.key];
      if (dir) {
        event.preventDefault();
        if (!dialogRef.current) g.held.add(dir);
      } else if (ACTION_KEYS.has(event.key)) {
        event.preventDefault();
        if (!event.repeat) interact();
      } else if ((event.key === "x" || event.key === "X" || event.key === "Shift") && dialogRef.current) {
        setTyped((dialogRef.current.pages[dialogRef.current.page] ?? "").length);
      }
    };
    const onUp = (event: KeyboardEvent) => {
      const dir = KEY_DIRS[event.key];
      if (dir) game.current.held.delete(dir);
    };
    const onBlur = () => game.current.held.clear();
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", onBlur);
    };
  }, [interact]);

  /* ── Is the game on screen? (starts the fall the first time) ── */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const g = game.current;
        g.active = entry.intersectionRatio >= 0.45;
        if (!g.active) g.held.clear();
        if (g.active && g.phase === "waiting") {
          g.phase = reduceMotion ? "play" : "falling";
          g.phaseTime = 0;
        }
      },
      { threshold: [0, 0.25, 0.45, 0.6, 1] },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  /* ── Game loop ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const rooms = ROOMS.map((room) => {
      const img = new Image();
      img.src = asset(room.image);
      return img;
    });
    const frisk = new Image();
    frisk.src = asset("frisk.png");

    const drawFrame = (frame: FriskFrame, feetX: number, feetY: number) => {
      ctx.drawImage(
        frisk,
        frame.x,
        frame.y,
        frame.w,
        frame.h,
        Math.round(feetX - frame.w / 2),
        Math.round(feetY - frame.h + 2),
        frame.w,
        frame.h,
      );
    };

    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const g = game.current;
      g.phaseTime += dt;

      // Movement
      if (g.phase === "play" && !dialogRef.current) {
        let dx = 0;
        let dy = 0;
        if (g.held.has("left")) dx -= 1;
        if (g.held.has("right")) dx += 1;
        if (g.held.has("up")) dy -= 1;
        if (g.held.has("down")) dy += 1;
        g.moving = dx !== 0 || dy !== 0;
        if (g.moving) {
          // Face the most recent horizontal input if moving sideways, else vertical.
          g.dir = dx < 0 ? "left" : dx > 0 ? "right" : dy < 0 ? "up" : "down";
          const step = SPEED * dt * (dx && dy ? Math.SQRT1_2 : 1);
          const room = ROOMS[g.room];
          const nx = g.x + dx * step;
          if (walkable(room, nx, g.y)) g.x = nx;
          const ny = g.y + dy * step;
          if (walkable(room, g.x, ny)) g.y = ny;
          g.walkTime += dt;

          // Room changes
          if (g.x > W + 2 && room.exitRight) {
            g.room = room.exitRight.to;
            g.x = room.exitRight.x;
            g.fade = 1;
          } else if (g.x < -2 && room.exitLeft) {
            g.room = room.exitLeft.to;
            g.x = room.exitLeft.x;
            g.fade = 1;
          }
          // Keep feet inside the new room's floor.
          const next = ROOMS[g.room];
          if (!walkable(next, g.x, g.y)) {
            const band = next.walk.find((r) => g.x >= r.x0 && g.x <= r.x1) ?? next.walk[0];
            g.y = Math.min(band.y1, Math.max(band.y0, g.y));
          }
        } else {
          g.walkTime = 0;
        }
      }

      // Draw room
      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, H);
      const roomImg = rooms[g.room];
      if (roomImg.complete) ctx.drawImage(roomImg, 0, 0);

      // Draw Frisk
      if (frisk.complete && g.phase !== "waiting") {
        if (g.phase === "falling") {
          const t = Math.min(1, g.phaseTime / 0.9);
          const y = -20 + (172 - -20) * t * t; // accelerate like a fall
          drawFrame(friskFrames.fall[Math.floor(g.phaseTime * 10) % 4], 160, y);
          if (t >= 1) {
            g.phase = "landed";
            g.phaseTime = 0;
          }
        } else if (g.phase === "landed") {
          drawFrame(friskFrames.lie[1], 160, 174);
          if (g.phaseTime > 1.1) {
            g.phase = "play";
            g.phaseTime = 0;
            g.dir = "down";
          }
        } else {
          const frames = friskFrames[g.dir];
          const index = g.moving ? Math.floor(g.walkTime * 6) % frames.length : 0;
          drawFrame(frames[index], g.x, g.y);
        }
      }

      // Fade between rooms
      if (g.fade > 0) {
        ctx.fillStyle = `rgba(0,0,0,${g.fade})`;
        ctx.fillRect(0, 0, W, H);
        g.fade = Math.max(0, g.fade - dt * 4);
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* ── Touch controls ── */
  const press = (dir: Dir) => () => {
    if (!dialogRef.current) game.current.held.add(dir);
  };
  const release = (dir: Dir) => () => game.current.held.delete(dir);
  const pad = (dir: Dir, label: string, extra: string) => (
    <button
      type="button"
      aria-label={`Walk ${dir}`}
      className={`game-pad ${extra}`}
      onPointerDown={press(dir)}
      onPointerUp={release(dir)}
      onPointerLeave={release(dir)}
      onPointerCancel={release(dir)}
    >
      {label}
    </button>
  );

  const dialogAtTop = game.current.y > 150;

  return (
    <section
      ref={sectionRef}
      id="about"
      className="scroll-mt-20 border-b-4 border-white bg-[#070707] px-5 py-24 md:px-8 lg:py-32"
    >
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-5 text-[10px] tracking-widest text-[#00eaff]">AREA 01 / ABOUT</p>
            <h2 className="text-4xl leading-tight sm:text-6xl">
              CS STUDENT BY DAY.
              <span className="mt-3 block text-[#00eaff]">MAKER AT HEART.</span>
            </h2>
          </div>
          <p className="max-w-xs text-[9px] leading-loose text-white/50">
            {isTouch ? "USE THE PAD TO WALK. TAP A TO READ." : "ARROWS / WASD TO WALK. Z / ENTER TO READ."}
            <br />
            READ THE SIGNS TO LEARN ABOUT ME.
          </p>
        </div>

        {/* Text version for screen readers and search engines. */}
        <div className="sr-only">
          <p>I'm Armaan, a computer science student at UBC (class of 2029), originally from the Cayman Islands.</p>
          <p>I learn by building. Most of my projects start at hackathons like nwHacks, StormHacks and HackCamp.</p>
          <p>My favourite place is where hardware, AI and solid software engineering meet.</p>
          <p>Currently looking for co-op and internship roles.</p>
        </div>

        <div className="relative mx-auto w-full max-w-[960px] border-4 border-white bg-black" aria-hidden="true">
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            className="block aspect-[4/3] h-auto w-full"
            style={{ imageRendering: "pixelated" }}
            onClick={interact}
          />
          {dialog && (
            <div
              className={`game-dialog absolute inset-x-[4%] ${dialogAtTop ? "top-[5%]" : "bottom-[5%]"}`}
              onClick={advanceDialog}
            >
              <p className="whitespace-pre-line">{currentText.slice(0, typed)}</p>
              {typingDone && <span className="dialog-caret">▼</span>}
            </div>
          )}
        </div>

        {isTouch && (
          <div className="mx-auto mt-6 flex max-w-[960px] items-center justify-between" aria-hidden="true">
            <div className="grid grid-cols-3 grid-rows-3 gap-1">
              {pad("up", "▲", "col-start-2 row-start-1")}
              {pad("left", "◀", "col-start-1 row-start-2")}
              {pad("right", "▶", "col-start-3 row-start-2")}
              {pad("down", "▼", "col-start-2 row-start-3")}
            </div>
            <button type="button" className="game-pad game-pad-a" onClick={interact} aria-label="Read / talk">
              A
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
