<script setup lang="ts">
import { usePrefersReducedMotion } from '@/composables/usePrefersReducedMotion'
import { useScrollSceneTarget } from '@/composables/useScrollSceneRegistry'
import gsap from 'gsap'
import { onMounted, onUnmounted, ref, watch } from 'vue'

const { prefersReducedMotion } = usePrefersReducedMotion()
let ctx: gsap.Context | undefined

const messageSection = ref<HTMLElement | null>(null)
const finalContentTarget = useScrollSceneTarget('finalContent')

const killAnimations = () => {
  ctx?.revert()
  ctx = undefined
}

const setupAnimations = () => {
  const section = messageSection.value
  const finalContent = finalContentTarget.value

  if (!section) return

  killAnimations()

  ctx = gsap.context(() => {
    if (prefersReducedMotion.value) {
      gsap.set(section, { marginTop: 0, opacity: 1 })
      if (finalContent) gsap.set(finalContent, { opacity: 1 })
      return
    }

    // Pulled over the pinned final section so the message scrolls across the
    // still-fixed video instead of pushing it off screen.
    gsap.set(section, { marginTop: '-100vh', opacity: 0 })

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'top top',
        scrub: true,
        refreshPriority: -2,
      },
    })

    tl.to(section, { opacity: 1, ease: 'none', duration: 1 }, 0)

    if (finalContent) {
      tl.to(finalContent, { opacity: 0, ease: 'none', duration: 1 }, 0)
    }
  }, section)
}

onMounted(() => {
  setupAnimations()
})

watch([prefersReducedMotion, finalContentTarget], () => {
  setupAnimations()
})

onUnmounted(() => {
  killAnimations()
})
</script>

<template>
  <section ref="messageSection" class="final-message" aria-labelledby="outro-heading">
    <div class="col-center h-full gap-10">
      <img
        src="/images/outro/logo-480.webp"
        srcset="
          /images/outro/logo-240.webp 240w,
          /images/outro/logo-320.webp 320w,
          /images/outro/logo-480.webp 480w
        "
        sizes="(min-width: 768px) 288px, 208px"
        alt="Grand Theft Auto VI"
        width="480"
        height="321"
        loading="lazy"
        class="w-52 md:w-72"
      />

      <h2 id="outro-heading" class="gradient-title">
        Coming
        <br />
        <time datetime="2026-11-19">November 19th</time>
        <br />
        2026
      </h2>

      <ul class="flex-center gap-10" aria-label="Available on">
        <li>
          <img
            src="/images/outro/ps-logo.svg"
            alt="PlayStation"
            width="93"
            height="20"
            loading="lazy"
            class="w-20 md:w-32"
          />
        </li>
        <li>
          <img
            src="/images/outro/x-logo.svg"
            alt="Xbox"
            width="158"
            height="20"
            loading="lazy"
            class="w-40 md:w-52"
          />
        </li>
      </ul>
    </div>
  </section>
</template>
