<template>
  <div class="abanner" :style="cover" v-if="index >= 0">
    <div class="titlebox">
      <h1 class="title">{{ title }}</h1>
      <div class="info">{{ author }} · 更新于 {{ date }} · {{ view }} 次阅读</div>
    </div>
  </div>
  <div :class="['article', { 'without-banner': index < 0 }]">
    <Content class="content" />
    <div class="content nav">
      <span>
        <a :href="nav[0].href" v-if="nav[0].show">
          <i class="fa fa-angle-left"></i>
          {{ nav[0].text }}
        </a>
      </span>
      <span>
        <a :href="nav[1].href" v-if="nav[1].show">
          {{ nav[1].text }}
          <i class="fa fa-angle-right"></i>
        </a>
      </span>
    </div>
    <Waline v-if="index != -1" ref="waline" />
    <TOC :data="data.page.value.headers" :active="active" />
  </div>
</template>

<script lang="ts">
declare const renderMathInElement: any;
declare const katex: any;
</script>

<script setup lang="ts">
import { useData, useRoute } from 'vitepress'
import { onMounted, onUnmounted, ref, reactive, watch, nextTick } from 'vue'
import { data as posts } from '../posts.data'
import { throttleAndDebounce } from './utils'
import Waline from './Waline.vue'
import TOC from './TOC.vue'

const data = useData()
const base = data.site.value.base
const route = useRoute()
const title = ref('')
const author = data.theme.value.name
const date = ref('')
const view = ref(0)
const cover = ref('')
const active = ref(0)
const waline = ref<InstanceType<typeof Waline>>()
const nav = reactive([
  { href: '', text: '', show: true },
  { href: '', text: '', show: true },
])

const index = ref(0)
const update = () => {
  index.value = posts.findIndex(p => p.href == route.path.replace(base, ''))
  if (index.value == -1) return
  title.value = data.page.value.title
  cover.value = `background-image: url(${data.page.value.frontmatter.cover || data.theme.value.cover})`
  date.value = new Date(data.page.value.lastUpdated || posts[index.value].create).toLocaleDateString('sv-SE')
  waline.value?.update()
  let ival = index.value
  if (ival - 1 >= 0) {
    nav[0].href = base + posts[ival - 1].href
    nav[0].text = posts[ival - 1].title
    nav[0].show = true
  } else {
    nav[0].show = false
  }
  if (ival + 1 < posts.length) {
    nav[1].href = base + posts[ival + 1].href
    nav[1].text = posts[ival + 1].title
    nav[1].show = true
  } else {
    nav[1].show = false
  }
  // web only, not support in SSR
  if (typeof window !== 'undefined') {
    nextTick().then(() => {
      updateKatex()
    })
  }
}
update()
watch(route, update)

const setActiveLink = () => {
  const headers = data.page.value.headers
  if (headers.length == 0) return
  for (let i = 0; i < headers.length; i++) {
    const el = document.getElementById(headers[i].slug)
    const rect = el?.getBoundingClientRect()!
    if (rect.top > 200) {
      let hash = ' '
      if (i > 0) {
        active.value = i - 1
        hash = '#' + headers[i - 1].slug
      }
      history.replaceState(null, document.title, hash)
      return
    }
  }
  active.value = headers.length - 1
  history.replaceState(null, document.title, '#' + headers[headers.length - 1].slug)
}
const onScroll = throttleAndDebounce(setActiveLink, 300)
const updateKatex = () => {
  if (typeof renderMathInElement === 'undefined') return
  const el = document.querySelector('.article .content')
  if (!el) return
  renderMathInElement(el, {
    delimiters: [
      { left: '$$', right: '$$', display: true },
      { left: '$', right: '$', display: false },
    ],
  })
}
onMounted(() => {
  setActiveLink()
  window.addEventListener('scroll', onScroll)
  if (import.meta.env.DEV) {
    let el = document.querySelector<HTMLScriptElement>('script[src*="auto-render"]')
    if (el) el.onload = () => updateKatex()
  }
})
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})

</script>

<style lang="scss">
.abanner {
  height: 400px;
  width: 100%;
  background-size: cover;
  background-position: center center;
  margin-top: 64px;
  position: relative;

  .titlebox {
    position: absolute;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
    left: 0;
    right: 0;
    bottom: 20px;
    text-shadow: 2px 2px 10px black;
    color: white;
  }

  .title {
    font-size: 32px;
    color: white;
  }

  .info {
    font-size: 14px;
  }
}

.article {
  position: relative;
  max-width: 800px;
  margin: auto;

  &.without-banner {
    padding-top: 64px;
  }

  .content {
    margin: 0.5em;
  }

  .nav {
    display: flex;
    justify-content: space-between;
  }
}

.content {
  color: var(--color-text);

  a {
    color: #e58700;
    position: relative;
    transition: color 0.2s ease-out;

    &.header-anchor {
      float: left;
      margin-top: 0.125em;
      margin-left: -0.87em;
      padding-right: 0.23em;
      font-size: 0.85em;
      opacity: 0;
    }

    &:hover {
      color: var(--color-accent);

      &:after {
        transform: scaleX(1);
        transform-origin: left;
      }
    }

    &:after {
      content: "";
      position: absolute;
      transform: scaleX(0);
      width: 100%;
      height: 2px;
      bottom: 0;
      left: 0;
      background-color: var(--color-accent);
      transition: transform 0.2s ease-out;
      transform-origin: right;
    }
  }

  @for $i from 1 through 6 {
    h#{$i}:hover .header-anchor {
      opacity: 1;
    }
  }

  h2 {
    padding-bottom: 0.3em;
    margin-bottom: 1em;
    border-bottom: 1px dashed var(--color-border);
  }

  p {
    line-height: 1.5em;
  }

  blockquote {
    margin: 1rem 0;
    padding: 0.1rem 1rem;
    border-left: 4px solid var(--color-accent);
    color: #815000;
    background: #fff8e8;
  }

  table {
    display: block;
    width: 100%;
    margin: 1rem 0;
    overflow-x: auto;
    border-collapse: collapse;
  }

  th,
  td {
    padding: 8px 12px;
    border: 1px solid var(--color-border);
    text-align: left;
  }

  th {
    background: #fff3d6;
  }

  img {
    height: auto;
    margin: 1rem auto;
  }

  li {
    margin-block-end: 0.3em;
  }
}

.katex-display {
  overflow: auto hidden;
}

@media (max-width: 800px) {
  .abanner {
    height: 200px;

    .titlebox {
      margin-left: 0.5em;
    }
  }

  .navbox {
    margin: 12px 0;
    grid-template-columns: 36px minmax(0, 1fr);

    &:before {
      min-height: 44px;
    }

    > .custom-block-title,
    > p {
      padding: 10px;
    }
  }
}

.navbox {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr);
    margin: 12px 0;
    padding: 0;
    overflow: hidden;
    background: #f9ffea;
    border: 1px solid #dceebd;
    border-left: 0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08);

    &:before {
      content: "\f35d";
      display: flex;
      align-items: center;
      justify-content: center;
      align-self: stretch;
      min-height: 48px;
      grid-row: 1 / -1;
      grid-column: 1;
      background-color: #b9e66b;
      color: #84b63c;
      font-family: "Font Awesome 6 Free";
      font-size: 18px;
      font-weight: 900;
    }

    > .custom-block-title,
    > p {
      margin: 0;
      grid-column: 2;
      padding: 12px 12px 0;
    }

    > .custom-block-title {
      padding-right: 0;
    }

    > :last-child {
      padding-bottom: 12px;
    }

    a {
      color: #4f8f3a;

      &:after {
        background-color: #84b63c;
      }

      &:hover {
        color: #84b63c;
      }
    }
  }

.custom-block {

  &.tip,
  &.info,
  &.warning,
  &.danger {
    margin: 1rem 0;
    border-left: 0.5rem solid;
    padding: 0.1rem 1.5rem;
    overflow-x: auto;
  }

  &.tip {
    background-color: #f3f5f7;
    border-color: #3eaf7c;
  }

  &.info {
    background-color: #f3f5f7;
    border-color: #476582;
  }

  &.warning {
    border-color: #e7c000;
    color: #6b5900;
    background-color: #fff7d0;

    .custom-block-title {
      color: #b29400;
    }
  }

  &.danger {
    border-color: #c00;
    color: #4d0000;
    background-color: #ffe6e6;

    .custom-block-title {
      color: #900000;
    }
  }
}

.custom-block-title {
  font-weight: bold;
}

.markdown-alert {
  margin: 1rem 0;
  padding: 0.6rem 1rem;
  border-left: 0.4rem solid;
  border-radius: 3px;
  color: var(--color-text);
  background: #f6f8fa;
}

.markdown-alert-title {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0 0 0.5rem;
  font-weight: bold;
}

.markdown-alert > p:last-child {
  margin: 0.5rem 0 0.2rem;
}

.markdown-alert-note {
  border-color: #0969da;
  background: #e5f3ff;
}

.markdown-alert-tip {
  border-color: #1a7f37;
  background: #e3f8e8;
}

.markdown-alert-important {
  border-color: #8250df;
  background: #f5edff;
}

.markdown-alert-warning {
  border-color: #9a6700;
  background: #fff3bf;
}

.markdown-alert-caution {
  border-color: #cf222e;
  background: #ffebe7;
}

.markdown-annotation {
  position: relative;
  display: inline-block;
  cursor: help;
  color: #b86600;
  font-weight: 600;
  text-decoration: underline dotted var(--color-accent);
  text-decoration-thickness: 2px;
  text-underline-offset: 3px;

  .annotation-tooltip {
    position: absolute;
    z-index: 2;
    bottom: calc(100% + 6px);
    left: 50%;
    display: none;
    width: max-content;
    max-width: min(320px, 80vw);
    padding: 6px 9px;
    transform: translateX(-50%);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    color: var(--color-text);
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
    font-size: 0.85em;
    line-height: 1.4;
    white-space: normal;
    overflow-wrap: anywhere;
    pointer-events: auto;
    text-decoration: none;
    font-weight: normal;

    a {
      overflow-wrap: anywhere;
      word-break: break-word;
    }
  }

  &:before {
    content: "";
    position: absolute;
    right: 0;
    bottom: 100%;
    left: 0;
    height: 6px;
  }

  &:hover .annotation-tooltip,
  &:focus .annotation-tooltip,
  &:focus-within .annotation-tooltip {
    display: block;
  }
}

// inline code
code {
  font-size: var(--code-font-size);
  border-radius: 4px;
  padding: 0.2em 0.4em;
  background-color: rgba(27, 31, 35, 0.05);
}

html {
  --vp-icon-copy: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' height='20' width='20' stroke='rgba(128,128,128,1)' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2'/%3E%3C/svg%3E");
  --vp-icon-copied: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' height='20' width='20' stroke='rgba(128,128,128,1)' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9 2 2 4-4'/%3E%3C/svg%3E");
}

div[class*="language-"] {
  position: relative;
  line-height: var(--code-line-height);
  font-size: var(--code-font-size);
  font-family: var(--code-font-family);
  display: flex;
  flex-direction: row-reverse;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  padding-top: 32px;
  overflow: hidden;

  button.copy {
    position: absolute;
    top: 8px;
    right: 8px;
    justify-content: center;
    align-items: center;
    width: 40px;
    height: 40px;
    background-color: white;
    background-image: var(--vp-icon-copy);
    background-repeat: no-repeat;
    background-position: 50%;
    border-radius: 4px;
    opacity: 0;
    border: 1px solid var(--color-border);
  }

  &:hover button.copy {
    opacity: 1;
  }

  .lang {
    position: absolute;
    transform: translate(-50%, -28px);
    left: 50%;
    user-select: none;
  }

  pre {
    margin: 0;
    margin-left: 16px;
    flex-grow: 1;
    overflow: scroll;
  }

  code {
    background-color: transparent;
    padding: 0;
  }

  &:before {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    height: 32px;
    background: #f6f8fa;
    border-bottom: 1px solid var(--color-border);
  }

  &:after {
    content: "";
    position: absolute;
    top: 10px;
    left: 12px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #fc625d;
    box-shadow: 20px 0 #fdbc40, 40px 0 #35cd4b;
  }
}

.line-numbers-wrapper {
  padding-left: 16px;
  color: var(--color-gray);
  user-select: none;
}
</style>
