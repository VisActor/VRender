# D3 Phase 4 评审说明

> **用途**：供协调者与总监对 Phase 4 文档包做正式评审
> **评审目标**：判断 Phase 4 的“观测优先 + strict paint-only 批量调度”设计是否已可进入实施任务执行
> **当前状态**：设计评审与实现复核均已完成；review verdict 保持 `Approve`，Phase 4 已关闭

---

## 本轮评审包含哪些文档

本轮评审请以以下 5 份文档为准：

1. [graphic-state-animation-refactor-expectation.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/graphic-state-animation-refactor-expectation.md)
2. [D3_ARCH_DESIGN.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_ARCH_DESIGN.md)
3. [D3_PHASE4_PERFORMANCE_DESIGN.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE4_PERFORMANCE_DESIGN.md)
4. [D3_PHASE4_IMPLEMENTATION_GUIDE.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE4_IMPLEMENTATION_GUIDE.md)
5. [D3_PHASE4_DEVELOPER_PROMPT.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE4_DEVELOPER_PROMPT.md)

其中：

- 期望文档是最高约束
- `D3_ARCH_DESIGN.md` 负责总体阶段边界
- `D3_PHASE4_PERFORMANCE_DESIGN.md` 是本轮正式设计基线
- 实施任务文档与开发者 prompt 负责把设计翻译成可执行边界

---

## 本轮评审要解决什么

这轮评审不是讨论“要不要做性能优化”，而是回答一个更具体的问题：

**当前这版 `观测优先 + strict paint-only deferred + single-intent job` 的性能设计，是否已经足够闭环，可以进入实施。**

建议把结论限定为三种：

1. `Approve`
2. `Approve with conditions`
3. `Request changes`

---

## 本轮评审结论

本轮总监 review 结论为 `Approve`，且在实现完成后的架构复核中仍保持有效。

结论含义：

1. Phase 4 文档包已完成“设计评审 -> 实现 -> 架构复核 -> close-out”闭环
2. 当前保留的仅是非阻塞后续问题，不再构成 Phase 4 关闭前提
3. Phase 4 相关实施文档不应再以“待 close-out”或“可执行未实现”状态继续流转
4. 后续如继续推进，只应进入 follow-up 或下一阶段，不重新打开 Phase 4 主设计讨论

---

## 本轮评审结论应重点关注什么

Phase 4 相对前几阶段新增并拍板了 7 个关键点：

1. 观测点只放在状态切换 / shared refresh / batch job 边界
2. Stage 级 snapshot 必须能给出 deferred ineligible reason breakdown
3. Stage 级 snapshot 必须能给出最小分段成本指标
4. deferred 只对显式启用且严格 `paint-only` 的批量状态切换开放
5. `StateBatchJob` 采用 single-intent job 模型
6. job identity 必须绑定 `contextOwnerId + configFingerprint + targetStatesKey`
7. deferred 下采用 per-graphic committed snapshot 原子切换

---

## 必须重点审的 7 个问题

### 1. 观测边界是否真的没有回到热路径

评审时重点看：

- 观测点是否仍然只在状态切换边界
- 是否仍避免在 render / pick / bounds 热路径插入重型采样

### 2. 观测数据模型是否足够支撑设计目标

评审时重点看：

- 是否已有 `deferredIneligibleByReason`
- 是否已有最小 `cost`
- 是否已有最小 `allocationHints`
- 是否还能保持低开销

### 3. deferred 资格边界是否足够硬

评审时重点看：

- 是否仍然严格限制在 `paint-only`
- 含 resolver 且 `affectedKeys` 不稳定时是否明确判为 ineligible
- 是否没有把 shared refresh 偷偷纳入 deferred

### 4. job 数据模型是否闭环

评审时重点看：

- 是否已拍板 `single-intent job`
- 是否还残留“同图元最后一次意图胜出但模型无承接点”的矛盾
- `pendingIntentByGraphic` 是否已经成为唯一调度侧真值

### 5. owner/config identity 是否闭环

评审时重点看：

- job identity 是否已经绑定 `contextOwnerId + configFingerprint + targetStatesKey`
- 相同 `targetStates` 但不同 Group / Layer / Stage 生效上下文，是否不会错误合并
- reparent / config 变化时的迁移规则是否已写死

### 6. committed snapshot 契约是否可信

评审时重点看：

- deferred 期间是否仍保持 per-graphic 原子切换
- 是否避免出现单图元半更新态

### 7. cache 边界是否仍受控

评审时重点看：

- 是否仍然没有跨图元 resolver 输出缓存
- 是否没有借 Phase 4 重开 Phase 2/3 主模型

---

## 建议的评审流程

### Step 1：先对照期望文档

先看当前 Phase 4 是否仍然符合这些核心约束：

- 性能优化重点放在状态切换阶段
- 默认一致性优先，性能策略作为可选增强
- 批量状态调度是独立策略，不等同于 incremental draw
- 只有 `paint-only` 默认进入分帧路径

### Step 2：再审 telemetry 是否最小但够用

这是本轮第一关键点。要先判断：

- 是否既能回答 reason / cost 问题
- 又没有把 telemetry 扩成大礼包

### Step 3：最后审调度模型是否能直接实现

重点看：

- `single-intent job`
- owner/config identity
- committed snapshot
- stop-and-feedback 条件

---

## 建议评审输出格式

建议输出统一为：

1. `Blocking findings`
2. `Non-blocking risks`
3. `Open questions`
4. `Verdict`

其中 `Blocking findings` 请优先说明：

- 结论
- 为什么与期望或 Phase 4 边界冲突
- 应如何修

---

## 建议通过门槛

只有同时满足以下条件，才建议给出 `Approve` 或 `Approve with conditions`：

1. 观测边界没有回到 render / pick / bounds 热路径
2. snapshot 足以支撑 deferred ineligible reason 与最小成本分段
3. deferred 资格仍被严格限制在 `paint-only`
4. `StateBatchJob` 已闭环为 single-intent job
5. owner/config identity 已闭环到 `contextOwnerId + configFingerprint + targetStatesKey`
6. committed snapshot 契约成立
7. shared refresh 仍只做观测，不默认 deferred
8. cache 边界仍没有跨图元 resolver 输出缓存
9. 实施任务文档和开发者 prompt 没有把关键架构判断留给开发者

只要其中任一项仍是“实现时再看”，更合理的结论应是 `Request changes`。

---

## 本轮评审通过的关键闭环

本轮 Phase 4 文档包已通过的关键闭环如下：

1. telemetry 是否最小但足够支撑 Phase 4 目标
2. strict paint-only deferred 边界是否仍然足够硬
3. single-intent job + `pendingIntentByGraphic` 是否真正闭环
4. owner/config identity 是否真正防止错误 job 合并
5. committed snapshot 与 cache 边界是否仍足够硬

这 5 点已形成当前 Phase 4 的正式实现基线。

---

## 附：评审时可直接对照的验证场景

### 场景 A：5k~50k 纯视觉联动

只改 `fill / opacity / shadowColor`，应允许进入 deferred，并可观测 job/yield。

### 场景 B：混合几何状态

存在 `lineWidth / width / height` 时，不得进入 deferred，并且能看到 ineligible reason。

### 场景 C：shared refresh 高峰

Group shared definitions 变化时，应可观测 queued / flushed / renderScheduled / shared refresh cost，但不默认分帧。

### 场景 D：连续交互覆盖旧意图

旧 pending intent 不得迟到覆盖新状态。

### 场景 E：相同状态意图但不同 owner/config

不同 Group / Layer / Stage 生效上下文下，不得错误合并成同一 job。

只要这些场景里有任一项无法稳定回答，设计就还不能进入实现。
