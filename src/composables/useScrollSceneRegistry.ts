import {
  type InjectionKey,
  type Ref,
  inject,
  onUnmounted,
  provide,
  ref,
  watch,
} from 'vue'

export type ScrollSceneId = 'hero' | 'firstVideo' | 'secondVideo' | 'finalContent'

type ScrollSceneRegistry = Record<ScrollSceneId, Ref<HTMLElement | null>>

const scrollSceneRegistryKey: InjectionKey<ScrollSceneRegistry> = Symbol('scrollSceneRegistry')

function createRegistry(): ScrollSceneRegistry {
  return {
    hero: ref(null),
    firstVideo: ref(null),
    secondVideo: ref(null),
    finalContent: ref(null),
  }
}

export function provideScrollSceneRegistry(): ScrollSceneRegistry {
  const registry = createRegistry()
  provide(scrollSceneRegistryKey, registry)
  return registry
}

function useRegistry(): ScrollSceneRegistry {
  const registry = inject(scrollSceneRegistryKey)
  if (!registry) {
    throw new Error('Scroll scene registry is missing. Call provideScrollSceneRegistry in App.vue.')
  }
  return registry
}

export function useRegisterScrollTarget(
  id: ScrollSceneId,
  elementRef: Ref<HTMLElement | null>,
): void {
  const registry = useRegistry()

  watch(
    elementRef,
    (element) => {
      registry[id].value = element
    },
    { immediate: true },
  )

  onUnmounted(() => {
    registry[id].value = null
  })
}

export function useScrollSceneTarget(id: ScrollSceneId): Ref<HTMLElement | null> {
  return useRegistry()[id]
}
