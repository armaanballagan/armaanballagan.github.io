import { useCallback, useEffect, useRef, useState } from "react";
import { startVoice } from "./audio";
import { friskFrames, type FriskFrame } from "./friskFrames";

/* =============================================================================
   ABOUT GAME — the About section as a tiny playable Ruins area.

   Arrow keys / WASD walk (only while the game is on screen), Z / Enter / Space
   reads the sign Frisk is facing. Three rooms: flower cave → corridor → through
   the Ruins gate into the dark grass-patch room. All
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
type Exit = { zone: Rect; to: number; x: number; y: number; dir: Dir }; // feet entering `zone` → room `to`
type Room = {
  image: string;
  walk: Rect[]; // where Frisk's feet may go
  block?: Rect[]; // solid things standing on the floor (signs)
  exits: Exit[];
  signs: Sign[];
};

// Where Frisk lands after the fall (centre of the golden flowers in room 1).
const LAND_X = 133;
const LAND_Y = 110;

const ROOMS: Room[] = [
  // 1 — the cave Frisk falls into, with the bed of golden flowers.
  {
    image: "room1.png",
    walk: [
      { x0: 45, y0: 30, x1: 220, y1: 60 },
      { x0: 7, y0: 48, x1: 258, y1: 140 },
      { x0: 26, y0: 130, x1: 300, y1: 160 },
      { x0: 262, y0: 127, x1: 330, y1: 160 },
      { x0: 46, y0: 150, x1: 219, y1: 223 },
    ],
    block: [{ x0: 176, y0: 27, x1: 195, y1: 45 }],
    exits: [{ zone: { x0: 322, y0: 0, x1: 400, y1: 240 }, to: 1, x: 6, y: 182, dir: "right" }],
    signs: [
      {
        zone: { x0: 170, y0: 24, x1: 201, y1: 54 },
        pages: [
          "* (It's a sign.)",
          "* ARMAAN BALLAGAN.\n* Computer Science @ UBC, class of 2029.",
        ],
      },
      {
        zone: { x0: 103, y0: 84, x1: 163, y1: 120 },
        pages: ["* A bed of golden flowers.", "* They broke your fall."],
      },
    ],
  },
  // 2 — the dark corridor leading to the Ruins gate.
  {
    image: "room2.png",
    walk: [
      { x0: -10, y0: 163, x1: 289, y1: 196 },
      { x0: 240, y0: 138, x1: 268, y1: 170 }, // through the gate
    ],
    exits: [
      { zone: { x0: -60, y0: 0, x1: -3, y1: 240 }, to: 0, x: 314, y: 145, dir: "left" },
      { zone: { x0: 236, y0: 0, x1: 272, y1: 145 }, to: 2, x: 160, y: 228, dir: "up" },
    ],
    signs: [
      {
        zone: { x0: 46, y0: 140, x1: 77, y1: 174 },
        pages: [
          "* Originally from the Cayman Islands.",
          "* Now exploring the Underground.\n* ...I mean, Vancouver.",
        ],
      },
      {
        zone: { x0: 126, y0: 140, x1: 157, y1: 174 },
        pages: [
          "* Learns by building.",
          "* Most projects start at hackathons like nwHacks, StormHacks and HackCamp.",
          "* A weekend is enough to wire up something a little ridiculous.",
        ],
      },
    ],
  },
  // 3 — the dark room with the patch of grass in the light (Flowey's spot).
  {
    image: "room3.png",
    walk: [{ x0: 12, y0: 62, x1: 308, y1: 240 }],
    block: [
      { x0: 34, y0: 102, x1: 53, y1: 120 },
      { x0: 266, y0: 102, x1: 285, y1: 120 },
      { x0: 150, y0: 36, x1: 169, y1: 54 },
    ],
    exits: [{ zone: { x0: -60, y0: 237, x1: 400, y1: 300 }, to: 1, x: 254, y: 168, dir: "down" }],
    signs: [
      {
        zone: { x0: 28, y0: 98, x1: 59, y1: 130 },
        pages: ["* Favourite place: where hardware, AI and solid software engineering meet."],
      },
      {
        zone: { x0: 260, y0: 98, x1: 291, y1: 130 },
        pages: ["* STATS\n* YEAR 3 @ UBC.  4 HACKATHONS.\n* 8 PROJECTS.  COFFEE: ∞"],
      },
      {
        zone: { x0: 144, y0: 32, x1: 175, y1: 66 },
        pages: [
          "* (A note is pinned to the sign.)",
          "* \"Currently looking for co-op and internship roles.\"",
        ],
      },
      {
        zone: { x0: 139, y0: 106, x1: 181, y1: 138 },
        pages: ["* A patch of grass in the light.", "* For some reason, it feels like you're being watched."],
      },
    ],
  },
];

const inside = (r: Rect, x: number, y: number) => x >= r.x0 && x <= r.x1 && y >= r.y0 && y <= r.y1;
const walkable = (room: Room, x: number, y: number) =>
  [x - FOOT_HALF, x + FOOT_HALF].every(
    (fx) => room.walk.some((r) => inside(r, fx, y)) && !room.block?.some((r) => inside(r, fx, y)),
  );

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
    x: LAND_X,
    y: LAND_Y,
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
          const exit = room.exits.find((e) => inside(e.zone, g.x, g.y));
          if (exit) {
            g.room = exit.to;
            g.x = exit.x;
            g.y = exit.y;
            g.dir = exit.dir;
            g.fade = 1;
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
          const y = -20 + (LAND_Y - -20) * t * t; // accelerate like a fall
          drawFrame(friskFrames.fall[Math.floor(g.phaseTime * 10) % 4], LAND_X, y);
          if (t >= 1) {
            g.phase = "landed";
            g.phaseTime = 0;
          }
        } else if (g.phase === "landed") {
          drawFrame(friskFrames.lie[1], LAND_X, LAND_Y + 2);
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
