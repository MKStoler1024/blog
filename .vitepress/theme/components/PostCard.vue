<script setup>
import { computed } from 'vue'
import { useData } from 'vitepress'

// 卡片字段全部来自站点 posts.data（title / href / create / tags / cover / excerpt / readingTime）
const props = defineProps({
  post: { type: Object, required: true },
  index: { type: Number, default: 0 },
})

const base = useData().site.value.base

const hasCover = computed(() => !!props.post.cover)
const title = computed(() => props.post.title || '无标题')
const tags = computed(() => props.post.tags || [])
const date = computed(() => new Date(props.post.create).toLocaleDateString('sv-SE'))
// 摘要：posts.data 已渲染成 HTML，这里剥掉标签取纯文本
const summary = computed(() => props.post.excerpt
  .replace(/<[^>]+>/g, ' ')
  .replace(/&[a-z]+;/gi, ' ')
  .replace(/\s+/g, ' ')
  .trim())

// 封面宽高比轮换，让瀑布流卡片高度错落
const aspectRatios = ['ratio-16-9', 'ratio-3-2', 'ratio-1-1', 'ratio-4-3', 'ratio-2-1']
const aspectClass = computed(() => aspectRatios[props.index % aspectRatios.length])
</script>

<template>
  <div class="article-panel masonry-card">
    <div v-if="hasCover" class="a-thumb" :class="aspectClass">
      <a :href="base + post.href" tabindex="-1" aria-hidden="true">
        <img :src="post.cover" :alt="title" loading="lazy" />
      </a>
      <span v-if="tags[0]" class="label">
        {{ tags[0] }}<i class="label-arrow"></i>
      </span>
    </div>
    <div class="a-post">
      <h3 class="title">
        <a :href="base + post.href">{{ title }}</a>
      </h3>
      <div class="content">
        <p>{{ summary || '这篇文章还没有摘要，点击阅读全文了解更多内容。' }}</p>
      </div>
    </div>
    <div class="a-meta">
      <span class="meta-left">
        <span v-if="date" class="meta-item"><KIcon name="calendar" />{{ date }}</span>
        <span v-if="post.readingTime" class="meta-item"><KIcon name="clock" />{{ post.words }} 字 · 约 {{ post.readingTime }} 分钟</span>
      </span>
      <span class="meta-right">
        <a class="read-more" :href="base + post.href">阅读全文<KIcon name="arrow-right" /></a>
      </span>
    </div>
  </div>
</template>
