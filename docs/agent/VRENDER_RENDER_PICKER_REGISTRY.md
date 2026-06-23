# Renderer / Picker / Registry 装配机制

本文解释 renderer、picker、registry、contribution、plugin 如何被装配到 app-scoped runtime。

## Registry 类型

core registry 在 `packages/vrender-core/src/registry/`：

- `RendererRegistry`：`register(key, rendererOrFactory)`，`getAll()` 会实例化/缓存 renderer。
- `PickerRegistry`：`register(key, picker)`，`getAll()` 返回 picker。
- `ContributionRegistry`：按 key 存放 contribution 数组。
- `PluginRegistry`：按 plugin name 存放 plugin。

`AppContext` 为每个 app 创建自己的 registry：

```text
app.context.registry.renderer
app.context.registry.picker
app.context.registry.contribution
app.context.registry.plugin
```

## Renderer 注册链路

主要路径：

- renderer 实现：`packages/vrender-core/src/render/contributions/render/*-render.ts`
- renderer module：`packages/vrender-core/src/render/contributions/render/*-module.ts`
- binding symbol：`packages/vrender-core/src/render/contributions/render/symbol.ts`
- installer：`packages/vrender-kits/src/installers/graphics.ts`、`graphics-lite.ts`、`app.ts`
- runtime installer：`packages/vrender-core/src/entries/runtime-installer.ts`

链路：

```text
registerRectGraphic()
  -> bind rectModule into runtime installer binding context
  -> binding context has GraphicRender service
  -> installRuntimeGraphicRenderersToApp(app)
  -> app.registry.renderer.register(...)
  -> DrawContribution reads app renderer registry
```

full graphics installer 覆盖 full 图元集合；lite graphics installer 只覆盖 lite 集合。

## Picker 注册链路

主要路径：

- browser picker：`packages/vrender-kits/src/picker/contributions/canvas-picker/*`
- math picker：`packages/vrender-kits/src/picker/contributions/math-picker/*`
- picker service：`packages/vrender-kits/src/picker/canvas-picker-service.ts`、`math-picker-service.ts`
- installer：`packages/vrender-kits/src/installers/browser.ts`、`browser-lite.ts`、`app.ts`

browser 链路：

```text
installBrowserPickersToApp(app)
  -> bind*CanvasPickerContribution(...)
  -> bind DefaultCanvasPickerService
  -> installRuntimePickersToApp(app, CanvasPickerContribution)
  -> configureBrowserPickerFactory(app)
```

node/math 链路：

```text
installNodePickersToApp(app)
  -> loadMathPicker(...)
  -> installRuntimePickersToApp(app, MathPickerContribution)
  -> configureNodePickerFactory(app)
```

## Browser Picker / Math Picker / Node Picker

- Browser picker：依赖 canvas/context 能力，通常用于 browser env。
- Math picker：用几何计算，通常用于 node/miniapp/lynx/harmony 等非 browser canvas pick 场景。
- Node picker：当前 installer 中 `installNodePickersToApp` 等价于 math picker 路径。

改多端 entry 时，不能只确认 renderer；还要确认 picker service factory 和 picker contribution 是否与 env 匹配。

## Contribution Registry

Contribution 相关路径：

- `packages/vrender-core/src/common/contribution-provider.ts`
- `packages/vrender-core/src/registry/contribution-registry.ts`
- `packages/vrender-core/src/render/contributions/render/draw-interceptor.ts`
- `packages/vrender-core/src/picker/pick-interceptor.ts`

runtime installer 会把 legacy binding context 中的 draw contributions 刷到 app contribution registry。`AppContext.createStageDeps()` 会用 app contribution registry 创建 render service deps。

## App-Scoped Registry 与 Legacy Global Binding

当前仍有两条装配面：

- legacy binding：`getLegacyBindingContext()`、`preLoadAllModule()`、`modules.ts`、各 register 函数历史路径。
- app-scoped registry：`AppContext.registry` 和 `runtime-installer.ts`。

root package bootstrap 会做桥接：

- 先通过 installers 安装 app 级 runtime。
- 再调用 legacy graphic registrations。
- 再 `syncLegacyRenderersToApp` / `syncLegacyPickersToApp`，合并 legacy binding 与 app registry。

风险：改 legacy register 或 installer 时，必须确认 app-scoped 与 legacy 路径是否仍一致；不要只修其中一边。

## 缺 Binding 的定位方法

常见症状：图元存在但不渲染、不 pick，或运行时出现某类 renderer/picker 缺失。

排查顺序：

1. 图元 creator 是否注册：查 `graphicCreator.store` 相关 register 函数，例如 `registerRectGraphic`。
2. renderer module 是否绑定：查 `*-module.ts` 是否绑定 `GraphicRender`。
3. installer 是否覆盖该图元：full/lite 集合是否包含它。
4. app registry 是否安装：`installRuntimeGraphicRenderersToApp(app)` 是否执行。
5. legacy sync 是否覆盖：root package bootstrap 是否调用 `syncLegacyRenderersToApp` / `syncLegacyPickersToApp`。
6. picker 类型是否正确：browser 应走 `CanvasPickerContribution`，node/miniapp 多走 `MathPickerContribution`。

## 常见错误示例

缺 AreaRender：
- 查 `packages/vrender-core/src/render/contributions/render/area-module.ts`。
- 查 `packages/vrender-kits/src/installers/graphics.ts` 或 `graphics-lite.ts` 是否包含 `areaModule`。
- 查 entry 是否调用对应 graphics installer。

缺 CircleRender：
- 查 `circle-module.ts` 与 `register-circle.ts`。
- browser-lite 包含 circle；若仍缺，优先查 bootstrap 是否执行到 `installLiteGraphicsToApp` / `installStandardGraphicsToApp`。

缺 GlyphRender：
- 查 `glyph-module.ts` 与 `register-glyph.ts`。
- Glyph 还涉及 React host config 与 subGraphic，渲染缺失时同时查 Glyph 子图元注册。

Picker 命中异常：
- 查 `packages/vrender-kits/src/picker/contributions/common/*`。
- 查 browser/math picker 是否都存在对应图元 picker。
- 3D picker 兼容测试在 kits：`arc3d-picker-compat.test.ts`、`rect3d-picker-compat.test.ts`、`pyramid3d-picker-compat.test.ts`。

## Plugin Surface

插件路径：

- core service：`packages/vrender-core/src/plugins/plugin-service.ts`
- core type：`packages/vrender-core/src/plugins/types.ts`
- builtin：`packages/vrender-core/src/plugins/builtin-plugin/*`
- convenience register：`packages/vrender-core/src/plugin/3d.ts`、`plugin/attribute.ts`、`plugin/flex-layout.ts`

插件通过 `DefaultPluginService` 安装到 plugin registry，可在 `onRegister` 或 `onStartupFinished` 生命周期激活。Root bootstrap 默认注册 flex、3D view transform、HTML/React attribute、light/camera 等插件。

## 修改 Register / Installer / Picker 时的验证

最小验证建议：

- `cd packages/vrender-core && rushx test --runInBand __tests__/unit/registry/registry.test.ts`
- `cd packages/vrender-core && rushx test --runInBand __tests__/unit/render/render-registry-migration.test.ts`
- `cd packages/vrender-kits && rushx test --runInBand __tests__/unit/picker`
- `cd packages/vrender-kits && rushx test --runInBand __tests__/unit/register`
- `cd packages/vrender && rushx test --runInBand __tests__/unit/app-bootstrap-binding.test.ts`

如果改 browser/root entry，再加：

- `packages/vrender/__tests__/unit/shared-browser-entry.test.ts`
- `packages/vrender/__tests__/unit/shared-browser-lite-entry.test.ts`
- `packages/vrender/__tests__/unit/build-artifact-consistency.test.ts`
