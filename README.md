# GTA VI Landing

[EN](#en) | [RU](#ru)

---

<a id="en"></a>

## GTA VI — scroll-driven landing

Front-end portfolio case study. A cinematic Vue 3 landing built from a JSMastery GTA VI mockup: pinned scroll scenes, CSS-mask hero choreography, and video frames driven by scroll (`currentTime`), not `play()`.

**Stack:** Vue 3 · TypeScript · Vite · Tailwind CSS v4 · GSAP ScrollTrigger

🎨 **Design:** mockup provided by [JavaScript Mastery](https://jsmastery.com) · front-end implementation by me

Per-screen motion spec: **[docs/screens-spec.md](docs/screens-spec.md)**

### Context

The mockup is a long-form promo page for **Grand Theft Auto VI**: hero cover, release date, character trailers, Jason / Lucia bios, a Leonida Keys postcard, and a closing date block. The visual language is cinematic — overlapping full-viewport sections, letterform masks, and scroll-scrubbed video.

I owned the Vue architecture, GSAP timelines (`gsap.context` + cleanup), mask math per breakpoint, lazy video loading (`useLazyVideoSource`), reduced-motion fallbacks, and responsive reflow.

### The challenge

This is not a static page with fade-ins. Almost every beat is **scroll-linked**: hero stays pinned for ~two viewports while a CSS `mask-image` shrinks from ~3100% to the GTA VI wordmark; Coming Soon is revealed with an animated **radial mask** (not a decorative gradient); three full-screen clips and the postcard video sync frames to scroll after lazy load and `loadeddata`.

Sections overlap (`margin-top`) and pin in an order that does not match DOM paint, so ScrollTrigger refresh priority, the scroll scene registry, and scoped selectors matter. Video + large stills put pressure on main-thread work and payload; motion must still respect `prefers-reduced-motion`.

### What I built

- **Single-page flow:** fixed NavBar → Hero + Coming Soon → Jason trailer → Jason → Lucia trailer → Lucia → postcard → final video → outro → footer disclaimer.
- **Hero mask sequence:** cover chrome fades; background scales down; SVG letter mask tightens (`maskSize` + `maskPosition` per breakpoint); overlay logo flash on desktop only (>1024px); Coming Soon wipes in via `radial-gradient` mask.
- **Scroll-scrubbed video:** muted, `playsinline`, lazy-loaded (`useLazyVideoSource`); scrub after `loadeddata`.
- **Character pages:** overlap trailers, fade previous video via scroll scene registry, parallax photo stacks (`y: -300`). Stacked layout until `2xl` (1536px) for Jason / Lucia.
- **Postcard:** decorative gradient, 3:2 framed clip, CTA link to official Leonida Keys page.
- **Accessibility:** skip link, semantic landmarks, video `sr-only` descriptions, posters; reduced-motion skips GSAP and parks videos at `t = 0`.
- **Delivery basics:** SEO meta, Open Graph, JSON-LD `WebPage` + `about: VideoGame`, unofficial disclaimer, cache headers, font preload, WebP `srcset` on key logos.

### Motion map

| Section | Animation |
| --- | --- |
| **NavBar** | Fixed chrome only — no scroll timeline |
| **Hero** | Pin + scrub (~`+=200%`): fade cover UI, scale bg, shrink letter mask, overlay flash (desktop only), radial reveal Coming Soon |
| **First / Second / Final video** | Pin (`+=200%` where noted), fade in, lazy load, scrub `currentTime` |
| **Jason / Lucia** | Fade previous video (registry); parallax `.img-box` (`y: -300`); stacked until `2xl` |
| **Postcard** | Scrub video while the section crosses the viewport |
| **Outro** | Overlap final clip; fade video out / block in — no pin, no radial mask |

### Engineering approach

Timelines live in `onMounted` inside `gsap.context(sectionRef)` and `revert()` on unmount. `ScrollTrigger` is registered once in `src/main.ts`. Cross-section targets use `useScrollSceneRegistry`. If the trigger is the section root, pass the element — not a class string.

Hero mask size/position is breakpoint-specific (`useHeroMaskSettings`). Video scrub waits for `loadeddata` via `useLazyVideoSource`. Layout and motion were tuned per breakpoint (including `2xl` character layouts and postcard aspect ratio), not as a mechanical resize.

### Tech stack

| Area | Tools |
| --- | --- |
| Framework | Vue 3, TypeScript, Composition API |
| Build | Vite, vue-tsc |
| Styling | Tailwind CSS v4 |
| Animation | GSAP, ScrollTrigger |
| Lint / format | ESLint, Oxlint, Prettier |

### Getting started

**Prerequisites:** Node.js `^22.18.0` or `>=24.12.0`, npm.

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # type-check + production build
npm run preview
npm run lint
npm run type-check
```

## Deployment

This project is deployed to Cloudflare Workers Static Assets.

### Production URL

[View deployed site](https://gta-vi-landing.marina-sirenko1-80f.workers.dev)

### Deploy command

```bash
npm run deploy
```

### Local Cloudflare preview

```bash
npm run dev:cf
```

### Performance audit

Lighthouse scores for [production](https://gta-vi-landing.marina-sirenko1-80f.workers.dev/) (Chrome DevTools, incognito, September 2026).

#### Desktop

| Category | Score |
| --- | ---: |
| Performance | **100** |
| Accessibility | **100** |
| Best Practices | **100** |
| SEO | **100** |

| Metric | Value |
| --- | ---: |
| First Contentful Paint | 0.4 s |
| Largest Contentful Paint | 0.7 s |
| Total Blocking Time | 0 ms |
| Cumulative Layout Shift | 0 |
| Speed Index | 0.7 s |

#### Mobile

| Category | Score |
| --- | ---: |
| Performance | **90** |
| Accessibility | **100** |
| Best Practices | **100** |
| SEO | **100** |

| Metric | Value |
| --- | ---: |
| First Contentful Paint | 1.4 s |
| Largest Contentful Paint | 3.4 s |
| Total Blocking Time | 140 ms |
| Cumulative Layout Shift | 0 |
| Speed Index | 2.3 s |

To re-run locally after deploy:

```txt
user-run-web-perf-audit https://gta-vi-landing.marina-sirenko1-80f.workers.dev
```

### Routing

SPA fallback is not enabled. This is expected for simple static landing pages or projects without a client-side router.

### Credits

- **Design:** mockup provided by the [JavaScript Mastery](https://jsmastery.com) community.
- **Front-end:** Vue implementation, scroll motion, masks, video sync, accessibility, and optimization by me.
- **Grand Theft Auto**, **GTA VI**, and related marks belong to Take-Two / Rockstar Games. This is a fan / portfolio recreation, not an official product.

---

<a id="ru"></a>

## GTA VI — лендинг на скролле

Портфолио-кейс. Кинематографичный Vue 3-лендинг по макету JSMastery: pinned-сцены, CSS-маски в hero и кадры видео от скролла (`currentTime`), а не от `play()`.

**Стек:** Vue 3 · TypeScript · Vite · Tailwind CSS v4 · GSAP ScrollTrigger

🎨 **Дизайн:** макет [JavaScript Mastery](https://jsmastery.com) · front-end реализация — моя

ТЗ по экранам: **[docs/screens-spec.md](docs/screens-spec.md)**

### Контекст

Макет — длинный промо-лендинг **Grand Theft Auto VI**: обложка, дата релиза, трейлеры персонажей, био Jason / Lucia, открытка Leonida Keys и финальный блок с датой. Язык — кинематографичный: нахлёст полноэкранных секций, маски по буквам, видео, привязанное к скроллу.

На моей стороне — архитектура Vue, GSAP-таймлайны (`gsap.context` + cleanup), расчёт масок по брейкпоинтам, ленивая загрузка видео, fallback для reduced-motion и адаптив.

### Задача

Это не статичная страница с fade-in. Почти каждый кадр **привязан к скроллу**: hero pinned ~на два экрана, CSS `mask-image` сжимается с ~3100% до силуэта GTA VI; Coming Soon — **радиальной маской**; три полноэкранных ролика и видео открытки ведут `currentTime` после lazy load и `loadeddata`.

Секции нахлёстываются и пинятся в порядке, который не совпадает с DOM — важны refreshPriority, scroll scene registry и селекторы в скоупе. Анимации должны уважать `prefers-reduced-motion`.

### Что реализовано

- **Single-page flow:** NavBar → Hero + Coming Soon → трейлеры и экраны Jason / Lucia → открытка → финальное видео → outro → footer с disclaimer.
- **Hero-маска:** fade хрома, scale фона, сжатие SVG-маски (`maskSize` + `maskPosition`); вспышка overlay только на desktop (>1024px); Coming Soon через `radial-gradient`.
- **Видео:** lazy load (`useLazyVideoSource`), scrub после `loadeddata`.
- **Jason / Lucia:** fade через registry, parallax `y: -300`, stacked до `2xl` (1536px).
- **Открытка:** градиент, рамка 3:2, CTA на Leonida Keys.
- **Доступность:** skip link, описания видео, posters; reduced-motion отключает GSAP.
- **SEO / perf:** meta, OG, JSON-LD `WebPage` + `about: VideoGame`, disclaimer, `_headers`, preload шрифта, WebP `srcset`.

### Карта анимаций

| Секция | Анимация |
| --- | --- |
| **NavBar** | Только фиксированная шапка |
| **Hero** | Pin + scrub: fade UI, scale, letter mask, overlay flash (только desktop), radial reveal |
| **Видео** | Pin, lazy load, scrub `currentTime` |
| **Jason / Lucia** | Fade через registry; parallax; stacked до `2xl` |
| **Открытка** | Scrub видео, пока секция пересекает viewport |
| **Outro** | Нахлёст на финальный ролик; fade видео / появление блока — без pin и без радиальной маски |

### Инженерный подход

Таймлайны в `gsap.context(sectionRef)`, на размонтировании — `revert()`. Между секциями — `useScrollSceneRegistry`. Hero-маска — `useHeroMaskSettings`. Видео — `useLazyVideoSource`, scrub после `loadeddata`. Вёрстка персонажей и открытки подогнана по брейкпоинтам, включая `2xl`.

### Tech stack

| Область | Инструменты |
| --- | --- |
| Framework | Vue 3, TypeScript, Composition API |
| Build | Vite, vue-tsc |
| Стили | Tailwind CSS v4 |
| Анимация | GSAP, ScrollTrigger |
| Lint / format | ESLint, Oxlint, Prettier |

### Запуск

**Требования:** Node.js `^22.18.0` или `>=24.12.0`, npm.

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # type-check + production-сборка
npm run preview
npm run lint
npm run type-check
```

## Deployment

Проект задеплоен на Cloudflare Workers Static Assets.

### Production URL

[Открыть сайт](https://gta-vi-landing.marina-sirenko1-80f.workers.dev)

### Deploy command

```bash
npm run deploy
```

### Локальный превью Cloudflare

```bash
npm run dev:cf
```

### Performance audit

Lighthouse для [прода](https://gta-vi-landing.marina-sirenko1-80f.workers.dev/) (Chrome DevTools, инкогнито, сентябрь 2026).

#### Desktop

| Категория | Балл |
| --- | ---: |
| Performance | **100** |
| Accessibility | **100** |
| Best Practices | **100** |
| SEO | **100** |

| Метрика | Значение |
| --- | ---: |
| First Contentful Paint | 0.4 s |
| Largest Contentful Paint | 0.7 s |
| Total Blocking Time | 0 ms |
| Cumulative Layout Shift | 0 |
| Speed Index | 0.7 s |

#### Mobile

| Категория | Балл |
| --- | ---: |
| Performance | **90** |
| Accessibility | **100** |
| Best Practices | **100** |
| SEO | **100** |

| Метрика | Значение |
| --- | ---: |
| First Contentful Paint | 1.4 s |
| Largest Contentful Paint | 3.4 s |
| Total Blocking Time | 140 ms |
| Cumulative Layout Shift | 0 |
| Speed Index | 2.3 s |

Повторный прогон после деплоя:

```txt
user-run-web-perf-audit https://gta-vi-landing.marina-sirenko1-80f.workers.dev
```

### Routing

SPA fallback не включён. Это ожидаемо для простого статического лендинга без клиентского роутера.

### Credits

- **Design:** макет коммьюнити [JavaScript Mastery](https://jsmastery.com).
- **Front-end:** Vue, scroll motion, маски, синхронизация видео, accessibility и оптимизация — моя работа.
- **Grand Theft Auto**, **GTA VI** и связанные товарные знаки принадлежат Take-Two / Rockstar Games. Это фанатский / портфолио-ремейк, не официальный продукт.
