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
  scrollbar-color: var(--color-accent) transparent;
  --site-default-font: "Noto Serif SC", "MicroSoft Yahei", serif;
  --global-font: "Noto Serif SC", "MicroSoft Yahei", serif;
  --color-accent: #0f9d9a;
  --color-accent-strong: #087f7c;
  --color-accent-soft: #e6fffb;
  --color-gray: #666;
  --color-text: #02111d;
  --color-background: #eee;
  --color-border: #d0d7de;
  --color-surface: #fff;
  --color-surface-muted: #f6f8fa;
  --color-header: rgba(255, 255, 255, 0.72);
  --color-code-header: #f6f8fa;
  --color-shadow: rgba(0, 0, 0, 0.16);
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
  --color-gray: #aeb9c2;
  --color-text: #e6edf3;
  --color-background: #15191d;
  --color-border: #39434d;
  --color-surface: #20262c;
  --color-surface-muted: #252d34;
  --color-header: rgba(32, 38, 44, 0.78);
  --color-code-header: #252d34;
  --color-accent: #2dd4bf;
  --color-accent-strong: #14b8a6;
  --color-accent-soft: #134e4a;
  --color-shadow: rgba(0, 0, 0, 0.42);
  color-scheme: dark;
}

.skeleton-block {
  display: block;
  border-radius: 4px;
  background: linear-gradient(100deg, var(--color-surface-muted) 35%, var(--color-accent-soft) 50%, var(--color-surface-muted) 65%);
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
  color: #99f6e4;
  background: #134e4a;
}

html[data-theme="dark"] .content th {
  background: #134e4a;
}

html[data-theme="dark"] .navbox {
  background: #203326;
  border-color: #50633a;
}

html[data-theme="dark"] .navbox:before {
  background-color: #58733a;
  color: #c3e68a;
}

html[data-theme="dark"] .navbox a {
  color: #b9e66b;
}

html[data-theme="dark"] .custom-block.tip,
html[data-theme="dark"] .custom-block.info,
html[data-theme="dark"] .markdown-alert {
  background: var(--color-surface-muted);
}

html[data-theme="dark"] .custom-block.warning,
html[data-theme="dark"] .markdown-alert-warning {
  background: #3b351d;
}

html[data-theme="dark"] .custom-block.danger,
html[data-theme="dark"] .markdown-alert-caution {
  background: #3d2527;
}

html[data-theme="dark"] .markdown-alert-note .markdown-alert-title {
  color: #79c0ff;
}

html[data-theme="dark"] .markdown-alert-tip .markdown-alert-title {
  color: #7ee787;
}

html[data-theme="dark"] .markdown-alert-important .markdown-alert-title {
  color: #d2a8ff;
}

html[data-theme="dark"] .markdown-alert-warning .markdown-alert-title {
  color: #e3b341;
}

html[data-theme="dark"] .markdown-alert-caution .markdown-alert-title {
  color: #ff7b72;
}

html[data-theme="dark"] .markdown-annotation {
  color: #93c5fd;
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
