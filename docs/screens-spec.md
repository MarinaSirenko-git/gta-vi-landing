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
- Videos: muted, `playsinline`, no native controls. Drive `currentTime` from scroll after `loadedmetadata` (also handle the case when metadata is already ready).
- Do not ship unused course leftovers (for example `.mask-logo` if it is never animated).
- Semantic HTML and accessible names stay as in the current markup.

### RU

- Стек: Vue 3, TypeScript, Tailwind CSS v4, GSAP + ScrollTrigger.
- `ScrollTrigger` регистрировать один раз в `src/main.ts`.
- Твины создавать в `onMounted` внутри `gsap.context(scope)`. На размонтировании — `ctx.revert()`.
- Селекторы ограничивать корнем секции. Если триггер — сама секция, передавать элемент (`ref`), не строку класса: `querySelectorAll` не находит сам корень скоупа.
- Видео: без звука, `playsinline`, без нативных контролов. `currentTime` вести от скролла после `loadedmetadata` (учесть случай, когда метаданные уже есть).
- Не тащить мёртвые слои из курса (например `.mask-logo`, если его нигде не анимируют).
- Семантическая вёрстка и доступные имена — как в текущей разметке.

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

### EN

**Layers (bottom → top)**

1. Cover stack inside `.mask-wrapper`: background photo, brand wordmark (raster), “Watch Trailer”, play button.
2. CSS mask on that same wrapper: `mask-image` is the brand SVG (`big-hero-text.svg`). This is a hole, not a second text layer. Initial `mask-size` is huge (~3100–3500%) so the mask is invisible and the full cover shows.
3. Flash logo: the same SVG as a normal image (`.overlay-logo`), starts at `opacity: 0`.
4. Full-viewport release block (Coming Soon: logo, “Coming May 26th 2026”, PlayStation and Xbox). Hidden with a **CSS mask**, not `opacity` / `display`.

**Scroll:** pin the hero. Progress lasts about **two viewports** (`end: '+=200%'`, `scrub: 2.5`). The section stays on screen while the user scrolls.

**Sequence**

1. On load, show the cover set (background, brand raster, trailer label, play).
2. Fade out only the cover chrome (`.fade-out`): wordmark, trailer, play. **Keep the background.**
3. Scale the background from the CSS start scale (`md:scale-125`) down to `1`.
4. **At the same time** as (3), shrink the wrapper mask from the huge size to the compact size (~20–50% by breakpoint). The photo becomes visible only inside the GTA VI letter shapes.
5. Then, **in parallel**:
   - fade the masked wrapper to `opacity: 0`;
   - flash `.overlay-logo` to `opacity: 1`, then fade it out;
   - reveal Coming Soon by animating `mask-image` from a zero-radius radial mask to  
     `radial-gradient(circle at 50% 0vh, black 50%, transparent 100%)`.

**About the “gradient”:** the pink–orange fill on “Coming May 26th” is only title styling. The **radial-gradient** on `.entrance-message` is the reveal: black = visible, transparent = hidden. It wipes the release screen in from the top. It is not a decorative backdrop.

### RU

**Слои (снизу вверх)**

1. Обложка в `.mask-wrapper`: фото фона, брендовый текст (растр), «Watch Trailer», кнопка play.
2. CSS-маска на том же враппере: `mask-image` — брендовый SVG (`big-hero-text.svg`). Это дырка, не ещё один текстовый слой. Стартовый `mask-size` огромный (~3100–3500%), маска незаметна, видна вся обложка.
3. Вспышка логотипа: тот же SVG как обычная картинка (`.overlay-logo`), старт `opacity: 0`.
4. Полноэкранный блок даты продаж (Coming Soon: лого, «Coming May 26th 2026», PlayStation и Xbox). Скрыт **CSS-маской**, не через `opacity` / `display`.

**Скролл:** секция прибита (`pin`). Прогресс ≈ **два экрана** (`end: '+=200%'`, `scrub: 2.5`). Пока пользователь скроллит, hero остаётся в кадре.

**Последовательность**

1. На загрузке показать обложку (фон, растровый бренд, подпись трейлера, play).
2. Спрятать только хром обложки (`.fade-out`): слово, трейлер, play. **Фон оставить.**
3. Уменьшить фон со стартового CSS-скейла (`md:scale-125`) до `1`.
4. **Одновременно** с (3) уменьшить маску враппера с огромного размера до компактного (~20–50% по брейкпоинту). Фото читается только внутри силуэта букв GTA VI.
5. Затем **параллельно**:
   - погасить замаскированный враппер (`opacity: 0`);
   - показать вспышку `.overlay-logo` до `opacity: 1` и снова спрятать;
   - проявить Coming Soon, анимируя `mask-image` от нулевого радиального круга к  
     `radial-gradient(circle at 50% 0vh, black 50%, transparent 100%)`.

**Про «градиент»:** розово-оранжевая заливка «Coming May 26th» — только стиль заголовка. **radial-gradient** на `.entrance-message` — механизм показа: чёрное видно, прозрачное скрыто. Экран с датой проявляется кругом сверху. Это не декоративная подложка.

---

## 3. First video (Jason trailer)

Component: `src/sections/FirstVideo.vue`  
Asset: `public/videos/output1.mp4`

### EN

1. Full-viewport muted video. Starts pulled up over the hero (`margin-top` overlap) and at `opacity: 0`.
2. Pin for about two viewports (`end: '+=200% top'`, `scrub: true`).
3. Fade the hero out, then fade this section in.
4. **In parallel** with the fade-in, scrub `video.currentTime` from `0` to duration so playback follows scroll, not `play()`.

### RU

1. Полноэкранное видео без звука. Старт: нахлёст на hero (`margin-top`) и `opacity: 0`.
2. Pin примерно на два экрана (`end: '+=200% top'`, `scrub: true`).
3. Погасить hero, затем проявить эту секцию.
4. **Параллельно** проявлению вести `video.currentTime` от `0` до длительности: кадры от скролла, не `play()`.

---

## 4. Jason

Component: `src/sections/JasonSection.vue`  
Assets: `public/images/jason/`

### EN

1. Character page: name **Jason Duval**, tagline, bio, three photos (one in the copy column, two in `.img-box`).
2. Section overlaps the first video (`margin-top` negative).
3. As Jason enters, fade out the first video.
4. Parallax: `.img-box` moves up on scrub (`y: -300`) while the user scrolls through the section.
5. Photos keep the yellow crop frames and hover scale from CSS. No pin.

### RU

1. Экран персонажа: имя **Jason Duval**, слоган, био, три фото (одно в колонке текста, два в `.img-box`).
2. Секция нахлёстывается на первое видео (отрицательный `margin-top`).
3. Когда Jason входит, первое видео гаснет.
4. Параллакс: `.img-box` уезжает вверх по скроллу (`y: -300`).
5. Жёлтые рамки и hover-scale из CSS сохранить. Pin не нужен.

---

## 5. Second video (Lucia trailer)

Component: `src/sections/SecondVideo.vue`  
Asset: `public/videos/output2.mp4`

### EN

1. Full-viewport muted video (`object-position` toward the left/top). Class `lucia` is historical; keep a dedicated video class (`.second-vd`) for later fades.
2. Starts overlapped and hidden (`opacity: 0`). Pin while the section is in view (`start: 'top top'`, `end: 'bottom top'`, `scrub: 2`).
3. Fade the section in. **In parallel**, scrub `currentTime` to duration.

### RU

1. Полноэкранное видео без звука (кадр смещён влево/вверх). Класс `lucia` — наследие курса; для последующего fade оставить отдельный класс видео (`.second-vd`).
2. Старт: нахлёст и `opacity: 0`. Pin, пока секция в кадре (`start: 'top top'`, `end: 'bottom top'`, `scrub: 2`).
3. Проявить секцию. **Параллельно** вести `currentTime` до конца ролика.

---

## 6. Lucia

Component: `src/sections/LuciaSection.vue`  
Assets: `public/images/lucia/`

### EN

1. Character page: name **Lucia Caminos**, tagline, two bio paragraphs, three photos (`.img-box` on one side, one photo in the copy column).
2. Overlap the second video. As Lucia enters, fade `.second-vd` out.
3. Parallax `.img-box` upward (`y: -200`) on scrub. No pin.
4. Keep existing responsive copy (last paragraph hidden at some breakpoints).

### RU

1. Экран персонажа: имя **Lucia Caminos**, слоган, два абзаца био, три фото (`.img-box` с одной стороны, одно фото в колонке текста).
2. Нахлёст на второе видео. На входе Lucia гасить `.second-vd`.
3. Параллакс `.img-box` вверх (`y: -200`). Pin не нужен.
4. Адаптив текста сохранить (последний абзац скрыт на части брейкпоинтов).

---

## 7. Postcard

Component: `src/sections/PostCard.vue`  
Assets: `public/images/postcard/overlay.webp`, `public/videos/postcard-vd.mp4`

### EN

1. Centered postcard: gradient backdrop, video, frame overlay, CTA **Explore Leonida Keys**.
2. Hover: slight rotate/scale; button tint to brand yellow.
3. No pin. Scrub `currentTime` from `0` to duration while the section travels from `top center` to `bottom center`.
4. CTA is a link to the official Leonida Keys page on rockstargames.com (opens in a new tab).

### RU

1. Открытка по центру: градиентный фон, видео, рамка-оверлей, CTA **Explore Leonida Keys**.
2. Hover: лёгкий поворот/скейл; кнопка в брендовый жёлтый.
3. Pin нет. Пока секция едет от `top center` до `bottom center`, вести `currentTime` от `0` до конца.
4. CTA — ссылка на официальный раздел Leonida Keys на rockstargames.com (новая вкладка).

The postcard backdrop gradient is decorative. It is not the Hero radial mask.

Градиент под открыткой — декоративный фон. Это не радиальная маска Hero.

---

## 8. Final video

Component: `src/sections/FinalSection.vue`  
Asset: `public/videos/output3.mp4`

### EN

1. Full-viewport muted video, starts `opacity: 0` and slightly scaled up (CSS `scale-110`).
2. Pin the section (`start: 'top top'`, `end: '90% top'`).
3. Fade/scale content to visible (`opacity: 1`, `scale: 1`) as it enters. **In parallel**, scrub `currentTime` to duration.
4. Do not keep an empty pin-only timeline if one pin+content timeline can do the job.

### RU

1. Полноэкранное видео без звука, старт `opacity: 0` и слегка увеличенный масштаб (CSS `scale-110`).
2. Pin секции (`start: 'top top'`, `end: '90% top'`).
3. Проявить контент (`opacity: 1`, `scale: 1`). **Параллельно** вести `currentTime` до конца.
4. Пустой таймлайн «только ради pin» не нужен, если pin и контент живут в одном.

---

## 9. Outro (release date)

Component: `src/sections/OutroSection.vue`  
Assets: `public/images/outro/`

### EN

1. Same content as Hero Coming Soon: logo, **Coming May 26th 2026**, PlayStation and Xbox. Title uses the pink–orange **text** gradient only.
2. Starts overlapped on the final video (`margin-top: -100vh`) at `opacity: 0`.
3. On scrub (`start: 'top 30%'`, `end: 'top 10%'`): fade final video out, fade this block in.
4. No pin. No radial mask (unlike Hero).

### RU

1. Тот же смысл, что Coming Soon в Hero: лого, **Coming May 26th 2026**, PlayStation и Xbox. Градиент заголовка — только заливка **текста**.
2. Старт: нахлёст на финальное видео (`margin-top: -100vh`), `opacity: 0`.
3. По скроллу (`start: 'top 30%'`, `end: 'top 10%'`): погасить финальное видео, проявить этот блок.
4. Pin нет. Радиальной маски нет (в отличие от Hero).

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
