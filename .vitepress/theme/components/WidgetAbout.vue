<script setup>
import { onMounted, ref } from 'vue'

// 作者信息沿用站点既有的 public/sidebar.json（与侧栏公告同一份来源）
const about = ref(null)

onMounted(async () => {
  try {
    const response = await fetch('/sidebar.json')
    if (!response.ok) return
    const data = await response.json()
    about.value = data.author || null
  } catch {
    // 取不到就不显示这块，不影响其它小工具
  }
})

const isFontAwesome = (icon) => /^fa[-s]/.test(icon || '')
</script>

<template>
  <div v-if="about" class="widget widget-about">
    <div v-if="about.avatar" class="avatar-wrap">
      <img class="avatar" :src="about.avatar" :alt="about.name" />
    </div>
    <div class="name">{{ about.name }}</div>
    <div class="describe" v-html="about.bio"></div>
    <div v-if="about.links?.length" class="social">
      <a v-for="link in about.links" :key="link.url" class="social-link" :href="link.url" :title="link.text"
        target="_blank" rel="noreferrer">
        <i v-if="isFontAwesome(link.icon)" :class="link.icon" aria-hidden="true"></i>
        <KIcon v-else :name="link.icon" />
      </a>
    </div>
  </div>
</template>

<style scoped>
/* bio 是 HTML 片段，这里补上站点原有侧栏的段落规格 */
.describe :deep(p) {
  margin: 0 0 8px;
  font-size: 13px;
  line-height: 1.7;
}

.describe :deep(p:last-child) {
  margin-bottom: 0;
}
</style>
