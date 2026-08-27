<script setup lang="ts">
  import { usePrefersReducedMotion } from '@/composables/usePrefersReducedMotion'
  import { useViewportWidth } from '@/composables/useViewportWidth'
  import gsap from 'gsap'
  import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

  const { prefersReducedMotion } = usePrefersReducedMotion()
  const { width } = useViewportWidth()
  let ctx: gsap.Context | undefined

  const luciaSection = ref<HTMLElement | null>(null)

  const isMobile = computed(() => width.value <= 768)

  const killAnimations = () => {
    ctx?.revert()
    ctx = undefined
  }

  const setupAnimations = () => {
    const section = luciaSection.value
    if (!section) return

    const secondVideoSection = document.querySelector('.lucia')

    killAnimations()

    ctx = gsap.context(() => {
      if (prefersReducedMotion.value) {
        gsap.set(section, { marginTop: 0 })
        if (secondVideoSection) gsap.set(secondVideoSection, { opacity: 1 })
        return
      }

      gsap.set(section, { marginTop: '-80vh' })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 40%',
          end: '10% center',
          scrub: 2,
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

      if (!secondVideoSection) return

      tl.to(secondVideoSection, {
        opacity: 0,
        duration: 1,
      })
    }, section)
  }

  onMounted(() => {
    setupAnimations()
  })

  watch([prefersReducedMotion, isMobile], () => {
    setupAnimations()
  })

  onUnmounted(() => {
    killAnimations()
  })
</script>

<template>
  <section ref="luciaSection" class="lucia-life" aria-labelledby="lucia-name">
    <div class="img-box mt-96 flex flex-col items-end gap-5 ps-10 lg:w-1/2">
      <figure class="lucia-1">
        <img src="/images/lucia/lucia-1.webp" alt="Lucia Caminos" />
      </figure>
      <figure class="lucia-3">
        <img src="/images/lucia/lucia-3.webp" alt="Lucia Caminos in Leonida" />
      </figure>
    </div>

    <div class="lucia-life-content lg:w-1/2">
      <div class="max-w-xl ps-10 lg:ps-32">
        <h2 id="lucia-name" class="character-name">Lucia Caminos</h2>
        <p class="character-tagline">
          Lucia’s father taught her to fight as soon as she could walk.
        </p>
        <p>
          Life has been coming at her swinging ever since. Fighting for her family landed her in the
          Leonida Penitentiary. Sheer luck got her out. Lucia’s learned her lesson — only smart
          moves from here.
        </p>
      </div>

      <figure class="lucia-2">
        <img src="/images/lucia/lucia-2.webp" alt="Lucia Caminos standing outdoors" />
      </figure>

      <p class="max-w-xl ps-10 lg:ps-32">
        More than anything, Lucia wants the good life her mom has dreamed of since their days in
        Liberty City — but instead of half-baked fantasies, Lucia is prepared to take matters into
        her own hands.
      </p>
    </div>
  </section>
</template>
