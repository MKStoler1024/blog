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
        <div v-if="loading" class="directory-skeleton" aria-label="正在加载工具目录" role="status">
            <div class="skeleton-toolbar">
                <span class="skeleton-search skeleton-block"></span>
                <span class="skeleton-count skeleton-block"></span>
            </div>
            <div class="skeleton-tabs">
                <span v-for="width in [42, 56, 68, 50]" :key="width" class="skeleton-block" :style="{ width: `${width}px` }"></span>
            </div>
            <section v-for="section in 2" :key="section" class="skeleton-section">
                <span class="skeleton-heading skeleton-block"></span>
                <div class="skeleton-grid">
                    <div v-for="card in 4" :key="card" class="skeleton-card">
                        <span class="skeleton-name skeleton-block"></span>
                        <span class="skeleton-description skeleton-block"></span>
                    </div>
                </div>
            </section>
        </div>
        <div v-else-if="loadError" class="empty">工具目录加载失败，请检查 tools.json。</div>
        <template v-else>
            <div class="directory-toolbar">
                <label class="search-box"><i class="fa fa-search" aria-hidden="true"></i><input v-model="query" type="search"
                        placeholder="搜索软件名称或用途" aria-label="搜索工具" /></label>
                <span class="result-count">{{ visibleCount }} / {{ totalCount }} 项</span>
            </div>
            <div class="category-tabs" role="tablist" aria-label="工具分类">
                <button v-for="name in sectionNames" :key="name" :class="{ active: activeSection === name }"
                    type="button" role="tab" :aria-selected="activeSection === name"
                    @click="activeSection = name">{{ name }}</button>
            </div>
            <div v-if="visibleSections.length" class="directory-sections">
                <section v-for="section in visibleSections" :key="section.name" class="directory-section">
                    <h2>{{ section.name }} <small>{{ section.tools.length }}</small></h2>
                    <div class="tool-grid">
                            <template v-for="tool in section.tools" :key="tool.name">
                                <a v-if="tool.url" class="tool-card" :class="{ archived: tool.archived }"
                                    :href="tool.url" target="_blank" rel="noreferrer">
                                    <span class="tool-copy"><strong>{{ tool.name }}</strong><span>{{ tool.description || '查看原帖' }}</span></span>
                                    <span v-if="tool.archived" class="status">已归档</span><span v-else class="arrow" aria-hidden="true">↗</span>
                                </a>
                                <button v-else class="tool-card unavailable" type="button" @click="handleMissingUrl(tool)">
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
    color: var(--color-text);
    font-family: var(--global-font);
    margin: 1.5rem 0 2rem;
}

.directory-toolbar {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
}

.search-box {
    display: flex;
    flex: 1;
    align-items: center;
    gap: .6rem;
    min-height: 44px;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    padding: .65rem .9rem;
    background: var(--color-surface);
    transition: border-color .2s ease, box-shadow .2s ease;
}

.search-box:focus-within {
    border-color: var(--color-accent);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-accent) 14%, transparent);
}

.search-box i {
    color: var(--color-accent);
    font-size: .95rem;
}

.search-box input {
    width: 100%;
    border: 0;
    outline: 0;
    background: transparent;
    color: var(--color-text);
    font: inherit;
}

.search-box input::placeholder {
    color: var(--color-gray);
    opacity: .8;
}

.result-count {
    flex: 0 0 auto;
    color: var(--color-gray);
    white-space: nowrap;
    font-size: .85rem;
}

.category-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: .4rem;
    margin-bottom: 1.75rem;
}

.category-tabs button {
    border: 1px solid transparent;
    border-radius: 5px;
    padding: .4rem .7rem;
    background: transparent;
    color: var(--color-gray);
    cursor: pointer;
    font: inherit;
    font-size: .82rem;
    transition: color .2s ease, border-color .2s ease, background-color .2s ease;
}

.category-tabs button:hover {
    color: var(--color-accent-strong);
    background: var(--color-surface-muted);
}

.category-tabs button.active {
    border-color: var(--color-accent);
    color: var(--color-accent-strong);
    background: var(--color-accent-soft);
}

.category-tabs button:focus-visible,
.tool-card:focus-visible {
    outline: 3px solid color-mix(in srgb, var(--color-accent) 28%, transparent);
    outline-offset: 2px;
}

.directory-section {
    margin: 1.75rem 0 2rem;
}

.directory-section:last-child {
    margin-bottom: .25rem;
}

.directory-section h2 {
    display: flex;
    align-items: center;
    gap: .55rem;
    margin-top: 0;
    margin-bottom: .9rem;
    border-bottom: 1px solid var(--color-border);
    padding-bottom: .5rem;
    color: var(--color-text);
    font-size: 1.2rem;
}

.directory-section h2 small {
    color: var(--color-gray);
    font: .75rem sans-serif;
    font-weight: normal;
}

.tool-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: .65rem;
}

.tool-card {
    display: flex;
    min-height: 72px;
    align-items: center;
    gap: .7rem;
    border: 1px solid var(--color-border);
    border-radius: 7px;
    padding: .8rem;
    background: var(--color-surface);
    color: inherit;
    text-decoration: none;
    transition: border-color .2s ease, background-color .2s ease;
}

.tool-card:hover {
    border-color: var(--color-accent);
    background: var(--color-surface-muted);
}

.tool-card.unavailable {
    width: 100%;
    cursor: pointer;
    text-align: left;
    font: inherit;
    color: var(--color-text);
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
    color: var(--color-text);
    font-size: .96rem;
}

.tool-copy span {
    overflow: hidden;
    color: var(--color-gray);
    font-size: .78rem;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.arrow {
    color: var(--color-accent);
    font: 1.1rem sans-serif;
}

.status {
    border-radius: 4px;
    padding: .15rem .35rem;
    color: var(--color-gray);
    background: var(--color-surface-muted);
    font-size: .68rem;
    white-space: nowrap;
}

.tool-card.archived {
    background: var(--color-surface-muted);
    opacity: .8;
}

.tool-card.archived:hover {
    opacity: 1;
}

.empty {
    padding: 2rem 1rem;
    text-align: center;
    color: var(--color-gray);
    border: 1px dashed var(--color-border);
    border-radius: 6px;
}

.directory-skeleton {
    display: grid;
    gap: 1rem;
}

.skeleton-toolbar {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.skeleton-search,
.skeleton-count,
.skeleton-tabs span,
.skeleton-heading,
.skeleton-card span {
    display: block;
}

.skeleton-search {
    height: 44px;
    flex: 1;
    border: 1px solid var(--color-border);
    border-radius: 6px;
}

.skeleton-count {
    width: 68px;
    height: .85rem;
    flex: 0 0 auto;
    border-radius: 4px;
}

.skeleton-tabs {
    display: flex;
    gap: .4rem;
    padding-bottom: .75rem;
    border-bottom: 1px solid var(--color-border);
}

.skeleton-tabs span {
    height: 30px;
    border-radius: 5px;
}

.skeleton-section {
    display: grid;
    gap: .9rem;
    margin-top: .75rem;
}

.skeleton-heading {
    width: 28%;
    height: 1.2rem;
    border-radius: 4px;
}

.skeleton-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: .65rem;
}

.skeleton-card {
    display: grid;
    gap: .6rem;
    min-height: 72px;
    align-content: center;
    border: 1px solid var(--color-border);
    border-radius: 7px;
    padding: .8rem;
    background: var(--color-surface);
}

.skeleton-card span {
    height: .8rem;
    border-radius: 3px;
}

.skeleton-card .skeleton-name {
    width: 62%;
    height: .95rem;
}

.skeleton-card .skeleton-description {
    width: 86%;
}

@media (max-width: 640px) {
    .directory-toolbar {
        align-items: stretch;
        flex-direction: column;
        gap: .55rem;
    }

    .result-count {
        align-self: flex-end;
    }

    .category-tabs {
        flex-wrap: nowrap;
        padding-bottom: 6px;
        overflow-x: auto;
        scrollbar-width: thin;
    }

    .category-tabs button {
        flex: 0 0 auto;
        min-height: 40px;
    }

    .tool-grid {
        grid-template-columns: 1fr;
    }

    .skeleton-toolbar {
        align-items: stretch;
        flex-direction: column;
        gap: .55rem;
    }

    .skeleton-count {
        align-self: flex-end;
    }

    .skeleton-grid {
        grid-template-columns: 1fr;
    }

    .directory-section {
        margin: 1.5rem 0;
    }

    .tool-copy strong,
    .tool-copy span {
        white-space: normal;
    }

    .status {
        flex: 0 0 auto;
    }
}
</style>
