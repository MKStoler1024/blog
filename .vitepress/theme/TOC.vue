<template>
  <div class="toc" :class="{ open, embedded }">
    <span v-if="scanning" class="toc-skeleton skeleton-block" aria-label="正在加载文章目录" role="status"></span>
    <button v-if="visibleData.length" class="toc-toggle" type="button" :aria-expanded="open" aria-label="打开文章目录" @click="open = !open">
      <span class="toc-progress">{{ activeIndex }} / {{ visibleData.length }} 段</span>
    </button>
    <nav v-if="visibleData.length" class="toc-panel" aria-label="文章目录">
      <div class="toc-title">文章目录</div>
      <ol>
        <li v-for="h in visibleData" :key="h.slug" :class="['h' + h.level, { 'active': activeSlug === h.slug }]">
          <a :href="'#' + h.slug" @click="open = false">{{ h.title }}</a>
        </li>
      </ol>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { type Header } from 'vitepress'
type TocItem = Pick<Header, 'level' | 'title' | 'slug'>
const props = withDefaults(defineProps<{
  data?: Header[]
  active?: string
  embedded?: boolean
}>(), {
  data: () => [],
  active: '',
  embedded: false,
})
const { embedded } = props
const open = ref(false)
const fallbackData = ref<TocItem[]>([])
const scanning = ref(true)
const visibleData = computed(() => fallbackData.value.length ? fallbackData.value : props.data)
const activeSlug = ref(props.active)
let contentObserver: MutationObserver | undefined
let bodyObserver: MutationObserver | undefined
let scanTimer: number | undefined
const activeIndex = computed(() => {
  const index = visibleData.value.findIndex(item => item.slug === activeSlug.value)
  return index >= 0 ? index + 1 : visibleData.value.length ? 1 : 0
})

const updateActive = () => {
  const headings = visibleData.value
  if (!headings.length) return
  const index = headings.findIndex(item => {
    const element = document.getElementById(item.slug)
    return element && element.getBoundingClientRect().top > 200
  })
  activeSlug.value = headings[index > 0 ? index - 1 : index === 0 ? 0 : headings.length - 1].slug
}

const updateFallbackData = () => {
  fallbackData.value = Array.from(document.querySelectorAll<HTMLElement>('.article .content h1, .article .content h2, .article .content h3, .article .content h4, .article .content h5, .article .content h6'))
      .map(element => ({
        level: Number(element.tagName.slice(1)),
        title: element.textContent?.replace(/\u200b/g, '').trim() || '',
        slug: element.id,
      }))
      .filter(header => header.slug && header.title)
  updateActive()
  scanning.value = false
}

// 文章正文可能在 SPA 路由切换后（Transition out-in / 异步 chunk）才挂载，
// 因此需要先兜底观察 body，内容出现后再只观察 .article .content 子树，
// 且每次扫描都重新绑定当前 content 节点（skeleton 被替换后 observer 会失效）。
const scan = () => {
  window.clearTimeout(scanTimer)
  scanTimer = window.setTimeout(() => {
    updateFallbackData()
    if (!fallbackData.value.length && !props.data?.length) {
      scanning.value = true
    }
    ensureContentObserver()
  }, 60)
}

const ensureContentObserver = () => {
  const content = document.querySelector('.article .content')
  if (content) {
    bodyObserver?.disconnect()
    bodyObserver = undefined
    contentObserver?.disconnect()
    contentObserver = new MutationObserver(scan)
    contentObserver.observe(content, { childList: true, subtree: true })
  } else {
    contentObserver?.disconnect()
    contentObserver = undefined
    if (!bodyObserver) {
      bodyObserver = new MutationObserver(scan)
      bodyObserver.observe(document.body, { childList: true, subtree: true })
    }
  }
}

onMounted(() => {
  ensureContentObserver()
  scan()
  window.addEventListener('scroll', updateActive, { passive: true })
})

onUnmounted(() => {
  contentObserver?.disconnect()
  bodyObserver?.disconnect()
  window.clearTimeout(scanTimer)
  window.removeEventListener('scroll', updateActive)
})
</script>

<style lang="scss">
// * {
//   border: 1px dashed red;
//   background-color: rgba(255, 0, 0, 0.05);
// }
.toc {
  position: absolute;
  top: 0;
  right: -240px;
  height: 100%;
  width: 240px;

  .toc-toggle {
    display: none;
  }

  .toc-panel {
    position: sticky;
    top: 80px;
    max-height: calc(100vh - 104px);
    overflow-y: auto;
    border-left: 1px solid var(--color-border);
    padding-left: 16px;
    scrollbar-width: thin;
    font-family: var(--global-font);
  }

  .toc-title {
    margin-bottom: 0.85em;
    color: var(--color-gray);
    font-size: 0.85em;
    font-weight: bold;
    letter-spacing: 0.05em;
  }

  ol {
    list-style: none;
    padding-inline-start: 0;
  }

  li {
    position: relative;
    border-left: 2px solid transparent;
    transition: border-color 0.2s ease, transform 0.2s ease;

    a {
      display: block;
      overflow: hidden;
      color: var(--color-text);
      padding: 0.25em 0.6em;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 1em;
      transition: color 0.2s ease;
    }

    &.active {
      border-left-color: var(--color-accent);
      font-weight: bold;

      a {
        color: var(--color-accent);
      }
    }

    &:hover a {
      color: var(--color-accent);
    }
  }

  .h1 {
    padding-left: 0;
    font-size: 1em;
    font-weight: bold;
  }

  .h2 {
    padding-left: 8px;
  }

  .h3 {
    padding-left: 16px;
  }

  .h4 {
    padding-left: 24px;
  }

  .h5 {
    padding-left: 32px;
  }

  .h6 {
    padding-left: 40px;
  }
}

.toc.embedded {
  display: none;
  position: absolute;
  top: 0;
  right: 0;
  width: 220px;
  height: 64px;
  background: var(--color-surface);
  border-left: 1px solid var(--color-border);
  pointer-events: none;

  .toc-toggle {
    width: 100%;
    height: 64px;
    border: 0;
    background: transparent;
    color: var(--color-gray);
    pointer-events: auto;
  }
}

.toc-skeleton {
  width: 112px;
  height: 16px;
  margin: 24px auto;
}

@media (max-width: 1100px) {
  .toc:not(.embedded) {
    display: none;
  }

  .toc {
    top: 56px;
    right: 0;
    left: 0;
    width: 100%;
    height: 56px;
    transform: none;
    background: var(--color-surface);
    box-shadow: 0 3px 8px -5px var(--color-shadow);

    .toc-toggle {
      inset: 0;
      display: flex;
      width: 100%;
      height: 56px;
      align-items: center;
      justify-content: center;
      border: 0;
      border-radius: 0;
      padding: 0 18px;
      background: transparent;
      box-shadow: none;
      color: var(--color-text);
    }

    .toc-toggle:hover,
    &.open .toc-toggle {
      border-color: transparent;
      color: var(--color-accent);
    }

    .toc-progress {
      text-align: center;
      font-size: 1em;
      font-weight: 600;
      color: var(--color-gray);
    }
  }

  .toc.embedded {
    position: relative;
    top: auto;
    right: auto;
    left: auto;
    display: block;
    flex: 1;
    min-width: 0;
    width: auto;
    height: 56px;
    border-left: 0;
    background: transparent;

    .toc-toggle {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      padding: 0 8px;
      border: 0;
      background: transparent;
      color: var(--color-gray);
      font-size: 14px;
      pointer-events: auto;
    }
  }

  .toc.embedded .toc-skeleton {
    margin: 20px auto;
  }

  .toc .toc-toggle {
    position: absolute;
  }

  .toc .toc-panel {
    position: absolute;
    display: none;
    top: 56px;
    right: 0;
    left: 0;
    width: auto;
    transform: none;
    max-height: calc(100vh - 72px);
    border-top: 1px solid var(--color-border);
    border-radius: 0;
    background: var(--color-surface);
    pointer-events: auto;
  }

  .toc.open .toc-panel {
    display: block;
  }

}
</style>
