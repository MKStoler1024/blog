<template>
  <div class="tag">
    <div class="tag-search-panel">
      <label for="tag-search">搜索文章</label>
      <div class="search-input">
        <i class="fa fa-search" aria-hidden="true"></i>
        <input id="tag-search" v-model="query" type="search" placeholder="搜索标题、摘要或标签" />
        <button v-if="query || active" type="button" aria-label="清除筛选" @click="clearFilters">
          <i class="fa fa-times" aria-hidden="true"></i>
        </button>
      </div>
    </div>

    <div class="tag-list" aria-label="文章标签">
      <button :class="['item', { active: !active }]" type="button" @click="setTag(null)">全部</button>
      <button
        v-for="tag in tags"
        :key="tag.name"
        :class="['item', { active: active === tag.name }]"
        type="button"
        @click="setTag(tag.name)"
      >
        {{ tag.name }} <span>{{ tag.count }}</span>
      </button>
    </div>

    <BlogList :posts="filteredPosts" />
    <p v-if="!filteredPosts.length" class="empty">没有找到相关文章</p>
  </div>
</template>

<script setup lang="ts">
import BlogList from './BlogList.vue'
import { data as posts, type PostData } from '../posts.data'
import { computed, onMounted, ref } from 'vue'
const active = ref<string | null>(null)
const query = ref('')
const tagData: Record<string, PostData[]> = {}
const tags = computed(() => Object.entries(tagData)
  .map(([name, taggedPosts]) => ({ name, count: taggedPosts.length }))
  .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh-CN')))

const filteredPosts = computed(() => {
  const keyword = query.value.trim().toLowerCase()
  const taggedPosts = active.value ? tagData[active.value] || [] : posts
  if (!keyword) return taggedPosts
  return taggedPosts.filter(post => {
    const excerpt = post.excerpt.replace(/<[^>]*>/g, ' ')
    return [post.title, ...(post.tags || []), excerpt].join(' ').toLowerCase().includes(keyword)
  })
})

const syncQuery = () => {
  const params = new URLSearchParams()
  if (query.value) params.set('q', query.value)
  if (active.value) params.set('tag', active.value)
  const suffix = params.toString()
  history.replaceState(null, document.title, suffix ? `?${suffix}` : location.pathname)
}

const setTag = (tag: string | null) => {
  active.value = tag
  syncQuery()
}

const clearFilters = () => {
  query.value = ''
  active.value = null
  syncQuery()
}

for (const post of posts) {
  if (!post.tags) continue
  for (const tag of post.tags) {
    if (!tagData[tag]) tagData[tag] = []
    tagData[tag].push(post)
  }
}
onMounted(() => {
  const params = new URLSearchParams(location.search)
  const urlTag = params.get('tag')
  const legacyQuery = params.get('q') || ''
  active.value = urlTag && tagData[urlTag] ? urlTag : null
  query.value = urlTag ? legacyQuery : tagData[legacyQuery] ? '' : legacyQuery
})
</script>

<style lang="scss">
.tag {
  margin-top: 64px;
  padding: 32px 12px;

  .tag-search-panel {
    max-width: 800px;
    margin: 0 auto 20px;
  }

  label {
    display: block;
    margin-bottom: 8px;
    color: var(--color-gray);
    font-size: 14px;
  }

  .search-input {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border: 1px solid var(--color-border);
    border-radius: 8px;
    background: var(--color-surface);

    &:focus-within {
      border-color: var(--color-accent);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 14%, transparent);
    }
  }

  input {
    min-width: 0;
    flex: 1;
    border: 0;
    outline: 0;
    color: var(--color-text);
    background: transparent;
    font: inherit;
  }

  .search-input button {
    border: 0;
    color: var(--color-gray);
    background: transparent;
    cursor: pointer;
  }

  .tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    max-width: 800px;
    margin: 0 auto;
  }

  .item {
    padding: 6px 12px;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    color: var(--color-gray);
    background: var(--color-surface);
    font: inherit;
    cursor: pointer;
    transition: all 0.2s ease-out;

    &:hover,
    &.active {
      color: var(--color-accent);
      border-color: var(--color-accent);
    }

    span {
      opacity: 0.65;
      font-size: 0.85em;
    }
  }

  .empty {
    max-width: 800px;
    margin: 48px auto;
    color: var(--color-gray);
    text-align: center;
  }
}
</style>
