<script setup lang="ts">
import gsap from 'gsap'
import { getHeroMaskSettings, maskGsapProps } from '@/composables/useHeroMaskSettings'
import { heroDebugLog } from '@/composables/useHeroDebugLog'
import { usePrefersReducedMotion } from '@/composables/usePrefersReducedMotion'
import { useRegisterScrollTarget } from '@/composables/useScrollSceneRegistry'
import { useViewportWidth } from '@/composables/useViewportWidth'
import { useViewportDebug } from '@/composables/useViewportDebug'
import ComingSoon from './ComingSoon.vue'
import { computed, onBeforeMount, onMounted, onUnmounted, ref, watch } from 'vue'

heroDebugLog('setup:imports-done')

const TRAILER_URL = 'https://www.youtube.com/watch?v=VQRLujxTm3c'

const { width, height } = useViewportWidth()
heroDebugLog('setup:useViewportWidth', { width: width.value, height: height.value })

const isMobile = computed(() => width.value <= 768)
const isTablet = computed(() => width.value > 768 && width.value <= 1024)
const showOverlayFlash = computed(() => !isMobile.value && !isTablet.value)
heroDebugLog('setup:breakpoints', {
  isMobile: isMobile.value,
  isTablet: isTablet.value,
  showOverlayFlash: showOverlayFlash.value,
})

const maskSettings = computed(() => getHeroMaskSettings(width.value, height.value))
heroDebugLog('setup:maskSettings-computed', maskSettings.value)

const maskWrapperStyle = computed(() => ({
  WebkitMaskSize: maskSettings.value.initialMaskSize,
  WebkitMaskPosition: maskSettings.value.initialMaskPos,
  maskSize: maskSettings.value.initialMaskSize,
  maskPosition: maskSettings.value.initialMaskPos,
}))
heroDebugLog('setup:maskWrapperStyle', maskWrapperStyle.value)

const { prefersReducedMotion } = usePrefersReducedMotion()
heroDebugLog('setup:prefersReducedMotion', { value: prefersReducedMotion.value })

const heroSection = ref<HTMLElement | null>(null)
const playIcon = ref<HTMLImageElement | null>(null)
useRegisterScrollTarget('hero', heroSection)
heroDebugLog('setup:refs-and-scroll-target')

const { recordSample } = useViewportDebug()

let layoutCtx: gsap.Context | undefined
let animationCtx: gsap.Context | undefined
let playBounce: gsap.core.Timeline | undefined

const bouncePlayIcon = () => {
  if (prefersReducedMotion.value) return
  playBounce?.restart()
}

const logDomMaskStyles = (label: string) => {
  const el = heroSection.value?.querySelector<HTMLElement>('.mask-wrapper')
  if (!el) {
    heroDebugLog(label, { error: 'mask-wrapper not found' })
    return
  }

  const cs = getComputedStyle(el)
  heroDebugLog(label, {
    maskSize: cs.maskSize,
    maskPosition: cs.maskPosition,
    webkitMaskSize: cs.getPropertyValue('-webkit-mask-size'),
    webkitMaskPosition: cs.getPropertyValue('-webkit-mask-position'),
    inlineStyle: el.getAttribute('style') ?? '',
  })
}

const applyInitialLayout = () => {
  heroDebugLog('applyInitialLayout:start')
  const hero = heroSection.value
  if (!hero) {
    heroDebugLog('applyInitialLayout:abort', { reason: 'hero ref null' })
    return
  }

  layoutCtx?.revert()
  heroDebugLog('applyInitialLayout:layoutCtx-reverted')

  layoutCtx = gsap.context(() => {
    const { initialMaskPos, initialMaskSize } = maskSettings.value
    heroDebugLog('applyInitialLayout:gsap.set-mask', {
      initialMaskPos,
      initialMaskSize,
    })

    gsap.set('.mask-wrapper', maskGsapProps(initialMaskPos, initialMaskSize))
    heroDebugLog('applyInitialLayout:gsap.set-mask-done')

    gsap.set('.mask-logo', {
      marginTop: '-100vh',
      opacity: 0,
    })
    heroDebugLog('applyInitialLayout:gsap.set-mask-logo')

    gsap.set('.entrance-message', { marginTop: '0vh' })
    heroDebugLog('applyInitialLayout:gsap.set-entrance-message')
  }, hero)

  heroDebugLog('applyInitialLayout:complete')
}

const killAnimations = () => {
  heroDebugLog('killAnimations')
  animationCtx?.revert()
  animationCtx = undefined
  playBounce = undefined
}

const setupAnimations = () => {
  heroDebugLog('setupAnimations:start', {
    prefersReducedMotion: prefersReducedMotion.value,
    hasHero: Boolean(heroSection.value),
  })

  if (prefersReducedMotion.value || !heroSection.value) {
    heroDebugLog('setupAnimations:skipped', {
      reason: prefersReducedMotion.value ? 'reduced-motion' : 'no-hero-ref',
    })
    return
  }

  killAnimations()

  animationCtx = gsap.context(() => {
    const { maskPos, maskSize } = maskSettings.value
    heroDebugLog('setupAnimations:timeline-mask-targets', { maskPos, maskSize })

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: heroSection.value,
        start: 'top top',
        scrub: 2.5,
        end: '+=200%',
        pin: true,
        refreshPriority: 3,
      },
    })
    heroDebugLog('setupAnimations:scrollTrigger-created')

    tl.to('.fade-out', {
      opacity: 0,
      ease: 'power1.inOut',
    })
    heroDebugLog('setupAnimations:tl-fade-out')

    tl.to('.scale-out', {
      scale: 1,
      ease: 'power1.inOut',
    })
    heroDebugLog('setupAnimations:tl-scale-out')

    tl.to(
      '.mask-wrapper',
      {
        ...maskGsapProps(maskPos, maskSize),
        ease: 'power1.inOut',
      },
      '<',
    )
    heroDebugLog('setupAnimations:tl-mask-shrink')

    tl.to('.mask-wrapper', { opacity: 0, pointerEvents: 'none' })
    heroDebugLog('setupAnimations:tl-mask-fade')

    if (showOverlayFlash.value) {
      tl.to(
        '.overlay-logo',
        {
          opacity: 1,
          onComplete: () => {
            gsap.to('.overlay-logo', { opacity: 0 })
          },
        },
        '<',
      )
      heroDebugLog('setupAnimations:tl-overlay-flash')
    }

    tl.to(
      '.entrance-message',
      {
        duration: 1,
        ease: 'power1.inOut',
        maskImage: 'radial-gradient(circle at 50% 0vh, black 50%, transparent 100%)',
      },
      '<',
    )
    heroDebugLog('setupAnimations:tl-entrance-reveal')

    playBounce = gsap.timeline({ paused: true }).to(playIcon.value, {
      scale: 1.35,
      duration: 0.5,
      ease: 'power2.out',
      repeat: 3,
      yoyo: true,
    })
    heroDebugLog('setupAnimations:playBounce-created')
  }, heroSection.value)

  heroDebugLog('setupAnimations:complete')
}

onBeforeMount(() => {
  heroDebugLog('onBeforeMount', maskSettings.value)
  heroDebugLog('maskSettings@render', maskSettings.value)
  recordSample('hero-beforeMount')
})

onMounted(() => {
  heroDebugLog('onMounted')
  recordSample('hero-mounted')

  applyInitialLayout()
  logDomMaskStyles('dom-mask@post-layout')

  setupAnimations()
  logDomMaskStyles('dom-mask@post-animations')

  requestAnimationFrame(() => {
    recordSample('hero-rAF-1')
    logDomMaskStyles('dom-mask@rAF')
    requestAnimationFrame(() => {
      recordSample('hero-rAF-2')
      logDomMaskStyles('dom-mask@rAF-2')
    })
  })
})

watch([prefersReducedMotion, isMobile, isTablet, height], () => {
  heroDebugLog('watch:breakpoint-or-motion', {
    prefersReducedMotion: prefersReducedMotion.value,
    isMobile: isMobile.value,
    isTablet: isTablet.value,
    width: width.value,
    height: height.value,
  })
  if (prefersReducedMotion.value) killAnimations()
  applyInitialLayout()
  if (!prefersReducedMotion.value) setupAnimations()
})

onUnmounted(() => {
  heroDebugLog('onUnmounted')
  killAnimations()
  layoutCtx?.revert()
})
</script>

<template>
  <section ref="heroSection" id="top" class="hero-section" aria-labelledby="site-title">
    <h1 id="site-title" class="sr-only">Grand Theft Auto VI</h1>

    <div class="mask-wrapper size-full" :style="maskWrapperStyle">
      <!-- object-cover crops the landscape art to ~26% of its width on phones,
           so narrow viewports get a pre-cropped portrait frame instead -->
      <picture class="contents">
        <source
          media="(max-width: 767px)"
          srcset="/images/hero/hero-bg-portrait.avif"
          type="image/avif"
        />
        <source
          media="(max-width: 767px)"
          srcset="/images/hero/hero-bg-portrait.webp"
          type="image/webp"
        />
        <source srcset="/images/hero/hero-bg.avif" type="image/avif" />
        <img
          src="/images/hero/hero-bg.webp"
          alt=""
          width="3560"
          height="1826"
          fetchpriority="high"
          class="scale-out"
        />
      </picture>
      <img
        src="/images/hero/hero-text.webp"
        alt="Grand Theft Auto VI"
        width="3560"
        height="1826"
        class="title-logo fade-out"
      />
      <p class="trailer-logo fade-out">
        <img
          src="/images/hero/watch-trailer.webp"
          alt="Watch Trailer"
          width="250"
          height="250"
        />
      </p>
      <a
        :href="TRAILER_URL"
        target="_blank"
        rel="noopener noreferrer"
        class="play-img fade-out"
        aria-label="Play trailer on YouTube (opens in a new tab)"
        @mouseenter="bouncePlayIcon"
        @focus="bouncePlayIcon"
      >
        <img
          ref="playIcon"
          src="/images/hero/play.svg"
          alt=""
          width="28"
          height="28"
          class="ml-1 w-7"
        />
      </a>
    </div>

    <div>
      <img
        src="/images/hero/big-hero-text.svg"
        alt=""
        width="224"
        height="150"
        class="mask-logo size-full object-cover"
      />
    </div>

    <div class="fake-logo-wrapper">
      <img
        src="/images/hero/big-hero-text.svg"
        alt=""
        width="224"
        height="150"
        class="overlay-logo"
      />
    </div>

    <ComingSoon />
  </section>
</template>
