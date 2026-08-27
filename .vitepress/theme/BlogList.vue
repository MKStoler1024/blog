<template>
  <div class="bloglist">
    <div class="section">
      <i class="fa-solid fa-book"></i> 文章列表
      <hr />
    </div>
    <div class="card" v-for="p in posts" :key="p.href">
      <div v-if="p.cover" class="image" :style="`background-image: url(&quot;${p.cover}&quot;)`"></div>
      <div class="info">
        <div class="date">
          <i class="fa fa-clock"></i>
          发布于 {{ new Date(p.create).toLocaleDateString('sv-SE') }}
          <template v-if="p.readingTime">
            · <i class="fa fa-hourglass-half"></i> {{ p.words }} 字 · 约 {{ p.readingTime }} 分钟
          </template>
        </div>
        <a :href="base + p.href">
          <div class="title">{{ p.title }}</div>
        </a>
        <!-- <div class="view">
          <i class="fa fa-eye"></i>
          {{ 114514 }} 阅读
        </div>-->
        <div class="content" v-html="p.excerpt"></div>
        <div v-if="click" class="tags">
          <a v-for="t in p.tags" href="#" @click="click(t)">
            <i class="fa fa-tag"></i>
            {{ t }}
          </a>
        </div>
        <div v-else class="tags">
          <a v-for="t in p.tags" :href="`${base}tags/?q=${t}`">
            <i class="fa fa-tag"></i>
            {{ t }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type PostData } from '../posts.data'
import { useData } from 'vitepress'
const base = useData().site.value.base
const { posts, click = null } = defineProps<{
  posts: PostData[]
  click?: (tag: string) => void
}>()
</script>

<style lang="scss">
.bloglist {
  max-width: 800px;
  margin: auto;

  .section {
    padding-top: 24px;
  }

  .date,
  .view,
  .tags {
    font-size: 14px;
  }

  .fa {
    font-size: 16px;
  }

  .card {
    color: var(--color-gray);
    margin: 20px 0;
    padding: 24px;
    border-radius: 10px;
    box-shadow: 0 1px 20px -6px rgba(0, 0, 0, 0.5);
    transition: box-shadow 0.3s ease;
    break-inside: avoid;

    &:hover {
      box-shadow: 0 5px 10px 5px rgb(0, 0, 0, 0.2);
    }
  }

  .image {
    height: 170px;
    margin: -24px -24px 16px;
    border-radius: 10px 10px 0 0;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }

  .title {
    color: var(--color-text);
    font-size: 24px;
    margin: 20px 0;
    transition: color 0.2s ease-out;

    &:hover {
      color: var(--color-accent);
    }
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;

    a {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      border: 1px solid color-mix(in srgb, var(--color-accent) 35%, transparent);
      border-radius: 4px;
      padding: 0.15rem 0.45rem;
      color: var(--color-accent-strong);
      background: var(--color-accent-soft);
      font-size: 12px;
      text-decoration: none;
      white-space: nowrap;
      transition: border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease;

      &:hover {
        border-color: var(--color-accent);
        background: color-mix(in srgb, var(--color-accent) 14%, transparent);
      }
    }
  }
}

@media (min-width: 1200px) {
  .bloglist {
    max-width: 1200px;
    columns: 2;
    column-gap: 24px;

    .section {
      column-span: all;
    }

    .card {
      margin: 0 0 24px;
    }
  }
}

@media (min-width: 1600px) {
  .bloglist {
    max-width: 1560px;
    columns: 3;
  }
}

@media (max-width: 1100px) {
  .bloglist {
    .section {
      margin: 0 12px 12px;
    }

    .card {
      margin: 0 12px 12px;
      padding: 16px;
      border-radius: 10px;
      box-shadow: 0 1px 20px -6px rgba(0, 0, 0, 0.5);
      background: var(--color-surface);

      &:hover {
        box-shadow: 0 5px 10px 5px rgb(0, 0, 0, 0.2);
      }
    }

    .image {
      height: 140px;
      margin: -16px -16px 14px;
    }

    .title {
      font-size: 20px;
      margin: 14px 0;
    }
  }
}
</style>
