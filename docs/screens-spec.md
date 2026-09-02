# Screen specification / ТЗ по экранам

Bilingual product spec for the GTA VI Vue landing. Implement screens in this order. Motion is scroll-driven (GSAP ScrollTrigger, `scrub`), not time-driven, unless a note says otherwise.

Двуязычное ТЗ лендинга GTA VI на Vue. Экраны делать в этом порядке. Анимация завязана на скролл (GSAP ScrollTrigger, `scrub`), а не на таймер, если не сказано иное.

---

## Shared rules / Общие правила

### EN

- Stack: Vue 3, TypeScript, Tailwind CSS v4, GSAP + ScrollTrigger.
- Register `ScrollTrigger` once in `src/main.ts`.
- Create tweens in `onMounted` inside `gsap.context(scope)`. Revert with `ctx.revert()` in `onUnmounted`.
- Scope selectors to the section root. If the trigger is the section itself, pass the element (`ref`), not a class string — `querySelectorAll` does not match the scope root.
- Cross-section fades use `useScrollSceneRegistry` (`useRegisterScrollTarget` / `useScrollSceneTarget`) instead of `document.querySelector`.
- Videos: muted, `playsinline`, no native controls, `preload="none"`. Sources are assigned lazily via `useLazyVideoSource` (IntersectionObserver + scroll fallback). Start scroll scrub after `loadeddata` (first decodable frame), not `loadedmetadata` alone.
- Set `refreshPriority` on overlapping pins where needed. Call `ScrollTrigger.refresh()` after video-driven timelines rebuild.
- Semantic HTML, accessible names, skip link, unofficial disclaimer in footer. Respect `prefers-reduced-motion`.
- Static assets: long cache via `public/_headers`; preload display font in `index.html`.

### RU

- Стек: Vue 3, TypeScript, Tailwind CSS v4, GSAP + ScrollTrigger.
- `ScrollTrigger` регистрировать один раз в `src/main.ts`.
- Твины создавать в `onMounted` внутри `gsap.context(scope)`. На размонтировании — `ctx.revert()`.
- Селекторы ограничивать корнем секции. Если триггер — сама секция, передавать элемент (`ref`), не строку класса: `querySelectorAll` не находит сам корень скоупа.
- Fade между секциями — через `useScrollSceneRegistry` (`useRegisterScrollTarget` / `useScrollSceneTarget`), без `document.querySelector`.
- Видео: без звука, `playsinline`, без нативных контролов, `preload="none"`. Источник подключается лениво через `useLazyVideoSource` (IntersectionObserver + fallback по scroll). Scrub начинать после `loadeddata` (первый декодируемый кадр), а не только `loadedmetadata`.
- На пересекающихся pin задавать `refreshPriority`. После пересборки video-timeline вызывать `ScrollTrigger.refresh()`.
- Семантика, доступные имена, skip link, disclaimer в footer. Учитывать `prefers-reduced-motion`.
- Статика: длинный cache через `public/_headers`; preload шрифта в `index.html`.

---

## 1. NavBar

Component: `src/sections/NavBar.vue`

### EN

1. Fixed header over the whole page: GTA VI mark on the left. There is no menu control.
2. Logo is a home link to `#top`.
3. No scroll animation.

### RU

1. Фиксированная шапка на всю ширину: знак GTA VI слева. Кнопки меню нет.
2. Логотип — ссылка домой на `#top`.
3. Скролл-анимации нет.

---

## 2. Hero (first screen)

Components: `src/sections/HeroSection.vue`, `src/sections/ComingSoon.vue`  
Assets: `public/images/hero/`, shared release art in `public/images/outro/`  
Mask math: `src/composables/useHeroMaskSettings.ts`

### EN

**Layers (bottom → top)**

1. Cover stack inside `.mask-wrapper`: background photo (portrait AVIF/WebP on `max-width: 767px`), brand wordmark (raster), “Watch Trailer”, play button (YouTube link).
2. CSS mask on that same wrapper: `mask-image` is the brand SVG (`big-hero-text.svg`). Initial `mask-size` is huge (~3100–3500%) so the mask is invisible and the full cover shows.
3. Flash logo: the same SVG as a normal image (`.overlay-logo` inside `.fake-logo-wrapper`), starts at `opacity: 0`. **Desktop only** (`width > 1024px`): hidden on mobile/tablet, flash step skipped in timeline.
4. Full-viewport release block (Coming Soon: logo, **Coming November 19th 2026**, PlayStation and Xbox). Hidden with a **CSS mask**, not `opacity` / `display`. Title uses fluid `clamp()` sizing (`.gradient-title`).

**Scroll:** pin the hero. Progress lasts about **two viewports** (`end: '+=200%'`, `scrub: 2.5`).

**Sequence**

1. On load, show the cover set (background, brand raster, trailer label, play).
2. Fade out only the cover chrome (`.fade-out`): wordmark, trailer, play. **Keep the background.**
3. Scale the background from the CSS start scale (`md:scale-125`) down to `1`.
4. **At the same time** as (3), shrink the wrapper mask and animate **both** `maskSize` and `maskPosition` to compact values from `useHeroMaskSettings`:
   - mobile (`≤768px`): `15rem auto`, `50% 9.5rem`
   - tablet (`769–1024px`): `30% 30%`, `50% 17vh`
   - desktop: `20% 20%`, `50% 22%`
5. Then, **in parallel**:
   - fade the masked wrapper to `opacity: 0`;
   - on **desktop only**: flash `.overlay-logo` to `opacity: 1`, then fade it out;
   - reveal Coming Soon by animating `mask-image` to  
     `radial-gradient(circle at 50% 0vh, black 50%, transparent 100%)`.

**Note:** `.mask-logo` in markup is a course leftover (initial `gsap.set` only); safe to remove in a cleanup pass.

### RU

**Слои (снизу вверх)**

1. Обложка в `.mask-wrapper`: фото (portrait AVIF/WebP до 767px), брендовый текст (растр), «Watch Trailer», play (ссылка на YouTube).
2. CSS-маска на враппере: `mask-image` — SVG (`big-hero-text.svg`). Стартовый `mask-size` ~3100–3500%.
3. Вспышка лого (`.overlay-logo` в `.fake-logo-wrapper`), старт `opacity: 0`. **Только desktop** (`>1024px`): на mobile/tablet скрыта, шаг flash в timeline пропускается.
4. Блок даты (Coming Soon: лого, **Coming November 19th 2026**, PlayStation и Xbox). Скрыт **CSS-маской**. Заголовок — fluid `clamp()` (`.gradient-title`).

**Скролл:** pin, прогресс ≈ **два экрана** (`end: '+=200%'`, `scrub: 2.5`).

**Последовательность** — как в EN: шаг 4 анимирует `maskSize` + `maskPosition` по `useHeroMaskSettings`; шаг 5 — overlay flash только на desktop.

**Про «градиент»:** розово-оранжевая заливка даты — стиль текста. **radial-gradient** на `.entrance-message` — механизм reveal.

---

## 3. First video (Jason trailer)

Component: `src/sections/FirstVideo.vue`  
Asset: `public/videos/output1.mp4`

### EN

1. Full-viewport muted video. Starts pulled up over the hero (`margin-top`: `-80vh` mobile, `-150vh` desktop) and at `opacity: 0`.
2. Pin for about two viewports (`start: 'top top'`, `end: '+=200% top'`, `scrub: true`, `refreshPriority: 2`).
3. Fade the hero out (via scroll scene registry), then fade this section in.
4. **In parallel** with the fade-in, scrub `video.currentTime` from `0` to duration.

### RU

1. Полноэкранное видео. Старт: нахлёст (`margin-top`: `-80vh` mobile, `-150vh` desktop) и `opacity: 0`.
2. Pin ~два экрана (`start: 'top top'`, `end: '+=200% top'`, `scrub: true`, `refreshPriority: 2`).
3. Погасить hero (через scroll scene registry), проявить секцию.
4. **Параллельно** вести `currentTime` от `0` до длительности.

---

## 4. Jason

Component: `src/sections/JasonSection.vue`  
Assets: `public/images/jason/`

### EN

1. Character page: name **Jason Duval**, tagline, bio, three photos (one in the copy column, two in `.img-box`).
2. **Stacked layout below `2xl` (1536px)**; two columns from `2xl` up (iPad / tablet stay stacked).
3. Section overlaps the first video (`margin-top: -80vh`).
4. As Jason enters (`start: 'top 40%'`, `end: '10% center'`, `scrub: 2`), fade out the first video section (registry target).
5. Parallax: `.img-box` moves up on scrub (`y: -300`, `start: 'top center'`, `end: '80% center'`). No pin.
6. Yellow crop frames and hover scale from CSS.

### RU

1. Экран **Jason Duval**, три фото.
2. **Stacked до `2xl` (1536px)**; две колонки от `2xl` (iPad остаётся stacked).
3. Нахлёст на первое видео (`margin-top: -80vh`).
4. Fade первого видео по scroll (`top 40%` → `10% center`).
5. Параллакс `.img-box` (`y: -300`). Pin нет.

---

## 5. Second video (Lucia trailer)

Component: `src/sections/SecondVideo.vue`  
Asset: `public/videos/output2.mp4`

### EN

1. Full-viewport muted video (`.second-vd`, `object-position` ~15% top). Section class `lucia` is historical.
2. Same pin pattern as First video: overlap (`-80vh` / `-150vh`), `opacity: 0`, pin `start: 'top top'`, `end: '+=200% top'`, `scrub: true`, `refreshPriority: 2`.
3. Fade section in; **in parallel**, scrub `currentTime` to duration.

### RU

1. Полноэкранное видео (`.second-vd`). Класс секции `lucia` — наследие.
2. Тот же pin, что First video: нахлёст, `opacity: 0`, `end: '+=200% top'`, `refreshPriority: 2`.
3. Проявление + scrub `currentTime`.

---

## 6. Lucia

Component: `src/sections/LuciaSection.vue`  
Assets: `public/images/lucia/`

### EN

1. Character page: **Lucia Caminos**, tagline, two bio paragraphs, three photos.
2. **Stacked below `2xl`**, two columns from `2xl`.
3. Overlap second video (`margin-top: -80vh`). Fade **second video section** (registry), not a CSS class selector.
4. Parallax `.img-box` upward (`y: -300`) — same as Jason. No pin.
5. Last paragraph hidden at `md`, shown again at `xl` (`md:hidden xl:block`).

### RU

1. Экран **Lucia Caminos**, три фото, два абзаца био.
2. **Stacked до `2xl`**, две колонки от `2xl`.
3. Нахлёст; fade секции second video через registry.
4. Параллакс `y: -300` (как Jason).
5. Последний абзац: `md:hidden xl:block`.

---

## 7. Postcard

Component: `src/sections/PostCard.vue`  
Assets: `public/images/postcard/overlay.webp`, `public/videos/postcard-vd.mp4`

### EN

1. Centered postcard: gradient backdrop (`.animated-gradient-bg`), media in `.post-card-media` (video + frame overlay at 3:2 aspect ratio), CTA **Explore Leonida Keys**.
2. Wrapper `.post-card-wrapper`: side margins `mx-5` / `md:mx-12` / `xl:mx-56`. Media width `min(100%, calc(Nvh × 2560/1707))` — mobile `30vh`, tablet `50vh`, desktop `85vh`. CTA sits **outside** media overflow (`overflow-hidden` only on `.post-card-media`).
3. Hover: slight rotate/scale on wrapper; button tint to brand yellow.
4. No pin. Scrub `currentTime` from `0` to duration while the section travels `top center` → `bottom center`.
5. CTA links to `https://www.rockstargames.com/VI/leonida-keys` (new tab).

### RU

1. Открытка: градиент, `.post-card-media` (видео + overlay 3:2), CTA.
2. Отступы на wrapper; media с aspect-ratio и fluid width по `vh`; CTA вне `overflow-hidden` media.
3. Hover: rotate/scale; кнопка в жёлтый.
4. Pin нет; scrub `currentTime` (`top center` → `bottom center`).
5. CTA — официальный Leonida Keys (новая вкладка).

---

## 8. Final video

Component: `src/sections/FinalSection.vue`  
Asset: `public/videos/output3.mp4`

### EN

1. Full-viewport muted video inside `.final-content`, starts `opacity: 0` and CSS `scale-110`.
2. Pin (`start: 'top top'`, `end: '+=200%'`, `scrub: true`, `refreshPriority: -1`).
3. Separate scrub trigger fades `.final-content` in (`start: 'top bottom'`, `end: 'top top'`) and scales to `1`.
4. **In parallel** in pin timeline, scrub `currentTime` to duration. Empty hold at end of timeline (`duration: 3` padding).

### RU

1. Полноэкранное видео в `.final-content`, старт `opacity: 0`, `scale-110`.
2. Pin (`start: 'top top'`, `end: '+=200%'`, `refreshPriority: -1`).
3. Отдельный trigger проявляет `.final-content` (`top bottom` → `top top`) и `scale: 1`.
4. **Параллельно** scrub `currentTime`; в конце timeline — padding.

---

## 9. Outro (release date)

Component: `src/sections/OutroSection.vue`  
Assets: `public/images/outro/`

### EN

1. Same content as Hero Coming Soon: logo, **Coming November 19th 2026**, PlayStation and Xbox. Title uses pink–orange **text** gradient (`.gradient-title` with `clamp()`).
2. Starts overlapped on the final video (`margin-top: -100vh`) at `opacity: 0`.
3. On scrub (`start: 'top bottom'`, `end: 'top top'`): fade final video content out (registry target `finalContent`), fade this block in.
4. No pin. No radial mask (unlike Hero).

### RU

1. Как Coming Soon: лого, **Coming November 19th 2026**, PS / Xbox. Заголовок — text gradient + `clamp()`.
2. Старт: `margin-top: -100vh`, `opacity: 0`.
3. Scrub `top bottom` → `top top`: fade final video, проявить outro.
4. Pin нет. Радиальной маски нет.

---

## Screen order / Порядок на странице

1. NavBar (fixed)  
2. Hero + Coming Soon  
3. First video  
4. Jason  
5. Second video  
6. Lucia  
7. Postcard  
8. Final video  
9. Outro  
10. Site footer (unofficial disclaimer)
