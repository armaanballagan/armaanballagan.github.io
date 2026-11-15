// Frame rects in public/game/frisk.png (cut from the Frisk overworld sheet).
export type FriskFrame = { x: number; y: number; w: number; h: number };

export const friskFrames = {
  down: [{ x: 0, y: 0, w: 19, h: 29 }, { x: 20, y: 0, w: 19, h: 29 }, { x: 40, y: 0, w: 19, h: 29 }, { x: 60, y: 0, w: 19, h: 29 }],
  up: [{ x: 244, y: 0, w: 19, h: 29 }, { x: 264, y: 0, w: 19, h: 29 }, { x: 284, y: 0, w: 19, h: 29 }, { x: 304, y: 0, w: 19, h: 29 }],
  left: [{ x: 100, y: 0, w: 17, h: 29 }, { x: 118, y: 1, w: 17, h: 28 }],
  right: [{ x: 136, y: 0, w: 17, h: 29 }, { x: 154, y: 1, w: 17, h: 28 }],
  fall: [{ x: 344, y: 0, w: 19, h: 29 }, { x: 364, y: 0, w: 19, h: 29 }, { x: 384, y: 0, w: 19, h: 29 }, { x: 404, y: 0, w: 19, h: 29 }],
  lie: [{ x: 424, y: 10, w: 29, h: 19 }, { x: 454, y: 12, w: 29, h: 17 }, { x: 484, y: 12, w: 29, h: 17 }],
} satisfies Record<string, FriskFrame[]>;
