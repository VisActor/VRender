# D3 Upper-Layer Logic Chain Audit

> **文档类型**：上层接入逻辑链审计文档
> **用途**：检查当前 VRender 上层接入的完整逻辑链路，判断它是否符合 D3 重构的结构期望与当前治理期望
> **当前状态**：审计完成
> **范围边界**：本文件只审“上层接入逻辑链是否对齐”，不继续处理 alpha blocker 修复，不重开 D3 主架构

---

## 1. Problem framing

### 1.1 Current status update

截至 browser alpha close-out：

1. `VRender` 推荐 root path 已经足以支撑 browser alpha
2. `external-stage-first` 的 consumer-side app-scoped rerun 已通过
3. `VChart` 真实源码链路仍未整体迁到推荐 root path
4. 因此当前结论应理解为：consumer-side integration evidence 已有，app-provider-first source-level alignment 仍是 post-alpha P0 follow-up

执行优先级统一看：

- [D3_POST_ALPHA_WRAPUP_PLAN.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_POST_ALPHA_WRAPUP_PLAN.md)

这轮要回答的问题不是“推荐用法是什么”，而是：

1. 当前上层接入的真实逻辑链路到底怎么走
2. 它是否已经符合 D3 对 app-scoped/runtime-installer 收口的结构期望
3. 它是否已经符合当前治理文档对 browser/node、multi-env、on-demand 的 contract 期望

结论先行：

1. **VRender 根包推荐链路**
   - 对 browser/node 默认路径已经基本成立
   - 但仍带有 compatibility bridge，不是纯 installer-only 终态
2. **VChart 当前真实链路**
   - 仍然主要走 legacy/global `Stage` 创建链
   - 尚未对齐到 `createBrowserVRenderApp()/createNodeVRenderApp() + app.createStage()` 这一条推荐上层结构链
3. 因此当前不能说“整个上层接入逻辑链已经统一对齐”。
   - 更准确的说法是：
   - **VRender 内部推荐主链已形成**
   - **真实上层代表样本仍处于兼容过渡链路**

---

## 2. What the refactor expected

按 D3 `legacy removal` 的结构期望，新路径应收口为：

1. `bootstrapVRenderBrowserApp / bootstrapVRenderNodeApp`
   - 直接把默认 pipeline 安装到 app registry
2. repo 内部统一改用：
   - `createBrowserVRenderApp()`
   - `createNodeVRenderApp()`
   - `app.createStage()`
3. compatibility bridge 可以短期保留，但不能被视为正式机制

证据：

- [D3_LEGACY_PATH_REMOVAL_PLAN.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_LEGACY_PATH_REMOVAL_PLAN.md:203)
- [D3_LEGACY_PATH_REMOVAL_PLAN.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_LEGACY_PATH_REMOVAL_PLAN.md:213)
- [D3_LEGACY_PATH_REMOVAL_PLAN.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_LEGACY_PATH_REMOVAL_PLAN.md:333)

按当前治理期望，暂时统一 contract 应该是：

1. browser/node root-package app creator 是正式主推荐路径
2. multi-env/on-demand 仍然存在，但不要默认描述成已被新主路径等价承接
3. 当前 app-scoped 不应默认理解成完全隔离的 per-app/per-env runtime container

证据：

- [D3_MULTI_ENV_ON_DEMAND_GOVERNANCE.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_MULTI_ENV_ON_DEMAND_GOVERNANCE.md:50)
- [D3_MULTI_ENV_ON_DEMAND_GOVERNANCE.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_MULTI_ENV_ON_DEMAND_GOVERNANCE.md:71)

---

## 3. Logic Chain A: VRender recommended root path

### 3.1 Entry

根包 browser 入口：

1. `@visactor/vrender` 导出 `createBrowserVRenderApp()`
2. `createBrowserVRenderApp()` 内部调用 `createBrowserApp(options)`
3. 然后进入 `bootstrapVRenderBrowserApp(...)`

证据：

- [browser.ts](/Users/bytedance/Documents/GitHub/VRender2/packages/vrender/src/entries/browser.ts:1)

### 3.2 Bootstrap and installation

当前 browser bootstrap 实际执行：

1. `installBrowserEnvToApp(app)`
2. `installDefaultGraphicsToApp(app)`
3. `installBrowserPickersToApp(app)`
4. `loadBrowserEnv()`
5. `legacyGraphicRegistrations.forEach(register => register())`
6. `syncLegacyRenderersToApp(app)`
7. `syncLegacyPickersToApp(app, CanvasPickerContribution)`
8. `registerDefaultPipeline()`

证据：

- [bootstrap.ts](/Users/bytedance/Documents/GitHub/VRender2/packages/vrender/src/entries/bootstrap.ts:150)

这说明：

1. 新路径已经进入 app-scoped installer surface
2. 但 browser default path 仍保留了 legacy graphic/env bridge
3. 当前结构更接近“installer 主链 + compatibility bridge”，不是纯 installer-only 终态

这点也被单测固定了：

- [entries.test.ts](/Users/bytedance/Documents/GitHub/VRender2/packages/vrender/__tests__/unit/entries.test.ts:231)

### 3.3 Stage creation and ownership

`app.createStage()` 进入 `AppContext.createStage()` 后：

1. 通过 app 的 `StageFactory` 创建 stage
2. 将 stage 纳入 `stageResources` 跟踪
3. `app.release()` 时释放仍被跟踪的 stage，再清理 registry/plugin/contribution

证据：

- [app-context.ts](/Users/bytedance/Documents/GitHub/VRender2/packages/vrender-core/src/entries/app-context.ts:91)

### 3.4 Conformity judgment

对照 D3 结构期望：

1. **已对齐的部分**
   - 明确 root app creator
   - 明确 app ownership
   - 明确 app-scoped installer surface
2. **未完全对齐的部分**
   - bootstrap 仍带 compatibility bridge
   - 不是最终想象中的纯 installer-only end-state

判断：

- **与当前 accepted 状态相容**
- **与最终结构目标部分对齐，但未完全终态化**

---

## 4. Logic Chain B: current VChart upper-layer chain

### 4.1 Env registration entry

`VChart` 当前在初始化阶段会根据 mode：

1. `registerBrowserEnv()`
2. 或 `registerNodeEnv()`

但这两个函数内部走的是：

1. `loadBrowserEnv(container)`
2. `loadNodeEnv(container)`

其中 `container` 来自 `@visactor/vrender-core` 的 legacy container。

证据：

- [vchart.ts](/Users/bytedance/Documents/GitHub/VChart/packages/vchart/src/core/vchart.ts:385)
- [env.ts](/Users/bytedance/Documents/GitHub/VChart/packages/vchart/src/env/env.ts:1)

### 4.2 Stage creation

`Compiler.initView()` 当前实际是：

1. `vglobal.setEnv(toRenderMode(mode), modeParams ?? {})`
2. 如果外部传入了 stage，就直接复用
3. 否则直接 `new Stage({...})`

而这个 `Stage` 是直接从 `@visactor/vrender-core` 导入的。

证据：

- [compiler.ts](/Users/bytedance/Documents/GitHub/VChart/packages/vchart/src/compile/compiler.ts:12)
- [compiler.ts](/Users/bytedance/Documents/GitHub/VChart/packages/vchart/src/compile/compiler.ts:129)

### 4.3 Ownership and release

当前 `Compiler.release()` 本意是“不释放外部传入 stage”，但实现上先把 `_option` 置空，再判断：

```ts
if (this._stage !== this._option?.stage) {
  this._stage.release();
}
```

这样比较恒成立，导致外部 stage 也会被释放。

证据：

- [compiler.ts](/Users/bytedance/Documents/GitHub/VChart/packages/vchart/src/compile/compiler.ts:694)

### 4.4 Conformity judgment

对照 D3 结构期望：

1. **未对齐**
   - 没有走 `createBrowserVRenderApp()` / `createNodeVRenderApp()`
   - 没有走 `app.createStage()`
   - 没有使用 app-scoped ownership 作为创建与释放边界
2. **仍依赖兼容链**
   - legacy env loader
   - `vglobal.setEnv`
   - `new Stage(...)`
3. **还存在治理期望明确挂账的问题**
   - external stage ownership

判断：

- **当前 VChart 真实链路不符合 D3 想要的上层终态结构**
- **它仍然是可工作的兼容链，而不是已对齐的新推荐链**

---

## 5. Logic Chain C: what this means for “upper-layer integration”

“上层接入”现在至少有两条不同链路：

### 5.1 Chain 1: recommended app-scoped path

```text
@visactor/vrender root entry
-> createBrowserVRenderApp/createNodeVRenderApp
-> bootstrapVRender*App
-> app-scoped installer surface
-> app.createStage()
-> app-owned stage lifecycle
```

这是当前文档与治理口径承认的正式主推荐链。

### 5.2 Chain 2: current compatibility-heavy upper-layer path

```text
upper-layer env wrapper
-> load*Env(container)
-> vglobal.setEnv(...)
-> new Stage(...)
-> direct stage ownership or external stage borrowing
```

这是当前 `VChart` 代表样本仍在走的真实链。

### 5.3 Overall judgment

所以当前不能把“VRender 已有推荐 app-scoped 入口”直接等价成：

```text
整个上层接入逻辑链已经完成 app-scoped 对齐
```

更准确的判断是：

1. 推荐链已经形成
2. 真实上层代表链还没整体切到推荐链
3. 当前 alpha/gov 语境里，仍需要一轮“基于推荐 app-scoped 入口的真实上层接入验证”

这也与 alpha gate 的现有描述一致：

- [D3_ALPHA_COORDINATION.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_ALPHA_COORDINATION.md:34)

---

## 6. Conformity matrix

| 维度 | 推荐 root path | 当前 VChart path | 审计判断 |
|------|------|------|------|
| root entry | 是 | 否 | VChart 未对齐 |
| app-scoped installer surface | 部分是 | 否 | VChart 未对齐 |
| pure installer-only structure | 否 | 否 | 两边都未终态化 |
| app-owned stage lifecycle | 是 | 否 | VChart 未对齐 |
| external stage ownership | 规则更清楚 | 存在误释放 | VChart 不符合治理期望 |
| multi-env contract clarity | 部分清楚 | 仍走 legacy env wrapper | 当前整体仍分层 |
| on-demand contract clarity | 不承诺细粒度 | 仍靠 legacy/custom path | 当前整体仍分层 |

---

## 7. Required judgments for maintainers

基于这轮审计，建议维护者明确承认下面 4 件事：

1. 当前“推荐结构”与“真实上层样本结构”不是同一条链
2. `VChart` 当前仍主要处于 compatibility path，不应被误写成已经完成 app-scoped 对齐
3. browser root-package 主链可以继续作为正式推荐 contract，但仍要承认 bootstrap 里还带 compatibility bridge
4. 后续治理不能只补文档，还要决定：
   - VChart 这类上层是否真的要迁到 app-scoped root path
   - 还是显式保留一条长期兼容 direct-stage/custom-assembly contract

---

## 8. Recommended next steps

最短路径建议：

1. 在 adoption / review / governance 文档里继续保持“两条链分开描述”
2. 把 `VChart` 当前链明确归类为 compatibility path，而不是推荐 path
3. 继续按治理文档拍板：
   - multi-env support matrix
   - on-demand granularity
   - external stage ownership contract
4. 如果决定推进真实上层 app-scoped 对齐，再按：
   - [D3_VCHART_APP_SCOPED_ALIGNMENT_PLAN.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_VCHART_APP_SCOPED_ALIGNMENT_PLAN.md)
   启动 cross-repo 实施

---

## 9. Conclusion

最终结论：

1. **VRender 推荐 root path**
   - 已经基本符合当前治理期望
   - 但还不是无 bridge 的最终终态结构
2. **当前上层真实代表链（VChart）**
   - 仍未符合 D3 想要的 app-scoped 结构终态
   - 仍主要依赖 direct `Stage` + legacy env/global path
3. 因此当前更准确的统一口径应是：
   - **推荐链已形成**
   - **真实上层链未统一迁到推荐链**
   - **上层接入的完整逻辑链审计结果是“部分对齐，而非整体对齐”**
