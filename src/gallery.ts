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
  { file: "forest-lookout.jpg", caption: "Took a break on the rocks. The view was worth the climb.", alt: "Person sitting on a granite boulder looking out over a forest and water to distant mountains" },
  { file: "lookout-binoculars.jpg", caption: "Scanning the horizon for the next side quest.", alt: "Person in a white cap looking through coin-operated binoculars over a bay at sunset" },
  { file: "heron.jpg", caption: "A heron, standing perfectly still. Unmatched patience.", alt: "Silhouette of a heron wading in shimmering blue water" },
  { file: "niagara-snow.jpg", caption: "Niagara Falls in a snowstorm. You feel the mist from up here.", alt: "Horseshoe Falls in falling snow, with mist rising over green water" },
  { file: "gingerbread-gojo.jpg", caption: "My gingerbread Gojo. Strongest cookie of all time.", alt: "Gingerbread cookie decorated with white hair, a black outfit and blue eyes" },
  { file: "canoe-lake.jpg", caption: "Canoeing a turquoise mountain lake.", alt: "Bow of a canoe on turquoise water between steep mountains and a glacier" },
  { file: "pier-sunset.jpg", caption: "Watching the sun go down by the pier.", alt: "Person sitting on a beach watching a pink and orange sunset beside a wooden pier" },

  // ── Add your photos. Copy this template: ─────────────────────────────────
  // { file: "my-photo.jpg", caption: "What's happening in it.", alt: "Short description" },
];

export const galleryImage = (file: string) => `${import.meta.env.BASE_URL}gallery/${file}`;
