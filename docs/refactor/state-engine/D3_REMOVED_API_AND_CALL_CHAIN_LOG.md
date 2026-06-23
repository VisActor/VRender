# D3 删除接口与调用链路留档

> **文档类型**：发布前删除项 / 调用链路台账
> **用途**：让 `VChart` / `VTable` / 上层业务 agent 明确哪些 D3 期间新增或遗留的接口已经删除，应该如何排查和迁移
> **当前状态**：随 1.1.0 正式发布前包体积与维护成本优化同步更新
> **重要说明**：本文记录当前 release 前删除项和后续处理规范；不重开 D3 架构设计。正式状态语义仍以 `D3_ARCH_DESIGN.md`、各 Phase implementation log 和 1.1.0 升级指南为准。

---

## 1. 留档规则

后续只要删除、改名或收紧以下任一类接口，都必须先在本文追加记录：

1. 公开 API、类型、JSX / React props、示例或文档中出现过的用法。
2. 上层仓库可能通过 deep import 使用的半公开模块。
3. D3 重构期间新增但未正式发布的接口、fallback、debug / perf hook。
4. 任何删除后需要 `VChart` / `VTable` 配合排查的调用链。

每条记录必须包含：

1. 删除项和 owner。
2. 删除前调用链。
3. 删除后标准路径。
4. 上层排查命令或关键词。
5. 兼容风险和验证方式。

原则：

- 不为错误或过时调用长期保留隐形 fallback。
- 如果已经有标准路径，优先要求调用方迁移到标准路径。
- 如果删除项影响上层，需要同步更新 1.1.0 升级指南或上层接入指南。
- 内部 only 删除也要记录，只要它曾作为 D3 设计文档、测试或实现 agent 的推荐路径出现过。

---

## 2. 当前删除项总览

| 删除项 | 归类 | 上层是否需要排查 | 标准替代路径 |
| --- | --- | --- | --- |
| `graphic.stateProxy` | public / upper-layer sensitive | 是 | `states` + `StateDefinition.resolver`，或 `sharedStateDefinitions` |
| JSX / React `stateProxy` prop | public / upper-layer sensitive | 是 | JSX / React `states` prop |
| shared scope 下 `graphic.states` missing-state fallback | behavior contract | 是 | 把共享状态补到 `sharedStateDefinitions`；图元本地状态只用于非 shared scope |
| `StatePerfMonitor` / `StateBatchScheduler` / deferred state config | D3 alpha/perf hook | 仅使用过 perf hook 的上层需要 | 普通 `setStates` 同步路径；后续性能专项另开正式 contract |
| `Stage.scheduleStateBatch()` / `getStatePerfSnapshot()` / `resetStatePerfSnapshot()` | D3 alpha/perf hook | 仅使用过 perf hook 的上层需要 | 暂无 1.1.0 public 替代 |
| `IGroup.deferredStateConfig` / `IStage.deferredStateConfig` / `IStage.statePerfConfig` | D3 alpha/perf hook | 仅使用过 perf hook 的上层需要 | 暂无 1.1.0 public 替代 |
| `StateStyleResolver` | internal D3 split layer | 通常不需要 | `StateDefinitionCompiler` + `StateEngine` |
| `StateModel` | internal D3 split layer | 通常不需要 | `Graphic` 内部 transition helper + `StateEngine` |
| `packages/vrender-core/src/interface/animate.ts` | dead commented interface file | 通常不需要 | 实际动画类型来自当前 core / animate 包现有导出 |
| 动画旧 target fallback：`target.animates` map、`onStop(props)`、可选 transient/static truth 方法 | semi-internal custom target compatibility | 自定义 animate target 需要 | 标准 animate extension 安装后的 target 方法 |
| Glyph `subAttributes` 暗路径和旧注释逻辑 | Glyph special boundary | 仅 Glyph 子图元状态依赖方需要 | `glyphStates` / `glyphStateProxy` 只作用于 glyph 自身；子图元状态由上层显式维护 |
| D3 app-scoped plugin helper：`BasePlugin` / `RendererPlugin` / `PickerPlugin` / `BrowserEnvPlugin` / `registerMany` | D3 pre-release convenience API | 仅 deep import 或测试 helper 使用方需要 | 标准 `IPlugin` 对象 + `registry.*.register(...)` |

---

## 3. `graphic.stateProxy`

### 删除项

- `IGraphic.stateProxy`
- `Graphic.stateProxy`
- JSX / React `stateProxy` prop
- shared-state fallback 中由 `stateProxy` 接管 missing shared state 的路径
- 相关 demo / browser page 中的 `stateProxy` 样例

`glyphStateProxy` 不属于本项。Glyph 仍保留自己的专属 surface。

### 删除前调用链

```text
VChart / VTable / user code
  -> graphic.stateProxy(stateName, targetStates)
  -> StateStyleResolver / compat patch
  -> Graphic.applyStateAttrs(...)
  -> attribute
```

shared-state 绑定场景中还曾存在一条 fallback：

```text
Group.sharedStateDefinitions / Theme root scope
  -> Graphic boundSharedStateScope
  -> shared definitions 缺失某个 state
  -> local graphic.states / stateProxy fallback
  -> merge shared + local definitions
```

这条 fallback 已删除。shared scope 绑定后，状态定义来源应由 shared scope 决定；不再由实例级 `stateProxy` 或本地 missing fallback 隐式补齐。

### 删除后标准路径

图元本地动态样式：

```ts
graphic.states = {
  hover: {
    resolver({ graphic, baseAttributes }) {
      return {
        fill: graphic.context?.hoverFill ?? baseAttributes.fill
      };
    },
    declaredAffectedKeys: ['fill']
  }
};

graphic.setStates(['hover'], {
  animate: true,
  animateSameStatePatchChange: true
});
```

跨图元共享状态：

```ts
group.sharedStateDefinitions = {
  hover: {
    resolver({ graphic }) {
      return {
        fillOpacity: graphic.context?.hovered ? 1 : 0.4
      };
    },
    declaredAffectedKeys: ['fillOpacity']
  }
};
```

JSX / React：

```tsx
<rect
  attribute={{ x: 0, y: 0, width: 10, height: 10 }}
  states={{
    hover: {
      patch: { fill: 'red' }
    }
  }}
/>
```

### 上层排查命令

在上层仓库执行：

```bash
rg "stateProxy"
rg "glyphStateProxy"
```

处理规则：

- 命中 `stateProxy`：迁移到 `states` + `resolver` 或 `sharedStateDefinitions`。
- 命中 `glyphStateProxy`：不需要按本项迁移，但要确认它只依赖 Glyph 专属语义。
- 如果状态需要跨多个图元共享，不要迁到每个 graphic 的本地 `states`；应迁到 Group / Theme scope。

### 验证

- VRender：状态相关 core 测试覆盖 `setStates`、resolver、shared-state、Glyph 边界。
- 上层：至少补 line / text-heavy / shared-state 的真实 render smoke。

---

## 4. Deferred State / State Perf Hook

### 删除项

- `StatePerfMonitor`
- `StateBatchScheduler`
- `IStatePerfConfig`
- `IStatePerfSnapshot`
- `IDeferredStateOwnerConfig`
- `stage.statePerfConfig`
- `stage.deferredStateConfig`
- `group.deferredStateConfig`
- `stage.scheduleStateBatch(graphics, targetStates)`
- `stage.getStatePerfSnapshot()`
- `stage.resetStatePerfSnapshot()`

### 删除前调用链

```text
Stage / Group deferredStateConfig
  -> Graphic state transition 分类
  -> StateBatchScheduler
  -> strict paint-only deferred job
  -> StatePerfMonitor snapshot / observability
```

这条链路来自 D3 Phase 4 的 alpha 性能探索。release 前包体积与维护成本复查后，它没有成为 1.1.0 正式 public contract。

### 删除后标准路径

1. 普通状态切换继续使用：

```ts
graphic.setStates(nextStates, {
  animate,
  animateSameStatePatchChange
});
```

2. 1.1.0 不提供 public deferred state batch API。
3. 如果后续确实需要批量状态调度，应重新开独立性能专项，先定义正式 public contract、验证口径和上层收益，不从当前删除项恢复旧 alpha API。

### 上层排查命令

```bash
rg "statePerfConfig|deferredStateConfig|scheduleStateBatch|getStatePerfSnapshot|resetStatePerfSnapshot"
rg "StatePerfMonitor|StateBatchScheduler|IDeferredStateOwnerConfig|IStatePerfSnapshot"
```

处理规则：

- 命中上层业务代码：删除对该 hook 的依赖，回到标准 `setStates`。
- 命中测试或 benchmark：标记为历史 D3 alpha 性能探索，不作为 1.1.0 验收入口。
- 如需保留观测，应先在上层自己的 benchmark harness 中采集，不依赖 VRender 内部 perf hook。

---

## 5. `StateStyleResolver`

### 删除项

`packages/vrender-core/src/graphic/state/state-style-resolver.ts`

### 删除前调用链

```text
Graphic.useStates(...)
  -> StateModel
  -> StateStyleResolver
  -> states / stateProxy 合并
  -> StateTransitionOrchestrator
```

### 删除后标准路径

```text
Graphic.useStates(...)
  -> StateDefinitionCompiler
  -> StateEngine
  -> resolvedStatePatch
  -> StateTransitionOrchestrator
```

删除原因：

- `stateProxy` 已移除。
- 状态定义标准化已经由 `StateDefinitionCompiler` 负责。
- resolved patch 的真值主路径已经在 `StateEngine`。
- 继续保留 resolver split layer 会形成两套等价状态解释路径。

### 上层排查命令

```bash
rg "StateStyleResolver|state-style-resolver"
```

如果上层 deep import 该模块，应迁移到公开状态 API；不要复制该内部类。

---

## 6. `StateModel`

### 删除项

`packages/vrender-core/src/graphic/state/state-model.ts`

### 删除前调用链

```text
Graphic.createStateModel(...)
  -> StateModel.useStates / addState / removeState / toggleState
  -> StateEngine 或本地 stateSort fallback
```

### 删除后标准路径

```text
Graphic
  -> internal resolve*StateTransition helpers
  -> StateEngine when compiled definitions exist
  -> local stateSort path only when no definitions exist
```

删除原因：

- `StateModel` 不是 public export。
- 它是 D3 拆分过程中的内部过渡层。
- 每次状态操作临时创建模型对象，会增加代码和调用层级，但没有提供新的正式 contract。

### 上层排查命令

```bash
rg "StateModel|state-model"
```

上层不应 deep import 该模块。需要状态切换时使用 `graphic.setStates`、`addState`、`removeState`、`toggleState`。

---

## 7. Animate Target 旧兼容 fallback

### 删除项

动画代码中删除了对非标准 target 的旧兼容分支，包括：

- 直接扫描 `target.animates` map。
- 依赖旧 `onStop(props)` 回写静态属性。
- `setFinalAttributes?`、`applyAnimationTransientAttributes?`、`detachAttributeFromBaseAttributes?` 等可选调用 fallback。
- 临时属性写入失败时直接 `Object.assign(target.attribute, attrs)`。

注意：这里删除的是 animate runtime 对非标准 target 的 fallback 读取/写入路径，不表示 `graphic.animates` 这个兼容表象完全消失。当前 `AnimationStateManager` 仍会把内部 tracked animates map 暴露到 `graphic.animates`，用于兼容观察；标准操作路径仍是 `trackAnimate` / `untrackAnimate` / `forEachTrackedAnimate` / `getTrackedAnimates`。

### 删除前调用链

```text
Animate / Step / custom animate
  -> optional target method
  -> missing method fallback
  -> target.animates / onStop(props) / Object.assign(attribute)
```

### 删除后标准路径

```text
registerAnimate()
  -> installs graphic animate extension
  -> target.trackAnimate / untrackAnimate / forEachTrackedAnimate
  -> target.applyAnimationTransientAttributes
  -> target.setFinalAttributes
  -> target.restoreStaticAttribute
```

处理规则：

- 标准 VRender graphic 不受影响。
- 自定义 animate target 如果绕开 VRender graphic，需要实现标准 target 方法，不能依赖旧 fallback。

### 上层排查命令

```bash
rg "onStop\\(|target\\.animates|\\.animates\\b|setFinalAttributes|applyAnimationTransientAttributes"
```

命中后确认是否是自定义 VRender animate target。普通图表配置中的 animation spec 不需要处理。

---

## 8. Glyph 边界

### 当前状态

`glyphStateProxy` 保留。删除的是 Glyph 内部已经没有真实生效语义的 `subAttributes` 暗路径和注释逻辑。

当前正式边界：

1. `glyphStates` / `glyphStateProxy` 是 Glyph 专属 surface。
2. 状态属性作用于 glyph 自身。
3. `subAttributes` 不直接驱动 subGraphic 状态。
4. D3 shared-state 主路径不重新定义 Glyph 子图元 ownership。

### 上层排查命令

```bash
rg "glyphStateProxy|glyphStates|subAttributes"
```

处理规则：

- `glyphStateProxy` 命中不要求迁移。
- 如果业务期望状态直接落到子图元，应在上层显式维护子图元状态，不依赖 D3 shared-state 自动下发。

---

## 9. D3 app-scoped plugin helper

### 删除项

删除 D3 期间新增、但没有进入正式运行时装配路径的 plugin convenience helper：

- `BasePlugin`
- `RendererPlugin`
- `PickerPlugin`
- `BrowserEnvPlugin`
- `IBrowserEnvPluginHooks`
- `IRendererPluginEntries`
- `IPickerPluginEntries`
- `IRendererRegistry.registerMany`
- `IPickerRegistry.registerMany`
- `IContributionRegistry.registerMany`

### 删除前调用链

```text
App-scoped plugin helper
  -> RendererPlugin / PickerPlugin / BrowserEnvPlugin
  -> registry.registerMany(...)
  -> app.context.registry
```

这条链路只服务 D3 预发布阶段的便利封装。当前 VRender 运行时没有使用这些 helper，上层也不需要通过它们接入 app-scoped registry。

### 删除后标准路径

插件直接实现标准 `IPlugin`：

```ts
const plugin = {
  name: 'custom-renderer',
  version: '1.0.0',
  install(context) {
    context.registry.renderer.register(rendererKey, renderer);
  },
  uninstall() {
    // optional cleanup
  }
};

app.installPlugin(plugin);
```

批量注册时由调用方显式循环，避免 registry 暴露一套只服务 helper 的额外 API：

```ts
for (const [key, renderer] of rendererEntries) {
  context.registry.renderer.register(key, renderer);
}
```

### 上层排查命令

```bash
rg "BasePlugin|RendererPlugin|PickerPlugin|BrowserEnvPlugin"
rg "registerMany\\("
rg "IBrowserEnvPluginHooks|IRendererPluginEntries|IPickerPluginEntries"
```

处理规则：

- 命中 helper 类：改为直接实现 `IPlugin`。
- 命中 `registerMany`：改为循环调用 `register`。
- 只在测试 helper 中命中时，也应迁到标准写法，避免把预发布 convenience API 固化成上层契约。

---

## 10. 上层统一排查清单

建议 `VChart` / `VTable` 每次接入当前分支时至少跑：

```bash
rg "stateProxy"
rg "statePerfConfig|deferredStateConfig|scheduleStateBatch|getStatePerfSnapshot|resetStatePerfSnapshot"
rg "StateModel|StateStyleResolver|StatePerfMonitor|StateBatchScheduler"
rg "onStop\\(|target\\.animates|\\.animates\\b"
rg "glyphStateProxy|glyphStates|subAttributes"
rg "BasePlugin|RendererPlugin|PickerPlugin|BrowserEnvPlugin|registerMany\\("
```

最小验证：

1. line / simple / text-heavy render smoke。
2. shared-state 场景。
3. appear/update/state animation 场景。
4. Glyph 场景只在上层真实使用 Glyph 时追加。

---

## 11. 本轮 VRender 验证记录

当前删除项对应的 VRender 侧验证包括：

- `packages/vrender-core` state 相关宽测试：`20 suites / 141 tests` 通过。
- `rush compile --only @visactor/vrender-core` 通过。
- `rush compile --only @visactor/vrender` 通过。
- touched files eslint 通过。
- `git diff --check` 通过。
- `rush build --only @visactor/vrender-core` 成功，有既有 bundler warning。
- `rush build --only @visactor/vrender` 成功，有既有 bundler warning。
- P1 app-scoped runtime / plugin helper 删除项：`entries`、`app-context`、`runtime-installer`、`registry`、`plugin-service`、`state-update-category` targeted tests 通过。

后续新增删除项时，应在本节或新增小节中追加对应验证证据。
