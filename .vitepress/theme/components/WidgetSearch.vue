<script setup>
import { computed, ref } from 'vue'
import { useData } from 'vitepress'
import { data as posts } from '../../posts.data.mjs'

const base = useData().site.value.base
const keyword = ref('')

// 站内搜索：标题 / 标签 / 摘要正文都参与匹配（摘要已由 posts.data 渲染成 HTML）
const results = computed(() => {
  const query = keyword.value.trim().toLowerCase()
  if (!query) return []
  return posts
    .filter((post) => {
      const excerpt = post.excerpt.replace(/<[^>]*>/g, ' ')
      const searchable = [post.title, ...(post.tags || []), excerpt].join(' ').toLowerCase()
      return searchable.includes(query)
    })
    .slice(0, 6)
})
</script>

<template>
  <div class="widget widget-search">
    <div class="title">搜索</div>
    <div class="search-box">
      <KIcon name="search" class="search-icon" />
      <input v-model="keyword" class="search-input" type="search" placeholder="搜索标题、标签或正文" aria-label="搜索文章" />
    </div>
    <ul v-if="keyword && results.length" class="search-results">
      <li v-for="post in results" :key="post.href">
        <a :href="base + post.href">
          <span class="result-title">{{ post.title }}</span>
          <span class="result-tag">{{ (post.tags || [])[0] || '文章' }}</span>
        </a>
      </li>
    </ul>
    <div v-else-if="keyword" class="search-empty">没有找到相关文章</div>
  </div>
</template>
