import { readonly, ref } from 'vue'

function readDebugFlag(): boolean {
  if (typeof window === 'undefined') return false
  return new URLSearchParams(window.location.search).get('debug') === '1'
}

const debugEnabled = ref(readDebugFlag())

export function useDebugMode() {
  return { debugEnabled: readonly(debugEnabled) }
}

export function isDebugMode(): boolean {
  return debugEnabled.value
}
