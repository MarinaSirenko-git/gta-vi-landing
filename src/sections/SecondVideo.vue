<script setup lang="ts">
import { usePrefersReducedMotion } from '@/composables/usePrefersReducedMotion'
import { useViewportWidth } from '@/composables/useViewportWidth'
import gsap from 'gsap'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

const { prefersReducedMotion } = usePrefersReducedMotion()
const { width } = useViewportWidth()
let ctx: gsap.Context | undefined

const lusiaSection = ref<HTMLElement | null>(null)
const videoEl = ref<HTMLVideoElement | null>(null)

const isMobile = computed(() => width.value <= 768)
const overlap = computed(() => (isMobile.value ? '-80vh' : '-150vh'))

const killAnimations = () => {
  ctx?.revert()
  ctx = undefined
}

const setupAnimations = () => {
  const section = lusiaSection.value
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
  <section ref="lusiaSection" class="lucia" aria-label="Lucia story trailer">
    <div class="h-dvh">
      <video
        ref="videoEl"
        class="second-vd size-full object-cover"
        muted
        playsinline
        preload="metadata"
        poster="/images/videos/second-video-poster.webp"
        src="/videos/output2.mp4"
        title="Lucia Caminos story trailer"
        style="object-position: 15% 0%"
      />
    </div>
  </section>
</template>
