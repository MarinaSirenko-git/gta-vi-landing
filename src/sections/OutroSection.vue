<script setup lang="ts"></script>

<template>
  <section class="final-message" aria-labelledby="outro-heading">
    <div class="col-center h-full gap-10">
      <img
        src="/images/outro/logo-480.webp"
        srcset="/images/outro/logo-320.webp 320w, /images/outro/logo-480.webp 480w"
        sizes="(min-width: 768px) 288px, 208px"
        alt="Grand Theft Auto VI"
        width="480"
        height="321"
        loading="lazy"
        class="w-52 md:w-72"
      />

      <h2 id="outro-heading" class="gradient-title">
        Coming
        <br />
        <time datetime="2026-11-19">November 19th</time>
        <br />
        2026
      </h2>

      <ul class="flex-center gap-10" aria-label="Available on">
        <li>
          <img
            src="/images/outro/ps-logo.svg"
            alt="PlayStation"
            width="93"
            height="20"
            loading="lazy"
            class="w-20 md:w-32"
          />
        </li>
        <li>
          <img
            src="/images/outro/x-logo.svg"
            alt="Xbox"
            width="158"
            height="20"
            loading="lazy"
            class="w-40 md:w-52"
          />
        </li>
      </ul>
    </div>
  </section>
</template>
