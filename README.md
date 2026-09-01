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

I owned the Vue architecture, GSAP timelines (`gsap.context` + cleanup), mask math per breakpoint, video metadata handling, reduced-motion fallbacks, and responsive reflow.

### The challenge

This is not a static page with fade-ins. Almost every beat is **scroll-linked**: hero stays pinned for ~two viewports while a CSS `mask-image` shrinks from ~3100% to the GTA VI wordmark; Coming Soon is revealed with an animated **radial mask** (not a decorative gradient); three full-screen clips and the postcard video sync frames to scroll after `loadedmetadata`.

Sections overlap (`margin-top`) and pin in an order that does not match DOM paint, so ScrollTrigger refresh priority and scoped selectors matter. Video + large stills put pressure on main-thread work and payload; motion must still respect `prefers-reduced-motion`.

### What I built

- **Single-page flow:** fixed NavBar → Hero + Coming Soon → Jason trailer → Jason → Lucia trailer → Lucia → postcard → final video → outro (same release beat as Hero, no radial mask).
- **Hero mask sequence:** cover chrome fades; background scales down; SVG letter mask tightens so the photo reads only inside the wordmark; overlay logo flash; Coming Soon wipes in from the top via `radial-gradient` mask.
- **Scroll-scrubbed video:** muted, `playsinline`, no native controls; `currentTime` 0 → duration on scrub.
- **Character pages:** overlap the trailers, fade the previous clip, parallax photo stacks (`y` on scrub). No pin.
- **Postcard:** decorative gradient backdrop, framed clip, CTA button (no navigation in this iteration).
- **Accessibility:** skip link, semantic landmarks, accessible names; reduced-motion skips GSAP scenes and parks videos at `t = 0`.
- **Delivery basics:** SEO meta, Open Graph, JSON-LD `VideoGame`, WebP `srcset` on key logos.

### Motion map

| Section | Animation |
| --- | --- |
| **NavBar** | Fixed chrome only — no scroll timeline |
| **Hero** | Pin + scrub (~`+=200%`): fade cover UI, scale bg, shrink letter mask, logo flash, radial reveal of Coming Soon |
| **First / Second / Final video** | Pin, fade in, scrub `currentTime` |
| **Jason / Lucia** | Fade previous video; parallax `.img-box` |
| **Postcard** | Scrub video while the section crosses the viewport |
| **Outro** | Overlap final clip; fade video out / block in — no pin, no radial mask |

### Engineering approach

Timelines live in `onMounted` inside `gsap.context(sectionRef)` and `revert()` on unmount. `ScrollTrigger` is registered once in `src/main.ts`. If the trigger is the section root, the element is passed — not a class string (`querySelectorAll` does not match the scope root).

Hero mask size/position is breakpoint-specific (`useHeroMaskSettings`). Video tweens wait for metadata (including the already-ready case). Layout and motion were tuned against the mockup, not as a mechanical resize.

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

На моей стороне — архитектура Vue, GSAP-таймлайны (`gsap.context` + cleanup), расчёт масок по брейкпоинтам, обработка metadata видео, fallback для reduced-motion и адаптив.

### Задача

Это не статичная страница с fade-in. Почти каждый кадр **привязан к скроллу**: hero pinned ~на два экрана, CSS `mask-image` сжимается с ~3100% до силуэта GTA VI; Coming Soon проявляется **радиальной маской** (не декоративным градиентом); три полноэкранных ролика и видео открытки ведут `currentTime` после `loadedmetadata`.

Секции нахлёстываются (`margin-top`) и пинятся в порядке, который не совпадает с отрисовкой DOM — важны refreshPriority ScrollTrigger и селекторы в скоупе. Видео и тяжёлые кадры давят на main thread и вес страницы; анимации должны уважать `prefers-reduced-motion`.

### Что реализовано

- **Single-page flow:** фиксированный NavBar → Hero + Coming Soon → трейлер Jason → Jason → трейлер Lucia → Lucia → открытка → финальное видео → outro (тот же релизный смысл, что в Hero, без радиальной маски).
- **Hero-маска:** гаснет хром обложки; фон скейлится; SVG-маска букв сужается, фото читается только внутри слова; вспышка лого; Coming Soon проявляется сверху через `radial-gradient`.
- **Видео от скролла:** mute, `playsinline`, без нативных контролов; `currentTime` 0 → duration.
- **Экраны персонажей:** нахлёст на трейлер, fade предыдущего ролика, параллакс стопки фото. Pin нет.
- **Открытка:** декоративный градиент, рамка, CTA-кнопка (перехода в этой итерации нет).
- **Доступность:** skip link, семантика, доступные имена; при reduced-motion сцены GSAP не ставятся, видео на `t = 0`.
- **SEO:** meta, Open Graph, JSON-LD `VideoGame`, WebP `srcset` на ключевых логотипах.

### Карта анимаций

| Секция | Анимация |
| --- | --- |
| **NavBar** | Только фиксированная шапка |
| **Hero** | Pin + scrub (~`+=200%`): fade UI обложки, scale фона, сжатие letter-mask, вспышка лого, radial reveal Coming Soon |
| **Первое / второе / финальное видео** | Pin, fade-in, scrub `currentTime` |
| **Jason / Lucia** | Fade предыдущего видео; параллакс `.img-box` |
| **Открытка** | Scrub видео, пока секция пересекает viewport |
| **Outro** | Нахлёст на финальный ролик; fade видео / появление блока — без pin и без радиальной маски |

### Инженерный подход

Таймлайны в `onMounted` внутри `gsap.context(sectionRef)`, на размонтировании — `revert()`. `ScrollTrigger` регистрируется один раз в `src/main.ts`. Если триггер — корень секции, передаётся элемент, не строка класса (`querySelectorAll` не находит сам скоуп).

Размер и позиция hero-маски зависят от брейкпоинта (`useHeroMaskSettings`). Твины видео ждут metadata, включая случай, когда они уже готовы. Вёрстка и motion подгонялись под макет, а не как механический resize.

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

### Credits

- **Design:** макет коммьюнити [JavaScript Mastery](https://jsmastery.com).
- **Front-end:** Vue, scroll motion, маски, синхронизация видео, accessibility и оптимизация — моя работа.
- **Grand Theft Auto**, **GTA VI** и связанные товарные знаки принадлежат Take-Two / Rockstar Games. Это фанатский / портфолио-ремейк, не официальный продукт.
