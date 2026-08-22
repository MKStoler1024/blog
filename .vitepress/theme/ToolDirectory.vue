<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

type Tool = { name: string, description?: string, url: string | null, archived?: boolean }
type Section = { name: string, tools: Tool[] }

const query = ref('')
const activeSection = ref('全部')
const sections = ref<Section[]>([])
const loading = ref(true)
const loadError = ref(false)

const handleMissingUrl = (tool: Tool) => {
    window.alert(`${tool.name} 暂无可用地址，请等待后续补充。`)
}

onMounted(async () => {
    try {
        const response = await fetch('/tools.json')
        if (!response.ok) throw new Error(`tools.json: ${response.status}`)
        sections.value = await response.json() as Section[]
    } catch {
        loadError.value = true
    } finally {
        loading.value = false
    }
})

const sectionNames = computed(() => ['全部', ...sections.value.map(section => section.name)])
const visibleSections = computed(() => sections.value
    .filter(section => activeSection.value === '全部' || section.name === activeSection.value)
    .map(section => ({ ...section, tools: section.tools.filter(tool => `${tool.name} ${tool.description ?? ''}`.toLowerCase().includes(query.value.trim().toLowerCase())) }))
    .filter(section => section.tools.length > 0))
const totalCount = computed(() => sections.value.reduce((total, section) => total + section.tools.length, 0))
const visibleCount = computed(() => visibleSections.value.reduce((total, section) => total + section.tools.length, 0))
</script>

<template>
    <div class="tool-directory">
        <div v-if="loading" class="empty">正在加载工具目录……</div>
        <div v-else-if="loadError" class="empty">工具目录加载失败，请检查 tools.json。</div>
        <template v-else>
            <div class="directory-toolbar">
                <label class="search-box"><span aria-hidden="true">⌕</span><input v-model="query" type="search"
                        placeholder="搜索软件名称或用途" /></label>
                <span class="result-count">{{ visibleCount }} / {{ totalCount }} 项</span>
            </div>
            <div class="category-tabs" role="tablist">
                <button v-for="name in sectionNames" :key="name" :class="{ active: activeSection === name }"
                    type="button" @click="activeSection = name">{{ name }}</button>
            </div>
            <div v-if="visibleSections.length" class="directory-sections">
                <section v-for="section in visibleSections" :key="section.name" class="directory-section">
                    <h2>{{ section.name }} <small>{{ section.tools.length }}</small></h2>
                    <div class="tool-grid">
                            <template v-for="tool in section.tools" :key="tool.name">
                                <a v-if="tool.url" class="tool-card" :class="{ archived: tool.archived }"
                                    :href="tool.url" target="_blank" rel="noreferrer">
                                    <span class="tool-mark" aria-hidden="true">{{ tool.name.slice(0, 1).toUpperCase() }}</span>
                                    <span class="tool-copy"><strong>{{ tool.name }}</strong><span>{{ tool.description || '查看原帖' }}</span></span>
                                    <span v-if="tool.archived" class="status">已归档</span><span v-else class="arrow" aria-hidden="true">↗</span>
                                </a>
                                <button v-else class="tool-card unavailable" type="button" @click="handleMissingUrl(tool)">
                                    <span class="tool-mark" aria-hidden="true">{{ tool.name.slice(0, 1).toUpperCase() }}</span>
                                    <span class="tool-copy"><strong>{{ tool.name }}</strong><span>{{ tool.description || '暂无地址' }}</span></span>
                                    <span class="status">暂无地址</span>
                                </button>
                            </template>
                    </div>
                </section>
            </div>
            <p v-else class="empty">没有找到匹配的软件。</p>
        </template>
    </div>
</template>

<style scoped>
.tool-directory {
    --ink: #253238;
    --muted: #718087;
    --accent: #c6534b;
    --line: #e6e1da;
    color: var(--ink);
    font-family: "Noto Serif SC", serif;
}

.directory-toolbar {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin: 1.5rem 0 1rem;
}

.search-box {
    display: flex;
    flex: 1;
    align-items: center;
    gap: .6rem;
    border: 1px solid var(--line);
    border-radius: 4px;
    padding: .65rem .85rem;
    background: #fffdf9;
}

.search-box span {
    color: var(--accent);
    font: 1.5rem/1 sans-serif;
}

.search-box input {
    width: 100%;
    border: 0;
    outline: 0;
    background: transparent;
    color: var(--ink);
    font: inherit;
}

.result-count {
    color: var(--muted);
    white-space: nowrap;
    font-size: .85rem;
}

.category-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: .45rem;
    margin-bottom: 2rem;
}

.category-tabs button {
    border: 1px solid var(--line);
    border-radius: 999px;
    padding: .35rem .7rem;
    background: transparent;
    color: var(--muted);
    cursor: pointer;
    font: inherit;
    font-size: .82rem;
}

.category-tabs button.active,
.category-tabs button:hover {
    border-color: var(--accent);
    background: var(--accent);
    color: white;
}

.directory-section {
    margin: 2.25rem 0;
}

.directory-section h2 {
    display: flex;
    align-items: baseline;
    gap: .55rem;
    margin-bottom: .9rem;
    border-bottom: 1px solid var(--line);
    padding-bottom: .45rem;
}

.directory-section h2 small {
    color: var(--muted);
    font: .75rem sans-serif;
}

.tool-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: .7rem;
}

.tool-card {
    position: relative;
    display: flex;
    min-height: 74px;
    align-items: center;
    gap: .7rem;
    border: 1px solid var(--line);
    border-radius: 6px;
    padding: .75rem .8rem;
    background: #fffdf9;
    color: inherit;
    text-decoration: none;
    transition: border-color .18s, transform .18s, box-shadow .18s;
}

.tool-card:hover {
    border-color: var(--accent);
    box-shadow: 0 5px 16px #45352b12;
    transform: translateY(-2px);
}

.tool-card.unavailable {
    width: 100%;
    cursor: pointer;
    text-align: left;
    font: inherit;
}

.tool-mark {
    display: grid;
    flex: 0 0 34px;
    place-items: center;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: #f2d9c9;
    color: #a64740;
    font: 700 .9rem sans-serif;
}

.tool-copy {
    display: flex;
    min-width: 0;
    flex: 1;
    flex-direction: column;
    gap: .2rem;
}

.tool-copy strong {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: .94rem;
}

.tool-copy span {
    overflow: hidden;
    color: var(--muted);
    font-size: .78rem;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.arrow {
    color: var(--accent);
    font: 1.1rem sans-serif;
}

.status {
    border: 1px solid #d9c8c2;
    border-radius: 3px;
    padding: .15rem .3rem;
    color: #9b8178;
    font-size: .68rem;
    white-space: nowrap;
}

.tool-card.archived {
    opacity: .66;
}

.empty {
    padding: 3rem;
    text-align: center;
    color: var(--muted);
}

@media (max-width: 640px) {
    .directory-toolbar {
        align-items: stretch;
        flex-direction: column;
        gap: .55rem;
    }

    .result-count {
        text-align: right;
    }

    .tool-grid {
        grid-template-columns: 1fr;
    }
}
</style>
