<script setup>
import { computed } from 'vue'
import { useData } from 'vitepress'
import { data as posts } from '../../posts.data.mjs'

const { page, theme, frontmatter, site } = useData()

// 文章数据以站点 posts.data 为准（frontmatter 里只有 title / date / tags / cover）
const post = computed(() => posts.find((item) => item.href === page.value.relativePath?.replace(/index\.html$/, '')))
const title = computed(() => page.value.title || post.value?.title || '文章')
const author = computed(() => theme.value.name || '')
const date = computed(() => {
  const value = post.value?.create
  return value ? new Date(value).toLocaleDateString('sv-SE') : ''
})
const tags = computed(() => post.value?.tags || [])
const readingInfo = computed(() => (post.value?.readingTime
  ? `${post.value.words} 字 · 约 ${post.value.readingTime} 分钟`
  : ''))
const base = site.value.base
</script>

<template>
  <div class="article-panel article-head">
    <h1 class="article-title">{{ title }}</h1>
    <div class="article-meta">
      <span v-if="author" class="meta-item"><i class="fa fa-user" aria-hidden="true"></i>{{ author }}</span>
      <span v-if="date" class="meta-item"><KIcon name="calendar" />{{ date }}</span>
      <span v-if="readingInfo" class="meta-item"><KIcon name="clock" />{{ readingInfo }}</span>
      <span id="article_page_views" class="meta-item page-views" style="display: none">本文总阅读量 <span
          id="article_page_views_value"></span> 次</span>
      <a v-for="tag in tags" :key="tag" class="tag-link" :href="`${base}tags/?q=${encodeURIComponent(tag)}`">
        <KIcon name="tag" />{{ tag }}
      </a>
    </div>
  </div>
</template>
