# VRender Animate Architecture

`@visactor/vrender-animate` 负责 VRender 的动画运行时、custom animation、state animation 和 component animation。它不应重新定义 core 图元静态真值。

## Package 职责

路径：`packages/vrender-animate/src`

核心模块：

- `index.ts`：主导出，创建 `defaultTicker`，并把 `defaultTimeline` 加入 ticker。
- `register.ts`：`registerAnimate()`。
- `animate-extension.ts`：Graphic 动画扩展。
- `animate.ts`：`Animate` 链式动画。
- `step.ts`：`Step` 插值步。
- `timeline.ts`：`DefaultTimeline`。
- `ticker/default-ticker.ts`、`ticker/manual-ticker.ts`。
- `executor/animate-executor.ts`。
- `custom/*`。
- `state/*`。
- `component/*`。

## registerAnimate

`packages/vrender-animate/src/register.ts` 当前逻辑：

```text
mixin(Graphic, GraphicStateExtension)
mixin(Graphic, AnimateExtension)
```

`Graphic` 来自 `@visactor/vrender-core/graphic/base`。因此动画能力不是 core 构造期默认语义，而是通过 animate 包注册后挂到 Graphic prototype。

## Animate Extension 如何挂到 Graphic

`AnimateExtension` 提供：

- `animate(params?)`
- `createTimeline()`
- `createTicker(stage)`
- `setFinalAttributes(finalAttribute)`
- `initFinalAttributes(finalAttribute)`
- `initAnimateExecutor()`
- `applyFinalAttributeToAttribute()`
- `restoreStaticAttribute()`
- `executeAnimation(config)`
- `executeAnimations(configs)`
- `getGraphicAttribute(key, prev?)`
- `pauseAnimation` / `resumeAnimation` / `stopAnimation`

这些方法服务动画执行和最终目标读取；它们不改变 D3 静态真值边界。

## Animate / Step / Timeline / Ticker / Executor

- `Animate`：链式动画对象，bind target，管理 steps、callbacks、start/end props、timeline 挂载。
- `Step`：单段属性/自定义动画步，负责 easing、propKeys、onBind/onUpdate/onEnd。
- `DefaultTimeline`：持有 animate 集合，按时间推进并发出 animationEnd。
- `DefaultTicker`：自动 ticker；`ManualTicker` 用于测试或外部驱动。
- `AnimateExecutor`：把上层 `IAnimationConfig` 解析成 oneByOne、timeline、channel/custom animation，并跟踪活跃 animate。

典型链路：

```text
graphic.animate()
  -> new Animate(...)
  -> animate.bind(graphic)
  -> stage.ticker.start()
  -> timeline.tick(...)
  -> Step.update(...)
  -> transient frame attributes
```

## State Animation 与 `graphic.setStates`

`GraphicStateExtension` 在 `state/graphic-extension.ts` 中只负责动画状态编排：

- `applyAnimationState`
- `applyAppearState`
- `applyDisappearState`
- `applyUpdateState`
- highlight/select/hover 等动画状态 helper
- animate tracking

它“不参与 graphic 状态语义、样式解析或属性分类”。状态解析仍在 core 的 `StateEngine` 和 `Graphic.useStates` 路径。

关键约束：

- `graphic.setStates` / `useStates` 负责状态集合与 resolved patch。
- state animation 负责从旧 patch/属性过渡到新 patch/属性。
- 动画过程中不应把帧属性写成新的 `baseAttributes`。

测试：`packages/vrender-animate/__tests__/unit/animation-runtime-attribute.test.ts`、`graphic-state-extension.test.ts`。

## Custom Animation

custom animation 相关路径：

- `custom/custom-animate.ts`：`ACustomAnimate`、`AComponentAnimate`、`AStageAnimate`。
- `custom/register.ts`：注册内置 custom animation。
- `custom/fade.ts`、`grow*`、`scale.ts`、`rotate.ts`、`move.ts`、`tag-points.ts`、`update.ts`、`morphing.ts`、`clip*`、`disappear/*`、`richtext/*`。

分类：

- 普通图元属性 custom animation：fade、grow、scale、rotate、move 等。
- update target animation：`custom/update.ts`、`tag-points.ts`。
- stage 级效果：`AStageAnimate` 及 disappear 图像处理类。
- richtext/text 输入输出类动画。
- component animation：见 `component/*`。

## Component Animation

路径：

- `component/component-animator.ts`
- `component/component-animate-extension.ts`
- `component/index.ts`

components 包通过 `packages/vrender-components/src/animation/*` 使用 animate 能力，例如 axis、label、marker、component update/exit 动画。组件层的静态目标提交辅助在 `packages/vrender-components/src/animation/static-truth.ts`。

## 已确认能力：`scaleIn` 起点配置

`packages/vrender-animate/src/custom/scale.ts` 的 `IScaleAnimationOptions` 支持：

- `fromScale`
- `fromScaleX`
- `fromScaleY`
- `options.direction`
- `options.fromScale` / `fromScaleX` / `fromScaleY`

`ScaleIn.onBind()` 会从 `target.getFinalAttribute()` 读取目标值，从当前 `attribute` 或显式 fromScale 配置确定起点，并用 transient helpers 写动画帧。

## 自定义 Animate Target 的标准方法要求

标准 VRender Graphic 在 `registerAnimate()` 后拥有 animate extension。自定义 target 如果绕开 Graphic，需要至少核对它是否实现当前 animate/custom 路径实际调用的方法：

- `attribute`
- `stage` / `stage.ticker`
- `animate()` 或被 `Animate.bind()` 支持
- `setAttributes()` / `setAttribute()`
- `setAttributesAndPreventAnimate()`
- `getFinalAttribute()`
- `setFinalAttributes()` / `initFinalAttributes()`
- `applyFinalAttributeToAttribute()`
- `restoreStaticAttribute()`
- `addUpdateBoundTag()` / `addUpdatePositionTag()`
- lifecycle callbacks：`onBind`、`onUpdate`、`onEnd` 由 Step/custom animate 自身提供

不确定时直接用真实 Graphic 或补 targeted tests；不要为非标准 target 在热路径恢复旧 fallback。

## 删除/收紧的旧 fallback

当前 D3 删除留档记录了旧 fallback：

- `target.animates` map fallback。
- `onStop(props)` 旧签名。
- 可选 transient/static truth 方法 fallback。

当前代码事实：

- 生产代码没有再搜索到 `target.animates` fallback 访问。
- `AnimationStateManager` 仍会把 tracked animates map 暴露到 `(graphic as any).animates`，这是跟踪兼容表象；标准路径是 `trackAnimate`、`getTrackedAnimates`、`forEachTrackedAnimate`。
- custom animate 标准生命周期是 `onBind` / `onUpdate` / `onEnd`，不要写回 `onStop(props)` 旧约定。

## 常见测试位置

- `packages/vrender-animate/__tests__/unit/ticker.test.ts`
- `packages/vrender-animate/__tests__/unit/timeline.test.ts`
- `packages/vrender-animate/__tests__/unit/animate-extension-closeout.test.ts`
- `packages/vrender-animate/__tests__/unit/animate-tracking.test.ts`
- `packages/vrender-animate/__tests__/unit/animation-runtime-attribute.test.ts`
- `packages/vrender-animate/__tests__/unit/custom-appear-static-truth.test.ts`
- `packages/vrender-animate/__tests__/unit/custom-animate-null-props.test.ts`
- `packages/vrender-animate/__tests__/perf/animation-frame-performance.test.ts`

## 高风险点

- state animation 与 core `resolvedStatePatch` 对齐。
- sibling update animation 的 attr ownership，避免互相提前提交对方属性。
- `animate().to()` 不能被当作提交 `baseAttributes` 的 API。
- `appear/fade` 推荐先写最终静态属性，再用 `animate().from(...)` 表示起始帧。
- 自定义 target 不完整时不要恢复旧 fallback；优先补标准 target 方法或限制调用边界。
