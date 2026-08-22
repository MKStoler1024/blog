<template>
  <div id="comments" ref="container" class="giscus-container"></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const container = ref<HTMLDivElement>()
let script: HTMLScriptElement | undefined

const currentTheme = () => document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'

const updateTheme = (event?: Event) => {
  const theme = event instanceof CustomEvent ? event.detail.theme : currentTheme()
  const iframe = container.value?.querySelector<HTMLIFrameElement>('iframe.giscus-frame')
  iframe?.contentWindow?.postMessage({ giscus: { setConfig: { theme } } }, 'https://giscus.app')
}

onMounted(() => {
  script = document.createElement('script')
  script.src = 'https://giscus.app/client.js'
  script.async = true
  script.crossOrigin = 'anonymous'
  script.dataset.repo = 'MKStoler1024/blog'
  script.dataset.repoId = 'R_kgDOOQT_Zw'
  script.dataset.category = 'General'
  script.dataset.categoryId = 'DIC_kwDOOQT_Z84DD9r5'
  script.dataset.mapping = 'pathname'
  script.dataset.strict = '1'
  script.dataset.reactionsEnabled = '1'
  script.dataset.emitMetadata = '0'
  script.dataset.inputPosition = 'top'
  script.dataset.theme = currentTheme()
  script.dataset.lang = 'zh-CN'
  script.dataset.loading = 'lazy'
  container.value?.appendChild(script)
  window.addEventListener('themechange', updateTheme)
})

onUnmounted(() => {
  window.removeEventListener('themechange', updateTheme)
  container.value?.replaceChildren()
})
</script>

<style>
.giscus-container {
  margin: 2rem 0;
}
</style>
