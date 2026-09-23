<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useData, useRoute } from 'vitepress'
import { data as posts } from '../posts.data.mjs'
import ProgressBar from './components/ProgressBar.vue'
import NavBar from './components/NavBar.vue'
import Banner from './components/Banner.vue'
import PostList from './components/PostList.vue'
import ArticleHeader from './components/ArticleHeader.vue'
import SideBar from './components/SideBar.vue'
import FooterBar from './components/FooterBar.vue'
import ToolBox from './components/ToolBox.vue'
import { useKatex } from './composables/katex.js'
import { useInlineAnnotation } from './composables/inlineAnnotation.js'
import Giscus from './Giscus.vue'

const { site, theme, page } = useData()
const route = useRoute()
const base = site.value.base

/* 数学公式与行内注释都是纯逻辑（不产出 DOM），用组合式函数挂在 Layout 上。
   不要写成组件：组件渲染 null 时客户端会留下 <!---->，而 SSR 会把相邻的注释
   占位合并成一个，服务端 DOM 因此比客户端 vdom 少节点 → 水合失配 →
   失配点之后的正文（生产环境来自 lean chunk 里的空静态节点）会被整块重渲染成空白。 */
useKatex()
useInlineAnnotation()

// 侧栏小工具开关（可在 themeConfig.widgets 里关掉某一块）
const widgets = computed(() => ({
  toc: true,
  search: true,
  about: true,
  tags: true,
  posts: true,
  ...(theme.value.widgets || {}),
}))

// 标签筛选：侧栏标签云与列表共用一份状态（首页/标签页即时筛选，不跳来跳去）
const activeTag = ref('')
const selectTag = (tag) => {
  activeTag.value = tag
  // 标签页自己就有列表，直接把筛选条件写进地址栏；其余页面先回首页再筛选
  if (isTags.value) {
    history.replaceState(null, '', tag ? `${base}tags/?q=${encodeURIComponent(tag)}` : `${base}tags/`)
    return
  }
  if (!isHome.value) window.location.href = base
}

const path = computed(() => route.path.replace(base, '').replace('index.html', ''))
const isHome = computed(() => path.value === '')
const isTags = computed(() => path.value.startsWith('tags/'))
const isArticle = computed(() => posts.some((post) => post.href === path.value))
const isPlainPage = computed(() => !isHome.value && !isTags.value && !isArticle.value)
// 首页正文（index.md）：只有写了正文才渲染那张卡片，避免出现一个空面板
const homeIntro = computed(() => (page.value.raw || '').replace(/^---[\s\S]*?---/, '').trim())

// 标签页的筛选条件放在地址栏里（文章页的标签链接就指向 /tags/?q=标签）。
// 与主题同理：不能在 setup 里读 location（SSR 读不到），否则首帧与预渲染的 HTML 不一致
const readTagQuery = () => new URLSearchParams(window.location.search).get('q') || ''
onMounted(() => {
  if (isTags.value) activeTag.value = readTagQuery()
})
watch(() => route.path, () => {
  activeTag.value = isTags.value ? readTagQuery() : ''
})

</script>

<template>
  <div class="kratos-theme">
    <ProgressBar />
    <NavBar :is-post="isArticle" :banner-mode="isHome" :current-path="path" :widgets="widgets" />
    <ToolBox :is-article="isArticle" />

    <Banner v-if="isHome" />

    <main class="k-main" :class="isHome ? 'has-banner' : 'no-banner'">
      <div class="container">
        <div class="row">
          <div class="col-lg-8 board">
            <!-- 首页：index.md 的说明（可选） + 文章卡片瀑布流 -->
            <template v-if="isHome">
              <div v-if="homeIntro" class="article-panel home-intro vp-doc">
                <Content />
              </div>
              <PostList :active-tag="activeTag" />
            </template>

            <!-- 标签页：正文通常是空的（tags/index.md 只有 frontmatter），
                 这里直接给一份可筛选的文章列表，标签链接 /tags/?q=标签 也能落到对应筛选 -->
            <PostList v-else-if="isTags" :active-tag="activeTag" />

            <!-- 其它普通页：正文卡片 -->
            <article v-else-if="isPlainPage" class="article-panel article-detail">
              <div class="vp-doc">
                <Content />
              </div>
            </article>

            <!-- 文章页：标题信息卡 + 正文卡 + 评论区
                 评论不能放进 .vp-doc：正文的 Markdown 样式（链接虚线下划线、行内代码底、
                 表格描边等）会串到 iframe 里的评论区上。
                 也不再套第二张卡片：评论区直接坐在页面底色上，与 giscus 主题里的
                 --color-canvas-default（= 站点底色）保持一致，避免出现两层底色 -->
            <template v-else-if="isArticle">
              <ArticleHeader />
              <article class="article-panel article-detail">
                <div class="vp-doc">
                  <Content />
                </div>
              </article>
              <section class="article-comments">
                <Giscus :key="route.path" />
              </section>
            </template>
          </div>

          <div class="col-lg-4 sidebar sticky-sidebar">
            <SideBar :is-post="isArticle" :widgets="widgets" :active-tag="activeTag" @select-tag="selectTag" />
          </div>
        </div>
      </div>
    </main>

    <FooterBar />
  </div>
</template>
