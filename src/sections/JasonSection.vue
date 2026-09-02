<script setup lang="ts">
import { usePrefersReducedMotion } from '@/composables/usePrefersReducedMotion'
import { useViewportWidth } from '@/composables/useViewportWidth'
import { useScrollSceneTarget } from '@/composables/useScrollSceneRegistry'
import gsap from 'gsap'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

const { prefersReducedMotion } = usePrefersReducedMotion()
const { width } = useViewportWidth()
let ctx: gsap.Context | undefined

const jasonSection = ref<HTMLElement | null>(null)
const firstVideoTarget = useScrollSceneTarget('firstVideo')

const isMobile = computed(() => width.value <= 768)

const killAnimations = () => {
  ctx?.revert()
  ctx = undefined
}

const setupAnimations = () => {
  const section = jasonSection.value
  if (!section) return

  const firstVideoSection = firstVideoTarget.value

  killAnimations()

  ctx = gsap.context(() => {
    if (prefersReducedMotion.value) {
      gsap.set(section, { marginTop: 0 })
      if (firstVideoSection) gsap.set(firstVideoSection, { opacity: 1 })
      return
    }

    gsap.set(section, { marginTop: '-80vh' })

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 40%',
        end: '10% center',
        scrub: 2,
        refreshPriority: 1,
      },
    })

    gsap.to('.img-box', {
      y: -300,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top center',
        end: '80% center',
        scrub: 2,
        refreshPriority: 1,
      },
    })

    if (!firstVideoSection) return

    tl.to(firstVideoSection, {
      opacity: 0,
      duration: 1,
    })
  }, section)
}

onMounted(() => {
  setupAnimations()
})

watch([prefersReducedMotion, isMobile, firstVideoTarget], () => {
  setupAnimations()
})

onUnmounted(() => {
  killAnimations()
})
</script>

<template>
  <section ref="jasonSection" class="jason" aria-labelledby="jason-name">
    <div class="jason-content max-w-lg lg:w-1/2">
      <h2 id="jason-name" class="character-name">Jason Duval</h2>
      <p class="character-tagline">
        Jason wants an easy life, but things just keep getting harder.
      </p>
      <p>
        Jason grew up around grifters and crooks. After a stint in the Army trying to shake off his
        troubled teens, he found himself in the Keys doing what he knows best, working for local
        drug runners. It might be time to try something new.
      </p>

      <figure class="jason-2">
        <img src="/images/jason/jason-2.webp" alt="Jason Duval" />
      </figure>
    </div>

    <div class="img-box mt-96 min-w-0 space-y-5 lg:w-1/2">
      <figure class="jason-1">
        <img src="/images/jason/jason-1.webp" alt="Jason Duval leaning against a car" />
      </figure>
      <figure class="jason-3">
        <img src="/images/jason/jason-3.webp" alt="Jason Duval in Leonida" />
      </figure>
    </div>
  </section>
</template>
