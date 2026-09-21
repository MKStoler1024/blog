<script setup>
import { computed } from 'vue'
import WidgetAbout from './WidgetAbout.vue'
import WidgetTags from './WidgetTags.vue'
import WidgetPosts from './WidgetPosts.vue'
import WidgetSearch from './WidgetSearch.vue'
import WidgetToc from './WidgetToc.vue'

// 小工具开关与筛选状态都由 Layout 统一下发，保证移动端抽屉与桌面侧栏一致
const props = defineProps({
  isPost: { type: Boolean, default: false },
  widgets: { type: Object, default: () => ({}) },
  activeTag: { type: String, default: '' },
})
const emit = defineEmits(['select-tag'])

const enabled = computed(() => ({
  toc: true,
  search: true,
  about: true,
  tags: true,
  posts: true,
  ...props.widgets,
}))
</script>

<template>
  <aside class="widget-area sidebar">
    <WidgetToc v-if="isPost && enabled.toc" />
    <WidgetSearch v-if="enabled.search" />
    <WidgetAbout v-if="enabled.about" />
    <WidgetTags v-if="enabled.tags" :active-tag="activeTag" @select="emit('select-tag', $event)" />
    <WidgetPosts v-if="enabled.posts" />
  </aside>
</template>
