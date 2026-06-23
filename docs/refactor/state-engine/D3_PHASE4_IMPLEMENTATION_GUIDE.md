# D3 Phase 4 实施任务文档 — 性能优化

> **目标读者**：资深开发者
> **面向文档**：`D3_ARCH_DESIGN.md`（v1.11） + `D3_PHASE4_PERFORMANCE_DESIGN.md`（v0.1）
> **阶段**：Phase 4 — 观测优先的性能优化
> **状态**：已关闭（实现已完成、已通过复核并完成 close-out）

---

## 文档使用说明

本文档是 Phase 4 评审通过后的直接实施依据。Phase 4 不是重开 Phase 2/3 主模型，而是在现有状态真值与 shared-state 主路径已经闭环的前提下，把**观测、`paint-only` 批量调度、最小缓存优化边界**收口成可实现的性能子系统。

开始实施前请先阅读：

1. `docs/refactor/state-engine/graphic-state-animation-refactor-expectation.md`
2. `docs/refactor/state-engine/D3_ARCH_DESIGN.md`
3. `docs/refactor/state-engine/D3_PHASE4_PERFORMANCE_DESIGN.md`
4. 本文档完整内容

---

## Phase 4 目标

Phase 4 完成后，VRender 的性能优化主路径必须收敛到：

```ts
state change / shared refresh / batch scheduling boundary
  -> Stage 级 state perf snapshot
  -> strict paint-only deferred eligibility
  -> single-intent StateBatchJob
  -> per-graphic committed snapshot atomic commit
  -> optional cache optimization follow-up
```

完成后必须满足：

1. 观测点只落在状态切换、shared refresh、batch job 边界，不回到 render / pick / bounds 热路径。
2. `paint-only` 之外的状态变化默认仍同步收敛。
3. deferred path 只对显式启用、严格 `paint-only`、批量状态切换开放。
4. `StateBatchJob` 采用 `single-intent job` 模型。
5. job identity 固定为：`contextOwnerId + configFingerprint + targetStatesKey`。
6. 同图元最后一次状态意图胜出，由 `pendingIntentByGraphic` 承接。
7. deferred 下采用 per-graphic committed snapshot 原子切换，不立即改写 `activeStates / attribute`。
8. shared refresh 第一版只做观测，不默认进入 deferred。
9. 不引入跨图元 resolver 输出缓存。

---

## 已确认的架构决策

以下不是开放讨论项，默认按此执行。

### 决策 1：观测优先

- 先建立 Stage 级 `state perf snapshot`
- 先让性能问题可见、可归因
- 不先做大范围 cache 或调度复杂化

### 决策 2：deferred 只对严格 paint-only 开放

- 必须显式启用
- 必须是批量状态切换
- update category 必须严格等于 `PAINT`
- `PICK / BOUNDS / SHAPE / TRANSFORM / LAYOUT` 一律不进入 deferred

### 决策 3：single-intent job

- 一个 job 只能代表一种状态意图
- 同图元最后一次意图胜出不靠 job 内多意图容器，而靠 scheduler side table

### 决策 4：job identity 绑定区域级 owner/config

- job 不能只按 `targetStates` 合并
- identity 固定为 `contextOwnerId + configFingerprint + targetStatesKey`
- 不同 Group / Layer / Stage 生效上下文不能被 batch 合并抹平

### 决策 5：per-graphic committed snapshot

- 图元进入 deferred queue 后，不立即切换 `activeStates / attribute`
- 真正 commit 时才原子切换
- 单个图元内部不允许出现“状态已变、属性未变”的半更新中间态

### 决策 6：shared refresh 第一版只做观测

- shared definition change / active refresh 要进入 snapshot
- 但不默认进入 deferred 调度
- 先看成本，再决定后续是否需要单独优化

### 决策 7：cache 优化边界

- 只能做局部复用、队列去重、分类结果复用
- 不允许跨图元共享 resolver 输出
- 不允许引入新的 source of truth

---

## 四个必须写死的实现前提

### 前提 1：观测边界与低开销约束

固定要求：

1. 观测点只允许放在：
   - `StateEngine` 状态重算结束
   - `Graphic.submitUpdateByDelta()` 分类结束
   - shared refresh queue 入队 / flush
   - batch job 生命周期节点
   - deferred ineligible 判定节点
2. Stage 级 snapshot 至少必须包含：
   - `deferredIneligibleByReason`
   - `cost`
   - `allocationHints`
3. `cost` 只允许在状态切换 / shared refresh / batch slice 边界用 `performance.now()` 包围
4. 事件环关闭时不得分配事件对象

### 前提 2：deferred 资格与 committed snapshot 契约

固定要求：

1. 含 resolver 但无法稳定给出 `affectedKeys` 的状态，一律视为 deferred ineligible
2. `paint-only` 之外的图元必须走同步主路径
3. deferred 期间每个 graphic 只允许保留一个 committed snapshot
4. 真正 commit 时必须一次性完成：
   - 状态集合切换
   - patch 重算
   - `_syncAttribute()`
   - update tag 提交

### 前提 3：single-intent job 与 identity 迁移规则

固定要求：

1. job identity 固定绑定 `contextOwnerId + configFingerprint + targetStatesKey`
2. `pendingIntentByGraphic` 是最后一次意图胜出的唯一调度侧真值
3. graphic reparent 或 owner/config 变化后，必须重新解析 deferred identity
4. identity 改变时，必须从旧 job 移除并重新归入新 job；若不再符合资格，则回退同步主路径
5. 旧 pending intent 不得迟到覆盖新状态

### 前提 4：shared refresh 与 cache 边界

固定要求：

1. shared refresh 第一版至少要可观测：
   - queued graphics
   - flushed graphics
   - render scheduled
   - shared refresh cost
2. 不默认把 shared refresh 接入 deferred
3. cache 优化必须建立在观测结果之上
4. 不允许跨图元共享 resolver 输出结果

---

## 实施文件范围

### 必改文件

| 文件 | 责任 |
|------|------|
| `packages/vrender-core/src/core/stage.ts` | Stage 级 perf snapshot 主入口、batch job 调度接入、区域级 config 解析入口 |
| `packages/vrender-core/src/common/performance-raf.ts` | 新增 `wait()` Promise 包装 |
| `packages/vrender-core/src/graphic/graphic.ts` | deferred commit 入口、`submitUpdateByDelta()` 观测、同步/异步切换边界 |
| `packages/vrender-core/src/graphic/group.ts` | Group 级 deferred config 参与上下文解析 |
| `packages/vrender-core/src/core/layer.ts` | Layer 级 deferred config 参与上下文解析 |
| `packages/vrender-core/src/graphic/state/shared-state-refresh.ts` | shared refresh queue 观测接入 |
| `packages/vrender-core/src/graphic/state/state-engine.ts` | 状态重算阶段成本采样接入 |
| `packages/vrender-core/src/graphic/state/attribute-update-classifier.ts` | deferred eligibility 所需的分类边界复用 |
| `packages/vrender-core/src/interface/stage.ts` | `statePerfConfig` / `getStatePerfSnapshot()` / deferred config 相关接口 |
| `packages/vrender-core/src/interface/layer.ts` | Layer deferred config 接口 |
| `packages/vrender-core/src/interface/graphic/group.ts` | Group deferred config 接口 |

### 建议新增文件

| 文件 | 责任 |
|------|------|
| `packages/vrender-core/src/graphic/state/state-perf-monitor.ts` | Stage 级 snapshot、计数器、事件环、低开销记录器 |
| `packages/vrender-core/src/graphic/state/state-batch-scheduler.ts` | `StateBatchJob`、single-intent job、coalesce / cancel / yield 主逻辑 |

### 必测文件

| 文件 | 说明 |
|------|------|
| `packages/vrender-core/__tests__/unit/graphic/state-perf-monitor.test.ts` | snapshot / counters / reason breakdown / cost 边界 |
| `packages/vrender-core/__tests__/unit/graphic/state-batch-scheduler.test.ts` | single-intent job、coalesce、cancel、yield |
| `packages/vrender-core/__tests__/unit/graphic/deferred-state-eligibility.test.ts` | strict paint-only 资格判定 |
| `packages/vrender-core/__tests__/unit/graphic/deferred-state-job-identity.test.ts` | `contextOwnerId + configFingerprint + targetStatesKey` identity |
| `packages/vrender-core/__tests__/unit/graphic/shared-state-refresh-observability.test.ts` | shared refresh 观测，不默认 deferred |

---

## 推荐实施切分

### Task 1：建立 Stage 级观测主入口

**目标**：先把 Phase 4 的观测边界变成稳定基础设施。

**必须完成**：

1. Stage 持有 `statePerfConfig`
2. 暴露 `getStatePerfSnapshot()` / `resetStatePerfSnapshot()`
3. 建立最小计数器与事件环
4. 把 `deferredIneligibleByReason`、`cost`、`allocationHints` 写进 snapshot

**验收标准**：

- 关闭事件环时无额外事件对象分配
- snapshot 足以区分 deferred ineligible reason 和边界阶段耗时

### Task 2：接入状态切换与 shared refresh 观测

**目标**：让状态提交与 shared refresh 都能被观测。

**必须完成**：

1. 在 `StateEngine` 状态重算结束处接入 resolver / patch cost
2. 在 `Graphic.submitUpdateByDelta()` 接入 category breakdown
3. 在 `shared-state-refresh.ts` 接入 queue / flush / renderScheduled 观测
4. 不把采样逻辑扩散到 render / pick / bounds 热路径

**验收标准**：

- 能看到 `paint / bounds / shape / layout / pick` 分类分布
- 能看到 shared refresh 规模与 shared refresh cost

### Task 3：建立 deferred context 解析与资格判定

**目标**：写死“谁能进 deferred、由谁提供 config、如何形成 identity”。

**必须完成**：

1. 解析最终生效的 `contextOwner`
2. 生成 `configFingerprint`
3. 形成 `targetStatesKey`
4. 严格执行 deferred 资格判定
5. 对不符合资格的图元记录 `deferredIneligibleByReason`

**验收标准**：

- 同 `targetStates` 但不同 owner/config 的图元不会进入同一 job
- 含 resolver 且 `affectedKeys` 不稳定时明确落入 ineligible

### Task 4：建立 single-intent StateBatchJob

**目标**：落地 Phase 4 最核心的调度模型。

**必须完成**：

1. `StateBatchJob` 数据模型
2. `pendingIntentByGraphic`
3. `jobsByIntentKey`
4. `pendingGraphics / orderedGraphics`
5. `cancel / remove / skip / complete` 规则

**验收标准**：

- 同图元最后一次状态意图胜出
- 旧 pending intent 不会迟到覆盖新状态
- job 取消只影响未提交的图元

### Task 5：落地 committed snapshot 与 yield 循环

**目标**：保证 deferred 真正可运行且语义一致。

**必须完成**：

1. `PerformanceRAF.wait()`
2. `frameBudget + maxGraphicsPerFrame` yield 逻辑
3. per-graphic committed snapshot 原子切换
4. render 调度复用现有 `stage.renderNextFrame()`

**验收标准**：

- deferred 模式下单个图元不出现半更新态
- yield 不会打破 single-intent identity 和 coalesce 语义

### Task 6：shared refresh 只观测不 deferred

**目标**：把 shared refresh 的边界写进实现，而不是默认扩到调度子系统。

**必须完成**：

1. shared refresh 相关观测接入 snapshot
2. shared refresh 不默认创建 batch job
3. 文档和测试明确这是一版边界，而不是遗漏

**验收标准**：

- shared refresh 高峰能被观测
- 不会因为 Phase 4 实现而偷偷把 shared refresh 改成 deferred

### Task 7：测试矩阵与回归验证

**目标**：用最小但充分的测试证明 Phase 4 闭环。

**必须完成**：

1. `state-perf-monitor` 专项测试
2. deferred eligibility / identity / job lifecycle 测试
3. committed snapshot 语义测试
4. shared refresh 观测边界测试
5. 现有状态回归不被破坏

**验收标准**：

- Phase 4 的关键约束都有专项测试对应
- 既有状态系统语义不回退

---

## 关键校验场景

### 场景 A：5k~50k paint-only 联动

要求：

1. 可进入 deferred
2. 可多帧收敛
3. job 总量、yield 次数、每帧处理量可见

### 场景 B：混合几何状态

要求：

1. 非 `paint-only` 图元不得进入 deferred
2. `deferredIneligibleByReason` 可见
3. 同步路径不被拖慢

### 场景 C：shared refresh 高峰

要求：

1. 能看到 queued / flushed / renderScheduled
2. 能看到 shared refresh cost
3. 第一版不默认 deferred

### 场景 D：图元连续收到新状态意图

要求：

1. 最后一次意图胜出
2. 旧 pending intent 不迟到提交
3. coalesced / cancelled 次数可见

### 场景 E：同状态意图但不同 owner/config

要求：

1. 不得错误合并到同一 job
2. reparent / config 变化后正确迁移 identity

---

## 实现边界

以下事情你可以做：

- 改 `stage.ts`、`layer.ts`、`group.ts`、`graphic.ts`
- 改 `performance-raf.ts`
- 新增 perf monitor 与 batch scheduler 辅助文件
- 新增 Phase 4 专项测试

以下事情这次不要做：

- 把 deferred 扩到 geometry / bounds / pick / layout
- 把 shared refresh 默认接入 deferred
- 做跨图元 resolver 输出缓存
- 重开 Phase 2 / Phase 3 主模型
- 处理 `Glyph ownership` 的最终实现

---

## 提交前必须确认

在你准备提交实现前，请确保以下问题都有明确答案：

1. Stage 级 snapshot 是否真的能回答 deferred ineligible reason？
2. `cost` 是否足够区分 resolver / patch / shared refresh / batch slice？
3. deferred 资格是否仍严格限制在 `paint-only`？
4. job identity 是否真的绑定了 `contextOwnerId + configFingerprint + targetStatesKey`？
5. reparent / config 变化后，graphic 是否会迁移到新 identity job？
6. committed snapshot 是否仍保持 per-graphic 原子切换？
7. shared refresh 是否仍只做观测，没有被偷偷接成 deferred？
8. resolver cache 是否仍然没有跨图元共享？

---

## 何时必须先停下来反馈

如果遇到以下任一情况，不要自行降级，先反馈：

1. deferred 无法严格限制在 `paint-only`
2. 不引入 `pendingIntentByGraphic` 就无法保证最后一次意图胜出
3. job identity 如果不绑定 owner/config 就无法解释区域级配置
4. shared refresh 必须接入 deferred 才能成立
5. 需要把观测扩到 render / pick / bounds 热路径才能得到有效数据
6. resolver cache 如果不跨图元共享就无法达到可接受性能

---

## 验证要求

最低要求：

1. `rush compile -t @visactor/vrender-core`
2. Phase 4 专项测试通过
3. 新增专项测试至少覆盖：
   - snapshot / reason breakdown / cost
   - deferred eligibility
   - single-intent job / coalesce / cancel
   - owner/config identity
   - committed snapshot
   - shared refresh observability

---

**执行原则**：Phase 4 第一版先把“观测 + strict paint-only deferred”做对，不追求把所有大规模状态切换都统一塞进调度器。  
**如果实现过程中发现 owner/config identity 无法稳定解析，请先提出，不要偷偷放宽 job 合并规则。**
