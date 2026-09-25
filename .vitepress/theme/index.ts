import Layout from './Layout.vue'
import NotFound from './NotFound.vue'
import ToolDirectory from './ToolDirectory.vue'
import RssSubscribe from './RssSubscribe.vue'
import KIcon from './components/Icon.vue'
import { nextTick } from 'vue'
import { type EnhanceAppContext } from 'vitepress'
// Kratos 主题样式（版式取自 OhMyIWB，配色为本站暖纸 / 赭褐体系）
import './styles/index.css'

const getPageUrl = () => `${window.location.origin}${window.location.pathname}${window.location.search}`

// 阅读量元素由 Article.vue 渲染（文章头部的「本文总阅读量」）。
// 元素 id 不能用 busuanzi_* / vercount_* 前缀：vercount.one/js 会扫描这两套 id，
// 把站点统计写进去，用它自己的站点数据覆盖掉这里的单篇阅读量。
const PAGE_VIEWS_ID = 'article_page_views'
const PAGE_VIEWS_VALUE_ID = 'article_page_views_value'

const findPageViewElements = () => {
  const container = document.getElementById(PAGE_VIEWS_ID)
  const value = document.getElementById(PAGE_VIEWS_VALUE_ID)
  return container && value ? { container, value } : null
}

/* VitePress 换页用了 <Transition mode="out-in">：路由变完之后，旧页面的 DOM 还会在文档里停留一小会儿，
   新页面稍后才挂上。所以「找到元素」不等于「元素属于刚打开的这一页」——必须等到元素换成了新的那一份，
   否则拿到的还是上一个页面留下的节点，写进去的数字会随着旧 DOM 一起被丢掉。 */
const waitForCurrentPageElements = (timeoutMs: number, isStale: (elements: ReturnType<typeof findPageViewElements>) => boolean) =>
  new Promise<{ container: HTMLElement, value: HTMLElement } | null>(resolve => {
    const deadline = Date.now() + timeoutMs
    const check = () => {
      const elements = findPageViewElements()
      // 没有元素（首页）或元素还没换上新的，都继续等
      if (elements && !isStale(elements)) {
        resolve(elements)
        return true
      }
      return false
    }
    if (check()) return
    const timer = window.setInterval(() => {
      if (check()) {
        window.clearInterval(timer)
        return
      }
      if (Date.now() > deadline) {
        window.clearInterval(timer)
        // 超时兜底：宁可写一次，也不要整块不显示
        resolve(findPageViewElements())
      }
    }, 50)
  })

/* 换页瞬间找到的元素很可能属于正要被替换掉的旧页面（Transition 是 out-in，旧 DOM 会晚一步才移除），
   用它们当「已过期」的判据：等 document.getElementById 返回别的节点，就说明新页面已经挂上了。
   另外用 article.href 交叉校验一次，确认这确实是对应这一页的元素。 */
const syncPageViews = async (pageUrl: string) => {
  if (typeof window === 'undefined') return

  // 换页瞬间 document 里的元素很可能还是上一页留下的，用它当「已过期」的判据
  const stale = findPageViewElements()
  const isStale = (elements: ReturnType<typeof findPageViewElements>) =>
    (stale !== null && elements?.container === stale.container) || location.href !== pageUrl

  const elements = await waitForCurrentPageElements(3000, isStale)
  // 首页没有阅读量元素；中途又翻页了也直接放弃
  if (!elements || getPageUrl() !== pageUrl) return

  const { container, value } = elements
  // 数字取回来之前先藏起来，避免显示成 0 或上一次的值
  container.style.display = 'none'

  try {
    const response = await fetch('https://events.vercount.one/api/v2/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: pageUrl, isNewUv: false }),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const result = await response.json()
    const data = result?.data || result
    // 取数字期间用户可能又翻走了，写之前再确认一次这一页还在
    if (getPageUrl() !== pageUrl || container !== document.getElementById(PAGE_VIEWS_ID)) return
    const pageViews = Number(data?.page_pv)
    if (!Number.isFinite(pageViews)) return
    value.textContent = String(pageViews)
    container.style.display = 'inline'
  } catch {
    // 取不到就保持隐藏，不显示错误数字
  }
}

export default {
  Layout,
  enhanceApp({ app, router }: EnhanceAppContext) {
    app.component('ToolDirectory', ToolDirectory)
    app.component('RssSubscribe', RssSubscribe)
    // Kratos 主题的全局图标组件
    app.component('KIcon', KIcon)
    // 首屏也要同步一次：直接打开/刷新文章页时没有任何路由变化事件，
    // 只挂 onAfterRouteChange 会漏掉「第一次打开文章」这种最常见的情况
    let syncedPageUrl = ''
    const syncCurrentPage = () => {
      if (typeof window === 'undefined') return
      // VitePress 会给标题锚点改 hash，那种变化不算换页
      const pageUrl = getPageUrl()
      if (pageUrl === syncedPageUrl) return
      syncedPageUrl = pageUrl
      void syncPageViews(pageUrl)
    }

    router.onAfterRouteChange = () => {
      // 等 Vue 提交完这次路由对应的 DOM
      void nextTick().then(syncCurrentPage)
    }
    void nextTick().then(syncCurrentPage)
  },
  NotFound,
}
