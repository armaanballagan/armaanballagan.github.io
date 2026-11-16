import { useCallback, useEffect, useRef, useState } from "react";
import { asgoreAudio, asset as publicAsset, playSound, silenceAllMusic, startVoice, type VoiceName } from "./audio";
import { floweyFrames, floweyOverworldFrames, type FloweyFrame, type FloweyFrameName } from "./floweyFrames";
import { flowey as floweyEvents } from "./floweyEvents";
import { friskFrames, type FriskFrame } from "./friskFrames";

/* =============================================================================
   ABOUT GAME — the About section as a tiny playable Ruins area.

   Arrow keys / WASD walk (only while the game is on screen), Z / Enter / Space
   reads the sign Frisk is facing. Three rooms: flower cave → corridor → through
   the Ruins gate into the dark grass-patch room. All coordinates are in the
   game's native 320×240 pixels.

   FLOWEY EASTER EGG: find him peeking in Save Files (FloweyPeek.tsx). He then
   waits on the grass patch in room 3; talking to him starts a short fight
   (FIGHT / AFTER_HIT below) where the arrow keys move the red SOUL.

   EDIT THE ABOUT TEXT in `ROOMS[n].signs[].pages` below.
============================================================================= */

const W = 320;
const H = 240;
const SPEED = 92; // px per second
const FOOT_HALF = 6; // half-width of Frisk's feet for collisions
const asset = (path: string) => publicAsset(`game/${path}`);

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
          "* ARMAAN BALLAGAN.\n* 3rd-year Computer Science @ UBC.\n* Class of 2029.",
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
    // Three signs along the back edge of the corridor, read left to right.
    signs: [
      {
        zone: { x0: 34, y0: 140, x1: 65, y1: 174 },
        pages: [
          "* You check the sign's INVENTORY.",
          "* 8 projects and 4 hackathon badges.",
          "* ...and an unlimited supply of coffee.",
        ],
      },
      {
        zone: { x0: 94, y0: 140, x1: 125, y1: 174 },
        pages: [
          "* Curiosity is Armaan's main stat.",
          "* Every project levels up a new skill.\n* Every hackathon is a boss fight.",
          "* Bosses fought so far: nwHacks, StormHacks and HackCamp.",
        ],
      },
      {
        zone: { x0: 154, y0: 140, x1: 185, y1: 174 },
        pages: [
          "* The sign is blank except for one line:",
          "* \"Hire me.\"",
          "* ...It's very direct.",
          "* (Small print: open to co-op and internship roles.)",
        ],
      },
    ],
  },
  // 3 — the dark room with the patch of grass in the light (Flowey's spot).
  {
    image: "room3.png",
    walk: [{ x0: 12, y0: 62, x1: 308, y1: 240 }],
    exits: [{ zone: { x0: -60, y0: 237, x1: 400, y1: 300 }, to: 1, x: 254, y: 168, dir: "down" }],
    // No signs here, just the grass patch (Flowey's spot).
    signs: [
      {
        zone: { x0: 139, y0: 106, x1: 181, y1: 138 },
        pages: ["* A patch of grass in the light.", "* For some reason, it feels like you're being watched."],
      },
    ],
  },
];

/* ── Flowey (room 3, after he's found in Save Files) ── */
const FLOWEY_ROOM = 2;
const FLOWEY_X = 160; // feet, centre of the grass patch
const FLOWEY_Y = 125;
const FLOWEY_BLOCK: Rect = { x0: 153, y0: 116, x1: 167, y1: 127 };
const FLOWEY_TALK_ZONE: Rect = { x0: 136, y0: 98, x1: 184, y1: 144 };
const FLOWEY_RISE_TIME = 0.9;

const FLOWEY_INTRO = [
  "* Howdy again! It's me, FLOWEY!",
  "* You came all the way down here just to find little old me? Golly!",
  "* Tell ya what. Let's play a little game!",
];
const FLOWEY_INTRO_PORTRAITS = ["nice", "nice", "wink"] as const;
const FLOWEY_GONE = ["* (The flower is gone.)", "* (Somewhere far away, a truck honks.)"];

/* ── The fight ── */
type Face = "nice" | "wink" | "sideUm" | "sassy" | "pissed" | "evil" | "grin" | "hurt" | "shock";
const FACE_FRAMES: Record<Face, FloweyFrameName[]> = {
  nice: ["nice0", "nice1"],
  wink: ["wink", "wink"],
  sideUm: ["sideUm0", "sideUm1"],
  sassy: ["sassy0", "sassy1"],
  pissed: ["pissed0", "pissed1"],
  evil: ["evil0", "evil1"],
  grin: ["grin0", "grin1"],
  hurt: ["hurt", "hurt"],
  shock: ["shock", "shock"],
};
type Wave = { count: number; speed: number; volleys?: number; gap?: number; spread?: number };
type Step =
  | { kind: "talk"; text: string; face: Face }
  | { kind: "wave"; wave: Wave }
  | { kind: "ring" }
  | { kind: "hurt" }
  | { kind: "asgore" }
  | { kind: "end" };

// THE ENDING: as the final ring closes in, a beer can flies in from the right
// and bonks Flowey; then Asgore's truck turns up (see ASGORE_CUES).
const ENDING: Step[] = [
  { kind: "ring" }, // ends when the beer can hits him
  { kind: "talk", face: "hurt", text: "Ow!" },
  { kind: "talk", face: "shock", text: "Huh? What's this?" },
  { kind: "asgore" },
  { kind: "end" },
];

// Each dodged wave makes him a little more annoyed. Getting hit at any point
// drops you to 1 HP and skips straight to the final ring (AFTER_HIT).
const FIGHT: Step[] = [
  { kind: "talk", face: "nice", text: "See that heart? That's your SOUL!" },
  { kind: "talk", face: "nice", text: "You can move it around with the arrows." },
  { kind: "talk", face: "nice", text: "I've got some FRIENDLINESS PELLETS for ya!" },
  { kind: "talk", face: "wink", text: "Go on, catch as many as you can!" },
  { kind: "wave", wave: { count: 5, speed: 80 } },
  { kind: "talk", face: "sideUm", text: "Hey, buddy... you missed them." },
  { kind: "talk", face: "nice", text: "Let's try that again, okay?" },
  { kind: "wave", wave: { count: 7, speed: 100 } },
  { kind: "talk", face: "sassy", text: "...Are you dodging on purpose?" },
  { kind: "wave", wave: { count: 5, speed: 115, volleys: 2, gap: 0.8 } },
  { kind: "talk", face: "pissed", text: "Quit dodging! Just RUN INTO THEM!!!" },
  { kind: "wave", wave: { count: 9, speed: 140, spread: 0.6 } },
  { kind: "talk", face: "evil", text: "...Heh. You figured it out, huh?" },
  { kind: "talk", face: "evil", text: "Then you're not going ANYWHERE." },
  ...ENDING,
];
const AFTER_HIT: Step[] = [
  { kind: "hurt" },
  { kind: "talk", face: "grin", text: "Hee hee hee..." },
  { kind: "talk", face: "grin", text: "In this portfolio, it's HIRE or be HIRED." },
  ...ENDING,
];

/* ── Asgore's entrance, timed to his song (seconds into the song file) ── */
const ASGORE_CUES = {
  songStartsAfter: 0.9, // the engine revs start first, then the song fades in under them
  fadeInOver: 1.5,
  bump: 4.0, // "Hey, that bump is shaped like a deer": screen dims, smug face cut-in
  bumpEnds: 6.3,
  dui: 7.75, // "D U I, how about you die!": the truck drives in and runs him over
  songEnd: 15.2, // just after "I'll go 100 miles an hour": song fades out (over FADE_OUT), back to the room
};
const SONG_VOLUME = 0.9; // louder than the site music on purpose
const FADE_OUT = 1.0; // seconds the song takes to fade after songEnd
const REVS_VOLUME = 1; // full volume from the first rev (the file itself is mastered loud)
const TRUCK_SPEED = 300; // px per second, driving left
const TRUCK_W = 156;
const TRUCK_H = 74;
const TRUCK_TOP = 30; // wheels sit just in front of Flowey
const FLOWEY_BASE = 98; // battle-screen Flowey stands on this line, centred at x 160
const CAN_GRAVITY = 600;

const BOX: Rect = { x0: 125, y0: 122, x1: 195, y1: 192 }; // inside of the white bullet box
const SOUL_SPEED = 78;
const SOUL_HALF = 4;
const HIT_DISTANCE = 7;
const SOUL_ROWS = [".RRR.RRR.", "RRRRRRRRR", "RRRRRRRRR", ".RRRRRRR.", "..RRRRR..", "...RRR...", "....R...."];
const TALK_HOLD = 1.5; // seconds a finished bubble stays up before moving on

type Pellet = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  spawnAt: number;
  launchAt: number;
  speed: number;
  aimOffset: number;
  launched: boolean;
  ringAngle?: number;
};

type BeerCan = { x: number; y: number; vx: number; vy: number; angle: number; spin: number; landed: boolean };

type Battle = {
  steps: Step[];
  step: number;
  t: number; // time in the current step
  soulX: number;
  soulY: number;
  pellets: Pellet[];
  hp: number;
  face: Face;
  sprite: FloweyFrameName | null; // overrides the face (laugh / sink frames)
  talkDoneAt: number | null;
  skip: boolean;
  fadeIn: number;
  fadeOut: number;
  hit: boolean;
  can: BeerCan | null;
  pelletFade: number | null; // seconds since the ring froze (pellets fade out)
  song: HTMLAudioElement | null;
  songStarted: boolean;
  floweyGone: number | null; // seconds since the truck hit him (squash, then crumble)
};

const newBattle = (): Battle => ({
  steps: FIGHT,
  step: 0,
  t: 0,
  soulX: (BOX.x0 + BOX.x1) / 2,
  soulY: (BOX.y0 + BOX.y1) / 2 + 10,
  pellets: [],
  hp: 20,
  face: "nice",
  sprite: null,
  talkDoneAt: null,
  skip: false,
  fadeIn: 1,
  fadeOut: 0,
  hit: false,
  can: null,
  pelletFade: null,
  song: null,
  songStarted: false,
  floweyGone: null,
});

function spawnWave(wave: Wave): Pellet[] {
  const pellets: Pellet[] = [];
  const volleys = wave.volleys ?? 1;
  for (let v = 0; v < volleys; v++) {
    for (let i = 0; i < wave.count; i++) {
      const angle = Math.PI * (1.1 + (0.8 * i) / Math.max(1, wave.count - 1));
      const spawnAt = v * (wave.gap ?? 0) * 1.6;
      pellets.push({
        x: 160 + 46 * Math.cos(angle),
        y: 64 + 30 * Math.sin(angle),
        vx: 0,
        vy: 0,
        spawnAt,
        launchAt: spawnAt + 0.9,
        speed: wave.speed,
        aimOffset: (wave.spread ?? 0) * (i / Math.max(1, wave.count - 1) - 0.5),
        launched: false,
      });
    }
  }
  return pellets;
}

function spawnRing(): Pellet[] {
  return Array.from({ length: 20 }, (_, i) => ({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    spawnAt: 0,
    launchAt: 0,
    speed: 0,
    aimOffset: 0,
    launched: true,
    ringAngle: (i / 20) * Math.PI * 2,
  }));
}

const inside = (r: Rect, x: number, y: number) => x >= r.x0 && x <= r.x1 && y >= r.y0 && y <= r.y1;
const walkable = (room: Room, x: number, y: number, extraBlocks: Rect[] = []) =>
  [x - FOOT_HALF, x + FOOT_HALF].every(
    (fx) =>
      room.walk.some((r) => inside(r, fx, y)) &&
      !room.block?.some((r) => inside(r, fx, y)) &&
      !extraBlocks.some((r) => inside(r, fx, y)),
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
type FloweyState = "absent" | "waiting" | "rising" | "present";
type Dialog = {
  pages: string[];
  page: number;
  voice: VoiceName;
  portraits?: readonly string[];
  onDone?: () => void;
};

export function AboutGame() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [typed, setTyped] = useState(0);
  const [bubble, setBubble] = useState<string | null>(null);
  const [bubbleTyped, setBubbleTyped] = useState(0);
  const [inBattle, setInBattle] = useState(false);
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
    active: false, // game on screen → keyboard controls the game
    fade: 0,
    flowey: "absent" as FloweyState,
    floweyTime: 0,
    battle: null as Battle | null,
  });
  if (import.meta.env.DEV) (window as unknown as { __aboutGame: unknown }).__aboutGame = game.current;
  const dialogRef = useRef(dialog);
  dialogRef.current = dialog;
  const typedRef = useRef(typed);
  typedRef.current = typed;
  const bubbleRef = useRef(bubble);
  bubbleRef.current = bubble;
  const bubbleTypedRef = useRef(bubbleTyped);
  bubbleTypedRef.current = bubbleTyped;

  const currentText = dialog ? dialog.pages[dialog.page] : "";
  const typingDone = typed >= currentText.length;
  const bubbleDone = bubble !== null && bubbleTyped >= bubble.length;

  /* ── Dialogue typing (uses the site's voices + mute button) ── */
  useEffect(() => {
    if (!dialog || typingDone) return;
    const stop = startVoice(dialog.voice);
    const timer = window.setInterval(() => setTyped((count) => count + 1), dialog.voice === "flowey" ? 36 : 28);
    return () => {
      window.clearInterval(timer);
      stop();
    };
  }, [dialog, typingDone]);

  useEffect(() => {
    if (bubble === null || bubbleDone) return;
    const stop = startVoice("flowey");
    const timer = window.setInterval(() => setBubbleTyped((count) => count + 1), 34);
    return () => {
      window.clearInterval(timer);
      stop();
    };
  }, [bubble, bubbleDone]);

  const advanceDialog = useCallback(() => {
    const current = dialogRef.current;
    if (!current) return;
    const text = current.pages[current.page];
    if (typedRef.current < text.length) {
      setTyped(text.length); // finish the line instantly
    } else if (current.page < current.pages.length - 1) {
      setDialog({ ...current, page: current.page + 1 });
      setTyped(0);
    } else {
      setDialog(null);
      current.onDone?.();
    }
  }, []);

  const openDialog = useCallback((next: Omit<Dialog, "page">) => {
    game.current.held.clear();
    setDialog({ ...next, page: 0 });
    setTyped(0);
  }, []);

  const startBattle = useCallback(() => {
    const g = game.current;
    g.battle = newBattle();
    g.held.clear();
    setInBattle(true);
  }, []);

  const interact = useCallback(() => {
    const g = game.current;
    if (g.phase !== "play") return;
    if (dialogRef.current) {
      advanceDialog();
      return;
    }
    const b = g.battle;
    if (b) {
      // Z during the fight: finish / skip Flowey's speech bubble.
      const text = bubbleRef.current;
      if (text !== null) {
        if (bubbleTypedRef.current < text.length) setBubbleTyped(text.length);
        else b.skip = true;
      }
      return;
    }
    const reach = 14;
    const probe = {
      up: [g.x, g.y - reach],
      down: [g.x, g.y + reach],
      left: [g.x - reach, g.y - 4],
      right: [g.x + reach, g.y - 4],
    }[g.dir];
    const near = (zone: Rect) => inside(zone, probe[0], probe[1]) || inside(zone, g.x, g.y - 6);

    if (g.room === FLOWEY_ROOM && g.flowey === "present" && near(FLOWEY_TALK_ZONE)) {
      openDialog({
        pages: FLOWEY_INTRO,
        voice: "flowey",
        portraits: FLOWEY_INTRO_PORTRAITS.map((name) => asset(name === "wink" ? "flowey-portrait-wink.png" : "flowey-portrait.png")),
        onDone: startBattle,
      });
      return;
    }
    const sign = ROOMS[g.room].signs.find((s) => near(s.zone));
    if (sign) openDialog({ pages: sign.pages, voice: "typewriter" });
  }, [advanceDialog, openDialog, startBattle]);

  /* ── Flowey found in Save Files → he waits on the grass patch ── */
  useEffect(
    () =>
      floweyEvents.onFound(() => {
        const g = game.current;
        if (g.flowey === "absent") g.flowey = "waiting";
      }),
    [],
  );

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

  /* ── Is the game on screen? Measured on the canvas itself (the section is
        much taller than the game, so a ratio of the whole section was
        unreliable). Starts the fall the first time. ── */
  const activate = useCallback(() => {
    const g = game.current;
    g.active = true;
    if (g.phase === "waiting") {
      g.phase = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "play" : "falling";
      g.phaseTime = 0;
    }
  }, []);

  useEffect(() => {
    let frame = 0;
    const check = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const viewport = window.innerHeight;
      const visible = Math.max(0, Math.min(rect.bottom, viewport) - Math.max(rect.top, 0));
      const onScreen = rect.height > 0 && visible >= Math.min(rect.height, viewport) * 0.55;
      if (onScreen) activate();
      else {
        game.current.active = false;
        game.current.held.clear();
      }
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const interval = window.setInterval(check, 500); // catches smooth scrolls / layout shifts
    return () => {
      cancelAnimationFrame(frame);
      window.clearInterval(interval);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [activate]);

  /* ── Game loop ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const load = (path: string) => {
      const img = new Image();
      img.src = asset(path);
      return img;
    };
    const rooms = ROOMS.map((room) => load(room.image));
    const frisk = load("frisk.png");
    const floweyOverworld = load("flowey-overworld.png");
    const floweyBattle = load("flowey-battle.png");
    const truck = load("truck.png");
    const beerCan = load("beer-can.png");
    const smugAsgore = load("asgore-smug.jpg");

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
    const drawBattleSprite = (frame: FloweyFrame, centerX: number, bottomY: number) => {
      ctx.drawImage(
        floweyBattle,
        frame.x,
        frame.y,
        frame.w,
        frame.h,
        Math.round(centerX - frame.w / 2),
        Math.round(bottomY - frame.h),
        frame.w,
        frame.h,
      );
    };
    const drawOverworldFlowey = (g: typeof game.current) => {
      if (!floweyOverworld.complete) return;
      const f = floweyOverworldFrames;
      let frame: FloweyFrame;
      if (g.flowey === "rising") {
        // The sheet's sink frames, played backwards, pop him up out of the ground.
        const sink = [f.sink0, f.sink1, f.sink2, f.sink3, f.sink4];
        frame = sink[Math.max(0, 4 - Math.floor((g.floweyTime / FLOWEY_RISE_TIME) * 5))];
      } else {
        const talk = dialogRef.current;
        const talking = talk?.voice === "flowey" && typedRef.current < talk.pages[talk.page].length;
        frame = talking && Math.floor(performance.now() / 130) % 2 ? f.talk1 : f.talk0;
      }
      ctx.drawImage(
        floweyOverworld,
        frame.x,
        frame.y,
        frame.w,
        frame.h,
        Math.round(FLOWEY_X - frame.w / 2),
        FLOWEY_Y - frame.h + 1,
        frame.w,
        frame.h,
      );
    };
    const drawSoul = (x: number, y: number) => {
      ctx.fillStyle = "#ff0000";
      const ox = Math.round(x) - 4;
      const oy = Math.round(y) - 3;
      SOUL_ROWS.forEach((row, ry) => {
        for (let rx = 0; rx < row.length; rx++) if (row[rx] === "R") ctx.fillRect(ox + rx, oy + ry, 1, 1);
      });
    };

    const enterStep = (b: Battle) => {
      b.t = 0;
      b.talkDoneAt = null;
      b.skip = false;
      const step = b.steps[b.step];
      if (!step) return;
      if (step.kind === "talk") {
        b.face = step.face;
        b.sprite = null;
        setBubble(step.text);
        setBubbleTyped(0);
      } else {
        setBubble(null);
      }
      if (step.kind === "wave") b.pellets = spawnWave(step.wave);
      if (step.kind === "ring") {
        b.face = "evil";
        b.pellets = spawnRing();
        b.pelletFade = null;
      }
      if (step.kind === "hurt") {
        b.pellets = [];
        b.face = "grin";
        playSound("soulHurt");
      }
      if (step.kind === "asgore") {
        // Every other piece of music stops; nothing restarts until the visitor presses play.
        silenceAllMusic();
        const revs = new Audio(asgoreAudio.revs);
        revs.volume = REVS_VOLUME;
        revs.play().catch(() => {});
        const song = new Audio(asgoreAudio.song);
        song.volume = 0;
        song.preload = "auto";
        b.song = song;
        b.songStarted = false;
      }
    };
    const nextStep = (b: Battle) => {
      b.step += 1;
      enterStep(b);
    };
    const finishBattle = () => {
      const g = game.current;
      g.battle?.song?.pause();
      g.battle = null;
      g.flowey = "absent"; // gone for the rest of this visit (no Save Files peek either)
      g.fade = 1;
      g.dir = "down";
      setBubble(null);
      setInBattle(false);
      openDialog({ pages: FLOWEY_GONE, voice: "typewriter" });
    };

    /** Where the song is, in seconds (falls back to the step clock if playback was blocked). */
    const songTime = (b: Battle) => {
      if (b.song && b.songStarted && !b.song.paused) return b.song.currentTime;
      return Math.max(0, b.t - ASGORE_CUES.songStartsAfter);
    };
    const truckX = (b: Battle) => W + 4 - (songTime(b) - ASGORE_CUES.dui) * TRUCK_SPEED; // left edge

    const updateBattle = (b: Battle, dt: number, g: typeof game.current) => {
      if (b.t === 0 && b.step === 0 && b.fadeIn === 1) enterStep(b);
      b.t += dt;
      b.fadeIn = Math.max(0, b.fadeIn - dt * 2.5);

      // SOUL movement (allowed while he talks, like the real game)
      if (b.steps[b.step]?.kind !== "hurt") {
        let dx = 0;
        let dy = 0;
        if (g.held.has("left")) dx -= 1;
        if (g.held.has("right")) dx += 1;
        if (g.held.has("up")) dy -= 1;
        if (g.held.has("down")) dy += 1;
        const step = SOUL_SPEED * dt * (dx && dy ? Math.SQRT1_2 : 1);
        b.soulX = Math.min(BOX.x1 - SOUL_HALF, Math.max(BOX.x0 + SOUL_HALF, b.soulX + dx * step));
        b.soulY = Math.min(BOX.y1 - SOUL_HALF, Math.max(BOX.y0 + SOUL_HALF, b.soulY + dy * step));
      }

      const step = b.steps[b.step];
      if (!step) return;

      // The beer can: flies in, bonks Flowey, drops and bounces in front of him.
      const can = b.can;
      if (can) {
        can.vy += CAN_GRAVITY * dt;
        can.x += can.vx * dt;
        can.y += can.vy * dt;
        can.angle += can.spin * dt;
        if (!can.landed && can.vx < 0 && can.x <= 176) {
          // hit him on the head
          playSound("canClink");
          can.vx = 18; // pops up off his head and drops right in front of him
          can.vy = -130;
          can.spin = 6;
          can.landed = true; // from now on it only falls and bounces
          b.pelletFade = 0;
          if (step.kind === "ring") nextStep(b); // "Ow!"
        }
        const floor = 112;
        if (can.landed && can.y > floor) {
          can.y = floor;
          if (Math.abs(can.vy) > 40) {
            can.vy = -can.vy * 0.35;
            can.vx *= 0.5;
            can.spin *= 0.4;
            playSound("canClink");
          } else {
            can.vy = 0;
            can.vx = 0;
            can.spin = 0;
            can.angle = Math.PI / 2; // lying on its side
          }
        }
      }
      if (b.pelletFade !== null) {
        b.pelletFade += dt;
        if (b.pelletFade > 0.8) b.pellets = [];
      }

      // Pellets
      if (step.kind === "wave" || step.kind === "ring") {
        const ringRadius = 64 - 17 * b.t;
        for (const p of b.pellets) {
          if (b.t < p.spawnAt) continue;
          if (p.ringAngle !== undefined) {
            const angle = p.ringAngle + b.t * 0.7;
            p.x = (BOX.x0 + BOX.x1) / 2 + Math.cos(angle) * Math.max(0, ringRadius);
            p.y = (BOX.y0 + BOX.y1) / 2 + Math.sin(angle) * Math.max(0, ringRadius);
          } else if (!p.launched) {
            if (b.t >= p.launchAt) {
              const aim = Math.atan2(b.soulY - p.y, b.soulX - p.x) + p.aimOffset;
              p.vx = Math.cos(aim) * p.speed;
              p.vy = Math.sin(aim) * p.speed;
              p.launched = true;
            }
          } else {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
          }
          // The final ring is all threat: Asgore's can always gets there first.
          if (step.kind === "wave" && Math.hypot(p.x - b.soulX, p.y - b.soulY) < HIT_DISTANCE) b.hit = true;
        }
        if (step.kind === "ring" && !b.can && b.t > 0.6) {
          b.can = { x: W + 12, y: 30, vx: -285, vy: -100, angle: 0, spin: -14, landed: false };
        }
        if (b.hit) {
          b.hit = false;
          b.steps = AFTER_HIT;
          b.step = 0;
          enterStep(b);
          return;
        }
        const offscreen = (p: Pellet) => p.x < -20 || p.x > W + 20 || p.y < -20 || p.y > H + 20;
        if (step.kind === "wave" && b.pellets.every((p) => p.launched && offscreen(p))) {
          b.pellets = [];
          nextStep(b);
        }
        return;
      }

      if (step.kind === "talk") {
        // (bubbleRef lags one render behind setBubble, so match the text first)
        if (bubbleRef.current === step.text && bubbleTypedRef.current >= step.text.length) {
          b.talkDoneAt ??= b.t;
          if (b.skip || b.t - b.talkDoneAt > TALK_HOLD) nextStep(b);
        }
      } else if (step.kind === "hurt") {
        b.hp = Math.max(1, Math.round(20 - 19 * Math.min(1, b.t / 0.5)));
        if (b.t > 1.1) nextStep(b);
      } else if (step.kind === "asgore") {
        b.face = "shock"; // blinded by the headlights
        const song = b.song;
        if (song && !b.songStarted && b.t >= ASGORE_CUES.songStartsAfter) {
          b.songStarted = true;
          song.play().catch(() => {});
        }
        const st = songTime(b);
        if (song && b.songStarted) {
          const fadeIn = Math.min(1, st / ASGORE_CUES.fadeInOver);
          const fadeOut = Math.min(1, Math.max(0, (ASGORE_CUES.songEnd + FADE_OUT - st) / FADE_OUT));
          song.volume = SONG_VOLUME * (0.15 + 0.85 * fadeIn) * fadeOut;
        }
        // squashed the moment the truck's front reaches him, then he crumbles
        if (b.floweyGone === null && st >= ASGORE_CUES.dui && truckX(b) <= 172) b.floweyGone = 0;
        if (b.floweyGone !== null) b.floweyGone += dt;
        if (st >= ASGORE_CUES.songEnd + FADE_OUT) {
          song?.pause();
          nextStep(b);
        }
      } else if (step.kind === "end") {
        b.fadeOut = Math.min(1, b.t / 0.5);
        if (b.t > 0.6) finishBattle();
      }
    };

    const drawBattle = (b: Battle) => {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, H);
      const step = b.steps[b.step];
      const shake = step?.kind === "hurt" && b.t < 0.4 ? Math.round(Math.sin(b.t * 80) * 2) : 0;

      const asgoreScene = step?.kind === "asgore";
      const st = asgoreScene ? songTime(b) : 0;

      // Flowey (squashed flat by the truck, then crumbling to dust)
      if (floweyBattle.complete) {
        if (b.floweyGone === null) {
          let name: FloweyFrameName | null = b.sprite;
          if (!name) {
            const talking = step?.kind === "talk" && bubbleTypedRef.current < (bubbleRef.current ?? "").length;
            name = FACE_FRAMES[b.face][talking ? Math.floor(b.t * 8) % 2 : 0];
          }
          drawBattleSprite(floweyFrames[name], 160 + shake, FLOWEY_BASE);
        } else if (b.floweyGone < 0.35) {
          const f = floweyFrames.hurt;
          const h = Math.max(4, Math.round(f.h * 0.22));
          ctx.drawImage(floweyBattle, f.x, f.y, f.w, f.h, 160 - Math.round(f.w * 0.65), FLOWEY_BASE - h, Math.round(f.w * 1.3), h);
        } else {
          const frame = Math.floor((b.floweyGone - 0.35) * 9);
          if (frame < 8) drawBattleSprite(floweyFrames[`dust${frame}` as FloweyFrameName], 160, FLOWEY_BASE);
        }
      }

      // Beer can
      if (b.can && beerCan.complete) {
        ctx.save();
        ctx.translate(Math.round(b.can.x), Math.round(b.can.y));
        ctx.rotate(b.can.angle);
        ctx.drawImage(beerCan, -Math.round(beerCan.width / 2), -Math.round(beerCan.height / 2));
        ctx.restore();
      }

      // Bullet box
      ctx.fillStyle = "#fff";
      ctx.fillRect(BOX.x0 - 3 + shake, BOX.y0 - 3, BOX.x1 - BOX.x0 + 6, 2);
      ctx.fillRect(BOX.x0 - 3 + shake, BOX.y1 + 1, BOX.x1 - BOX.x0 + 6, 2);
      ctx.fillRect(BOX.x0 - 3 + shake, BOX.y0 - 3, 2, BOX.y1 - BOX.y0 + 6);
      ctx.fillRect(BOX.x1 + 1 + shake, BOX.y0 - 3, 2, BOX.y1 - BOX.y0 + 6);

      // Pellets (fade out once the can freezes the ring)
      if (floweyBattle.complete) {
        ctx.globalAlpha = b.pelletFade === null ? 1 : Math.max(0, 1 - b.pelletFade / 0.8);
        for (const p of b.pellets) {
          if (b.t < p.spawnAt) continue;
          const spin = Math.floor((b.t + p.spawnAt) * 10) % 2 ? floweyFrames.pellet1 : floweyFrames.pellet0;
          ctx.drawImage(floweyBattle, spin.x, spin.y, spin.w, spin.h, Math.round(p.x - 6), Math.round(p.y - 6), spin.w, spin.h);
        }
        ctx.globalAlpha = 1;
      }

      // SOUL (blinks after being hit)
      const blinking = step?.kind === "hurt" && Math.floor(b.t * 14) % 2 === 1;
      if (!blinking && step?.kind !== "end") drawSoul(b.soulX + shake, b.soulY);

      // Stats line
      ctx.font = "8px 'Press Start 2P', monospace";
      ctx.textBaseline = "top";
      ctx.fillStyle = "#fff";
      ctx.fillText("FRISK   LV 1", 32, 210);
      ctx.fillText("HP", 158, 210);
      ctx.fillStyle = "#c00";
      ctx.fillRect(180, 209, 24, 10);
      ctx.fillStyle = "#ff0";
      ctx.fillRect(180, 209, Math.round((24 * b.hp) / 20), 10);
      ctx.fillStyle = "#fff";
      ctx.fillText(`${String(b.hp).padStart(2, " ")} / 20`, 212, 210);

      if (asgoreScene) {
        const tx = truckX(b);
        const truckOn = st >= ASGORE_CUES.dui && tx > -TRUCK_W - 4;
        const overFlowey = tx < 176 && tx + TRUCK_W > 144;
        const bumpY = overFlowey && b.floweyGone !== null && b.floweyGone < 0.25 ? -3 : 0;

        // Headlights: off-screen to the right at first, growing brighter on Flowey
        // (squared ramp), then riding along with the truck until it's gone.
        const lightOn = Math.min(1, b.t / 5);
        const intensity = truckOn ? 1 : st < ASGORE_CUES.dui ? lightOn * lightOn : 0;
        if (intensity > 0) {
          const ox = truckOn ? tx + 2 : W + 6;
          const oy = TRUCK_TOP + 38 + bumpY;
          ctx.save();
          ctx.globalCompositeOperation = "lighter";
          const beam = ctx.createLinearGradient(ox, oy, ox - 260, oy);
          beam.addColorStop(0, `rgba(255,248,200,${0.55 * intensity})`);
          beam.addColorStop(1, "rgba(255,248,200,0)");
          ctx.fillStyle = beam;
          ctx.beginPath();
          ctx.moveTo(ox, oy - 4);
          ctx.lineTo(ox - 260, oy - 60);
          ctx.lineTo(ox - 260, oy + 75);
          ctx.lineTo(ox, oy + 4);
          ctx.closePath();
          ctx.fill();
          if (!truckOn) {
            const glow = ctx.createRadialGradient(160, 76, 4, 160, 76, 58);
            glow.addColorStop(0, `rgba(255,255,230,${0.45 * intensity})`);
            glow.addColorStop(1, "rgba(255,255,230,0)");
            ctx.fillStyle = glow;
            ctx.fillRect(80, 10, 160, 140);
          }
          ctx.restore();
        }

        if (truckOn && truck.complete) ctx.drawImage(truck, Math.round(tx), TRUCK_TOP + bumpY);

        // "Hey, that bump is shaped like a deer": everything dims, smug Asgore cut-in
        const inBump = st >= ASGORE_CUES.bump && st < ASGORE_CUES.bumpEnds;
        const dimIn = Math.min(1, Math.max(0, (st - ASGORE_CUES.bump) / 0.3));
        const dimOut = Math.min(1, Math.max(0, (ASGORE_CUES.bumpEnds - st) / 0.4));
        const dim = inBump ? 0.72 * Math.min(dimIn, dimOut) : 0;
        if (dim > 0) {
          ctx.fillStyle = `rgba(0,0,0,${dim})`;
          ctx.fillRect(0, 0, W, H);
          if (smugAsgore.complete) {
            const slideIn = Math.min(1, (st - ASGORE_CUES.bump - 0.05) / 0.25);
            const slideOut = Math.min(1, Math.max(0, (ASGORE_CUES.bumpEnds - 0.3 - st) / 0.25));
            const shown = Math.max(0, Math.min(slideIn, slideOut));
            const size = 96;
            const x = Math.round(W + 6 - (W + 6 - 196) * (1 - (1 - shown) * (1 - shown)));
            const y = 34;
            ctx.fillStyle = "#fff";
            ctx.fillRect(x - 3, y - 3, size + 6, size + 6);
            ctx.imageSmoothingEnabled = true;
            ctx.drawImage(smugAsgore, x, y, size, size);
            ctx.imageSmoothingEnabled = false;
          }
        }
      }

      const cover = Math.max(b.fadeIn, b.fadeOut);
      if (cover > 0) {
        ctx.fillStyle = `rgba(0,0,0,${cover})`;
        ctx.fillRect(0, 0, W, H);
      }
    };

    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const g = game.current;
      g.phaseTime += dt;

      ctx.imageSmoothingEnabled = false;

      if (g.battle) {
        updateBattle(g.battle, dt, g);
        if (g.battle) {
          drawBattle(g.battle);
          raf = requestAnimationFrame(tick);
          return;
        }
      }

      // Flowey pops up once Frisk is in his room
      if (g.flowey === "waiting" && g.room === FLOWEY_ROOM && g.phase === "play") {
        g.flowey = "rising";
        g.floweyTime = 0;
      }
      if (g.flowey === "rising") {
        g.floweyTime += dt;
        if (g.floweyTime >= FLOWEY_RISE_TIME) g.flowey = "present";
      }
      const floweyHere = g.room === FLOWEY_ROOM && (g.flowey === "rising" || g.flowey === "present");
      const extraBlocks = floweyHere ? [FLOWEY_BLOCK] : [];

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
          if (walkable(room, nx, g.y, extraBlocks)) g.x = nx;
          const ny = g.y + dy * step;
          if (walkable(room, g.x, ny, extraBlocks)) g.y = ny;
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
      } else {
        g.moving = false;
      }

      // Draw room
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, H);
      const roomImg = rooms[g.room];
      if (roomImg.complete) ctx.drawImage(roomImg, 0, 0);

      // Draw Flowey and Frisk, back to front
      const drawFrisk = () => {
        if (!frisk.complete || g.phase === "waiting") return;
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
      };
      if (floweyHere && g.y > FLOWEY_Y) {
        drawOverworldFlowey(g);
        drawFrisk();
      } else {
        drawFrisk();
        if (floweyHere) drawOverworldFlowey(g);
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
  }, [openDialog]);

  /* ── Touch controls ── */
  const press = (dir: Dir) => () => {
    if (!dialogRef.current) game.current.held.add(dir);
  };
  const release = (dir: Dir) => () => game.current.held.delete(dir);
  const pad = (dir: Dir, label: string, extra: string) => (
    <button
      type="button"
      aria-label={`Move ${dir}`}
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
  const portrait = dialog?.portraits?.[dialog.page];

  return (
    <section
      ref={sectionRef}
      id="about"
      className="scroll-mt-20 border-b-4 border-white bg-[#070707] px-5 py-24 md:px-8 lg:py-32"
    >
      <div className="@container mx-auto max-w-[896px]">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-5 text-[10px] tracking-widest text-[#00eaff]">AREA 01 / ABOUT</p>
            {/* On tablets/computers, sized so "CS STUDENT BY DAY." (18 pixel-font characters, each 1em wide)
                fits on one line next to the controls hint (up to 20rem + gap). */}
            <h2 className="text-4xl leading-tight sm:text-[min(3.75rem,calc((100cqi_-_22rem)/19))]">
              CS STUDENT BY DAY.
              <span className="mt-3 block text-[#00eaff]">MAKER AT HEART.</span>
            </h2>
          </div>
          <p className="max-w-xs text-[9px] leading-loose text-white/50">
            {inBattle
              ? "MOVE THE HEART TO DODGE. DON'T TRUST THE FLOWER."
              : isTouch
                ? "USE THE PAD TO WALK. TAP A TO READ."
                : "ARROWS / WASD TO WALK. Z / ENTER TO READ."}
            <br />
            READ THE SIGNS TO LEARN ABOUT ME.
          </p>
        </div>

        {/* Text version for screen readers and search engines. */}
        <div className="sr-only">
          <p>I'm Armaan Ballagan, a 3rd-year computer science student at UBC (class of 2029).</p>
          <p>I like building where hardware, AI and software meet: motion controllers, sign-language apps, AI voice changers.</p>
          <p>I learn by building. Most of my projects start at hackathons like nwHacks, StormHacks and HackCamp.</p>
          <p>Year 3 at UBC, 4 hackathons, 8 projects. Currently looking for co-op and internship roles.</p>
        </div>

        <div
          className="relative mx-auto w-full max-w-[672px] border-4 border-white bg-black"
          style={{ maxWidth: "min(672px, calc((100svh - 8rem) * 4 / 3))" }}
          aria-hidden="true"
        >
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            className="block aspect-[4/3] h-auto w-full"
            style={{ imageRendering: "pixelated" }}
            onPointerDown={activate}
            onClick={interact}
          />
          {dialog && (
            <div
              className={`game-dialog absolute inset-x-[4%] ${portrait ? "has-portrait" : ""} ${dialogAtTop ? "top-[5%]" : "bottom-[5%]"}`}
              onClick={advanceDialog}
            >
              {portrait && <img src={portrait} alt="" />}
              <p className="whitespace-pre-line">{currentText.slice(0, typed)}</p>
              {typingDone && <span className="dialog-caret">▼</span>}
            </div>
          )}
          {inBattle && bubble !== null && (
            <div className="flowey-bubble">
              <p>{bubble.slice(0, bubbleTyped)}</p>
            </div>
          )}
        </div>

        {isTouch && (
          <div className="mx-auto mt-6 flex max-w-[672px] items-center justify-between" aria-hidden="true">
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
