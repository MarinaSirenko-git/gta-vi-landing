<script setup lang="ts">
import {
  CHARACTER_IMAGE_HEIGHT,
  CHARACTER_IMAGE_SIZES,
  CHARACTER_IMAGE_WIDTH,
  characterImageSrcset,
} from '@/utils/characterImage'

const { basePath, alt, sizes = CHARACTER_IMAGE_SIZES.default } = defineProps<{
  /** Path without extension, e.g. /images/lucia/lucia-2 */
  basePath: string
  alt: string
  sizes?: string
}>()
</script>

<template>
  <img
    :src="`${basePath}.webp`"
    :srcset="characterImageSrcset(basePath)"
    :sizes="sizes"
    :alt="alt"
    :width="CHARACTER_IMAGE_WIDTH"
    :height="CHARACTER_IMAGE_HEIGHT"
    loading="lazy"
    decoding="async"
  />
</template>
