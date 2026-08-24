import Layout from './Layout.vue'
import NotFound from './NotFound.vue'
import ToolDirectory from './ToolDirectory.vue'
import RssSubscribe from './RssSubscribe.vue'
import { type EnhanceAppContext } from 'vitepress'

const getPageUrl = () => `${window.location.origin}${window.location.pathname}${window.location.search}`

const syncPageViews = (pageUrl: string) => {
  if (typeof window === 'undefined') return

  const container = document.getElementById('busuanzi_container_page_pv')
  const value = document.getElementById('busuanzi_value_page_pv')
  if (!container || !value) return

  container.style.display = 'none'
  const showPageViews = (pageViews: unknown) => {
    if (typeof pageViews !== 'number' || !Number.isFinite(pageViews)) return
    value.textContent = String(pageViews)
    container.style.display = 'inline'
  }

  fetch('https://events.vercount.one/api/v2/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: pageUrl, isNewUv: false }),
  })
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return response.json()
    })
    .then(result => {
      if (getPageUrl() !== pageUrl) return
      const data = result?.data || result
      showPageViews(Number(data?.page_pv))
    })
    .catch(() => {})
}

export default {
  Layout,
  enhanceApp({ app, router }: EnhanceAppContext) {
    app.component('ToolDirectory', ToolDirectory)
    app.component('RssSubscribe', RssSubscribe)
    let syncedPageUrl = typeof window === 'undefined' ? '' : getPageUrl()
    router.onAfterRouteChange = () => {
      if (typeof window === 'undefined') return
      // Vercount scans the DOM only once, while VitePress replaces it on SPA navigation.
      const pageUrl = getPageUrl()
      if (pageUrl === syncedPageUrl) return
      syncedPageUrl = pageUrl
      window.setTimeout(() => syncPageViews(pageUrl), 0)
    }
  },
  NotFound,
}
