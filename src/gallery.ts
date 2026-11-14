/* =============================================================================
   GALLERY — the photos shown in the Gallery section, in order.

   HOW TO ADD A PHOTO
   1. Drop the image into  public/gallery/  (jpg, png, webp or gif).
   2. Add an entry below with its file name and a caption.
   3. Delete the placeholder entries (and their files) when you're done.

   Any size or shape works; the grid adapts. Big phone photos are fine, but
   shrinking them to ~1600px on the long side keeps the site fast.
============================================================================= */

export type GalleryPhoto = {
  /** File name inside public/gallery/ */
  file: string;
  /** Shown under the photo and typed out in the enlarged view. */
  caption: string;
  /** Short description for screen readers. */
  alt: string;
};

export const gallery: GalleryPhoto[] = [
  { file: "placeholder-01.png", caption: "Placeholder. A hackathon team photo goes here.", alt: "Placeholder photo 1" },
  { file: "placeholder-02.png", caption: "Placeholder. A close-up of a build goes here.", alt: "Placeholder photo 2" },
  { file: "placeholder-03.png", caption: "Placeholder. A demo-day shot goes here.", alt: "Placeholder photo 3" },
  { file: "placeholder-04.png", caption: "Placeholder. Something from the Cayman Islands goes here.", alt: "Placeholder photo 4" },
  { file: "placeholder-05.png", caption: "Placeholder. A late-night coding session goes here.", alt: "Placeholder photo 5" },
  { file: "placeholder-06.png", caption: "Placeholder. A hardware prototype goes here.", alt: "Placeholder photo 6" },
  { file: "placeholder-07.png", caption: "Placeholder. Something around UBC goes here.", alt: "Placeholder photo 7" },
  { file: "placeholder-08.png", caption: "Placeholder. Anything cool goes here.", alt: "Placeholder photo 8" },

  // ── Add your photos. Copy this template: ─────────────────────────────────
  // { file: "my-photo.jpg", caption: "What's happening in it.", alt: "Short description" },
];

export const galleryImage = (file: string) => `${import.meta.env.BASE_URL}gallery/${file}`;
