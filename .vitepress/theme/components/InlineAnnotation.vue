<script setup>
import { onBeforeUnmount, onMounted, watch } from 'vue'
import { useData } from 'vitepress'

/* 行内注释 [正文]{补充说明} 的悬浮提示。
   原做法是把气泡放在 .markdown-annotation 内部的绝对定位元素里，问题不少：
   inline-block 会把气泡算进行盒、长文本容易被正文容器裁掉、还会把行高撑开。
   这里改成挂在 body 上的 fixed 浮层：
   - 悬停或聚焦时显示，位置跟着锚点算，超出视口会左右收边、上方放不下就翻到下方；
   - 主题跟随 html[data-theme]，用站点调色板变量；
   - 纯 CSS 的过渡做淡入，不用额外动画库。 */

const { page } = useData()

const SHOW_DELAY = 90
const GAP = 10
const MARGIN = 12

let popup
let arrow
let current = null
let showTimer
let hideTimer
let observer

const collect = (annotation) => {
  if (annotation.dataset.annotationBound) return
  // 气泡文本就是给读屏的那份纯文本（.annotation-tooltip 已改为 display:none，
  // 但 textContent 仍在，这里只在首次进入时读一次并缓存）
  const source = annotation.querySelector('.annotation-tooltip')
  const text = source ? source.textContent.trim() : ''
  if (!text) return
  annotation.dataset.annotationText = text
  annotation.dataset.annotationBound = '1'
}

const bindAll = (root = document) => {
  root.querySelectorAll?.('.markdown-annotation').forEach(collect)
}

const theme = () => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')

const place = (anchor) => {
  if (!popup) return
  const rect = anchor.getBoundingClientRect()
  const width = popup.offsetWidth
  const height = popup.offsetHeight

  // 水平：以锚点为中心，并限制在视口内
  let x = rect.left + rect.width / 2 - width / 2
  x = Math.max(MARGIN, Math.min(x, window.innerWidth - width - MARGIN))

  // 垂直：默认在文字上方，空间不足则翻到下方
  let y = rect.top - height - GAP
  const flipped = y < MARGIN
  if (flipped) y = Math.min(rect.bottom + GAP, window.innerHeight - height - MARGIN)

  popup.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`
  // 箭头跟着锚点中心走（浮层可能被收边，不能固定居中）
  const arrowX = Math.max(10, Math.min(rect.left + rect.width / 2 - x, width - 10))
  arrow.style.left = `${Math.round(arrowX)}px`
  arrow.classList.toggle('below', flipped)
}

const show = (anchor) => {
  window.clearTimeout(hideTimer)
  window.clearTimeout(showTimer)
  showTimer = window.setTimeout(() => {
    if (!popup) return
    if (current && current !== anchor) current.dataset.annotationActive = ''
    current = anchor
    anchor.dataset.annotationActive = '1'
    popup.textContent = anchor.dataset.annotationText || ''
    popup.dataset.theme = theme()
    popup.classList.add('is-visible')
    place(anchor)
  }, SHOW_DELAY)
}

const hide = (anchor) => {
  window.clearTimeout(showTimer)
  window.clearTimeout(hideTimer)
  hideTimer = window.setTimeout(() => {
    if (anchor) anchor.dataset.annotationActive = ''
    if (current === anchor || !anchor) current = null
    popup?.classList.remove('is-visible')
  }, 80)
}

const onPointerOver = (event) => {
  const target = event.target instanceof Element ? event.target.closest('.markdown-annotation') : null
  if (target) {
    collect(target)
    show(target)
    return
  }
  if (popup?.classList.contains('is-visible')) hide(null)
}

const onFocusIn = (event) => {
  const target = event.target instanceof Element ? event.target.closest('.markdown-annotation') : null
  if (target) {
    collect(target)
    show(target)
  }
}

const onFocusOut = () => hide(current)

const onKeydown = (event) => {
  if (event.key === 'Escape' && popup?.classList.contains('is-visible')) hide(null)
}

// 滚动或缩放时避免浮层「粘」在旧位置
const onViewportChange = () => hide(null)

onMounted(() => {
  popup = document.createElement('div')
  popup.className = 'markdown-annotation-popup'
  arrow = document.createElement('span')
  arrow.className = 'markdown-annotation-arrow'
  popup.appendChild(arrow)
  document.body.appendChild(popup)

  bindAll()
  observer = new MutationObserver(() => bindAll())
  observer.observe(document.body, { childList: true, subtree: true })

  document.addEventListener('pointerover', onPointerOver, true)
  document.addEventListener('pointerdown', onPointerOver, true)
  document.addEventListener('focusin', onFocusIn, true)
  document.addEventListener('focusout', onFocusOut, true)
  document.addEventListener('keydown', onKeydown)
  window.addEventListener('scroll', onViewportChange, { passive: true })
  window.addEventListener('resize', onViewportChange)
  // 切换主题时如果气泡正显示，同步配色
  window.addEventListener('themechange', onViewportChange)
})

watch(() => page.value.relativePath, () => {
  hide(null)
  bindAll()
})

onBeforeUnmount(() => {
  observer?.disconnect()
  document.removeEventListener('pointerover', onPointerOver, true)
  document.removeEventListener('pointerdown', onPointerOver, true)
  document.removeEventListener('focusin', onFocusIn, true)
  document.removeEventListener('focusout', onFocusOut, true)
  document.removeEventListener('keydown', onKeydown)
  window.removeEventListener('scroll', onViewportChange)
  window.removeEventListener('resize', onViewportChange)
  window.removeEventListener('themechange', onViewportChange)
  window.clearTimeout(showTimer)
  window.clearTimeout(hideTimer)
  popup?.remove()
  popup = undefined
  arrow = undefined
})
</script>

<template>
  <!-- 纯逻辑组件：浮层直接挂在 body 上，不参与正文布局 -->
</template>
