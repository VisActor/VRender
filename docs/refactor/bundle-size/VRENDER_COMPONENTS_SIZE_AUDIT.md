# VRender Components 包体积审计

> 文档类型：`@visactor/vrender-components` 组件级体积风险台账
> 当前状态：只读源码事实 + 子入口 / register 候选

## 当前入口事实

- root：`packages/vrender-components/src/index.ts` 导出全组件。
- package exports：`packages/vrender-components/package.json` 已暴露 axis、crosshair、label、legend、poptip、tag、tooltip、util，以及一组 root-only optional 组件子路径。
- `sideEffects: false`，但多个组件 class 文件会在模块顶层调用 `load*Component()`，因此 root barrel 和过宽子入口仍要用 bundle analyzer 验证。

## 组件风险表

| 组件 | public subpath export | register 入口 | 依赖 / 静态带入 | line/simple 必需 | optional 判断 | barrel 风险与建议 | 验证方式 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| axis | `./axis`、`./axis/line`、`./axis/grid/line`、tick-data/type/util/constant | `axis/register.ts` | group/line/richtext/text；line axis 额外 rect；circle axis 额外 circle；grid 额外 path；axis animate | 是，line chart 需要线性/分类轴 | circle/grid/polar 形态可选 | `axis/index.ts` 汇总 line/circle/grid/animate/tick-data，建议使用 `axis/line` 等窄入口 | axis unit + VChart line |
| label / data-label | `./label`、`./label/dataLabel`、`./label/line`、`./label/symbol`、type/register | `label/register.ts`、`label/data-label-register.ts` | group/text/richtext/line + label animate；label root 包含 base/rect/arc/polygon/overlap | line label 常见但可配置 | arc/rect/polygon/overlap/richtext 可选 | `label/index.ts` 过宽，建议补 rect/arc/polygon/base 子入口 | label tests + VChart label on/off |
| legend | `./legend/discrete`、constant/type；color/size 当前缺 public 子入口 | `legend/register.ts` | base group/tag；discrete 带 pager/scrollbar；color/size 带 slider/path | VChart line 常见 legend | color/size/scroll/pager 可选 | root `legend/index.ts` 汇总 discrete/color/size，建议补 color/size/base/register 子入口 | legend unit + VChart line |
| tooltip | `./tooltip` | `tooltip/register.ts` | group/rect/symbol/text/richtext | VChart line 常见 | richtext tooltip 可选但默认 tooltip 需要 | subpath 已有，但内部 richtext 成本需 stats | tooltip interaction |
| crosshair | `./crosshair`、`./crosshair/line`、`./crosshair/rect`、type | `crosshair/register.ts` | line: group/line；rect: group/rect；circle/sector: arc；polygon: path | line/rect crosshair 常见 | circle/sector/polygon optional | `crosshair/index.ts` 全形态，建议继续使用 line/rect 子入口并补其他显式子入口 | crosshair interaction |
| poptip | `./poptip` | `poptip/register.ts` | group/text/symbol/rect，module/plugin/contribution | 非基础 line 必需 | optional | `poptip/index.ts` 导出 module/plugin，建议拆 module/plugin 子入口 | poptip tests |
| data-zoom | `./data-zoom`、`./data-zoom/register`、`./data-zoom/type` | `data-zoom/register.ts` | tag、rect/symbol/area/line | 非基础 line 必需 | optional | 已有 public subpath；上层应从 root 迁移到该入口 | data-zoom interaction |
| marker | `./marker`、`./marker/line`、`./marker/area`、`./marker/point`、`./marker/arc-line`、`./marker/arc-area`、type/register | `marker/register.ts` | group/tag/segment/arcSegment/polygon/arc/symbol/image/line + `registerAnimate` | 非基础 line 必需 | optional heavy | 已有 family public subpath；优先用 line/area/point/arc 窄入口，避免 marker root 全族 | marker tests |
| player | `./player`、`./player/register`、`./player/type` | `player/register.ts` | slider、group、symbol、controller | 否 | optional | 已有 public subpath；避免 root components | player tests |
| slider | `./slider`、constant/register/type | `slider/register.ts` | group/text/rect/symbol | 否 | optional | 已有 public subpath；legend/data-zoom 需要时显式依赖 | slider tests |
| scrollbar | `./scrollbar`、module/register/type | `scrollbar/register.ts` | group/rect；legend discrete 可能带入 pager/scrollbar | legend scroll 时需要 | optional | 已有 public subpath；legend discrete 内部依赖保持显式 | scrollbar tests |
| title | `./title`、`./title/register`、`./title/type` | `title/register.ts` | group/text/richtext | VChart 常见但可配置 | richtext optional | 已有 public subpath；后续评估 title plain/richtext 拆分 | title tests |
| brush | `./brush`、`./brush/register`、`./brush/type` | `brush/register.ts` | group/polygon | 否 | optional | 已有 public subpath；避免 root components | brush interaction |
| timeline | `./timeline`、`./timeline/register`、`./timeline/type` | `timeline/register.ts` | group/text/symbol/line | 否 | optional | 已有 public subpath；避免 root components | timeline tests |
| radio / checkbox | `./radio` / `./checkbox`、register/type | `radio/register.ts`、`checkbox/register.ts` | radio: group/rect/wrapText/image；checkbox: group/rect/text/image | 否 | optional，image 链路风险 | 已有 public subpath；避免 image 进入基础图表 | radio/checkbox tests |
| table-series-number | `./table-series-number`、register/type | `table-series-number/register.ts` | group/text/image；event-manager | 否 | optional | 已有 public subpath；后续确认 image 是否必要 | table-series-number tests |

## 其他已存在但本轮未列为必填的组件

源码还存在 `indicator`、`empty-tip`、`switch`、`weather`、`segment`、`link-path`、`pager`、`label-item` 等。它们多数不是 line/simple 基础硬依赖，但会通过 root barrel 进入可达模块图。后续 components agent 应按同样格式补充。

## 组件内部静态带入风险

| 风险 | 证据路径 | 判断 |
| --- | --- | --- |
| root barrel 全组件 | `packages/vrender-components/src/index.ts` | VChart 若从 root import，容易带所有组件 |
| axis root 汇总过宽 | `packages/vrender-components/src/axis/index.ts` | line axis 与 circle/grid/tick-data/animate 混在一起 |
| label root 汇总过宽 | `packages/vrender-components/src/label/index.ts` | base/rect/arc/polygon/dataLabel/overlap 混在一起 |
| legend root 缺 color/size public subpath | `packages/vrender-components/src/legend/index.ts` | 上层若需要 color/size 可能只能 root |
| marker root 全族 | `packages/vrender-components/src/marker/index.ts` | line/area/point/arc 互相带入 |
| component animation | `packages/vrender-components/src/animation/*` | axis/label/marker 等 register 会带动画 helper |

## 暂不建议优化的点

- line axis、plain text label、tooltip、line/rect crosshair 是 VChart line 常见交互能力，不能简单从标准 line 场景删除。
- component register 中的基础图元 register 调用不要为体积直接删，否则容易出现 renderer/picker binding 缺失。
- root components 兼容入口必须保留；优化应通过新增/收窄 public subpath 和上层替换，而不是改变 root 语义。

## 后续优化建议

1. VChart 优先替换到稳定 public subpath，不使用未公开 deep import。
2. 对已有子入口做宽度复核：axis/label/legend/crosshair/marker。
3. 对 richtext / image / path / arc 依赖做 optional 化：优先在组件内部拆 plain vs rich / line vs polar / text vs image。
4. 继续观察未列入首轮的 root-only 组件：indicator、empty-tip、weather、switch、label-item、link-path、pager、segment。

## 验证方式

```bash
rush compile -t @visactor/vrender-components
cd packages/vrender-components && rushx test --runInBand
```

体积验证：

- VChart line/simple stats 中 `@visactor/vrender-components` rendered/gzip before/after。
- components root import vs 单组件 subpath import metafile。
