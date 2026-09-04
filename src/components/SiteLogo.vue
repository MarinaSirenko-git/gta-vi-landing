<script setup lang="ts">
import {
  SITE_LOGO_HEIGHT,
  SITE_LOGO_SIZES,
  SITE_LOGO_WIDTH,
  siteLogoSrcset,
} from '@/utils/siteLogo'

const {
  alt,
  sizes = SITE_LOGO_SIZES.entrance,
  imageClass,
  loading,
} = defineProps<{
  alt: string
  sizes?: string
  imageClass?: string
  loading?: 'lazy' | 'eager'
}>()
</script>

<template>
  <img
    src="/images/outro/logo-240.webp"
    :srcset="siteLogoSrcset()"
    :sizes="sizes"
    :alt="alt"
    :width="SITE_LOGO_WIDTH"
    :height="SITE_LOGO_HEIGHT"
    :class="imageClass"
    :loading="loading"
    decoding="async"
  />
</template>
