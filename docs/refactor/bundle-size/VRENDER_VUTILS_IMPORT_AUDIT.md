# VRender VUtils Import 审计

> 文档类型：`@visactor/vutils` 使用方式台账
> 当前状态：源码静态扫描 + 待 bundle analyzer 复核

## 扫描入口

起点命令：

```bash
rg "from '@visactor/vutils'|from \"@visactor/vutils\"" packages
```

当前结论：

- `packages/*/src` 中大量文件从 `@visactor/vutils` root barrel 导入。
- 未发现稳定使用 `@visactor/vutils/*` deep import 的模式。
- `@visactor/vutils` 在本仓库 workspace package 中未见 package exports map；后续不能直接要求业务使用未公开 deep path。
- lockfile / workspace 视角存在多个 vutils 版本记录，需要 bundle analyzer 确认是否重复打包。

## 各包 Root Import 分布

| 包 | 约略源文件数 | 主要 symbols | 判断 |
| --- | ---: | --- | --- |
| `vrender-core` | 173 | `IPointLike`、`IBounds`、`IAABBBounds`、`IMatrix`、`IPoint`、`isArray`、`AABBBounds`、`Matrix`、`isString`、`isNil` | 基础几何、bounds、matrix、event、render 真实依赖多 |
| `vrender-components` | 99 | `merge`、`isValid`、`isFunction`、`isNil`、`isEmpty`、`isValidNumber`、`normalizePadding`、`PointService`、`AABBBounds` | 组件层大量 merge / helper，root barrel 风险高 |
| `vrender-animate` | 21 | `isValidNumber`、`isNumber`、`isArray`、`isFunction`、`isNil`、`isValid`、`PointService` | custom animation 和 morphing 依赖更明显 |
| `vrender-kits` | 34 | `Matrix`、`AABBBounds`、`getContextFont`、`isArray`、`isString`、`EventEmitter` | env/window/picker/event extension 依赖 |

> 注：上表为源码静态扫描结果，不等同最终 bundle 占比。type-only import 在 TS 编译后可能消失，value import 才是 bundle 风险。

## 高频能力归类

| 能力 | 常见 symbols | 来源路径 | 基础路径判断 |
| --- | --- | --- | --- |
| bounds / geometry | `IBounds`、`IAABBBounds`、`IBoundsLike`、`AABBBounds`、`Bounds`、`Matrix`、`Point`、`PointService` | core bounds/render/picker、components axis/label/crosshair | 基础能力，不能简单删除 |
| type / guard | `isArray`、`isNil`、`isValid`、`isFunction`、`isObject`、`isPlainObject`、`isString`、`isNumber` | 全包 | 低层工具，收益取决于 vutils tree-shaking |
| merge / data helper | `merge`、`get`、`array`、`flattenArray`、`last` | components | components 体积重点 |
| math / polar | `radianToDegree`、`degreeToRadian`、`polarToCartesian`、`normalizeAngle`、`getAngleByPoint`、`clamp` | axis/crosshair/label/data-zoom/brush | polar/optional 组件更明显 |
| event / rate-limit | `EventEmitter`、`debounce`、`throttle` | core event、data-zoom、brush、gesture | 交互组件 optional |
| color / text | `Color`、`hexToRgb`、`DEFAULT_COLORS`、`TextMeasure`、`getContextFont` | color-string、label smart invert、text measure、kits | 基础 text/color 真实依赖，仍需 analyzer |

## Root Barrel 风险

当前所有包基本都从 `@visactor/vutils` root import。风险有两类：

1. vutils 本身如果 tree-shaking 友好，则 root import 只会留下使用的 value symbols。
2. 如果构建条件、CJS 回退或 side effect 导致 root barrel 过宽，则小 helper 可能带入不相关工具。

本轮仅能记录风险，不能凭源码断言 root import 已造成实际体积增长。必须结合 VChart stats / metafile。

## 是否存在可收窄 Import Path

待验证。原因：

- 当前本仓库没有使用稳定 vutils deep import 的先例。
- workspace `@visactor/vutils` package 是否承诺公开子路径，需要在 vutils 仓库/package exports 中确认。
- 如果没有 public subpath，VRender 不应通过未公开 deep path 换体积收益。

推荐后续路径：

1. 先用 analyzer 证明 `@visactor/vutils` root barrel 实际带入了未使用模块。
2. 再推动 vutils 提供正式 subpath exports，例如 geometry、guard、merge、text、color。
3. VRender 只迁移到已公开、稳定、typed 的 vutils 子入口。

## 重复版本风险

当前锁文件中可见多个 vutils 版本记录，包括 `0.13.3`、`0.15.14`、`1.0.23`。这不等同最终重复打包，但提示需要检查：

- VChart bundle 中是否同时存在多个 vutils 版本。
- VRender 各包 peer / dependency 解析是否一致。
- linked workspace / alias 是否导致一个包走 workspace，一个包走 npm artifact。

验证方式：

- VChart stats analyzer 中按 package/version 分组。
- `pnpm why @visactor/vutils` 或 Rush 对应依赖查询。
- Rollup/webpack metafile 中确认 package realpath。

## 基础路径 vs Optional 路径

| 来源 | vutils 能力 | 判断 |
| --- | --- | --- |
| core render/bounds/event/text | bounds、matrix、guard、text measure、event emitter | 基础图表真实依赖，优先不动行为 |
| line/area/symbol/text renderer | points、isArray、min/max、text helper | 基础图表真实依赖 |
| path/svg/xml/richtext/image/3D | parser、geometry、resource、matrix | optional 能力，随模块拆分自然减少 |
| components axis/label/tooltip/crosshair | merge、bounds、polar、text、richtext | line/simple 常见，但需按组件子入口收窄 |
| components data-zoom/brush/marker/player/radio/checkbox | debounce/throttle、cloneDeep、image、polygon、polar | optional，适合通过 components 子入口拆分 |
| animate custom/story/disappear/morphing | guard、geometry、matrix、PointService | optional custom 分组后可减少 |
| kits env/media/event extension | Matrix/AABBBounds/EventEmitter/isArray/isString | browser 基础只需 browser env；gesture/media optional |

## 后续优化建议

1. 不直接改为未公开 deep import。
2. 优先从 VRender 自身入口、components 子入口、animate custom 分组、kits optional installer 降低 vutils 可达路径。
3. 如果 analyzer 证明 root barrel 过宽，再推动 vutils package 提供正式 subpath。
4. 对 components 中大量 `merge` 使用单独审计：是否每个组件 import 即执行 deep merge，是否可以延后默认 theme merge。
5. 对 optional 组件中的 `cloneDeep`、`debounce`、`throttle`、polar geometry 单独标记，避免进入基础 line。

## 验证方式

```bash
rg "from '@visactor/vutils'|from \"@visactor/vutils\"" packages
```

体积验证：

- VChart line/simple stats 中 `@visactor/vutils` rendered/gzip。
- analyzer 确认 vutils 是否重复版本、是否包含未使用工具模块。
