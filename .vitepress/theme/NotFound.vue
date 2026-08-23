<template>
  <section class="not-found" aria-labelledby="not-found-title">
    <div class="not-found-card">
      <div class="mascot" aria-hidden="true">
        <span class="ear left"></span>
        <span class="ear right"></span>
        <span class="face">｡•ㅅ•｡</span>
      </div>
      <p class="code">404</p>
      <h1 id="not-found-title">哎呀，这一页躲起来了</h1>
      <p class="message">你要找的页面暂时没有找到，也许它正在某个角落喝茶。</p>
      <div class="actions">
        <a class="primary" :href="base">回到首页</a>
        <button type="button" @click="goBack">返回上一页</button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useData } from 'vitepress'

const base = useData().site.value.base
const goBack = () => history.back()
</script>

<style lang="scss">
.not-found {
  display: grid;
  min-height: calc(100vh - 64px);
  place-items: center;
  padding: 88px 16px 40px;
  background: var(--color-background);
}

.not-found-card {
  width: min(560px, 100%);
  padding: 40px 32px 36px;
  border: 2px solid color-mix(in srgb, var(--color-accent) 42%, var(--color-border));
  border-radius: 16px;
  text-align: center;
  background: color-mix(in srgb, var(--color-surface) 86%, transparent);
  box-shadow: 0 12px 30px color-mix(in srgb, var(--color-shadow) 80%, transparent);
}

.mascot {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 128px;
  height: 82px;
  margin-bottom: 10px;
  border: 4px solid var(--color-accent);
  border-radius: 50% 50% 45% 45%;
  color: var(--color-accent-strong);
  background: var(--color-accent-soft);
  transform: rotate(-2deg);
}

.face {
  font-size: 24px;
  letter-spacing: 2px;
}

.ear {
  position: absolute;
  top: -18px;
  width: 34px;
  height: 34px;
  border: 4px solid var(--color-accent);
  border-bottom: 0;
  background: var(--color-accent-soft);
}

.ear.left {
  left: 12px;
  transform: rotate(-35deg) skewY(12deg);
}

.ear.right {
  right: 12px;
  transform: rotate(35deg) skewY(-12deg);
}

.code {
  margin: 0;
  color: var(--color-accent);
  font-family: sans-serif;
  font-size: 72px;
  font-weight: 900;
  line-height: 1;
}

h1 {
  margin: 16px 0 10px;
  color: var(--color-text);
  font-size: 26px;
}

.message {
  margin: 0 auto 24px;
  max-width: 34em;
  color: var(--color-gray);
  line-height: 1.7;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.actions a,
.actions button {
  display: inline-block;
  border: 1px solid var(--color-accent);
  border-radius: 6px;
  padding: 9px 16px;
  color: var(--color-accent);
  background: transparent;
  font: inherit;
  cursor: pointer;
}

.actions .primary,
.actions a:hover,
.actions button:hover {
  color: white;
  background: var(--color-accent);
}

@media (max-width: 600px) {
  .not-found {
    min-height: calc(100vh - 56px);
    padding: 80px 12px 28px;
  }

  .not-found-card {
    padding: 32px 20px 28px;
  }

  .code {
    font-size: 58px;
  }

  h1 {
    font-size: 22px;
  }
}
</style>
