# VRender On-Demand Capability Usage

> 文档类型：上层按需加载指南
> 适用对象：VChart / VTable 集成、外部高级用户、VRender optional 能力拆分 reviewer
> 当前状态：记录已存在 public 能力入口与推荐接入方式；不是 VChart / VTable 已落地 API 承诺

## 结论

VRender full/default 入口继续保持完整易用性。需要包体积收益的上层，应改为从 VRender public narrow entry 选择能力，并把选择权通过上层配置暴露给用户。

当前已可直接使用的按需能力主要在 `@visactor/vrender-animate`：

| 能力 | Public entry | Register | 适合场景 | 不包含 |
| --- | --- | --- | --- | --- |
| 基础动画 runtime | `@visactor/vrender-animate/register` | `registerAnimate()` | 启用 graphic animation / state animation 基础运行时 | 不注册 built-in custom animate type |
| 基础 custom animate | `@visactor/vrender-animate/custom/register-basic` | `registerBasicCustomAnimate()` | fade / scale / move / rotate / grow / clip / state / update / fromTo / increaseCount | richtext、story、poptip、label item、disappear effects、motion path、streamLight |
| text / richtext custom animate | `@visactor/vrender-animate/custom/register-richtext` | `registerRichTextCustomAnimate()` | `inputText`、`inputRichText`、`outputRichText`、`slideRichText`、`slideOutRichText` | core richtext 图元注册；非 richtext custom effects |
| disappear effects | `@visactor/vrender-animate/custom/register-disappear` | `registerDisappearCustomAnimate()` | `dissolve`、`grayscale`、`distortion`、`particle`、`glitch`、`gaussianBlur`、`pixelation` | 基础 custom、richtext、story/component effects |
| story effects | `@visactor/vrender-animate/custom/register-story` | `registerStoryCustomAnimate()` | `slideIn/out`、`growIn/out`、`spinIn/out`、`moveScaleIn/out`、`moveRotateIn/out`、`strokeIn/out`、`pulse`、`MotionPath`、`streamLight` | 基础 custom、richtext、disappear、component effects |
| full custom animate | `@visactor/vrender-animate/custom/register` | `registerCustomAnimate()` | 需要完整 built-in custom animate 兼容性 | 体积最大，不用于 lite 场景 |

## Register Catalog And Roadmap

上层更新 VRender 后，应优先按下表选择 public register。不要通过 deep import 使用 `src` / `es` / `cjs` 内部文件。

| Register | Built-in type 范围 | 上层推荐使用方式 | 体积口径 | 状态 |
| --- | --- | --- | --- | --- |
| `registerAnimate()` | 基础 graphic / state animation runtime | 所有启用动画的 profile 先调用 | 不带 custom type | 已可用 |
| `registerBasicCustomAnimate()` | `fromTo`、`scaleIn/out`、`grow*`、`clip*`、`fade*`、`move*`、`rotate*`、`update`、`state`、`increaseCount` | line / bar / area / polar 等常规图表动画 profile | basic-only closure 29 files / 43,411 gzip | 已可用 |
| `registerRichTextCustomAnimate()` | `inputText`、`inputRichText`、`outputRichText`、`slideRichText`、`slideOutRichText` | text / richtext 动画 profile；不负责 core richtext 图元注册 | richtext-only closure 17 files / 35,033 gzip | 已可用 |
| `registerDisappearCustomAnimate()` | `dissolve`、`grayscale`、`distortion`、`particle`、`glitch`、`gaussianBlur`、`pixelation` | 退场特效 profile | disappear-only closure 22 files / 48,706 gzip | 已可用 |
| `registerStoryCustomAnimate()` | story in/out、`pulse`、`MotionPath`、`streamLight` | story / path / streamLight effect profile | story-only closure 14 files / 27,977 gzip | 已可用 |
| `registerCustomAnimate()` | full custom animation surface | 默认兼容 profile；不作为 lite / on-demand profile | full closure 当前会包含全部 custom group | 已可用 |

预计后续 animate custom 窄 register 数量：`0` 个，除非上层先定义出新的 component-only optional profile。

- `register-component` 暂缓，范围会是 `poptipAppear` / `poptipDisappear` / `labelItemAppear` / `labelItemDisappear`。当前直接源码约 9,057 raw / 1,710 gzip，假想 closure 约 13 files / 22,238 gzip；只在 VChart / VTable 先定义出 component-only optional profile 时才新增。
- 当前只读检查显示：VChart 有 `poptip` 用户开关与 `registerPoptip()` 组件注册，但源码未直接使用 `poptipAppear` / `poptipDisappear` / `labelItemAppear` / `labelItemDisappear` built-in type。这不足以证明需要 component animate-only register。
- `register-polar` 暂缓，不作为默认新增项。`growAngle` / `growRadius` 当前属于常规 basic custom，直接拆出会增加 full wrapper 成本，也可能破坏 polar / arc 常规图表的默认预期。
- 不继续做单个 type 级别 register。粒度过细会让 full/default 逐步变大，也会让上层能力配置难以理解。
- 如果新增任何窄 register，必须同步更新本文件、package README、public-subpath 测试和 size ledger，并记录 full 增量与 narrow caller 可避开的内容。

## Components Public Subpath Catalog

`@visactor/vrender-components` root 继续保留完整导出。需要按需收益的 VChart / VTable profile 应改用下列 public subpath，不要 deep import `es/*` 或 `src/*`。

| 能力 | Public entry | 推荐上层使用方式 | 不包含 |
| --- | --- | --- | --- |
| dataZoom | `@visactor/vrender-components/data-zoom` | dataZoom 组件 profile | marker / player / brush 等其他组件 |
| marker root | `@visactor/vrender-components/marker` | 需要完整 marker family 时使用 | 其他 components root |
| marker line | `@visactor/vrender-components/marker/line` | cartesian markLine | markArea / markPoint / polar marker |
| marker area | `@visactor/vrender-components/marker/area` | cartesian markArea | markLine / markPoint / polar marker |
| marker point | `@visactor/vrender-components/marker/point` | markPoint | markLine / markArea / polar marker |
| marker polar line | `@visactor/vrender-components/marker/arc-line` | polar markLine | cartesian marker / arcArea |
| marker polar area | `@visactor/vrender-components/marker/arc-area` | polar markArea | cartesian marker / arcLine |
| player | `@visactor/vrender-components/player` | player component profile | dataZoom / marker / brush |
| slider | `@visactor/vrender-components/slider` | slider or continuous legend profile | player / dataZoom root |
| scrollbar | `@visactor/vrender-components/scrollbar` | scrollbar or table profile | components root |
| title | `@visactor/vrender-components/title` | title component profile | indicator / tooltip / label |
| brush | `@visactor/vrender-components/brush` | brush interaction profile | marker / dataZoom |
| timeline | `@visactor/vrender-components/timeline` | timeline profile | player |
| radio / checkbox | `@visactor/vrender-components/radio` / `@visactor/vrender-components/checkbox` | form-like table custom components | components root |
| table series number | `@visactor/vrender-components/table-series-number` | VTable row/series number component | chart components |

每组还提供 `register` / `type` 子入口，例如：

```ts
import { DataZoom } from '@visactor/vrender-components/data-zoom';
import { MarkLine, registerMarkLineAnimate } from '@visactor/vrender-components/marker/line';
import { MarkPoint } from '@visactor/vrender-components/marker/point';
import { ScrollBar } from '@visactor/vrender-components/scrollbar';
```

上层迁移建议：

1. value import 从 `@visactor/vrender-components` root 改到具体 component subpath。
2. marker 按 line / area / point / arc-line / arc-area 迁移，只有需要全族时才用 `marker` root。
3. type-only import 也优先改到对应 `type` 或 component subpath，避免旧 TS/bundler 配置把 type import 误保留成 root value import。
4. full/default 入口继续使用 root，不改变兼容行为。

## 上层静态 Profile 接入方式

静态 import 适合上层已经拆出明确 profile / entry 的场景。关键原则是：每个 profile 文件只 import 自己需要的 VRender 能力；不要在同一个运行时分支文件里顶层 import 所有 optional group，否则 bundler 会先把这些能力放进同一个模块图，用户选择就很难拿到体积收益。

例如基础动画 profile：

```ts
import { registerAnimate } from '@visactor/vrender-animate/register';
import { registerBasicCustomAnimate } from '@visactor/vrender-animate/custom/register-basic';

export function registerVRenderBasicCustomAnimations() {
  registerAnimate();
  registerBasicCustomAnimate();
}
```

例如 richtext 动画 profile：

```ts
import { registerAnimate } from '@visactor/vrender-animate/register';
import { registerBasicCustomAnimate } from '@visactor/vrender-animate/custom/register-basic';
import { registerRichTextCustomAnimate } from '@visactor/vrender-animate/custom/register-richtext';

export function registerVRenderRichTextCustomAnimations() {
  registerAnimate();
  registerBasicCustomAnimate();
  registerRichTextCustomAnimate();
}
```

例如 story/effect 动画 profile：

```ts
import { registerAnimate } from '@visactor/vrender-animate/register';
import { registerBasicCustomAnimate } from '@visactor/vrender-animate/custom/register-basic';
import { registerStoryCustomAnimate } from '@visactor/vrender-animate/custom/register-story';

export function registerVRenderStoryCustomAnimations() {
  registerAnimate();
  registerBasicCustomAnimate();
  registerStoryCustomAnimate();
}
```

注意：

- `registerAnimate()` 只安装基础动画 runtime，不等同于 custom animate full register。
- register 必须在解析或执行对应 animation type 之前调用。
- 同一 register 重复调用会覆盖同名 built-in constructor，当前实现是低风险的，但上层仍应集中调用，避免热路径重复注册。
- 如果使用 static profile，上层应通过不同入口文件、构建条件或明确 profile 导出承载选择，而不是在一个文件里静态导入所有 optional group。
- 如果用户选择发生在运行时，使用下一节的动态加载方式。

## 自定义 Runtime Contribution Module

上层如果需要注入 renderer contribution、draw interceptor 或 picker contribution，应使用 VRender 的 runtime contribution installer，而不是直接维护 legacy/runtime container 与 app registry 的刷新顺序。

Public entry:

```ts
import { installRuntimeContributionModule } from '@visactor/vrender/entries/runtime-contribution';
```

基础用法：

```ts
installRuntimeContributionModule(customContributionModule, {
  targets: ['graphic-renderer']
});
```

语义：

- 如果未传 `app`，module 会登记为 pending runtime contribution。VRender 不会创建新 app，也不会在默认 graphics 尚未安装前提前执行 replacement module。
- 当前已经存在的 shared app 会立即安装该 module。
- 后续通过 `@visactor/vrender` app creator 创建的新 app，会在默认 bootstrap 完成后安装 pending module，保证 replacement module 可以看到内置 contribution token。
- 默认也会安装到 legacy binding context，保持旧兼容路径可用；需要禁用时传 `legacy: false`。
- 如果传入 `app`，VRender 只把 module 安装到该 app，不会同时扫描其他 shared app。
- 同一个 module object 对同一个 binding context 只会加载一次，避免 append-style contribution 重复绑定；app-scoped reinstall 仍可以重复调用。

`targets` 控制已有 app 需要刷新的 registry：

| Target | 作用 |
| --- | --- |
| `'graphic-renderer'` | 重新安装 runtime graphic renderer，并调用 renderer `reInit()` 刷新 render contribution |
| `'draw-contribution'` | 重新安装 draw interceptor contribution |
| `{ picker: CanvasPickerContribution }` | 重新安装指定 picker contribution |

VTable 这类同时注入 rect/group/image/text render contribution、draw interceptor 和 chart picker 的 profile，可以收口成：

```ts
import { CanvasPickerContribution } from '@visactor/vrender-kits/picker/contributions/constants';
import { installRuntimeContributionModule } from '@visactor/vrender/entries/runtime-contribution';

export function installVTableRuntimeContributions(app?: IApp) {
  installRuntimeContributionModule(splitModule, {
    app,
    targets: ['graphic-renderer', 'draw-contribution', { picker: CanvasPickerContribution }]
  });

  installRuntimeContributionModule(textMeasureModule, {
    app,
    targets: ['graphic-renderer']
  });
}
```

推荐调用方式：

1. 在 profile 顶层调用一次，覆盖 app 尚未创建时的 runtime 状态。
2. 在拿到 app 后、`app.createStage()` 前再调用一次，覆盖 app 已存在或 shared app 被其他上层提前创建的场景。
3. 不要依赖顶层 import 顺序来判断 renderer 是否已经安装；该判断由 VRender installer 承担。
4. 不要把业务 contribution 放进 VRender 默认 bootstrap。full/default 行为保持完整，但业务可选能力应由上层 profile 显式安装。
5. 业务方如果要替换内置 contribution，仍应使用稳定 token 的 `rebind(Token).to(CustomContribution)`；不要只追加同类型 contribution，否则内置 contribution 仍会参与绘制。

## 上层动态加载方式

如果上层希望把 optional 能力拆成异步 chunk，可以使用动态 import。推荐仍然保留一个统一入口：

```ts
import { registerAnimate } from '@visactor/vrender-animate/register';

type CustomAnimateCapability = 'basic' | 'richtext' | 'disappear' | 'story' | 'full';

export async function loadVRenderCustomAnimations(capabilities: readonly CustomAnimateCapability[]) {
  registerAnimate();

  if (capabilities.includes('full')) {
    const { registerCustomAnimate } = await import('@visactor/vrender-animate/custom/register');
    registerCustomAnimate();
    return;
  }

  await Promise.all(
    capabilities.map(async capability => {
      if (capability === 'basic') {
        const { registerBasicCustomAnimate } = await import('@visactor/vrender-animate/custom/register-basic');
        registerBasicCustomAnimate();
      } else if (capability === 'richtext') {
        const { registerRichTextCustomAnimate } = await import('@visactor/vrender-animate/custom/register-richtext');
        registerRichTextCustomAnimate();
      } else if (capability === 'disappear') {
        const { registerDisappearCustomAnimate } = await import('@visactor/vrender-animate/custom/register-disappear');
        registerDisappearCustomAnimate();
      } else if (capability === 'story') {
        const { registerStoryCustomAnimate } = await import('@visactor/vrender-animate/custom/register-story');
        registerStoryCustomAnimate();
      }
    })
  );
}
```

动态加载适合上层把能力绑定到明确的用户开关、图表类型或组件插件；不适合在每次动画执行或每个 mark 渲染时触发。

## 建议暴露给用户的配置语义

这不是当前 VChart / VTable 已发布 API，只是推荐形态。上层落地时应结合自身配置体系命名。

```ts
type VRenderCustomAnimationMode =
  | 'full'
  | 'auto'
  | false
  | Array<'basic' | 'richtext' | 'disappear' | 'story'>;

interface RenderRuntimeOptions {
  customAnimations?: VRenderCustomAnimationMode;
}
```

建议默认策略：

| 配置 | 行为 |
| --- | --- |
| 不配置 | 保持当前默认兼容行为，通常等价 `full` |
| `full` | 调用 `registerCustomAnimate()` |
| `auto` | 上层根据 chart spec / component 使用情况选择 `basic`、`richtext`、`disappear` 等能力 |
| `['basic']` | 只注册基础 custom animate，适合 line / bar / area 等常规动画 |
| `['basic', 'richtext']` | 在基础动画外额外支持 text / richtext 输入输出动画 |
| `['basic', 'disappear']` | 在基础动画外额外支持 disappear effects |
| `['basic', 'story']` | 在基础动画外额外支持 story effects、MotionPath、streamLight |
| `false` | 只保留基础 animation runtime，不注册 built-in custom animate type |

如果用户选择的模式没有注册某个 animation type，上层应把它视为配置/能力缺失，而不是让 VRender 静默回退到 full。这样用户才能理解“为什么体积变小”和“缺了什么能力”。

## 上层迁移步骤

1. 统计上层实际使用的 VRender built-in custom animate type。
2. 把 type 映射到 VRender capability group。
3. 默认保持现有 full 行为，新增 lite / auto / explicit list 作为用户可选模式。
4. 所有 import 来自 VRender public subpath；缺入口时先补 VRender，不在上层 deep import。
5. 对每种用户模式做 bundle stats：至少记录 raw/gzip、full vs selected capabilities、是否有 dynamic chunk。
6. 做功能 smoke：常规动画、richtext 动画、disappear effects、story effects、full 兼容各一条。

## 当前边界

- `register-richtext` 只解决 animate custom 的 text / richtext 动画注册；它不等于 core richtext 图元、renderer、picker 的 optional 化。
- component custom animate 还没有独立 public register；如果上层需要 poptip / label item 这类能力，目前仍应使用 full custom register，或先在 VRender 中补标准入口。
- VChart / VTable 具体用户配置尚未在本仓库落地；本文件定义的是 VRender 层已足够支持的接入模式。
