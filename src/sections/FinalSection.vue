<script setup lang="ts">
import { usePrefersReducedMotion } from '@/composables/usePrefersReducedMotion'
import { useRegisterScrollTarget } from '@/composables/useScrollSceneRegistry'
import { useLazyVideoSource } from '@/composables/useLazyVideoSource'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { onUnmounted, ref, watch } from 'vue'

const { prefersReducedMotion } = usePrefersReducedMotion()
let ctx: gsap.Context | undefined

const finalSection = ref<HTMLElement | null>(null)
const finalContent = ref<HTMLElement | null>(null)
const videoEl = ref<HTMLVideoElement | null>(null)
useRegisterScrollTarget('finalContent', finalContent)

const killAnimations = () => {
  ctx?.revert()
  ctx = undefined
}

const setupAnimations = () => {
  const section = finalSection.value
  const video = videoEl.value
  if (!section || !video) return

  killAnimations()

  ctx = gsap.context(() => {
    if (prefersReducedMotion.value) {
      gsap.set('.final-content', { opacity: 1, scale: 1 })
      video.currentTime = 0
      return
    }

    gsap.set('.final-content', { opacity: 0 })
    
    gsap.to('.final-content', {
      opacity: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'top top',
        scrub: true,
        refreshPriority: -1,
      },
    })

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: '+=200%',
        scrub: true,
        pin: true,
        refreshPriority: -1,
      },
    })

    tl.to('.final-content', { scale: 1, ease: 'none', duration: 1 }, 0)

    if (Number.isFinite(video.duration) && video.duration > 0) {
      tl.fromTo(
        video,
        { currentTime: 0 },
        { currentTime: video.duration, ease: 'none', duration: 3 },
        0,
      )
    }

    tl.to({}, { duration: 3 }, 3)
  }, section)

  ScrollTrigger.refresh()
}

const onVideoReady = () => {
  setupAnimations()
}

const { videoSrc, isVideoReady } = useLazyVideoSource(finalSection, videoEl, '/videos/output3.mp4', onVideoReady, {
  rootMargin: '150% 0px',
  loadImmediately: () => prefersReducedMotion.value,
})

watch(prefersReducedMotion, () => {
  if (!isVideoReady.value) return
  setupAnimations()
})

onUnmounted(() => {
  killAnimations()
})
</script>

<template>
  <section ref="finalSection" class="final" aria-label="Final trailer">
    <p id="final-video-desc" class="sr-only">Final story trailer.</p>
    <div ref="finalContent" class="final-content size-full">
      <video
        ref="videoEl"
        class="final-vd size-full object-cover"
        muted
        playsinline
        preload="none"
        :src="videoSrc"
        poster="/images/videos/final-video-poster.webp"
        title="Grand Theft Auto VI final trailer"
        aria-describedby="final-video-desc"
      />
    </div>
  </section>
</template>
