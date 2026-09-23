<script setup>
import { computed, ref, watch } from 'vue'
import { useData } from 'vitepress'
import { data as posts } from '../../posts.data.mjs'

const { page, theme, site } = useData()

// 文章数据以站点 posts.data 为准（frontmatter 里只有 title / date / tags / cover）。
// 注意两边的路径写法不同：page.relativePath 是 markdown 路径（posts/intro.md），
// posts.data 里给的是页面路径（posts/intro.html），这里要转一下再匹配，
// 否则日期、阅读时长、标签、头图全都会落空。
const post = computed(() => {
  const href = (page.value.relativePath || '').replace(/\.md$/, '.html')
  return posts.find((item) => item.href === href)
})
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

/* 头图：文章自带 cover 优先；没有 cover 的文章用站点默认图（themeConfig.cover）；
   都没有则退回纯色渐变占位，不留空框 */
const fallbackCover = computed(() => theme.value.cover || '')
const cover = ref('')
const coverFailed = ref(false)
watch([post, fallbackCover], () => {
  cover.value = post.value?.cover || fallbackCover.value || ''
  coverFailed.value = false
}, { immediate: true })
const showCover = computed(() => !!cover.value && !coverFailed.value)
</script>

<template>
  <div class="article-panel article-head" :class="{ 'has-cover': showCover }">
    <div v-if="showCover" class="article-cover" :class="{ 'is-default': !post?.cover }">
      <img :src="cover" :alt="title" loading="lazy" decoding="async" @error="coverFailed = true" />
    </div>
    <div class="article-head-body">
      <h1 class="article-title">{{ title }}</h1>
      <div class="article-meta">
        <span v-if="author" class="meta-item"><i class="fa fa-user" aria-hidden="true"></i>{{ author }}</span>
        <span v-if="date" class="meta-item"><KIcon name="calendar" />{{ date }}</span>
        <span v-if="readingInfo" class="meta-item"><KIcon name="clock" />{{ readingInfo }}</span>
        <span id="article_page_views" class="meta-item page-views" style="display: none">本文总阅读量 <span
            id="article_page_views_value"></span> 次</span>
        <a v-for="tag in tags" :key="tag" class="tag-link" :href="`${base}?q=${encodeURIComponent(tag)}`">
          <KIcon name="tag" />{{ tag }}
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 头图与标题信息共处一张卡片：图片撑满卡片上沿，圆角由卡片裁切 */
.article-cover {
  margin: -28px -32px 20px;
  height: 240px;
  overflow: hidden;
  border-bottom: 1px solid var(--kratos-border);
  background: linear-gradient(120deg, var(--kratos-bg-muted), var(--kratos-card));
}

.article-cover img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 没有自带 cover 的文章：默认图压一点亮度，避免抢正文的注意力 */
.article-cover.is-default img {
  filter: saturate(0.9) brightness(0.96);
}

@media (max-width: 991.98px) {
  .article-cover {
    margin: -24px -20px 18px;
    height: 200px;
  }
}

@media (max-width: 575.98px) {
  .article-cover {
    margin: -22px -20px 16px;
    height: 160px;
  }
}
</style>
