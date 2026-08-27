<template>
  <div :class="['banner', { 'article-banner': article }]">
    <div class="galaxy"></div>
    <div class="stars stars-far far-a"></div>
    <div class="stars stars-far far-b"></div>
    <div class="stars stars-mid mid-a"></div>
    <div class="stars stars-mid mid-b"></div>
    <div class="stars stars-near near-a"></div>
    <div class="stars stars-near near-b"></div>
    <div class="nebula nebula-violet"></div>
    <div class="nebula nebula-cyan"></div>
    <div class="nebula nebula-pink"></div>
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
// 星空：深空渐变 + 三层随机星星 + 月亮 + 流星
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
  // 亮色主题：黎明星空（底色 + 元素配色均通过 CSS 变量控制，暗色主题在下方覆盖）
  --banner-star: rgba(71, 85, 105, 0.5);
  --banner-star-cool: rgba(59, 130, 246, 0.55);
  --banner-star-warm: rgba(217, 119, 6, 0.5);
  --banner-galaxy: radial-gradient(ellipse 110% 34% at 46% 42%, rgba(129, 140, 248, 0.18), transparent 68%);
  --banner-nebula-violet: rgba(139, 92, 246, 0.12);
  --banner-nebula-cyan: rgba(34, 211, 238, 0.1);
  --banner-nebula-pink: rgba(244, 114, 182, 0.1);
  --banner-shoot-bg: linear-gradient(90deg, rgba(51, 65, 85, 0), rgba(51, 65, 85, 0.6));
  --banner-moon-bg: radial-gradient(circle at 32% 32%, #ffffff, #fef3c7 55%, #fcd34d 100%);
  --banner-moon-shadow-from: rgba(251, 191, 36, 0.35);
  --banner-moon-shadow-to: rgba(251, 191, 36, 0.6);
  --banner-text: rgba(30, 41, 59, 0.88);
  --banner-quote: #6366f1;
  --banner-border: rgba(79, 70, 229, 0.5);
  --banner-glitch-color: #1e293b;
  --banner-glitch-shadow: rgba(255, 255, 255, 0.4) 4px 4px 8px;
  --banner-title-shadow: rgba(255, 255, 255, 0.35) 2px 2px 10px;
  background:
    radial-gradient(ellipse at 85% 8%, rgba(253, 186, 116, 0.28), transparent 38%),
    radial-gradient(ellipse at 22% 16%, rgba(129, 140, 248, 0.18), transparent 46%),
    radial-gradient(ellipse at 82% 80%, rgba(56, 189, 248, 0.16), transparent 50%),
    linear-gradient(180deg, #dbeafe 0%, #c7d2fe 38%, #ddd6fe 72%, #f5f3ff 100%);

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

.nebula-violet {
  top: -18%;
  left: -12%;
  width: 60vw;
  aspect-ratio: 1;
  background: radial-gradient(circle, var(--banner-nebula-violet), transparent 65%);
  animation: nebula-drift 26s ease-in-out infinite alternate;
}

.nebula-cyan {
  bottom: -24%;
  right: -8%;
  width: 52vw;
  aspect-ratio: 1;
  background: radial-gradient(circle, var(--banner-nebula-cyan), transparent 65%);
  animation: nebula-drift 34s ease-in-out -8s infinite alternate-reverse;
}

.nebula-pink {
  top: 32%;
  left: 44%;
  width: 44vw;
  aspect-ratio: 1;
  background: radial-gradient(circle, var(--banner-nebula-pink), transparent 65%);
  animation: nebula-drift 40s ease-in-out -16s infinite alternate;
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
      radial-gradient(circle at 30% 34%, rgba(0, 0, 0, 0.07), transparent 16%),
      radial-gradient(circle at 62% 58%, rgba(0, 0, 0, 0.06), transparent 14%),
      radial-gradient(circle at 80% 26%, rgba(0, 0, 0, 0.05), transparent 11%);
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

// 暗色主题：经典深空（覆盖配色变量 + 底色）
html[data-theme="dark"] .banner {
  --banner-star: rgba(255, 255, 255, 0.9);
  --banner-star-cool: rgba(147, 197, 253, 0.95);
  --banner-star-warm: rgba(253, 230, 138, 0.9);
  --banner-galaxy: radial-gradient(ellipse 110% 34% at 46% 42%, rgba(255, 255, 255, 0.14), rgba(226, 232, 240, 0.04) 45%, transparent 70%);
  --banner-nebula-violet: rgba(99, 102, 241, 0.28);
  --banner-nebula-cyan: rgba(34, 211, 238, 0.16);
  --banner-nebula-pink: rgba(244, 114, 182, 0.12);
  --banner-shoot-bg: linear-gradient(90deg, rgba(255, 255, 255, 0), #fff);
  --banner-moon-bg: radial-gradient(circle at 32% 32%, #ffffff, #e0e7ff 55%, #a5b4fc 100%);
  --banner-moon-shadow-from: rgba(165, 180, 252, 0.4);
  --banner-moon-shadow-to: rgba(165, 180, 252, 0.6);
  --banner-text: rgba(226, 232, 240, 0.92);
  --banner-quote: #a5b4fc;
  --banner-border: rgba(199, 210, 254, 0.7);
  --banner-glitch-color: #fff;
  --banner-glitch-shadow: rgba(0, 0, 0, 0.2) 4px 4px 8px;
  --banner-title-shadow: 2px 2px 10px black;
  background:
    radial-gradient(ellipse at 22% 16%, rgba(129, 140, 248, 0.22), transparent 46%),
    radial-gradient(ellipse at 82% 80%, rgba(56, 189, 248, 0.16), transparent 50%),
    linear-gradient(180deg, #020617 0%, #0b1035 42%, #1e1b4b 78%, #312e81 100%);
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

@media (prefers-reduced-motion: reduce) {
  .banner .stars,
  .banner .moon,
  .banner .shooting-star,
  .banner .nebula,
  .banner .caret {
    animation: none;
  }
}
</style>
