<template>
  <Header />
  <aside />
  <main>
    <ToTop />
    <CommentsButton v-if="isArticle" />
    <Transition name="page" mode="out-in">
      <div :key="path" class="page-wrap">
        <template v-if="path === ''">
          <Banner />
          <div class="home-layout">
            <BlogList :posts="posts" />
            <Sidebar />
          </div>
        </template>
        <Tag v-else-if="path === 'tags/'" />
        <Article v-else />
      </div>
    </Transition>
  </main>
</template>

<script setup lang="ts">
import Header from './Header.vue'
import Banner from './Banner.vue'
import Article from './Article.vue'
import BlogList from './BlogList.vue'
import Sidebar from './Sidebar.vue'
import Tag from './Tag.vue'
import ToTop from './ToTop.vue'
import CommentsButton from './CommentsButton.vue'
import { computed } from 'vue'
import { useRoute, useData } from 'vitepress'
import { data as posts } from '../posts.data'
const base = useData().site.value.base
const route = useRoute()
const path = computed(() => route.path.replace(base, '').replace('index.html', ''))
const isArticle = computed(() => posts.some(post => post.href === path.value))

</script>

<style lang="scss">
html {
  scroll-behavior: smooth;
  scrollbar-color: var(--color-gray) transparent;
  --site-default-font: "Noto Serif SC", "MicroSoft Yahei", serif;
  --global-font: "Noto Serif SC", "MicroSoft Yahei", serif;
  /* 配色：底色与大面积色块走「偏暖的中性色」（暖纸），只轻微偏离黑白、不铺彩色
     赭褐（链接/强调）、土金（精华/提示）、灰绿（Note/行内代码）只出现在链接、边框、图标、角标等小面积处 */
  --color-accent: #a8714a;
  --color-accent-strong: #7a4c2e;
  --color-accent-soft: #f3ebe4;
  --color-featured: #bf9c4e;
  --color-featured-strong: #8a6f2c;
  --color-featured-soft: #f6f0e0;
  --color-featured-ink: #33280c;
  --color-sky: #5c7f74;
  --color-sky-strong: #3f5c53;
  --color-sky-soft: #eef3f1;
  --color-sky-ink: #17251f;
  /* 中性面：暖纸（在黑白基础上偏一点赭） */
  --color-gray: #756c63;
  --color-text: #221e1a;
  --color-background: #fbf8f4;
  --color-border: #e6ded3;
  --color-surface: #fffdfa;
  --color-surface-muted: #f4efe8;
  --color-header: rgba(251, 248, 244, 0.78);
  --color-code-header: #f4efe8;
  --color-shadow: rgba(76, 58, 40, 0.12);
  --code-line-height: 24px;
  --code-font-family: monospace;
  --code-font-size: 15px;
}

html[data-font="serif"] {
  --global-font: serif;
}

html[data-font="sans-serif"] {
  --global-font: sans-serif;
}

html[data-theme="dark"] {
  /* 中性面：暖炭（夜色版同样偏一点赭） */
  --color-gray: #a49a90;
  --color-text: #eae5df;
  --color-background: #12100e;
  --color-border: #3a342d;
  --color-surface: #191614;
  --color-surface-muted: #221e1a;
  --color-header: rgba(18, 16, 14, 0.82);
  --color-code-header: #221e1a;
  /* 夜色版：底同样走偏暖的中性色，赭褐 / 灰绿 / 土金只用于小面积强调 */
  --color-accent: #c99a72;
  --color-accent-strong: #e3bd9b;
  --color-accent-soft: #2a2018;
  --color-featured: #d8bd7a;
  --color-featured-strong: #e6d29b;
  --color-featured-soft: rgba(216, 189, 122, 0.16);
  --color-featured-ink: #33290d;
  --color-sky: #93b0a5;
  --color-sky-strong: #b6cfc5;
  --color-sky-soft: #1a2422;
  --color-sky-ink: #0d1a16;
  --color-shadow: rgba(0, 0, 0, 0.45);
  color-scheme: dark;
}

.skeleton-block {
  display: block;
  border-radius: 4px;
  background: linear-gradient(100deg, var(--color-surface-muted) 35%, var(--color-border) 50%, var(--color-surface-muted) 65%);
  background-size: 300% 100%;
  animation: skeleton-shimmer 1.6s ease-in-out infinite;
}

@keyframes skeleton-shimmer {
  0% { background-position: 100% 0; }
  100% { background-position: -100% 0; }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton-block {
    animation: none;
  }
}

body {
  margin: 0;
  padding: 0;
  font-family: var(--global-font);
  font-size: 16px;
  color: var(--color-text);
  background: var(--color-background);
  overflow-x: hidden;
  transition: color 0.2s ease, background-color 0.2s ease;
}

* {
  box-sizing: border-box;
}

a {
  text-decoration: none;
}

img {
  max-width: 100%;
}

img.upl-image-preview {
  display: block;
  width: auto;
  height: auto;
  margin: 1rem auto;
}

hr {
  border: none;
  border-bottom: 1px dashed var(--color-border);
}

::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-thumb {
  border-radius: 4px;
  background: color-mix(in srgb, var(--color-gray) 55%, transparent);
}

html[data-theme="dark"] .content blockquote {
  color: var(--color-text);
  background: var(--color-surface-muted);
}

html[data-theme="dark"] .content th {
  background: var(--color-surface-muted);
}

html[data-theme="dark"] .navbox {
  background: var(--color-surface-muted);
  border-color: var(--color-border);
}

html[data-theme="dark"] .navbox:before {
  background-color: var(--color-surface-muted);
  color: var(--color-featured);
}

html[data-theme="dark"] .navbox a {
  color: var(--color-featured);
}

html[data-theme="dark"] .custom-block.tip,
html[data-theme="dark"] .custom-block.info,
html[data-theme="dark"] .markdown-alert {
  background: var(--color-surface-muted);
}

html[data-theme="dark"] .custom-block.warning,
html[data-theme="dark"] .markdown-alert-warning {
  background: var(--color-surface-muted);
  border-color: var(--color-accent);
}

html[data-theme="dark"] .custom-block.danger,
html[data-theme="dark"] .markdown-alert-caution {
  background: var(--color-surface-muted);
  border-color: #ff9a7a;
}

html[data-theme="dark"] .custom-block.warning .custom-block-title {
  color: var(--color-accent);
}

html[data-theme="dark"] .custom-block.danger {
  color: var(--color-text);
}

html[data-theme="dark"] .custom-block.danger .custom-block-title {
  color: #ff9a7a;
}

html[data-theme="dark"] .markdown-alert-note .markdown-alert-title {
  color: var(--color-sky);
}

html[data-theme="dark"] .markdown-alert-tip .markdown-alert-title {
  color: var(--color-sky-strong);
}

html[data-theme="dark"] .markdown-alert-important .markdown-alert-title {
  color: var(--color-featured);
}

html[data-theme="dark"] .markdown-alert-warning .markdown-alert-title {
  color: var(--color-accent);
}

html[data-theme="dark"] .markdown-alert-caution .markdown-alert-title {
  color: #ff9a7a;
}

html[data-theme="dark"] .markdown-annotation {
  color: var(--color-sky);
}

html[data-theme="dark"] .markdown-annotation .annotation-tooltip {
  border-color: #596773;
  color: var(--color-text);
  background: var(--color-surface);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.45);
}

html[data-theme="dark"] div[class*="language-"] {
  background: var(--color-surface);
}

html[data-theme="dark"] div[class*="language-"] pre,
html[data-theme="dark"] div[class*="language-"] code {
  color: #e6edf3 !important;
}

html[data-theme="dark"] div[class*="language-"] code span[style*="color:#D73A49"] {
  color: #ff7b72 !important;
}

html[data-theme="dark"] div[class*="language-"] code span[style*="color:#032F62"] {
  color: #a5d6ff !important;
}

html[data-theme="dark"] div[class*="language-"] code span[style*="color:#6F42C1"] {
  color: #d2a8ff !important;
}

html[data-theme="dark"] div[class*="language-"] code span[style*="color:#005CC5"] {
  color: #79c0ff !important;
}

html[data-theme="dark"] div[class*="language-"] code span[style*="color:#22863A"] {
  color: #7ee787 !important;
}

html[data-theme="dark"] div[class*="language-"] code span[style*="color:#E36209"] {
  color: #ffa657 !important;
}

html[data-theme="dark"] div[class*="language-"] code span[style*="color:#24292E"] {
  color: #c9d1d9 !important;
}

html[data-theme="dark"] div[class*="language-"]:before {
  background: var(--color-code-header);
}

/* header 背景已在 Header.vue 中通过 --color-header + backdrop-filter 实现毛玻璃 */

html[data-theme="dark"] .search-panel,
html[data-theme="dark"] .font-panel,
html[data-theme="dark"] .font-panel select,
html[data-theme="dark"] .search-panel input {
  color: var(--color-text);
  background: var(--color-surface);
}

html[data-theme="dark"] .bloglist .card {
  background: var(--color-surface);
}

html[data-theme="dark"] .bloglist .title {
  color: var(--color-text);
}

html[data-theme="dark"] .not-found {
  color: var(--color-text);
}

.home-layout {
  max-width: 800px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 24px;
  padding-bottom: 48px;

  .bloglist {
    min-width: 0;
    max-width: none;
  }

  .sidebar {
    order: -1;
  }
}

@media (min-width: 1200px) {
  .home-layout {
    max-width: 1280px;
    grid-template-columns: minmax(0, 1fr) 300px;
    align-items: start;

    .sidebar {
      order: 0;
      margin-top: 24px;
    }
  }
}

@media (min-width: 1600px) {
  .home-layout {
    max-width: 1560px;
  }
}

.page-enter-active,
.page-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(14px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-14px);
}

@media (prefers-reduced-motion: reduce) {
  .page-enter-active,
  .page-leave-active {
    transition: none;
  }
}
</style>
