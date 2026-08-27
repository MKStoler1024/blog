<template>
  <aside class="sidebar">
    <section v-if="data.author" class="side-card">
      <h3 class="side-title"><i class="fa fa-user" aria-hidden="true"></i> 关于作者</h3>
      <div v-if="data.author.avatar" class="author-avatar">
        <img :src="data.author.avatar" :alt="data.author.name || '作者头像'" />
      </div>
      <p v-if="data.author.name" class="author-name">{{ data.author.name }}</p>
      <div v-if="data.author.bio" class="side-text" v-html="data.author.bio"></div>
      <div v-if="data.author.links?.length" class="author-links">
        <a v-for="link in data.author.links" :key="link.url" :href="link.url" target="_blank" rel="noreferrer">
          <i v-if="link.icon" :class="link.icon" aria-hidden="true"></i>
          {{ link.text }}
        </a>
      </div>
    </section>
    <section v-if="data.notices.length" class="side-card">
      <h3 class="side-title"><i class="fa fa-bullhorn" aria-hidden="true"></i> 公告</h3>
      <div v-for="(notice, i) in data.notices" :key="i" class="notice-item">
        <strong class="notice-title">{{ notice.title }}</strong>
        <div class="side-text" v-html="notice.content"></div>
      </div>
    </section>
  </aside>
</template>

<script setup lang="ts">
import { data } from '../side.data'
</script>

<style lang="scss">
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;

  .side-card {
    padding: 20px;
    border: 1px solid var(--color-border);
    border-radius: 10px;
    background: var(--color-surface);
    box-shadow: 0 1px 20px -6px rgba(0, 0, 0, 0.5);
  }

  .side-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 12px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--color-border);
    color: var(--color-text);
    font-size: 16px;

    .fa {
      color: var(--color-accent);
    }
  }

  .author-avatar {
    margin: 0 auto 12px;
    width: 72px;
    height: 72px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid var(--color-accent-soft);

    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .author-name {
    margin: 0 0 10px;
    color: var(--color-text);
    font-size: 15px;
    font-weight: 600;
    text-align: center;
  }

  .side-text {
    color: var(--color-gray);
    font-size: 13px;
    line-height: 1.7;
    word-break: break-word;

    p {
      margin: 0 0 8px;
    }

    p:last-child {
      margin-bottom: 0;
    }
  }

  .author-links {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;

    a {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      border: 1px solid color-mix(in srgb, var(--color-accent) 35%, transparent);
      border-radius: 4px;
      padding: 0.15rem 0.45rem;
      color: var(--color-accent-strong);
      background: var(--color-accent-soft);
      font-size: 12px;
      text-decoration: none;
      white-space: nowrap;
      transition: border-color 0.2s ease, background-color 0.2s ease;

      &:hover {
        border-color: var(--color-accent);
        background: color-mix(in srgb, var(--color-accent) 14%, transparent);
      }
    }
  }

  .notice-item + .notice-item {
    margin-top: 14px;
    padding-top: 14px;
    border-top: 1px dashed var(--color-border);
  }

  .notice-title {
    display: block;
    margin-bottom: 6px;
    color: var(--color-text);
    font-size: 14px;
  }
}

@media (max-width: 1100px) {
  .sidebar {
    margin: 24px 12px 0;
  }
}

@media (min-width: 1200px) {
  .sidebar {
    position: sticky;
    top: 80px;
    align-self: start;
    max-height: calc(100vh - 100px);
    overflow-y: auto;
  }
}
</style>
