import { onUnmounted, readonly, ref, type Ref } from 'vue'

function getViewportWidth(): number {
  if (typeof window === 'undefined') return 0
  return window.innerWidth
}

function getViewportHeight(): number {
  if (typeof window === 'undefined') return 0
  return window.innerHeight
}

/**
 * Tracks `window.innerWidth` / `innerHeight` and updates on resize.
 */
export function useViewportWidth(): {
  width: Readonly<Ref<number>>
  height: Readonly<Ref<number>>
} {
  const width = ref(getViewportWidth())
  const height = ref(getViewportHeight())

  if (typeof window === 'undefined') {
    return { width: readonly(width), height: readonly(height) }
  }

  const onResize = () => {
    width.value = getViewportWidth()
    height.value = getViewportHeight()
  }

  window.addEventListener('resize', onResize)

  onUnmounted(() => {
    window.removeEventListener('resize', onResize)
  })

  return { width: readonly(width), height: readonly(height) }
}
