import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const cwd = process.cwd()
const sideFile = path.join(cwd, 'public', 'sidebar.json')

export default {
  watch: path.relative(__dirname, sideFile).replace(/\\/g, '/'),
  load() {
    if (!fs.existsSync(sideFile)) {
      return { author: null, notices: [] }
    }
    return JSON.parse(fs.readFileSync(sideFile, 'utf-8'))
  },
}
