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

const giscusFrame = () => container.value?.querySelector<HTMLIFrameElement>('iframe.giscus-frame')

// 真正把主题下发到 iframe。返回 false 表示这次没能发出（地址没解析完 / iframe 还没出现），
// 调用方需要稍后重试，别把这次切换丢掉
const postTheme = (theme = currentTheme()): boolean => {
  const url = themeCache.get(theme)
  if (!url) {
    void themeUrl(theme)
    return false
  }
  const iframe = giscusFrame()
  if (!iframe?.contentWindow) return false
  if (url === postedTheme) return true
  iframe.contentWindow.postMessage({ giscus: { setConfig: { theme: url } } }, GISCUS_ORIGIN)
  postedTheme = url
  return true
}

/* giscus 只在 iframe 里那份 widget 挂好监听之后才认 setConfig，早发的消息会被直接丢掉，
   所以主题切换不能只发一次：切换时立刻发一次，之后每隔一段时间强制重发一次，重发若干次为止。

   两个坑都在这里踩过：
   1. 不要用「收到 giscus 回执就不再重发」提前收尾——widget 在 hydration 阶段就会先发一条
      resizeHeight/error 回执，而那时它自己的 setConfig 监听还没挂上，用回执判断「已经能收到」
      会把刚切的主题永远丢在半路（刷新前后切主题正好落在这个窗口里）；
   2. 重发必须强制发送——主题地址没变时 postTheme 会因「已下发」而跳过，那样重试等于没发。
   重发本身是安全的：giscus 对重复的同一份主题不会重复注入样式。 */
const THEME_RETRY_LIMIT = 12
const THEME_RETRY_DELAY = 800
let themeTimer: number | undefined
let themeAttempts = 0

const stopThemeRetry = () => {
  if (themeTimer !== undefined) {
    window.clearInterval(themeTimer)
    themeTimer = undefined
  }
  themeAttempts = 0
}

const startThemeRetry = () => {
  if (themeTimer !== undefined) return
  themeAttempts = 0
  themeTimer = window.setInterval(() => {
    // 每次重试都重新读一次根元素的主题（其间用户可能又切了一轮），并强制发一次
    postedTheme = ''
    postTheme()
    if (++themeAttempts >= THEME_RETRY_LIMIT) stopThemeRetry()
  }, THEME_RETRY_DELAY)
}

// 主题切换入口：推一次并开始重试；iframe 还没出现时 postTheme 返回 false，
// 先不发，等 iframe 出现后有 load 回执再补
const syncTheme = (theme = currentTheme()) => {
  // 主题变了就重新下发一次：清掉「已下发」记录，不然同地址的守卫会把这次切换吞掉
  postedTheme = ''
  if (!postTheme(theme)) return
  if (themeTimer === undefined) startThemeRetry()
}

const handleFrameLoad = (event: Event) => {
  if (event.target !== giscusFrame()) return
  // iframe 文档加载完成：此刻补一次，算是重试机制之外的即时通道
  postTheme()
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
  // 地址已经烘进下面的 script 标签、由 giscus 自己带进 iframe：重试逻辑不必再补发一次
  postedTheme = initialUrl

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

  // 站点切换主题时会派发 themechange；再监听根元素的两个主题标记，兜住其它改主题的入口
  window.addEventListener('themechange', handleThemeChange)
  // iframe 是 giscus 自己插进来的，用捕获阶段的 load 事件兜住它
  document.addEventListener('load', handleFrameLoad, true)
  rootObserver = new MutationObserver(() => syncTheme())
  rootObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] })
})

onUnmounted(() => {
  window.removeEventListener('themechange', handleThemeChange)
  document.removeEventListener('load', handleFrameLoad, true)
  stopThemeRetry()
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
