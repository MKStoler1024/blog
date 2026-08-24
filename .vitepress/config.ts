import { defineConfigWithTheme } from 'vitepress'
import container from 'markdown-it-container'
import githubAlerts from 'markdown-it-github-alerts'
import taskLists from 'markdown-it-task-lists'
import fixKatex from './fix-katex'

const stylesheetRace = (urls: string[]) => `
  (() => {
    const urls = ${JSON.stringify(urls)}
    const links = urls.map(url => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.media = 'print'
      link.href = url
      document.head.appendChild(link)
      return link
    })
    let settled = false
    const finish = link => {
      if (settled) return
      settled = true
      link.media = 'all'
      links.filter(item => item !== link).forEach(item => item.remove())
    }
    links.forEach(link => {
      link.onload = () => finish(link)
      link.onerror = () => link.remove()
    })
  })()
`

const uplImagePreview = (state: any, silent: boolean) => {
  const source = state.src.slice(state.pos)
  const match = source.match(/^\[upl-image-preview\s+([^\]]+)\]/)
  if (!match) return false

  const attributes: Record<string, string> = {}
  const attributePattern = /(\w+)=((?:"[^"]*")|(?:'[^']*')|(?:\{[^}]*\})|(?:\S+))/g
  for (const attribute of match[1].matchAll(attributePattern)) {
    attributes[attribute[1]] = attribute[2].replace(/^("|'|\{|)(.*?)("|'|\})$/, '$2')
  }
    if (!attributes.url || !/^https?:\/\//i.test(attributes.url)) return false

  if (!silent) {
    const token = state.push('image', 'img', 0)
    token.children = []
    token.content = attributes.alt === '{TEXT?}' ? '' : attributes.alt || ''
    token.attrSet('src', attributes.url)
    token.attrSet('alt', attributes.alt === '{TEXT?}' ? '' : attributes.alt || '')
    token.attrSet('class', 'upl-image-preview')
    token.attrSet('loading', 'lazy')
    token.attrSet('decoding', 'async')
    if (attributes.uuid) token.attrSet('data-uuid', attributes.uuid)
  }
  state.pos += match[0].length
  return true
}

const rubyAnnotation = (state: any, silent: boolean) => {
  const source = state.src.slice(state.pos)
  const match = source.match(/^\[([^\]\n]+)\]\{([^{}\n]+)\}/)
  if (!match) return false

  if (!silent) {
    const annotation = state.push('annotation_open', 'span', 1)
    annotation.attrSet('class', 'markdown-annotation')
    annotation.attrSet('tabindex', '0')
    state.push('annotation_base_open', 'span', 1)
    const baseTokens: any[] = []
    state.md.inline.parse(match[1], state.md, state.env, baseTokens)
    state.tokens.push(...baseTokens)
    state.push('annotation_base_close', 'span', -1)
    state.push('annotation_text_open', 'span', 1).attrSet('class', 'annotation-tooltip')
    const annotationTokens: any[] = []
    state.md.inline.parse(match[2], state.md, state.env, annotationTokens)
    state.tokens.push(...annotationTokens)
    state.push('annotation_text_close', 'span', -1)
    state.push('annotation_close', 'span', -1)
  }
  state.pos += match[0].length
  return true
}

const bilibiliVideo = (state: any, startLine: number, endLine: number, silent: boolean) => {
  const start = state.bMarks[startLine] + state.tShift[startLine]
  const end = state.eMarks[startLine]

  // Indented lines belong to code blocks and must not be converted.
  if (state.sCount[startLine] - state.blkIndent >= 4) return false

  const line = state.src.slice(start, end).trim()
  const match = line.match(/^https?:\/\/(?:www\.)?bilibili\.com\/video\/(BV[0-9A-Za-z]+)(?:\/?(?:\?[^\s]*)?)?$/i)
  if (!match) return false
  if (silent) return true

  let page = '1'
  try {
    const requestedPage = new URL(line).searchParams.get('p')
    if (requestedPage && /^\d+$/.test(requestedPage)) page = requestedPage
  } catch {}

  const token = state.push('bilibili_video', 'div', 0)
  token.block = true
  token.map = [startLine, startLine + 1]
  token.meta = { bvid: match[1], page }
  state.line = startLine + 1
  return true
}

export interface ThemeConfig {
  name?: string,
  cover?: string,
  hello?: string,
  motto?: string,
  social?: { icon: string, url: string }[],
}
export default defineConfigWithTheme<ThemeConfig>({
  lang: 'zh-CN',
  title: 'MKStoler1024\'s Blog',
  base: '/',
  ignoreDeadLinks: ['/feed.rss'],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          silenceDeprecations: ['legacy-js-api'],
        },
      },
    },
  },
  // from https://codybontecou.com/tailwindcss-with-vitepress.html
  head: [
    ['meta', { name: 'referrer', content: 'strict-origin-when-cross-origin' }],
    ['script', { defer: true, src: 'https://vercount.one/js' }],
    ['link', { rel: 'preconnect', href: 'https://cdn.jsdelivr.net' }],
    ['link', { rel: 'preconnect', href: 'https://s4.zstatic.net' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://google.fonts.ihwx.cn' }],
    ['script', {}, stylesheetRace([
      'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.0.0/css/all.min.css',
      'https://s4.zstatic.net/npm/@fortawesome/fontawesome-free@6.0.0/css/all.min.css',
    ])],
    ['script', {}, stylesheetRace([
      'https://fonts.googleapis.com/css?family=Noto+Serif+SC',
      'https://google.fonts.ihwx.cn/css?family=Noto+Serif+SC',
    ])],
  ],
  markdown: {
    theme: 'github-light',
    lineNumbers: true,
    breaks: true,
    config: md => {
      md.block.ruler.before('paragraph', 'bilibili-video', bilibiliVideo)
      md.renderer.rules.bilibili_video = (tokens, index) => {
        const { bvid, page } = tokens[index].meta
        const playerUrl = `https://player.bilibili.com/player.html?isOutside=true&bvid=${encodeURIComponent(bvid)}&p=${encodeURIComponent(page)}&high_quality=1&danmaku=0&autoplay=0&loop=0`
        return `<div class="bilibili-video-card"><div class="bilibili-video-wrapper"><iframe src="${playerUrl}" title="哔哩哔哩视频 ${md.utils.escapeHtml(bvid)}" scrolling="no" frameborder="0" allow="fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe></div></div>\n`
      }
      md.inline.ruler.before('link', 'upl-image-preview', uplImagePreview)
      md.inline.ruler.before('link', 'ruby-annotation', rubyAnnotation)
      md.use(container, 'navbox')
      md.use(githubAlerts)
      md.use(taskLists)
      md.use(fixKatex)
    }
  },
  themeConfig: {
    name: 'MKStoler1024',
    motto: '浮霞掠影，归胜于人。',
    hello: 'MKStoler1024\'s Blog',
    cover: 'https://bing.biturl.top/?resolution=1920&format=image&index=0&mkt=zh-CN',
    social: [
      { icon: 'fa-github', url: 'https://github.com/mkstoler1024' },
      { icon: 'fas fa-envelope', url: 'mailto:sanwuchengqun@outlook.com' }
    ]
  }
})
