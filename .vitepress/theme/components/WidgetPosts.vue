<script setup>
import { computed } from 'vue'
import { useData } from 'vitepress'
import { data as posts } from '../../posts.data.mjs'

const base = useData().site.value.base
const latest = computed(() => posts.slice(0, 8))
const formatDate = (value) => new Date(value).toLocaleDateString('sv-SE')
</script>

<template>
  <div class="widget widget-posts">
    <div class="title">最新文章</div>
    <ul class="post-list">
      <li v-for="post in latest" :key="post.href" class="post-item">
        <a class="post-link" :href="base + post.href">
          <span class="post-title">{{ post.title }}</span>
          <span class="post-date">
            <KIcon name="clock" />{{ formatDate(post.create) }}
          </span>
        </a>
      </li>
    </ul>
  </div>
</template>
