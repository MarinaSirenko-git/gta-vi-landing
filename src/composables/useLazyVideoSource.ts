import { nextTick, onMounted, onUnmounted, ref, type Ref } from 'vue'

type LazyVideoSourceOptions = {
  /** Load when the section is within this margin of the viewport. */
  rootMargin?: string
  /** Skip intersection waiting and assign src immediately (e.g. reduced motion). */
  loadImmediately?: () => boolean
}

function viewportMarginPx(rootMargin: string): number {
  const match = rootMargin.match(/^(-?\d+(?:\.\d+)?)(vh|%)/)
  if (!match?.[1]) return Math.round(window.innerHeight * 1.5)

  const value = Number.parseFloat(match[1])
  if (match[2] === 'vh') return Math.round((value / 100) * window.innerHeight)
  return Math.round((value / 100) * window.innerHeight)
}

function isNearViewport(element: HTMLElement, marginPx: number): boolean {
  const rect = element.getBoundingClientRect()
  return rect.top < window.innerHeight + marginPx && rect.bottom > -marginPx
}

export function useLazyVideoSource(
  sectionRef: Ref<HTMLElement | null>,
  videoRef: Ref<HTMLVideoElement | null>,
  src: string,
  onReady: () => void,
  options: LazyVideoSourceOptions = {},
) {
  const videoSrc = ref<string | undefined>(undefined)
  const rootMargin = options.rootMargin ?? '150% 0px'
  let observer: IntersectionObserver | undefined
  let readyListener: (() => void) | undefined
  let loading = false
  let scrollListenerAttached = false

  const marginPx = () => viewportMarginPx(rootMargin)

  const cleanupReadyListener = () => {
    if (readyListener && videoRef.value) {
      videoRef.value.removeEventListener('loadeddata', readyListener)
      readyListener = undefined
    }
  }

  const detachScrollListener = () => {
    if (!scrollListenerAttached) return
    window.removeEventListener('scroll', onScroll, { capture: true })
    scrollListenerAttached = false
  }

  const waitForFrames = (video: HTMLVideoElement) => {
    cleanupReadyListener()

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      onReady()
      return
    }

    readyListener = onReady
    video.addEventListener('loadeddata', readyListener, { once: true })
  }

  const beginLoad = async () => {
    if (loading || videoSrc.value) return
    loading = true

    videoSrc.value = src
    await nextTick()

    const video = videoRef.value
    if (!video) {
      loading = false
      return
    }

    video.preload = 'auto'
    video.load()
    waitForFrames(video)
    detachScrollListener()
    observer?.disconnect()
    observer = undefined
  }

  const tryLoadIfNear = () => {
    const section = sectionRef.value
    if (!section || videoSrc.value) return
    if (isNearViewport(section, marginPx())) {
      void beginLoad()
    }
  }

  const onScroll = () => {
    tryLoadIfNear()
  }

  const attachScrollListener = () => {
    if (scrollListenerAttached) return
    window.addEventListener('scroll', onScroll, { passive: true, capture: true })
    scrollListenerAttached = true
  }

  onMounted(() => {
    const section = sectionRef.value
    if (!section || !videoRef.value) return

    if (options.loadImmediately?.()) {
      void beginLoad()
      return
    }

    if (isNearViewport(section, marginPx())) {
      void beginLoad()
      return
    }

    observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void beginLoad()
        }
      },
      { rootMargin, threshold: 0 },
    )

    observer.observe(section)
    attachScrollListener()
  })

  onUnmounted(() => {
    observer?.disconnect()
    detachScrollListener()
    cleanupReadyListener()
  })

  return { videoSrc }
}
