<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useData } from 'vitepress'
import { data as posts } from '../../posts.data.mjs'
import PostCard from './PostCard.vue'

const base = useData().site.value.base

// activeTag 由 Layout 下发（侧栏标签云与这里共用一份筛选状态）
const props = defineProps({
  activeTag: { type: String, default: '' },
})

const perPageMobile = 6
const currentPage = ref(1)

const filtered = computed(() => {
  const list = props.activeTag
    ? posts.filter((post) => (post.tags || []).includes(props.activeTag))
    : posts
  return list
})

const headTitle = computed(() => (props.activeTag ? `标签筛选：${props.activeTag}` : '最新文章'))

watch(() => props.activeTag, () => {
  currentPage.value = 1
})

// 桌面端一次铺满瀑布流；移动端按每页 6 篇分页
const isDesktop = ref(true)
let mediaQuery = null
function updateViewport() {
  isDesktop.value = mediaQuery ? mediaQuery.matches : true
  const maxPage = Math.max(1, Math.ceil(filtered.value.length / perPageMobile))
  if (currentPage.value > maxPage) currentPage.value = maxPage
}

onMounted(() => {
  mediaQuery = window.matchMedia('(min-width: 992px)')
  mediaQuery.addEventListener('change', updateViewport)
  updateViewport()
})

onBeforeUnmount(() => {
  mediaQuery?.removeEventListener('change', updateViewport)
})

const pageCount = computed(() => (isDesktop.value ? 1 : Math.max(1, Math.ceil(filtered.value.length / perPageMobile))))
const paged = computed(() => (isDesktop.value
  ? filtered.value
  : filtered.value.slice((currentPage.value - 1) * perPageMobile, currentPage.value * perPageMobile)))

function goPage(page) {
  if (page < 1 || page > pageCount.value) return
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <div class="post-list">
    <div class="article-panel list-head">
      <div class="search-title" :class="{ 'has-tag': !!activeTag }">{{ headTitle }}</div>
    </div>

    <div class="masonry">
      <PostCard v-for="(post, index) in paged" :key="post.href" :post="post" :index="index" />
    </div>

    <div v-if="!paged.length" class="article-panel">
      <div class="nothing">
        <div class="nothing-icon"><KIcon name="search" /></div>
        <div class="sorry">很抱歉，没有找到相关文章</div>
      </div>
    </div>

    <nav v-if="!isDesktop && pageCount > 1" class="pagelist">
      <a class="prev" :class="{ disabled: currentPage === 1 }" href="javascript:;" aria-label="上一页"
        @click="goPage(currentPage - 1)"><KIcon name="chevron-left" /></a>
      <select class="page-select" :value="currentPage" aria-label="选择页码" @change="goPage(Number($event.target.value))">
        <option v-for="page in pageCount" :key="page" :value="page">第 {{ page }} / {{ pageCount }} 页</option>
      </select>
      <a class="next" :class="{ disabled: currentPage === pageCount }" href="javascript:;" aria-label="下一页"
        @click="goPage(currentPage + 1)"><KIcon name="chevron-right" /></a>
    </nav>
  </div>
</template>
