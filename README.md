# GTA VI Landing

Production-oriented Vue landing (Vue 3 + TypeScript + Tailwind CSS v4 + GSAP).

## Specification

Per-screen requirements (English and Russian), including Hero layers, scroll sequence, and what the radial mask is for:

- **[docs/screens-spec.md](docs/screens-spec.md)**

## Stack

- **Vue 3** + `<script setup>` + TypeScript
- **Vite**
- **Tailwind CSS v4** (`@tailwindcss/vite`)
- **GSAP** (installed, ready for scroll animations)
- ESLint + Oxlint + Prettier

## Scripts

```bash
npm install
npm run dev
npm run build
npm run preview
npm run lint
npm run type-check
```

## Project structure

```text
src/
  main.css       # global styles (Tailwind + section layout)
  components/    # reusable UI
  sections/      # page sections (Hero, Video, etc.)
  composables/   # shared Vue logic (e.g. GSAP helpers)
  App.vue
  main.ts
public/          # fonts, images (per section), videos
docs/            # product spec
```

## Dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).
