<script setup>
import { computed } from 'vue'
import { useData } from 'vitepress'

const { theme } = useData()
// 页脚信息沿用站点 themeConfig（name / motto）
const name = computed(() => theme.value.name || '')
const motto = computed(() => {
  const value = theme.value.motto
  return Array.isArray(value) ? value[0] || '' : value || ''
})
const year = new Date().getFullYear()
</script>

<template>
  <footer class="k-footer">
    <div class="container">
      <div class="row">
        <div class="col-12 text-center">
          <p class="copyright">© {{ year }} {{ name }}</p>
          <p v-if="motto" class="motto">{{ motto }}</p>
        </div>
      </div>
    </div>
  </footer>
</template>
