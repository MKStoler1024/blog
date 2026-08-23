<template>
  <header ref="headerElement" @focusout="handleFocusOut">
    <span class="brand"></span>
    <span class="container">
      <button class="menu-toggle" type="button" aria-label="打开导航菜单" :aria-expanded="menuOpen" @click="menuOpen = !menuOpen">
        <i class="fa fa-bars" aria-hidden="true"></i>
      </button>
      <span class="menu" :class="{ open: menuOpen }">
        <ul>
          <li v-for="m in menu" :key="m.url">
            <a :href="base + m.url" @click="menuOpen = false">
              <span>
                <i :class="['fa', m.icon]"></i>
                {{ m.name }}
              </span>
            </a>
          </li>
        </ul>
        <span class="font-switcher">
          <button class="font-toggle" type="button" aria-label="切换字体" :aria-expanded="fontOpen" @click="toggleFont">
            <i class="fa fa-font" aria-hidden="true"></i>
            切换字体
          </button>
          <div v-if="fontOpen" class="font-panel">
            <label for="font-mode">字体</label>
            <select id="font-mode" v-model="fontMode" aria-label="选择字体" @keydown.esc="fontOpen = false">
              <option value="default">站点默认</option>
              <option value="serif">serif</option>
              <option value="sans-serif">sans-serif</option>
            </select>
          </div>
        </span>
        <span class="search-box">
          <button class="search" type="button" aria-label="搜索文章" :aria-expanded="searchOpen" @click="toggleSearch">
            <i class="fa fa-search" aria-hidden="true"></i>
            搜索
          </button>
          <div v-if="searchOpen" class="search-panel">
            <input
              ref="searchInput"
              v-model="query"
              type="search"
              placeholder="搜索文章"
              aria-label="搜索文章"
              @keydown.esc="searchOpen = false"
            />
            <ul v-if="results.length" class="search-results">
              <li v-for="post in results" :key="post.href">
                <a :href="base + post.href" @click="searchOpen = false">
                  {{ post.title }}
                </a>
              </li>
            </ul>
            <p v-else-if="query.trim()" class="search-empty">没有找到相关文章</p>
          </div>
        </span>
      </span>
    </span>
    <TOC v-if="isArticle" :data="data.page.value.headers" embedded />
    <span class="other">
      <span class="font-switcher desktop-tool">
        <button class="font-toggle" type="button" aria-label="切换字体" :aria-expanded="fontOpen" @click="toggleFont">
          <i class="fa fa-font" aria-hidden="true"></i>
          切换字体
        </button>
        <div v-if="fontOpen" class="font-panel">
          <label for="font-mode-desktop">字体</label>
          <select id="font-mode-desktop" v-model="fontMode" aria-label="选择字体">
            <option value="default">站点默认</option>
            <option value="serif">serif</option>
            <option value="sans-serif">sans-serif</option>
          </select>
        </div>
      </span>
      <span class="search-box desktop-tool">
        <button class="search" type="button" aria-label="搜索文章" :aria-expanded="searchOpen" @click="toggleSearch">
          <i class="fa fa-search" aria-hidden="true"></i>
          搜索
        </button>
      </span>
      <button class="theme-toggle" type="button" :aria-label="`当前${themeModeLabel}，点击切换主题模式`" @click="toggleTheme">
        <i :class="['fa', themeIcon]" aria-hidden="true"></i>
        <span class="theme-label">{{ themeModeLabel }}</span>
      </button>
    </span>
  </header>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useData, useRoute } from 'vitepress'
import { data as posts } from '../posts.data'
import TOC from './TOC.vue'
const data = useData()
const base = data.site.value.base
const route = useRoute()
const headerElement = ref<HTMLElement>()
const menuOpen = ref(false)
type ThemeMode = 'auto' | 'dark' | 'light'
const themeMode = ref<ThemeMode>('auto')
const systemDark = ref(false)
const themeModeLabel = computed(() => themeMode.value === 'auto' ? '跟随系统' : themeMode.value === 'dark' ? '暗色' : '亮色')
const themeIcon = computed(() => themeMode.value === 'auto' ? 'fa-adjust' : themeMode.value === 'dark' ? 'fa-moon' : 'fa-sun')
type FontMode = 'default' | 'serif' | 'sans-serif'
const fontMode = ref<FontMode>('default')
const fontOpen = ref(false)

const applyFontMode = (mode: FontMode) => {
  document.documentElement.dataset.font = mode === 'default' ? '' : mode
  localStorage.setItem('font-mode', mode)
}

onMounted(() => {
  const savedMode = localStorage.getItem('font-mode') as FontMode | null
  if (savedMode === 'serif' || savedMode === 'sans-serif') {
    fontMode.value = savedMode
  }
  applyFontMode(fontMode.value)
})

const applyTheme = (mode: ThemeMode) => {
  const theme = mode === 'auto' ? (systemDark.value ? 'dark' : 'light') : mode
  document.documentElement.dataset.theme = theme
  localStorage.setItem('theme-mode', mode)
  window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }))
}

onMounted(() => {
  const savedMode = localStorage.getItem('theme-mode')
  if (savedMode === 'dark' || savedMode === 'light' || savedMode === 'auto') {
    themeMode.value = savedMode
  }
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  systemDark.value = mediaQuery.matches
  applyTheme(themeMode.value)
  mediaQuery.addEventListener('change', handleSystemThemeChange)
  window.addEventListener('beforeunload', () => mediaQuery.removeEventListener('change', handleSystemThemeChange), { once: true })
})

const toggleTheme = () => {
  themeMode.value = themeMode.value === 'auto' ? 'dark' : themeMode.value === 'dark' ? 'light' : 'auto'
  applyTheme(themeMode.value)
}

const handleSystemThemeChange = (event: MediaQueryListEvent) => {
  systemDark.value = event.matches
  if (themeMode.value === 'auto') applyTheme(themeMode.value)
}

watch(fontMode, applyFontMode)

const searchOpen = ref(false)
const query = ref('')
const searchInput = ref<HTMLInputElement>()
const results = computed(() => {
  const keyword = query.value.trim().toLowerCase()
  if (!keyword) return []
  return posts.filter(post => {
    const excerpt = post.excerpt.replace(/<[^>]*>/g, ' ')
    const searchable = [post.title, ...(post.tags || []), excerpt].join(' ').toLowerCase()
    return searchable.includes(keyword)
  }).slice(0, 6)
})

const toggleSearch = () => {
  searchOpen.value = !searchOpen.value
  fontOpen.value = false
  if (searchOpen.value) {
    nextTick(() => searchInput.value?.focus())
  } else {
    query.value = ''
  }
}

const toggleFont = () => {
  fontOpen.value = !fontOpen.value
  searchOpen.value = false
}

const closePopovers = (event: PointerEvent) => {
  if (!headerElement.value?.contains(event.target as Node)) {
    searchOpen.value = false
    fontOpen.value = false
  }
}

const handleFocusOut = (event: FocusEvent) => {
  const nextTarget = event.relatedTarget as Node | null
  if (!nextTarget || !headerElement.value?.contains(nextTarget)) {
    searchOpen.value = false
    fontOpen.value = false
    menuOpen.value = false
  }
}

onMounted(() => document.addEventListener('pointerdown', closePopovers))
onUnmounted(() => document.removeEventListener('pointerdown', closePopovers))

interface MenuItem { icon: string, name: string, url: string }
const menu: MenuItem[] = [
  { icon: 'fa-home', name: '首页', url: '' },
  { icon: 'fa-tag', name: '标签', url: 'tags/' },
  { icon: 'fa-leaf', name: '关于', url: 'readme.html' }
]
const isArticle = computed(() => posts.some(post => post.href === route.path.replace(base, '')))
</script>

<style lang="scss">
header {
  position: fixed;
  top: 0;
  width: 100%;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-surface);
  z-index: 100;

  .brand {
    justify-self: left;
    padding-left: 8px;
  }

  .container {
    position: absolute;
    left: 50%;
    translate: -50%;
  }

  .menu-toggle {
    display: none;
    border: 0;
    padding: 8px;
    color: var(--color-gray);
    background: transparent;
    font: inherit;
    cursor: pointer;
  }

  .other {
    justify-self: right;
    display: flex;
    align-items: center;
    gap: 12px;
    padding-right: 8px;

    button {
      color: var(--color-gray);
    }
  }

  .search-box {
    position: relative;
  }

  button.search {
    padding: 0;
    border: 0;
    color: var(--color-gray);
    background: transparent;
    font: inherit;
    cursor: pointer;

    &:hover {
      color: var(--color-accent);
    }
  }

  .search-panel {
    position: absolute;
    top: 32px;
    right: 0;
    width: min(320px, calc(100vw - 16px));
    padding: 10px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.16);
  }

  .search-panel input {
    width: 100%;
    padding: 7px 8px;
    border: 1px solid var(--color-border);
    color: var(--color-text);
    background: var(--color-surface);
    font: inherit;
  }

  .search-results {
    margin: 8px 0 0;
    padding: 0;
    list-style: none;

    li + li {
      border-top: 1px solid var(--color-border);
    }

    a {
      display: block;
      padding: 8px 2px;
    }
  }

  .search-empty {
    margin: 8px 2px 0;
    color: var(--color-gray);
    font-size: 14px;
  }

  .font-switcher {
    position: relative;
    display: flex;
    align-items: center;
    color: var(--color-gray);
  }

  button.font-toggle {
    padding: 0;
    border: 0;
    color: inherit;
    background: transparent;
    font: inherit;
    cursor: pointer;

    &:hover {
      color: var(--color-accent);
    }
  }

  button.theme-toggle {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    border: 0;
    padding: 0;
    color: var(--color-gray);
    background: transparent;
    font: inherit;
    cursor: pointer;

    &:hover {
      color: var(--color-accent);
    }
  }

  .font-panel {
    position: absolute;
    top: 32px;
    right: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    width: max-content;
    padding: 10px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.16);
  }

  .font-panel select {
    max-width: 120px;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    padding: 4px 6px;
    color: var(--color-gray);
    background: var(--color-surface-muted);
    font: inherit;
    cursor: pointer;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .menu {
    .font-switcher,
    button.search {
      color: var(--color-gray);
    }

    .font-switcher,
    .search-box {
      display: none;
    }

    ul {
      margin: 0;
      padding: 0;
      list-style: none;
    }

    li {
      margin: 0 12px;
      display: inline;
    }

    a {
      color: var(--color-gray);
    }
  }

  a {
    color: var(--color-gray);
    transition: color 0.2s ease-out;

    &:hover {
      color: var(--color-accent);
    }
  }
}

@media (max-width: 640px) {
  header {
    height: 56px;

    .container {
      left: 8px;
      translate: none;
    }

    .menu-toggle {
      display: block;
    }

    .menu {
      position: absolute;
      top: 48px;
      left: 0;
      display: none;
      width: min(220px, calc(100vw - 16px));
      padding: 8px;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      box-shadow: 0 4px 14px rgba(0, 0, 0, .16);

      &.open {
        display: block;
      }

      .font-switcher,
      .search-box {
        position: relative;
        top: auto;
        right: auto;
      }

      .font-switcher,
      .search-box {
        position: relative;
        top: auto;
        right: auto;
        display: block;
        margin-top: 4px;
      }

      .font-toggle,
      button.search {
        display: block;
        width: 100%;
        padding: 10px 8px;
        text-align: left;
      }

      .font-panel,
      .search-panel {
        position: static;
        width: auto;
        margin: 0 8px 6px;
        box-shadow: none;
      }

      .search-panel input {
        box-sizing: border-box;
        width: 100%;
      }

      li {
        display: block;
        margin: 0;
      }

      a {
        display: block;
        padding: 10px 8px;
      }
    }

    .other {
      gap: 8px;
      padding-right: 8px;
    }

    .other .desktop-tool {
      display: none;
    }

    button.theme-toggle {
      padding: 8px 4px;
      font-size: 14px;
    }

    .theme-label {
      display: none;
    }

    .search-panel,
    .font-panel {
      top: 44px;
      right: -4px;
    }
  }
}
</style>
