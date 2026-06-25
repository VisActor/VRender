# VRender app-scoped renderer contribution 接入说明

本文面向 VTable / VChart 等上层接入方，说明 renderer contribution 在 app-scoped runtime 下的统一使用方式。

## 背景

VRender 当前重构后不再依赖 Inversify 的 constructor 注入。所有 `GraphicRender` 实例都由 VRender runtime installer 通过显式 factory 创建，再注册到 app-scoped renderer registry。

这意味着 renderer contribution 的可用性不再取决于旧全局 container 是否能自动注入构造参数，而取决于 renderer module 是否显式把对应 `IContributionProvider<...RenderContribution>` 传给 renderer。

## 本次收敛

renderer module 现在统一为一种结构：

```ts
bind(DefaultCanvasXRender)
  .toDynamicValue(() => new DefaultCanvasXRender(/* explicit deps */))
  .inSingletonScope();
bind(XRender).toService(DefaultCanvasXRender);
bind(GraphicRender).toService(XRender);
```

需要 render contribution provider 的 renderer 会在 factory 中显式传入：

```ts
new DefaultCanvasImageRender(createContributionProvider(ImageRenderContribution, container));
```

没有 provider 的 renderer 也使用 factory，而不是 `.to(DefaultCanvasXRender)` 或 `.toSelf()`，避免后续新增构造依赖时再次出现静默丢失。

incremental renderer 不再作为普通 graphic renderer module 的独立裸 binding 入口。incremental draw 需要的 line / area renderer 由 incremental draw factory 显式创建。

## 上层统一使用方式

上层应统一使用 app-scoped entry 创建 app / stage，例如：

- `createBrowserVRenderApp()`
- `createNodeVRenderApp()`
- `acquireSharedVRenderApp()`
- `acquireSharedBrowserLiteVRenderApp()`

不要依赖旧全局 `createStage()` 作为新功能接入入口。

上层如果需要注册 `ImageRenderContribution`、`TextRenderContribution` 等 graphic renderer contribution，应通过 `@visactor/vrender/entries/runtime-contribution` 的 `installRuntimeContributionModule()` 安装 module。该入口会把 module 记录到 runtime binding context，并按 `targets` 刷新 app-scoped renderer / draw contribution / picker registry；未传 `app` 时会覆盖后续 App 创建，并刷新已经存在的 shared App，已有明确 App 时应显式传入 `app`。

示例：

```ts
import { installRuntimeContributionModule } from '@visactor/vrender/entries/runtime-contribution';
import { CanvasPickerContribution } from '@visactor/vrender-kits/picker/contributions/constants';
import { ImageRenderContribution, TextRenderContribution } from '@visactor/vrender-core';

const customContributionModule = ({ bind }) => {
  bind(ImageRenderContribution).toService(BeforeImageRenderContribution);
  bind(TextRenderContribution).toService(AfterTextRenderContribution);
};

installRuntimeContributionModule(customContributionModule, {
  targets: ['graphic-renderer', 'draw-contribution', { picker: CanvasPickerContribution }]
});

installRuntimeContributionModule(customContributionModule, {
  app,
  targets: ['graphic-renderer', 'draw-contribution', { picker: CanvasPickerContribution }]
});
```

不要把 `GraphicRenderContribution` 注册到 `app.context.registry.contribution` 并期待普通 renderer 自动消费。`app.context.registry.contribution` 当前用于 app-scoped draw interceptor 这类 app registry 扩展点，例如 `DrawItemInterceptor`。

如果上层需要替换 VRender 内置 render contribution，应在 module 中对内置 contribution token 使用 `rebind(...)`，并通过 `installRuntimeContributionModule()` 安装。installer 会在默认 bootstrap 之后刷新 contribution provider，并在传入 `app` 时重装该 app 的目标 registry，避免已创建 shared app 继续持有旧 provider。

## 边界

- `GraphicRenderContribution`：由对应 renderer constructor 的 `IContributionProvider` 消费。
- `DrawItemInterceptor`：由 app-scoped draw contribution 从 `app.context.registry.contribution` 消费。
- picker contribution：由 picker installer / picker registry provider 消费。
- auto-enable plugin：由 plugin service provider 消费。

这些扩展点生命周期不同，不应混用入口。

## 上层影响

本次修复后，app-scoped stage 下 image/text 等 renderer 会重新消费上层已经注册的 render contribution。VTable 这类通过 ImageRenderContribution / TextRenderContribution 扩展 image/text 绘制行为的调用方，不需要把逻辑迁移到 `IPlugin.install(context)` 或 `app.context.registry.contribution`。

最终建议：

1. 使用 app-scoped VRender entry 创建 stage。
2. renderer 绘制扩展注册到对应 `...RenderContribution` token，并通过 `installRuntimeContributionModule()` 安装。
3. draw interceptor / picker / plugin 按各自 app-scoped installer 的扩展点注册。
4. 不直接 new 或覆盖 `DefaultCanvas*Render` 实例来补 contribution。
