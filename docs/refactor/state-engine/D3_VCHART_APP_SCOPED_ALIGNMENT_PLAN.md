# D3 VChart App-Scoped Alignment Plan

> **文档类型**：跨仓库实施计划
> **用途**：把 `VChart` 从当前 compatibility-heavy 上层接入链，推进到至少一条真实可验证的 app-scoped 集成链
> **当前状态**：consumer-side external-stage-first 证据已通过；source-level alignment 仍为 post-alpha P0 follow-up
> **重要说明**：本计划优先拿到真实 app-scoped 上层证据，不默认要求一次性把 `VChart` 内部创建链完全改写

---

## 1. Goal

### 1.1 Current status update

截至 browser alpha close-out，已经有 `/tmp/vchart-vrender-verify` consumer harness fresh rerun 证明：

1. `createBrowserVRenderApp()` 可用
2. `app.createStage()` 可用
3. `new VChart(..., { stage })` 可用
4. direct / injected app-scoped path 均为 `ok`
5. `injectedApp.firstFrame = true`
6. `reuseSameStage.success = true`
7. `globalErrors = []`

这证明 external-stage-first 路径在 consumer-side 已成立，但还没有等价于 `VChart` 源码级正式对齐。post-alpha 的 P0 工作仍然是把这条路径沉淀到 `VChart` 的正式 source / runtime harness / ownership contract 中。

优先级与完成标准看：

- [D3_POST_ALPHA_WRAPUP_PLAN.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_POST_ALPHA_WRAPUP_PLAN.md)

本计划的目标不是立刻把 `VChart` 整体重写成内部全面使用 `createBrowserVRenderApp()` / `createNodeVRenderApp()`，而是：

1. 先打通一条 **真实可运行、可验证、可释放** 的 app-scoped 上层集成链
2. 用这条链证明：
   - `VRender` 推荐 root path 能被真实上层消费
   - `VChart` 可以在不依赖 direct `new Stage(...)` 的情况下完成 init/update/recreate/release
3. 再基于证据决定：
   - 是继续做 `VChart` full internal migration
   - 还是长期保留一条受限的 compatibility/direct-stage contract

---

## 2. Why this plan exists

当前已经确认：

1. `VRender` 推荐主链已经形成：
   - `@visactor/vrender`
   - `createBrowserVRenderApp()` / `createNodeVRenderApp()`
   - `app.createStage()`
2. `VChart` 当前真实链路仍主要是：
   - `register*Env`
   - `load*Env(container)`
   - `vglobal.setEnv(...)`
   - `new Stage(...)`
3. `VChart` 选项面已经允许外部传入 `stage`
4. `VChart` 当前还存在 external stage ownership bug

因此最短路径不是直接重写 `Compiler.initView()` 的全部创建逻辑，而是：

```text
先修 external-stage contract
-> 再用 external stage injection 拿到真实 app-scoped integration evidence
-> 再决定是否推进 full internal migration
```

这是当前风险最低、信息增益最高的推进顺序。

---

## 3. Current evidence

### 3.1 VChart already has the right seam

`VChart` 已允许通过 option 传入外部 `stage`：

- [common.ts](/Users/bytedance/Documents/GitHub/VChart/packages/vchart/src/typings/spec/common.ts:62)
- [compiler.ts](/Users/bytedance/Documents/GitHub/VChart/packages/vchart/src/compile/interface/compiler.ts:117)

并且 `VChart` 构造器会把 `stage` 往 `Compiler` 继续透传：

- [vchart.ts](/Users/bytedance/Documents/GitHub/VChart/packages/vchart/src/core/vchart.ts:433)

`Compiler.initView()` 当前也已经支持：

```ts
this._stage = this._option.stage ?? new Stage(...)
```

证据：

- [compiler.ts](/Users/bytedance/Documents/GitHub/VChart/packages/vchart/src/compile/compiler.ts:129)

### 3.2 What blocks this seam today

当前主要 blocker 不是“完全没有 seam”，而是：

1. external stage ownership bug
   - [compiler.ts](/Users/bytedance/Documents/GitHub/VChart/packages/vchart/src/compile/compiler.ts:694)
2. VRender root app creator 类型面太弱
   - app creator return type 仍是 `object`
3. 当前缺少一条真实 browser harness 证明：
   - 外部通过 `createBrowserVRenderApp() + app.createStage()` 创建 stage
   - 再把 stage 注入 `VChart`
   - 整体能稳定完成 init/update/recreate/release

### 3.3 Current narrow local probe

截至 **2026-04-23**，已经做过一条不修改 `VChart` 仓库源码的 consumer-side local probe：

1. 使用本地 `VRender` build 产物作为 root import
2. 使用现有 `/tmp/vchart-vrender-verify` harness
3. 打开 app-scoped direct / injected 两条路径
4. 对 `injected-vchart` 路径验证：
   - external `createBrowserVRenderApp() + app.createStage()`
   - `new VChart(..., { stage })`
   - render/update/firstFrame
   - `chart.release()` 后再次复用同一 stage

当前 narrow result 是：

1. direct app-scoped path：`ok`
2. injected-vchart path：`ok`
3. `firstFrame`: `true`
4. `reuseSameStage.success`: `true`
5. `globalErrors`: `[]`

这条结果很重要，但边界也必须写清：

1. 它证明 **至少有一条真实 app-scoped external-stage-first 集成链可以跑通**
2. 它 **不等于** broader external-stage ownership 问题已经正式关闭
3. 在把 ownership blocker 从 open 改成 cleared 前，仍应继续要求更明确的 owner/release 级验证

---

## 4. Recommended strategy

推荐分成两个阶段：

### Phase A: External-stage-first alignment

目标：

1. 不改 `VChart` 内部默认创建链
2. 先让它安全、正确地消费外部 stage
3. 用这条路径拿到第一轮真实 app-scoped integration evidence

### Phase B: Decide full migration or compatibility contract

只有在 Phase A 有了真实 evidence 之后，再决定：

1. **继续内部迁移**
   - 让 `VChart` 自己内部改走 root app creator / app-scoped ownership
2. **保留双路径**
   - 推荐路径：external stage injection / root app creator
   - compatibility 路径：direct stage creation

当前不建议先跳到 Phase B。

---

## 5. Workstream breakdown

### Workstream 1: Contract hardening

目标：

1. 修复 external stage ownership
2. 补齐 VRender public typing

建议触点：

- `VChart/packages/vchart/src/compile/compiler.ts`
- `VRender2/packages/vrender/src/entries/*.ts`
- `VRender2/packages/vrender/es/entries/*.d.ts`
- `VRender2/packages/vrender/cjs/entries/*.d.ts`

最小要求：

1. 外部传入 stage 不会被 `chart.release()` 误释放
2. TypeScript 调用方能不靠 `any/cast` 消费 root app creator

### Workstream 2: Real browser integration evidence

目标：

在 `VChart` browser runtime harness 里新增一条明确走 app-scoped 的 page / test path。

建议触点：

- `VChart/packages/vchart/__tests__/runtime/browser/test-page/`
- `VChart/packages/vchart/__tests__/runtime/browser/index.page*.ts`
- 必要时补一条 unit/runtime assertion

建议最小样例：

```ts
import { createBrowserVRenderApp } from '@visactor/vrender';
import VChart from '../../../src';

const app = createBrowserVRenderApp();
const stage = app.createStage({
  container: document.getElementById('chart')!,
  autoRender: true
});

const chart = new VChart(spec, {
  stage,
  mode: 'desktop-browser'
});
```

建议最少验证：

1. init
2. update / updateSpec
3. recreate
4. release
5. external stage 仍归创建者控制

### Workstream 3: Decision checkpoint

Phase A 完成后，需要做一次明确判断：

1. 这条 external-stage-first 链是否足够覆盖真实上层需求？
2. 如果足够，是否可以把它写成正式推荐上层接入路径？
3. 如果不够，再决定是否投入 full internal migration

---

## 6. Why full internal migration is not the first step

当前不推荐一上来就把 `VChart` 内部重写成 root app creator 链，原因是：

1. `VChart` 当前 compiler / env / tooltip / animation / interaction 都直接依赖 `Stage` 实例能力
2. 它内部还保留着：
   - `registerBrowserEnv/registerNodeEnv`
   - `vglobal.setEnv`
   - direct `new Stage(...)`
3. 一次性内部迁移会把下面几件事混在一起：
   - runtime creation
   - ownership
   - multi-env
   - advanced/custom assembly
   - existing browser harness compatibility

这会让问题空间过大，不利于先拿到“推荐 app-scoped 路径是否真实可用”的最小证据。

---

## 7. Acceptance criteria

本计划的第一阶段只有在下面条件同时满足时，才算完成：

1. `VChart` external stage ownership bug 已修复
2. `VRender` root app creator public typing 已至少满足直接消费
3. `VChart` browser runtime harness 已有一条 page/test 明确走：
   - `createBrowserVRenderApp()`
   - `app.createStage()`
   - `new VChart(..., { stage })`
4. 该路径已拿到 fresh 证据：
   - init 成功
   - update 或 recreate 成功
   - release 正确
   - external stage 未被误释放
5. 文档里已经明确：
   - 这是一条真实推荐链
   - 它与当前 compatibility-heavy internal path 的关系

---

## 8. Non-goals

这份计划当前不要求：

1. `VChart` 内部彻底删除 `new Stage(...)`
2. `VChart` 内部彻底删除 `registerBrowserEnv/registerNodeEnv`
3. 一次性统一 multi-env / on-demand 的所有高级装配路径
4. node runtime 在同一轮内一起转绿

---

## 9. Recommended file targets

如果后续要真正执行，建议优先看这些文件：

### VRender

- [browser.ts](/Users/bytedance/Documents/GitHub/VRender2/packages/vrender/src/entries/browser.ts:1)
- [node.ts](/Users/bytedance/Documents/GitHub/VRender2/packages/vrender/src/entries/node.ts:1)
- [bootstrap.ts](/Users/bytedance/Documents/GitHub/VRender2/packages/vrender/src/entries/bootstrap.ts:150)
- [app-context.ts](/Users/bytedance/Documents/GitHub/VRender2/packages/vrender-core/src/entries/app-context.ts:91)

### VChart

- [vchart.ts](/Users/bytedance/Documents/GitHub/VChart/packages/vchart/src/core/vchart.ts:385)
- [compiler.ts](/Users/bytedance/Documents/GitHub/VChart/packages/vchart/src/compile/compiler.ts:129)
- [compiler.ts](/Users/bytedance/Documents/GitHub/VChart/packages/vchart/src/compile/compiler.ts:694)
- [common.ts](/Users/bytedance/Documents/GitHub/VChart/packages/vchart/src/typings/spec/common.ts:62)
- [vchart-simple.ts](/Users/bytedance/Documents/GitHub/VChart/packages/vchart/__tests__/runtime/browser/test-page/vchart-simple.ts:1)

---

## 10. Recommended current verdict

当前最合理的推进判断是：

1. `VChart` 还没有完成对推荐 app-scoped 结构链的真实对齐
2. 但它已经有一条足够好的外部注入 seam，可作为最短迁移入口
3. 所以下一步最值得做的不是抽象争论，而是：
   - **external-stage-first**
   - **先拿真实 integration evidence**
   - **再决定 full internal migration 值不值得做**
