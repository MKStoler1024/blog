import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useData } from 'vitepress'

/**
 * 文章目录（组合式函数）
 * 桌面端侧栏 WidgetToc 与移动端顶栏目录面板共用同一套逻辑。
 *
 * 说明：
 * - 正文是客户端渲染的（VitePress 的 Content 组件），所以这里在挂载后、
 *   以及路由或正文就绪后重新收集标题；
 * - 目录收录 h1 / h2 / h3。文章里出现一个以上 h1 时（例如长文按「部分」分节），
 *   目录按 h1 分组、每组可折叠，避免目录长到没法看。
 */
export function useToc(enabled) {
  const { page } = useData()
  const headings = ref([])
  // 折叠起来的分组（一级标题的 id）
  const collapsed = reactive(new Set())
  const activeId = ref('')
  let observer = null
  let contentObserver = null
  let collectTimer = null
  let anchors = []
  let signature = ''

  function collectHeadings() {
    headings.value = []
    anchors = []
    signature = ''
    if (enabled && !enabled.value) return
    // 正文容器：本站文章页的 .vp-doc 位于 article-detail 卡片内
    const doc = document.querySelector('.article-detail')
    if (!doc) return
    const list = []
    doc.querySelectorAll('h1, h2, h3').forEach((el, index) => {
      let id = el.id
      if (!id) {
        id = `heading-${index}`
        el.id = id
      }
      list.push({
        id,
        text: el.textContent.trim(),
        level: Number(el.tagName.slice(1)),
      })
    })
    headings.value = list
    signature = headingSignature()
  }

  function headingSignature() {
    const doc = document.querySelector('.article-detail')
    if (!doc) return ''
    return [...doc.querySelectorAll('h1, h2, h3')]
      .map((el) => `${el.tagName}:${el.id}`)
      .join('|')
  }

  /* 正文里可能有客户端异步渲染的内容（例如工具目录，按分类生成一堆 h2），
     挂载时它们还没出现，所以除了路由变化，再盯着正文本身的增删：
     标题集合真的变了才重新收集，避免和自己的渲染互相触发 */
  function setupContentObserver() {
    contentObserver?.disconnect()
    const doc = document.querySelector('.article-detail')
    if (!doc) return
    contentObserver = new MutationObserver(() => {
      window.clearTimeout(collectTimer)
      collectTimer = window.setTimeout(() => {
        if (headingSignature() !== signature) refresh()
      }, 200)
    })
    contentObserver.observe(doc, { childList: true, subtree: true })
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
    collapsed.clear()
    collectHeadings()
    anchors = headings.value.map((heading) => document.getElementById(heading.id)).filter(Boolean)
    setupScrollSpy()
    setupContentObserver()
  }

  function scrollTo(id) {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // 一级标题分组：h1 作为分组标题，它后面的 h2/h3 归到这一组；
  // 文章在第一个 h1 之前若还有 h2/h3（比如正文直接从 ## 开始），它们单独成行
  const groups = computed(() => {
    const list = []
    let current = null
    for (const heading of headings.value) {
      if (heading.level === 1) {
        current = { ...heading, group: true, children: [] }
        list.push(current)
      } else if (current) {
        current.children.push(heading)
      } else {
        list.push({ ...heading, group: false, children: [] })
      }
    }
    return list
  })

  const groupIds = computed(() => groups.value.filter((group) => group.group).map((group) => group.id))
  // 只有一个（或没有）一级标题时不折腾折叠，保持一列到底
  const foldable = computed(() => groupIds.value.length > 1)
  const allCollapsed = computed(() => foldable.value && groupIds.value.every((id) => collapsed.has(id)))

  function isCollapsed(id) {
    return collapsed.has(id)
  }

  function toggleGroup(id) {
    if (collapsed.has(id)) collapsed.delete(id)
    else collapsed.add(id)
  }

  function toggleAll() {
    if (allCollapsed.value) groupIds.value.forEach((id) => collapsed.delete(id))
    else groupIds.value.forEach((id) => collapsed.add(id))
  }

  watch(() => page.value.relativePath, refresh)
  if (enabled) watch(enabled, refresh)
  onMounted(refresh)
  onBeforeUnmount(() => {
    if (observer) observer.disconnect()
    contentObserver?.disconnect()
    window.clearTimeout(collectTimer)
  })

  return {
    headings,
    groups,
    foldable,
    allCollapsed,
    isCollapsed,
    toggleGroup,
    toggleAll,
    activeId,
    scrollTo,
    refresh,
  }
}
