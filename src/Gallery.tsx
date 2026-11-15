import { useEffect, useMemo, useRef, useState } from "react";
import { gallery, galleryImage, type GalleryPhoto } from "./gallery";
import { Typewriter } from "./Typewriter";

/* Photos are laid out in rows, in order. Each row is filled until the
   photos' combined width÷height ratio reaches ROW_TARGET, then every photo in
   the row is sized in proportion to its ratio so they all share one height
   (no cropping, no ragged columns). Phones get one photo per row. */
const ROW_TARGET = { wide: 3, medium: 1.9 };

function useRowTarget() {
  const query = () =>
    window.matchMedia("(min-width: 1024px)").matches
      ? ROW_TARGET.wide
      : window.matchMedia("(min-width: 640px)").matches
        ? ROW_TARGET.medium
        : 0;
  const [target, setTarget] = useState(() => (typeof window === "undefined" ? ROW_TARGET.wide : query()));
  useEffect(() => {
    const update = () => setTarget(query());
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return target;
}

type Placed = { photo: GalleryPhoto; index: number; ratio: number };

function groupRows(items: Placed[], target: number): Placed[][] {
  if (target === 0) return items.map((item) => [item]);
  const rows: Placed[][] = [];
  let row: Placed[] = [];
  let sum = 0;
  for (const item of items) {
    row.push(item);
    sum += item.ratio;
    if (sum >= target) {
      rows.push(row);
      row = [];
      sum = 0;
    }
  }
  if (row.length) {
    // A lonely leftover photo would be huge; tuck it into the previous row.
    if (sum < target * 0.55 && rows.length) rows[rows.length - 1].push(...row);
    else rows.push(row);
  }
  return rows;
}

/** The Gallery section: rows of framed photos that open in an enlarged view. */
export function Gallery() {
  const rowTarget = useRowTarget();
  const [ratios, setRatios] = useState<Record<string, number>>({});
  const rows = useMemo(
    () =>
      groupRows(
        gallery.map((photo, index) => ({ photo, index, ratio: ratios[photo.file] ?? photo.ratio ?? 4 / 3 })),
        rowTarget,
      ),
    [ratios, rowTarget],
  );
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);

  const open = (index: number, trigger: HTMLButtonElement) => {
    lastTriggerRef.current = trigger;
    setOpenIndex(index);
  };
  const close = () => {
    setOpenIndex(null);
    lastTriggerRef.current?.focus();
  };
  const step = (direction: number) =>
    setOpenIndex((index) =>
      index === null ? index : (index + direction + gallery.length) % gallery.length,
    );

  // Keyboard: Esc closes, arrows move. Lock page scroll while open.
  useEffect(() => {
    if (openIndex === null) return;
    closeButtonRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openIndex === null]);

  const current = openIndex === null ? null : gallery[openIndex];

  return (
    <section
      id="gallery"
      className="scroll-mt-20 border-b-4 border-white bg-[#070707] px-5 py-24 md:px-8 lg:py-32"
    >
      <div className="mx-auto max-w-[845px]">
        <div className="mb-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-5 text-[10px] tracking-widest text-[#ffb000]">AREA 04 / GALLERY</p>
            <h2 className="text-4xl sm:text-6xl">PHOTO ALBUM</h2>
          </div>
          <p className="text-xs text-white/50">
            {gallery.length} MEMORIES COLLECTED
          </p>
        </div>

        <div className="flex flex-col gap-8">
          {rows.map((row) => (
            <div key={row[0].photo.file} className="flex items-start gap-6">
              {row.map(({ photo, index, ratio }) => (
                <figure
                  key={photo.file}
                  className="gallery-item min-w-0"
                  // grow factors are scaled ×100: a lone photo with a sum < 1 would otherwise not fill its row
                  style={{ flex: `${ratio * 100} 1 0%` }}
                >
                  <button
                    onClick={(event) => open(index, event.currentTarget)}
                    className="gallery-frame group block w-full"
                    aria-label={`Open photo: ${photo.alt}`}
                  >
                    <img
                      src={galleryImage(photo.file)}
                      alt={photo.alt}
                      loading="lazy"
                      className="image-smooth block w-full"
                      style={{ aspectRatio: String(ratio) }}
                      onLoad={(event) => {
                        const { naturalWidth, naturalHeight } = event.currentTarget;
                        if (!naturalHeight) return;
                        const real = naturalWidth / naturalHeight;
                        setRatios((known) =>
                          Math.abs((known[photo.file] ?? 0) - real) < 0.001 ? known : { ...known, [photo.file]: real },
                        );
                      }}
                    />
                    <span className="gallery-hint" aria-hidden="true">
                      * VIEW
                    </span>
                  </button>
                  <figcaption className="mt-3 text-[9px] leading-loose text-white/55">
                    <span className="text-[#ff0]">* </span>
                    {photo.caption}
                  </figcaption>
                </figure>
              ))}
            </div>
          ))}
        </div>
      </div>

      {current && openIndex !== null && (
        <div
          className="fixed inset-0 z-[60] flex flex-col bg-black p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          onClick={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <div className="mx-auto flex w-full max-w-[726px] items-center justify-between gap-4 pb-4 text-[10px]">
            <span className="text-white/50">
              PHOTO {openIndex + 1} / {gallery.length}
            </span>
            <button ref={closeButtonRef} onClick={close} className="game-button">
              CLOSE ✕
            </button>
          </div>

          <div
            className="mx-auto flex min-h-0 w-full max-w-[726px] flex-1 items-center justify-center"
            onClick={(event) => {
              if (event.target === event.currentTarget) close();
            }}
          >
            <img
              key={current.file}
              src={galleryImage(current.file)}
              alt={current.alt}
              className="image-smooth max-h-full max-w-full border-4 border-white object-contain"
            />
          </div>

          <div className="mx-auto mt-4 grid w-full max-w-[726px] grid-cols-2 gap-3 sm:flex sm:items-stretch sm:gap-4">
            <button onClick={() => step(-1)} className="game-button shrink-0" aria-label="Previous photo">
              ◀ PREV
            </button>
            <div className="dialog-box order-first col-span-2 flex-1 sm:order-none">
              <p className="flex text-xs leading-[1.9] sm:text-sm">
                <span className="mr-3 shrink-0">*</span>
                <Typewriter key={current.file} parts={[current.caption]} speed={15} />
              </p>
            </div>
            <button onClick={() => step(1)} className="game-button shrink-0" aria-label="Next photo">
              NEXT ▶
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
