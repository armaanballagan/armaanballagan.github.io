# Project notes for Claude

Personal portfolio site for Armaan Ballagan (UBC CS student), Undertale-themed, to be hosted on GitHub Pages at the user's `<username>.github.io` repo (Vite `base` is `./` so the build works at any path; image paths use `import.meta.env.BASE_URL`).

- Source of truth for the design: Armaan's Figma Make file "Undertale Software Engineer Portfolio". This repo is a faithful export of it.
- Stack: Vite + React 19 + TypeScript + Tailwind v4 (`@tailwindcss/vite`). No backend; static only.
- Single page with anchor navigation (`#about`, `#work`, `#experience`, `#contact`), no router.
- Content is Armaan's real info (8 projects with category filters, UBC/PNE/Delta Controls experience, email armaanballagan@gmail.com). LinkedIn URL is still a placeholder.
- `src/Typewriter.tsx` types dialogue text (hero on first load, project descriptions on each selection) with the `typewriter` dialogue voice from `src/audio.ts`; click to skip.
- Deploy: `.github/workflows/deploy.yml` builds `dist/` and publishes via GitHub Actions on push to `main`. Pages source must be set to "GitHub Actions".
- All sound effects and the music playlist are in `src/audio.ts` (`soundEffects`, `playlist`); App.tsx calls `playSound("name")` and `MusicPlayer`. New sounds go there with a clear label and `usedIn`.
- Gallery section (`src/Gallery.tsx`) reads photos from `src/gallery.ts` / `public/gallery/`; currently 8 generated pixel-art placeholders.
- Hero name is a generated SVG pixel wordmark (`src/NameLogo.tsx`, editable glyph grids). Typing speed defaults to 22ms/char (projects 12, gallery 15); voice `rate` 1.3 in `src/audio.ts`.
- Keep the pixel look: Press Start 2P / VT323 fonts, 2–4px white borders, `steps()` animations, `image-rendering: pixelated`.
