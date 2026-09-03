import { earlyDebugState } from '@/debug/captureEarlyState'
import { isDebugMode } from '@/composables/useDebugMode'
import { onMounted, readonly, ref } from 'vue'

export type ViewportSample = {
  atMs: number
  label: string
  innerHeight: number
  clientHeight: number
  vvHeight: number | null
  scrollY: number
}

const current = ref({
  innerWidth: 0,
  innerHeight: 0,
  clientHeight: 0,
  vvHeight: null as number | null,
  scrollY: 0,
  scrollX: 0,
})

const samples = ref<ViewportSample[]>([])
const minInnerHeight = ref(Number.POSITIVE_INFINITY)
const maxInnerHeight = ref(0)
const minVvHeight = ref(Number.POSITIVE_INFINITY)
const maxVvHeight = ref(0)

function recordSample(label: string) {
  if (typeof window === 'undefined') return

  const innerHeight = window.innerHeight
  const clientHeight = document.documentElement.clientHeight
  const vvHeight = window.visualViewport?.height ?? null
  const scrollY = window.scrollY

  current.value = {
    innerWidth: window.innerWidth,
    innerHeight,
    clientHeight,
    vvHeight,
    scrollY,
    scrollX: window.scrollX,
  }

  minInnerHeight.value = Math.min(minInnerHeight.value, innerHeight)
  maxInnerHeight.value = Math.max(maxInnerHeight.value, innerHeight)

  if (vvHeight !== null) {
    minVvHeight.value = Math.min(minVvHeight.value, vvHeight)
    maxVvHeight.value = Math.max(maxVvHeight.value, vvHeight)
  }

  samples.value.push({
    atMs: Math.round(performance.now()),
    label,
    innerHeight,
    clientHeight,
    vvHeight,
    scrollY,
  })

  if (samples.value.length > 40) {
    samples.value.shift()
  }
}

let listenersAttached = false
let mountHookRegistered = false

function attachListeners() {
  if (listenersAttached || typeof window === 'undefined') return
  listenersAttached = true

  const onChange = (label: string) => () => recordSample(label)

  window.addEventListener('resize', onChange('resize'))
  window.addEventListener('scroll', onChange('scroll'), { passive: true })
  window.visualViewport?.addEventListener('resize', onChange('vv-resize'))
  window.visualViewport?.addEventListener('scroll', onChange('vv-scroll'))
  window.addEventListener('orientationchange', onChange('orientation'))
}

function ensureViewportDebugMounted() {
  if (mountHookRegistered || !isDebugMode()) return
  mountHookRegistered = true

  onMounted(() => {
    recordSample('viewport-debug-init')
    attachListeners()
  })
}

export function useViewportDebug() {
  ensureViewportDebugMounted()

  return {
    early: earlyDebugState,
    current: readonly(current),
    samples: readonly(samples),
    minInnerHeight: readonly(minInnerHeight),
    maxInnerHeight: readonly(maxInnerHeight),
    minVvHeight: readonly(minVvHeight),
    maxVvHeight: readonly(maxVvHeight),
    recordSample,
  }
}
