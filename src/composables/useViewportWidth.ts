import { onUnmounted, readonly, ref, type Ref } from 'vue'

function getViewportWidth(): number {
  if (typeof window === 'undefined') return 0
  return window.innerWidth
}

/**
 * Tracks `window.innerWidth` and updates on resize.
 */
export function useViewportWidth(): {
  width: Readonly<Ref<number>>
} {
  const width = ref(getViewportWidth())

  if (typeof window === 'undefined') {
    return { width: readonly(width) }
  }

  const onResize = () => {
    width.value = window.innerWidth
  }

  window.addEventListener('resize', onResize)

  onUnmounted(() => {
    window.removeEventListener('resize', onResize)
  })

  return { width: readonly(width) }
}
