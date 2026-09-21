<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useData, useRouter } from 'vitepress'
import { data as posts } from '../../posts.data.mjs'

const { site } = useData()
const base = site.value.base
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

// 文章页在工具箱里多给一个「跳到评论」入口（原来那个固定在右下角的按钮）
const props = defineProps({
  isArticle: { type: Boolean, default: false },
})

const COMMENT_OFFSET = 76
const commentsVisible = ref(false)

const updateCommentsEntry = () => {
  if (!props.isArticle) {
    commentsVisible.value = false
    return
  }
  const comments = document.getElementById('comments')
  if (!comments) {
    commentsVisible.value = false
    return
  }
  // 评论区已经滚进视口就不再显示这个入口
  const top = comments.getBoundingClientRect().top
  commentsVisible.value = top > window.innerHeight * 0.5 || top < -80
}

const toComments = () => {
  const comments = document.getElementById('comments')
  if (!comments) return
  // 用 auto 而不是 smooth：平滑滚动要等动画结束才到位，读者点一下就该立刻看到评论区
  window.scrollTo({ top: comments.getBoundingClientRect().top + window.scrollY - COMMENT_OFFSET, behavior: 'auto' })
  updateCommentsEntry()
}

const onScroll = () => {
  showTop.value = window.scrollY > 300
  updateCommentsEntry()
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

// 换页后评论区元素是新的（评论卡片在文章页才渲染），重新判断一次入口是否该显示
watch(() => router.route.path, () => {
  window.setTimeout(updateCommentsEntry, 0)
})
</script>

<template>
  <div class="f-toolbox">
    <div
      v-if="props.isArticle && commentsVisible"
      class="tool comment"
      title="跳转到评论区"
      role="button"
      tabindex="0"
      @click="toComments"
      @keydown.enter="toComments"
    >
      <KIcon name="comments" />
    </div>
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
