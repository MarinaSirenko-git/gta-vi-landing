<script setup lang="ts">
import { usePrefersReducedMotion } from '@/composables/usePrefersReducedMotion'
import { useViewportWidth } from '@/composables/useViewportWidth'
import { useLazyVideoSource } from '@/composables/useLazyVideoSource'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { computed, onUnmounted, ref, watch } from 'vue'

const LEONIDA_KEYS_URL = 'https://www.rockstargames.com/VI/leonida-keys'

const { prefersReducedMotion } = usePrefersReducedMotion()
const { width } = useViewportWidth()
let ctx: gsap.Context | undefined

const postCardSection = ref<HTMLElement | null>(null)
const videoEl = ref<HTMLVideoElement | null>(null)

const isMobile = computed(() => width.value <= 768)

const killAnimations = () => {
  ctx?.revert()
  ctx = undefined
}

const setupAnimations = () => {
  const section = postCardSection.value
  const video = videoEl.value
  if (!section || !video) return

  killAnimations()

  ctx = gsap.context(() => {
    if (prefersReducedMotion.value) {
      video.currentTime = 0
      return
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top center',
        end: 'bottom center',
        scrub: true,
        refreshPriority: 0,
      },
    })

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

const { videoSrc, isVideoReady } = useLazyVideoSource(postCardSection, videoEl, '/videos/postcard-vd.mp4', onVideoReady, {
  rootMargin: '150% 0px',
  loadImmediately: () => prefersReducedMotion.value,
})

watch([prefersReducedMotion, isMobile], () => {
  if (!isVideoReady.value) return
  setupAnimations()
})

onUnmounted(() => {
  killAnimations()
})
</script>

<template>
  <section ref="postCardSection" class="post-card" aria-labelledby="postcard-heading">
    <div class="animated-gradient-bg" aria-hidden="true" />

    <div class="post-card-wrapper group transition duration-700 hover:rotate-1 hover:scale-[1.02]">
      <div class="post-card-media">
        <img
          src="/images/postcard/overlay.webp"
          alt=""
          width="2560"
          height="1707"
        />

        <p id="postcard-video-desc" class="sr-only">Leonida Keys postcard clip.</p>
        <video
          ref="videoEl"
          muted
          playsinline
          preload="none"
          :src="videoSrc"
          poster="/images/videos/postcard-poster.webp"
          title="Leonida Keys postcard"
          aria-describedby="postcard-video-desc"
        />
      </div>

      <h2 id="postcard-heading" class="sr-only">Leonida Keys</h2>
      <a
        :href="LEONIDA_KEYS_URL"
        target="_blank"
        rel="noopener noreferrer"
        class="transition duration-700 group-hover:bg-yellow cursor-pointer z-10 text-nowrap"
        aria-label="Explore Leonida Keys on the official site (opens in a new tab)"
      >
        Explore Leonida Keys
      </a>
    </div>
  </section>
</template>
