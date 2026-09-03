<script setup lang="ts">
import gsap from 'gsap'
import { getHeroMaskSettings } from '@/composables/useHeroMaskSettings'
import { usePrefersReducedMotion } from '@/composables/usePrefersReducedMotion'
import { useRegisterScrollTarget } from '@/composables/useScrollSceneRegistry'
import { useViewportWidth } from '@/composables/useViewportWidth'
import ComingSoon from './ComingSoon.vue'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

const TRAILER_URL = 'https://www.youtube.com/watch?v=VQRLujxTm3c'

const { width } = useViewportWidth()
const isMobile = computed(() => width.value <= 768)
const isTablet = computed(() => width.value > 768 && width.value <= 1024)
const showOverlayFlash = computed(() => !isMobile.value && !isTablet.value)

const maskSettings = computed(() => getHeroMaskSettings(width.value))
const maskWrapperStyle = computed(() => ({
  WebkitMaskSize: maskSettings.value.initialMaskSize,
  WebkitMaskPosition: maskSettings.value.initialMaskPos,
  maskSize: maskSettings.value.initialMaskSize,
  maskPosition: maskSettings.value.initialMaskPos,
}))
const { prefersReducedMotion } = usePrefersReducedMotion()
const heroSection = ref<HTMLElement | null>(null)
const playIcon = ref<HTMLImageElement | null>(null)
useRegisterScrollTarget('hero', heroSection)
let layoutCtx: gsap.Context | undefined
let animationCtx: gsap.Context | undefined
let playBounce: gsap.core.Timeline | undefined

// The trailer link itself stays available with reduced motion — only the pulse is skipped.
const bouncePlayIcon = () => {
  if (prefersReducedMotion.value) return
  playBounce?.restart()
}

const applyInitialLayout = () => {
  const hero = heroSection.value
  if (!hero) return

  layoutCtx?.revert()

  layoutCtx = gsap.context(() => {
    const { initialMaskPos, initialMaskSize } = maskSettings.value

    gsap.set('.mask-wrapper', {
      maskPosition: initialMaskPos,
      maskSize: initialMaskSize,
    })

    gsap.set('.mask-logo', {
      marginTop: '-100vh',
      opacity: 0,
    })

    gsap.set('.entrance-message', { marginTop: '0vh' })
  }, hero)
}

const killAnimations = () => {
  animationCtx?.revert()
  animationCtx = undefined
  playBounce = undefined
}

const setupAnimations = () => {
  if (prefersReducedMotion.value || !heroSection.value) return

  killAnimations()

  animationCtx = gsap.context(() => {
    const { maskPos, maskSize } = maskSettings.value

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

    tl.to('.fade-out', {
      opacity: 0,
      ease: 'power1.inOut',
    })
      .to('.scale-out', {
        scale: 1,
        ease: 'power1.inOut',
      })
      .to(
        '.mask-wrapper',
        {
          maskSize,
          maskPosition: maskPos,
          ease: 'power1.inOut',
        },
        '<',
      )
      .to('.mask-wrapper', { opacity: 0, pointerEvents: 'none' })

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

    playBounce = gsap.timeline({ paused: true }).to(playIcon.value, {
      scale: 1.35,
      duration: 0.5,
      ease: 'power2.out',
      repeat: 3,
      yoyo: true,
    })
  }, heroSection.value)
}

onMounted(() => {
  applyInitialLayout()
  setupAnimations()
})

watch([prefersReducedMotion, isMobile, isTablet], () => {
  if (prefersReducedMotion.value) killAnimations()
  applyInitialLayout()
  if (!prefersReducedMotion.value) setupAnimations()
})

onUnmounted(() => {
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
