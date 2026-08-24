# GTA VI Landing

Production-oriented Vue landing scaffold (Vue 3 + TypeScript + Tailwind CSS v4 + GSAP).

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
  assets/      # global styles and static imports
  components/  # reusable UI
  sections/    # page sections (Hero, Video, etc.)
  composables/ # shared Vue logic (e.g. GSAP helpers)
  App.vue
  main.ts
public/        # fonts, images, videos served as-is
```

## Dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).
