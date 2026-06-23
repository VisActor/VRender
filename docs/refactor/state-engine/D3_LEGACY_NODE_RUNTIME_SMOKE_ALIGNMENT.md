# D3 Legacy Removal Node Runtime / Smoke Harness Alignment 专项文档

> **文档类型**：legacy removal 独立专项文档
> **用途**：将 `packages/vrender-core/__tests__/unit/smoke/stage-graphic.test.ts` 从当前 `P1 caller cleanup` 中正式剥离，单独承接 app-scoped node runtime / smoke harness 对齐问题
> **当前状态**：已定义，待执行
> **重要说明**：本文件不是新的架构设计文档；它只记录已接受的方案 A 边界与后续执行要求，不重开 D3 Phase 1-4 主设计，也不改变 `legacy removal` 的 `P0 / P1 / P2` 验收定义

---

## 1. 任务定位

这轮专项只回答一件事：

> **如何让 `vrender-core` 的 unit smoke 在 app-scoped node runtime 下稳定跑通，并把最后一条 direct deprecated root `createStage()` caller 从当前 `P1 caller cleanup` 中正确拆出。**

这不是：

1. 新的 Phase
2. `legacy path removal` 边界收窄
3. `P1 internal caller cleanup` 的继续扩围
4. `P2 hygiene` 清理

它是已接受的 **方案 A** 的正式落地：

1. 承认 `stage-graphic.test.ts` 已超出当前 `P1 caller cleanup` 边界
2. 允许 `P1` 按“caller cleanup 已到自然边界”收口
3. 将这条 test 单独拆为后续专项：`node runtime / smoke harness alignment`

---

## 2. 当前事实

### 2.1 当前 repo-level direct deprecated root `createStage()` caller 只剩一条

在 compat surface / helper 自身不计入 blocker 的前提下，当前 repo 范围 direct deprecated root `createStage()` caller 只剩：

- [stage-graphic.test.ts](/Users/bytedance/Documents/GitHub/VRender2/packages/vrender-core/__tests__/unit/smoke/stage-graphic.test.ts)

这说明：

1. 当前 `P1` 的 browser/page/source caller 主面已经基本完成迁移
2. 剩余问题不再是“大量 caller 还没替换”，而是一条 unit smoke 的独立边界项

### 2.2 试探性 app-scoped 迁移已经证明它不是普通 caller cleanup

当前留档已经确认，`stage-graphic.test.ts` 的试探性 app-scoped 迁移会暴露新的 runtime / harness 差异，而不是简单的 caller replacement 问题：

1. 直接引入 `vrender-kits/src/installers/app.ts` 时：
   - `configureRuntimeApplicationForApp is not a function`
   - 说明 source Jest 环境混入了 package alias 侧的 `@visactor/vrender-core`
2. 改用 source-level runtime installer 时：
   - `context.project(...).x` 为空
   - 说明当前 fake window/context stub 与 app-scoped node 渲染链预期不兼容
3. 再进一步接真实 node canvas/window installer 时：
   - `DefaultGlobal.createCanvas` 走到 package/cjs runtime
   - 说明已经进入 source / package / cjs global state 一致性问题

因此当前最准确的定性是：

1. 这条 test 已经不是“继续顺手改掉最后一个 `createStage()` caller”
2. 它属于独立的 app-scoped node runtime / test harness 对齐问题
3. 当前稳定版本下，这条 test 已回退并保持绿色，不应在当前 `P1` 批次里被硬推

---

## 3. 正式边界拍板

本专项的边界正式写死如下：

### 3.1 本专项要做

1. 让 `vrender-core` 的 unit smoke 在 app-scoped node runtime 下有一条正式、稳定、可验证的执行链
2. 解决 `stage-graphic.test.ts` 迁移过程中暴露的 source/package alias/cjs global state 混用问题
3. 解决当前 fake node window/context/canvas stub 与 app-scoped node runtime 预期不兼容的问题
4. 在上述前提稳定后，再决定是否以及如何把 `stage-graphic.test.ts` 从 deprecated root `createStage()` 迁到 app-scoped helper

### 3.2 本专项明确不做

1. 不继续扩大 repo 内其他 `createStage()` caller replacement
2. 不重做 `P0 installer surface`
3. 不推进 `P2 hygiene cleanup`
4. 不重开 D3 Phase 1-4 主设计
5. 不把这条专项重新包装成新的 handoff blocker 之外的“大范围运行时重构”

### 3.3 与当前 `legacy removal` 主线的关系

1. 当前 `P1` 可以按“caller cleanup reached natural boundary”收口
2. 本专项不再混入当前 `P1 internal caller cleanup` 统计
3. `legacy removal` 总体仍未完成，原因是：
   - `P1` 只到自然边界，尚未文档化关闭
   - `P2` 仍未开始
4. 因此在本专项和 `P2` 都没有进一步结论前，仍不能恢复宣称：
   - `legacy removal completed`
   - `handoff ready`

---

## 4. 目标交付

本专项的目标交付不要求一次把所有 node smoke 都重写，只要求补出一条最小、正式、稳定的 app-scoped node smoke 路径。

### 4.1 最低可接受交付

1. 为 `vrender-core` unit smoke 提供最小 app-scoped node runtime helper
2. helper 能在 source Jest 环境下稳定工作，不混入 package alias 侧旧 runtime
3. helper 能提供满足当前 smoke 渲染链的 node window/context/canvas 能力
4. `stage-graphic.test.ts` 在迁移后保持绿色
5. 迁移后不引入新的 repo-level runtime regression

### 4.2 推荐交付形态

优先考虑：

1. 在 `vrender-core` tests 内建立专用 app-scoped node smoke helper
2. 该 helper 明确区分：
   - source-level runtime installer
   - node env / canvas / context stub
   - stage create / release 生命周期
3. `stage-graphic.test.ts` 只通过这个 helper 建 stage，不再自行拼 legacy 环境

不建议继续的形态：

1. 直接在 test 里引 `vrender-kits/src/installers/app.ts` 并赌 alias 不出问题
2. 在没有统一 helper 的前提下继续分散地 patch fake window/context stub
3. 用 package/cjs runtime 绕过 source 环境问题，却不解释 source/package/cjs global state 为什么混用

---

## 5. 验收门槛

### 5.1 必跑

1. `packages/vrender-core`
   - `rushx test -- --runInBand __tests__/unit/smoke/stage-graphic.test.ts --verbose`
2. `packages/vrender-core rushx compile`
3. 若 helper 触及 env / canvas / window 安装链，补跑最小相关单测：
   - node env
   - factory / runtime installer
   - 必要的 smoke sibling tests

### 5.2 通过标准

必须同时满足：

1. `stage-graphic.test.ts` 在 app-scoped 路径下通过
2. helper 不再依赖 deprecated root `createStage()`
3. 不再依赖 package alias/cjs 绕路来“碰巧通过”
4. `packages/vrender-core rushx compile` 通过
5. 不引入新的 `vrender-core` runtime regression

### 5.3 不能只看什么

以下情况不算完成：

1. 只是把 import 改了，但 test 仍通过 legacy path 间接工作
2. 只是把 fake stub 改到能过当前断言，但 source/package/cjs runtime 继续混用
3. 只是把这条 test 降级/跳过
4. 只是换一条 package runtime 通路，让 source Jest 环境问题继续被掩盖

---

## 6. 停机条件

出现以下任一情况，必须停下来反馈，不要继续硬推：

1. 发现要让 app-scoped node smoke 路径成立，必须修改已关闭的 D3 主架构边界
2. 发现 source Jest 环境无法建立稳定的 app-scoped node runtime helper，只能依赖 package/cjs 侧绕行
3. 发现当前 fake node window/context/canvas stub 与正式 node runtime 预期差距过大，已不适合作为 smoke harness
4. 发现要解决这条专项，必须先重写 `vrender-core` 的 node env / global state 模型

---

## 7. 与后续任务的关系

本专项完成后，才适合做两件事：

1. 决定 `P1` 是否可以正式标注为“caller cleanup reached natural boundary”
2. 继续推进 `P2 hygiene cleanup`

在此之前：

1. 不要继续把这条 unit smoke 混进当前 `P1` caller cleanup 批次
2. 不要恢复 `legacy removal completed` / `handoff ready` 表述

