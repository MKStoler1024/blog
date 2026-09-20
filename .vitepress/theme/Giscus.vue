<template>
  <div id="comments" ref="container" class="giscus-container"></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useData } from 'vitepress'

const container = ref<HTMLDivElement>()
let script: HTMLScriptElement | undefined
let rootObserver: MutationObserver | undefined

const { site } = useData()

// postMessage 必须带 origin；giscus 的 iframe 固定由 https://giscus.app 提供
const GISCUS_ORIGIN = 'https://giscus.app'
// 主题文件版本号：public/giscus/*.css 改动后递增，避免浏览器复用已缓存的旧主题
const themeVersion = '3'
// 两份主题地址按需解析一次后缓存：来回切换不必等网络，也不会把主题停在旧的一份上
const themeCache = new Map<string, string>()
// 上一次真正下发给 giscus 的主题地址：resize 上报、根元素属性变化都会走到 syncTheme，
// 主题没变就不要重复发 setConfig，否则 giscus 会反复重新注入一份主题样式
let postedTheme = ''
// 正在解析中的主题地址，避免首屏与主题切换同时触发时把同一份 CSS 取两遍
const resolving = new Map<string, Promise<string>>()

// giscus 跑在 giscus.app 的 iframe 里，主题只能是绝对地址，因此用站点 origin + base 拼出主题文件
const themeFileUrl = (name: string) => {
  const url = new URL(`${site.value.base}giscus/${name}.css`, window.location.origin)
  url.searchParams.set('v', themeVersion)
  return url.href
}

// 本地 http 预览时浏览器会拦截 giscus.app(https) 对 localhost 的请求（本地网络访问限制），
// 此时改为本地取同一份 CSS、用 data: 地址交给 giscus，保证开发环境与线上观感一致
const toBase64 = (text: string) => {
  let binary = ''
  for (const byte of new TextEncoder().encode(text)) binary += String.fromCharCode(byte)
  return btoa(binary)
}

/* 主题地址解析：
   - https：站点自身的地址就是 giscus 能读到的地址，直接定下来；
   - 其它（本地 http 预览）：取回 CSS 后换成 data: 地址再缓存；
     取失败就只回报一个临时地址、不写缓存，下次用到时重试，
     否则一次网络抖动会把主题永久钉死在 giscus 读不到的 http 地址上 */
const themeUrl = (name: string): Promise<string> => {
  const cached = themeCache.get(name)
  if (cached) return Promise.resolve(cached)
  const pending = resolving.get(name)
  if (pending) return pending
  const url = themeFileUrl(name)
  if (window.location.protocol === 'https:') {
    themeCache.set(name, url)
    return Promise.resolve(url)
  }
  const request = fetch(url)
    .then(async response => {
      if (!response.ok) return url
      const dataUrl = `data:text/css;base64,${toBase64(await response.text())}`
      themeCache.set(name, dataUrl)
      return dataUrl
    })
    .catch(() => url)
    .finally(() => resolving.delete(name))
  resolving.set(name, request)
  return request
}

const currentTheme = () => {
  const theme = document.documentElement.dataset.theme
  if (theme === 'dark' || theme === 'light') return theme
  // 站点在 onMounted 里才写入 data-theme，首屏若还没写，退回 VitePress 自己维护的 dark 类
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

const postTheme = (theme: string) => {
  const iframe = container.value?.querySelector<HTMLIFrameElement>('iframe.giscus-frame')
  const url = themeCache.get(theme)
  if (!iframe?.contentWindow || !url) return
  // iframe 里已经是这份主题了（含首屏带在地址里的那份）就不必再发一次
  if (url === postedTheme) return
  iframe.contentWindow.postMessage({ giscus: { setConfig: { theme: url } } }, GISCUS_ORIGIN)
  postedTheme = url
}

// 主题切换入口。iframe 还没出现、或主题地址还在解析时都不要丢掉这次切换：
// 等地址就绪后补发一次（iframe 未就绪时 postTheme 会安静地跳过，由下面的 load 信号兜底）
const syncTheme = (theme = currentTheme()) => {
  if (!themeCache.has(theme)) {
    void themeUrl(theme).then(() => postTheme(theme))
    return
  }
  postTheme(theme)
}

const handleMessage = (event: MessageEvent) => {
  if (event.origin !== GISCUS_ORIGIN) return
  // giscus 只在 iframe 就绪后才处理 setConfig，早发的消息会被丢掉；
  // 这里以「iframe load」这条带 url 的消息为准补发，避免每次高度上报都重发一遍
  if (event.data?.giscus?.url) syncTheme()
}

const handleThemeChange = (event: Event) => {
  syncTheme(event instanceof CustomEvent ? event.detail?.theme : undefined)
}

onMounted(async () => {
  const initialTheme = currentTheme()
  // 先算一个「无论如何都能用」的地址，主题文件还没解析完也有东西可交付
  const fallbackUrl = themeFileUrl(initialTheme)
  // 两份主题一起解析：既保证首屏那份已经就绪，又不会让另一份的请求把首屏挡住
  const [resolvedUrl] = await Promise.all([
    themeUrl(initialTheme),
    themeUrl(initialTheme === 'dark' ? 'light' : 'dark'),
  ])
  const initialUrl = resolvedUrl || fallbackUrl

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
  // 主题必须在 iframe 被创建前就定下来：giscus 会把 data-theme 带进 iframe 的地址里直接渲染，
  // 之后再靠 postMessage 补发主题会晚一步（早发的消息会被 giscus 丢掉，只能等 iframe 的 load 信号兜底）
  script.dataset.theme = initialUrl
  script.dataset.lang = 'zh-CN'
  script.dataset.loading = 'lazy'
  if (!container.value) return
  container.value.appendChild(script)
  // iframe 地址里已经带了这份主题，记下来，避免 iframe 就绪后又白发一次 setConfig
  postedTheme = initialUrl

  // 站点切换主题时会派发 themechange；再监听根元素的两个主题标记，兜住其它改主题的入口
  window.addEventListener('themechange', handleThemeChange)
  window.addEventListener('message', handleMessage)
  rootObserver = new MutationObserver(() => syncTheme())
  rootObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] })
})

onUnmounted(() => {
  window.removeEventListener('themechange', handleThemeChange)
  window.removeEventListener('message', handleMessage)
  rootObserver?.disconnect()
  container.value?.replaceChildren()
})
</script>

<style>
.giscus-container {
  margin: 2rem 0;
  /* 「跳转到评论」按 72px 的固定头高定位，这里补上锚点偏移，避免评论标题被头部压住 */
  scroll-margin-top: 88px;
}
</style>
