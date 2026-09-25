<script setup>
import { computed, onMounted, ref } from 'vue'
import { useData } from 'vitepress'
import GlitchText from '../GlitchText.vue'

const { theme } = useData()
const title = computed(() => theme.value.hello || theme.value.name || '')

/* motto 支持字符串数组。注意不能在渲染期随机取：SSR 与客户端各取一次会不一致，
   造成 hydration 失配（Vue 报 "Hydration completed but contains mismatches"）。
   这里先固定用第一句，挂载后再随机换一次 */
const mottoList = computed(() => {
  const list = theme.value.motto
  if (Array.isArray(list)) return list.filter(Boolean)
  return list ? [list] : []
})
const motto = ref(mottoList.value[0] || '')
onMounted(() => {
  if (mottoList.value.length > 1) {
    motto.value = mottoList.value[Math.floor(Math.random() * mottoList.value.length)]
  }
})

/* ------------------------------------------------------------
   秋景（纯 CSS/SVG，不依赖任何图片）
   ------------------------------------------------------------
   所有"随机感"都用固定参数表写死：这些值会参与服务端渲染，
   渲染期用 Math.random() 会让两边不一致、水合失配。
   落叶的 delay 用负值，等于从下落途中的不同位置开始，
   这样「减少动态效果」暂停动画时也能看到散落半空的叶子。
   ------------------------------------------------------------ */

// 云：top / 宽高 / 透明度 / 周期 / 起始相位
const clouds = [
  { id: 1, style: { '--top': '14%', '--w': '320px', '--h': '54px', '--o': '0.5', '--dur': '150s', '--delay': '-20s' } },
  { id: 2, style: { '--top': '24%', '--w': '220px', '--h': '38px', '--o': '0.38', '--dur': '190s', '--delay': '-95s' } },
  { id: 3, style: { '--top': '9%', '--w': '380px', '--h': '60px', '--o': '0.28', '--dur': '230s', '--delay': '-150s' } },
]

// 雁阵：只放三只，慢慢横穿，别抢戏
const birds = [
  { id: 1, style: { '--top': '17%', '--w': '30px', '--dur': '110s', '--delay': '-30s', '--flap': '1.4s' } },
  { id: 2, style: { '--top': '21%', '--w': '22px', '--dur': '110s', '--delay': '-34s', '--flap': '1.7s' } },
  { id: 3, style: { '--top': '14%', '--w': '26px', '--dur': '150s', '--delay': '-100s', '--flap': '1.5s' } },
]

// 山脊：viewBox 固定 1440×240，preserveAspectRatio="none" 拉满整幅
const ridges = [
  { id: 'far', d: 'M0,132 C168,86 300,150 486,124 C672,98 792,44 986,82 C1178,120 1300,92 1440,112 L1440,240 L0,240 Z' },
  { id: 'mid', d: 'M0,168 C150,140 296,186 470,166 C652,145 782,116 962,146 C1146,176 1306,154 1440,170 L1440,240 L0,240 Z' },
  { id: 'near', d: 'M0,206 C196,190 342,218 520,208 C700,198 862,180 1040,198 C1222,216 1340,204 1440,208 L1440,240 L0,240 Z' },
]

// 树：三种树形轮流用，左侧密一点、右侧点缀几棵。
// 后面两棵用更浅的「远树」色，做出层次
const trees = [
  { id: 1, kind: 'round', style: { '--left': '4%', '--w': '150px', '--dur': '8.5s', '--delay': '-3s' } },
  { id: 2, kind: 'bare', style: { '--left': '17%', '--w': '120px', '--dur': '7s', '--delay': '-1s' } },
  { id: 3, kind: 'tall', style: { '--left': '27%', '--w': '104px', '--dur': '9.5s', '--delay': '-5s', '--c': 'var(--banner-tree-far)' } },
  { id: 4, kind: 'bare', style: { '--left': '63%', '--w': '96px', '--dur': '8s', '--delay': '-4s', '--c': 'var(--banner-tree-far)' } },
  { id: 5, kind: 'round', style: { '--left': '80%', '--w': '132px', '--dur': '10s', '--delay': '-2s' } },
  { id: 6, kind: 'tall', style: { '--left': '91%', '--w': '88px', '--dur': '7.5s', '--delay': '-6s' } },
]

// 落叶：位置 / 大小 / 横移 / 自转 / 落速 / 摇摆周期 / 颜色
const leafSpecs = [
  ['6%', 12, 54, 300, 13, 3.4, 1],
  ['13%', 15, -38, 260, 16, 4.1, 2],
  ['19%', 11, 62, 340, 11, 3.0, 3],
  ['26%', 14, -52, 280, 15, 3.8, 4],
  ['33%', 13, 40, 320, 12.5, 3.2, 1],
  ['41%', 16, -66, 240, 17, 4.4, 2],
  ['48%', 12, 48, 360, 12, 3.6, 3],
  ['55%', 14, -44, 300, 14.5, 3.9, 4],
  ['62%', 11, 58, 260, 11.5, 2.9, 1],
  ['69%', 15, -58, 330, 16.5, 4.2, 2],
  ['76%', 13, 44, 280, 13.5, 3.3, 3],
  ['83%', 14, -50, 350, 15.5, 4.0, 4],
  ['90%', 12, 56, 300, 12.8, 3.1, 1],
  ['96%', 13, -42, 270, 14.2, 3.7, 2],
]
const leaves = leafSpecs.map(([x, size, dx, rot, dur, sway, color], index) => ({
  id: index + 1,
  style: {
    '--x': x,
    '--size': `${size}px`,
    '--dx': `${dx}px`,
    '--rot': `${rot}deg`,
    '--dur': `${dur}s`,
    // 负延迟：每片叶子从下落途中的不同位置开始
    '--delay': `-${(index * 1.7).toFixed(1)}s`,
    '--sway': `${sway}s`,
    '--c': `var(--banner-leaf-${color})`,
  },
}))

</script>

<template>
  <div class="banner">
    <!-- 秋景：纯装饰，读屏忽略 -->
    <div class="scene" aria-hidden="true">
      <div class="sky"></div>
      <div class="sun"></div>

      <div class="clouds">
        <span v-for="cloud in clouds" :key="cloud.id" class="cloud" :style="cloud.style"></span>
      </div>

      <div class="birds">
        <span v-for="bird in birds" :key="bird.id" class="bird" :style="bird.style">
          <svg viewBox="0 0 32 12">
            <path d="M1 9.5C6 2.5 10 2.5 15 9.5C20 2.5 24 2.5 31 9.5" fill="none" stroke="currentColor"
              stroke-width="2.2" stroke-linecap="round" />
          </svg>
        </span>
      </div>

      <div v-for="ridge in ridges" :key="ridge.id" class="ridge" :class="`ridge-${ridge.id}`">
        <svg viewBox="0 0 1440 240" preserveAspectRatio="none">
          <path :d="ridge.d" fill="currentColor" />
        </svg>
      </div>

      <div class="trees">
        <svg v-for="tree in trees" :key="tree.id" class="tree" :style="tree.style" viewBox="0 0 100 120"
          preserveAspectRatio="xMidYMax meet">
          <!-- 阔叶树：矮壮树干 + 四团树冠 -->
          <template v-if="tree.kind === 'round'">
            <path d="M50 118V74M50 92 38 80m12 4 12-12" fill="none" stroke="currentColor" stroke-width="4.5"
              stroke-linecap="round" />
            <circle cx="50" cy="46" r="23" fill="currentColor" />
            <circle cx="29" cy="60" r="16" fill="currentColor" />
            <circle cx="71" cy="58" r="17" fill="currentColor" />
            <circle cx="50" cy="66" r="18" fill="currentColor" />
          </template>

          <!-- 高瘦树：细高树干 + 三团树冠 -->
          <template v-else-if="tree.kind === 'tall'">
            <path d="M50 118V46M50 64 37 52m13 2 13-13M50 88 39 76m11 4 12-10" fill="none" stroke="currentColor"
              stroke-width="3.6" stroke-linecap="round" />
            <ellipse cx="50" cy="34" rx="19" ry="17" fill="currentColor" />
            <ellipse cx="34" cy="52" rx="13" ry="11" fill="currentColor" />
            <ellipse cx="66" cy="50" rx="14" ry="12" fill="currentColor" />
          </template>

          <!-- 落叶后的枯枝：只剩树干与几根分枝 -->
          <template v-else>
            <path d="M50 118V56M50 74 31 51m19 25 20-28M50 97 37 84m13 7 15-9M50 64 39 45m11 15 13-17M50 88 44 74"
              fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
          </template>
        </svg>
      </div>

      <div class="mist"></div>

      <div class="leaves">
        <span v-for="leaf in leaves" :key="leaf.id" class="leaf" :style="leaf.style"><i></i></span>
      </div>
    </div>

    <div class="overlay"></div>
    <div class="content">
      <div class="introduce">
        <GlitchText v-if="title" class="title" :text="title" />
        <div v-if="motto" class="mate">{{ motto }}</div>
      </div>
    </div>
  </div>
</template>

<style>
/* Banner 里的标题沿用站点原有的故障字效果，但字号改由 .banner .introduce .title 控制 */
.banner .introduce .glitch {
  font-size: 2.6rem;
  line-height: 1.3;
  margin-bottom: 10px;
}

@media (max-width: 575.98px) {
  .banner .introduce .glitch {
    font-size: 1.9rem;
  }
}
</style>
