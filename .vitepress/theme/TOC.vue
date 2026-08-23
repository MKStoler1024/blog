<template>
  <div class="toc" :class="{ open, embedded }">
    <button class="toc-toggle" type="button" :aria-expanded="open" aria-label="打开文章目录" @click="open = !open">
      <span class="toc-progress">{{ activeIndex }} / {{ visibleData.length }} 段</span>
    </button>
    <nav class="toc-panel" aria-label="文章目录">
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
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
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
const visibleData = computed(() => fallbackData.value.length ? fallbackData.value : props.data)
const activeSlug = ref(props.active)
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

onMounted(() => {
  nextTick(() => {
    fallbackData.value = Array.from(document.querySelectorAll<HTMLElement>('.article .content h1, .article .content h2, .article .content h3, .article .content h4, .article .content h5, .article .content h6'))
      .map(element => ({
        level: Number(element.tagName.slice(1)),
        title: element.textContent?.replace(/\u200b/g, '').trim() || '',
        slug: element.id,
      }))
      .filter(header => header.slug && header.title)
      updateActive()
      window.addEventListener('scroll', updateActive, { passive: true })
  })
})

    onUnmounted(() => window.removeEventListener('scroll', updateActive))
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
  }

  .toc-title {
    margin-bottom: 0.85em;
    color: var(--color-gray);
    font-size: 0.82em;
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

@media (max-width: 1280px) {
  .toc {
    position: fixed;
    top: 64px;
    left: max(8px, calc(50% - 400px));
    z-index: 90;
    width: auto;
    height: auto;
    transform: none;
    pointer-events: none;

    .toc-toggle {
      display: inline-flex;
      align-items: center;
      gap: 0.4em;
      border: 1px solid var(--color-border);
      border-radius: 5px;
      padding: 0.65em 0.85em;
      color: var(--color-text);
      background: var(--color-surface);
      box-shadow: none;
      font: inherit;
      cursor: pointer;
      pointer-events: auto;
    }

    .toc-toggle:hover,
    &.open .toc-toggle {
      color: var(--color-accent);
      border-color: var(--color-accent);
    }

    .toc-panel {
      position: absolute;
      left: 0;
      top: 0;
      bottom: auto;
      display: none;
      width: min(320px, calc(100vw - 32px));
      max-height: min(60vh, 480px);
      overflow-y: auto;
      padding: 12px 14px;
      transform: none;
      border: 1px solid var(--color-border);
      border-radius: 5px;
      background: var(--color-surface);
      box-shadow: 0 5px 18px var(--color-shadow);
      pointer-events: auto;
    }

    &.open .toc-panel {
      display: block;
    }

    .toc-title {
      margin-bottom: 0.5em;
      padding-left: 12px;
    }

    .toc-panel {
      border-left: 0;
      padding-left: 0;
    }

    ol {
      margin: 0;
    }
  }
}

@media (max-width: 720px) {
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
      font-size: 1.05em;
      font-weight: 600;
      color: var(--color-gray);
    }
  }

  .toc.embedded {
    display: block;
    top: 0;
    right: 56px;
    left: 56px;
    width: auto;
    height: 56px;
    border-left: 0;

    .toc-toggle {
      color: var(--color-gray);
    }
  }

  .toc .toc-toggle {
    position: absolute;
  }

  .toc .toc-panel {
    top: 56px;
    right: 0;
    left: 0;
    width: auto;
    transform: none;
    max-height: calc(100vh - 72px);
    border-top: 1px solid var(--color-border);
    border-radius: 0;
  }

}
</style>
