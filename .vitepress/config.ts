import { defineConfigWithTheme } from 'vitepress'
import fixKatex from './fix-katex'
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
      md.use(fixKatex)
    }
  },
  themeConfig: {
    name: 'MKStoler1024',
    motto: '掠过浮霞光影，最后能赢下生活的，还是我们。',
    hello: '您好，主管。',
    cover: 'https://bing.biturl.top/?resolution=1920&format=image&index=0&mkt=zh-CN',
    social: [
      { icon: 'fa-github', url: 'https://github.com/mkstoler1024' },
    ]
  }
})
