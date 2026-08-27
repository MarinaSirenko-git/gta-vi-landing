<script setup lang="ts">
import { usePrefersReducedMotion } from '@/composables/usePrefersReducedMotion'
import { useViewportWidth } from '@/composables/useViewportWidth'
import gsap from 'gsap'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

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
}

const onVideoReady = () => {
  setupAnimations()
}

onMounted(() => {
  const video = videoEl.value
  if (!video) return

  if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
    setupAnimations()
  } else {
    video.addEventListener('loadedmetadata', onVideoReady)
  }
})

watch([prefersReducedMotion, isMobile], () => {
  setupAnimations()
})

onUnmounted(() => {
  videoEl.value?.removeEventListener('loadedmetadata', onVideoReady)
  killAnimations()
})
</script>

<template>
  <section ref="postCardSection" class="post-card" aria-labelledby="postcard-heading">
    <div class="animated-gradient-bg" aria-hidden="true" />

    <div class="post-card-wrapper group transition duration-700 hover:rotate-1 hover:scale-[1.02]">
      <img src="/images/postcard/overlay.webp" alt="" />

      <video
        ref="videoEl"
        muted
        playsinline
        preload="auto"
        src="/videos/postcard-vd.mp4"
        title="Leonida Keys postcard"
      />

      <h2 id="postcard-heading" class="sr-only">Leonida Keys</h2>
      <button type="button" class="transition duration-700 group-hover:bg-yellow">
        Explore Leonida Keys
      </button>
    </div>
  </section>
</template>
