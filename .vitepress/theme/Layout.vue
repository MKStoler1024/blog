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
  /* 夏日集市配色（参考 public/活动预告_夏活2026_02.jpg）
     底色与大面积色块一律走中性黑白灰，橙/黄/青蓝只出现在链接、边框、图标等小面积处 */
  --color-accent: #d9702a;
  --color-accent-strong: #a94b12;
  --color-accent-soft: #fdeee3;
  --color-featured: #e8b21b;
  --color-featured-strong: #b98600;
  --color-featured-soft: #fff8dd;
  --color-featured-ink: #3d2c00;
  --color-sky: #1f86ad;
  --color-sky-strong: #12658a;
  --color-sky-soft: #e8f4f9;
  --color-sky-ink: #07314a;
  --color-gray: #6b7280;
  --color-text: #1f2328;
  --color-background: #ffffff;
  --color-border: #e4e4e7;
  --color-surface: #ffffff;
  --color-surface-muted: #f4f4f5;
  --color-header: rgba(255, 255, 255, 0.76);
  --color-code-header: #f4f4f5;
  --color-shadow: rgba(0, 0, 0, 0.1);
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
  --color-gray: #9ca3af;
  --color-text: #e8e8ea;
  --color-background: #0f1113;
  --color-border: #34383c;
  --color-surface: #16181a;
  --color-surface-muted: #1f2224;
  --color-header: rgba(18, 20, 22, 0.8);
  --color-code-header: #1f2224;
  /* 夜色版：底同样保持中性黑灰，橙 / 青蓝 / 柠檬只用于小面积强调 */
  --color-accent: #f2953f;
  --color-accent-strong: #ffb877;
  --color-accent-soft: #3a2415;
  --color-featured: #f5cf5a;
  --color-featured-strong: #f8dd8f;
  --color-featured-soft: rgba(245, 207, 90, 0.16);
  --color-featured-ink: #3a2c00;
  --color-sky: #6fd7f2;
  --color-sky-strong: #a5e8fa;
  --color-sky-soft: #14262d;
  --color-sky-ink: #04222e;
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
  background: var(--color-accent);
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
  background-color: rgba(245, 207, 90, 0.16);
  color: #f5cf5a;
}

html[data-theme="dark"] .navbox a {
  color: #f5cf5a;
}

html[data-theme="dark"] .custom-block.tip,
html[data-theme="dark"] .custom-block.info,
html[data-theme="dark"] .markdown-alert {
  background: var(--color-surface-muted);
}

html[data-theme="dark"] .custom-block.warning,
html[data-theme="dark"] .markdown-alert-warning {
  background: var(--color-surface-muted);
  border-color: #f5b04a;
}

html[data-theme="dark"] .custom-block.danger,
html[data-theme="dark"] .markdown-alert-caution {
  background: var(--color-surface-muted);
  border-color: #ff9a7a;
}

html[data-theme="dark"] .custom-block.warning .custom-block-title {
  color: #f5b04a;
}

html[data-theme="dark"] .custom-block.danger {
  color: var(--color-text);
}

html[data-theme="dark"] .custom-block.danger .custom-block-title {
  color: #ff9a7a;
}

html[data-theme="dark"] .markdown-alert-note .markdown-alert-title {
  color: #8fd8f5;
}

html[data-theme="dark"] .markdown-alert-tip .markdown-alert-title {
  color: #7fd8d8;
}

html[data-theme="dark"] .markdown-alert-important .markdown-alert-title {
  color: #f5cf5a;
}

html[data-theme="dark"] .markdown-alert-warning .markdown-alert-title {
  color: #f5b04a;
}

html[data-theme="dark"] .markdown-alert-caution .markdown-alert-title {
  color: #ff9a7a;
}

html[data-theme="dark"] .markdown-annotation {
  color: #8fd8f5;
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
