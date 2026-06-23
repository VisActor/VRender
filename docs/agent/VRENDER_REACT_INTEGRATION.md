# VRender React Integration

本文解释 `@visactor/react-vrender` 与 `@visactor/react-vrender-utils`。React 包是绑定层，不应承载 core 图元状态、shared-state 或动画静态真值语义。

## `react-vrender` 职责

路径：`packages/react-vrender/src`

入口：`index.ts` 导出：

- `host-elements`
- `Stage`
- `hostConfig`

主要文件：

- `Stage.tsx`：React 容器组件，创建/释放 VRender app 和 stage。
- `hostConfig.ts`：React reconciler host config。
- `host-elements.ts`：React element factory 与类型。
- `processProps.ts`：props 分流、事件绑定、属性更新。
- `types.ts`：host config 类型。

## `react-vrender-utils` 职责

路径：`packages/react-vrender-utils/src`

当前主要导出：

- `Html.tsx`：通过 `@visactor/react-vrender` 的 `ShadowRoot` 在 VRender stage 容器中挂载 React DOM overlay，并在 stage `beforeRender` hook 中同步 transform。

它是辅助层，不应修改 React reconciler 主行为。

## JSX / React Props 到 Graphic 的映射

element 定义：`host-elements.ts`

已定义标签包括：

- `Layer`
- `Arc`
- `Area`
- `Circle`
- `Group`
- `Image`
- `Line`
- `Path`
- `Rect`
- `Rect3d`
- `VRenderSymbol`
- `Text`
- `RichText`
- `Polygon`
- `Glyph`
- `ShadowRoot`

创建链路：`hostConfig.createInstance()`

```text
type.toLowerCase()
  -> glyph: createGlyph(graphicProps)
  -> layer: stage.createLayer()
  -> shadowroot: createShadowRoot()
  -> default: graphicCreator[graphicType](graphicProps)
```

`processProps.splitProps()` 会把 `REACT_TO_CANOPUS_EVENTS` 中的 `on*` prop 分到 eventProps，其余作为 graphicProps。

更新链路：

```text
commitUpdate()
  -> updateProps(instance, newProps, oldProps)
  -> changed event: removeEventListener / addEventListener
  -> changed attr: setAttribute(key, undefined) then setAttribute(key, value)
```

当前实现中 wheel 事件 prop 名为 `onWeel` 映射到 `wheel`。这是当前代码事实，是否应新增 `onWheel` 需要另行评估兼容性。

## Stage 生命周期

`Stage.tsx` 当前 mount 流程：

```text
createBrowserVRenderApp()
  -> app.createStage({ autoRender: true, container: divRef.current, ... })
  -> optional stage.set3dOptions(stage3dOptions)
  -> reconcilor.createContainer(stage, ...)
  -> updateContainer(children)
```

cleanup 流程：

```text
updateContainer(null)
stage.release()
app.release()
```

prop 更新：

- `viewBox`：首次 mount 后变更时调用 `stage.setViewBox(...)`。
- `dpr`：首次 mount 后变更时调用 `stage.setDpr(...)`。
- `width/height`：首次 mount 后变更时调用 `stage.resize(...)`。
- `children`：通过 `reconcilor.updateContainer(children, fiberRoot, null)` 更新。

## Host Config / Reconciler

`hostConfig.ts` 使用 `react-reconciler`：

- `supportsMutation: true`
- `supportsPersistence: false`
- `supportsHydration: false`
- `appendChild` / `insertBefore` / `removeChild` 映射到 VRender scenegraph。

特殊逻辑：

- Stage 的非 Layer 子节点默认进入 `stage.defaultLayer`。
- Glyph 子节点进入 `setSubGraphic`。
- ShadowRoot 不能直接挂到 Stage；普通 graphic 通过 `attachShadow` / `detachShadow`。
- Text instance 使用 `createText({ text })`，但当前 `commitTextUpdate` 是 no-op。

## State / Animation / Event 注意点

state：

- React 层当前没有普通 `stateProxy` prop。`rg "stateProxy"` 在 `react-vrender` 和 `react-vrender-utils` 中无命中。
- 状态对象若作为 prop 传入，本质上仍是普通 graphicProps，最终由 core `setAttribute`/状态 API 处理。
- 不要在 React 层恢复 `stateProxy` 或维护 core 状态 patch。

animation：

- React 层不封装动画编排。
- 动画能力来自 `@visactor/vrender` 聚合出的 animate extension。
- React 只负责 props 更新和 scenegraph 生命周期；动画静态真值问题回到 core/animate。

event：

- 事件名映射在 `processProps.ts`。
- 只有 prop 值是函数时才绑定事件。
- 变更事件 handler 会先 remove old，再 add new。

## 已删除 React `stateProxy` Prop

D3 删除留档要求 JSX / React `stateProxy` prop 迁移到 `states` prop。当前 React 包没有 `stateProxy` surface。

如果上层仓库仍搜索到 React `stateProxy`：

```bash
rg "stateProxy" packages src
```

迁移方向应是 core 支持的 `states` / `StateDefinition.resolver` / `sharedStateDefinitions`，不要在 React host config 里做兼容 fallback。

## 测试

React 包：

- `packages/react-vrender/__tests__/unit/Stage.test.tsx`
- `packages/react-vrender/__tests__/unit/hostConfig.test.ts`
- `packages/react-vrender/__tests__/unit/processProps.updateProps.test.ts`
- `packages/react-vrender/__tests__/unit/host-elements.test.ts`
- `packages/react-vrender/__tests__/unit/util/*`

React utils：

- `packages/react-vrender-utils/__tests__/unit/Html.test.tsx`
- `packages/react-vrender-utils/__tests__/types/vrender.d.ts`

验证命令：

- `rush compile -t @visactor/react-vrender`
- `cd packages/react-vrender && rushx test`
- `rush compile -t @visactor/react-vrender-utils`
- `cd packages/react-vrender-utils && rushx test`

改 Stage 生命周期时建议同时跑 root package app entry tests，确认 app-scoped runtime 仍可用。
