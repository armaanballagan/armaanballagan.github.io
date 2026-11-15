/* =============================================================================
   GALLERY — the photos shown in the Gallery section, in order.

   HOW TO ADD A PHOTO
   1. Drop the image into  public/gallery/  (jpg, png, webp or gif).
   2. Add an entry below with its file name and a caption.
   3. Delete the placeholder entries (and their files) when you're done.

   Any size or shape works: photos are laid out in rows (left to right, in
   this order) and each row is scaled so its photos share one height, so
   nothing gets cropped. Big phone photos are fine, but shrinking them to
   ~1600px on the long side keeps the site fast.
============================================================================= */

export type GalleryPhoto = {
  /** File name inside public/gallery/ */
  file: string;
  /** Shown under the photo and typed out in the enlarged view. */
  caption: string;
  /** Short description for screen readers. */
  alt: string;
  /** Optional width ÷ height. Measured automatically once the photo loads; set it to avoid a small jump on first load. */
  ratio?: number;
};

export const gallery: GalleryPhoto[] = [
  { file: "forest-lookout.jpg", caption: "Climbing the Chief in Squamish. Only halfway up and already taking a break, but the view was worth it.", alt: "Sitting on a granite boulder partway up the Chief in Squamish, looking out over the forest to Howe Sound", ratio: 4 / 3 },
  { file: "lookout-binoculars.jpg", caption: "Scanning the horizon for the next side quest.", alt: "Person in a white cap looking through coin-operated binoculars over a bay at sunset", ratio: 3 / 4 },
  { file: "heron.jpg", caption: "A heron, standing perfectly still. Unmatched patience.", alt: "Silhouette of a heron wading in shimmering blue water", ratio: 4 / 3 },
  { file: "niagara-snow.jpg", caption: "Niagara Falls in a snowstorm. Couldn't feel my hands by the end, but I'd do it again.", alt: "Horseshoe Falls in falling snow, with mist rising over green water", ratio: 4 / 3 },
  { file: "gingerbread-gojo.jpg", caption: "Gingerbread Gojo. He's seen better days.", alt: "Gingerbread cookie decorated with white hair, a black outfit and blue eyes", ratio: 5 / 4 },
  { file: "canoe-lake.jpg", caption: "Canoeing the turquoise water at Lake Louise.", alt: "Bow of a canoe on the turquoise water of Lake Louise, between steep mountains and a glacier", ratio: 3 / 4 },
  { file: "mountain-lookout.jpg", caption: "Taking in the view from the top of Mount Mackenzie, Revelstoke, with the whole town and river laid out below.", alt: "Leaning on a railing at the top of Mount Mackenzie in Revelstoke, looking down at the town, the Columbia River and the mountains beyond", ratio: 4 / 3 },
  { file: "pier-sunset.jpg", caption: "Watching the sun go down by the pier at Crescent Beach.", alt: "Sitting on the beach at Crescent Beach watching a pink and orange sunset beside the pier", ratio: 4 / 3 },

  // ── Add your photos. Copy this template: ─────────────────────────────────
  // { file: "my-photo.jpg", caption: "What's happening in it.", alt: "Short description" },
];

export const galleryImage = (file: string) => `${import.meta.env.BASE_URL}gallery/${file}`;
