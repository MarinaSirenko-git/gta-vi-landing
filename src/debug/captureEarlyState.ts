/** Captured synchronously when the JS bundle first evaluates (before Vue mount). */
export const earlyDebugState = {
  capturedAt: typeof performance !== 'undefined' ? performance.now() : 0,
  scrollY: typeof window !== 'undefined' ? window.scrollY : 0,
  scrollX: typeof window !== 'undefined' ? window.scrollX : 0,
  innerWidth: typeof window !== 'undefined' ? window.innerWidth : 0,
  innerHeight: typeof window !== 'undefined' ? window.innerHeight : 0,
  clientHeight:
    typeof document !== 'undefined' ? document.documentElement.clientHeight : 0,
  visualViewportHeight:
    typeof window !== 'undefined' ? (window.visualViewport?.height ?? null) : null,
  scrollRestoration:
    typeof history !== 'undefined' ? history.scrollRestoration : 'unknown',
  pageShowPersisted: null as boolean | null,
}

if (typeof window !== 'undefined') {
  window.addEventListener(
    'pageshow',
    (event) => {
      earlyDebugState.pageShowPersisted = event.persisted
    },
    { once: true },
  )
}
