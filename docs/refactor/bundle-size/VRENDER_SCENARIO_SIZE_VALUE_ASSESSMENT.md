# VRender 场景包体积收益评估

> 文档类型：scenario value gate / 后续优化决策依据
> 生成日期：2026-06-03
> 当前状态：用于决定后续 optional 拆分是否值得继续，不代表已完成上层迁移

## 结论

后续不能只按“还能拆一个 register / subpath”继续推进。VRender 层可以提供按需加载能力，但收益必须在图表 / 表格常规场景中闭环：

- VRender 提供稳定 public entry、installer 或 register。
- VChart / VTable 有明确迁移方式。
- 用户有可选择是否加载 optional 能力的配置或入口。
- 用同一 stats / gzip 口径验证 before / after。

当前数据下，优先级应从“继续细拆小 parser”转向以下几类：

1. `@visactor/vrender-components` 的 root-only optional 组件与 family 子入口宽度。
2. `@visactor/vrender-kits` 的多环境 / window / canvas / picker 装配边界。
3. `@visactor/vrender-animate` 的常规动画与效果型 custom 动画分层，但必须先绑定 VChart / VTable 使用方式。
4. 3D / richtext / image / builtin-symbol 只在 stats 证明常规场景静态带入且收益足够时继续。
5. `path-svg` 单体收益偏小且被 morph / MotionPath / streamLight / CustomPath2D 共享，当前继续暂缓。

## 口径

本文件混用三类数据，不能直接相加：

| 口径 | 含义 | 本轮用途 |
| --- | --- | --- |
| VRender source gzip | 对 `src` 文件逐文件 gzip 后求和 | 判断 VRender 自身模块 owner |
| VChart analyzer gzip | VChart stats 中模块 gzip 估计 | 判断图表场景实际带入链路 |
| final min gzip | VChart 产物 `.min.js.gz` | 判断用户下载成本上限 |

VChart stats 使用本地已有产物，只读解析，未在本轮重新构建。VTable 常规场景主要仍落在文本、基础图形、svg/path 和透视图内嵌 VChart 用法上，因此本专项先把 VChart line / pie / simple / full 作为图表和表格的主要代理场景。VTable stats 不作为下一轮 P0 前置 blocker；只有任务专门触碰 VTable-only 链路时才需要补表格 stats。

## 当前 VRender source ledger

命令：`node <<'NODE' ... zlib.gzipSync per source file ... NODE`

| package | files | raw bytes | gzip bytes |
| --- | ---: | ---: | ---: |
| `packages/vrender-core/src` | 392 | 1,723,156 | 495,105 |
| `packages/vrender-components/src` | 240 | 1,015,830 | 284,741 |
| `packages/vrender-kits/src` | 197 | 453,271 | 141,711 |
| `packages/vrender-animate/src` | 73 | 489,724 | 127,784 |
| `packages/vrender/src/entries` | 13 | 32,322 | 8,741 |

Top source modules：

| module | files | raw bytes | gzip bytes |
| --- | ---: | ---: | ---: |
| `packages/vrender-core/src/graphic` | 74 | 472,103 | 134,640 |
| `packages/vrender-animate/src/custom` | 49 | 349,974 | 89,839 |
| `packages/vrender-core/src/render` | 66 | 328,603 | 87,070 |
| `packages/vrender-core/src/common` | 54 | 247,955 | 77,787 |
| `packages/vrender-core/src/interface` | 62 | 177,911 | 56,713 |
| `packages/vrender-components/src/axis` | 33 | 178,234 | 54,413 |
| `packages/vrender-components/src/label` | 19 | 141,296 | 40,331 |
| `packages/vrender-core/src/core` | 24 | 140,647 | 38,084 |
| `packages/vrender-kits/src/picker` | 74 | 70,415 | 29,648 |
| `packages/vrender-core/src/plugins` | 15 | 113,213 | 28,576 |
| `packages/vrender-kits/src/canvas` | 36 | 84,382 | 25,853 |
| `packages/vrender-components/src/marker` | 19 | 99,038 | 25,068 |
| `packages/vrender-kits/src/env` | 20 | 78,769 | 24,743 |
| `packages/vrender-components/src/legend` | 15 | 83,855 | 22,452 |
| `packages/vrender-core/src/event` | 13 | 72,255 | 21,192 |

## VChart 场景样本

数据源：

- `/Users/bytedance/Documents/GitHub/VChart/packages/vchart/build/stats-*.html`
- `/Users/bytedance/Documents/GitHub/VChart/packages/vchart/build/index-*.min.js.gz`

| scenario | final min gzip | core analyzer gzip | components | kits | animate | `@visactor/vutils` |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| empty | 234,952 | 236,829 | 944 | 38,752 | 24,692 | 32,589 |
| line | 366,123 | 237,096 | 73,784 | 38,752 | 36,855 | 42,125 |
| pie | 322,864 | 236,882 | 49,315 | 38,752 | 28,916 | 40,995 |
| simple | 388,141 | 237,096 | 81,575 | 38,752 | 42,256 | 42,839 |
| full | 646,668 | 237,499 | 149,228 | 69,250 | 74,760 | 85,846 |

Line 常规场景中 VRender top modules：

| module | files | raw/rendered | analyzer gzip |
| --- | ---: | ---: | ---: |
| `vrender-core/graphic` | 69 | 319,761 | 76,321 |
| `vrender-core/render` | 62 | 216,712 | 54,234 |
| `vrender-core/common` | 48 | 151,022 | 40,434 |
| `vrender-components/axis` | 18 | 97,478 | 24,662 |
| `vrender-core/core` | 20 | 91,629 | 20,921 |
| `vrender-animate/custom` | 17 | 78,832 | 18,583 |
| `vrender-kits/picker` | 70 | 37,320 | 17,326 |
| `vrender-components/label` | 12 | 65,849 | 16,250 |
| `vrender-components/legend` | 4 | 50,336 | 10,232 |
| `vrender-core/plugins` | 11 | 42,190 | 10,104 |
| `vrender-core/event` | 10 | 43,251 | 9,388 |
| `vrender-core/canvas` | 5 | 33,495 | 8,045 |

Full 相比 line 多出的主要 VRender analyzer gzip：

| module | full - line analyzer gzip | 判断 |
| --- | ---: | --- |
| `vrender-animate/custom` | +37,905 | 效果型 custom 是真实 optional 大块 |
| `vrender-components/marker` | +15,334 | 常规 line 不需要，适合按需 |
| `vrender-kits/env` | +11,928 | 多环境带入值得优先复核 |
| `vrender-kits/window` | +10,775 | 多端 window 贡献明显 |
| `vrender-components/data-zoom` | +9,817 | 常规 line 不一定需要，适合按需 |
| `vrender-components/player` | +7,951 | 低频组件 |
| `vrender-components/label` | +7,785 | family 入口可能过宽，需精查 |
| `vrender-components/axis` | +6,960 | family 入口可能过宽，需精查 |
| `vrender-components/slider` | +5,638 | 低频组件 |
| `vrender-components/poptip` | +5,329 | 图表 tooltip 与表格 poptip 需分场景 |
| `vrender-kits/canvas` | +5,144 | 多端 canvas 装配需复核 |
| `vrender-components/brush` | +3,331 | 低频交互组件 |

## VTable 代理口径

VTable 本轮未发现可直接解析的 build stats / gzip 产物，但不作为当前 P0 blocker。当前 owner 判断采用 VChart 作为 VTable 代理，原因是：

- VTable 常规表格渲染大量依赖 text / rect / line / image / path/svg 等 VRender 基础图形链路。
- VTable 透视图内部包含 VChart 用法，VChart 体积优化会直接覆盖这部分场景。
- 现有 VChart line / pie / simple / full stats 已能覆盖 core graphic、render、common、components、kits、animate 的主要 owner。

只读源码证据仍保留，用于判断 table-only 任务是否需要专门补 stats：

- `packages/vtable/src/vrender.ts` 会 `loadPoptip()`，并 re-export `@visactor/vrender-core`、`@visactor/vrender-kits`、`@visactor/vrender-components`、`@visactor/vrender-animate`。
- `packages/vtable/src/vrender-app.ts` 静态导入 browser / node / wx / lynx / harmony / taro / feishu / tt 等 env loader 与 app installer。
- React VTable 自定义组件直接使用 tag / checkbox / radio 等 VRender component wrapper。

这说明如果后续领取的是 table-only slice，高价值方向不是 chart-only 的 axis / legend，而是：

- browser-only 或 env-selected 表格入口，避免多端 env / window / canvas 静态闭包。
- 表格专用 VRender component profile：poptip / tag / checkbox / radio / scrollbar / table-series-number 等保留，axis / legend / marker / dataZoom / player 等图表组件不进入常规表格 profile。
- VTable public re-export 的 full 兼容入口保留，但新增更窄 runtime / renderer 接入方式。

但这不是当前主线。下一轮继续优先看 VChart 场景收益；VTable stats 只在 VChart 代理无法覆盖的 table-only 能力上补充。

## 后续任务价值预估

估算区间是 analyzer gzip 级别，不等同 final bundle gzip。通常 final gzip 收益会小于 analyzer gzip 的模块差值，需要 before / after 产物确认。

| 候选方向 | 图表常规场景预估 | 表格常规场景预估 | 依据 | 当前决策 |
| --- | ---: | ---: | --- | --- |
| Components root-only optional subpath | 20-55KB | 以 VChart proxy 判断；table-only 待专门 stats | full-line components 差值 75KB；marker/dataZoom/player/slider/brush 等常规 line 不需要 | 值得继续，但先做 stats-backed 子入口，不改 default |
| Components axis / label / legend 窄 family entry | 5-18KB | 低或不适用 | line 已需 axis/label/legend，但 full 多出 axis+label+legend 约 18KB | 值得研究，不能影响常规图表能力 |
| Kits env / window / canvas profile | 10-30KB | 以 VChart proxy 判断；env-only 待专门 stats | full-line kits 差值 30KB；VTable 静态导入多端 env 是补充线索 | 值得继续，优先 browser/env-selected app installer |
| Animate custom effect profile | 8-25KB | 以 VChart proxy 判断 | full-line custom 差值 38KB；line 仍带 morphing/streamLight/tag-points 等 18.6KB | 仅在 VChart 可按动画效果选择加载时继续 |
| 3D optional profile | 4-10KB | 4-10KB | line 已带 3D-like 约 9KB | 中等价值，需确认 2D profile 不破坏 full/default |
| Richtext plain-text profile | 5-12KB | 场景相关 | line core richtext 约 12KB；tooltip/label/title 可能依赖 | 谨慎，需视觉回归和用户可选配置 |
| Image/resource optional | 3-10KB | 低到中等 | 图表 line image 链路不是最大块；表格 icon/image 常见 | 暂缓，除非 VChart stats 证明收益 |
| Builtin symbol 子集 | 2-6KB | 2-6KB | line builtin-symbol 约 9KB，但 symbolType 兼容风险高 | 只做研究，非 P0 编码 |
| XML parser 低频化 | 已完成约 5.6KB 基础闭包避免 | 已完成约 5.6KB 基础闭包避免 | XML parser 已从 graphic/tools 静态闭包移出 | 不继续扩展到 path/svg |
| `path-svg` / path parser 拆分 | 0-3KB 单点；20KB 基础链路不可直接视为可删 | 场景相关 | `path-svg` 直接 1.7KB；path/morph 链路被 CustomPath2D / morph / streamLight 共用 | 暂缓 |
| vutils import 收口 | 未知，可能 10KB+ | 未知 | line vutils 42KB、full 86KB，但不是 VRender 单包可直接 owner | 先做 version/import stats，不做未公开 deep import |

## 继续编码的 gate

后续每个 optional 拆分任务领取前，必须补齐：

1. 目标场景：优先 line / pie / simple / full；table-browser / table-node 只用于 table-only 链路。
2. 当前 stats：至少一个 VChart 场景的 analyzer gzip，最好同时有 final min gzip。
3. VRender owner：对应 package / module / files 的 source 或 build gzip。
4. 预估收益：写清是 analyzer gzip、source gzip 还是 final gzip。
5. 上层接入：VChart / VTable 如何使用新 entry/register/installer。
6. 用户选择：用户如何选择是否加载 optional 能力。
7. root/default：确认 full/default 行为不变。

建议阈值：

- 常规图表 / 表格场景预估 analyzer gzip 小于 5KB：默认不进入 P0 编码。
- 5-15KB：只有风险低、迁移清晰、测试容易时继续。
- 15KB 以上：优先评审并推进，但仍需保留 full/default。
- 只影响 full/default、无法给常规场景提供按需入口：默认不是 P0。

## 下一步建议

1. 先用 VChart line / pie / simple / full 作为主代理，选择一个高价值、低风险 slice：components root-only optional subpath 或 kits env-selected installer。
2. VTable stats 不作为主线 blocker；只有领取 table-only 能力时再补。
3. 暂停继续细拆 `path-svg`、builtin-symbol、单个小 register，除非 VChart stats 证明场景收益超过 gate。
4. 每次新增窄 register / installer 时，同步更新 `VRENDER_ON_DEMAND_CAPABILITY_USAGE.md`，否则收益无法落到上层和用户选择。
