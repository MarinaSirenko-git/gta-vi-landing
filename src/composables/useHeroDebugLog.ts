import { isDebugMode } from '@/composables/useDebugMode'
import { readonly, ref, type DeepReadonly, type Ref } from 'vue'

export type HeroDebugLogEntry = {
  id: number
  step: string
  detail: string
  atMs: number
  scrollY: number
  innerHeight: number
  vvHeight: number | null
}

const logs = ref<HeroDebugLogEntry[]>([])
let nextId = 1

function snapshot() {
  if (typeof window === 'undefined') {
    return { scrollY: 0, innerHeight: 0, vvHeight: null as number | null }
  }
  return {
    scrollY: window.scrollY,
    innerHeight: window.innerHeight,
    vvHeight: window.visualViewport?.height ?? null,
  }
}

export function heroDebugLog(step: string, detail: string | Record<string, unknown> = '') {
  if (!isDebugMode()) return

  const detailText =
    typeof detail === 'string' ? detail : JSON.stringify(detail, null, 0)

  const { scrollY, innerHeight, vvHeight } = snapshot()
  logs.value.push({
    id: nextId++,
    step,
    detail: detailText,
    atMs: Math.round(performance.now()),
    scrollY,
    innerHeight,
    vvHeight,
  })
}

export function useHeroDebugLog(): {
  logs: DeepReadonly<Ref<readonly HeroDebugLogEntry[]>>
  clearLogs: () => void
} {
  return {
    logs: readonly(logs),
    clearLogs: () => {
      logs.value = []
      nextId = 1
    },
  }
}
