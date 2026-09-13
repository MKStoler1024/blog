<template>
  <div :class="['banner', { 'article-banner': article }]">
    <div class="galaxy"></div>
    <div class="clouds cloud-far"></div>
    <div class="clouds cloud-mid"></div>
    <div class="clouds cloud-near"></div>
    <div class="stars stars-far far-a"></div>
    <div class="stars stars-far far-b"></div>
    <div class="stars stars-mid mid-a"></div>
    <div class="stars stars-mid mid-b"></div>
    <div class="stars stars-near near-a"></div>
    <div class="stars stars-near near-b"></div>
    <div class="nebula nebula-orange"></div>
    <div class="nebula nebula-sky"></div>
    <div class="nebula nebula-lemon"></div>
    <div class="nebula nebula-deep"></div>
    <div class="moon"></div>
    <div class="shooting-star"></div>
    <div class="shooting-star shooting-star-2"></div>
    <div v-if="!article" class="info">
      <GlitchText :text="hello" />
      <p class="motto">
        <i class="fa fa-quote-left" aria-hidden="true"></i>
        <span class="motto-text">{{ typeText }}</span><span class="caret" aria-hidden="true"></span>
      </p>
    </div>
    <div v-else class="article-banner-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useData } from 'vitepress'
import GlitchText from './GlitchText.vue'

withDefaults(defineProps<{
  article?: boolean
}>(), {
  article: false,
})

const themeConfig = useData().theme.value
const hello = themeConfig.hello || 'Hello, sakura'
// 支持单个字符串或字符串数组，多条时逐条打字轮播
const rawMotto = themeConfig.motto || 'You got to put the past behind you before you can move on.'
const mottos = (Array.isArray(rawMotto) ? rawMotto : [rawMotto]).filter(Boolean)

// 打字机状态
const typeText = ref('')
let mottoIndex = 0
let typing = true
let timer: number | undefined

const TYPE_SPEED = 130   // 打字速度 ms/字
const DELETE_SPEED = 60  // 删除速度 ms/字
const HOLD_DELAY = 2600  // 打完一句后的停留 ms
const SWITCH_DELAY = 350 // 删空后切换到下一条的间隔 ms

const tick = () => {
  const current = mottos[mottoIndex % mottos.length] || ''
  if (typing) {
    if (typeText.value.length < current.length) {
      typeText.value = current.slice(0, typeText.value.length + 1)
      timer = window.setTimeout(tick, TYPE_SPEED)
    } else {
      typing = false
      timer = window.setTimeout(tick, HOLD_DELAY)
    }
  } else {
    if (typeText.value.length > 0) {
      typeText.value = current.slice(0, typeText.value.length - 1)
      timer = window.setTimeout(tick, DELETE_SPEED)
    } else {
      mottoIndex += 1
      typing = true
      timer = window.setTimeout(tick, SWITCH_DELAY)
    }
  }
}

onMounted(() => {
  if (!mottos.length) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // 偏好减少动效时直接展示第一条，不做打字动画
    typeText.value = mottos[0] || ''
    return
  }
  timer = window.setTimeout(tick, 600)
})

onUnmounted(() => {
  if (timer !== undefined) window.clearTimeout(timer)
})
</script>

<style lang="scss">
// 天幕：多色天光渐变 + 云层 + 三层随机星星 + 月亮 + 流星
// 亮色取「白昼海港」（蔚蓝天空 → 雾蓝 → 暖纸地平线），暗色取「黄昏码头」（青灰暮空 → 橙橙辉光 → 焦赭地面）
@use "sass:math";

// 按比例挑星星颜色：主色 72%、冷色 14%、暖色 14%
@function pick-star-color($main, $cool, $warm) {
  $r: math.random(100);
  @if $r <= 72 { @return $main; }
  @else if $r <= 86 { @return $cool; }
  @else { @return $warm; }
}

@function make-stars($count) {
  $shadows: ();
  @for $i from 1 through $count {
    $shadows: append($shadows, (math.random(2000) * 1px) (math.random(1000) * 1px) 0 (math.random(2) * 0.5px) pick-star-color(var(--banner-star), var(--banner-star-cool), var(--banner-star-warm)), comma);
  }
  @return $shadows;
}

.banner {
  position: relative;
  overflow: hidden;
  height: 60vh;
  display: flex;
  justify-content: center;
  align-items: center;
  // 亮色主题：白昼海港 —— 蔚蓝天空到暖纸地平线，云层被日光照亮，星点化作天空里的细微尘光
  --banner-star: rgba(47, 95, 134, 0.30);
  --banner-star-cool: rgba(74, 128, 130, 0.26);
  --banner-star-warm: rgba(180, 122, 62, 0.30);
  --banner-cloud-a: rgba(255, 255, 255, 0.95);
  --banner-cloud-b: rgba(255, 255, 255, 0.72);
  --banner-cloud-c: rgba(233, 244, 252, 0.82);
  --banner-galaxy: radial-gradient(ellipse 110% 34% at 46% 42%, rgba(255, 255, 255, 0.72), transparent 68%);
  --banner-nebula-orange: rgba(214, 130, 62, 0.16);
  --banner-nebula-sky: rgba(64, 140, 178, 0.16);
  --banner-nebula-lemon: rgba(226, 178, 84, 0.14);
  --banner-nebula-deep: rgba(60, 120, 150, 0.14);
  --banner-shoot-bg: linear-gradient(90deg, rgba(206, 138, 66, 0), rgba(206, 138, 66, 0.34));
  --banner-moon-bg: radial-gradient(circle at 32% 32%, #ffffff, #fbf3e4 58%, #e6d7bf 100%);
  --banner-moon-shadow-from: rgba(255, 255, 255, 0.5);
  --banner-moon-shadow-to: rgba(255, 248, 236, 0.72);
  --banner-text: rgba(28, 34, 40, 0.88);
  --banner-quote: var(--color-accent);
  --banner-border: var(--color-accent);
  --banner-glitch-color: #1c2830;
  --banner-glitch-shadow: rgba(255, 255, 255, 0.72) 4px 4px 8px;
  --banner-title-shadow: rgba(255, 255, 255, 0.75) 2px 2px 10px;
  background:
    radial-gradient(ellipse 58% 40% at 16% 2%, rgba(255, 255, 255, 0.9), transparent 62%),
    radial-gradient(ellipse 52% 30% at 86% 52%, rgba(216, 128, 58, 0.34), transparent 66%),
    radial-gradient(ellipse 56% 30% at 4% 58%, rgba(48, 124, 164, 0.34), transparent 68%),
    linear-gradient(180deg, #3f86c2 0%, #5b9ecd 16%, #86b8dc 34%, #aecfe4 48%, #d8e3e6 62%, #f0ead9 78%, #fbf8f4 100%);

  // 底部渐变淡出，与正文背景平滑衔接
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(180deg, transparent 55%, var(--color-background) 100%);
  }
}

.stars {
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: 50%;
}

.stars-far {
  width: 2px;
  height: 2px;
}

.stars-mid {
  width: 3px;
  height: 3px;
}

.stars-near {
  width: 4px;
  height: 4px;
}

// 每层拆成两组、错开闪烁相位，星星此起彼伏更自然
.far-a {
  box-shadow: make-stars(90);
  animation: twinkle 6.5s ease-in-out infinite alternate;
}

.far-b {
  box-shadow: make-stars(90);
  animation: twinkle 5s ease-in-out -2.7s infinite alternate-reverse;
}

.mid-a {
  box-shadow: make-stars(40);
  animation: twinkle 5.2s ease-in-out infinite alternate;
}

.mid-b {
  box-shadow: make-stars(40);
  animation: twinkle 3.8s ease-in-out -2.1s infinite alternate-reverse;
}

.near-a {
  box-shadow: make-stars(15);
  animation: twinkle 4.2s ease-in-out infinite alternate;
}

.near-b {
  box-shadow: make-stars(15);
  animation: twinkle 3.2s ease-in-out -1.6s infinite alternate-reverse;
}

.galaxy {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: var(--banner-galaxy);
  transform: rotate(-22deg) scale(1.3);
}

.nebula {
  position: absolute;
  border-radius: 50%;
  filter: blur(30px);
  pointer-events: none;
}

.nebula-orange {
  top: -18%;
  left: -12%;
  width: 60vw;
  aspect-ratio: 1;
  background: radial-gradient(circle, var(--banner-nebula-orange), transparent 65%);
  animation: nebula-drift 26s ease-in-out infinite alternate;
}

.nebula-sky {
  bottom: -24%;
  right: -8%;
  width: 52vw;
  aspect-ratio: 1;
  background: radial-gradient(circle, var(--banner-nebula-sky), transparent 65%);
  animation: nebula-drift 34s ease-in-out -8s infinite alternate-reverse;
}

.nebula-lemon {
  top: 32%;
  left: 44%;
  width: 44vw;
  aspect-ratio: 1;
  background: radial-gradient(circle, var(--banner-nebula-lemon), transparent 65%);
  animation: nebula-drift 40s ease-in-out -16s infinite alternate;
}

// 贴地的一层暖辉，模拟参考图里被夕照染红的地平线
.nebula-deep {
  bottom: 22%;
  left: 18%;
  width: 46vw;
  aspect-ratio: 3;
  background: radial-gradient(ellipse, var(--banner-nebula-deep), transparent 68%);
  animation: nebula-drift 48s ease-in-out -24s infinite alternate-reverse;
}

// 云层：三层厚度不同的软云，错开相位缓慢漂移，云后仍有星点透出
.clouds {
  position: absolute;
  pointer-events: none;
  border-radius: 50%;
  filter: blur(24px);
}

.cloud-far {
  top: 2%;
  left: -10%;
  width: 48vw;
  height: 132px;
  background: radial-gradient(closest-side, var(--banner-cloud-a), transparent 74%);
  animation: cloud-drift 62s ease-in-out infinite alternate;
}

.cloud-mid {
  top: 22%;
  right: -4%;
  width: 38vw;
  height: 102px;
  background: radial-gradient(closest-side, var(--banner-cloud-b), transparent 74%);
  animation: cloud-drift 78s ease-in-out -20s infinite alternate-reverse;
}

.cloud-near {
  bottom: 12%;
  left: 14%;
  width: 42vw;
  height: 122px;
  background: radial-gradient(closest-side, var(--banner-cloud-c), transparent 76%);
  animation: cloud-drift 94s ease-in-out -46s infinite alternate;
}

.moon {
  position: absolute;
  top: 11%;
  right: 14%;
  width: 84px;
  height: 84px;
  border-radius: 50%;
  background: var(--banner-moon-bg);
  animation: moon-glow 6s ease-in-out infinite alternate;

  // 月面环形山纹理
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background:
      radial-gradient(circle at 30% 34%, rgba(138, 106, 68, 0.10), transparent 16%),
      radial-gradient(circle at 62% 58%, rgba(138, 106, 68, 0.09), transparent 14%),
      radial-gradient(circle at 80% 26%, rgba(138, 106, 68, 0.07), transparent 11%);
  }
}

.shooting-star {
  position: absolute;
  top: 14%;
  left: 68%;
  width: 150px;
  height: 2px;
  border-radius: 2px;
  background: var(--banner-shoot-bg);
  opacity: 0;
  transform: rotate(-38deg);
  animation: shoot 9s ease-in infinite;
}

.shooting-star-2 {
  top: 16%;
  left: 6%;
  width: 220px;
  transform: rotate(38deg);
  animation: shoot-2 13s ease-in 6s infinite;
}

.info {
  position: relative;
  z-index: 1;
  width: min(860px, 100%);
  margin: 0 auto;
  padding: 0 24px;
  font-family: var(--global-font);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.motto {
  position: relative;
  margin: 28px 0 0 8px;
  padding-left: 18px;
  border-left: 3px solid var(--banner-border);
  color: var(--banner-text);
  font-size: 17px;
  line-height: 1.8;
  font-weight: 500;
  min-height: 1.8em; // 打字过程中保持行高，避免布局跳动

  .fa-quote-left {
    margin-right: 8px;
    font-size: 14px;
    vertical-align: 2px;
    color: var(--banner-quote);
  }

  .motto-text {
    white-space: pre-wrap;
    word-break: break-word;
  }

  // 打字光标
  .caret {
    display: inline-block;
    width: 2px;
    height: 1.1em;
    margin-left: 3px;
    vertical-align: -3px;
    background: var(--banner-text);
    animation: caret-blink 1.1s step-end infinite;
  }
}

@keyframes caret-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.banner.article-banner {
  height: 400px;
  margin-top: 64px;
  align-items: flex-end;

  .article-banner-content {
    position: relative;
    z-index: 1;
    width: min(800px, 100%);
    margin: 0 auto;
    padding: 0 0.5em 20px;
  }
}

// 暗色主题：黄昏码头 —— 青灰暮空压着橙橙辉光，地面沉入焦赭与暖黑
html[data-theme="dark"] .banner {
  --banner-star: rgba(246, 234, 217, 0.92);
  --banner-star-cool: rgba(159, 208, 212, 0.62);
  --banner-star-warm: rgba(240, 185, 138, 0.8);
  --banner-cloud-a: rgba(214, 140, 92, 0.24);
  --banner-cloud-b: rgba(120, 164, 172, 0.18);
  --banner-cloud-c: rgba(178, 122, 82, 0.16);
  --banner-galaxy: radial-gradient(ellipse 110% 34% at 46% 40%, rgba(224, 167, 84, 0.09), transparent 70%);
  --banner-nebula-orange: rgba(216, 116, 60, 0.11);
  --banner-nebula-sky: rgba(90, 150, 155, 0.08);
  --banner-nebula-lemon: rgba(224, 167, 84, 0.07);
  --banner-nebula-deep: rgba(148, 74, 42, 0.12);
  --banner-shoot-bg: linear-gradient(90deg, rgba(246, 234, 217, 0), #f6ead9);
  --banner-moon-bg: radial-gradient(circle at 32% 32%, #fffdf7, #f4e6cf 55%, #cbb08a 100%);
  --banner-moon-shadow-from: rgba(232, 168, 104, 0.16);
  --banner-moon-shadow-to: rgba(232, 168, 104, 0.30);
  --banner-text: rgba(236, 230, 222, 0.9);
  --banner-quote: var(--color-accent);
  --banner-border: rgba(227, 189, 155, 0.32);
  --banner-glitch-color: #fff;
  --banner-glitch-shadow: rgba(0, 0, 0, 0.35) 4px 4px 8px;
  --banner-title-shadow: 2px 2px 10px rgba(0, 0, 0, 0.75);
  background:
    radial-gradient(ellipse 60% 30% at 82% 52%, rgba(196, 92, 42, 0.30), transparent 66%),
    radial-gradient(ellipse 68% 30% at 8% 8%, rgba(74, 136, 146, 0.22), transparent 68%),
    linear-gradient(180deg, #0d1b21 0%, #16303a 12%, #27505c 26%, #3a5a5e 36%, #6d452a 48%, #a9542a 56%, #6b3418 68%, #2a160c 84%, #12100e 100%);
}

// GlitchText / Article 标题默认是白色，在亮色主题下需覆盖为深色
.banner .glitch {
  color: var(--banner-glitch-color);
  text-shadow: var(--banner-glitch-shadow);
}

.banner.article-banner .titlebox,
.banner.article-banner .title {
  color: var(--banner-glitch-color);
  text-shadow: var(--banner-title-shadow);
}

.banner.article-banner .info {
  color: var(--banner-text);
  text-shadow: none;
}

@media (max-width: 1100px) {
  .banner {
    .info {
      padding: 0 16px;
    }

    .motto {
      font-size: 14px;
      line-height: 1.7;
    }
  }

  .banner.article-banner {
    height: auto;
    min-height: 240px;
    margin-top: 56px;

    .article-banner-content {
      padding: 32px 12px 28px;
      box-sizing: border-box;
    }
  }
}

@keyframes twinkle {
  0% { opacity: 0.35; }
  100% { opacity: 1; }
}

@keyframes moon-glow {
  from { box-shadow: 0 0 32px 10px var(--banner-moon-shadow-from); }
  to { box-shadow: 0 0 56px 18px var(--banner-moon-shadow-to); }
}

@keyframes shoot {
  0%, 12% { opacity: 0; transform: translate(0, 0) rotate(-38deg); }
  14% { opacity: 1; }
  22% { opacity: 0; transform: translate(-60vw, 38vw) rotate(-38deg); }
  100% { opacity: 0; transform: translate(-60vw, 38vw) rotate(-38deg); }
}

@keyframes shoot-2 {
  0%, 20% { opacity: 0; transform: translate(0, 0) rotate(38deg); }
  22.5% { opacity: 1; }
  31% { opacity: 0; transform: translate(52vw, 46vw) rotate(38deg); }
  100% { opacity: 0; transform: translate(52vw, 46vw) rotate(38deg); }
}

@keyframes nebula-drift {
  from { transform: translate(-2%, -2%) scale(0.95); }
  to { transform: translate(3%, 3%) scale(1.08); }
}

@keyframes cloud-drift {
  from { transform: translate3d(-3%, 0, 0) scale(0.98); }
  to { transform: translate3d(3%, 1.5%, 0) scale(1.05); }
}

@media (prefers-reduced-motion: reduce) {
  .banner .stars,
  .banner .moon,
  .banner .shooting-star,
  .banner .nebula,
  .banner .clouds,
  .banner .caret {
    animation: none;
  }
}
</style>
