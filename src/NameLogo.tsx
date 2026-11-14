/**
 * Pixel wordmark for the hero title: chunky white block letters with a few
 * crumbly grey pixels on the edges. Drawn as SVG so it stays razor-sharp at
 * any size. Edit the glyphs below to tweak letter shapes.
 *
 * "#" = white pixel, "." = empty. Every glyph is 7 wide x 8 tall.
 */
const GLYPHS: Record<string, string[]> = {
  A: [".#####.", "##...##", "##...##", "##...##", "#######", "##...##", "##...##", "##...##"],
  R: ["######.", "##...##", "##...##", "######.", "##.##..", "##..##.", "##...##", "##...##"],
  M: ["##...##", "###.###", "#######", "##.#.##", "##...##", "##...##", "##...##", "##...##"],
  N: ["##...##", "###..##", "####.##", "##.####", "##..###", "##...##", "##...##", "##...##"],
  B: ["######.", "##...##", "##...##", "######.", "##...##", "##...##", "##...##", "######."],
  L: ["##.....", "##.....", "##.....", "##.....", "##.....", "##.....", "##.....", "#######"],
  G: [".#####.", "##...##", "##.....", "##.....", "##.####", "##...##", "##...##", ".#####."],
};

const LINES = ["ARMAAN", "BALLAGAN"];
const GLYPH_W = 7;
const GLYPH_H = 8;
const LETTER_GAP = 1;
const LINE_GAP = 3;

/** Small deterministic random generator so the "crumble" is identical every load. */
function seeded(seed: number) {
  let value = seed;
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
}

type Pixel = { x: number; y: number; fill: string };

function buildPixels() {
  const random = seeded(20261114);
  const pixels: Pixel[] = [];
  let width = 0;

  LINES.forEach((line, lineIndex) => {
    const top = lineIndex * (GLYPH_H + LINE_GAP);
    [...line].forEach((letter, letterIndex) => {
      const glyph = GLYPHS[letter];
      const left = letterIndex * (GLYPH_W + LETTER_GAP);
      glyph.forEach((row, y) => {
        [...row].forEach((cell, x) => {
          if (cell !== "#") return;
          const filled = (dx: number, dy: number) => glyph[y + dy]?.[x + dx] === "#";
          const onEdge = !filled(1, 0) || !filled(-1, 0) || !filled(0, 1) || !filled(0, -1);
          // Crumble: some edge pixels turn grey.
          const roll = random();
          const fill = onEdge && roll < 0.1 ? "#8a8a8a" : onEdge && roll < 0.16 ? "#c8c8c8" : "#ffffff";
          pixels.push({ x: left + x, y: top + y, fill });
        });
      });
      width = Math.max(width, left + GLYPH_W);
    });
  });

  const height = LINES.length * GLYPH_H + (LINES.length - 1) * LINE_GAP;
  return { pixels, width, height };
}

const { pixels, width, height } = buildPixels();

export function NameLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox={`0 0 ${width} ${height}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      {pixels.map((pixel) => (
        <rect
          key={`${pixel.x}-${pixel.y}`}
          x={pixel.x}
          y={pixel.y}
          width={1.02}
          height={1.02}
          fill={pixel.fill}
        />
      ))}
    </svg>
  );
}
