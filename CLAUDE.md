# Project notes for Claude

Personal portfolio site for Armaan Ballagan (UBC CS student), Undertale-themed, to be hosted on GitHub Pages at the user's `<username>.github.io` repo (user site, so Vite `base` is `/`).

- Source of truth for the design: Armaan's Figma Make file "Undertale Software Engineer Portfolio". This repo is a faithful export of it.
- Stack: Vite + React 19 + TypeScript + Tailwind v4 (`@tailwindcss/vite`). No backend; static only.
- Single page with anchor navigation (`#about`, `#work`, `#experience`, `#contact`), no router.
- Content is still the Figma Make placeholder persona ("Alex Morgan", PULSE/ATLAS/THREAD, fake jobs and email). Next step is swapping in Armaan's real info: projects like Street Striker (SF6 full-body motion controller, ESP32 + MPU-6050 gloves + camera posture) and AirSign (gesture-to-speech helper, nwPlus HackCamp 2026, MediaPipe).
- Deploy: `.github/workflows/deploy.yml` builds `dist/` and publishes via GitHub Actions on push to `main`. Pages source must be set to "GitHub Actions".
- Keep the pixel look: Press Start 2P / VT323 fonts, 2–4px white borders, `steps()` animations, `image-rendering: pixelated`.
