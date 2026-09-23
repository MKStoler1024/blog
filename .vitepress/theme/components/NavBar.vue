<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useData, useRouter } from 'vitepress'
import { useToc } from '../composables/toc.js'
import NavSearch from './NavSearch.vue'
import SideBar from './SideBar.vue'

const props = defineProps({
  // 文章详情页（显示移动端目录按钮与侧栏目录）
  isPost: { type: Boolean, default: false },
  // 首页 Banner 模式：导航初始透明叠加
  bannerMode: { type: Boolean, default: false },
  // 当前路径（去掉 base 与 index.html），用于高亮导航项
  currentPath: { type: String, default: '' },
  // 侧栏小工具的启用开关
  widgets: { type: Object, default: () => ({}) },
})

const { site } = useData()
const router = useRouter()
const base = site.value.base

const scrolled = ref(false)
const menuOpen = ref(false)
const widgetsOpen = ref(false)
const tocOpen = ref(false)

const {
  headings,
  groups: tocGroups,
  foldable: tocFoldable,
  allCollapsed: tocAllCollapsed,
  isCollapsed: isTocCollapsed,
  toggleGroup: toggleTocGroup,
  toggleAll: toggleTocAll,
  activeId,
  scrollTo,
} = useToc(computed(() => props.isPost))

// 导航项：首页 / 关于（标签页不再放进顶部导航，侧栏的「标签聚合」与文章标签链接仍可进入）
const menu = [
  { icon: 'fa-home', text: '首页', link: '' },
  { icon: 'fa-leaf', text: '关于', link: 'readme.html' },
]

const isActive = (link) => (link === '' ? props.currentPath === '' : props.currentPath.startsWith(link))
const navClass = computed(() => ({
  scrolled: scrolled.value,
  'banner-mode': props.bannerMode && !scrolled.value,
}))

/* 主题三态：跟随系统 / 固定暗色 / 固定亮色。
   沿用站点既有的 localStorage 键 theme-mode 与 html[data-theme]，
   这样首屏引导脚本（head 里那段，负责首帧底色）、giscus 主题同步都继续有效。

   注意：这里的初始状态必须「服务端和客户端首帧完全一致」——localStorage 与
   matchMedia 在 SSR 阶段读不到，所以一律先按「跟随系统 + 亮色」渲染，
   真实的存储值/系统偏好在 onMounted 里再同步。
   否则服务端输出太阳图标、客户端输出月亮图标，SVG 子节点数量都不一样，
   Vue 水合失配会把失配点之后的 DOM 全部重新渲染；而 lean chunk 里正文是空的
   静态节点，重新渲染的结果就是正文整块变空白。 */
const THEME_KEY = 'theme-mode'
const readStoredMode = () => {
  const saved = localStorage.getItem(THEME_KEY)
  return saved === 'dark' || saved === 'light' || saved === 'auto' ? saved : 'auto'
}
const storedMode = ref('auto')
const systemDark = ref(false)
const resolvedDark = computed(() => (storedMode.value === 'auto' ? systemDark.value : storedMode.value === 'dark'))
const themeLabel = computed(() =>
  storedMode.value === 'auto'
    ? `跟随系统（当前${resolvedDark.value ? '暗色' : '亮色'}）· 点击切换`
    : `固定${resolvedDark.value ? '暗色' : '亮色'} · 点击切换`,
)

const applyTheme = () => {
  const next = storedMode.value === 'auto' ? (systemDark.value ? 'dark' : 'light') : storedMode.value
  document.documentElement.dataset.theme = next
  localStorage.setItem(THEME_KEY, storedMode.value)
  window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: next } }))
}

const cycleTheme = () => {
  const order = ['auto', 'dark', 'light']
  storedMode.value = order[(order.indexOf(storedMode.value) + 1) % order.length]
  applyTheme()
}

const handleSystemThemeChange = (event) => {
  systemDark.value = event.matches
  if (storedMode.value === 'auto') applyTheme()
}

const go = (link) => {
  menuOpen.value = false
  tocOpen.value = false
  widgetsOpen.value = false
  router.go(base + link)
}

const goToHeading = (id) => {
  tocOpen.value = false
  scrollTo(id)
}

const onScroll = () => {
  scrolled.value = window.scrollY > 40
}

const onDocClick = (event) => {
  if (!event.target.closest('.k-nav, .nav-widgets-drawer')) {
    menuOpen.value = false
    tocOpen.value = false
  }
}

const onKeydown = (event) => {
  if (event.key === 'Escape') {
    menuOpen.value = false
    tocOpen.value = false
    widgetsOpen.value = false
  }
}

let mediaQuery
onMounted(() => {
  // 水合完成后再对齐真实主题（首帧与 SSR 保持一致，见上面的说明）
  storedMode.value = readStoredMode()
  mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  systemDark.value = mediaQuery.matches
  applyTheme()
  mediaQuery.addEventListener('change', handleSystemThemeChange)

  window.addEventListener('scroll', onScroll, { passive: true })
  document.addEventListener('click', onDocClick)
  document.addEventListener('keydown', onKeydown)
  onScroll()
})

onBeforeUnmount(() => {
  mediaQuery?.removeEventListener('change', handleSystemThemeChange)
  window.removeEventListener('scroll', onScroll)
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <nav class="k-nav" :class="navClass">
    <div class="container nav-inner">
      <a class="navbar-brand" :href="base" :aria-label="site.title" @click.prevent="go('')">
        <span class="brand-name">{{ site.title }}</span>
      </a>

      <button class="navbar-toggler" type="button" :aria-expanded="menuOpen" aria-label="切换导航菜单"
        @click="menuOpen = !menuOpen; tocOpen = false; widgetsOpen = false">
        <span class="line"></span>
        <span class="line"></span>
        <span class="line"></span>
      </button>

      <ul class="navbar-nav" :class="{ show: menuOpen }">
        <li v-for="item in menu" :key="item.text" class="nav-item">
          <a class="nav-link" :class="{ active: isActive(item.link) }" :href="base + item.link"
            @click.prevent="go(item.link)">
            <i :class="['fa', item.icon]" aria-hidden="true"></i>
            {{ item.text }}
          </a>
        </li>
      </ul>

      <NavSearch />

      <button class="nav-theme-toggler" :class="{ 'theme-follow': storedMode === 'auto' }" type="button"
        :aria-label="themeLabel" :title="themeLabel" @click="cycleTheme">
        <KIcon :name="resolvedDark ? 'moon' : 'sun'" />
      </button>

      <button class="nav-widgets-toggler" :class="{ open: widgetsOpen }" type="button" aria-label="侧边栏"
        @click="widgetsOpen = !widgetsOpen; menuOpen = false; tocOpen = false">
        <KIcon name="sidebar" />
        <span class="widgets-text">侧栏</span>
      </button>

      <!-- 目录按钮只在真的有目录时出现（frontmatter 写 `toc: false` 的页面没有标题可列） -->
      <button v-if="isPost && headings.length" class="nav-toc-toggler" :class="{ open: tocOpen }" type="button" aria-label="文章目录"
        @click="tocOpen = !tocOpen; menuOpen = false; widgetsOpen = false">
        <KIcon name="list" />
        <span class="toc-text">目录</span>
        <span class="toc-count">{{ headings.length }}</span>
      </button>

      <transition name="k-toc">
        <div v-if="tocOpen && headings.length" class="nav-toc-panel" @click.stop>
          <div class="nav-toc-title">
            <span>文章目录</span>
            <button v-if="tocFoldable" class="toc-fold-all" type="button"
              :aria-expanded="tocAllCollapsed ? 'false' : 'true'"
              :title="tocAllCollapsed ? '展开全部目录' : '折叠全部目录'" @click="toggleTocAll">
              <KIcon :name="tocAllCollapsed ? 'chevron-down' : 'chevron-up'" />
              <span>{{ tocAllCollapsed ? '展开' : '折叠' }}</span>
            </button>
          </div>
          <nav class="nav-toc-list">
            <template v-for="group in tocGroups" :key="group.id">
              <div v-if="group.group" class="toc-group" :class="{ collapsed: isTocCollapsed(group.id) }">
                <div class="toc-group-head">
                  <button class="toc-group-toggle" type="button"
                    :aria-expanded="isTocCollapsed(group.id) ? 'false' : 'true'"
                    :aria-label="isTocCollapsed(group.id) ? '展开这一节' : '折叠这一节'"
                    @click="toggleTocGroup(group.id)">
                    <KIcon name="chevron-down" />
                  </button>
                  <a class="nav-toc-link level-1" :class="{ active: activeId === group.id }" href="javascript:;"
                    @click="goToHeading(group.id)">{{ group.text }}</a>
                </div>
                <div v-show="!isTocCollapsed(group.id)" class="toc-group-body">
                  <a v-for="heading in group.children" :key="heading.id" class="nav-toc-link"
                    :class="[`level-${heading.level}`, { active: activeId === heading.id }]" href="javascript:;"
                    @click="goToHeading(heading.id)">{{ heading.text }}</a>
                </div>
              </div>
              <a v-else class="nav-toc-link" :class="[`level-${group.level}`, { active: activeId === group.id }]"
                href="javascript:;" @click="goToHeading(group.id)">{{ group.text }}</a>
            </template>
          </nav>
        </div>
      </transition>
    </div>
  </nav>

  <transition name="k-drawer">
    <div v-if="widgetsOpen" class="drawer-overlay" @click="widgetsOpen = false"></div>
  </transition>
  <transition name="k-drawer-slide">
    <aside v-if="widgetsOpen" class="nav-widgets-drawer" @click.stop>
      <div class="drawer-header">
        <span class="drawer-title">
          <KIcon name="sidebar" />
          站点侧栏
        </span>
        <button class="drawer-close" type="button" aria-label="关闭侧栏" @click="widgetsOpen = false">
          <KIcon name="x" />
        </button>
      </div>
      <div class="drawer-body">
        <SideBar :is-post="isPost" :widgets="widgets" />
      </div>
    </aside>
  </transition>
</template>
