import { defineConfigWithTheme } from 'vitepress'
import container from 'markdown-it-container'
import githubAlerts from 'markdown-it-github-alerts'
import fixKatex from './fix-katex'

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
    if (attributes.uuid) token.attrSet('data-uuid', attributes.uuid)
  }
  state.pos += match[0].length
  return true
}

export interface ThemeConfig {
  name?: string,
  cover?: string,
  hello?: string,
  motto?: string,
  social?: { icon: string, url: string }[],
  waline?: string,
}
export default defineConfigWithTheme<ThemeConfig>({
  lang: 'zh-CN',
  title: 'MKStoler1024\'s Blog',
  base: '/',
  // from https://codybontecou.com/tailwindcss-with-vitepress.html
  head: [
    // 字体支持
    ['link', { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.0.0/css/regular.min.css' }],
    ['link', { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.0.0/css/all.min.css' }],
    ['link', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Noto+Serif+SC' }],
    // waline
    ['script', { src: 'https://cdn.jsdelivr.net/npm/@waline/client@1.5.4/dist/Waline.min.js' }],
    // katex
    ['script', { src: 'https://cdn.jsdelivr.net/npm/katex@0.15.2/dist/katex.min.js' }],
    ['script', { src: 'https://cdn.jsdelivr.net/npm/katex@0.15.2/dist/contrib/auto-render.min.js' }],
    ['link', { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/katex@0.15.2/dist/katex.min.css' }],
  ],
  markdown: {
    theme: 'github-light',
    lineNumbers: true,
    config: md => {
      md.inline.ruler.before('link', 'upl-image-preview', uplImagePreview)
      md.use(container, 'navbox')
      md.use(githubAlerts)
      md.use(fixKatex)
    }
  },
  themeConfig: {
    name: 'MKStoler1024',
    motto: '掠过浮霞光影，最后能赢下生活的，还是我们。',
    hello: 'MKStoler1024\'s Blog',
    cover: 'https://bing.biturl.top/?resolution=1920&format=image&index=0&mkt=zh-CN',
    social: [
      { icon: 'fa-github', url: 'https://github.com/mkstoler1024' },
      { icon: 'fas fa-envelope', url: 'mailto:qsgz2023ji5ban@edicdn.eu.org' }
    ]
  }
})
