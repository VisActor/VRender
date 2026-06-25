# VRender Core Architecture

本文解释 `packages/vrender-core/src` 的当前模块边界。涉及 1.1 状态系统时，以当前代码和测试为事实基础，同时参考 `docs/refactor/state-engine/`。

## 当前状态语义

当前状态系统已经完成 1.1 收敛。后续改动必须保留以下主语义：

- 静态真值主路径是 `baseAttributes + resolvedStatePatch -> attribute`。
- 动画不是新的真值源。
- `normalAttrs` 只保留兼容外观；在 `packages/vrender-core/src/graphic/graphic.ts` 中 getter 返回 `baseAttributes`，不是旧 snapshot/restore 主路径。
- `stateProxy` 已从普通 Graphic 和 React props 删除；当前 `rg "stateProxy"` 在 `packages/*/src` 中无普通接口命中，仅 `glyphStateProxy` 作为 Glyph 专属 surface 保留。
- shared-state 采用 Group-first ownership。`Group.sharedStateDefinitions` 绑定 `SharedStateScope`，图元进入 shared scope 后使用 scope 的 effective definitions；当前 `shared-state-fallback.test.ts` 锁定“shared scope 下忽略同名/缺失本地图元 states fallback”。

## application / app

- 职责：运行时服务总线和 app-scoped context。
- 主要路径：`application.ts`、`entries/app-context.ts`、`entries/types.ts`、`entries/browser.ts`、`entries/node.ts`、`entries/miniapp.ts`。
- surface：`application` 全局服务指针、`AppContext` 的 `registry` / `factory` / `createStage` / `release`。
- 调用链：`createBrowserApp()` -> `new BrowserEntry()` -> `new AppContext()` -> `app.createStage()` -> `StageFactory.create()`。
- 测试：`packages/vrender-core/__tests__/unit/entries/app-context.test.ts`、`entry.test.ts`、`runtime-installer.test.ts`。
- 风险：`application` 仍是全局对象；app-scoped runtime 通过 registry/factory 收口，但不是完全 per-env 隔离承诺。

## core / stage / layer

- 职责：Stage/Layer 生命周期、树根、渲染调度、事件系统、3D options、root shared-state scope。
- 主要路径：`core/stage.ts`、`core/layer.ts`、`core/layer-service.ts`、`factory/stage-factory.ts`、`factory/layer-factory.ts`。
- surface：`IStage`、`ILayer`、`StageFactory`、`LayerFactory`。
- 调用链：`app.createStage()` -> `StageFactory` -> `Stage` -> `defaultLayer` / `layerService` / `renderService` / `pluginService` / `eventSystem`。
- 测试：`packages/vrender-core/__tests__/unit/core/*`、`packages/vrender/__tests__/core/*`、browser stage pages。
- 风险：Stage/Layer 是跨模块汇合点；改 release / detach / resize / render 会影响 render、event、plugin、shared-state。

## graphic

- 职责：图元基类、具体图元、树结构、属性模型、bounds、状态引擎入口、creator/register。
- 主要路径：`graphic/graphic.ts`、`graphic/base.ts`、`graphic/group.ts`、`graphic/glyph.ts`、`graphic/shadow-root.ts`、`graphic/creator.ts`、`graphic/graphic-creator.ts`、`graphic/state/*`、`register/register-*.ts`。
- surface：`Graphic`、`createRect`/`createGroup`/`createText` 等 creator、`graphicCreator`、`registerGraphic`、`StateEngine`、`StateDefinitionCompiler`。
- 调用链：register 函数注册 graphic creator -> `graphicCreator.rect(attrs)` 或 `createGraphic('rect', attrs)` -> `Graphic` 属性/状态/bounds lifecycle -> render/picker。
- 测试：`packages/vrender-core/__tests__/unit/graphic/*`，尤其 `attribute-layer-core.test.ts`、`state-engine.test.ts`、`normal-attrs.test.ts`、`shared-state-*.test.ts`、`glyph-state.test.ts`。
- 风险：高频路径。不要为不标准调用方式在 `setAttribute`、bounds、render 热路径增加重 clone / 深遍历 / 多层 fallback。

## render

- 职责：图元绘制服务、draw contribution、具体 canvas renderer、incremental render。
- 主要路径：`render/render-service.ts`、`render/render-modules.ts`、`render/contributions/render/*-render.ts`、`render/contributions/render/*-module.ts`、`render/contributions/render/draw-contribution.ts`。
- surface：`IGraphicRender`、`GraphicRender` symbol、`DefaultRenderService`、各 `*Module`。
- 调用链：`Stage.render()` -> `Layer.render()` -> `RenderService` / `DrawContribution` -> app renderer registry 或 legacy `GraphicRender` binding -> `DefaultCanvas*Render.draw()`。
- 测试：`packages/vrender-core/__tests__/unit/render/render-registry-migration.test.ts`、browser render pages。
- 风险：缺 renderer binding 会导致图元无法绘制；Area/Circle/Glyph 等 binding 问题通常先查 register/installer/registry。

## picker

- 职责：hit test / pick service 的核心接口和服务抽象。
- 主要路径：`picker/picker-service.ts`、`picker/global-picker-service.ts`、`picker/pick-modules.ts`、`picker/pick-interceptor.ts`、`picker/constants.ts`。
- surface：`IPickerService`、`IGraphicPicker`、`PickerService`、`PickItemInterceptor`、`PickServiceInterceptor`。
- 调用链：event manager 收到 pointer/mouse 事件 -> picker service -> app picker registry 或 legacy picker contribution -> 命中 graphic。
- 测试：`packages/vrender-core/__tests__/unit/picker/*`、`packages/vrender-kits/__tests__/unit/picker/*`。
- 风险：browser picker 与 math picker 装配不同；多端 entries 改动要确认 picker service factory。

## event

- 职责：事件常量、事件系统、事件管理、事件目标。
- 主要路径：`event/event-system.ts`、`event/event-manager.ts`、`event/event-target.ts`、`event/public-constant.ts`。
- surface：VRender event names、`addEventListener`/`removeEventListener`、federated event types。
- 调用链：window/canvas event -> `EventSystem` -> `EventManager` -> picker -> dispatch 到 graphic。
- 测试：`packages/vrender-core/__tests__/unit/common/event-listener-manager.test.ts`、`packages/vrender/__tests__/event/event-manager.test.ts`、browser interactive pages。
- 风险：事件与 picker 强耦合；拖拽/手势扩展在 kits。

## common

- 职责：通用几何、矩阵、文本、路径、diff、contribution provider、explicit binding、性能 raf、工具函数。
- 主要路径：`common/*`，无单一 `index.ts`；顶层 `index.ts` 汇总部分 public surface。
- surface：`common/text`、`common/path-svg`、`common/contribution-provider`、`common/explicit-binding`、`common/diff` 等。
- 测试：`packages/vrender-core/__tests__/unit/common/*`。
- 风险：被多个包复用；修改工具函数要找所有调用点，不要只按单个图元测试判断。

## color-string

- 职责：颜色解析、转换和插值。
- 主要路径：`color-string/index.ts`、`color-string/store.ts`、`color-string/interpolate.ts`、`color-string/colorName.ts`。
- surface：`@visactor/vrender-core/color-string` subpath export。
- 测试：`packages/vrender/__tests__/common/color.test.ts` 和 core common 相关测试。
- 风险：动画、样式插值、颜色字符串兼容都可能受影响。

## path / svg / text

- path：`path.ts`、`interface/path.ts`、`common/custom-path2d.ts`、`common/segment/*`。负责路径命令、曲线和几何分解。
- svg：`svg.ts`、`common/path-svg.ts`、`common/xml/*`。负责 svg/path 字符串解析相关能力。
- text：`text.ts`、`common/text.ts`、`graphic/text.ts`、`graphic/wrap-text.ts`、`graphic/richtext/*`。负责文本测量、布局和文本类图元。
- 测试：`common/path-svg.test.ts`、`common/text.test.ts`、`graphic/wrap-text.test.ts`、richtext editor 测试。
- 风险：部分 segment/curve 方法存在“暂不支持”分支；被外部路径工具链直接依赖时要 targeted 验证。

## plugin

- 职责：插件类型、插件服务、内置插件注册。
- 主要路径：`plugins/plugin-service.ts`、`plugins/types.ts`、`plugins/constants.ts`、`plugins/builtin-plugin/*`、便捷导出 `plugin/3d.ts`、`plugin/attribute.ts`、`plugin/flex-layout.ts`。
- surface：`IPlugin`、`DefaultPluginService`、`AutoEnablePlugins`、各 register plugin 函数。
- 调用链：Stage 创建/启动 plugin service -> `active(stage, { pluginList })` -> auto-enable plugin -> hooks。
- 测试：`packages/vrender-core/__tests__/unit/plugins/*`，以及 entries bootstrap tests。
- 风险：plugin registry 既有 app-scoped registry，也有 legacy auto-enable binding；改 bootstrap 要同时确认。

## registry

- 职责：app-scoped renderer/picker/contribution/plugin registry。
- 主要路径：`registry/renderer-registry.ts`、`registry/picker-registry.ts`、`registry/contribution-registry.ts`、`registry/plugin-registry.ts`。
- surface：`RendererRegistry`、`PickerRegistry`、`ContributionRegistry`、`PluginRegistry`。
- 调用链：runtime installer 从 legacy binding context 读取 renderers/pickers/contributions -> 写入 app registry -> render/picker service 通过 app registry 读取。
- 测试：`packages/vrender-core/__tests__/unit/registry/registry.test.ts`、render/picker migration tests。
- 风险：clear/register 顺序会影响 shared app 和 legacy sync；缺 binding 时优先查 app registry 是否安装完整。

## entries

- 职责：core app entry、app context、runtime installer。
- 主要路径：`entries/browser.ts`、`entries/node.ts`、`entries/miniapp.ts`、`entries/app-context.ts`、`entries/runtime-installer.ts`、`entries/types.ts`。
- surface：`createBrowserApp`、`createNodeApp`、`createMiniappApp`、`configureRuntimeApplicationForApp`、`installRuntimeGraphicRenderersToApp`、`installRuntimePickersToApp`。
- 测试：`packages/vrender-core/__tests__/unit/entries/*`、`packages/vrender/__tests__/unit/*entry*.test.ts`。
- 风险：core entries 只创建 app/context，不负责 root 包默认全量装配；默认装配在 `@visactor/vrender` 和 kits installers。

## interface / container / contribution

- 职责：类型契约、legacy DI 容器、contribution provider。
- 主要路径：`interface/*`、`container.ts`、`common/contribution-provider.ts`、`common/explicit-binding.ts`、`legacy/binding-context.ts`。
- surface：`IStage`、`IGraphic`、`IRenderService`、`IGraphicPicker`、`IContributionProvider`、legacy bind context。
- 测试：`packages/vrender-core/__tests__/unit/modules/*`、public subpath exports tests。
- 风险：类型和 binding symbol 改名会影响 kits、animate、components、root package。先查 package exports，再改实现。
