# VRender 1.1.0 业务使用报告

> 文档类型：business usage / upper-layer guidance
> 生成日期：2026-06-12
> 面向对象：VChart / VTable 集成 owner、外部高级用户、业务升级评审

## 总体建议

普通业务升级可以继续使用 VRender root/default/full 入口；这条路径仍保持完整能力和最小迁移成本。

如果业务目标包含包体积优化，应由上层库提供可选 profile，让用户选择是否加载 optional 能力。VRender 层已经提供部分标准 public subpath/register，但收益不会自动出现在所有业务 bundle 中。上层必须改变 import/bootstrap 方式，并用同一 stats 口径验证。

## VChart 使用建议

### 状态刷新

推荐：

```ts
graphic.setStates(states, {
  animate: true,
  animateSameStatePatchChange: true
});
```

不推荐为了刷新同一组状态先 `clearStates()` 再 `setStates()`。这会丢失旧 resolved patch，可能让图元先回 normal attrs，再从 normal attrs 动画进入 state attrs。

### 动画写法

appear/fade 应先写最终静态属性，再用 `animate().from(...)` 表达起始 pose：

```ts
graphic.setAttributes({ opacity: 1 });
graphic.animate().from({ opacity: 0 }).to({ opacity: 1 }, duration);
```

不要依赖 `animate().to(...)` 在结束后写入 `baseAttributes`。

### Custom Animation Profile

VChart 如果要做按需加载，建议先提供一层统一 bootstrap，而不是在 mark 或 animation 热路径中零散 import：

```ts
import { registerAnimate } from '@visactor/vrender-animate/register';
import { registerBasicCustomAnimate } from '@visactor/vrender-animate/custom/register-basic';

export function registerVRenderBasicAnimationProfile() {
  registerAnimate();
  registerBasicCustomAnimate();
}
```

建议暴露给用户的配置语义：

| 配置 | 行为 |
| --- | --- |
| 不配置或 `full` | 保持当前完整兼容行为 |
| `auto` | VChart 根据 spec / component 使用情况选择 capability |
| `['basic']` | 只加载基础 custom animate |
| `['basic', 'richtext']` | 基础动画 + richtext custom animate |
| `['basic', 'story']` | 基础动画 + story / MotionPath / streamLight |
| `false` | 只保留基础 animation runtime，不注册 built-in custom type |

如果用户选择的 capability 没有注册某个 animation type，上层应把它视为配置/能力缺失，而不是静默回退到 full。

### Components Profile

常规 line/pie/simple 不一定需要完整 components root。后续 VChart 可把低频组件迁移到 public subpath：

```ts
import { DataZoom } from '@visactor/vrender-components/data-zoom';
import { MarkLine } from '@visactor/vrender-components/marker/line';
import { ScrollBar } from '@visactor/vrender-components/scrollbar';
```

迁移原则：

1. 默认 full profile 保持 root/full 兼容。
2. lite/auto profile 只 import 需要的 component subpath。
3. marker 优先按 line/area/point/arc-line/arc-area 选择。
4. type-only import 也优先改到 public subpath，避免旧 TS/bundler 配置把它保留成 root value import。

## VTable 使用建议

本轮不把 VTable stats 作为 P0 blocker。原因是 VTable 常规表格场景大量使用 text、rect、line、image、path/svg 等基础 VRender 链路，透视图还包含 VChart 用法；先用 VChart line/pie/simple/full 作为体积代理是合理的。

VTable 后续如果要拿额外收益，应优先关注 table-only 能力：

| 方向 | 建议 |
| --- | --- |
| env/profile | 提供 browser-only 或 env-selected runtime bootstrap，避免多端 env/window/canvas 静态闭包 |
| component profile | 表格保留 poptip、tag、checkbox、radio、scrollbar、table-series-number；避免 axis/legend/marker/dataZoom/player 进入 table-only profile |
| VChart 透视图 | 复用 VChart 的 VRender profile 选择 |
| full re-export | 保留兼容入口，不作为 lite profile 的默认实现 |

如果 VTable 领取 table-only 优化任务，需要补 VTable 自身 build stats；否则当前 release 可继续用 VChart 场景作为代理。

## 外部用户使用建议

### 普通用户

继续使用 root/default：

```ts
import { createBrowserVRenderApp } from '@visactor/vrender';
```

这种方式能力最完整、迁移风险最低。

### 包体积敏感用户

使用 public subpath/register，不要 deep import 内部文件：

```ts
import { registerAnimate } from '@visactor/vrender-animate/register';
import { registerBasicCustomAnimate } from '@visactor/vrender-animate/custom/register-basic';
import { ScrollBar } from '@visactor/vrender-components/scrollbar';
```

如果使用动态加载，应在上层统一入口中加载 optional capability，不要在每次动画执行或每个图元渲染时触发 `import()`。

## 业务验证建议

| 场景 | 必测内容 |
| --- | --- |
| 常规 line/bar/area | 基础状态动画、update 动画、axis/label/legend |
| pie/polar | `scaleIn`、growAngle/growRadius、polar marker |
| richtext/text-heavy | text/richtext custom animate、tooltip/title/label 外观 |
| disappear/story effects | dissolve/particle/story/MotionPath/streamLight 是否按 profile 加载 |
| multi-app page | VChart + VTable 共享 App 创建和释放 |
| Node 出图 | `createNodeVRenderApp({ envParams: CanvasPkg })` 与 canvas ABI |

## 风险与边界

1. optional profile 漏注册能力后，VRender 不应静默加载 full；应由上层给出清晰配置说明。
2. VRender 的 `register-richtext` 只注册 richtext custom animate，不等于 core richtext 图元 optional 化。
3. component custom animate 独立 register 暂缓；如业务需要 `poptipAppear` / `labelItemAppear`，当前仍应使用 full custom register 或先定义上层 profile。
4. `path-svg` 暂缓拆分，因为 morph、MotionPath、streamLight、CustomPath2D 等链路可能共用，单点收益不明显。
5. VChart stats 是当前 VTable 常规场景代理，不替代 table-only 专项 stats。
