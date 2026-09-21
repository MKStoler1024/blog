import fs from 'node:fs'
import path from 'node:path'
import { Feed } from 'feed'
import postsData from './posts.data.mjs'
import { resolveSiteData } from 'vitepress'
const url = `https://blog.vuejs.org`

genFeed()

const removePageControls = html => html
  .replace(/<a\b[^>]*class="[^"]*\btotop\b[^"]*"[^>]*>[\s\S]*?<\/a>/gi, '')
  .replace(/<button\b[^>]*class="[^"]*\bcomments-button\b[^"]*"[^>]*>[\s\S]*?<\/button>/gi, '')
  // 主题里的页内控件（导航 / 左右侧栏 / 浮动工具箱）对订阅正文没有意义，一并去掉
  .replace(/<nav\b[^>]*class="[^"]*\bk-nav\b[^"]*"[\s\S]*?<\/nav>/gi, '')
  .replace(/<aside\b[^>]*class="[^"]*\bwidget-area\b[^"]*"[\s\S]*?<\/aside>/gi, '')
  .replace(/<footer\b[^>]*class="[^"]*\bk-footer\b[^"]*"[\s\S]*?<\/footer>/gi, '')
  .replace(/<div\b[^>]*class="[^"]*\bf-toolbox\b[^"]*"[\s\S]*?<\/div>\s*<\/div>/gi, '')

async function genFeed() {
  const siteData = await resolveSiteData('.')
  const posts = await postsData.load(true)
  const cwd = process.cwd()
  const feed = new Feed({
    title: siteData.title,
    description: siteData.description,
    id: url,
    link: url,
    language: siteData.lang,
    image: 'https://vuejs.org/images/logo.png',
    favicon: `${url}/favicon.ico`,
    copyright: siteData.themeConfig.name || '-',
  })

  posts.forEach((post) => {
    const file = path.resolve(cwd, `.vitepress/dist/${post.href}`)
    const rendered = fs.readFileSync(file, 'utf-8')
    // 站点 <main> 带 class（主题不同属性也不同），这里按「main 标签可有属性」来匹配
    const content = rendered.match(/<main\b[^>]*>([\s\S]*)<\/main>/)

    feed.addItem({
      title: post.title,
      id: `${url}${post.href}`,
      link: `${url}${post.href}`,
      description: post.excerpt,
      content: removePageControls(content ? content[1] : ''),
      author: [
        {
          name: post.data?.author || siteData.themeConfig.name || '',
          link: post.data?.twitter
            ? `https://twitter.com/${post.data.twitter}`
            : undefined
        }
      ],
      date: post.data?.date
    })
  })

  fs.writeFileSync(path.resolve(cwd, '.vitepress/dist/feed.rss'), feed.rss2())
}
