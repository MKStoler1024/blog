import { onBeforeUnmount, onMounted, watch } from 'vue'
import { useData } from 'vitepress'

/* KaTeX 在浏览器端按需加载并渲染（沿用站点原来的做法）：
   - 首次需要时注入 katex 的 CSS 与脚本，再加载 auto-render 扩展；
   - 正文是客户端异步挂载的（VitePress 的 Content 组件），首次渲染时可能还是空的，
     所以渲染前先等 .vp-doc 里出现内容；
   - 之后用 MutationObserver 盯着正文：SPA 换页、或正文晚于本函数执行，
     都会在内容出现后再渲染一次；
   - 渲染范围是 .vp-doc（迁移主题后正文容器由 .article .content 改成 .vp-doc）。

   为什么是组合式函数而不是组件：它不产出任何 DOM。写成组件的话，客户端渲染
   null 会留下一个 <!---->，而 SSR 会把相邻的注释占位合并成一个，
   于是「服务端 DOM 比客户端 vdom 少两个节点」→ 水合失配 →
   失配点之后的 DOM（包括正文）被整块重新渲染；而生产环境的正文来自 lean chunk
   里的空静态节点，重新渲染的结果就是文章正文变空白。 */

const KATEX_VERSION = '0.15.2'
const KATEX_CSS = `https://cdn.jsdelivr.net/npm/katex@${KATEX_VERSION}/dist/katex.min.css`
const KATEX_JS = `https://cdn.jsdelivr.net/npm/katex@${KATEX_VERSION}/dist/katex.min.js`
const KATEX_AUTO_RENDER = `https://cdn.jsdelivr.net/npm/katex@${KATEX_VERSION}/dist/contrib/auto-render.min.js`

const DELIMITERS = [
  { left: '$$', right: '$$', display: true },
  { left: '$', right: '$', display: false },
]

export function useKatex() {
  const { page } = useData()

  const renderMath = () => {
    if (typeof window.renderMathInElement === 'undefined') return
    const container = document.querySelector('.vp-doc')
    if (!container) return
    // 正文还没挂上（只有空壳）时先不渲染，等 MutationObserver 再叫一次
    if (container.textContent.trim().length < 2) return
    window.renderMathInElement(container, {
      delimiters: DELIMITERS,
      ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code', 'option'],
    })
  }

  const loadScript = (src) => new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`failed to load ${src}`))
    document.head.appendChild(script)
  })

  let loading = null
  const ensureKatex = () => {
    if (!loading) {
      loading = (async () => {
        if (!document.querySelector('link[data-katex]')) {
          const link = document.createElement('link')
          link.rel = 'stylesheet'
          link.href = KATEX_CSS
          link.dataset.katex = ''
          document.head.appendChild(link)
        }
        await loadScript(KATEX_JS)
        await loadScript(KATEX_AUTO_RENDER)
      })().catch(() => {
        // 加载失败就静默放弃，公式保持原文，不影响正文
        loading = null
      })
    }
    return loading.then(renderMath)
  }

  let observer

  const run = () => {
    void ensureKatex().then(renderMath)
  }

  onMounted(() => {
    run()
    // 正文晚于本函数出现时（或换页后）再渲染一次
    observer = new MutationObserver(() => {
      if (typeof window.renderMathInElement === 'function') renderMath()
    })
    observer.observe(document.body, { childList: true, subtree: true })
  })

  watch(() => page.value.relativePath, run)

  onBeforeUnmount(() => {
    observer?.disconnect()
  })
}
