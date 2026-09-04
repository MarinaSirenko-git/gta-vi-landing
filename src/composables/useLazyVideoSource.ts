import { nextTick, onMounted, onUnmounted, ref, watch, type Ref } from 'vue'

type LazyVideoSourceOptions = {
  /** Load when the section is within this margin of the viewport. */
  rootMargin?: string
  /** Skip intersection waiting and assign src immediately (e.g. reduced motion). */
  loadImmediately?: () => boolean
}

const READY_EVENTS = ['loadedmetadata', 'loadeddata', 'durationchange', 'canplay'] as const

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

function isVideoScrubReady(video: HTMLMediaElement): boolean {
  return (
    video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
    Number.isFinite(video.duration) &&
    video.duration > 0
  )
}

export function useLazyVideoSource(
  sectionRef: Ref<HTMLElement | null>,
  videoRef: Ref<HTMLVideoElement | null>,
  src: string,
  onReady: () => void,
  options: LazyVideoSourceOptions = {},
) {
  const videoSrc = ref<string | undefined>(undefined)
  const isVideoReady = ref(false)
  const rootMargin = options.rootMargin ?? '150% 0px'
  let observer: IntersectionObserver | undefined
  let readyListener: (() => void) | undefined
  let loading = false
  let scrollListenerAttached = false
  let observingStarted = false

  const marginPx = () => viewportMarginPx(rootMargin)

  const cleanupReadyListener = () => {
    const video = videoRef.value
    if (readyListener && video) {
      for (const event of READY_EVENTS) {
        video.removeEventListener(event, readyListener)
      }
    }
    readyListener = undefined
  }

  const detachScrollListener = () => {
    if (!scrollListenerAttached) return
    window.removeEventListener('scroll', onScroll, { capture: true })
    scrollListenerAttached = false
  }

  const notifyWhenScrubReady = (video: HTMLVideoElement) => {
    cleanupReadyListener()

    const tryNotify = () => {
      if (!isVideoScrubReady(video) || isVideoReady.value) return false

      cleanupReadyListener()
      isVideoReady.value = true
      onReady()
      return true
    }

    if (tryNotify()) return

    readyListener = () => {
      tryNotify()
    }

    for (const event of READY_EVENTS) {
      video.addEventListener(event, readyListener)
    }

    requestAnimationFrame(() => {
      tryNotify()
    })
  }

  const beginLoad = async () => {
    if (loading || videoSrc.value) return
    loading = true

    videoSrc.value = src
    await nextTick()

    let video = videoRef.value
    if (!video) {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve())
      })
      video = videoRef.value
    }

    if (!video) {
      videoSrc.value = undefined
      loading = false
      return
    }

    video.preload = 'auto'
    video.load()
    notifyWhenScrubReady(video)
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

  const startObserving = () => {
    if (observingStarted) return

    const section = sectionRef.value
    if (!section || !videoRef.value) return

    observingStarted = true

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
  }

  onMounted(() => {
    startObserving()

    if (!observingStarted) {
      const stop = watch([sectionRef, videoRef], () => {
        startObserving()
        if (observingStarted) stop()
      })
      onUnmounted(stop)
    }
  })

  onUnmounted(() => {
    observer?.disconnect()
    detachScrollListener()
    cleanupReadyListener()
  })

  return { videoSrc, isVideoReady }
}
