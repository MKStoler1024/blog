<template>
  <button class="comments-button" type="button" title="跳转到评论区" aria-label="跳转到评论区" @click="goToComments">
    <i class="fa fa-comments" aria-hidden="true"></i>
    <span>评论</span>
  </button>
</template>

<script setup lang="ts">
import { useData } from 'vitepress'
import { data as posts } from '../posts.data'

const base = useData().site.value.base

const goToComments = () => {
  const comments = document.getElementById('comments')
  if (comments) {
    const top = comments.getBoundingClientRect().top + window.scrollY - 72
    window.scrollTo({ top, behavior: 'smooth' })
    return
  }

  if (posts[0]) window.location.href = `${base}${posts[0].href}#comments`
}
</script>

<style scoped>
.comments-button {
  position: fixed;
  right: 104px;
  bottom: 24px;
  z-index: 60;
  display: inline-flex;
  align-items: center;
  gap: .45rem;
  min-height: 42px;
  border: 1px solid var(--color-border);
  border-radius: 21px;
  padding: .55rem .85rem;
  color: var(--color-text);
  background: var(--color-surface);
  box-shadow: 0 3px 12px var(--color-shadow);
  font: inherit;
  cursor: pointer;
  transition: color .2s, border-color .2s, transform .2s;
}

.comments-button:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
  transform: translateY(-2px);
}

@media (max-width: 640px) {
  .comments-button {
    right: 16px;
    bottom: 16px;
    width: 44px;
    height: 44px;
    min-height: 44px;
    justify-content: center;
    border-radius: 50%;
    padding: 0;
  }

  .comments-button span {
    display: none;
  }
}
</style>
