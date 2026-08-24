<script setup lang="ts">
import ComingSoon from './ComingSoon.vue'
</script>

<template>
  <section id="top" class="hero-section" aria-labelledby="site-title">
    <h1 id="site-title" class="sr-only">Grand Theft Auto VI</h1>

    <div class="mask-wrapper size-full">
      <img src="/images/hero/hero-bg.webp" alt="" class="scale-out" />
      <img src="/images/hero/hero-text.webp" alt="Grand Theft Auto VI" class="title-logo fade-out" />
      <p class="trailer-logo fade-out">
        <img src="/images/hero/watch-trailer.png" alt="Watch Trailer" />
      </p>
      <button type="button" class="play-img fade-out" aria-label="Play trailer">
        <img src="/images/hero/play.png" alt="" class="ml-1 w-7" />
      </button>
    </div>

    <div>
      <img src="/images/hero/big-hero-text.svg" alt="" class="mask-logo size-full object-cover" />
    </div>

    <div class="fake-logo-wrapper">
      <img src="/images/hero/big-hero-text.svg" alt="" class="overlay-logo" />
    </div>

    <ComingSoon />
  </section>
</template>
