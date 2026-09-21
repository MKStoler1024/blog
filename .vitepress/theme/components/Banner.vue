<script setup>
import { computed, onMounted, ref } from 'vue'
import { useData } from 'vitepress'
import GlitchText from '../GlitchText.vue'

const { theme } = useData()
const cover = computed(() => theme.value.cover || '')
const title = computed(() => theme.value.hello || theme.value.name || '')

/* motto 支持字符串数组。注意不能在渲染期随机取：SSR 与客户端各取一次会不一致，
   造成 hydration 失配（Vue 报 "Hydration completed but contains mismatches"）。
   这里先固定用第一句，挂载后再随机换一次 */
const mottoList = computed(() => {
  const list = theme.value.motto
  if (Array.isArray(list)) return list.filter(Boolean)
  return list ? [list] : []
})
const motto = ref(mottoList.value[0] || '')
onMounted(() => {
  if (mottoList.value.length > 1) {
    motto.value = mottoList.value[Math.floor(Math.random() * mottoList.value.length)]
  }
})
</script>

<template>
  <div class="banner">
    <div class="overlay"></div>
    <div class="content" :style="cover ? { backgroundImage: `url(${cover})` } : undefined">
      <div class="introduce">
        <GlitchText v-if="title" class="title" :text="title" />
        <div v-if="motto" class="mate">{{ motto }}</div>
      </div>
    </div>
  </div>
</template>

<style>
/* Banner 里的标题沿用站点原有的故障字效果，但字号改由 .banner .introduce .title 控制 */
.banner .introduce .glitch {
  font-size: 2.6rem;
  line-height: 1.3;
  margin-bottom: 10px;
}

@media (max-width: 575.98px) {
  .banner .introduce .glitch {
    font-size: 1.9rem;
  }
}
</style>
