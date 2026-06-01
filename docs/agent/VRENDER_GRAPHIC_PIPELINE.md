# VRender Graphic Pipeline

本文按图元生命周期梳理：创建 -> 属性 -> bounds -> render -> picker -> state/shared-state -> animation -> attach/detach/release。

## Graphic Class 体系

核心图元类在 `packages/vrender-core/src/graphic/`：

- 基类：`graphic/graphic.ts`，导出桥接：`graphic/base.ts`。
- 容器：`graphic/group.ts`。
- 特殊容器：`graphic/glyph.ts`、`graphic/shadow-root.ts`。
- 具体图元：`arc.ts`、`area.ts`、`circle.ts`、`image.ts`、`line.ts`、`path.ts`、`polygon.ts`、`pyramid3d.ts`、`rect.ts`、`rect3d.ts`、`richtext.ts`、`star.ts`、`symbol.ts`、`text.ts`、`wrap-text.ts`、`arc3d.ts`。
- 类型：`interface/graphic/*`。

`gif image` 不在 core 图元目录，归属 `packages/vrender-kits/src/graphic/gif-image.ts`，通过 `register/register-gif.ts` 装配。

## Creator / Register

创建入口：

- `graphic/creator.ts` 导出 `createRect`、`createGroup`、`createText`、`createGlyph`、`createShadowRoot` 等直接 creator。
- `graphic/graphic-creator.ts` 提供 `graphicCreator`、`registerGraphic`、`createGraphic(name, attrs)`。
- `register/register-*.ts` 把图元 creator 注册到 `graphicCreator` / `GraphicFactory`。

典型链路：

```text
registerRectGraphic()
  -> registerGraphic('rect', createRect)
  -> graphicCreator.rect(attrs)
  -> new Rect(attrs)
```

React 绑定也走这条链：`packages/react-vrender/src/hostConfig.ts` 根据 JSX type 调用 `graphicCreator[graphicType](graphicProps)`，Glyph 和 ShadowRoot 有特殊分支。

## Attribute 与 BaseAttributes

关键属性概念：

- `attribute`：当前生效属性，render/picker/bounds 读取它。
- `baseAttributes`：静态真值。`graphic/graphic.ts` 中 `_baseAttributes` 不存在时回落到 `attribute`。
- `resolvedStatePatch`：当前状态解析出的 patch。
- `normalAttrs`：兼容 alias/view，getter 返回 `baseAttributes`，不是旧 snapshot。

D3 主路径：

```text
baseAttributes + resolvedStatePatch -> attribute
```

动画帧只应写入运行时帧属性，不应成为新的静态真值。

## Bounds 更新

相关路径：

- `graphic/bounds.ts`
- 各具体图元的 `doUpdateAABBBounds` / bounds 方法
- `common/bounds-context.ts`
- `graphic/graphic-service/graphic-service.ts`

典型链路：

```text
setAttribute / setAttributes
  -> addUpdateBoundTag / addUpdatePositionTag
  -> graphicService / bounds context
  -> AABBBounds 更新
```

改动风险：

- bounds 是 render、picker、layout 和 dirty bounds 的共同基础。
- 不要在每帧 bounds 更新中增加重对象分配或深遍历。
- 文本、richtext、image、3D 图元的 bounds 依赖额外测量/资源状态，需 targeted 验证。

## Render 更新

相关路径：

- renderer 实现：`render/contributions/render/*-render.ts`
- renderer module：`render/contributions/render/*-module.ts`
- draw dispatch：`render/contributions/render/draw-contribution.ts`
- app-scoped renderer registry：`registry/renderer-registry.ts`

典型链路：

```text
Stage.render()
  -> Layer.render()
  -> RenderService / DrawContribution
  -> renderer registry / legacy GraphicRender
  -> DefaultCanvas*Render.draw()
```

缺 renderer binding 时，优先查：

1. 对应 `register/register-*` 是否被调用。
2. `installStandardGraphicsToApp` / `installLiteGraphicsToApp` 是否覆盖该图元。
3. `installRuntimeGraphicRenderersToApp(app)` 后 app registry 是否包含 renderer。

## Picker / Hit Test

相关路径：

- core picker service：`packages/vrender-core/src/picker/*`
- kits browser picker：`packages/vrender-kits/src/picker/contributions/canvas-picker/*`
- kits math picker：`packages/vrender-kits/src/picker/contributions/math-picker/*`

browser 默认走 canvas picker；node/miniapp 等默认多走 math picker。picker 会先用 bounds 快速过滤，再调用具体 picker 的 contains。

## State / Shared-State

相关路径：

- `graphic/state/state-engine.ts`
- `graphic/state/state-definition-compiler.ts`
- `graphic/state/shared-state-scope.ts`
- `graphic/state/shared-state-refresh.ts`
- `graphic/group.ts`
- `core/stage.ts`

当前事实：

- 本地图元状态由 `graphic.states` 定义，未绑定 shared scope 时可独立生效。
- Group-first shared state 由 `group.sharedStateDefinitions` 创建/更新 `sharedStateScope`。
- Stage 可持有 `rootSharedStateScope`，theme state definitions 可进入 root scope。
- 图元绑定 shared scope 后，effective compiled definitions 来自 scope，不从本地图元 `states` 做 missing-state fallback。
- Glyph 保留 `glyphStates` / `glyphStateProxy` 专属语义，不纳入 shared-state 主路径。

测试入口：

- `packages/vrender-core/__tests__/unit/graphic/state-engine.test.ts`
- `packages/vrender-core/__tests__/unit/graphic/state-definition-compiler.test.ts`
- `packages/vrender-core/__tests__/unit/graphic/shared-state-fallback.test.ts`
- `packages/vrender-core/__tests__/unit/graphic/shared-state-refresh.test.ts`
- `packages/vrender-core/__tests__/unit/graphic/glyph-state.test.ts`

## Animation Extension

动画扩展来自 `@visactor/vrender-animate`：

- `packages/vrender-animate/src/register.ts` 用 mixin 把 `GraphicStateExtension` 和 `AnimateExtension` 混入 `Graphic`。
- `AnimateExtension` 提供 `animate()`、`setFinalAttributes()`、`initFinalAttributes()`、`applyFinalAttributeToAttribute()`、`restoreStaticAttribute()`、`executeAnimation()`。
- `GraphicStateExtension` 提供动画状态执行与 animate tracking。

图元文档中只需记住边界：动画可以临时驱动 `attribute`，但静态真值仍属于 core 的 `baseAttributes` 与状态 patch。

## Scenegraph Attach / Detach / Release

相关路径：

- 树结构：`graphic/node-tree.ts`
- `Graphic` attach/detach：`graphic/graphic.ts`
- 容器：`graphic/group.ts`
- Stage/Layer：`core/stage.ts`、`core/layer.ts`

典型边界：

- `appendChild` / `removeChild` 改变 parent/stage 关系，也会影响 shared-state scope 绑定。
- `setStage(null)`、detach、reparent、release 都可能触发状态、动画、dirty bounds、event 解绑边界。
- `AppContext.release()` 会释放它跟踪的 stage，并清空 app registry/plugin。

## 特殊边界

Group：
- 是普通容器，也是 shared-state ownership 主入口。
- 关注 `sharedStateDefinitions`、`sharedStateScope`、children attach/detach 时 scope parent 刷新。

Glyph：
- 使用 `setSubGraphic` / `getSubGraphic` 管理子图元。
- `glyphStates` / `glyphStateProxy` 只作用 Glyph 专属状态语义；D3 shared-state 不重新定义子图元 ownership。

ShadowRoot：
- 主要服务 HTML / React overlay 场景。
- React host config 中 Stage 不能直接 attach shadow root，普通 graphic 通过 `attachShadow` / `detachShadow`。

## 主要图元清单

- `group`：`graphic/group.ts`
- `rect`：`graphic/rect.ts`
- `line`：`graphic/line.ts`
- `area`：`graphic/area.ts`
- `symbol`：`graphic/symbol.ts`
- `circle`：`graphic/circle.ts`
- `arc`：`graphic/arc.ts`
- `path`：`graphic/path.ts`
- `polygon`：`graphic/polygon.ts`
- `star`：`graphic/star.ts`
- `image`：`graphic/image.ts`
- `gif image`：`vrender-kits/src/graphic/gif-image.ts`
- `text`：`graphic/text.ts`
- `wrapText`：`graphic/wrap-text.ts`
- `richtext`：`graphic/richtext.ts` 与 `graphic/richtext/*`
- `glyph`：`graphic/glyph.ts`
- `shadowRoot`：`graphic/shadow-root.ts`
- 3D：`graphic/arc3d.ts`、`graphic/rect3d.ts`、`graphic/pyramid3d.ts`

## 图元相关测试位置

- core unit：`packages/vrender-core/__tests__/unit/graphic/*`
- core perf：`packages/vrender-core/__tests__/perf/attribute-model-performance.test.ts`
- root package graphic：`packages/vrender/__tests__/graphic/*`
- browser smoke/pages：`packages/vrender/__tests__/browser/src/pages/*`、`packages/vrender-core/__tests__/browser/src/render/*`

## 待验证点

- 某些历史文档仍提到 shared scope missing-state fallback warning；当前代码和 `shared-state-fallback.test.ts` 表明 shared scope 下本地图元 states 被忽略。遇到冲突时以当前代码/测试为准，并记录历史文档可能过期。
- `gif` / `lottie` 属于 kits 扩展图元，是否进入默认装配取决于具体 installer/entry。
