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
