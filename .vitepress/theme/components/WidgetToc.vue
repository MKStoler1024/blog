<script setup>
import { useToc } from '../composables/toc.js'

const {
  headings,
  groups,
  foldable,
  allCollapsed,
  isCollapsed,
  toggleGroup,
  toggleAll,
  activeId,
  scrollTo,
} = useToc()
</script>

<template>
  <div v-if="headings.length" class="widget widget-toc">
    <div class="title">
      <span>文章目录</span>
      <!-- 文章里有一个以上一级标题时目录按节分组，这里给一个整卷开关 -->
      <button
        v-if="foldable"
        class="toc-fold-all"
        type="button"
        :aria-expanded="allCollapsed ? 'false' : 'true'"
        :title="allCollapsed ? '展开全部目录' : '折叠全部目录'"
        @click="toggleAll"
      >
        <KIcon :name="allCollapsed ? 'chevron-down' : 'chevron-up'" />
        <span>{{ allCollapsed ? '展开' : '折叠' }}</span>
      </button>
    </div>
    <nav class="toc-list">
      <template v-for="group in groups" :key="group.id">
        <!-- 一级标题：可折叠的一节 -->
        <div v-if="group.group" class="toc-group" :class="{ collapsed: isCollapsed(group.id) }">
          <div class="toc-group-head">
            <button
              class="toc-group-toggle"
              type="button"
              :aria-expanded="isCollapsed(group.id) ? 'false' : 'true'"
              :aria-label="isCollapsed(group.id) ? '展开这一节' : '折叠这一节'"
              @click="toggleGroup(group.id)"
            >
              <KIcon name="chevron-down" />
            </button>
            <a
              class="toc-link level-1"
              :class="{ active: activeId === group.id }"
              href="javascript:;"
              @click="scrollTo(group.id)"
            >{{ group.text }}</a>
          </div>
          <div v-show="!isCollapsed(group.id)" class="toc-group-body">
            <a
              v-for="heading in group.children"
              :key="heading.id"
              class="toc-link"
              :class="[`level-${heading.level}`, { active: activeId === heading.id }]"
              href="javascript:;"
              @click="scrollTo(heading.id)"
            >{{ heading.text }}</a>
          </div>
        </div>

        <!-- 第一个一级标题之前的二级/三级标题：平铺一行 -->
        <a
          v-else
          class="toc-link"
          :class="[`level-${group.level}`, { active: activeId === group.id }]"
          href="javascript:;"
          @click="scrollTo(group.id)"
        >{{ group.text }}</a>
      </template>
    </nav>
  </div>
</template>
