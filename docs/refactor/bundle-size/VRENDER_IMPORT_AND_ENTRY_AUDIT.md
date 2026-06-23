# VRender Import / Entry / Export 审计

> 文档类型：entry / exports / barrel / sideEffects 风险台账
> 当前状态：只读源码事实 + 后续验证建议

## 总览

VRender 当前已经有 app-scoped entries 和 lite shared browser 入口，但 root barrel 仍然很宽。后续优化要区分：

- full/default 入口：不能为了体积改变默认行为。
- lite/optional 入口：可以扩展为窄入口或推荐上层使用。
- root barrel 风险：即使 `sideEffects: false`，CJS 或不充分 tree-shaking 仍可能把大模块图带进来。

## Package Exports 与 Side Effects

| 包 | `sideEffects` | 当前 exports 摘要 | 体积风险 |
| --- | --- | --- | --- |
| `@visactor/vrender` | `true` | `.`, `./entries`, `./entries/browser`, `./entries/node`, `./entries/miniapp`, `./entries/shared`, `./entries/shared-browser`, `./entries/shared-browser-lite` | root `src/index.ts` re-export core/kits/animate/components/entries/legacy；`./entries/shared` 有 browser condition |
| `@visactor/vrender-core` | `["./src/modules.ts","./cjs/modules.js","./es/modules.js"]` | root 与 `./application`、`./graphic/creator`、`./register/graphic`、`./path`、`./svg`、`./text`、`./render/*` 等 | root `src/index.ts` 导出 common/xml、segment、plugins、renderer modules、register 全面 |
| `@visactor/vrender-kits` | `false` | env、event extension、installers、register、picker constants、dynamic texture | root `src/index.ts` -> `index-node`，同时 browser root 导出 lottie；`index-node.ts` 顶层 import rough module |
| `@visactor/vrender-animate` | `false` | root、`./register`、custom 子入口、executor、state、ticker、timeline | root `src/index.ts` 创建 `defaultTicker` 并导出 custom/register 与大量 custom class |
| `@visactor/vrender-components` | `false` | root、少量 axis/crosshair/label/legend/poptip/tag/tooltip/util 子路径 | root `src/index.ts` 全组件 barrel；data-zoom/marker/player/slider/scrollbar/title/brush/timeline/radio/checkbox/table-series-number 等 root-only |

证据路径：

- `packages/vrender/package.json`
- `packages/vrender-core/package.json`
- `packages/vrender-kits/package.json`
- `packages/vrender-animate/package.json`
- `packages/vrender-components/package.json`

## `@visactor/vrender`

| 入口 | 当前事实 | 体积判断 | 验证方式 |
| --- | --- | --- | --- |
| root `.` | `packages/vrender/src/index.ts` 导出 `@visactor/vrender-core`、kits、animate、components、entries、legacy `createStage` | full 兼容入口，不能改成 lite；root import 本身是最高风险 | bundle 对比 root import vs subpath import；跑 root import 不 bootstrap 的 existing tests |
| `./entries` | `packages/vrender/src/entries/index.ts` 导出 browser / miniapp / node / shared | entry barrel，非最窄入口 | analyzer 验证是否把 miniapp/node 静态带入 |
| `./entries/browser` | `createBrowserVRenderApp`，走 `bootstrapVRenderBrowserApp` | full browser app，默认行为不能破坏 | `packages/vrender/__tests__/unit/entries.test.ts` |
| `./entries/shared` | browser condition 指向 `shared-browser`；普通 import 走通用 `shared.ts`，静态导入 browser/node/miniapp creators | browser bundler 配置正确时较窄；条件不生效会变宽 | browser/non-browser resolve 条件各打一遍 |
| `./entries/shared-browser` | 只面向 browser，走 full shared browser bootstrap | full shared browser 标准入口 | `shared-browser-entry.test.ts` |
| `./entries/shared-browser-lite` | 只面向 browser，走 lite bootstrap | lite 候选入口，不能替代 full 默认 | `shared-browser-lite-entry.test.ts` |

## `@visactor/vrender-core`

root `packages/vrender-core/src/index.ts` 导出面很宽，包括：

- `./graphic`、creator、register、factory、registry、entries。
- render modules：arc/rect/line/area/symbol/circle/text/path/polygon/star/glyph/richtext/image/3D。
- common：text、color、bezier、custom-path2d、segment、path-svg、xml、render-curve、render-area、morphing、split-path。
- plugins：html/react/flex/3d/richtext-edit 等。

可作为窄入口的现有 subpath：

- `@visactor/vrender-core/graphic/creator`
- `@visactor/vrender-core/graphic/base`
- `@visactor/vrender-core/graphic/group`
- `@visactor/vrender-core/register/graphic`
- `@visactor/vrender-core/entries/browser`
- `@visactor/vrender-core/entries/runtime-installer`
- `@visactor/vrender-core/path`
- `@visactor/vrender-core/svg`
- `@visactor/vrender-core/text`

风险：

- 很多内部文件仍从 `@visactor/vrender-core` root import，例如 components、kits picker、VChart 侧大量类型/工具使用。
- root barrel 把 optional 图元、3D、xml、richtext-edit plugin 暴露在同一个模块图里。

验证：

- 用 metafile 对比 `@visactor/vrender-core` root 与 `@visactor/vrender-core/graphic/creator`。
- 跑 core public subpath exports / build artifact consistency 测试。

## `@visactor/vrender-kits`

| 入口 | 当前事实 | 风险 |
| --- | --- | --- |
| root `.` | `src/index.ts` 先 `export * from './index-node'`，再导出 lottie | browser root 可能额外带 lottie；CJS root 从 `index-node` 出发 |
| `src/index-node.ts` | 顶层 import rough module，导出 gif、dynamicTexture、env、register、picker modules | root barrel 高风险；rough/gif/dynamic texture 混入 |
| `./installers/app` | 多端 env + default graphics + browser/node/math picker，default graphics 包含 gif | full app installer，不适合作基础 browser bundle |
| `./installers/browser` | browser env + browser picker，不含 multi-env | browser shared full 使用 |
| `./installers/browser-lite` | browser env + lite picker | lite 使用 |
| `./installers/graphics` | standard full graphics，不含 gif | full standard graphics 候选 |
| `./installers/graphics-lite` | area/circle/glyph/group/line/rect/shadowRoot/symbol/text/wrapText | lite 候选 |
| `./register/register-*` | 单图元注册入口 | 适合按需，但某些 register 会带 3D 或 gif |

验证：

- root kits vs `installers/*` vs `register/*` metafile diff。
- `packages/vrender-kits/__tests__/unit/root-installer-exports.test.ts`。

## `@visactor/vrender-animate`

| 入口 | 当前事实 | 风险 |
| --- | --- | --- |
| root `.` | 创建 `defaultTicker`，`defaultTicker.addTimeline(defaultTimeline)`；导出 custom/register、morphing、input text、component | CJS/root import 会拉 custom 面 |
| `./register` | 只 mixin `GraphicStateExtension` 和 `AnimateExtension` | 推荐轻量注册入口 |
| `./custom/register` | 一次性 import/register fade/scale/rotate/move/grow/story/richtext/poptip/disappear 等 | full custom register，高风险但 full default 依赖 |
| `./custom/*` | 多个单项 custom subpath | 可作为 optional |
| `./executor/animate-executor` | builtIn map 和执行器 | 基础动画配置依赖 |

验证：

- bundle diff：`@visactor/vrender-animate` root vs `@visactor/vrender-animate/register`。
- full bootstrap 不能移除 `custom/register`，除非上层 type-based custom 动画迁移。

## `@visactor/vrender-components`

root `packages/vrender-components/src/index.ts` 导出所有组件。当前 package exports 只覆盖少数组件子路径，导致很多组件要么走 root，要么 deep import 受 exports 阻断。

现有子路径：

- axis：`./axis`、`./axis/line`、`./axis/grid/line`、tick-data、type、util、constant。
- crosshair：`./crosshair`、`./crosshair/line`、`./crosshair/rect`、type。
- label：`./label`、`./label/dataLabel`、`./label/line`、`./label/symbol`、type、register。
- legend：仅 discrete / constant / type。
- poptip、tag、tooltip、util。

root-only 高风险模块：

- data-zoom
- marker
- player
- slider
- scrollbar
- title
- brush
- timeline
- radio / checkbox
- table-series-number

验证：

- 逐个新增 subpath 前，对比 root import 与拟定 subpath import。
- `packages/vrender-components/__tests__/unit/module-explicit-bindings.test.ts`。

## Internal Root Barrel 风险

| 位置 | 事实 | 建议 |
| --- | --- | --- |
| VChart | 大量 `@visactor/vrender-core` root import；部分 `@visactor/vrender-kits` root import；components root import | VChart integration agent 逐项替换为稳定 subpath |
| components | 多处从 `@visactor/vrender-core` root import类型和工具 | 能用已有 subpath 时收窄；缺 subpath 先在 VRender 提供标准入口 |
| kits | picker / env / canvas contribution 多处从 core root import renderer/type | render/picker agent 评估是否使用 core subpath |
| React | `packages/react-vrender/src/Stage.tsx` root import `@visactor/vrender` | React 绑定需要单独评估，不能在本专项误改 |

## 子入口 Re-export 过宽

| 子入口 | 风险 |
| --- | --- |
| `@visactor/vrender/entries` | 汇总 browser/node/miniapp/shared |
| `@visactor/vrender/entries/shared` | 非 browser condition 时静态导入多端 creator |
| `@visactor/vrender-core` root | 几乎全量 core |
| `@visactor/vrender-kits` root | index-node + rough/gif/dynamicTexture + browser lottie |
| `@visactor/vrender-animate` root | custom/register 与 custom class |
| `@visactor/vrender-components` root | 全组件 |
| `components/axis/index.ts` | line/circle/grid/animate/tick-data |
| `components/label/index.ts` | base/rect/arc/line/symbol/dataLabel |
| `components/crosshair/index.ts` | 全 crosshair 形态 |
| `components/marker/index.ts` | line/area/point/arc 全族 |
