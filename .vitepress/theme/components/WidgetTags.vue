<script setup>
import { computed } from 'vue'
import { data as posts } from '../../posts.data.mjs'

// 标签筛选是站内即时筛选（不跳标签页），状态由 index.vue 持有并下发，便于与列表联动
const props = defineProps({
  activeTag: { type: String, default: '' },
})
const emit = defineEmits(['select'])

const tags = computed(() => {
  const map = new Map()
  posts.forEach((post) => (post.tags || []).forEach((tag) => map.set(tag, (map.get(tag) || 0) + 1)))
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20)
})

const select = (tag) => emit('select', props.activeTag === tag ? '' : tag)
</script>

<template>
  <div class="widget widget-tags">
    <div class="title">标签聚合</div>
    <div class="tag-cloud">
      <a
        v-for="[tag, count] in tags"
        :key="tag"
        class="tag-item"
        :class="{ active: activeTag === tag }"
        href="javascript:;"
        @click="select(tag)"
      >{{ tag }}<span class="tag-count">({{ count }})</span></a>
    </div>
  </div>
</template>
