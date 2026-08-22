import Layout from './Layout.vue'
import ToolDirectory from './ToolDirectory.vue'
import { type EnhanceAppContext } from 'vitepress'

export default {
  Layout,
  enhanceApp({ app }: EnhanceAppContext) {
    app.component('ToolDirectory', ToolDirectory)
  },
  NotFound: () => 'custom 404', // <- this is a Vue 3 functional component
}
