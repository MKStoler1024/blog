<template>
  <div id="comments" ref="container" class="giscus-container"></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useData } from 'vitepress'

const container = ref<HTMLDivElement>()
let script: HTMLScriptElement | undefined

const { site } = useData()
// giscus 跑在 giscus.app 的 iframe 里，主题只能是绝对地址，因此用站点 origin + base 拼出主题文件
const themeFileUrl = (name: string) => new URL(`${site.value.base}giscus/${name}.css`, window.location.origin).href

// 本地 http 预览时浏览器会拦截 giscus.app(https) 对 localhost 的请求（本地网络访问限制），
// 此时改为本地取同一份 CSS、用 data: 地址交给 giscus，保证开发环境与线上观感一致
const toBase64 = (text: string) => {
  let binary = ''
  for (const byte of new TextEncoder().encode(text)) binary += String.fromCharCode(byte)
  return btoa(binary)
}

const themeUrl = async (name: string) => {
  const url = themeFileUrl(name)
  if (window.location.protocol === 'https:') return url
  try {
    const response = await fetch(url)
    if (!response.ok) return url
    return `data:text/css;base64,${toBase64(await response.text())}`
  } catch {
    return url
  }
}

const currentTheme = () => document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'

const updateTheme = async (event?: Event) => {
  const theme = await themeUrl(event instanceof CustomEvent ? event.detail.theme : currentTheme())
  const iframe = container.value?.querySelector<HTMLIFrameElement>('iframe.giscus-frame')
  iframe?.contentWindow?.postMessage({ giscus: { setConfig: { theme } } }, 'https://giscus.app')
}

onMounted(async () => {
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
  script.dataset.theme = await themeUrl(currentTheme())
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
