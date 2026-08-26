<script setup lang="ts">
import NavBar from '@/sections/NavBar.vue'
import HeroSection from '@/sections/HeroSection.vue'
import FirstVideo from './sections/FirstVideo.vue'
import JasonSection from './sections/JasonSection.vue'
</script>

<template>
  <a class="skip-link" href="#main-content">Skip to content</a>
  <NavBar />
  <main id="main-content">
    <HeroSection />
    <FirstVideo />
    <JasonSection />

    <!--
    <SecondVideo />
    <LuciaSection />
    <PostCard />
    <FinalSection />
    <OutroSection />
    -->
  </main>
</template>
