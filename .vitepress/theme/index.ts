import Layout from './Layout.vue'
import NotFound from './NotFound.vue'
import ToolDirectory from './ToolDirectory.vue'
import { type EnhanceAppContext } from 'vitepress'

export default {
  Layout,
  enhanceApp({ app }: EnhanceAppContext) {
    app.component('ToolDirectory', ToolDirectory)
  },
  NotFound,
}
