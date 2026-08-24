<script setup lang="ts"></script>

<template>
  <section class="post-card" aria-labelledby="postcard-heading">
    <div class="animated-gradient-bg" aria-hidden="true" />

    <div class="post-card-wrapper group transition duration-700 hover:rotate-1 hover:scale-[1.02]">
      <img src="/images/postcard/overlay.webp" alt="" />

      <video
        muted
        playsinline
        autoplay
        loop
        preload="metadata"
        src="/videos/postcard-vd.mp4"
        title="Leonida Keys postcard"
      />

      <h2 id="postcard-heading" class="sr-only">Leonida Keys</h2>
      <button type="button" class="transition duration-700 group-hover:bg-yellow">
        Explore Leonida Keys
      </button>
    </div>
  </section>
</template>
