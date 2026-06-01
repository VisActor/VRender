# VChart 消费 VRender 集成审计

> 文档类型：VChart 侧 VRender 消费路径只读审计
> 关联仓库：`/Users/bytedance/Documents/GitHub/VChart`
> 当前状态：只读记录，不修改 VChart 代码

## 当前定位

本文件保留 VChart 消费路径作为外部参照。入口和环境解析问题已经完成主要梳理，下一轮包体积优化的主线是 VRender 自身内容大小；VChart bundler stats / resolve 只作为 smoke、回归或上层配合记录，不再作为 P0 owner 判断的主依据。

## 工作区事实

VChart 仓库可用，但当前工作区有既有未提交修改。本轮只读查看，未改 VChart。

```text
branch: chore/vrender-alpha-verify
dirty: yes
```

当前发现的 stats / bundle 产物：

- `packages/vchart/build/stats-empty.html`
- `packages/vchart/build/stats-full.html`
- `packages/vchart/build/stats-line.html`
- `packages/vchart/build/stats-pie.html`
- `packages/vchart/build/stats-simple.html`
- `packages/vchart/build/index-empty.min.js.gz`：234952 bytes
- `packages/vchart/build/index-line.min.js.gz`：366123 bytes
- `packages/vchart/build/index-simple.min.js.gz`：388141 bytes
- `packages/vchart/build/index-pie.min.js.gz`：322864 bytes

这些 final gzip 数值和本专项 baseline 中的 analyzer group gzip 不是同一口径，不能直接相减。见 [VRENDER_BUNDLE_BASELINE.md](./VRENDER_BUNDLE_BASELINE.md)。

## 主要 VRender Import 路径

| VChart 路径 | Import | 判断 |
| --- | --- | --- |
| `packages/vchart/src/compile/stage-app.ts` | `@visactor/vrender/entries/shared` | 当前 stage app 主入口；browser condition 命中 `shared-browser` 已作为历史入口治理重点，后续只做回归 watch |
| `packages/vchart/src/index.ts` | `@visactor/vrender-core`、`@visactor/vrender-animate`、`@visactor/vrender-components`、`@visactor/vrender-kits` root re-export | full package 对外入口，不能等同 line/simple 基础包；但若被基础入口引用会很重 |
| `packages/vchart/src/vrender-tools.ts` | `@visactor/vrender-kits` root | kits root 风险高，可能带 rough/gif/lottie/dynamicTexture |
| `packages/vchart/src/compile/compiler.ts` | `createGroup`、`vglobal`、`waitForAllSubLayers` from core root | core root import 风险 |
| `packages/vchart/src/mark/base/base-mark.ts` | core root import + `createGroup`、`CustomPath2D` | base mark 可达范围广，需拆 public subpath 支持 |
| `packages/vchart/src/animation/index.ts` | root animate re-export `registerAnimate`、`registerCustomAnimate` | 可能把 animate root 暴露给基础入口，需 stats 确认 |
| `packages/vchart/src/animation/config.ts` | 多个 `@visactor/vrender-animate/custom/*` 子路径 | custom 动画显式使用，属于 VChart 主动动画能力 |
| `packages/vchart/src/component/*` | 多处 `@visactor/vrender-components` root import | marker/data-zoom/player/title/indicator 等因缺 public subpath 常从 root 取 |
| `packages/vchart/src/component/crosshair/cartesian.ts` | `components/crosshair/line`、`components/crosshair/rect` | 窄入口使用较好 |
| `packages/vchart/src/util/text.ts` | `components/util/text` | 窄入口使用较好 |

## Line / Simple 场景需要的 VRender 能力清单

line 基础场景常规需要：

- runtime：browser shared app、stage/layer/group。
- graphics：group、line、area 待场景确认、symbol、circle、rect、text、wrapText、glyph、shadowRoot。
- renderer/picker：上述图元 browser canvas renderer/picker。
- text：axis / label / tooltip / legend 文本测量。
- components：line axis、label、discrete legend、tooltip、line/rect crosshair。
- animate：基础 `registerAnimate`、常规 chart custom 动画是否需要取决于 VChart animation 注册链。
- event/picker：tooltip、crosshair、legend hover/click 等交互。

simple 场景通常比 line 更宽：

- line / area / bar / pie / common 系列。
- arc / area / rect / path/polygon 等更可能进入。
- legend / tooltip / crosshair / label / animate 等基础组件。

## 已经做得较好的窄入口

- stage app 使用 `@visactor/vrender/entries/shared`，如果 browser condition 正确，会落到 browser shared 入口，而不是 root `@visactor/vrender`。
- crosshair cartesian 使用 `@visactor/vrender-components/crosshair/line` 和 `crosshair/rect`。
- text util 使用 `@visactor/vrender-components/util/text`。
- 部分 chart/mark register 使用 `@visactor/vrender-kits/register/register-*` 子入口。

## 需要 VRender 提供标准入口解决的问题

这些问题不应要求 VChart 使用未公开 deep import workaround：

- `vrender-components` root-only 组件缺 public subpath：data-zoom、marker、player、slider、scrollbar、title、brush、timeline、radio、checkbox、table-series-number 等。
- `vrender-core` 常用 creator / global / event / type 混在 root barrel；需要稳定公开窄入口时，应由 VRender package exports 提供。
- `vrender-kits` root 过宽；VChart 若只需要 Gesture、env、register，应有稳定子入口。
- `vrender-animate` root 创建 ticker/timeline 并导出 custom 面；VChart 若只需要 register 或 executor，应使用 public subpath。

## 可能是 VChart 主动 Import Heavyweight Entry 的问题

| VChart 位置 | 风险 | 归属判断 |
| --- | --- | --- |
| `src/index.ts` root re-export VRender root symbols | full VChart 公开入口需要；不应计入 line-only 修复前提 | VChart 需确认基础入口是否引用 full index |
| `src/vrender-tools.ts` 从 kits root import | kits root 过宽，若进入基础入口则可能是 VChart 主动 heavyweight import | VChart + VRender 协作 |
| marker/data-zoom/player/title 等组件从 components root import | 部分因为 VRender 缺 public subpath | VRender 先补标准入口，VChart 再替换 |
| `animation/index.ts` 从 animate root re-export | 可能带 root animate | VChart 需确认是否进入 line/simple |
| `compile/morph.ts` 导入 animate morphing | morphing 高级能力 | VChart 需确认是否基础路径必需 |

## 后续验证命令

在 VChart 仓库中执行，保持只读或在单独分支验证：

```bash
git status --short --branch
ls packages/vchart/build/stats-*.html
wc -c packages/vchart/build/index-{empty,line,simple,pie}.min.js.gz
```

根据 VChart 当前脚本补充实际 bundle 命令，待验证：

```bash
# 待确认命令名
rushx build
rushx build:line
rushx size
```

## 需要补充的数据

- stats-line / stats-simple 中 VRender 各包 rendered/gzip 的 before/after。
- `@visactor/vutils` 是否重复版本打包。
- `@visactor/vrender/entries/shared` 在 VChart bundler 中实际 resolve 到 `shared-browser` 还是 generic `shared.ts`。
- line 场景是否真的需要 area、richtext、custom animate、marker、data-zoom 等能力。
- full VChart `src/index.ts` 是否被 line/simple 临时入口引用。

## 禁止事项

- 不在本专项中修改 VChart 代码。
- 不要求 VChart 使用未公开 VRender deep import。
- 不把 VChart full 入口的 root re-export 直接判定为 line/simple 体积问题，必须用 stats 证明可达。
