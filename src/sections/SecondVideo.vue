<script setup lang="ts">
import { usePrefersReducedMotion } from '@/composables/usePrefersReducedMotion'
import { useViewportWidth } from '@/composables/useViewportWidth'
import { useRegisterScrollTarget } from '@/composables/useScrollSceneRegistry'
import { useLazyVideoSource } from '@/composables/useLazyVideoSource'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { computed, onUnmounted, ref, watch } from 'vue'

const { prefersReducedMotion } = usePrefersReducedMotion()
const { width } = useViewportWidth()
let ctx: gsap.Context | undefined

const luciaSection = ref<HTMLElement | null>(null)
const videoEl = ref<HTMLVideoElement | null>(null)
useRegisterScrollTarget('secondVideo', luciaSection)

const isMobile = computed(() => width.value <= 768)
const overlap = computed(() => (isMobile.value ? '-80vh' : '-150vh'))

const killAnimations = () => {
  ctx?.revert()
  ctx = undefined
}

const setupAnimations = () => {
  const section = luciaSection.value
  const video = videoEl.value

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

const { videoSrc } = useLazyVideoSource(luciaSection, videoEl, '/videos/output2.mp4', onVideoReady, {
  rootMargin: '150% 0px',
  loadImmediately: () => prefersReducedMotion.value,
})

watch([prefersReducedMotion, isMobile], () => {
  setupAnimations()
})

onUnmounted(() => {
  killAnimations()
})
</script>

<template>
  <section ref="luciaSection" class="lucia" aria-label="Lucia story trailer">
    <p id="second-video-desc" class="sr-only">Lucia story trailer.</p>
    <div class="h-dvh">
      <video
        ref="videoEl"
        class="second-vd size-full object-cover"
        muted
        playsinline
        preload="none"
        :src="videoSrc"
        poster="/images/videos/second-video-poster.webp"
        title="Lucia Caminos story trailer"
        aria-describedby="second-video-desc"
        style="object-position: 15% 0%"
      />
    </div>
  </section>
</template>
