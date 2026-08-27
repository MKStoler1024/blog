<template>
  <header ref="headerElement" @focusout="handleFocusOut">
    <span class="header-left">
      <button class="menu-toggle" type="button" aria-label="打开导航菜单" :aria-expanded="menuOpen" @click="menuOpen = !menuOpen">
        <i class="fa fa-bars" aria-hidden="true"></i>
      </button>
      <a class="brand" :href="base" aria-label="返回首页">
        <span class="brand-name">{{ siteTitle }}</span>
      </a>
    </span>
    <span class="container">
      <span class="menu" :class="{ open: menuOpen }" @click="closeMenuOnBackdrop">
        <ul>
          <li v-for="m in menu" :key="m.url">
            <a :href="base + m.url" :class="{ active: isActive(m.url) }" @click="menuOpen = false">
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
          <input
            ref="menuSearchInput"
            v-model="query"
            type="search"
            placeholder="搜索文章"
            aria-label="搜索文章"
            @keydown.esc="menuOpen = false"
          />
          <ul v-if="results.length" class="search-results">
            <li v-for="post in results" :key="post.href">
              <a :href="base + post.href" @click="menuOpen = false">
                {{ post.title }}
              </a>
            </li>
          </ul>
          <p v-else-if="query.trim()" class="search-empty">没有找到相关文章</p>
        </span>
      </span>
    </span>
    <TOC v-if="isArticle" :key="route.path" :data="data.page.value.headers" embedded />
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
          <span class="search-label">搜索</span>
          <kbd class="search-kbd">Ctrl&nbsp;K</kbd>
        </button>
      </span>
      <button class="theme-toggle" type="button" :aria-label="`当前${themeModeLabel}，点击切换主题模式`" @click="toggleTheme">
        <i :class="['fa', themeIcon]" aria-hidden="true"></i>
        <span class="theme-label">{{ themeModeLabel }}</span>
      </button>
    </span>
    <div v-if="searchOpen" class="search-overlay" @click.self="searchOpen = false">
      <div class="search-dialog">
        <div class="search-dialog-input">
          <i class="fa fa-search" aria-hidden="true"></i>
          <input
            ref="desktopSearchInput"
            v-model="query"
            type="search"
            placeholder="搜索文章"
            aria-label="搜索文章"
            @keydown.esc="searchOpen = false"
          />
        </div>
        <ul v-if="results.length" class="search-results">
          <li v-for="post in results" :key="post.href">
            <a :href="base + post.href" @click="searchOpen = false">
              {{ post.title }}
            </a>
          </li>
        </ul>
        <p v-else-if="query.trim()" class="search-empty">没有找到相关文章</p>
      </div>
    </div>
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
const menuSearchInput = ref<HTMLInputElement>()
const desktopSearchInput = ref<HTMLInputElement>()
const results = computed(() => {
  const keyword = query.value.trim().toLowerCase()
  if (!keyword) return []
  return posts.filter(post => {
    const excerpt = post.excerpt.replace(/<[^>]*>/g, ' ')
    const searchable = [post.title, ...(post.tags || []), excerpt].join(' ').toLowerCase()
    return searchable.includes(keyword)
  }).slice(0, 6)
})

const closeMenuOnBackdrop = (event: MouseEvent) => {
  if ((event.target as HTMLElement).classList.contains('menu')) {
    menuOpen.value = false
  }
}

const isMobileViewport = () => window.matchMedia('(max-width: 1100px)').matches

watch([menuOpen, searchOpen], () => {
  document.body.style.overflow = (menuOpen.value || (searchOpen.value && !isMobileViewport())) ? 'hidden' : ''
})

const toggleSearch = () => {
  fontOpen.value = false
  if (window.matchMedia('(max-width: 1100px)').matches) {
    menuOpen.value = true
    searchOpen.value = false
    nextTick(() => menuSearchInput.value?.focus())
    return
  }
  searchOpen.value = !searchOpen.value
  if (searchOpen.value) {
    nextTick(() => desktopSearchInput.value?.focus())
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

const handleGlobalKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && searchOpen.value) {
    searchOpen.value = false
    return
  }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    toggleSearch()
  }
}

onMounted(() => document.addEventListener('pointerdown', closePopovers))
onMounted(() => document.addEventListener('keydown', handleGlobalKeydown))
onUnmounted(() => document.removeEventListener('pointerdown', closePopovers))
onUnmounted(() => document.removeEventListener('keydown', handleGlobalKeydown))

interface MenuItem { icon: string, name: string, url: string }
const menu: MenuItem[] = [
  { icon: 'fa-home', name: '首页', url: '' },
  { icon: 'fa-tag', name: '标签', url: 'tags/' },
  { icon: 'fa-leaf', name: '关于', url: 'readme.html' }
]
const isArticle = computed(() => posts.some(post => post.href === route.path.replace(base, '')))
const siteTitle = data.site.value.title
const currentPath = computed(() => route.path.replace(base, '').replace('index.html', ''))
const isActive = (url: string) => {
  if (url === '') return currentPath.value === ''
  return currentPath.value.startsWith(url)
}
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
  background: var(--color-header);
  -webkit-backdrop-filter: saturate(150%) blur(12px);
  backdrop-filter: saturate(150%) blur(12px);
  box-shadow: 0 2px 8px var(--color-shadow);
  z-index: 100;
  transition: background-color 0.2s ease, box-shadow 0.2s ease;

  .header-left {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    min-width: 0;
    padding-left: 8px;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0 4px;
    color: var(--color-text);
    font-size: 17px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;

    .brand-name {
      overflow: hidden;
      text-overflow: ellipsis;
    }

    &:hover {
      color: var(--color-accent);
    }
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

  .search-box.desktop-tool button.search {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 32px;
    padding: 0 12px;
    border: 1px solid var(--color-border);
    border-radius: 999px;
    background: var(--color-surface-muted);
    color: var(--color-gray);
    font-size: 14px;
    transition: border-color 0.2s ease, color 0.2s ease;

    &:hover {
      border-color: var(--color-accent);
      color: var(--color-accent);
    }
  }

  .search-overlay {
    position: absolute;
    top: 64px;
    right: 0;
    left: 0;
    height: calc(100vh - 64px);
    height: calc(100dvh - 64px);
    z-index: 90;
    overflow-y: auto;
    background: rgba(10, 20, 40, 0.45);
    animation: overlay-fade-in 0.18s ease;

    .search-dialog {
      max-width: 600px;
      margin: 36px auto 0;
      padding: 20px;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 10px;
      box-shadow: 0 16px 48px rgba(0, 0, 0, 0.24);
    }

    .search-dialog-input {
      position: relative;
      display: flex;
      align-items: center;

      > i {
        position: absolute;
        left: 16px;
        color: var(--color-gray);
      }

      input {
        width: 100%;
        padding: 12px 16px 12px 42px;
        border: 1px solid var(--color-border);
        border-radius: 999px;
        background: var(--color-surface-muted);
        color: var(--color-text);
        font: inherit;
        font-size: 16px;

        &:focus {
          outline: none;
          border-color: var(--color-accent);
        }
      }
    }

    .search-results {
      margin-top: 16px;

      a {
        padding: 12px 4px;
        font-size: 15px;
      }
    }

    .search-empty {
      margin-top: 16px;
      font-size: 15px;
    }
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

  .search-kbd {
    margin-left: 6px;
    padding: 1px 5px;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    background: var(--color-surface-muted);
    color: var(--color-gray);
    font-family: inherit;
    font-size: 12px;
    line-height: 1.6;
    vertical-align: middle;
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

      &.active {
        color: var(--color-accent);
        font-weight: 600;
      }
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

@media (max-width: 1100px) {
  header {
    height: 56px;

    .container {
      position: static;
      left: auto;
      translate: none;
    }

    .header-left {
      .menu-toggle {
        display: block;
      }

      .brand {
        font-size: 15px;
      }
    }

    .search-kbd {
      display: none;
    }

    .menu {
      position: absolute;
      top: 56px;
      right: 0;
      left: 0;
      height: calc(100vh - 56px);
      height: calc(100dvh - 56px);
      z-index: 80;
      display: none;
      overflow-y: auto;
      padding: 8px 16px 40px;
      background: var(--color-surface);

      &.open {
        display: block;
        animation: nav-screen-in 0.2s ease;
      }

      .font-switcher,
      .search-box {
        position: relative;
        top: auto;
        right: auto;
        display: block;
        margin-top: 8px;
      }

      .search-box input {
        box-sizing: border-box;
        width: 100%;
        padding: 10px 16px;
        border: 1px solid var(--color-border);
        border-radius: 999px;
        background: var(--color-surface-muted);
        color: var(--color-text);
        font: inherit;
        font-size: 15px;

        &:focus {
          border-color: var(--color-accent);
          outline: none;
        }
      }

      .search-results a {
        padding: 10px 4px;
        font-size: 15px;
      }

      .font-toggle {
        display: block;
        width: 100%;
        padding: 12px 8px;
        text-align: left;
        font-size: 15px;
      }

      .font-panel {
        position: static;
        width: auto;
        margin: 0 8px 6px;
        box-shadow: none;
      }

      li {
        display: block;
        margin: 0;
      }

      li + li {
        border-top: 1px solid var(--color-border);
      }

      a {
        display: block;
        padding: 12px 8px;
      }
    }

    .other {
      gap: 8px;
      padding-right: 8px;
    }

    .other .font-switcher.desktop-tool {
      display: none;
    }

    .other .search-box.desktop-tool button.search {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      padding: 0;
      border: 0;
      border-radius: 50%;
    }

    .other .search-box.desktop-tool .search-label,
    .other .search-box.desktop-tool .search-kbd {
      display: none;
    }

    button.theme-toggle {
      padding: 8px 4px;
      font-size: 14px;
    }

    .theme-label {
      display: none;
    }

    .search-overlay {
      display: none;
    }

    .font-panel {
      top: 44px;
      right: -4px;
    }
  }
}

@keyframes nav-screen-in {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes overlay-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
