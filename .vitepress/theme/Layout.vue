<template>
  <Header />
  <aside />
  <main>
    <ToTop />
    <CommentsButton v-if="isArticle" />
    <template v-if="path === ''">
      <Banner />
      <BlogList :posts="posts" />
    </template>
    <Tag v-else-if="path === 'tags/'" />
    <Article v-else />
  </main>
</template>

<script setup lang="ts">
import Header from './Header.vue'
import Banner from './Banner.vue'
import Article from './Article.vue'
import BlogList from './BlogList.vue'
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
  --color-accent: #fe9600;
  --color-gray: #666;
  --color-text: #02111d;
  --color-background: #eee;
  --color-border: #d0d7de;
  --color-surface: #fff;
  --color-surface-muted: #f6f8fa;
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
  --color-code-header: #252d34;
  --color-accent: #ffb347;
  --color-shadow: rgba(0, 0, 0, 0.42);
  color-scheme: dark;
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
  color: #f1c27d;
  background: #3a3021;
}

html[data-theme="dark"] .content th {
  background: #3a3021;
}

html[data-theme="dark"] .navbox {
  background: #263322;
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
  color: #f0b35a;
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

html[data-theme="dark"] header {
  background: rgba(21, 25, 29, 0.94);
}

html[data-theme="dark"] .search-panel,
html[data-theme="dark"] .font-panel,
html[data-theme="dark"] .font-panel select,
html[data-theme="dark"] .search-panel input,
html[data-theme="dark"] .menu {
  color: var(--color-text);
  background: var(--color-surface);
}

html[data-theme="dark"] .bloglist .card {
  background: var(--color-surface);
}

html[data-theme="dark"] .bloglist .title {
  color: var(--color-text);
}

html[data-theme="dark"] .tool-directory {
  --ink: #e6edf3;
  --muted: #aeb9c2;
  --line: #39434d;
}

html[data-theme="dark"] .tool-directory .search-box,
html[data-theme="dark"] .tool-directory .tool-card {
  background: var(--color-surface);
}

html[data-theme="dark"] .tool-directory .tool-mark {
  background: #4b382a;
  color: #f1c27d;
}

html[data-theme="dark"] .not-found {
  color: var(--color-text);
}
</style>
