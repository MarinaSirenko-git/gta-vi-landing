import { onUnmounted, readonly, ref, type Ref } from 'vue'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

function getPrefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia(REDUCED_MOTION_QUERY).matches
}

/**
 * Tracks whether the user asked the browser/OS to minimize motion
 * (`prefers-reduced-motion: reduce`). Updates if the setting changes.
 */
export function usePrefersReducedMotion(): {
  prefersReducedMotion: Readonly<Ref<boolean>>
} {
  const prefersReducedMotion = ref(getPrefersReducedMotion())

  if (typeof window === 'undefined') {
    return { prefersReducedMotion: readonly(prefersReducedMotion) }
  }

  const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY)

  const onChange = (event: MediaQueryListEvent) => {
    prefersReducedMotion.value = event.matches
  }

  mediaQuery.addEventListener('change', onChange)

  onUnmounted(() => {
    mediaQuery.removeEventListener('change', onChange)
  })

  return { prefersReducedMotion: readonly(prefersReducedMotion) }
}
