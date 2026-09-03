<script setup lang="ts">
import { useDebugMode } from '@/composables/useDebugMode'
import { useHeroDebugLog } from '@/composables/useHeroDebugLog'
import { useViewportDebug } from '@/composables/useViewportDebug'
import { computed, ref } from 'vue'

const { debugEnabled } = useDebugMode()
const { logs } = useHeroDebugLog()
const {
  early,
  current,
  samples,
  minInnerHeight,
  maxInnerHeight,
  minVvHeight,
  maxVvHeight,
} = useViewportDebug()

const collapsed = ref(false)

const scrollRestored = computed(() => {
  const atHero = logs.value.find((e) => e.step === 'onMounted')?.scrollY ?? null
  return {
    earlyScrollY: early.scrollY,
    earlyScrollX: early.scrollX,
    atHeroMount: atHero,
    now: current.value.scrollY,
    restoration: early.scrollRestoration,
    bfcache: early.pageShowPersisted,
    likelyRestored:
      early.scrollY > 0 ||
      (atHero !== null && atHero > 0) ||
      early.pageShowPersisted === true,
  }
})

const maskAtRender = computed(() => {
  const entry = [...logs.value].reverse().find((e) => e.step === 'maskSettings@render')
  if (!entry?.detail) return null
  try {
    return JSON.parse(entry.detail) as Record<string, string>
  } catch {
    return null
  }
})

const domMask = computed(() => {
  const entry = [...logs.value].reverse().find((e) => e.step === 'dom-mask@rAF')
  if (!entry?.detail) return null
  try {
    return JSON.parse(entry.detail) as Record<string, string>
  } catch {
    return null
  }
})

const viewportDelta = computed(() => ({
  innerH: maxInnerHeight.value - minInnerHeight.value,
  vvH:
    maxVvHeight.value === 0 && minVvHeight.value === Number.POSITIVE_INFINITY
      ? 0
      : maxVvHeight.value - minVvHeight.value,
}))
</script>

<template>
  <aside
    v-if="debugEnabled"
    class="debug-banner"
    :class="{ 'debug-banner--collapsed': collapsed }"
    aria-label="Debug diagnostics"
  >
    <header class="debug-banner__head">
      <strong>DEBUG ?debug=1</strong>
      <button type="button" class="debug-banner__toggle" @click="collapsed = !collapsed">
        {{ collapsed ? 'Expand' : 'Collapse' }}
      </button>
    </header>

    <div v-show="!collapsed" class="debug-banner__body">
      <section>
        <h3>1. Scroll / restore</h3>
        <p :class="{ 'debug-warn': scrollRestored.likelyRestored }">
          early scrollY: {{ scrollRestored.earlyScrollY }}px · at hero mount:
          {{ scrollRestored.atHeroMount ?? '—' }}px · now: {{ scrollRestored.now }}px
        </p>
        <p>
          history.scrollRestoration: {{ scrollRestored.restoration }} · bfcache:
          {{ scrollRestored.bfcache ?? 'pending' }}
        </p>
        <p v-if="scrollRestored.likelyRestored" class="debug-warn">
          ⚠ Scroll &gt; 0 or bfcache — mask may already be mid-animation
        </p>
      </section>

      <section>
        <h3>2. Mask @ Hero render (4 params)</h3>
        <template v-if="maskAtRender">
          <p>initialMaskPos: {{ maskAtRender.initialMaskPos }}</p>
          <p>initialMaskSize: {{ maskAtRender.initialMaskSize }}</p>
          <p>maskPos: {{ maskAtRender.maskPos }}</p>
          <p>maskSize: {{ maskAtRender.maskSize }}</p>
        </template>
        <p v-else class="debug-muted">waiting for Hero render…</p>
        <template v-if="domMask">
          <p class="debug-muted">DOM computed (after rAF):</p>
          <p>mask-size: {{ domMask.maskSize }}</p>
          <p>mask-position: {{ domMask.maskPosition }}</p>
          <p>-webkit-mask-size: {{ domMask.webkitMaskSize }}</p>
        </template>
      </section>

      <section>
        <h3>3. Viewport height</h3>
        <p>
          early innerH: {{ early.innerHeight }} · vv: {{ early.visualViewportHeight ?? '—' }}
        </p>
        <p>
          now innerH: {{ current.innerHeight }} · clientH: {{ current.clientHeight }} · vv:
          {{ current.vvHeight ?? '—' }}
        </p>
        <p>
          range innerH:
          {{ Number.isFinite(minInnerHeight) ? minInnerHeight : '—' }}–{{ maxInnerHeight }}
          (Δ{{ viewportDelta.innerH }}px)
        </p>
        <p v-if="viewportDelta.vvH > 0">
          range vvH:
          {{ Number.isFinite(minVvHeight) ? minVvHeight : '—' }}–{{ maxVvHeight }} (Δ{{
            viewportDelta.vvH
          }}px) — address bar?
        </p>
        <ul class="debug-samples">
          <li v-for="s in samples.slice(-6)" :key="s.atMs + s.label">
            {{ s.atMs }}ms {{ s.label }}: ih={{ s.innerHeight }} vv={{ s.vvHeight ?? '—' }}
            sy={{ s.scrollY }}
          </li>
        </ul>
      </section>

      <section>
        <h3>4. Hero script log ({{ logs.length }})</h3>
        <ol class="debug-log">
          <li v-for="entry in logs" :key="entry.id">
            <span class="debug-log__ms">{{ entry.atMs }}ms</span>
            <span class="debug-log__step">{{ entry.step }}</span>
            <span v-if="entry.detail" class="debug-log__detail">{{ entry.detail }}</span>
            <span class="debug-log__meta"
              >sy={{ entry.scrollY }} ih={{ entry.innerHeight }}</span
            >
          </li>
        </ol>
      </section>
    </div>
  </aside>
</template>

<style scoped>
.debug-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  max-height: 55vh;
  overflow: auto;
  background: rgba(8, 10, 18, 0.94);
  color: #c8e6ff;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 10px;
  line-height: 1.45;
  border-top: 2px solid #ff6b9d;
  -webkit-overflow-scrolling: touch;
}

.debug-banner--collapsed {
  max-height: none;
  overflow: visible;
}

.debug-banner__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 10px;
  position: sticky;
  top: 0;
  background: rgba(8, 10, 18, 0.98);
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.debug-banner__toggle {
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: transparent;
  color: inherit;
  font: inherit;
  padding: 2px 8px;
  border-radius: 4px;
}

.debug-banner__body {
  padding: 8px 10px 12px;
}

.debug-banner h3 {
  margin: 8px 0 4px;
  color: #ff9ec8;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.debug-banner p {
  margin: 2px 0;
  word-break: break-word;
}

.debug-warn {
  color: #ffb347;
  font-weight: bold;
}

.debug-muted {
  color: rgba(200, 230, 255, 0.55);
}

.debug-samples {
  margin: 4px 0 0;
  padding-left: 14px;
}

.debug-log {
  margin: 4px 0 0;
  padding-left: 16px;
}

.debug-log li {
  margin-bottom: 4px;
}

.debug-log__ms {
  color: #7dd3a8;
  margin-right: 4px;
}

.debug-log__step {
  color: #fff;
  font-weight: 600;
}

.debug-log__detail {
  display: block;
  color: rgba(200, 230, 255, 0.8);
  white-space: pre-wrap;
  margin: 1px 0 1px 0;
}

.debug-log__meta {
  display: block;
  color: rgba(200, 230, 255, 0.45);
  font-size: 9px;
}
</style>
