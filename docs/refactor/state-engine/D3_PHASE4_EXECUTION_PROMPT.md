# D3 Phase 4 最终执行指令

> **目标读者**：Phase 4 实现 agent
> **用途**：作为正式实现启动 prompt
> **设计基线**：`D3_PHASE4_PERFORMANCE_DESIGN.md`（v0.1） + `D3_ARCH_DESIGN.md`（v1.11）
> **状态**：已关闭（实现已完成、已通过复核并完成 close-out）

---

## 角色与目标

你现在作为 VRender D3 重构项目的实现 agent，负责落地 Phase 4。

这不是开放式设计讨论，而是按已拍板架构执行实现。你的目标不是“做出一个看起来快一点的版本”，而是交付一个满足 Phase 4 完成定义的实现。

请遵循以下原则：

1. 期望文档是最高约束。
2. 性能优先，但不把状态解释逻辑带回 render / pick / bounds 热路径。
3. 默认一致性优先；deferred 是显式启用的可选增强，不是新的默认状态模型。
4. strict `paint-only` 是 Phase 4 第一版的硬边界。
5. 不要把关键架构决策转回给协调者；本轮该拍板的都已拍板。

---

## 你必须先读

1. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/graphic-state-animation-refactor-expectation.md`
2. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE4_EXECUTION_PROMPT.md`
3. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE4_PERFORMANCE_DESIGN.md`
4. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_ARCH_DESIGN.md`
5. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE4_IMPLEMENTATION_GUIDE.md`
6. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE4_DEVELOPER_PROMPT.md`
7. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE4_REVIEW_NOTES.md`
8. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE4_IMPLEMENTATION_LOG.md`

---

## 执行依据优先级

本轮执行优先级固定如下：

1. `graphic-state-animation-refactor-expectation.md`
2. `D3_PHASE4_EXECUTION_PROMPT.md`
3. `D3_PHASE4_PERFORMANCE_DESIGN.md`
4. `D3_ARCH_DESIGN.md`
5. `D3_PHASE4_IMPLEMENTATION_GUIDE.md`
6. `D3_PHASE4_DEVELOPER_PROMPT.md`
7. `D3_PHASE4_REVIEW_NOTES.md`

如果后 4 份文档与 execution prompt 存在边角措辞冲突，以 execution prompt 为准。

---

## 已拍板的硬约束

### 1. 观测边界

Phase 4 第一版的观测点固定只允许落在：

1. `StateEngine` 状态重算结束
2. `Graphic.submitUpdateByDelta()` 分类结束
3. shared refresh queue 入队 / flush
4. batch job 创建、yield、完成、取消、合并
5. deferred ineligible 判定节点

固定禁止：

1. 不在 render 热路径中重新解释状态定义
2. 不在 pick / bounds 热路径做重型统计
3. 默认不开逐图元详细事件日志

### 2. Stage 级 snapshot

固定要求：

1. Stage 必须持有 `statePerfConfig`
2. Stage 必须暴露：
   - `getStatePerfSnapshot()`
   - `resetStatePerfSnapshot()`
3. snapshot 至少必须包含：
   - `deferredIneligibleByReason`
   - `cost`
   - `allocationHints`
4. `cost` 只允许在状态切换 / shared refresh / batch slice 边界做累计值 + 最大值
5. `allocationHints` 只统计本子系统内部可控对象创建次数，不承诺精确 GC / heap telemetry

### 3. strict paint-only deferred 资格

固定要求：

1. deferred 只对显式启用、批量状态切换、严格 `paint-only` 开放
2. `PICK / BOUNDS / SHAPE / TRANSFORM / LAYOUT` 一律不进入 deferred
3. 含 resolver 但无法稳定给出 `affectedKeys` 的状态，一律视为 deferred ineligible
4. shared refresh 第一版只做观测，不默认进入 deferred

### 4. single-intent job 与调度侧真值

固定要求：

1. `StateBatchJob` 必须采用 `single-intent job`
2. 一个 job 只能表示一种状态意图
3. `pendingIntentByGraphic` 是最后一次意图胜出的唯一调度侧真值
4. 旧 pending intent 不得迟到覆盖新状态

### 5. job identity 与上下文语义

固定要求：

1. job identity 固定绑定：
   - `contextOwnerId`
   - `configFingerprint`
   - `targetStatesKey`
2. 相同 `targetStates` 但不同 owner / config，不能合并成同一 job
3. reparent、contextOwner 变化、区域级 config 变化时，必须重新解析 identity
4. identity 改变时，必须从旧 job 移除并重新归入新 job
5. 若新上下文不再符合 deferred 资格，必须回退到同步主路径

### 6. per-graphic committed snapshot

固定要求：

1. 图元入队后，不立即切换 `activeStates / attribute`
2. deferred 期间每个 graphic 只允许保留一个 committed snapshot
3. 真正 commit 时必须一次性完成：
   - 状态集合切换
   - patch 重算
   - `_syncAttribute()`
   - update tag 提交
4. 单图元内部不允许出现“状态已变、属性未变”的半更新态

### 7. cache 边界

固定要求：

1. 只能做局部复用、队列去重、分类结果复用
2. 不允许跨图元共享 resolver 输出缓存
3. 不允许引入新的 source of truth
4. 不允许借 Phase 4 重开 Phase 2 / Phase 3 主模型

### 8. 本轮禁止事项

以下事情这次不要做：

1. 把 deferred 扩到 geometry / bounds / pick / layout
2. 把 shared refresh 默认接入 deferred
3. 做跨图元 resolver 输出缓存
4. 重开 Phase 2 / Phase 3 主模型
5. 处理 `Glyph ownership` 的最终实现

---

## 主要实现文件

优先关注：

- `packages/vrender-core/src/core/stage.ts`
- `packages/vrender-core/src/common/performance-raf.ts`
- `packages/vrender-core/src/graphic/graphic.ts`
- `packages/vrender-core/src/graphic/group.ts`
- `packages/vrender-core/src/core/layer.ts`
- `packages/vrender-core/src/graphic/state/shared-state-refresh.ts`
- `packages/vrender-core/src/graphic/state/state-engine.ts`
- `packages/vrender-core/src/graphic/state/attribute-update-classifier.ts`
- `packages/vrender-core/src/interface/stage.ts`
- `packages/vrender-core/src/interface/layer.ts`
- `packages/vrender-core/src/interface/graphic/group.ts`

如有需要可新增：

- `packages/vrender-core/src/graphic/state/state-perf-monitor.ts`
- `packages/vrender-core/src/graphic/state/state-batch-scheduler.ts`

建议同步建立或更新测试：

- `packages/vrender-core/__tests__/unit/graphic/state-perf-monitor.test.ts`
- `packages/vrender-core/__tests__/unit/graphic/state-batch-scheduler.test.ts`
- `packages/vrender-core/__tests__/unit/graphic/deferred-state-eligibility.test.ts`
- `packages/vrender-core/__tests__/unit/graphic/deferred-state-job-identity.test.ts`
- `packages/vrender-core/__tests__/unit/graphic/shared-state-refresh-observability.test.ts`

---

## 实现任务

按这个顺序做：

1. 建立 Stage 级 `statePerfConfig`、snapshot 和最小事件环。
2. 接入状态切换、`submitUpdateByDelta()`、shared refresh、batch job 的观测边界。
3. 建立 deferred context 解析、strict `paint-only` 资格判定和 `deferredIneligibleByReason`。
4. 落地 `single-intent StateBatchJob`、`pendingIntentByGraphic` 与 `jobsByIntentKey`。
5. 落地 `contextOwnerId + configFingerprint + targetStatesKey` identity 解析与迁移规则。
6. 建立 per-graphic committed snapshot 与 yield 循环。
7. 建立 Phase 4 专项测试矩阵，并同步回填实现留档。

---

## 必须验证的场景

### 场景 A：5k~50k 纯视觉联动

只改 `fill / opacity / shadowColor`，应允许进入 deferred，并可观测 job/yield/每帧处理量。

### 场景 B：混合几何状态

存在 `lineWidth / width / height` 时，不得进入 deferred，并且能看到 ineligible reason。

### 场景 C：shared refresh 高峰

Group shared definitions 变化时，应可观测 `queued / flushed / renderScheduled / sharedRefreshCost`，但不默认分帧。

### 场景 D：连续交互覆盖旧意图

旧 pending intent 不得迟到覆盖新状态，最后一次意图必须胜出。

### 场景 E：相同状态意图但不同 owner/config

不同 Group / Layer / Stage 生效上下文下，不得错误合并成同一 job。

---

## 过程留档要求

开发过程中，重要内容不能只停留在聊天记录里。你必须同步维护：

`/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE4_IMPLEMENTATION_LOG.md`

至少在以下时机更新：

1. 完成一个主任务时
2. 发现与设计不一致的代码现实时
3. 做出实现级取舍时
4. 遇到 blocker 或阶段性风险时
5. 完成一次关键验证时

留档要求：

1. 只记录执行信息，不重复设计文档正文。
2. 每条记录至少写清：背景、实现/结论、是否与设计有差异、影响文件、验证结果、后续动作。
3. `graphic.states` 告警策略和 `Glyph ownership` 文档拆分方式继续作为后续项跟踪，但不阻塞本轮实现。

---

## 何时必须先停下来反馈

如果遇到以下任一情况，不要自行降级，先反馈：

1. deferred 无法严格限制在 `paint-only`
2. 如果不绑定 owner/config 就无法解释区域级策略，却又无法稳定获得 `contextOwnerId / configFingerprint`
3. 不引入 `pendingIntentByGraphic` 就无法保证最后一次意图胜出
4. shared refresh 必须接入 deferred 才能成立
5. 想要有效 telemetry 必须回到 render / pick / bounds 热路径
6. resolver cache 如果不跨图元共享就无法工作

---

## 最低验证要求

至少执行并汇报这些：

1. `rush compile -t @visactor/vrender-core`
2. Phase 4 专项测试
3. 新增专项测试至少覆盖：
   - snapshot / reason breakdown / cost
   - deferred eligibility
   - single-intent job / coalesce / cancel
   - owner/config identity
   - committed snapshot
   - shared refresh observability
4. 如实现触及额外路径，补充对应定向测试

---

## 完成定义

满足以下条件，Phase 4 才能进入“实现完成”状态：

1. Stage 级 snapshot 与最小事件环已建立，并能稳定提供 `deferredIneligibleByReason`、`cost`、`allocationHints`
2. 观测边界仍只停留在状态切换 / shared refresh / batch job 边界
3. deferred 资格仍被严格限制在显式启用的 `paint-only` 批量状态切换
4. `StateBatchJob` 已闭环为 `single-intent job`
5. 同图元最后一次状态意图胜出已由 `pendingIntentByGraphic` 承接
6. job identity 已闭环到 `contextOwnerId + configFingerprint + targetStatesKey`
7. per-graphic committed snapshot 契约成立
8. shared refresh 第一版仍只做观测，不默认 deferred
9. cache 边界仍没有跨图元 resolver 输出缓存
10. 文档、测试、实现语义一致，并已回填实现留档

---

## 当前跟踪的非阻塞后续项

以下两项继续跟踪，但不阻塞本轮实现：

1. `graphic.states` missing-state fallback 的告警策略：
   - 开发模式告警
   - 或默认输出 deprecated 提示
2. `Glyph ownership` 的文档拆分方式：
   - 单独出文档
   - 或并入后续章节

如果实现过程中必须触碰这两项，请最小化改动、同步留档，并避免把它们扩大成新的架构分支。

---

## 你的输出格式

请按下面格式回复：

1. `Implementation summary`
2. `Files changed`
3. `Documentation updates`
4. `Verification`
5. `Remaining non-blocking follow-ups`
6. `Can Phase 4 be marked implemented`

要求：

- 先说明是否满足完成定义
- 如果任一完成条件不满足，直接列 blocker
- 明确引用你更新过的 implementation log 条目
- 不要把关键架构判断再抛回给协调者
