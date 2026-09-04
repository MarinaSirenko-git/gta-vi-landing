<script setup lang="ts">
import { usePrefersReducedMotion } from '@/composables/usePrefersReducedMotion'
import { useViewportWidth } from '@/composables/useViewportWidth'
import {
  useRegisterScrollTarget,
  useScrollSceneTarget,
} from '@/composables/useScrollSceneRegistry'
import { useLazyVideoSource } from '@/composables/useLazyVideoSource'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { computed, onUnmounted, ref, watch } from 'vue'

const { prefersReducedMotion } = usePrefersReducedMotion()
const { width } = useViewportWidth()
const firstVideoSection = ref<HTMLElement | null>(null)
const videoEl = ref<HTMLVideoElement | null>(null)
const heroTarget = useScrollSceneTarget('hero')
useRegisterScrollTarget('firstVideo', firstVideoSection)
let ctx: gsap.Context | undefined

const isMobile = computed(() => width.value <= 768)
const overlap = computed(() => (isMobile.value ? '-80vh' : '-150vh'))
const posterSrc = computed(() =>
  isMobile.value
    ? '/images/videos/first-video-poster-640.webp'
    : '/images/videos/first-video-poster.webp',
)

const killAnimations = () => {
  ctx?.revert()
  ctx = undefined
}

const setupAnimations = () => {
  const section = firstVideoSection.value
  const video = videoEl.value
  const hero = heroTarget.value

  if (!section || !video) return

  killAnimations()

  ctx = gsap.context(() => {
    if (prefersReducedMotion.value) {
      gsap.set(section, { marginTop: 0, opacity: 1 })
      video.currentTime = 0
      return
    }

    gsap.set(section, {
      marginTop: overlap.value,
      opacity: 0,
    })

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: '+=200% top',
        scrub: true,
        pin: true,
        refreshPriority: 2,
      },
    })

    if (hero) {
      tl.to(hero, { opacity: 0, ease: 'none', duration: 1 })
    }

    tl.to(section, { opacity: 1, ease: 'none', duration: 1 })

    if (Number.isFinite(video.duration) && video.duration > 0) {
      tl.fromTo(
        video,
        { currentTime: 0 },
        { currentTime: video.duration, ease: 'none', duration: 3 },
        0,
      )
    }
  }, section)

  ScrollTrigger.refresh()
}

const onVideoReady = () => {
  setupAnimations()
}

const { videoSrc } = useLazyVideoSource(firstVideoSection, videoEl, '/videos/output1.mp4', onVideoReady, {
  rootMargin: '150% 0px',
  loadImmediately: () => prefersReducedMotion.value,
})

watch([prefersReducedMotion, isMobile, heroTarget], () => {
  setupAnimations()
})

onUnmounted(() => {
  killAnimations()
})
</script>

<template>
  <section ref="firstVideoSection" class="first-vd-wrapper" aria-label="Story trailer">
    <p id="first-video-desc" class="sr-only">Jason story trailer.</p>
    <div class="h-dvh">
      <video
        ref="videoEl"
        class="first-vd"
        muted
        playsinline
        preload="none"
        :src="videoSrc"
        :poster="posterSrc"
        title="Grand Theft Auto VI story trailer"
        aria-describedby="first-video-desc"
      />
    </div>
  </section>
</template>
