<template>
  <div class="banner">
    <div class="grid"></div>
    <div class="orbit orbit-one"></div>
    <div class="orbit orbit-two"></div>
    <div class="spark spark-one"></div>
    <div class="spark spark-two"></div>
    <div class="wave1"></div>
    <div class="wave2"></div>
    <div class="info">
      <GlitchText :text="hello" />
      <span class="box">
        <p class="text">
          <i class="fa fa-quote-left"></i>
          {{ motto }}
          <i class="fa fa-quote-right"></i>
        </p>
        <div class="contact">
          <a :href="s.url" v-for="s in social" aria-label="icon" target="_blank">
            <i :class="['fab', s.icon]"></i>
          </a>
        </div>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useData } from 'vitepress'
import GlitchText from './GlitchText.vue'
const themeConfig = useData().theme.value
const hello = themeConfig.hello || 'Hello, sakura'
const motto = themeConfig.motto || 'You got to put the past behind you before you can move on.'
const social = themeConfig.social || []
</script>

<style lang="scss">
@use "./base.scss" as *;

.banner {
  background:
    radial-gradient(circle at 50% 50%, rgba(255, 190, 92, 0.22), transparent 30%),
    linear-gradient(135deg, #35191d 0%, #7b2925 42%, #d65c30 74%, #f3a34a 100%);
  position: relative;
  overflow: hidden;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;

  &::before,
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  &::before {
    background: radial-gradient(ellipse at 50% 100%, rgba(255, 220, 140, 0.25), transparent 58%);
  }

  &::after {
    background: linear-gradient(180deg, transparent 58%, rgba(77, 28, 25, 0.62) 100%);
  }

  .grid {
    position: absolute;
    inset: 0;
    opacity: 0.28;
    background-image: linear-gradient(rgba(255, 226, 149, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 226, 149, 0.15) 1px, transparent 1px);
    background-size: 72px 72px;
    transform: perspective(500px) rotateX(58deg) scale(1.8) translateY(20%);
    transform-origin: center bottom;
    animation: grid-slide 18s linear infinite;
  }

  .orbit {
    position: absolute;
    width: min(78vw, 900px);
    aspect-ratio: 1;
    left: 50%;
    top: 50%;
    border-radius: 50%;
    border: 1px solid rgba(255, 226, 149, 0.35);
    box-shadow: 0 0 36px rgba(255, 155, 55, 0.18), inset 0 0 36px rgba(255, 155, 55, 0.12);
    transform: translate(-50%, -50%) rotate(-24deg) scaleY(0.36);
    animation: orbit-turn 20s linear infinite;
  }

  .orbit-one {
    width: min(62vw, 720px);
  }

  .orbit-two {
    width: min(92vw, 1080px);
    opacity: 0.45;
    transform: translate(-50%, -50%) rotate(18deg) scaleY(0.3);
    animation-duration: 28s;
    animation-direction: reverse;
  }

  .spark {
    position: absolute;
    width: 6px;
    aspect-ratio: 1;
    border-radius: 50%;
    background: #ffe29b;
    box-shadow: 0 0 18px 5px rgba(255, 226, 149, 0.55);
    animation: spark-pulse 4s ease-in-out infinite;
  }

  .spark-one {
    top: 28%;
    right: 22%;
  }

  .spark-two {
    bottom: 36%;
    left: 18%;
    width: 4px;
    animation-delay: -2s;
  }

  .wave1,
  .wave2 {
    position: absolute;
    width: 400%;
    bottom: 0;
  }

  .wave1 {
    background: url($theme-base+"assets/wave1.png") repeat-x;
    height: 65px;
    animation: wave-animation-1 30s infinite linear;
  }

  .wave2 {
    background: url($theme-base+"assets/wave2.png") repeat-x;
    height: 80px;
    animation: wave-animation-2 20s infinite linear;
  }

  .info {
    position: relative;
    z-index: 1;
    font-family: var(--global-font);
    font-weight: bold;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .box {
    display: inline-block;
    width: 600px;
    color: white;
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 16px;
    margin-top: 16px;
  }

  .text {
    text-align: center;
    font-size: 16px;
    line-height: 24px;
  }

  .contact {
    display: flex;
    justify-content: center;
    font-size: 24px;
    padding-bottom: 12px;

    a {
      color: white;
      margin: 6px;
    }
  }
}

html[data-theme="dark"] .banner .wave1,
html[data-theme="dark"] .banner .wave2 {
  filter: invert(.92);
}

html[data-theme="dark"] .banner {
  background:
    radial-gradient(circle at 50% 45%, rgba(255, 141, 53, 0.12), transparent 32%),
    linear-gradient(135deg, #120f18 0%, #29151d 45%, #54201f 75%, #8b3826 100%);

  &::before {
    background: radial-gradient(ellipse at 50% 100%, rgba(255, 137, 52, 0.16), transparent 58%);
  }

  &::after {
    background: linear-gradient(180deg, rgba(9, 10, 18, 0.12), rgba(9, 10, 18, 0.78) 100%);
  }

  .grid {
    opacity: 0.38;
    background-image: linear-gradient(rgba(255, 166, 72, 0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 166, 72, 0.22) 1px, transparent 1px);
  }

  .orbit {
    border-color: rgba(255, 166, 72, 0.5);
    box-shadow: 0 0 42px rgba(255, 104, 36, 0.26), inset 0 0 42px rgba(255, 104, 36, 0.16);
  }

  .spark {
    background: #fff0bd;
    box-shadow: 0 0 22px 7px rgba(255, 142, 52, 0.7);
  }

  .box {
    background-color: rgba(10, 10, 16, 0.68);
    box-shadow: 0 0 28px rgba(255, 105, 38, 0.12);
  }
}

@media (max-width: 720px) {
  .banner {
    .info {
      margin: 0 0.5em;
    }

    .box {
      width: 100%;
    }

    .text {
      margin: 1em 0.5em;
    }
  }
}

@keyframes wave-animation-1 {
  0% {
    left: 0;
  }

  100% {
    left: -997px;
  }
}

@keyframes wave-animation-2 {
  0% {
    left: 0;
  }

  100% {
    left: -1009px;
  }
}

@keyframes sky-drift {
  from { background-position: 0 0; }
  to { background-position: 0 72px; }
}

@keyframes grid-slide {
  from { background-position: 0 0, 0 0; }
  to { background-position: 0 72px, 72px 0; }
}

@keyframes orbit-turn {
  from { rotate: 0deg; }
  to { rotate: 360deg; }
}

@keyframes spark-pulse {
  0%, 100% { opacity: 0.35; transform: scale(0.7); }
  50% { opacity: 1; transform: scale(1.3); }
}

@media (prefers-reduced-motion: reduce) {
  .banner .grid,
  .banner .orbit,
  .banner .spark {
    animation: none;
  }
}
</style>
