<script setup>
import { computed, ref } from 'vue'
import { useData, useRouter } from 'vitepress'
import { data as posts } from '../../posts.data.mjs'

const base = useData().site.value.base
const router = useRouter()

const keyword = ref('')
const mobileOpen = ref(false)

const results = computed(() => {
  const query = keyword.value.trim().toLowerCase()
  if (!query) return []
  return posts
    .filter((post) => {
      const excerpt = post.excerpt.replace(/<[^>]*>/g, ' ')
      return [post.title, ...(post.tags || []), excerpt].join(' ').toLowerCase().includes(query)
    })
    .slice(0, 6)
})

const go = (href) => {
  mobileOpen.value = false
  router.go(href)
}
</script>

<template>
  <!-- 桌面端：导航栏内的搜索框（结果面板锚在输入框下方） -->
  <div class="nav-search" role="search">
    <label class="nav-search-input">
      <KIcon name="search" />
      <input v-model="keyword" type="search" placeholder="搜索文章" aria-label="搜索文章" />
    </label>

    <button
      class="nav-search-toggler"
      type="button"
      :class="{ open: mobileOpen }"
      aria-label="搜索文章"
      :aria-expanded="mobileOpen"
      @click="mobileOpen = !mobileOpen"
    >
      <KIcon name="search" />
    </button>

    <transition name="k-search-drop">
      <div v-if="keyword && !mobileOpen" class="nav-search-panel">
        <a
          v-for="post in results"
          :key="post.href"
          class="search-result"
          :href="base + post.href"
          @click="go(post.href)"
        >
          <span class="result-title">{{ post.title }}</span>
          <span class="result-tag">{{ (post.tags || [])[0] || '文章' }}</span>
        </a>
        <div v-if="!results.length" class="search-empty">没有找到相关文章</div>
      </div>
    </transition>
  </div>

  <!-- 移动端：全屏搜索面板 -->
  <transition name="k-search-mobile">
    <div v-if="mobileOpen" class="nav-search-mobile-panel">
      <div class="mobile-search-input">
        <KIcon name="search" />
        <input v-model="keyword" type="search" placeholder="搜索文章" aria-label="搜索文章" />
        <button class="mobile-search-close" type="button" aria-label="关闭搜索" @click="mobileOpen = false">
          <KIcon name="x" />
        </button>
      </div>
      <div v-if="keyword" class="mobile-search-results">
        <a
          v-for="post in results"
          :key="post.href"
          class="search-result"
          :href="base + post.href"
          @click="go(post.href)"
        >
          <span class="result-title">{{ post.title }}</span>
          <span class="result-tag">{{ (post.tags || [])[0] || '文章' }}</span>
        </a>
        <div v-if="!results.length" class="search-empty">没有找到相关文章</div>
      </div>
    </div>
  </transition>
</template>
