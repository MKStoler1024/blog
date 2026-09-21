import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useData } from 'vitepress'

/**
 * 文章目录（组合式函数）
 * 桌面端侧栏 WidgetToc 与移动端顶栏目录面板共用同一份状态。
 *
 * 说明：正文是客户端渲染的（VitePress 的 Content 组件），
 * 所以这里在挂载后、以及路由或正文就绪后重新收集标题。
 */
export function useToc(enabled) {
  const { page } = useData()
  const headings = ref([])
  const activeId = ref('')
  let observer = null
  let anchors = []

  function collectHeadings() {
    headings.value = []
    anchors = []
    if (enabled && !enabled.value) return
    // 正文容器：本站文章页的 .vp-doc 位于 article-detail 卡片内
    const doc = document.querySelector('.article-detail')
    if (!doc) return
    doc.querySelectorAll('h2, h3').forEach((el, index) => {
      let id = el.id
      if (!id) {
        id = `heading-${index}`
        el.id = id
      }
      headings.value.push({
        id,
        text: el.textContent.trim(),
        level: el.tagName === 'H2' ? 2 : 3,
      })
    })
  }

  function setupScrollSpy() {
    if (observer) observer.disconnect()
    if (!anchors.length) return
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) activeId.value = entry.target.id
        })
      },
      { rootMargin: '-60px 0px -70% 0px', threshold: 0 },
    )
    anchors.forEach((anchor) => observer.observe(anchor))
  }

  async function refresh() {
    await nextTick()
    collectHeadings()
    anchors = headings.value.map((heading) => document.getElementById(heading.id)).filter(Boolean)
    setupScrollSpy()
  }

  function scrollTo(id) {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  watch(() => page.value.relativePath, refresh)
  if (enabled) watch(enabled, refresh)
  onMounted(refresh)
  onBeforeUnmount(() => {
    if (observer) observer.disconnect()
  })

  return { headings, activeId, scrollTo, refresh }
}
