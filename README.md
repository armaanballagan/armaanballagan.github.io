# Undertale-themed portfolio

Exported from the Figma Make file "Undertale Software Engineer Portfolio" and set up as a standalone Vite + React + TypeScript + Tailwind v4 project.

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs to dist/
npm run preview  # serve the built site
```

## Deploy to GitHub Pages

1. Push this project to the repo named `yourusername.github.io` (branch `main`).
2. In the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Every push to `main` runs `.github/workflows/deploy.yml`, which builds and publishes `dist/`.

`vite.config.ts` uses a relative base (`./`), so the built site works at the root of `yourusername.github.io` or under any sub-path without changes.

## Structure

- `src/App.tsx` – the whole page (header, hero, about, work, experience, contact, footer). Project and experience data live in the `projects` and `experience` arrays at the top.
- `src/index.css` – Tailwind import, pixel fonts, and the custom classes (`dialog-box`, `game-button`, `battle-window`, etc.).
- `public/undertale/` – image assets carried over from the Figma Make file.

## Project thumbnails

Put project images in `public/projects/` with these exact names (any missing one shows a pixel placeholder):

| File | Where to get it |
|---|---|
| `street-striker.png` | https://d112y698adiu2z.cloudfront.net/photos/production/software_thumbnail_photos/005/513/242/datas/medium.png |
| `airsign.png` | https://d112y698adiu2z.cloudfront.net/photos/production/software_thumbnail_photos/005/816/290/datas/medium.png |
| `journifyai.png` | https://d112y698adiu2z.cloudfront.net/photos/production/software_photos/003/824/064/datas/original.png |
| `nodeify.png` | https://d112y698adiu2z.cloudfront.net/photos/production/software_thumbnail_photos/004/183/709/datas/medium.PNG |
| `muffin-time.jpg` | https://armaanballagan.github.io/Old-Portfolio/images/muffin_time.jpg |
| `insightubc.png` | your own screenshot of the dashboard |
| `pi-security-robot.jpg` | your own photo of the robot |
| `voice-conversion.png` | your own screenshot of the GUI |

To use a different file name or format, change the `img("...")` call for that project in `src/App.tsx`.

## Sounds and music

Everything audio lives in **`src/audio.ts`**:

- **`soundEffects`**: every sound effect, labelled with where it plays. Each has `src: null` until you add a real file; until then a generic browser-generated placeholder plays.
- **`dialogueVoices`**: looping "talking" sounds for text that types out (`<Typewriter>` in `src/Typewriter.tsx`). `typewriter` uses `public/audio/sfx/sans-voice.mp3`. Browsers block sound until the visitor clicks or taps the page once, so the hero text may type out silently on the very first load.
- **`playlist`**: the songs for the gramophone music player, in order. Add as many as you like; PREV / NEXT buttons appear once there are two or more, and songs auto-advance. ON/OFF turns music fully off; PREV/NEXT only change the song.

To use a real file: put it in `public/audio/sfx/` or `public/audio/music/`, then set `src: asset("audio/sfx/your-file.mp3")` on that entry.

## Gallery

Photos for the Gallery section are listed in **`src/gallery.ts`** and stored in **`public/gallery/`**. Add a file, add an entry with a caption, and delete the `placeholder-0X.png` entries and files when you have real photos. Clicking a photo opens it full-screen with the caption typed out (arrow keys / Esc work).
