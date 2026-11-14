// Generated from the Monster Kid sprite sheet: frame rects in public/undertale/monster-kid.png
// x = left edge in the strip; w/h = cell size; bx0/bx1/by1 = sprite's left/right/bottom inside the cell.
export type MkFrame = { x: number; w: number; h: number; bx0: number; bx1: number; by1: number };

export const mkFrames = {
  walkRight: [
    { x: 0, w: 22, h: 29, bx0: 0, bx1: 19, by1: 27 },
    { x: 23, w: 22, h: 29, bx0: 0, bx1: 19, by1: 27 },
    { x: 46, w: 22, h: 29, bx0: 0, bx1: 19, by1: 27 },
    { x: 69, w: 22, h: 29, bx0: 0, bx1: 19, by1: 27 },
  ],
  walkLeft: [
    { x: 92, w: 22, h: 29, bx0: 2, bx1: 21, by1: 27 },
    { x: 115, w: 22, h: 29, bx0: 2, bx1: 21, by1: 27 },
    { x: 138, w: 22, h: 29, bx0: 2, bx1: 21, by1: 27 },
    { x: 161, w: 22, h: 29, bx0: 2, bx1: 21, by1: 27 },
  ],
  walkDown: [
    { x: 184, w: 22, h: 29, bx0: 0, bx1: 20, by1: 27 },
    { x: 207, w: 22, h: 29, bx0: 0, bx1: 20, by1: 28 },
    { x: 230, w: 22, h: 29, bx0: 0, bx1: 20, by1: 27 },
    { x: 253, w: 22, h: 29, bx0: 0, bx1: 20, by1: 28 },
  ],
  tripLeft: [
    { x: 276, w: 48, h: 28, bx0: 26, bx1: 45, by1: 26 },
    { x: 325, w: 48, h: 28, bx0: 20, bx1: 40, by1: 26 },
    { x: 374, w: 48, h: 28, bx0: 6, bx1: 34, by1: 26 },
    { x: 423, w: 48, h: 28, bx0: 3, bx1: 31, by1: 26 },
    { x: 472, w: 48, h: 28, bx0: 2, bx1: 30, by1: 26 },
    { x: 521, w: 48, h: 28, bx0: 2, bx1: 31, by1: 26 },
    { x: 570, w: 48, h: 28, bx0: 2, bx1: 32, by1: 26 },
    { x: 619, w: 48, h: 28, bx0: 2, bx1: 31, by1: 26 },
    { x: 668, w: 48, h: 28, bx0: 2, bx1: 31, by1: 26 },
    { x: 717, w: 48, h: 28, bx0: 1, bx1: 30, by1: 26 },
    { x: 766, w: 48, h: 28, bx0: 2, bx1: 31, by1: 26 },
    { x: 815, w: 48, h: 28, bx0: 1, bx1: 30, by1: 26 },
    { x: 864, w: 48, h: 28, bx0: 2, bx1: 31, by1: 26 },
    { x: 913, w: 48, h: 28, bx0: 1, bx1: 30, by1: 26 },
    { x: 962, w: 48, h: 28, bx0: 19, bx1: 40, by1: 25 },
    { x: 1011, w: 48, h: 28, bx0: 15, bx1: 40, by1: 24 },
    { x: 1060, w: 48, h: 28, bx0: 14, bx1: 33, by1: 26 },
    { x: 1109, w: 48, h: 28, bx0: 12, bx1: 31, by1: 26 },
    { x: 1158, w: 48, h: 28, bx0: 16, bx1: 35, by1: 26 },
    { x: 1207, w: 48, h: 28, bx0: 15, bx1: 34, by1: 26 },
  ],
  runLeft: [
    { x: 1256, w: 48, h: 28, bx0: 26, bx1: 45, by1: 26 },
    { x: 1305, w: 48, h: 28, bx0: 27, bx1: 47, by1: 26 },
  ],
} satisfies Record<string, MkFrame[]>;
