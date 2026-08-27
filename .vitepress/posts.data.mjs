// from https://github.com/vuejs/blog
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { fileURLToPath } from 'url';
import { createMarkdownRenderer } from 'vitepress'


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cwd = process.cwd()

export default {
  watch: path.relative(__dirname, cwd + '/posts/*.md').replace(/\\/g, '/'),
  async load(asFeed = false) {
    const md = await createMarkdownRenderer(cwd)
    const postDir = path.join(cwd, 'posts')
    checkTags()
    return fs
      .readdirSync(postDir)
      .filter((file) => file.endsWith('.md'))
      .map((file) => getPost(md, file, postDir, asFeed))
      .sort((a, b) => b.create - a.create)
  }
}

const cache = new Map()

function getPost(md, file, postDir, asFeed = false) {
  const fullePath = path.join(postDir, file)
  const timestamp = Math.floor(fs.statSync(fullePath).mtimeMs)

  const cached = cache.get(fullePath)
  if (cached && timestamp === cached.timestamp) {
    return cached.post
  }

  const src = fs.readFileSync(fullePath, 'utf-8')
  const { data, excerpt, content } = matter(src, { excerpt: true })

  // Front matter `readingTime: false` opts a post out of the reading-time feature.
  const readingStats = data.readingTime === false ? null : computeReadingStats(content)

  const post = {
    title: data.title,
    href: `posts/${file.replace(/\.md$/, '.html')}`,
    create: +new Date(data.date) || timestamp,
    update: timestamp,
    tags: data.tags,
    cover: data.cover,
    excerpt: md.render(excerpt),
    words: readingStats?.words,
    readingTime: readingStats?.minutes
  }
  if (asFeed) {
    // only attach these when building the RSS feed to avoid bloating the
    // client bundle size
    post.data = data
  }

  cache.set(fullePath, {
    timestamp,
    post
  })
  return post
}

function checkTags() {
  const dir = path.join(cwd, 'tags')
  if (!fs.existsSync(dir)) {
    console.log('Creating page: /tags')
    fs.mkdirSync(dir)
    fs.writeFileSync('tags/index.md', '---\ntitle: 标签\n---\n')
  }
}

// Reading-time estimation based on body word count.
// CJK characters are counted per character, other scripts per word.
const READING_SPEED = {
  cjkCharsPerMinute: 300,
  wordsPerMinute: 200,
}

function stripMarkdown(src) {
  return src
    .replace(/<!--[\s\S]*?-->/g, ' ')      // HTML comments
    .replace(/```[\s\S]*?```/g, ' ')       // fenced code blocks
    .replace(/`[^`\n]*`/g, ' ')            // inline code
    .replace(/\$\$[\s\S]*?\$\$/g, ' ')     // block math
    .replace(/\$[^$\n]+\$/g, ' ')          // inline math
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links -> keep label text
    .replace(/^#{1,6}\s+/gm, '')           // ATX headings
    .replace(/^\s{0,3}>\s?/gm, '')         // blockquotes
    .replace(/^\s*[-+*]\s+/gm, '')         // unordered list markers
    .replace(/^\s*\d+[.)]\s+/gm, '')       // ordered list markers
    .replace(/^---+$/gm, '')               // horizontal rules / setext h2
    .replace(/^===+$/gm, '')               // setext h1
    .replace(/<[^>]+>/g, ' ')              // HTML tags
    .replace(/[*_~^|]/g, ' ')              // emphasis, strike-through, table pipes
    .replace(/https?:\/\/[^\s)]+/g, ' ')   // bare URLs
}

function countWords(text) {
  let cjkChars = 0
  let words = 0
  const isCJK = (ch) => /[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\u3040-\u30FF\uAC00-\uD7AF]/.test(ch)
  const isWordChar = (ch) => /[A-Za-z0-9]/.test(ch)
  let i = 0
  while (i < text.length) {
    const ch = text[i]
    if (isCJK(ch)) {
      cjkChars++
      i++
    } else if (isWordChar(ch)) {
      while (i < text.length && isWordChar(text[i])) i++
      words++
    } else {
      i++
    }
  }
  return { cjkChars, words }
}

function computeReadingStats(markdown) {
  const { cjkChars, words } = countWords(stripMarkdown(markdown))
  return {
    words: cjkChars + words,
    minutes: Math.max(1, Math.ceil(cjkChars / READING_SPEED.cjkCharsPerMinute + words / READING_SPEED.wordsPerMinute)),
  }
}
