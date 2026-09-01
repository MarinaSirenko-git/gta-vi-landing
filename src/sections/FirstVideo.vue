<script setup lang="ts">
import { usePrefersReducedMotion } from '@/composables/usePrefersReducedMotion'
import { useViewportWidth } from '@/composables/useViewportWidth'
import gsap from 'gsap'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

const { prefersReducedMotion } = usePrefersReducedMotion()
const { width } = useViewportWidth()
const firstVideoSection = ref<HTMLElement | null>(null)
const videoEl = ref<HTMLVideoElement | null>(null)
let ctx: gsap.Context | undefined

const isMobile = computed(() => width.value <= 768)
const overlap = computed(() => (isMobile.value ? '-80vh' : '-150vh'))

const killAnimations = () => {
  ctx?.revert()
  ctx = undefined
}

const setupAnimations = () => {
  const section = firstVideoSection.value
  const video = videoEl.value
  const hero = document.querySelector('.hero-section')

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
  <section ref="firstVideoSection" class="first-vd-wrapper" aria-label="Story trailer">
    <div class="h-dvh">
      <video
        ref="videoEl"
        class="first-vd"
        muted
        playsinline
        preload="metadata"
        poster="/images/videos/first-video-poster.webp"
        src="/videos/output1.mp4"
        title="Grand Theft Auto VI story trailer"
      />
    </div>
  </section>
</template>
