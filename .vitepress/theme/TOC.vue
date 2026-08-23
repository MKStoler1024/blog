<template>
  <div class="toc" :class="{ open }">
    <button class="toc-toggle" type="button" :aria-expanded="open" aria-label="打开文章目录" @click="open = !open">
      <i class="fa fa-list" aria-hidden="true"></i>
      <span>本文目录</span>
    </button>
    <nav class="toc-panel" aria-label="文章目录">
      <div class="toc-title">文章目录</div>
      <ol>
        <li v-for="h in visibleData" :key="h.slug" :class="['h' + h.level, { 'active': props.active === h.slug }]">
          <a :href="'#' + h.slug" @click="open = false">{{ h.title }}</a>
        </li>
      </ol>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { type Header } from 'vitepress'
type TocItem = Pick<Header, 'level' | 'title' | 'slug'>
const props = withDefaults(defineProps<{
  data?: Header[]
  active?: string
}>(), {
  data: () => [],
  active: '',
})
const open = ref(false)
const fallbackData = ref<TocItem[]>([])
const visibleData = computed(() => fallbackData.value.length ? fallbackData.value : props.data)

onMounted(() => {
  nextTick(() => {
    fallbackData.value = Array.from(document.querySelectorAll<HTMLElement>('.article .content h1, .article .content h2, .article .content h3, .article .content h4, .article .content h5, .article .content h6'))
      .map(element => ({
        level: Number(element.tagName.slice(1)),
        title: element.textContent?.replace(/\u200b/g, '').trim() || '',
        slug: element.id,
      }))
      .filter(header => header.slug && header.title)
  })
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

@media (max-width: 1280px) {
  .toc {
    position: fixed;
    top: 0;
    left: max(8px, calc(50% - 400px));
    z-index: 110;
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
      box-shadow: 0 3px 12px var(--color-shadow);
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
      top: 64px;
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
  .toc {
    top: 0;
    right: 0;
    left: 0;
    width: 100%;
    height: 56px;
    transform: none;
  }

  .toc .toc-toggle {
    position: absolute;
    top: 7px;
    left: 56px;
  }

  .toc .toc-panel {
    top: 56px;
    right: 8px;
    left: 8px;
    width: auto;
    transform: none;
    max-height: calc(100vh - 72px);
  }

}
</style>
