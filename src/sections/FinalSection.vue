<script setup lang="ts">
import { usePrefersReducedMotion } from '@/composables/usePrefersReducedMotion'
import gsap from 'gsap'
import { onMounted, onUnmounted, ref, watch } from 'vue'

const { prefersReducedMotion } = usePrefersReducedMotion()
let ctx: gsap.Context | undefined

const finalSection = ref<HTMLElement | null>(null)
const videoEl = ref<HTMLVideoElement | null>(null)

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

    // Empty tail holds the pin open past the last frame, reserving the second
    // half of the range for the outro to scroll over the still-pinned video.
    tl.to({}, { duration: 3 }, 3)
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

watch(prefersReducedMotion, () => {
  setupAnimations()
})

onUnmounted(() => {
  videoEl.value?.removeEventListener('loadedmetadata', onVideoReady)
  killAnimations()
})
</script>

<template>
  <section ref="finalSection" class="final" aria-label="Final trailer">
    <div class="final-content size-full">
      <video
        ref="videoEl"
        class="final-vd size-full object-cover"
        muted
        playsinline
        preload="auto"
        src="/videos/output3.mp4"
        title="Grand Theft Auto VI final trailer"
      />
    </div>
  </section>
</template>
