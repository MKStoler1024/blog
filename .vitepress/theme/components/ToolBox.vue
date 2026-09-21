<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useData, useRouter } from 'vitepress'
import { data as posts } from '../../posts.data.mjs'

const base = useData().site.value.base
const router = useRouter()

const showTop = ref(false)
const searchOpen = ref(false)
const keyword = ref('')

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

const onScroll = () => {
  showTop.value = window.scrollY > 300
}

const toTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

const go = (href) => {
  keyword.value = ''
  searchOpen.value = false
  router.go(href)
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})

onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <div class="f-toolbox">
    <div v-show="showTop" class="tool gotop" title="回到顶部" role="button" tabindex="0" @click="toTop"
      @keydown.enter="toTop">
      <KIcon name="arrow-up" />
    </div>
    <div class="tool search" :class="{ open: searchOpen }" title="搜索" role="button" tabindex="0"
      @click="searchOpen = !searchOpen" @keydown.enter="searchOpen = !searchOpen">
      <KIcon name="search" />
    </div>
    <div v-if="searchOpen" class="search-panel" @mousedown.prevent>
      <div class="search-panel-input">
        <KIcon name="search" />
        <input v-model="keyword" type="search" placeholder="搜点什么呢?" aria-label="搜索文章" />
      </div>
      <ul v-if="keyword" class="search-panel-list">
        <li v-for="post in results" :key="post.href">
          <a :href="base + post.href" @click="go(post.href)">{{ post.title }}</a>
        </li>
        <li v-if="!results.length" class="no-result">没有找到相关文章</li>
      </ul>
    </div>
  </div>
</template>
