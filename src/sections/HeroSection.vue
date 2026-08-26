<script setup lang="ts">
import gsap from 'gsap'
import { useHeroMaskSettings } from '@/composables/useHeroMaskSettings'
import { usePrefersReducedMotion } from '@/composables/usePrefersReducedMotion'
import ComingSoon from './ComingSoon.vue'
import { onMounted, onUnmounted, ref, watch } from 'vue'

const { initialMaskPos, initialMaskSize, maskSize } = useHeroMaskSettings()
const { prefersReducedMotion } = usePrefersReducedMotion()
const heroSection = ref<HTMLElement | null>(null)
const playIcon = ref<HTMLImageElement | null>(null)
let layoutCtx: gsap.Context | undefined
let animationCtx: gsap.Context | undefined
let playBounce: gsap.core.Timeline | undefined

const bouncePlayIcon = () => {
  if (prefersReducedMotion.value) return
  playBounce?.restart()
}

const applyInitialLayout = () => {
  const hero = heroSection.value
  if (!hero) return

  layoutCtx?.revert()

  layoutCtx = gsap.context(() => {
    gsap.set('.mask-wrapper', {
      maskPosition: initialMaskPos,
      maskSize: initialMaskSize,
    })

    gsap.set('.mask-logo', {
      marginTop: '-100vh',
      opacity: 0,
    })

    gsap.set('.entrance-message', { marginTop: '0vh' })

    const playButton = hero.querySelector('.play-img')
    if (playButton instanceof HTMLButtonElement) {
      const hidePlay = prefersReducedMotion.value
      gsap.set(playButton, {
        autoAlpha: hidePlay ? 0 : 1,
        pointerEvents: hidePlay ? 'none' : 'auto',
      })
      playButton.inert = hidePlay
    }
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
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: heroSection.value,
        start: 'top top',
        scrub: 2.5,
        end: '+=200%',
        pin: true,
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
          ease: 'power1.inOut',
        },
        '<',
      )
      .to('.mask-wrapper', { opacity: 0, pointerEvents: 'none' })
      .to(
        '.overlay-logo',
        {
          opacity: 1,
          onComplete: () => {
            gsap.to('.overlay-logo', { opacity: 0 })
          },
        },
        '<',
      )
      .to(
        '.entrance-message',
        {
          duration: 1,
          ease: 'power1.inOut',
          maskImage: 'radial-gradient(circle at 50% 0vh, black 50%, transparent 100%)',
        },
        '<',
      )

    playBounce = gsap
      .timeline({ paused: true })
      .to(playIcon.value, { rotation: 90, duration: 0.5, ease: 'power2.out' })
      .to(playIcon.value, {
        y: 38,
        duration: 1,
        ease: 'power2.out',
        repeat: 3,
        yoyo: true,
      })
      .to(playIcon.value, { rotation: 0, duration: 0.5, ease: 'power2.out' })
  }, heroSection.value)
}

onMounted(() => {
  applyInitialLayout()
  setupAnimations()
})

watch(prefersReducedMotion, (reduced) => {
  if (reduced) killAnimations()
  applyInitialLayout()
  if (!reduced) setupAnimations()
})

onUnmounted(() => {
  killAnimations()
  layoutCtx?.revert()
})
</script>

<template>
  <section ref="heroSection" id="top" class="hero-section" aria-labelledby="site-title">
    <h1 id="site-title" class="sr-only">Grand Theft Auto VI</h1>

    <div class="mask-wrapper size-full">
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
      <button
        type="button"
        class="play-img fade-out"
        aria-label="Play trailer"
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
      </button>
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
