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

If you host it under a sub-path instead (e.g. `yourusername.github.io/portfolio`), set `base: "/portfolio/"` in `vite.config.ts` and update the `/undertale/...` image paths.

## Structure

- `src/App.tsx` – the whole page (header, hero, about, work, experience, contact, footer). Project and experience data live in the `projects` and `experience` arrays at the top.
- `src/index.css` – Tailwind import, pixel fonts, and the custom classes (`dialog-box`, `game-button`, `battle-window`, etc.).
- `public/undertale/` – image assets carried over from the Figma Make file.
