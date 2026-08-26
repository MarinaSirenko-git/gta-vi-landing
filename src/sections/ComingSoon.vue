<script setup lang="ts"></script>

<template>
  <aside class="entrance-message" aria-labelledby="release-heading">
    <div class="col-center h-full gap-10">
      <img
        src="/images/outro/logo-240.webp"
        srcset="
          /images/outro/logo-240.webp 240w,
          /images/outro/logo-320.webp 320w,
          /images/outro/logo-480.webp 480w
        "
        sizes="(min-width: 1920px) 320px, (min-width: 1536px) 288px, (min-width: 768px) 240px, 192px"
        alt="Grand Theft Auto VI"
        width="240"
        height="161"
        class="entrance-logo"
      />

      <div class="text-wrapper">
        <h2 id="release-heading" class="gradient-title">
          Coming
          <br />
          <time datetime="2026-11-19">November 19th</time>
          <br />
          2026
        </h2>
      </div>

      <ul class="flex-center gap-10" aria-label="Available on">
        <li>
          <img
            src="/images/outro/ps-logo.svg"
            alt="PlayStation"
            width="93"
            height="20"
            class="w-20 md:w-32"
          />
        </li>
        <li>
          <img
            src="/images/outro/x-logo.svg"
            alt="Xbox"
            width="158"
            height="20"
            class="w-40 md:w-52"
          />
        </li>
      </ul>
    </div>
  </aside>
</template>
