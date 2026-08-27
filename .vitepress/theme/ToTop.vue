<template>
  <button class="totop" type="button" title="回到顶部" aria-label="回到顶部" :class="{ visible }" @click="toTop">
    <i class="fa fa-arrow-up" aria-hidden="true"></i>
    <span>顶部</span>
  </button>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
const visible = ref(false)
const onScroll = () => { visible.value = window.scrollY > 200 }
const toTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<style scoped>
.totop {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 60;
  display: inline-flex;
  align-items: center;
  gap: .45rem;
  min-height: 42px;
  border: 1px solid var(--color-border);
  border-radius: 21px;
  padding: .55rem .85rem;
  color: var(--color-text);
  background: var(--color-surface);
  box-shadow: 0 3px 12px var(--color-shadow);
  font: inherit;
  cursor: pointer;
  opacity: 0;
  pointer-events: none;
  transform: translateY(8px);
  transition: color .2s, border-color .2s, transform .2s, opacity .2s;
}

.totop.visible {
  opacity: 1;
  pointer-events: auto;
  transform: none;
}

.totop:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

@media (max-width: 640px) {
  .totop {
    right: 16px;
    bottom: 72px;
    width: 44px;
    height: 44px;
    min-height: 44px;
    justify-content: center;
    border-radius: 50%;
    padding: 0;
  }

  .totop span {
    display: none;
  }
}
</style>
