# D3 Phase 4 实现留档

> **用途**：记录 Phase 4 实现过程中的关键发现、实现取舍、blocker、验证结果
> **维护者**：Phase 4 实现 agent
> **状态**：已关闭（实现已完成、已通过复核并完成 close-out）

---

## 使用要求

本文件不是可选附件，而是 Phase 4 执行过程的一部分。

这不是设计文档的副本。不要在这里重复 telemetry、deferred、job identity 或 cache 边界的正文；这里只记录执行过程中真正影响实现和验收的信息。

以下内容必须留档：

1. 任务分段完成情况
2. 与设计文档不一致的代码现实
3. 影响实现路径的关键判断
4. blocker / 风险
5. 关键验证结果
6. 剩余非阻塞后续项的推进情况

禁止只记录低信息量状态，例如：

- “开始开发”
- “继续处理”
- “差不多完成”

每条记录都必须让后续阅读者能回答：

- 发生了什么
- 为什么重要
- 是否与设计有差异
- 如何影响实现、验证或完成定义

---

## 当前跟踪的非阻塞后续项

以下两项继续跟踪，但不阻塞 Phase 4 主路径实现：

1. `graphic.states` missing-state fallback 的告警策略
   - 候选：只在开发模式告警
   - 候选：默认输出 deprecated 提示
2. `Glyph ownership` 的文档拆分方式
   - 候选：单独出文档
   - 候选：并入后续章节

如果实现过程中触碰这两项，必须记录：

- 为什么需要触碰
- 是否影响当前 Phase 4 完成定义
- 是否仍保持非阻塞属性

---

## 推荐记录格式

```md
### YYYY-MM-DD HH:mm — Task X / 标题

- 背景：
- 实现/结论：
- 是否与设计有差异：
- 影响文件：
- 验证：
- 是否影响完成定义：
- 剩余动作/后续项：
```

---

## 实现记录

### 2026-04-09 Phase 4 执行基线建立

- 背景：
  Phase 4 设计文档、实施任务文档、开发者 prompt 与评审说明已经收口到同一条主线，需要建立正式执行入口和实现留档基线。
- 实现/结论：
  1. 已建立 `D3_PHASE4_EXECUTION_PROMPT.md` 作为 Phase 4 最高优先级执行文档。
  2. 已明确 Phase 4 执行优先级：期望文档 > execution prompt > Phase 4 正式设计文档 > 总体架构文档 > 实施任务文档 > 开发者 prompt > review notes。
  3. 已明确 Phase 4 当前要实现的是：观测边界、strict `paint-only` deferred、`single-intent job`、owner/config identity、per-graphic committed snapshot。
  4. 已将 `graphic.states` 告警策略和 `Glyph ownership` 文档拆分方式继续保留为非阻塞后续项，不作为本轮实现 blocker。
- 是否与设计有差异：
  否。仅把已拍板边界转写为执行文档与留档要求。
- 影响文件：
  `docs/refactor/state-engine/D3_PHASE4_EXECUTION_PROMPT.md`
  `docs/refactor/state-engine/D3_PHASE4_IMPLEMENTATION_LOG.md`
  `docs/refactor/state-engine/README.md`
- 验证：
  已完成文档自检，确认 Phase 4 设计、实施任务文档、开发者 prompt、review notes 与 execution prompt 的状态字段和主语义一致；尚未开始代码实现。
- 是否影响完成定义：
  否。该条目用于建立执行基线，不代表任何代码任务已完成。
- 剩余动作/后续项：
  1. 由实现 agent 按 execution prompt 启动代码实现。
  2. 后续每完成一个主任务、发现一个 blocker 或完成一次关键验证，都必须继续回填本日志。

### 2026-04-09 20:05 — Task 1 / Phase 4 入口与测试基线收口

- 背景：
  现状代码里还没有 Stage 级 perf snapshot、deferred config、single-intent state batch scheduler，也没有可直接覆盖 Phase 4 完成定义的专项测试。
- 实现/结论：
  1. 先补了 Phase 4 五组专项测试草稿，直接覆盖 snapshot / eligibility / scheduler / identity / shared refresh observability。
  2. 实现入口收口为 `Stage.scheduleStateBatch(graphics, targetStates)` 的薄桥接；真正的 deferred 资格、job identity、pending intent 和 committed snapshot 逻辑全部放在独立 `StateBatchScheduler` 中。
  3. 这个入口选择是实现级取舍，不改变 Phase 4 已拍板的核心架构判断；它只是给上层和测试提供一个稳定调用点，避免把批量调度逻辑重新散落到 `Graphic.useStates()`。
- 是否与设计有差异：
  轻微实现补充。设计文档明确了 scheduler/job/config/identity，但没有写死“谁是最薄调用入口”。本次选择 `Stage.scheduleStateBatch()` 作为薄入口，不改变 execution prompt 的主路径。
- 影响文件：
  `packages/vrender-core/__tests__/unit/graphic/state-perf-monitor.test.ts`
  `packages/vrender-core/__tests__/unit/graphic/deferred-state-eligibility.test.ts`
  `packages/vrender-core/__tests__/unit/graphic/state-batch-scheduler.test.ts`
  `packages/vrender-core/__tests__/unit/graphic/deferred-state-job-identity.test.ts`
  `packages/vrender-core/__tests__/unit/graphic/shared-state-refresh-observability.test.ts`
  `packages/vrender-core/src/core/stage.ts`
  `packages/vrender-core/src/graphic/state/state-batch-scheduler.ts`
- 验证：
  第一轮专项测试已运行，失败点集中在预期内的新接口/新子系统缺口：
  - `StatePerfMonitor` 文件与类型尚不存在
  - `Stage.statePerfConfig / deferredStateConfig / getStatePerfSnapshot / scheduleStateBatch` 尚未接入
  - resolver unstable-key 场景测试需按现有 `StateDefinition` 类型补 `name`
- 是否影响完成定义：
  否。该条目用于固定 Phase 4 的实现入口和 failing-test 基线。
- 剩余动作/后续项：
  1. 完成 `StatePerfMonitor`、`StateBatchScheduler`、`PerformanceRAF.wait()` 和 Stage 接口接入。
  2. 接入 `StateEngine` / `submitUpdateByDelta()` / shared refresh 观测。
  3. 复跑专项测试并根据失败结果收口 committed snapshot 与 identity 迁移细节。

### 2026-04-09 22:10 — Task 2-6 / Phase 4 主体实现落地

- 背景：
  Phase 4 需要把 perf snapshot、strict `paint-only` deferred、`single-intent job`、owner/config identity 与 per-graphic committed snapshot 接进现有 D3 状态主路径，同时不能把状态解释带回 render / pick / bounds 热路径。
- 实现/结论：
  1. 新增 `StatePerfMonitor`，由 Stage 统一持有 snapshot，覆盖 `deferredIneligibleByReason / cost / allocationHints` 与受限事件环。
  2. 新增 `StateBatchScheduler`，将 deferred 资格判断、`pendingIntentByGraphic`、`jobsByIntentKey`、identity 迁移、per-graphic committed snapshot 全部集中到单独调度器中；`Stage.scheduleStateBatch()` 仅作为薄桥接入口。
  3. `PerformanceRAF.wait()` 已补齐，batch job 的 yield/commit 循环不再依赖自定义空转逻辑。
  4. `StateEngine`、`submitUpdateByDelta()`、shared refresh queue、shared scope freshness 路径已接入最小观测点；resolver cache 继续严格保持 per-graphic，不做跨图元共享。
  5. strict deferred 资格已按 execution prompt 固定为显式启用 + 批量 + `paint-only`；任何 `PICK / BOUNDS / SHAPE / TRANSFORM / LAYOUT`、resolver unstable keys 或非 batch 场景都会显式落回同步主路径并记录 ineligible reason。
  6. shared refresh 仍只做观测，不默认进入 deferred；这条边界保持不变。
- 是否与设计有差异：
  无原则性差异。实现级补充只有一点：以 `Stage.scheduleStateBatch()` 作为最薄入口，把已拍板的 Phase 4 调度语义集中到 `StateBatchScheduler`，避免把新逻辑重新散落回 `Graphic.useStates()`。
- 影响文件：
  `packages/vrender-core/src/graphic/state/state-perf-monitor.ts`
  `packages/vrender-core/src/graphic/state/state-batch-scheduler.ts`
  `packages/vrender-core/src/common/performance-raf.ts`
  `packages/vrender-core/src/core/global.ts`
  `packages/vrender-core/src/core/stage.ts`
  `packages/vrender-core/src/graphic/group.ts`
  `packages/vrender-core/src/graphic/graphic.ts`
  `packages/vrender-core/src/graphic/state/state-engine.ts`
  `packages/vrender-core/src/graphic/state/shared-state-refresh.ts`
  `packages/vrender-core/src/graphic/state/shared-state-scope.ts`
  `packages/vrender-core/src/graphic/state/attribute-update-classifier.ts`
  `packages/vrender-core/src/interface/global.ts`
  `packages/vrender-core/src/interface/stage.ts`
  `packages/vrender-core/src/interface/graphic/group.ts`
  以及 Phase 4 五组专项测试文件
- 验证：
  1. Phase 4 专项测试首轮收口后已通过：
     - `state-perf-monitor`
     - `deferred-state-eligibility`
     - `state-batch-scheduler`
     - `deferred-state-job-identity`
     - `shared-state-refresh-observability`
  2. `rush compile -t @visactor/vrender-core` 已通过。
- 是否影响完成定义：
  是。该条目标记 Phase 4 主体实现已达到 execution prompt 的主路径要求，但还需要补完全量回归验证后才能给出最终 implemented 结论。
- 剩余动作/后续项：
  1. 跑 `vrender-core` 全量测试，确认没有把既有状态/Stage/Layer 路径打坏。
  2. 如全量回归暴露兼容性问题，只做最小 fixup，不扩展 Phase 4 范围。
  3. 继续保留 `graphic.states` missing-state fallback 告警策略与 `Glyph ownership` 文档拆分方式为非阻塞后续项。

### 2026-04-09 22:32 — Verification / 全量回归与兼容 fixup 收口

- 背景：
  `vrender-core` 全量测试首轮回归暴露了两个兼容问题：默认 layer 在 `Stage` 构造期绑定 `stage` 的时机过晚，导致 smoke render 路径里 `drawContext.stage` 为空；同时 `clearStates()` 在空状态幂等调用时没有保持历史 `currentStates=[]` 的兼容外观。
- 实现/结论：
  1. 将 `Stage` 自引用提前到默认 layer append 前，保证默认 layer 在真实构造路径中拿到稳定的 `stage`。
  2. 修正 `Graphic.clearStates()` 的空状态幂等分支：保持 `currentStates=[]`、`effectiveStates=[]`、`resolvedStatePatch=undefined` 与 shared registration 清理，避免重复 clear 场景下暴露 `undefined`。
  3. 这两处都是兼容 fixup，不改变 Phase 4 的 perf / deferred / job identity / cache 边界。
- 是否与设计有差异：
  无。属于对现有运行时兼容契约的补丁，不涉及 Phase 4 架构调整。
- 影响文件：
  `packages/vrender-core/src/core/stage.ts`
  `packages/vrender-core/src/graphic/graphic.ts`
  `packages/vrender-core/__tests__/unit/smoke/stage-graphic.test.ts`
  `packages/vrender-core/__tests__/unit/graphic/graphic-state.test.ts`
- 验证：
  1. 定向回归：
     - `__tests__/unit/smoke/stage-graphic.test.ts`
     - `__tests__/unit/graphic/graphic-state.test.ts`
     已通过，`25/25` tests。
  2. `rush compile -t @visactor/vrender-core` 通过。
  3. `packages/vrender-core` `rushx test` 全量通过：`94/94` suites，`478/478` tests。
  4. 受影响上层包编译通过：
     - `packages/vrender`
     - `packages/vrender-kits`
     - `packages/vrender-components`
  5. 定向 ESLint 已补跑，覆盖本轮修改文件。
- 是否影响完成定义：
  否，且这条记录意味着 Phase 4 当前实现已经具备对外汇报 `implemented` 的验证证据。
- 剩余动作/后续项：
  1. `graphic.states` missing-state fallback 告警策略继续保留为非阻塞后续项。
  2. `Glyph ownership` 文档拆分方式继续保留为非阻塞后续项。
  3. `ts-jest sourceMap: false` 仍是仓库既有 warning，不作为本轮 blocker。

### 2026-04-09 23:05 — Close-out / Phase 4 正式关闭

- 背景：
  Phase 4 主体实现已经完成，并已收到架构复核结论“通过，可以进入 Phase 4 close-out”。这一步需要确认 review verdict 仍为 `Approve`、不存在未关闭 blocker，并把相关文档、验收说明与实现留档全部同步到最终状态。
- 实现/结论：
  1. 已确认 Phase 4 当前实现结论保持 `Approve`，且不存在未关闭 blocker。
  2. 已同步 Phase 4 文档状态到 `closed`：
     - `D3_PHASE4_PERFORMANCE_DESIGN.md`
     - `D3_PHASE4_IMPLEMENTATION_GUIDE.md`
     - `D3_PHASE4_DEVELOPER_PROMPT.md`
     - `D3_PHASE4_REVIEW_NOTES.md`
     - `D3_PHASE4_EXECUTION_PROMPT.md`
     - `README.md`
     - `D3_ARCH_DESIGN.md`
  3. 已新增 `D3_PHASE4_CLOSEOUT_PROMPT.md` 与 `D3_PHASE4_ACCEPTANCE_TEMPLATE.md`，用于固定 Phase 4 close-out gate 与最终验收结构。
  4. `D3_PHASE4_ACCEPTANCE_TEMPLATE.md` 已按模板写入本次最终验收说明，确认 Phase 4 可以正式 `closed`。
- 是否与设计有差异：
  无。该条目只做 close-out 留档与文档状态同步，不改变 Phase 4 实现或边界。
- 影响文件：
  `docs/refactor/state-engine/D3_PHASE4_PERFORMANCE_DESIGN.md`
  `docs/refactor/state-engine/D3_PHASE4_IMPLEMENTATION_GUIDE.md`
  `docs/refactor/state-engine/D3_PHASE4_DEVELOPER_PROMPT.md`
  `docs/refactor/state-engine/D3_PHASE4_REVIEW_NOTES.md`
  `docs/refactor/state-engine/D3_PHASE4_EXECUTION_PROMPT.md`
  `docs/refactor/state-engine/D3_PHASE4_IMPLEMENTATION_LOG.md`
  `docs/refactor/state-engine/D3_PHASE4_CLOSEOUT_PROMPT.md`
  `docs/refactor/state-engine/D3_PHASE4_ACCEPTANCE_TEMPLATE.md`
  `docs/refactor/state-engine/README.md`
  `docs/refactor/state-engine/D3_ARCH_DESIGN.md`
- 验证：
  1. close-out gate 自检通过：`Approve` 结论仍有效，未发现未关闭 blocker。
  2. `D3_PHASE4_IMPLEMENTATION_LOG.md` 已包含主体实现、全量回归与最终 close-out 条目。
  3. `D3_PHASE4_ACCEPTANCE_TEMPLATE.md` 已形成最终验收说明。
  4. Phase 4 文档包、README 与总架构文档状态已完成一致性同步。
- 是否影响完成定义：
  否。该条目标志 Phase 4 已从“主体实现完成，待 close-out”切到“正式 closed”。
- 剩余动作/后续项：
  1. `graphic.states` missing-state fallback 告警策略继续作为非阻塞后续项。
  2. `Glyph ownership` 文档拆分方式继续作为非阻塞后续项。
