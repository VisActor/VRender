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

### 2026-04-09 23:42 — Pre-handoff hardening / 动画属性级补测与上层红灯收口（阶段性）

- 背景：
  D3 Phase 1-4 已关闭，但 `D3_PRE_HANDOFF_HARDENING.md` 明确指出仓库还缺少真实属性级动画测试，且 `packages/vrender rushx test`、`packages/react-vrender rushx test` 已有实跑红灯，不能直接 handoff 给上层图表库。
- 实现/结论：
  1. 新增 `packages/vrender-animate/__tests__/unit/animation-runtime-attribute.test.ts`，用 `ManualTicker` 补齐了真实属性级覆盖：
     - 状态动画 `t=0 / t=mid / t=end`
     - `animate.to(...) / from(...)`
     - 状态动画进行中再次切状态
     - 自驱动画同属性遇到状态切换
     - `removeChild / removeAllChild / setStage(null) / reparent` 边界
  2. 动画运行时收口了 4 条直接影响 handoff gate 的问题：
     - `Step.onEnd()` 不再把 step props 反写入 base
     - `Animate.advance()` 自然结束时立即走 `restoreStaticAttribute()`
     - `Animate.from()` 改接 `FromTo`，并把 `from` 起始帧改成 transient 写入，避免污染 `baseAttributes`
     - `Graphic.setStage()` 对 stage-bound animations 的 `detach / rebind` 逻辑收口，避免旧 timeline 迟到写回
  3. `packages/vrender/__tests__/graphic/graphic-state.test.ts` 已按 D3 真值模型改写：
     - `normalAttrs` 只再作为 `baseAttributes` 的 deprecated alias 断言
     - 旧的 snapshot/restore/null 外观断言已移除
  4. `packages/react-vrender` 已完成本轮最小适配：
     - `src/Stage.tsx` 显式收口 `createStage()` 返回类型与 object-ref 赋值
     - 卸载时显式 `release`
     - `__tests__/unit/hostConfig.test.ts` 改成同步可收敛的 reconciler mock，消除测试结束后的异步 document 生命周期错误
- 是否与设计有差异：
  无原则性差异。本轮修的都是 D3 既有契约下的实现/验证缺口：
  - 动画结束不得污染静态真值
  - `from()` 起点不得污染 base
  - detach/reparent 不得出现旧 timeline 迟到写回
  - 上层包测试要对齐 D3 真值模型与新生命周期
- 影响文件：
  `packages/vrender-animate/__tests__/unit/animation-runtime-attribute.test.ts`
  `packages/vrender-animate/src/step.ts`
  `packages/vrender-animate/src/animate.ts`
  `packages/vrender-animate/src/custom/fromTo.ts`
  `packages/vrender-core/src/graphic/graphic.ts`
  `packages/vrender/__tests__/graphic/graphic-state.test.ts`
  `packages/react-vrender/src/Stage.tsx`
  `packages/react-vrender/__tests__/unit/Stage.test.tsx`
  `packages/react-vrender/__tests__/unit/hostConfig.test.ts`
- 验证：
  1. `packages/vrender-animate` 定向新测试通过：`8/8` tests
  2. `packages/vrender` 定向状态测试通过：`9/9` tests
  3. `packages/react-vrender` 定向 `Stage + hostConfig` 测试通过：`6/6` tests
- 是否影响完成定义：
  是。该条目直接影响 handoff gate：
  - 动画属性级专项测试已从“缺失”变为“具备基线并通过”
  - `vrender` / `react-vrender` 的已知 P0 红灯已完成定向收口
  但完整 release gate 还未跑完，因此当前仍不能宣告 handoff ready。
- 剩余动作/后续项：
  1. 运行完整 release gate：
     - `rush compile -t @visactor/vrender-core`
     - `packages/vrender-core rushx test`
     - `packages/vrender-animate rushx test`
     - `packages/vrender rushx test`
     - `packages/react-vrender rushx test`
     - 受影响上层包 compile
  2. gate 全通过后，再补一条最终 hardening 结论。
  3. `graphic.states` 告警策略与 `Glyph ownership` 继续维持为非阻塞后续项，不在本轮回升为 blocker。

### 2026-04-09 23:58 — Pre-handoff hardening / release gate 全通过，进入 handoff ready

- 背景：
  上一条阶段性记录已经完成动画属性级补测与 `vrender` / `react-vrender` 已知红灯的定向收口，但 `D3_PRE_HANDOFF_HARDENING.md` 要求必须补跑完整 release gate，全部通过后才能汇报 handoff ready。
- 实现/结论：
  1. 完整 release gate 已全部通过，当前仓库满足 handoff 前的 P0 要求：
     - `rush compile -t @visactor/vrender-core`
     - `packages/vrender-core rushx test`
     - `packages/vrender-animate rushx test`
     - `packages/vrender rushx test`
     - `packages/react-vrender rushx test`
     - 受影响上层包 compile（`vrender` / `vrender-kits` / `vrender-components`）
  2. 动画专项测试已正式进入稳定基线：
     - `packages/vrender-animate/__tests__/unit/animation-runtime-attribute.test.ts`
     - 覆盖真实属性级 `t=0 / t=mid / t=end`
     - 覆盖 `animate.to(...) / from(...)`
     - 覆盖状态动画/自驱动画冲突
     - 覆盖 `removeChild / removeAllChild / setStage(null) / reparent`
  3. `packages/vrender` 与 `packages/react-vrender` 的 P0 红灯已被证实是“测试/绑定层未对齐 D3 新语义”，不是新的 D3 运行时回归；当前均已通过全量测试。
- 是否与设计有差异：
  无。该条目不引入新的设计判断，只确认 handoff 前必须补齐的验证与适配已经完成。
- 影响文件：
  `packages/vrender-animate/__tests__/unit/animation-runtime-attribute.test.ts`
  `packages/vrender-animate/src/step.ts`
  `packages/vrender-animate/src/animate.ts`
  `packages/vrender-animate/src/custom/fromTo.ts`
  `packages/vrender-core/src/graphic/graphic.ts`
  `packages/vrender/__tests__/graphic/graphic-state.test.ts`
  `packages/react-vrender/src/Stage.tsx`
  `packages/react-vrender/__tests__/unit/Stage.test.tsx`
  `packages/react-vrender/__tests__/unit/hostConfig.test.ts`
  `docs/refactor/state-engine/D3_PHASE4_IMPLEMENTATION_LOG.md`
- 验证：
  1. `rush compile -t @visactor/vrender-core`：通过
  2. `packages/vrender-core rushx test`：`94/94` suites，`478/478` tests
  3. `packages/vrender-animate rushx test`：`8/8` suites，`30/30` tests
  4. `packages/vrender rushx test`：`14/14` suites，`48/48` tests，`2 skipped`
  5. `packages/react-vrender rushx test`：`6/6` suites，`16/16` tests
  6. `packages/vrender rushx compile`：通过
  7. `packages/vrender-kits rushx compile`：通过
  8. `packages/vrender-components rushx compile`：通过
  9. `packages/react-vrender rushx compile`：通过（额外类型验证）
- 是否影响完成定义：
  是。该条目意味着 `D3_PRE_HANDOFF_HARDENING.md` 规定的 release gate 已全部满足，当前可以汇报 `handoff ready`。
- 剩余动作/后续项：
  1. `graphic.states` missing-state fallback 的告警策略，继续作为非阻塞 follow-up。
  2. `Glyph ownership` 文档拆分方式，继续作为非阻塞 follow-up。
  3. 不重开 D3 Phase 1-4 主设计，不在本轮继续扩围。

### 2026-04-10 00:08 — Pre-handoff smoke / browser harness 全量 triage 与 baseline 收口

- 背景：
  `D3_PRE_HANDOFF_SMOKE_HARNESS.md` 要求把 `packages/vrender rushx start` 收口为 handoff 前可用的 browser smoke harness。此前仓库缺少全量 triage 表、baseline 页默认首帧，以及 shared-state / batch-state 页面环境验证。
- 实现/结论：
  1. browser harness 已补齐 smoke telemetry、route helper 和页面切换 cleanup 辅助。
  2. 已修正 `jsx` / `react` 的 `tsx` 页面导入识别；`react` / `jsx` / `animate-state` / `interactive-test` 已补 smoke-mode 首帧路径。
  3. 已新增最小页面 `shared-state-batch-smoke.ts`，用于把 Phase 3/4 主链真正带入 browser harness。
  4. `run-smoke-triage.cjs` 已支持 baseline-only 和 route filter，baseline 可重复执行。
  5. baseline 已固定为 6 页：
     - `rect`
     - `state`
     - `animate-state`
     - `interactive-test`
     - `shared-state-batch-smoke`
     - `react`
- 是否与设计有差异：
  无。该条目只收口 smoke harness 的执行/验证能力，不重开 D3 Phase 1-4 主设计，也不把 `graphic.states` 告警策略与 `Glyph ownership` 升级为 blocker。
- 影响文件：
  `packages/vrender/__tests__/browser/src/harness.ts`
  `packages/vrender/__tests__/browser/src/main.ts`
  `packages/vrender/__tests__/browser/src/pages/index.ts`
  `packages/vrender/__tests__/browser/src/pages/animate-state.ts`
  `packages/vrender/__tests__/browser/src/pages/interactive-test.ts`
  `packages/vrender/__tests__/browser/src/pages/react.tsx`
  `packages/vrender/__tests__/browser/src/pages/jsx.tsx`
  `packages/vrender/__tests__/browser/src/pages/shared-state-batch-smoke.ts`
  `packages/vrender/__tests__/browser/scripts/run-smoke-triage.cjs`
  `packages/vrender/__tests__/unit/browser-smoke-harness.test.ts`
- 验证：
  1. `packages/vrender rushx start` server 可稳定启动。
  2. baseline-only smoke 复跑通过：
     - `animate-state`
     - `interactive-test`
     - `state`
     - `graphic`
     - `react`
     - `shared-state-batch-smoke`
  3. 全量 triage 已完成：`69` 页，`openFail=9`，`firstFrameFail=25`，不存在未分类致命失败。
  4. harness helper 单测通过：`browser-smoke-harness.test.ts`，`3/3` tests。
- 是否影响完成定义：
  是。该条目直接满足 pre-handoff smoke gate：
  - server 可启动
  - baseline 页全部通过
  - 全量页面 triage 已完成
  - 无未分类致命失败
- 剩余动作/后续项：
  1. 把 triage / baseline / exclusions / migration 结论落成独立文档，供上层 handoff 与后续维护者使用。
  2. 非阻塞 follow-up 仍仅保留：
     - `graphic.states` missing-state fallback 告警策略
     - `Glyph ownership` 文档拆分方式

### 2026-04-10 00:16 — Pre-handoff smoke / triage 与 migration 留档完成

- 背景：
  smoke gate 不只要求 baseline 跑通，还要求把 triage 结果、历史 exclusions 和上层迁移结论显式留档，避免后续维护者只能依赖临时 `/tmp` 产物或执行输出复盘。
- 实现/结论：
  1. 已新增 `D3_PRE_HANDOFF_SMOKE_TRIAGE.md`，集中记录：
     - baseline 清单
     - baseline-only 命令
     - 全量 triage 结果
     - 历史 exclusions
     - 上层迁移结论
  2. 已同步 `README.md`、`D3_ARCHIVE_INDEX.md`、`D3_PRE_HANDOFF_SMOKE_HARNESS.md`、`D3_PRE_HANDOFF_SMOKE_PROMPT.md`，让后续维护者能直接找到 smoke triage 留档。
  3. smoke harness 当前可作为 handoff 前最小 browser 集成验证环境使用；未进入 baseline 的历史页仍保留为 triage/migration 样本，不影响 handoff gate。
- 是否与设计有差异：
  无。该条目只做归档与导航同步，不修改已完成的 smoke harness 语义。
- 影响文件：
  `docs/refactor/state-engine/D3_PRE_HANDOFF_SMOKE_TRIAGE.md`
  `docs/refactor/state-engine/D3_PRE_HANDOFF_SMOKE_HARNESS.md`
  `docs/refactor/state-engine/D3_PRE_HANDOFF_SMOKE_PROMPT.md`
  `docs/refactor/state-engine/README.md`
  `docs/refactor/state-engine/D3_ARCHIVE_INDEX.md`
  `docs/refactor/state-engine/D3_PHASE4_IMPLEMENTATION_LOG.md`
- 验证：
  1. triage 文档已对齐全量 `/tmp/vrender-smoke-triage.json` 与 `/tmp/vrender-smoke-baseline.json` 结果。
  2. README / archive index / smoke 文档状态已同步为已完成。
  3. 本次文档留档不影响既有 handoff ready 结论，只补齐 smoke gate 的可追溯证据。
- 是否影响完成定义：
  是。该条目标志 pre-handoff smoke harness 的实现、验证和文档留档都已闭环。
- 剩余动作/后续项：
  1. `graphic.states` missing-state fallback 的告警策略，继续作为非阻塞 follow-up。
  2. `Glyph ownership` 文档拆分方式，继续作为非阻塞 follow-up。

### 2026-04-10 01:05 — Pre-handoff smoke / browser 空白页根因定位与 renderer registry 修复

- 背景：
  `rect` 页面在真实浏览器里出现“页面空白，但 `stage` 存在、`renderCount` 持续增长、scene tree 与 bounds 正常”的异常。仅凭 smoke telemetry、scene tree 或 `renderCount` 无法解释问题，需要进一步排查 browser 页真实渲染链。
- 实现/结论：
  1. 已确认 `createStage()` 是 legacy 兼容 API，但它不是本次空白页根因；`stage.defaultLayer` 也仍是正式接口，不是废弃调用。
  2. 通过 hidden Electron 调试脚本确认：空白页的真正问题是 `drawContribution.getRenderContribution(graphic)` 对 `rect / circle / group` 返回 `null`，也就是当前 app-scoped stage 没拿到默认 renderer registry。
  3. 根因是 D3 切到 app-scoped entry 后，browser bootstrap 仍主要走 legacy 注册函数；这些注册会建立 graphic creator / legacy binding，但不会自动把 renderer 注入当前 `AppContext.registry.renderer`。
  4. 已用最小修复收口：
     - `AppContext` 默认基于 app 自己的 `renderer/contribution registry` 组装 `DefaultDrawContribution + DefaultRenderService`
     - browser/node bootstrap 在执行默认 legacy 注册后，将 legacy binding context 中已有的 `GraphicRender` 与 `DrawItemInterceptor` 同步进当前 app registry
  5. `rect.ts` 同步收了两个页面噪音项：去掉 `width: NaN`，并显式注册 rough renderer；这两项不是根因，只是防止页面输入继续干扰判断。
- 是否与设计有差异：
  无原则性差异。本次没有恢复 `modules.ts` 全局默认初始化，也没有把 app-scoped stage 退回旧 `application.renderService`；只是把当前默认 browser bootstrap 与 app-scoped stage 依赖重新接通。
- 影响文件：
  `packages/vrender-core/src/entries/app-context.ts`
  `packages/vrender/src/entries/bootstrap.ts`
  `packages/vrender/__tests__/browser/src/pages/rect.ts`
  `packages/vrender/__tests__/browser/scripts/debug-rect-stage.cjs`
  `docs/refactor/state-engine/D3_PRE_HANDOFF_SMOKE_RENDERER_REGRESSION.md`
  `docs/refactor/state-engine/README.md`
  `docs/refactor/state-engine/D3_ARCHIVE_INDEX.md`
- 验证：
  1. `rush compile -t @visactor/vrender-core` 通过。
  2. `packages/vrender rushx compile` 通过。
  3. 单测通过：
     - `packages/vrender/__tests__/unit/entries.test.ts`
     - `packages/vrender-core/__tests__/unit/entries/app-context.test.ts`
  4. hidden Electron 下 `rect` / `state` 页已从 `selected renderer = null` 修复为：
     - `rect -> DefaultCanvasRectRender`
     - `group -> DefaultCanvasGroupRender`
     - `circle -> DefaultCanvasCircleRender`
     且像素采样能读到真实颜色，不再是全白。
- 是否影响 handoff gate：
  是。该条目收口的是 browser smoke 中一个会直接导致“页面空白但又不报错”的高风险问题；修复后，smoke harness 对 handoff 的可信度才成立。
- 剩余动作/后续项：
  1. `graphic.states` missing-state fallback 的告警策略，继续作为非阻塞 follow-up。
  2. `Glyph ownership` 文档拆分方式，继续作为非阻塞 follow-up。

### 2026-04-10 11:09 — Legacy path removal / P1 局部迁移推进，P0 runtime installer blocker 确认

- 背景：
  按 `D3_LEGACY_PATH_REMOVAL_PROMPT.md` 继续推进 legacy path removal 时，先从 repo 内部已知最小可迁移面入手：
  1. `react-vrender` 的 `Stage.tsx` 不能继续停留在 deprecated `createStage()`
  2. baseline browser 页需要统一切到 app-scoped page stage helper
  3. `docs/demos/src/pages/rect.ts` 已切到 `createBrowserVRenderApp().createStage()`，需要继续确认 repo 内真实包消费面是否仍存在旧声明/旧运行时入口分叉
- 实现/结论：
  1. `packages/react-vrender/src/Stage.tsx` 已改为 mount 时创建 browser app，再调用 `app.createStage()`；unmount 时先清 reconciler，再释放 stage/app。由于 `@visactor/vrender` 当前声明产物还没同步导出 `createBrowserVRenderApp()`，这里使用最小本地 cast 隔离缺失声明，不再继续依赖 deprecated `createStage()`。
  2. `packages/react-vrender/__tests__/unit/Stage.test.tsx` 已同步到 app-scoped mock，验证 mount/unmount 生命周期与 prop update gate。
  3. baseline browser 页已继续通过 `page-stage.ts` 统一走 app-scoped 创建路径；`docs/demos/src/pages/rect.ts` 也已切到新入口。
  4. 但在继续推进 `packages/vrender` 内部 caller removal 时，已确认存在 prompt 明确要求“必须停下来反馈”的 blocker：
     - `packages/vrender/src/entries/bootstrap.ts` 仍保留 `getLegacyBindingContext()` + `syncLegacyPipelineToAppRegistry()` 作为 app registry 的真实运行时桥接。
     - `vrender-kits` 当前 env / register / picker 主路径仍然默认装配到 legacy binding context；`vrender-components` 的 `loadPoptip()` / `loadScrollbar()` 也仍直接 `bind/rebind` legacy context。
     - 当试探性把 `packages/vrender/__tests__/core/stage.test.ts` 从 deprecated `createStage()` 切到 `createNodeVRenderApp().createStage()` 后，stage 创建会直接因为 `Window handler is not configured for env: browser` 失败，说明 app-scoped env/window/render pipeline 尚未形成可替代旧桥接的正式 installer surface。
  5. 因此当前结论不是“还有几处 import 没改”，而是：
     - `P1` 已有局部进展（`react-vrender`、baseline browser 页、docs demo）
     - 但 `P0` 仍被 runtime installer 缺口阻塞，不能在不补公共装配 API 的前提下继续硬删 legacy bridge
- 是否与设计有差异：
  无。本条目严格遵守 `D3_LEGACY_PATH_REMOVAL_PROMPT.md` 的停机条件：一旦确认 `vrender-kits` / `vrender-components` 没有现成 app-scoped installer 能力，且内部调用一旦切到 app path 就暴露 env/window/runtime 缺口，即停止继续扩大迁移范围并回填 blocker。
- 影响文件：
  `packages/react-vrender/src/Stage.tsx`
  `packages/react-vrender/__tests__/unit/Stage.test.tsx`
  `packages/vrender/__tests__/browser/src/page-stage.ts`
  `packages/vrender/__tests__/browser/src/main.ts`
  `packages/vrender/__tests__/browser/src/pages/rect.ts`
  `packages/vrender/__tests__/browser/src/pages/state.ts`
  `packages/vrender/__tests__/browser/src/pages/animate-state.ts`
  `packages/vrender/__tests__/browser/src/pages/interactive-test.ts`
  `packages/vrender/__tests__/browser/src/pages/shared-state-batch-smoke.ts`
  `packages/vrender/__tests__/browser/src/pages/react.tsx`
  `docs/demos/src/pages/rect.ts`
  `docs/refactor/state-engine/D3_PHASE4_IMPLEMENTATION_LOG.md`
- 所属层级：
  `P0` blocker 确认
  `P1` 局部迁移推进
  `P2` 仅完成 demo 入口局部迁移，尚未开始 lockfile/hygiene 收尾
- 验证：
  1. `packages/react-vrender rushx compile` 通过。
  2. `packages/react-vrender rushx test` 通过：`6/6 suites`，`16/16 tests`。
  3. 负向验证：`packages/vrender` 当前仍存在真实 red light：
     - `__tests__/core/stage.test.ts` 在 `pick` 路径会因为 `DefaultCanvasGroupRender.groupRenderContribitions` 缺失而崩溃，说明当前 `legacy -> app registry sync` 复制来的 renderer/contribution 仍不可靠
     - 当进一步试探性把内部 caller 切到 `createNodeVRenderApp().createStage()` 时，又会暴露 `Window handler is not configured for env: browser`，说明 app-scoped env/window/render pipeline 也尚未形成正式 installer surface
     同时源码扫描确认：
     - `packages/vrender/src/entries/bootstrap.ts` 仍依赖 `syncLegacyPipelineToAppRegistry()`
     - `vrender-kits` / `vrender-components` 仍大量依赖 `getLegacyBindingContext()` 和 legacy `bind/rebind`
  4. 当前这些失败不是 Node 版本或测试噪音，而是 runtime 主链尚未完成 app-scoped installer 化、legacy bridge 仍在承担正式功能链的真实 blocker。
- 是否仍阻塞 handoff：
  是。按 `D3_LEGACY_PATH_REMOVAL_PROMPT.md`，只有 `P0 + P1 + P2` 全部完成后才允许继续宣称 handoff ready；当前 `P0` 未完成，`P1/P2` 也仅完成局部收口，因此此轮 legacy path removal 尚未通过。
- 剩余动作/后续项：
  1. 先为 `vrender-kits` / `vrender-components` 建立正式 app-scoped installer surface，再继续删除 `legacy -> app registry sync`。
  2. 在 runtime installer 缺口补齐前，不再继续批量把 repo 内 `createStage()` 调用硬迁到 app-scoped 入口。
  3. `docs/demos/package.json` 中的 `inversify` 与 lockfile hygiene 仍待 `P2` 收尾处理。

### 2026-04-10 12:18 — Legacy path removal / 架构复核确认 blocked，handoff ready 改为历史态

- 背景：
  在对 `D3_LEGACY_PATH_REMOVAL_STATUS.md` 与当前源码做架构复核后，需要收口一个文档口径问题：`2026-04-09 23:58` 的 “进入 handoff ready” 只代表 pre-handoff hardening 子任务当时达到了自身门槛，不再等同于当前总体 handoff 结论。
- 实现/结论：
  1. 架构复核已确认 `legacy path removal` 当前状态为 `blocked`。
  2. `P0 / P1 / P2` 划分成立：
     - `P0` 未完成，且是真实 runtime installer blocker
     - `P1` 仅局部推进
     - `P2` 未完成
  3. 因此，`2026-04-09 23:58` 的 `handoff ready` 现在只应按**历史阶段性结论**理解。
  4. 当前总体 handoff 状态必须以下列文档为准：
     - `D3_LEGACY_PATH_REMOVAL_STATUS.md`
  5. 下一步不收窄 legacy removal 验收边界，而是先只补 `P0 installer surface`，停止继续扩大 `P1` caller replacement。
- 是否与设计有差异：
  无。该条目只收口当前总体状态与历史阶段结论的关系，不重开 D3 主设计，也不改变 legacy removal 的既定边界。
- 影响文件：
  `docs/refactor/state-engine/D3_PRE_HANDOFF_HARDENING_SUMMARY.md`
  `docs/refactor/state-engine/D3_PRE_HANDOFF_HARDENING.md`
  `docs/refactor/state-engine/D3_ARCHIVE_INDEX.md`
  `docs/refactor/state-engine/README.md`
  `docs/refactor/state-engine/D3_LEGACY_P0_INSTALLER_GUIDE.md`
  `docs/refactor/state-engine/D3_LEGACY_P0_INSTALLER_PROMPT.md`
- 验证：
  1. 架构复核确认 `packages/vrender/src/entries/bootstrap.ts` 仍依赖 `syncLegacyPipelineToAppRegistry()`。
  2. fresh 复跑 `packages/vrender` 定向 `stage.test.ts` 仍失败，证明 blocker 真实存在。
  3. 文档索引与留档状态已同步收口，不再把 `handoff ready` 当作当前时态结论。
- 是否仍阻塞 handoff：
  是。当前总体 handoff 继续被 legacy path removal 阻塞。

### 2026-04-10 12:51 — Legacy removal / P0 installer surface 收口完成，runtime blocker 解除

- 背景：
  按 `D3_LEGACY_P0_INSTALLER_PROMPT.md` 执行只聚焦 `P0 installer surface` 的下一轮收口，目标是：
  1. 为 `vrender-kits` 建立正式 app-scoped installer surface
  2. 为 `vrender-components` 建立 app/plugin-scoped installer surface
  3. 让 `vrender` bootstrap 不再依赖 `syncLegacyPipelineToAppRegistry()`
  4. 把 `packages/vrender/__tests__/core/stage.test.ts` 当前 runtime red light 收口
- 实现/结论：
  1. `packages/vrender-core/src/entries/runtime-installer.ts` 已正式接入并导出，承担 shared runtime installer context、application factory 配置、renderer/contribution/picker registry 安装。
  2. `packages/vrender-core/src/render/contributions/render/module.ts` 的 group render 绑定已改为 `toDynamicValue(...)`，不再依赖已删除的构造注入语义，解决了 `DefaultCanvasGroupRender.groupRenderContribitions` 为空的根因。
  3. `packages/vrender-kits/src/installers/app.ts` 已补齐：
     - `installBrowserEnvToApp`
     - `installNodeEnvToApp`
     - `installDefaultGraphicsToApp`
     - `installBrowserPickersToApp`
     - `installNodePickersToApp`
     正式 runtime 路径不再默认落到 `getLegacyBindingContext()`。
  4. `packages/vrender-components/src/poptip/module.ts` 与 `packages/vrender-components/src/scrollbar/module.ts` 已补 `installPoptipToApp` / `installScrollbarToApp`，新路径通过 runtime installer context 完成绑定；legacy `load*()` facade 仅保留兼容。
  5. `packages/vrender/src/entries/bootstrap.ts` 已改为：
     - browser/node app 直接调用 kits installer surface
     - 删除正式 runtime 对 `syncLegacyPipelineToAppRegistry()` 的依赖
     - `bootstrapLegacyVRenderRuntime()` 保留 legacy graphic/env facade，仅作为兼容路径
  6. 期间发现 browser picker 默认安装面过宽，`loadCanvasPicker()` 会额外绑定 `lottie` picker，而 default pipeline 未同步安装 lottie render，导致 `RectRender` 缺失；已将 browser default picker 安装面收窄为与默认 graphics 一致的集合，避免再次在 `stage.test.ts` 上暴露伪相关 red light。
  7. 结果上，`legacy removal` 当前已不再被 `P0 runtime installer blocker` 卡住；下一步可以继续推进 `P1`，但整体任务仍未完成，`P2` 也尚未开始收尾。
- 是否与设计有差异：
  无。本条目严格停留在 `P0 installer surface` 边界内：
  1. 没有继续扩大 `P1`
  2. 没有开始 `P2`
  3. 没有重开 D3 主设计
  4. 没有回退到 `legacy -> app registry sync`
- 影响文件：
  `packages/vrender-core/src/render/contributions/render/module.ts`
  `packages/vrender-core/src/entries/runtime-installer.ts`
  `packages/vrender-core/src/entries/index.ts`
  `packages/vrender-kits/src/installers/app.ts`
  `packages/vrender-kits/src/index-node.ts`
  `packages/vrender-components/src/poptip/module.ts`
  `packages/vrender-components/src/poptip/index.ts`
  `packages/vrender-components/src/scrollbar/module.ts`
  `packages/vrender/src/entries/bootstrap.ts`
  `packages/vrender/__tests__/unit/entries.test.ts`
  `packages/vrender-core/es/application.d.ts`
  `packages/vrender-core/es/index.d.ts`
  `packages/vrender-kits/es/index.d.ts`
  `packages/vrender-kits/es/index-node.d.ts`
  `packages/vrender-components/es/poptip/module.d.ts`
  `packages/vrender-components/es/poptip/index.d.ts`
  `packages/vrender-components/es/scrollbar/module.d.ts`
  `docs/refactor/state-engine/D3_LEGACY_PATH_REMOVAL_STATUS.md`
- 所属层级：
  `P0` completed
- 验证：
  1. `packages/vrender/__tests__/unit/entries.test.ts` 通过：`3/3 tests`
  2. `packages/vrender/__tests__/core/stage.test.ts` 通过：`resize` / `pick` 全绿
  3. `packages/vrender-core rushx compile` 通过
  4. `packages/vrender-kits rushx compile` 通过
  5. `packages/vrender-components rushx compile` 通过
  6. `packages/vrender rushx compile` 通过
  7. `packages/react-vrender rushx compile` 通过
  8. `packages/vrender rushx test` 通过：`15/15 suites`, `51/53 tests`，`2 skipped`
  9. `packages/react-vrender rushx test` 通过：`6/6 suites`, `16/16 tests`
  10. baseline browser smoke 通过：
      - `rect`
      - `state`
      - `animate-state`
      - `interactive-test`
      - `react`
      - `shared-state-batch-smoke`
      全部 `open=true`, `firstFrame=true`, `errors=0`
- 是否仍阻塞 handoff：
  是。当前总体 handoff 仍被 `legacy path removal` 阻塞，但阻塞面已从 `P0 runtime installer surface` 转移到 `P1/P2` 尚未完成。
- 剩余动作/后续项：
  1. 继续执行 `P1` caller removal，但不要继续扩大到 prompt 明确排除的迁移面。
  2. 在 `P1` 完成后，再根据指令推进 `P2` hygiene cleanup。

### 2026-04-10 15:24 — Legacy removal / P1 常规 test path 与 shared helper 收口一批

- 背景：
  `P0` 已完成后，继续按 `D3_LEGACY_PATH_REMOVAL_PROMPT.md` 推进 `P1 internal caller removal`。这一轮只收口“会进入常规验证”的 repo 内测试主路径与 shared helper，不扩大到历史 browser 页面或 `P2 hygiene`。
- 实现/结论：
  1. `packages/vrender/__tests__/util.ts` 已新增 `createBrowserStage()` / `createNodeStage()` helper，通过 app-scoped `createBrowserVRenderApp()` / `createNodeVRenderApp()` 创建 stage，并在 `stage.release()` 时联动释放 app。
  2. `packages/vrender` 常规 `core/event` 测试主路径已全部切到 `createBrowserStage()`：
     - `__tests__/core/stage.test.ts`
     - `__tests__/core/window.test.ts`
     - `__tests__/core/graphic-bounds.test.ts`
     - `__tests__/event/event-manager.test.ts`
     当前非 browser/node/legacy facade 的 direct deprecated `createStage()` caller 已清零。
  3. `packages/vrender-components/__tests__/util/vrender.ts` 已切到 app-scoped `createTestStage()`；`__tests__/util/render.ts` 也改为通过 `createBrowserVRenderApp()` + `installScrollbarToApp()` 组装 stage，不再通过 legacy `createStage()` / `loadScrollbar()` 装配。
  4. `packages/vrender-components` 的常规 unit 测试调用点已统一切到 `createTestStage()`；非 browser 目录扫描后，direct `createStage()` caller 只剩 util 实现文件。
  5. `packages/vrender-components` 的 electron 定向回归里，`pager.test.ts` 已在新 helper 下通过；`axis/line.test.ts` 与 `legend/discrete.test.ts` 仍存在 exact-layout 断言差异。这两项当前不在常规 `rushx test` gate 内，也未被本轮直接用于宣称 `P1` 完成，因此暂按 `P1 remaining triage` 记录，不扩大为 `P0` / `P2` blocker。
- 是否与设计有差异：
  无。本条目仍严格停留在 `P1`：
  1. 没有继续扩大到历史 browser 页批量迁移
  2. 没有开始 `P2 hygiene`
  3. 没有回退到 deprecated facade
  4. 没有重开 D3 主设计
- 影响文件：
  `packages/vrender/__tests__/util.ts`
  `packages/vrender/__tests__/core/stage.test.ts`
  `packages/vrender/__tests__/core/window.test.ts`
  `packages/vrender/__tests__/core/graphic-bounds.test.ts`
  `packages/vrender/__tests__/event/event-manager.test.ts`
  `packages/vrender/__tests__/electron/drag.test.ts`
  `packages/vrender/__tests__/electron/event-system.test.ts`
  `packages/vrender/__tests__/electron/graphic-bounds.test.ts`
  `packages/vrender-components/__tests__/util/vrender.ts`
  `packages/vrender-components/__tests__/util/render.ts`
  `packages/vrender-components/__tests__/unit/tag.test.ts`
  `packages/vrender-components/__tests__/unit/segment.test.ts`
  `packages/vrender-components/__tests__/unit/crosshair.test.ts`
  `packages/vrender-components/__tests__/unit/data-zoom.test.ts`
  `packages/vrender-components/__tests__/unit/axis/circle.test.ts`
  `packages/vrender-components/__tests__/unit/marker/arc-line.test.ts`
  `packages/vrender-components/__tests__/unit/marker/arc-area.test.ts`
  `packages/vrender-components/__tests__/unit/marker/line.test.ts`
  `packages/vrender-components/__tests__/unit/marker/area.test.ts`
  `packages/vrender-components/__tests__/unit/marker/point.test.ts`
  `packages/vrender-components/__tests__/unit/player/controller.test.ts`
  `packages/vrender-components/__tests__/unit/player/controller.additional-branches.test.ts`
  `packages/vrender-components/__tests__/unit/player/controller.layout-and-toggle.test.ts`
  `packages/vrender-components/__tests__/electron/axis/line.test.ts`
  `packages/vrender-components/__tests__/electron/axis/overlap/auto-limit.test.ts`
  `packages/vrender-components/__tests__/electron/bugfix/legend-focus-layout.test.ts`
  `packages/vrender-components/__tests__/electron/legend/discrete.test.ts`
  `packages/vrender-components/__tests__/electron/pager.test.ts`
  `packages/vrender-components/__tests__/electron/slider.test.ts`
  `docs/refactor/state-engine/D3_LEGACY_PATH_REMOVAL_STATUS.md`
- 所属层级：
  `P1` partial progress
- 验证：
  1. `packages/vrender rushx compile` 通过
  2. `packages/vrender-components rushx compile` 通过
  3. `packages/vrender` 定向常规测试通过：
     - `__tests__/core/stage.test.ts`
     - `__tests__/core/window.test.ts`
     - `__tests__/core/graphic-bounds.test.ts`
     - `__tests__/event/event-manager.test.ts`
  4. `packages/vrender rushx test` 全量通过：`15/15 suites`, `51/53 tests`, `2 skipped`
  5. `packages/vrender-components` 定向 unit 测试通过：`13/13 suites`, `41/41 tests`
  6. `packages/vrender-components rushx test` 全量通过：`29/29 suites`, `88/88 tests`
  7. `packages/vrender-components` electron 定向回归：
     - `pager.test.ts` 通过
     - `axis/line.test.ts`、`legend/discrete.test.ts` 仍存在 exact-layout 断言差异，需后续 triage
- 是否仍阻塞 handoff：
  是。`legacy removal` 整体仍未完成；当前 blocker 已明确收敛为 `P1` 尚有历史 caller / electron triage 尾项，以及 `P2` 尚未开始。

### 2026-04-10 17:46 — Legacy removal / P1 browser shared util 与 node graphic caller 再收口一批

- 背景：
  在 `P0 completed` 之后继续推进 `P1 internal caller removal`。这一轮目标仍是“批量吃掉内部 caller”，而不是扩大到 `P2 hygiene`。优先选择两批重复样板最多的调用面：
  1. `packages/vrender/__tests__/browser/src` 的 shared browser util
  2. `packages/vrender/__tests__/node` 的 graphic / index 脚本
- 实现/结论：
  1. 新增 `packages/vrender/__tests__/browser/src/app-stage.ts`，封装 app-scoped `createBrowserAppStage()`，并在 `stage.release()` 时联动释放 app。
  2. 以下 browser shared util / utility page 已切到 app-scoped helper：
     - `__tests__/browser/src/interactive/utils.ts`
     - `__tests__/browser/src/render/utils.ts`
     - `__tests__/browser/src/interactive/circle-drag.ts`
     - `__tests__/browser/src/interactive/gesture.ts`
     - `__tests__/browser/src/core/stage.ts`
  3. 新增 `packages/vrender/__tests__/node/create-stage.js`，封装 `createNodeTestStage()`。
  4. `packages/vrender/__tests__/node/index.js` 与 `packages/vrender/__tests__/node/graphic/*.js` 已统一改成经由 `createNodeTestStage()` 创建 stage；定向扫描后，这一批目录下的 deprecated `createStage()` caller 已清零，仅剩 helper 内部的 `app.createStage()`。
  5. browser smoke 定向验证显示：
     - `interactive-test`
     - `drag-test`
     - `gesture-test`
     全部 `open=true`, `firstFrame=true`, `errors=0`
     `performance-test` 仍为旧的历史页导入失败，不是这轮 shared util 迁移引入的新问题。
  6. 直接运行 node 脚本时，当前仍会先撞上 `packages/vrender/cjs/index.js` 的旧产物链错误：`loadNodeEnv is not a function`。这说明 source caller 替换已经完成，但 node 侧若要把这些 historical script 纳入强 runtime gate，还需要后续单独处理产物链一致性；本轮不把它误报成 caller 替换失败。
- 是否与设计有差异：
  无。本条目仍停留在 `P1`：
  1. 没有扩大到 `P2`
  2. 没有重开 installer/runtime 主设计
  3. 没有把历史 node script 产物链问题误并入 `P0`
- 影响文件：
  `packages/vrender/__tests__/browser/src/app-stage.ts`
  `packages/vrender/__tests__/browser/src/interactive/utils.ts`
  `packages/vrender/__tests__/browser/src/render/utils.ts`
  `packages/vrender/__tests__/browser/src/core/stage.ts`
  `packages/vrender/__tests__/browser/src/interactive/circle-drag.ts`
  `packages/vrender/__tests__/browser/src/interactive/gesture.ts`
  `packages/vrender/__tests__/node/create-stage.js`
  `packages/vrender/__tests__/node/index.js`
  `packages/vrender/__tests__/node/graphic/arc.js`
  `packages/vrender/__tests__/node/graphic/arc3d.js`
  `packages/vrender/__tests__/node/graphic/area.js`
  `packages/vrender/__tests__/node/graphic/circle.js`
  `packages/vrender/__tests__/node/graphic/glyph.js`
  `packages/vrender/__tests__/node/graphic/group.js`
  `packages/vrender/__tests__/node/graphic/image.js`
  `packages/vrender/__tests__/node/graphic/line.js`
  `packages/vrender/__tests__/node/graphic/path.js`
  `packages/vrender/__tests__/node/graphic/polygon.js`
  `packages/vrender/__tests__/node/graphic/pyramid3d.js`
  `packages/vrender/__tests__/node/graphic/rect.js`
  `packages/vrender/__tests__/node/graphic/rect3d.js`
  `packages/vrender/__tests__/node/graphic/star.js`
  `packages/vrender/__tests__/node/graphic/symbol.js`
  `packages/vrender/__tests__/node/graphic/text.js`
  `docs/refactor/state-engine/D3_LEGACY_PATH_REMOVAL_STATUS.md`
- 所属层级：
  `P1` partial progress
- 验证：
  1. `packages/vrender rushx compile` 通过
  2. `packages/vrender rushx test` 通过：`15/15 suites`, `51/53 tests`, `2 skipped`
  3. node graphic / index touched files ESLint 通过
  4. browser shared util 相关 smoke 定向通过：
     - `interactive-test`
     - `drag-test`
     - `gesture-test`
  5. `performance-test` 仍为旧的历史页导入失败，继续按 triage 处理
  6. 直接执行 `packages/vrender/__tests__/node/index.js` 与 `node/graphic/rect.js` 时，仍会先撞上 `packages/vrender/cjs/index.js` 的既有产物链错误：`loadNodeEnv is not a function`
- 是否仍阻塞 handoff：
  是。`legacy removal` 整体仍未完成；这轮只是继续缩小 `P1` 的 caller 面，并没有完成 `P1/P2`。

### 2026-04-10 18:11 — Legacy removal / P1 简单 browser 图形页收口一批

- 背景：
  继续推进 `P1 internal caller removal`，这次只选择一批简单 browser 图形页，不碰 `P2`。为了避免“只改源码不留验证”，先补了一条 source-scan 测试，把这批页面显式纳入 `P1` 迁移目标。
- 实现/结论：
  1. 新增 `packages/vrender/__tests__/unit/legacy-removal-browser-pages.test.ts`，先验证以下页面不允许再使用 deprecated root `createStage()`：
     - `arc.ts`
     - `circle.ts`
     - `graphic.ts`
     - `path.ts`
     - `polygon.ts`
     - `star.ts`
  2. 测试先红后绿，以上 6 个页面已统一切到 `createBrowserPageStage()`。
  3. 这批页面迁移后，定向 smoke 全部 `open=true`, `firstFrame=true`, `errors=0`，说明这一刀的 caller replacement 没有打坏 bundling / page init / 首帧渲染。
- 是否与设计有差异：
  无。本条目仍严格停留在 `P1`：
  1. 没有继续扩大到其他历史页批量迁移
  2. 没有触碰 `P2`
  3. 没有重开 D3 主设计
- 影响文件：
  `packages/vrender/__tests__/unit/legacy-removal-browser-pages.test.ts`
  `packages/vrender/__tests__/browser/src/pages/arc.ts`
  `packages/vrender/__tests__/browser/src/pages/circle.ts`
  `packages/vrender/__tests__/browser/src/pages/graphic.ts`
  `packages/vrender/__tests__/browser/src/pages/path.ts`
  `packages/vrender/__tests__/browser/src/pages/polygon.ts`
  `packages/vrender/__tests__/browser/src/pages/star.ts`
  `docs/refactor/state-engine/D3_LEGACY_PATH_REMOVAL_STATUS.md`
- 所属层级：
  `P1` partial progress
- 验证：
  1. `packages/vrender/__tests__/unit/legacy-removal-browser-pages.test.ts` 通过：`6/6 tests`
  2. `packages/vrender rushx compile` 通过
  3. `packages/vrender rushx test` 通过：`16/16 suites`, `57/59 tests`, `2 skipped`
  4. browser smoke 定向通过：
     - `arc`
     - `circle`
     - `graphic`
     - `path`
     - `polygon`
     - `star`
     全部 `open=true`, `firstFrame=true`, `errors=0`
- 是否仍阻塞 handoff：
  是。`legacy removal` 整体仍未完成；这轮只是继续缩小 `P1` 的 browser page caller 面。

### 2026-04-10 19:47 — Legacy removal / P1 第二批 browser page caller 收口与 triage 对齐

- 背景：
  继续推进 `P1 internal caller removal`，但保持窄切片，只处理一组仍位于 browser 内部验证链路的页面：
  - `globalCompositeOperation`
  - `wrap-text`
  - `theme`
  - `morphing`
  - `html`
  目标仍然只是 caller replacement，不扩大到修历史页面本身的旧问题。
- 实现/结论：
  1. `legacy-removal-browser-pages.test.ts` 扩展到 16 个页面，新增固定：
     - `globalCompositeOperation.ts`
     - `html.ts`
     - `morphing.ts`
     - `theme.ts`
     - `wrap-text.ts`
  2. 上述 5 个页面已统一切到 `createBrowserPageStage()`。
  3. 提权 smoke 后，结果分成两类：
     - `theme` / `morphing` / `globalCompositeOperation`
       - `open=true`
       - `firstFrame=true`
       - `errors=0`
       - 可继续作为 `P1` 已验证迁移页
     - `wrap-text` / `html`
       - caller 已迁移，但页面仍是既有 triage-only
       - `wrap-text` 当前仍报 `CanvasTextLayout.LayoutBBox` 相关空值错误
       - `html` 当前仍报 `DefaultGlobal.loadSvg` 装配缺口，且 `hasFirstFrame=false`
       - 这两页与既有 `D3_PRE_HANDOFF_SMOKE_TRIAGE.md` 分类一致，不算这轮新增回归，也不算完成证据
- 是否与设计有差异：
  无。本条目仍严格停留在 `P1`：
  1. 没有把 `wrap-text/html` 的旧问题升级成新的 blocker
  2. 没有进入 `P2`
  3. 没有重开 D3 主设计，也没有扩成历史页面修复专项
- 影响文件：
  `packages/vrender/__tests__/unit/legacy-removal-browser-pages.test.ts`
  `packages/vrender/__tests__/browser/src/pages/globalCompositeOperation.ts`
  `packages/vrender/__tests__/browser/src/pages/html.ts`
  `packages/vrender/__tests__/browser/src/pages/morphing.ts`
  `packages/vrender/__tests__/browser/src/pages/theme.ts`
  `packages/vrender/__tests__/browser/src/pages/wrap-text.ts`
  `docs/refactor/state-engine/D3_LEGACY_PATH_REMOVAL_STATUS.md`
- 所属层级：
  `P1` partial progress
- 验证：
  1. `packages/vrender/__tests__/unit/legacy-removal-browser-pages.test.ts` 通过：`16/16 tests`
  2. `packages/vrender rushx compile` 通过
  3. `packages/vrender rushx test` 通过：`16/16 suites`, `67/69 tests`, `2 skipped`
  4. browser smoke 定向通过：
     - `theme`
     - `morphing`
     - `globalCompositeOperation`
     均为 `open=true`, `firstFrame=true`, `errors=0`
  5. browser smoke triage-only：
     - `wrap-text`
     - `html`
     当前结果与既有 triage 分类一致，继续按 `triage only` 处理
- 是否仍阻塞 handoff：
  是。`legacy removal` 整体仍未完成；这轮只是继续缩小 `P1` 的 browser page caller 面，并进一步把“caller 已迁”和“页面可作为迁移证据”分层写清。

### 2026-04-10 21:20 — Legacy removal / P1 incremental runtime gap 收口与第三批 browser page 迁移

- 背景：
  在继续推进 `P1 internal caller removal` 时，`image / incremental / layer / group-perf` 这批 browser page 中，`incremental` 在 app-scoped stage 下仍报 runtime red light。问题不是 caller replacement 本身，而是 app-scoped incremental draw contribution 的 renderer 解析链在真实 browser smoke 中不稳定。
- 实现/结论：
  1. `packages/vrender/__tests__/browser/src/pages/image.ts`、`layer.ts`、`incremental.ts`、`group-perf.ts` 已统一切到 `createBrowserPageStage()`。
  2. 为便于定位真实 browser runtime，又补了两条仅用于 smoke/debug 的 harness 能力：
     - `page-stage.ts` 现在会把当前 app 挂到 `window.__D3_HARNESS_APP__`
     - `run-smoke-triage.cjs` / `debug-rect-stage.cjs` 新增可选的 registry/snapshot 调试输出
  3. `incremental` 的真实 red light 已定位并收口：
     - 旧实现把 `application.incrementalDrawContributionFactory` 绑定到 app registry 中“现成存在的 line/area renderer”
     - 在真实 browser smoke 下，这条假设不稳定，导致 `Renderer \"line\" is not configured for app-scoped incremental draw contribution`
     - 现在改为显式创建 canonical incremental renderer：
       - `DefaultIncrementalCanvasLineRender`
       - `DefaultIncrementalCanvasAreaRender(createContributionProvider(AreaRenderContribution, bindingContext))`
     - 因此 incremental draw contribution 不再依赖 app registry 中是否恰好存在 `line/area` renderer 条目
  4. 这条 runtime fix 落地后，`incremental` 已转绿：
     - 单页 smoke：`open=true`, `firstFrame=true`, `errors=0`
     - 与 `image / layer / group-perf` 一起的四页批量 smoke：全部 `errors=0`
  5. 随后又推进了第三批简单 3D page caller：
     - `bar3d.ts`
     - `pie3d.ts`
     - `pyramid3d.ts`
     - `scatter3d.ts`
     其中：
     - `bar3d` / `pie3d` / `pyramid3d` 迁移后定向 smoke 全绿，可作为 `P1` 已验证证据
     - `scatter3d` 虽已完成 caller replacement，但当前仍是历史页 triage-only：
       - Vite import-analysis 报 `Failed to resolve import "@visactor/vrender-common"`
       - 这是页面自身旧导入路径问题，不是这轮 createStage 迁移引入的新回归
- 是否与设计有差异：
  无。仍严格停留在 `P1`：
  1. 没有回退到 legacy stage
  2. 没有重开 `P0` 设计，只是修正 app-scoped incremental factory 的实现缺口
  3. 没有进入 `P2`
  4. 没有把 `scatter3d` 的旧导入问题升级成新的 blocker
- 影响文件：
  `packages/vrender-core/src/entries/runtime-installer.ts`
  `packages/vrender-core/__tests__/unit/entries/runtime-installer.test.ts`
  `packages/vrender/__tests__/browser/src/harness.ts`
  `packages/vrender/__tests__/browser/src/page-stage.ts`
  `packages/vrender/__tests__/browser/scripts/run-smoke-triage.cjs`
  `packages/vrender/__tests__/browser/scripts/debug-rect-stage.cjs`
  `packages/vrender/__tests__/browser/src/pages/image.ts`
  `packages/vrender/__tests__/browser/src/pages/incremental.ts`
  `packages/vrender/__tests__/browser/src/pages/layer.ts`
  `packages/vrender/__tests__/browser/src/pages/group-perf.ts`
  `packages/vrender/__tests__/browser/src/pages/bar3d.ts`
  `packages/vrender/__tests__/browser/src/pages/pie3d.ts`
  `packages/vrender/__tests__/browser/src/pages/pyramid3d.ts`
  `packages/vrender/__tests__/browser/src/pages/scatter3d.ts`
  `packages/vrender/__tests__/unit/legacy-removal-browser-pages.test.ts`
  `docs/refactor/state-engine/D3_LEGACY_PATH_REMOVAL_STATUS.md`
- 所属层级：
  `P1` partial progress
- 验证：
  1. `packages/vrender-core/__tests__/unit/entries/runtime-installer.test.ts` 通过：`1/1 tests`
  2. `packages/vrender-core rushx compile` 通过
  3. `packages/vrender rushx compile` 通过
  4. `packages/vrender rushx test` 通过：`16/16 suites`, `75/77 tests`, `2 skipped`
  5. browser smoke 定向通过：
     - `image`
     - `incremental`
     - `layer`
     - `group-perf`
     全部 `open=true`, `firstFrame=true`, `errors=0`
  6. browser smoke 定向通过：
     - `bar3d`
     - `pie3d`
     - `pyramid3d`
     全部 `open=true`, `firstFrame=true`, `errors=0`
  7. `scatter3d`
     - caller replacement 已完成
     - 但仍为 `triage only`
     - 当前导入失败原因为 `@visactor/vrender-common` 无法解析
- 是否仍阻塞 handoff：
  是。`legacy removal` 整体仍未完成；这轮只是继续推进 `P1`，并把 `incremental` 这条 runtime gap 收口。

### 2026-04-10 17:52 — Legacy removal / P1 第五批 browser page caller 迁移与 triage 对齐

- 背景：
  继续推进 `P1 internal caller removal`。这轮选择了 6 个仍在 browser page 目录里的 caller，目标仍然只是把 deprecated root `createStage()` 换成 app-scoped `createBrowserPageStage()`，并按 smoke 结果把“已验证迁移”和“仍为 triage only”的页面分开记录。
- 实现/结论：
  1. 以下页面已完成 caller replacement：
     - `line.ts`
     - `symbol.ts`
     - `gif-image.ts`
     - `pick-test.ts`
     - `test-arc-path.ts`
     - `points3d.ts`
  2. `legacy-removal-browser-pages.test.ts` 已扩展到 30 个页面，固定这批 caller 不再回退到 deprecated root `createStage()`。
  3. 定向 smoke 后，结果分成两类：
     - 已验证迁移：
       - `line`
       - `test-arc-path`
       - `points3d`
       三页均为 `open=true`, `firstFrame=true`, `errors=0`
     - triage only：
       - `pick-test`
         - 根因：页面仍从 `@visactor/vrender` 根入口导入 `loadFeishuContributions`
         - 分类：`注册/装配问题`
       - `symbol`
         - 根因：自定义 `AStageAnimate.afterStageRender()` 经 legacy `vglobal` 读取 `devicePixelRatio` 时抛空值
         - 分类：`状态/动画/事件问题`
       - `gif-image`
         - 根因：`DefaultGlobal.loadArrayBuffer` 缺失，GIF 资源加载链未闭环
         - 分类：`历史页面本身失效或过时`
  4. 这轮没有把 triage-only 页误记成 `P1` 完成证据，也没有把它们升级成新的 runtime blocker。
- 是否与设计有差异：
  无。本条仍严格停留在 `P1`：
  1. 只做 browser page caller replacement
  2. 历史页红灯按 triage 归档
  3. 不触碰 `P2 hygiene`
- 影响文件：
  `packages/vrender/__tests__/browser/src/pages/line.ts`
  `packages/vrender/__tests__/browser/src/pages/symbol.ts`
  `packages/vrender/__tests__/browser/src/pages/gif-image.ts`
  `packages/vrender/__tests__/browser/src/pages/pick-test.ts`
  `packages/vrender/__tests__/browser/src/pages/test-arc-path.ts`
  `packages/vrender/__tests__/browser/src/pages/points3d.ts`
  `packages/vrender/__tests__/unit/legacy-removal-browser-pages.test.ts`
  `docs/refactor/state-engine/D3_LEGACY_PATH_REMOVAL_STATUS.md`
- 所属层级：
  `P1` partial progress
- 验证：
  1. `packages/vrender/__tests__/unit/legacy-removal-browser-pages.test.ts` 通过：`30/30 tests`
  2. `packages/vrender rushx compile` 通过
  3. `packages/vrender rushx test` 通过：`16/16 suites`, `81/83 tests`, `2 skipped`
  4. Electron 定向 smoke（提权执行）：
     - `line` 全绿
     - `test-arc-path` 全绿
     - `points3d` 全绿
     - `pick-test` / `symbol` / `gif-image` 已完成归因并继续保留为 triage only
- 是否仍阻塞 handoff：
  是。`legacy removal` 整体仍未完成；这轮只是继续缩小 `P1` caller 面，不能恢复宣称 handoff ready。

### 2026-04-10 18:08 — Legacy removal / P1 第六批 browser page caller 迁移与单页 smoke 收口

- 背景：
  在继续推进 `P1 internal caller removal` 时，又挑了一批单 stage、结构较轻的 browser page caller，优先争取更多已验证迁移证据，同时把不适合作为正向证据的页面继续按 triage-only 归档。
- 实现/结论：
  1. 以下页面已完成 caller replacement：
     - `texture.ts`
     - `glyph.ts`
     - `offscreen.ts`
     - `flex.ts`
  2. `legacy-removal-browser-pages.test.ts` 已扩展到 34 个页面，固定这批 caller 不再回退到 deprecated root `createStage()`。
  3. 定向 smoke 后，结果分成两类：
     - 已验证迁移：
       - `texture`
       - `offscreen`
       - `flex`
       三页均为 `open=true`, `firstFrame=true`, `errors=0`
     - triage only：
       - `glyph`
         - 根因：页面显式调用 `initBrowserEnv()` / `initFeishuEnv()` / `initAllEnv()`，导致 app-scoped browser handler 装配链被打乱
         - 具体报错：`Symbol(WindowHandlerContribution) is not configured for browser`
         - 分类：`入口初始化问题`
  4. 这轮没有为了收口 `glyph` 去重开 `P0` 或回退 app-scoped 路径，只把它继续记为历史页 triage-only。
- 是否与设计有差异：
  无。本条仍严格属于 `P1`：
  1. 只做 caller replacement
  2. triage-only 页面不升级为新的设计 blocker
  3. 不触碰 `P2 hygiene`
- 影响文件：
  `packages/vrender/__tests__/browser/src/pages/texture.ts`
  `packages/vrender/__tests__/browser/src/pages/glyph.ts`
  `packages/vrender/__tests__/browser/src/pages/offscreen.ts`
  `packages/vrender/__tests__/browser/src/pages/flex.ts`
  `packages/vrender/__tests__/unit/legacy-removal-browser-pages.test.ts`
  `docs/refactor/state-engine/D3_LEGACY_PATH_REMOVAL_STATUS.md`
- 所属层级：
  `P1` partial progress
- 验证：
  1. `packages/vrender/__tests__/unit/legacy-removal-browser-pages.test.ts` 通过：`34/34 tests`
  2. `packages/vrender rushx compile` 通过
  3. `packages/vrender rushx test` 通过：`16/16 suites`, `84/86 tests`, `2 skipped`
  4. Electron 定向 smoke（提权执行）：
     - `texture` 全绿
     - `offscreen` 全绿
     - `flex` 全绿
     - `glyph` 已完成归因并继续保留为 triage only
- 是否仍阻塞 handoff：
  是。`legacy removal` 整体仍未完成；这轮只是继续补充 `P1` 已验证迁移页与 triage 归因。

### 2026-04-10 18:26 — Legacy removal / P1 多 stage browser page helper 收口

- 背景：
  在继续推进 `P1 internal caller removal` 时，遇到 `stage.ts` / `window-event.ts` 这种单页内创建多个 stage 的场景。原有 `createBrowserPageStage()` 适合单 stage 页，但会在多次调用时不断覆盖 harness cleanup，不适合直接复用。
- 实现/结论：
  1. `page-stage.ts` 已补一个极小的 `createBrowserPageApp()` helper：
     - 创建 app-scoped browser app
     - 挂载 harness app / cleanup
     - 供单页内多个 `app.createStage(...)` 共享
  2. `createBrowserPageStage()` 已改为基于 `createBrowserPageApp()` 实现，单 stage 页行为保持不变。
  3. `stage.ts` 与 `window-event.ts` 已切到：
     - `const app = createBrowserPageApp()`
     - `app.createStage(...)`
  4. `legacy-removal-browser-pages.test.ts` 的 regex 也已收紧为：
     - 只禁止 deprecated root `createStage()` 导入与未限定调用
     - 不误伤合法的 `app.createStage(...)`
  5. `stage` / `window-event` 两页定向 smoke 全绿：
     - `open=true`
     - `firstFrame=true`
     - `errors=0`
- 是否与设计有差异：
  无。本条仍属于 `P1`：
  1. 只是为多 stage browser 页补一个最小 app helper
  2. 不改 runtime installer，不回退 legacy bridge
  3. 不进入 `P2`
- 影响文件：
  `packages/vrender/__tests__/browser/src/page-stage.ts`
  `packages/vrender/__tests__/browser/src/pages/stage.ts`
  `packages/vrender/__tests__/browser/src/pages/window-event.ts`
  `packages/vrender/__tests__/unit/legacy-removal-browser-pages.test.ts`
  `docs/refactor/state-engine/D3_LEGACY_PATH_REMOVAL_STATUS.md`
- 所属层级：
  `P1` partial progress
- 验证：
  1. `packages/vrender/__tests__/unit/legacy-removal-browser-pages.test.ts` 通过：`36/36 tests`
  2. `packages/vrender rushx compile` 通过
  3. `packages/vrender rushx test` 通过：`16/16 suites`, `87/89 tests`, `2 skipped`
  4. Electron 定向 smoke（提权执行）：
     - `stage` 全绿
     - `window-event` 全绿
- 是否仍阻塞 handoff：
  是。整体 `legacy removal` 仍未完成；这轮只是继续扩大 `P1` 已验证迁移面。

### 2026-04-10 18:44 — Legacy removal / P1 第八批 browser page caller 收口

- 背景：
  继续沿 `P1 internal caller removal` 推进一批单 stage browser page caller，目标仍然是扩大已验证迁移页，不进入 `P2 hygiene`，也不重开历史页专项修复。
- 实现/结论：
  1. 以下页面已完成 caller replacement：
     - `dynamic-texture.ts`
     - `text-fly-in.ts`
     - `scroll.ts`
  2. `legacy-removal-browser-pages.test.ts` 已扩展到 39 个页面，固定这批 caller 不再回退到 deprecated root `createStage()`。
  3. 三页迁移后定向 smoke 全绿：
     - `dynamic-texture`
     - `text-fly-in`
     - `scroll`
     均为 `open=true`, `firstFrame=true`, `errors=0`
  4. 因此，这三页当前都可视为 `P1` 已验证迁移证据。
- 是否与设计有差异：
  无。本条仍严格属于 `P1`：
  1. 只做 caller replacement
  2. 不改变 triage-only 页的既有处理方式
  3. 不触碰 `P2 hygiene`
- 影响文件：
  `packages/vrender/__tests__/browser/src/pages/dynamic-texture.ts`
  `packages/vrender/__tests__/browser/src/pages/text-fly-in.ts`
  `packages/vrender/__tests__/browser/src/pages/scroll.ts`
  `packages/vrender/__tests__/unit/legacy-removal-browser-pages.test.ts`
  `docs/refactor/state-engine/D3_LEGACY_PATH_REMOVAL_STATUS.md`
- 所属层级：
  `P1` partial progress
- 验证：
  1. `packages/vrender/__tests__/unit/legacy-removal-browser-pages.test.ts` 通过：`39/39 tests`
  2. `packages/vrender rushx compile` 通过
  3. `packages/vrender rushx test` 通过：`16/16 suites`, `90/92 tests`, `2 skipped`
  4. Electron 定向 smoke（提权执行）：
     - `dynamic-texture` 全绿
     - `text-fly-in` 全绿
     - `scroll` 全绿
- 是否仍阻塞 handoff：
  是。整体 `legacy removal` 仍未完成；这轮只是继续扩大 `P1` 已验证迁移面。

### 2026-04-10 20:18 — Legacy removal / P1 第九批 browser page caller 收口

- 背景：
  继续沿 `P1 internal caller removal` 推进 browser page caller。本批优先处理两类页面：
  1. 低风险、单 stage、可以直接切到 `createBrowserPageStage()` 的动画/图形页
  2. 已在全量 smoke 中确认 `open=true`, `firstFrame=true` 的页面，优先把它们转成 `P1` 已验证迁移证据
- 实现/结论：
  1. 以下页面已完成 caller replacement：
     - `animate.ts`
     - `animate-next.ts`
     - `animate-ticker.ts`
     - `story-animate.ts`
     - `animate-3d.ts`
     - `image-cloud.ts`
     - `richtext-editor.ts`
     - `jsx.tsx`
     - `lottie.ts`
     - `richtext.ts`
  2. 其中：
     - `animate.ts` 改为 `createBrowserPageApp() + app.createStage(...)`，用于收口单页内的双 stage 场景
     - 其余页面保持最小迁移，只替换 stage 创建口径，不改变页面行为
  3. `legacy-removal-browser-pages.test.ts` 已扩展到 49 个页面，固定这批 caller 不再回退到 deprecated root `createStage()`
  4. smoke 结果分两类：
     - 已验证迁移：
       - `animate-3d`
       - `image-cloud`
       - `lottie`
       - `richtext`
       均为 `open=true`, `firstFrame=true`, `errors=0`
     - triage only：
       - `animate-next` / `animate-ticker` / `story-animate`
         - `open=true`, `firstFrame=false`, `errors=0`
         - 属于按钮触发型页面，当前只能保留为 triage，不算首帧 green evidence
       - `animate`
         - `open=false`
         - `importError`: `@visactor/vrender` 根入口不再导出 `FadeInPlus`
         - 分类：`注册/装配问题`
       - `jsx`
         - `open=true`, `firstFrame=true`
         - 但仍有 `Maximum call stack size exceeded`
         - 分类：`上层调用姿势与新 D3 语义不兼容`
       - `richtext-editor`
         - `open=true`, `firstFrame=true`
         - 但仍有 `registerUpdateListener` 空值问题
         - 分类：`注册/装配问题`
- 是否与设计有差异：
  无。本条仍严格属于 `P1`：
  1. 只做 internal caller replacement
  2. 不重开 `P0` installer surface
  3. 不进入 `P2 hygiene`
  4. triage only 页面继续按真实运行结果记录，不被误记成 green evidence
- 影响文件：
  `packages/vrender/__tests__/browser/src/pages/animate.ts`
  `packages/vrender/__tests__/browser/src/pages/animate-next.ts`
  `packages/vrender/__tests__/browser/src/pages/animate-ticker.ts`
  `packages/vrender/__tests__/browser/src/pages/story-animate.ts`
  `packages/vrender/__tests__/browser/src/pages/animate-3d.ts`
  `packages/vrender/__tests__/browser/src/pages/image-cloud.ts`
  `packages/vrender/__tests__/browser/src/pages/richtext-editor.ts`
  `packages/vrender/__tests__/browser/src/pages/jsx.tsx`
  `packages/vrender/__tests__/browser/src/pages/lottie.ts`
  `packages/vrender/__tests__/browser/src/pages/richtext.ts`
  `packages/vrender/__tests__/unit/legacy-removal-browser-pages.test.ts`
  `docs/refactor/state-engine/D3_LEGACY_PATH_REMOVAL_STATUS.md`
- 所属层级：
  `P1` partial progress
- 验证：
  1. `packages/vrender/__tests__/unit/legacy-removal-browser-pages.test.ts` 通过：`49/49 tests`
  2. `packages/vrender rushx test` 通过：`16/16 suites`, `100/102 tests`, `2 skipped`
  3. `packages/vrender rushx compile` 通过
  4. Electron 全量 triage（提权执行）已确认：
     - `animate-3d` 全绿
     - `image-cloud` 全绿
     - `animate-next` / `animate-ticker` / `story-animate` 为交互页 triage only
     - `animate` 为 `注册/装配问题`
     - `jsx` 为 `上层调用姿势与新 D3 语义不兼容`
     - `richtext-editor` 为 `注册/装配问题`
  5. Electron 定向 smoke（提权执行）：
     - `richtext` 全绿
     - `lottie` 全绿
- 是否仍阻塞 handoff：
  是。整体 `legacy removal` 仍未完成；这轮只是继续扩大 `P1` 已验证迁移面并补充 triage 归因。

### 2026-04-10 20:42 — Legacy removal / P1 第十批 browser page caller 收口

- 背景：
  在 `P1` 继续向下收口剩余 browser page caller。本批优先处理 3 个按钮触发型动画/性能页和 1 个可直接出首帧的 3D 页，目标仍然是扩大 source 面收口并用 smoke 做真实归类。
- 实现/结论：
  1. 以下页面已完成 caller replacement：
     - `custom-animate.ts`
     - `animate-tick.ts`
     - `memory.ts`
     - `wordcloud3d.ts`
  2. `legacy-removal-browser-pages.test.ts` 已扩展到 53 个页面，固定这批 caller 不再回退到 deprecated root `createStage()`
  3. smoke 结果：
     - 已验证迁移：
       - `wordcloud3d`
         - `open=true`, `firstFrame=true`, `errors=0`
     - triage only：
       - `custom-animate`
       - `animate-tick`
       - `memory`
         - 均为 `open=true`, `firstFrame=false`, `errors=0`
         - 当前继续按按钮触发型页面处理，不误记为首帧 green evidence
  4. 本批没有新增 runtime blocker；`wordcloud3d.ts` 中唯一额外收口的是把注释里的旧 `createStage` 示例同步改掉，避免 source-scan 假阳性。
- 是否与设计有差异：
  无。本条仍严格属于 `P1`：
  1. 只做 internal caller replacement
  2. 不扩大到 `P2 hygiene`
  3. 继续使用 smoke 结果区分“已验证迁移”和“caller replacement + triage”
- 影响文件：
  `packages/vrender/__tests__/browser/src/pages/custom-animate.ts`
  `packages/vrender/__tests__/browser/src/pages/animate-tick.ts`
  `packages/vrender/__tests__/browser/src/pages/memory.ts`
  `packages/vrender/__tests__/browser/src/pages/wordcloud3d.ts`
  `packages/vrender/__tests__/unit/legacy-removal-browser-pages.test.ts`
  `docs/refactor/state-engine/D3_LEGACY_PATH_REMOVAL_STATUS.md`
- 所属层级：
  `P1` partial progress
- 验证：
  1. `packages/vrender/__tests__/unit/legacy-removal-browser-pages.test.ts` 通过：`53/53 tests`
  2. `packages/vrender rushx test` 通过：`16/16 suites`, `104/106 tests`, `2 skipped`
  3. `packages/vrender rushx compile` 通过
  4. Electron 定向 smoke（提权执行）：
     - `custom-animate`: `open=true`, `firstFrame=false`, `errors=0`
     - `animate-tick`: `open=true`, `firstFrame=false`, `errors=0`
     - `memory`: `open=true`, `firstFrame=false`, `errors=0`
     - `wordcloud3d`: `open=true`, `firstFrame=true`, `errors=0`
- 是否仍阻塞 handoff：
  是。整体 `legacy removal` 仍未完成；这轮只是继续扩大 `P1` 已验证迁移面和 triage 覆盖。

### 2026-04-10 21:18 — Legacy removal / P1 第十一批 browser page 与 browser-node fixture caller 收口

- 背景：
  在第十批完成后，`packages/vrender/__tests__/browser/src/pages` 里只剩最后一批真实 caller，以及一个独立的 `browser/src/node/index.js` fixture 仍在直接使用 deprecated root `createStage()`。这一轮目标是：
  1. 收掉剩余 5 个 browser page caller
  2. 收掉 `browser/src/node/index.js` 的独立 caller
  3. 明确把 comment-only 噪音从 source scan 中剔除
  4. 把“browser pages 目录清零”写入留档，避免后续重复扫描同一层
- 实现/结论：
  1. 以下页面已完成 caller replacement：
     - `anxu-picker.ts`
     - `editor.ts`
     - `chart.ts`
     - `vchart.ts`
     - `vtable.ts`
  2. `browser/src/node/index.js` 已从 root `createStage()` 切到 `createNodeVRenderApp().createStage(...)`。
  3. `performance-test.ts` 与 `harmony.ts` 中的 comment/import 噪音已同步收掉，避免 source scan 假阳性。
  4. `legacy-removal-browser-pages.test.ts` 已扩展为同时覆盖：
     - 57 个 browser pages
     - 1 个 browser fixture：`node/index.js`
  5. 当前 `packages/vrender/__tests__/browser/src` 范围内，`rg` 真实 source 命中已收缩到：
     - `app-stage.ts` 中的 `createStage(params)` 类型定义
     - `page-stage.ts` / 多 stage 页面中的 `app.createStage(...)`
     不再存在 direct deprecated root `createStage()` caller。
  6. 这意味着：
     - `packages/vrender/__tests__/browser/src/pages` 已完成本轮 `P1` caller replacement 清零
     - `browser/src/node/index.js` 这一层也已完成 source caller 清零
     - 但整体 `P1` 仍未完成，后续剩余面已转移到更外层的 browser 历史页 triage、node script runtime 证据、components/example 等其他层
- 是否与设计有差异：
  无。本条目仍严格属于 `P1`：
  1. 只做 internal caller replacement 与 source-scan 固定
  2. 不开始 `P2 hygiene`
  3. 不重开 runtime installer / D3 主设计
  4. 不把 triage-only 页面误记成 green evidence
- 影响文件：
  `packages/vrender/__tests__/browser/src/pages/anxu-picker.ts`
  `packages/vrender/__tests__/browser/src/pages/editor.ts`
  `packages/vrender/__tests__/browser/src/pages/chart.ts`
  `packages/vrender/__tests__/browser/src/pages/vchart.ts`
  `packages/vrender/__tests__/browser/src/pages/vtable.ts`
  `packages/vrender/__tests__/browser/src/node/index.js`
  `packages/vrender/__tests__/browser/src/pages/performance-test.ts`
  `packages/vrender/__tests__/browser/src/pages/harmony.ts`
  `packages/vrender/__tests__/unit/legacy-removal-browser-pages.test.ts`
  `docs/refactor/state-engine/D3_LEGACY_PATH_REMOVAL_STATUS.md`
- 所属层级：
  `P1` partial progress
- 验证：
  1. `packages/vrender/__tests__/unit/legacy-removal-browser-pages.test.ts` 通过：`58/58 tests`
  2. `packages/vrender rushx test` 通过：`16/16 suites`, `109/111 tests`, `2 skipped`
  3. `packages/vrender rushx compile` 通过
  4. source scan：
     - `packages/vrender/__tests__/browser/src` 下已无 direct deprecated root `createStage()` caller
     - 仅剩 `app-stage.ts` 的 helper 类型定义和 `app.createStage(...)` 正常命中
  5. Electron 定向 smoke（提权执行）：
     - `anxu-picker`: `open=false`, `firstFrame=false`, `errors=0`
       - import error: `loadMathPicker`
       - 继续按 `历史页面本身失效或过时 / exclude from baseline`
     - `editor`: `open=false`, `firstFrame=false`, `errors=0`
       - import error: `injectable`
       - 继续按 `注册/装配问题 / triage only`
     - `chart`: `open=false`, `firstFrame=false`, `errors=0`
       - import error: `getLegacyBindingContext is not defined`
       - 继续按 `入口初始化问题 / triage only`
     - `vchart`: `open=true`, `firstFrame=false`, `errors=1`
       - unhandled rejection: `document.getElementById`
       - 继续按 `历史页面本身失效或过时 / exclude from baseline`
     - `vtable`: `open=true`, `firstFrame=false`, `errors=1`
       - unhandled rejection: `ContainerModule is not a constructor`
       - 继续按 `历史页面本身失效或过时 / exclude from baseline`
- 是否仍阻塞 handoff：
  是。整体 `legacy removal` 仍未完成；这轮只是把 `packages/vrender/__tests__/browser/src/pages` 和独立 `browser-node` fixture 的 direct deprecated caller 清到了零。

### 2026-04-10 21:44 — Legacy removal / P1 `vrender-components` browser examples 收口一批

- 背景：
  在 `packages/vrender` 的 browser source caller 清零后，下一层最容易继续推进的仍是 repo 内进入内部验证链路的 browser examples。`vrender-components/__tests__/browser/examples` 中仍有几处直接使用 deprecated root `createStage()` 的简单示例，适合先做最小 caller replacement，并用 source-scan + 包内 compile/test 固定住。
- 实现/结论：
  1. 以下 example 已切到 app-scoped stage helper：
     - `axis-label-limit.ts`
     - `axis-labels.ts`
     - `axis-autoWrap.ts`
     - `tag-flex.ts`
  2. `pick-test.ts` 原本只残留一个未使用的 `createStage` import，这轮已移除。
  3. 这些 example 统一改为复用已有的 `createRenderer('main', option)` helper，不再显式 `initBrowserEnv()` 或直接调用 deprecated root `createStage()`。
  4. 已新增 `legacy-removal-browser-examples.test.ts`，固定这 5 个 example 不得回退到 deprecated root `createStage()`。
  5. 当前 `packages/vrender-components/__tests__/browser/examples` 里，本轮纳入治理的 5 个低风险 caller 已清零；这为继续向 examples/electron 其余层推进 `P1` 提供了稳定基线。
- 是否与设计有差异：
  无。本条仍严格属于 `P1`：
  1. 只做 internal caller replacement
  2. 不开始 `P2 hygiene`
  3. 不重开 installer / lifecycle 设计
  4. 只对简单 example 做最小 app-scoped 迁移，不扩大到更复杂的 browser/electron triage
- 影响文件：
  `packages/vrender-components/__tests__/browser/examples/axis-label-limit.ts`
  `packages/vrender-components/__tests__/browser/examples/axis-labels.ts`
  `packages/vrender-components/__tests__/browser/examples/axis-autoWrap.ts`
  `packages/vrender-components/__tests__/browser/examples/tag-flex.ts`
  `packages/vrender-components/__tests__/browser/examples/pick-test.ts`
  `packages/vrender-components/__tests__/unit/legacy-removal-browser-examples.test.ts`
  `docs/refactor/state-engine/D3_LEGACY_PATH_REMOVAL_STATUS.md`
- 所属层级：
  `P1` partial progress
- 验证：
  1. source scan：
     - `packages/vrender-components/__tests__/browser/examples` 下本轮治理的 5 个文件已无 deprecated root `createStage()` caller
  2. `packages/vrender-components/__tests__/unit/legacy-removal-browser-examples.test.ts` 通过：`5/5 tests`
  3. `packages/vrender-components rushx compile` 通过
  4. `packages/vrender-components rushx test` 通过：`30/30 suites`, `93/93 tests`
- 是否仍阻塞 handoff：
  是。整体 `legacy removal` 仍未完成；这轮只是把 `vrender-components` browser examples 中一批低风险 caller 收口了。

### 2026-04-10 22:06 — Legacy removal / P1 `vrender-core` browser pages 第一批 caller replacement

- 背景：
  在 `vrender` / `vrender-components` 的 browser caller 继续收口后，fresh repo-level source scan 显示下一层主要残留已转移到 `packages/vrender-core/__tests__/browser`。这一轮先不重做整套 core browser harness，只建立一个最小 app-scoped helper，并迁移一批简单单 stage 页面。
- 实现/结论：
  1. 已新增 `packages/vrender-core/__tests__/browser/src/page-stage.ts`，提供最小 `createBrowserPageStage()` helper，通过 app-scoped `createBrowserVRenderApp().createStage()` 创建 stage，并在 `release()` 时联动释放 app。
  2. 以下 7 个页面已完成 caller replacement：
     - `arc.ts`
     - `circle.ts`
     - `graphic.ts`
     - `line.ts`
     - `path.ts`
     - `polygon.ts`
     - `rect.ts`
  3. 已新增 `packages/vrender-core/__tests__/unit/legacy-removal-browser-pages.test.ts`，固定这 7 个页面不再允许使用 deprecated root `createStage()`。
  4. 当前这批页面的 source scan 已清零；匹配结果只剩 `page-stage.ts` 内部 helper 的 `createStage(params)` 类型签名，不再有 direct deprecated root caller。
- 是否与设计有差异：
  无。本条仍严格属于 `P1`：
  1. 只做 internal caller replacement
  2. 不开始 `P2 hygiene`
  3. 不把 core browser harness 扩写成新的 smoke 任务
- 影响文件：
  `packages/vrender-core/__tests__/browser/src/page-stage.ts`
  `packages/vrender-core/__tests__/browser/src/pages/arc.ts`
  `packages/vrender-core/__tests__/browser/src/pages/circle.ts`
  `packages/vrender-core/__tests__/browser/src/pages/graphic.ts`
  `packages/vrender-core/__tests__/browser/src/pages/line.ts`
  `packages/vrender-core/__tests__/browser/src/pages/path.ts`
  `packages/vrender-core/__tests__/browser/src/pages/polygon.ts`
  `packages/vrender-core/__tests__/browser/src/pages/rect.ts`
  `packages/vrender-core/__tests__/unit/legacy-removal-browser-pages.test.ts`
  `docs/refactor/state-engine/D3_LEGACY_PATH_REMOVAL_STATUS.md`
- 所属层级：
  `P1` partial progress
- 验证：
  1. source scan：
     - 本批 7 个 core browser page 已无 direct deprecated root `createStage()` caller
     - 仅剩 `page-stage.ts` helper 类型签名命中
  2. `packages/vrender-core/__tests__/unit/legacy-removal-browser-pages.test.ts` 通过：`7/7 tests`
  3. `packages/vrender-core rushx compile` 通过
  4. fresh `packages/vrender-core rushx test` 暴露一条**不在本批触点内**的现存红灯：
     - `__tests__/unit/modules/explicit-bindings.test.ts`
     - 失败点：`bindRenderModules should bind render services, contributions and providers without ContainerModule`
     - 当前表现：`toDynamicValue` 调用次数从断言预期的 `1` 变成 `2`
     - 该红灯发生在 `modules/explicit-bindings`，不在这轮 browser page caller replacement 的修改面内，因此本条目只把它记录为 fresh verification 发现，不把本批误记成“全量 package test 全绿”
- 是否仍阻塞 handoff：
  是。整体 `legacy removal` 仍未完成；同时 fresh verification 还暴露了 core package 的一条现存单测红灯。

### 2026-04-10 22:24 — Legacy removal / P1 `vrender-core` browser shared util / node fixture / 第二批简单页

- 背景：
  在 `vrender-core` 第一批简单 page caller 收口后，下一层最值当的仍是 shared util 和 node fixture；它们一旦切到 app-scoped helper，后续多页迁移就不需要重复改同样的 stage 创建逻辑。同时再扩一批简单 page，可以继续快速压缩 source 命中数量。
- 实现/结论：
  1. 以下 shared util / fixture 已完成 caller replacement：
     - `__tests__/browser/src/core/stage.ts`
     - `__tests__/browser/src/render/utils.ts`
     - `__tests__/browser/src/interactive/utils.ts`
     - `__tests__/browser/src/node/index.js`
  2. 以下第二批简单页已完成 caller replacement：
     - `image.ts`
     - `bar3d.ts`
     - `pie3d.ts`
     - `pyramid3d.ts`
     - `texture.ts`
  3. `legacy-removal-browser-pages.test.ts` 已扩展到：
     - 12 个 core browser pages
     - 4 个 core browser fixtures
  4. 这批改动后，fresh source scan 显示：
     - `packages/vrender-core/__tests__/browser/src` 的 direct deprecated root `createStage()` 命中从更高位继续压缩到 `31` 个文件
     - 其中仍包含：
       - `page-stage.ts` helper 类型签名
       - comment-only 残留
       - 以及尚未迁完的 interactive / page caller
  5. 这意味着 `vrender-core/__tests__/browser` 的 `P1` 已经开始形成稳定批次迁移节奏，但距离清零还明显未完成。
- 是否与设计有差异：
  无。本条仍严格属于 `P1`：
  1. 只做 internal caller replacement
  2. 不开始 `P2 hygiene`
  3. 不把 core browser harness 扩写成新的 smoke 任务
  4. 不把已知 `explicit-bindings` 现存红灯误报成本批回归
- 影响文件：
  `packages/vrender-core/__tests__/browser/src/core/stage.ts`
  `packages/vrender-core/__tests__/browser/src/render/utils.ts`
  `packages/vrender-core/__tests__/browser/src/interactive/utils.ts`
  `packages/vrender-core/__tests__/browser/src/node/index.js`
  `packages/vrender-core/__tests__/browser/src/pages/image.ts`
  `packages/vrender-core/__tests__/browser/src/pages/bar3d.ts`
  `packages/vrender-core/__tests__/browser/src/pages/pie3d.ts`
  `packages/vrender-core/__tests__/browser/src/pages/pyramid3d.ts`
  `packages/vrender-core/__tests__/browser/src/pages/texture.ts`
  `packages/vrender-core/__tests__/unit/legacy-removal-browser-pages.test.ts`
  `docs/refactor/state-engine/D3_LEGACY_PATH_REMOVAL_STATUS.md`
- 所属层级：
  `P1` partial progress
- 验证：
  1. source scan（本批文件）：
     - 本批 5 个 page + 4 个 fixture 已无 direct deprecated root `createStage()` caller
  2. `packages/vrender-core/__tests__/unit/legacy-removal-browser-pages.test.ts` 通过：`16/16 tests`
  3. `packages/vrender-core rushx compile` 通过
  4. fresh repo-level source scan：
     - `packages/vrender-core/__tests__/browser/src` 仍有 `31` 个命中文件待继续处理
  5. 现存 package-level 红灯保持不变：
     - `__tests__/unit/modules/explicit-bindings.test.ts`
     - 当前继续记录为与 browser caller replacement 不同层的既有红灯
- 是否仍阻塞 handoff：
  是。整体 `legacy removal` 仍未完成；`vrender-core/__tests__/browser` 这层还有较多 caller 待继续清理。

### 2026-04-10 22:42 — Legacy removal / P1 `vrender-core` browser page 第三批与第四批简单页继续收口

- 背景：
  `vrender-core/__tests__/browser` 在前两批 caller replacement 后，剩余命中已经收缩到以单 stage page 为主。继续优先处理简单页，可以稳定压缩 direct deprecated root `createStage()` 命中数量，同时把 source-scan 基线扩充到新的已迁移页面集合。
- 实现/结论：
  1. 第三批已完成 caller replacement：
     - `text.ts`
     - `clip.ts`
     - `bin-tree.ts`
     - `state.ts`
     - `test-arc-path.ts`
     - `interactive/circle-drag.ts`
     - `interactive/gesture.ts`
  2. 第四批继续完成 caller replacement：
     - `wordcloud3d.ts`
     - `scatter3d.ts`
     - `flex.ts`
     - `group-perf.ts`
     - `scroll.ts`
     - `theme.ts`
     - `wrap-text.ts`
     - `symbol.ts`
     - `layer.ts`
  3. comment-only 残留同步清理：
     - `wordcloud3d.ts`
     - `scatter3d.ts`
  4. `__tests__/unit/legacy-removal-browser-pages.test.ts` 已扩展到：
     - 25 个 core browser pages
     - 6 个 core browser fixtures
  5. fresh source scan 显示：
     - `packages/vrender-core/__tests__/browser/src` 的 direct deprecated root `createStage()` 命中文件已压缩到 `19`
     - 当前剩余主要集中在：
       - `html.ts`
       - `area.ts`
       - `editor.ts`
       - `animate.ts`
       - `incremental.ts`
       - `richtext.ts`
       - `stage.ts`
       - `glyph.ts`
       - `chart.ts`
       - `pick-test.ts`
       - `animate-3d.ts`
       - `morphing.ts`
       - `jsx.tsx`
       - 以及 `performance-test.ts` 的 comment-only 残留
- 是否与设计有差异：
  无。本条仍严格属于 `P1`：
  1. 只做 internal caller replacement
  2. 不开始 `P2 hygiene`
  3. 不把 triage-only 页面误记为已验证迁移
  4. 不把 `explicit-bindings.test.ts` 现存红灯误报成本批回归
- 影响文件：
  `packages/vrender-core/__tests__/browser/src/pages/text.ts`
  `packages/vrender-core/__tests__/browser/src/pages/clip.ts`
  `packages/vrender-core/__tests__/browser/src/pages/bin-tree.ts`
  `packages/vrender-core/__tests__/browser/src/pages/state.ts`
  `packages/vrender-core/__tests__/browser/src/pages/test-arc-path.ts`
  `packages/vrender-core/__tests__/browser/src/interactive/circle-drag.ts`
  `packages/vrender-core/__tests__/browser/src/interactive/gesture.ts`
  `packages/vrender-core/__tests__/browser/src/pages/wordcloud3d.ts`
  `packages/vrender-core/__tests__/browser/src/pages/scatter3d.ts`
  `packages/vrender-core/__tests__/browser/src/pages/flex.ts`
  `packages/vrender-core/__tests__/browser/src/pages/group-perf.ts`
  `packages/vrender-core/__tests__/browser/src/pages/scroll.ts`
  `packages/vrender-core/__tests__/browser/src/pages/theme.ts`
  `packages/vrender-core/__tests__/browser/src/pages/wrap-text.ts`
  `packages/vrender-core/__tests__/browser/src/pages/symbol.ts`
  `packages/vrender-core/__tests__/browser/src/pages/layer.ts`
  `packages/vrender-core/__tests__/unit/legacy-removal-browser-pages.test.ts`
  `docs/refactor/state-engine/D3_LEGACY_PATH_REMOVAL_STATUS.md`
- 所属层级：
  `P1` partial progress
- 验证：
  1. source scan（本批新增页与 fixture）：
     - 本批 16 个文件已无 direct deprecated root `createStage()` caller
  2. `packages/vrender-core/__tests__/unit/legacy-removal-browser-pages.test.ts` 通过：`31/31 tests`
  3. `packages/vrender-core rushx compile` 通过
  4. fresh repo-level source scan：
     - `packages/vrender-core/__tests__/browser/src` 仍有 `19` 个命中文件待继续处理
  5. 现存 package-level 红灯保持不变：
     - `__tests__/unit/modules/explicit-bindings.test.ts`
     - 当前继续记录为与 browser caller replacement 不同层的既有红灯
- 是否仍阻塞 handoff：
  是。整体 `legacy removal` 仍未完成；`vrender-core/__tests__/browser` 还有一批 caller 待继续清理。

### 2026-04-10 22:57 — Legacy removal / P1 `vrender-core` browser page 第五批单 stage 页继续压缩

- 背景：
  在第三、第四批之后，`vrender-core/__tests__/browser` 剩余 direct deprecated root `createStage()` 命中已经主要集中在少量单 stage page 与少数复杂页面。继续先收 `html / incremental / area / editor` 这批单 stage caller，可以进一步压缩命中数量，同时不把复杂 triage 问题和 caller replacement 混在一起。
- 实现/结论：
  1. 已完成 caller replacement：
     - `html.ts`
     - `incremental.ts`
     - `area.ts`
     - `editor.ts`
  2. `performance-test.ts` 的 comment-only `createStage` 残留已同步清理，避免继续污染 source scan
  3. `__tests__/unit/legacy-removal-browser-pages.test.ts` 已扩展到：
     - 29 个 core browser pages
     - 6 个 core browser fixtures
  4. fresh source scan 显示：
     - `packages/vrender-core/__tests__/browser/src` 的 direct deprecated root `createStage()` 匹配已压缩到 `14` 处
     - 其中仅 `9` 个真实待迁移 page caller：
       - `richtext.ts`
       - `chart.ts`
       - `stage.ts`
       - `animate.ts`
       - `glyph.ts`
       - `animate-3d.ts`
       - `jsx.tsx`
       - `morphing.ts`
       - `pick-test.ts`
     - 其余命中为：
       - `page-stage.ts` helper 类型签名与 `app.createStage(...)`
       - `node/index.js` 的 `app.createStage(...)`
- 是否与设计有差异：
  无。本条仍严格属于 `P1`：
  1. 只做 internal caller replacement
  2. 不开始 `P2 hygiene`
  3. 不把 `loadBrowserEnv/loadCanvasPicker/loadEditable` 这类页面自身初始化逻辑扩写为 installer surface 任务
  4. 不把已知 `explicit-bindings.test.ts` 现存红灯误报成本批回归
- 影响文件：
  `packages/vrender-core/__tests__/browser/src/pages/html.ts`
  `packages/vrender-core/__tests__/browser/src/pages/incremental.ts`
  `packages/vrender-core/__tests__/browser/src/pages/area.ts`
  `packages/vrender-core/__tests__/browser/src/pages/editor.ts`
  `packages/vrender-core/__tests__/browser/src/pages/performance-test.ts`
  `packages/vrender-core/__tests__/unit/legacy-removal-browser-pages.test.ts`
  `docs/refactor/state-engine/D3_LEGACY_PATH_REMOVAL_STATUS.md`
- 所属层级：
  `P1` partial progress
- 验证：
  1. source scan（本批文件）：
     - 本批 5 个文件已无 direct deprecated root `createStage()` caller
  2. `packages/vrender-core/__tests__/unit/legacy-removal-browser-pages.test.ts` 通过：`35/35 tests`
  3. `packages/vrender-core rushx compile` 通过
  4. fresh repo-level source scan：
     - `packages/vrender-core/__tests__/browser/src` 只剩 `14` 处匹配，其中真实待迁移 caller 为 `9` 个 page 文件
  5. 现存 package-level 红灯保持不变：
     - `__tests__/unit/modules/explicit-bindings.test.ts`
     - 当前继续记录为与 browser caller replacement 不同层的既有红灯
- 是否仍阻塞 handoff：
  是。整体 `legacy removal` 仍未完成；`vrender-core/__tests__/browser` 还剩最后一批复杂页待继续处理。

### 2026-04-10 23:15 — Legacy removal / P1 `vrender-core` browser 剩余复杂页与 helper 收口

- 背景：
  在第五批完成后，`vrender-core/__tests__/browser` 只剩最后 6 个真实 page caller：`richtext / chart / stage / animate / animate-3d / jsx`。其中 `stage.ts` 与 `animate.ts` 属于多 stage / 多次重建场景，需要先给 core browser helper 补一层 `createBrowserPageApp()`，再把剩余页统一切到 app-scoped 路径。
- 实现/结论：
  1. `page-stage.ts` 已新增：
     - `createBrowserPageApp()`
     - `createBrowserPageStage()` 改为复用该 helper
  2. 已完成 caller replacement：
     - `stage.ts`
     - `animate.ts`
     - `richtext.ts`
     - `chart.ts`
     - `animate-3d.ts`
     - `jsx.tsx`
  3. `__tests__/unit/legacy-removal-browser-pages.test.ts` 已扩展到：
     - 38 个 core browser pages
     - 6 个 core browser fixtures
  4. fresh source scan 显示：
     - `packages/vrender-core/__tests__/browser/src` 已不再包含 direct deprecated root `createStage()` caller
     - 当前只剩 helper / app-scoped 调用命中：
       - `page-stage.ts` 的 helper 类型签名与 `app.createStage(...)`
       - `node/index.js` 的 `app.createStage(...)`
       - `animate.ts` / `stage.ts` 内部共享 app 的 `app.createStage(...)`
- 是否与设计有差异：
  无。本条仍严格属于 `P1`：
  1. 只做 internal caller replacement
  2. 通过 helper 补齐多 stage / 多次重建页面的 app-scoped caller，不改动主架构边界
  3. 不把 `richtext/chart/jsx` 等页面本身的运行时 triage 问题扩写成新的 blocker
- 影响文件：
  `packages/vrender-core/__tests__/browser/src/page-stage.ts`
  `packages/vrender-core/__tests__/browser/src/pages/stage.ts`
  `packages/vrender-core/__tests__/browser/src/pages/animate.ts`
  `packages/vrender-core/__tests__/browser/src/pages/richtext.ts`
  `packages/vrender-core/__tests__/browser/src/pages/chart.ts`
  `packages/vrender-core/__tests__/browser/src/pages/animate-3d.ts`
  `packages/vrender-core/__tests__/browser/src/pages/jsx.tsx`
  `packages/vrender-core/__tests__/unit/legacy-removal-browser-pages.test.ts`
  `docs/refactor/state-engine/D3_LEGACY_PATH_REMOVAL_STATUS.md`
- 所属层级：
  `P1` partial progress
- 验证：
  1. fresh repo-level source scan：
     - `packages/vrender-core/__tests__/browser/src` 已无 direct deprecated root `createStage()` caller
  2. `packages/vrender-core/__tests__/unit/legacy-removal-browser-pages.test.ts` 通过：`44/44 tests`
  3. `packages/vrender-core rushx compile` 通过
  4. 现存 package-level 红灯保持不变：
     - `__tests__/unit/modules/explicit-bindings.test.ts`
     - 当前继续记录为与 caller replacement 不同层的既有红灯
- 是否仍阻塞 handoff：
  是。整体 `legacy removal` 仍未完成；但 `vrender-core/__tests__/browser` 这一层的 browser/page caller 已完成收口。

### 2026-04-10 23:36 — Legacy removal / P1 `vrender-core` unit smoke 试探性迁移与边界确认

- 背景：
  在 `vrender-core/__tests__/browser` 清到只剩 helper 后，repo 范围 direct deprecated root `createStage()` caller 几乎只剩两类：
  1. 兼容 surface / helper 自身
  2. `__tests__/unit/smoke/stage-graphic.test.ts`

  为了确认 `P1` 是否已经可以进一步收口，我对这条 unit smoke 旧 caller 做了一次 app-scoped 试探性迁移。
- 结论：
  1. `stage-graphic.test.ts` 的 app-scoped 试探性迁移 **没有纳入最终结果**，已恢复到原状
  2. 原因不是 caller replacement 失败，而是该测试在 app-scoped node runtime 下暴露了新的运行时差异：
     - 第一层问题：直接复用 `vrender-kits/src/installers/app.ts` 时，Jest 通过 package alias 取到的 `@visactor/vrender-core` 导出里缺少 `configureRuntimeApplicationForApp`
     - 第二层问题：改成 source-level runtime installer 后，node stub 渲染进一步暴露 `DefaultCanvasRectRender.transformWithoutTranslate()` 中 `context.project(...).x` 取值为空
  3. 这已经不是 `P1 browser/page caller replacement` 的同类问题，而是独立的 app-scoped node runtime/smoke 适配问题，当前不应混入本批继续硬推
  4. 因此当前对 `P1` 的最准确表述是：
     - `vrender-core/__tests__/browser` browser/page caller 已完成收口
     - repo 范围内仍保留一条 unit smoke 旧 caller 作为独立后续项
- 是否与设计有差异：
  无。这条记录的目的不是扩围，而是明确边界：
  1. `P1` 当前继续聚焦 internal caller removal
  2. 对 app-scoped node runtime 暴露的新差异，只做记录，不在本批伪装成“顺手修完”
- 影响文件：
  `packages/vrender-core/__tests__/unit/smoke/stage-graphic.test.ts`
  `docs/refactor/state-engine/D3_LEGACY_PATH_REMOVAL_STATUS.md`
- 所属层级：
  `P1` partial progress / boundary note
- 验证：
  1. repo-level direct caller scan：
     - 除兼容 surface / helper 外，仅剩 `__tests__/unit/smoke/stage-graphic.test.ts`
  2. `stage-graphic.test.ts` 试探性 app-scoped 迁移曾暴露 node runtime 差异，已回退
  3. 回退后：
     - `__tests__/unit/smoke/stage-graphic.test.ts` 重新通过：`1/1 tests`
     - `packages/vrender-core rushx compile` 通过
- 是否仍阻塞 handoff：
  是。整体 `legacy removal` 仍未完成；当前至少仍有：
  1. `P1` 的这条 unit smoke 旧 caller边界待后续决策
  2. `P2` hygiene cleanup 未开始

### 2026-04-10 23:52 — Legacy removal / P1 `stage-graphic.test.ts` 试探性 app-scoped 迁移根因补充

- 背景：
  在前一条边界确认后，我继续对 `__tests__/unit/smoke/stage-graphic.test.ts` 做了更细的根因排查，目标是分清它到底是“还能继续按 caller replacement 收口”，还是“已经进入新的 runtime 差异层”。
- 结论：
  1. 试探性迁移再次证明：当前这条 test 不能被视为普通 `createStage()` caller replacement
  2. 更精确的根因有两层：
     - 当测试直接引入 `vrender-kits/src/installers/app.ts` 时，source Jest 环境会混入 package alias 侧的 `@visactor/vrender-core`，导致 `configureRuntimeApplicationForApp` 解析缺失
     - 即使改成 source-level runtime installer，若继续沿 app-scoped node 路径推进，这条 smoke 还会进一步撞上新的 runtime 差异：
       - 一次是 `context.project(...).x` 为空（假 window/context stub 与 `NodeContext2d` 预期不兼容）
       - 再往下改则会触发 `DefaultGlobal.createCanvas` 走到 package alias/cjs 侧，暴露 source/cjs 混用的 global state 问题
  3. 因此这条 test 当前应继续视为：
     - 独立的 app-scoped node runtime / test harness 适配问题
     - 不应混入本批 `P1 internal caller removal` 硬推
  4. 我已将 `stage-graphic.test.ts` 回退到稳定版本，并确认：
     - test 重新通过
     - `packages/vrender-core rushx compile` 通过
  5. 当前 repo 范围 fresh scan 结论保持不变：
     - browser/page 层 direct deprecated root `createStage()` caller 已收口
     - 除兼容 surface / helper 外，剩余旧 caller 只剩这条 unit smoke 边界项
- 是否与设计有差异：
  无。本条是边界澄清，不是扩围实现。
- 影响文件：
  `packages/vrender-core/__tests__/unit/smoke/stage-graphic.test.ts`
  `docs/refactor/state-engine/D3_LEGACY_PATH_REMOVAL_STATUS.md`
- 所属层级：
  `P1` boundary note
- 验证：
  1. `__tests__/unit/smoke/stage-graphic.test.ts` 回退后通过：`1/1 tests`
  2. `packages/vrender-core rushx compile` 通过
  3. repo-level direct caller scan 结果保持：
     - browser/page 层已无 direct deprecated root `createStage()` caller
- 是否仍阻塞 handoff：
  是。整体 `legacy removal` 仍未完成；当前继续至少受：
  1. `stage-graphic.test.ts` 这条 unit smoke 边界项
  2. `P2` hygiene cleanup 未开始

### 2026-04-11 10:22 — Legacy removal / 方案 A 正式固化为 node runtime / smoke harness alignment 专项

- 背景：
  在 `P0 completed / P1 progressed to boundary / P2 not started` 的 review 结论被接受后，需要把 `stage-graphic.test.ts` 的边界判断正式固化成独立任务文档，避免后续开发继续把它混进当前 `P1 caller cleanup` 批次。
- 结论：
  1. 已正式接受方案 A：
     - `stage-graphic.test.ts` 超出当前 `P1 caller cleanup` 边界
     - 当前 `P1` 可按“caller cleanup reached natural boundary”理解
     - 该 test 单独拆为 `node runtime / smoke harness alignment` 专项
  2. 已新增专项文档：
     - `docs/refactor/state-engine/D3_LEGACY_NODE_RUNTIME_SMOKE_ALIGNMENT.md`
     - `docs/refactor/state-engine/D3_LEGACY_NODE_RUNTIME_SMOKE_PROMPT.md`
  3. 已同步更新：
     - `D3_LEGACY_PATH_REMOVAL_STATUS.md`
     - `README.md`
     - `D3_ARCHIVE_INDEX.md`
  4. 当前总体结论不变：
     - 仍不能宣称 `legacy removal completed`
     - 仍不能恢复宣称 `handoff ready`
- 是否与设计有差异：
  无。本条是文档化收口，不修改已接受的 legacy removal 边界，也不把该专项降级成随意 follow-up。
- 影响文件：
  `docs/refactor/state-engine/D3_LEGACY_NODE_RUNTIME_SMOKE_ALIGNMENT.md`
  `docs/refactor/state-engine/D3_LEGACY_NODE_RUNTIME_SMOKE_PROMPT.md`
  `docs/refactor/state-engine/D3_LEGACY_PATH_REMOVAL_STATUS.md`
  `docs/refactor/state-engine/README.md`
  `docs/refactor/state-engine/D3_ARCHIVE_INDEX.md`
- 所属层级：
  `legacy removal` documentation / boundary formalization
- 验证：
  1. 文档自检通过：
     - 新专项文档已被 `README.md` 与 `D3_ARCHIVE_INDEX.md` 收录
     - `D3_LEGACY_PATH_REMOVAL_STATUS.md` 的当前建议与最终结论已同步到方案 A 口径
  2. 本条不涉及代码改动，因此未新增测试运行
- 是否仍阻塞 handoff：
  是。当前仍至少受：
  1. `P2` hygiene cleanup 未开始
  2. `legacy removal` 总体未完成

### 2026-04-11 12:18 — Legacy removal / node runtime & smoke harness alignment 收口

- 背景：
  `P1` 的 browser/page/source caller cleanup 已推进到自然边界后，repo 范围唯一剩余的 direct deprecated root `createStage()` 真实命中只剩 `packages/vrender-core/__tests__/unit/smoke/stage-graphic.test.ts`。这条 test 已被正式拆为独立专项，目标是在不走 package alias/cjs 绕路的前提下，为 `vrender-core` unit smoke 建立最小 app-scoped node runtime helper，并让这条 smoke 在 app-scoped 路径下重新稳定变绿。
- 结论：
  1. 已在 `packages/vrender-core/__tests__/unit/smoke/node-smoke-stage.ts` 建立最小 app-scoped node smoke helper：
     - 只使用 `vrender-core` source-level entry/runtime installer
     - 不依赖 deprecated root `createStage()`
     - 不引入 `vrender-kits/src/installers/app.ts`，避免 source/package alias 混用
  2. helper 内部显式补齐了 app-scoped smoke 所需的最小 runtime glue：
     - node env contribution
     - node window/canvas/context stub
     - layer handler factory
     - `application.graphicService`
     - stage/app release 去重，避免 `app.release()` 与 `stage.release()` 递归
  3. `packages/vrender-core/__tests__/unit/smoke/stage-graphic.test.ts` 已切到该 helper，并在 app-scoped 路径下重新通过。
  4. 这条专项完成后，`P1` 最后一条 unit smoke 边界项已收口；当前可以把 `P1` 正式理解为：
     - `caller cleanup reached natural boundary`
     - browser/page/source caller cleanup 已完成
  5. `legacy removal` 整体仍未完成，因为 `P2` hygiene cleanup 仍未开始。
- 是否与设计有差异：
  无。本条只完成已批准的独立专项，不重开 D3 Phase 1-4，也不扩大 `P1` / `P2` 边界。
- 影响文件：
  `packages/vrender-core/__tests__/unit/smoke/node-smoke-stage.ts`
  `packages/vrender-core/__tests__/unit/smoke/stage-graphic.test.ts`
  `docs/refactor/state-engine/D3_LEGACY_PATH_REMOVAL_STATUS.md`
- 所属层级：
  `legacy removal` / node runtime & smoke harness alignment
- 验证：
  1. `packages/vrender-core rushx test -- --runInBand __tests__/unit/smoke/stage-graphic.test.ts --verbose`
     - 通过：`1/1 tests`
  2. `packages/vrender-core rushx test -- --runInBand __tests__/unit/entries/runtime-installer.test.ts --verbose`
     - 通过：`1/1 tests`
  3. `packages/vrender-core rushx compile`
     - 通过
  4. source scan：
     - `stage-graphic.test.ts` / `node-smoke-stage.ts` 不再依赖 deprecated root `createStage()`
- 是否仍阻塞 handoff：
  是。`P1` 已可正式收口到 boundary，但整体 `legacy removal` 仍受 `P2` hygiene cleanup 未开始而阻塞。

### 2026-04-11 13:04 — Legacy removal / P2 hygiene cleanup 执行材料建立

- 背景：
  在 `P0 completed`、`P1 formally closed to boundary` 之后，`legacy removal` 剩余 blocker 只剩 `P2 hygiene cleanup`。需要把下一轮任务从模糊的“继续推进 legacy removal”收口成只做 live package / lockfile / active docs 清理的执行材料。
- 结论：
  1. 已新增：
     - `docs/refactor/state-engine/D3_LEGACY_P2_HYGIENE_GUIDE.md`
     - `docs/refactor/state-engine/D3_LEGACY_P2_HYGIENE_PROMPT.md`
  2. 已同步更新：
     - `D3_LEGACY_PATH_REMOVAL_STATUS.md`
     - `README.md`
     - `D3_ARCHIVE_INDEX.md`
  3. 当前边界已写死：
     - 只做 `docs/demos/package.json`
     - lockfile
     - active docs 的 hygiene 清理
     - 不反向修改 `P0` / `P1`
     - 不把 archive/changelog 的历史引用误当作本轮必须清零对象
- 是否与设计有差异：
  无。本条只做执行材料收口，不改变既定 `P0 / P1 / P2` 验收定义。
- 影响文件：
  `docs/refactor/state-engine/D3_LEGACY_P2_HYGIENE_GUIDE.md`
  `docs/refactor/state-engine/D3_LEGACY_P2_HYGIENE_PROMPT.md`
  `docs/refactor/state-engine/D3_LEGACY_PATH_REMOVAL_STATUS.md`
  `docs/refactor/state-engine/README.md`
  `docs/refactor/state-engine/D3_ARCHIVE_INDEX.md`
- 所属层级：
  `legacy removal` / `P2` documentation setup
- 验证：
  1. 文档自检通过：
     - 新执行材料已被 `README.md` 与 `D3_ARCHIVE_INDEX.md` 收录
     - `D3_LEGACY_PATH_REMOVAL_STATUS.md` 的“下一步”已同步到 `P2 hygiene cleanup`
  2. 本条不涉及代码改动，因此未新增测试运行
- 是否仍阻塞 handoff：
  是。当前 `legacy removal` 仍待 `P2 hygiene cleanup` 完成后才能整体关闭。

### 2026-04-11 14:12 — Legacy removal / P2 hygiene cleanup 尝试与 blocker 确认

- 背景：
  在 `P0 completed`、`P1 formally closed to boundary` 之后，本轮按 `D3_LEGACY_P2_HYGIENE_GUIDE.md` 只执行 hygiene cleanup：清理 `docs/demos/package.json` 中的无主 `inversify`、通过正常依赖更新路径刷新 Rush lockfile、并核对 active docs 是否可以切到最终状态。
- 结论：
  1. `docs/demos/package.json` 中的 `inversify` 已删除。
  2. 已分别执行：
     - `rush update`
     - `rush update --full`
     但 `common/config/rush/pnpm-lock.yaml` 仍保留：
     - `inversify@6.0.1`
     - `@visactor/vrender@0.14.8`
     - `@visactor/vrender-components@0.14.8`
     等旧 package snapshot，因此当前不能把 lockfile 视为已完成 hygiene 收口。
  3. `docs/demos` 的最小 TypeScript 验证继续暴露 live blocker：
     - `Module '"@visactor/vrender"' has no exported member 'createBrowserVRenderApp'`
     - `Cannot find module '../utils'`
  4. 因此本轮不能把 active docs 切到：
     - `P2 completed`
     - `legacy removal completed`
     - `handoff ready`
     当前正确状态应保持为：
     - `P0 completed`
     - `P1 formally closed to boundary`
     - `P2 blocked`
- 是否与设计有差异：
  无。本条没有回头扩围 `P0` / `P1`，也没有重开 D3 Phase 1-4；只是按 `P2` 指令执行后，确认了仍存在 live blocker。
- 影响文件：
  `docs/demos/package.json`
  `common/config/rush/pnpm-lock.yaml`
  `docs/refactor/state-engine/README.md`
  `docs/refactor/state-engine/D3_ARCHIVE_INDEX.md`
  `docs/refactor/state-engine/D3_PRE_HANDOFF_HARDENING.md`
  `docs/refactor/state-engine/D3_PRE_HANDOFF_HARDENING_SUMMARY.md`
  `docs/refactor/state-engine/D3_LEGACY_PATH_REMOVAL_STATUS.md`
  `docs/refactor/state-engine/D3_LEGACY_P2_HYGIENE_GUIDE.md`
  `docs/refactor/state-engine/D3_LEGACY_P2_HYGIENE_PROMPT.md`
- 所属层级：
  `legacy removal` / `P2 hygiene cleanup`
- 验证：
  1. `rg -n '"inversify"' docs/demos/package.json`
     - 结果：无命中
  2. `rush update`
     - 结果：通过
  3. `rush update --full`
     - 结果：通过
  4. `rg -n 'inversify@6\\.0\\.1|\\binversify:\\s*6\\.0\\.1\\b' common/config/rush/pnpm-lock.yaml`
     - 结果：仍有命中
  5. `common/temp/node_modules/.pnpm/node_modules/.bin/tsc -p docs/demos/tsconfig.json --noEmit`
     - 结果：失败，暴露 `createBrowserVRenderApp` 导出缺失与 `../utils` 缺失
  6. active docs 自检：
     - 已保持为 `P2 blocked` 口径，未误切到 completed / handoff ready
- 是否仍阻塞 handoff：
  是。当前 `legacy removal` 仍被 `P2` 阻塞；在 lockfile hygiene 与 `docs/demos` 最小验证问题拍板前，不能恢复 `handoff ready`。

### 2026-04-12 10:18 — Legacy removal / P2 blocker root cause 复核

- 背景：
  架构师已重新拍板本轮只做 `P2 hygiene cleanup`，并明确写死停机条件：如果 lockfile 中的 `inversify@6.0.1` 仍被 live package graph 真正依赖，就必须停下来反馈，不能把 lockfile 当作“无主残留”伪装清零。
- 结论：
  1. `common/config/rush/pnpm-lock.yaml` 中的 `inversify@6.0.1` 当前不是无主残留。
  2. 真实来源是 live 的 [docs/package.json](/Users/bytedance/Documents/GitHub/VRender2/docs/package.json) 仍依赖 `@visactor/vchart@1.3.0`，而 lockfile 中：
     - `@visactor/vchart@1.3.0 -> @visactor/vrender@0.14.8`
     - `@visactor/vchart@1.3.0 -> @visactor/vrender-components@0.14.8`
     - `@visactor/vrender@0.14.8 / @visactor/vrender-components@0.14.8 -> inversify@6.0.1`
  3. 这意味着当前 `P2` 不能再按“清 lockfile 无主项”继续推进；如果要把 lockfile 中的 `inversify@6.0.1` 清掉，必须先改 live package graph，而这已经超出本轮只做 `docs/demos/package.json + lockfile hygiene + active docs sync` 的边界。
  4. `docs/demos` 的最小 live 验证问题仍然单独存在，但它已经不是当前最先决的 blocker；在 lockfile live 依赖图没有拍板前，不应把 `docs/demos` 层面的最小修复误写成 `P2 completed` 证据。
  5. `docs/demos` 当前最小验证失败的更精确根因也已确认：
     - `docs/demos/src/pages/rect.ts` 引用了缺失的 `../utils`
     - `packages/vrender/es/index.d.ts` 当前未导出 `createBrowserVRenderApp`，与 `packages/vrender/src/index.ts` 的源码口径不一致，因此 `docs/demos` 的 `tsc --noEmit` 会先在类型面失败
- 是否与设计有差异：
  无。这条记录只是把 `P2` blocker 从“现象”升级成“已定位 root cause”，不回头修改 `P0 / P1`，也不重开 D3 主设计。
- 影响文件：
  `docs/package.json`
  `common/config/rush/pnpm-lock.yaml`
  `docs/demos/src/pages/rect.ts`
  `packages/vrender/es/index.d.ts`
  `docs/refactor/state-engine/D3_LEGACY_PATH_REMOVAL_STATUS.md`
- 所属层级：
  `legacy removal` / `P2 hygiene cleanup`
- 验证：
  1. `rg -n '@visactor/vchart\": \"1\\.3\\.0\"|@visactor/vrender\": 0\\.14\\.8|@visactor/vrender-components\": 0\\.14\\.8|inversify: 6\\.0\\.1' docs/package.json common/config/rush/pnpm-lock.yaml`
     - 命中，确认 live graph 仍链到 `inversify@6.0.1`
  2. `rg -n 'workspace:0\\.14\\.' docs/demos/package.json`
     - 命中，确认 `docs/demos` 自身仍停留在历史版本口径
  3. `common/temp/node_modules/.pnpm/node_modules/.bin/tsc -p docs/demos/tsconfig.json --noEmit`
     - 继续失败；当前失败点已收敛到 `createBrowserVRenderApp` 类型导出缺口与 `../utils` 缺失
- 是否已解除 handoff 阻塞：
  否。当前阻塞已经从“疑似 stale lockfile 条目”升级为“live package graph 仍真实依赖旧 `vrender` / `inversify`”，在边界拍板前不能恢复 `legacy removal completed` / `handoff ready`。

### 2026-04-12 10:31 — Legacy removal / P2 按新执行指令复跑确认

- 背景：
  架构师已重新拍板本轮只做 `P2 hygiene cleanup`，并要求重新确认当前 blocker 是否仍成立，不能只复述上轮结论。
- 结论：
  1. fresh scan 确认 [docs/demos/package.json](/Users/bytedance/Documents/GitHub/VRender2/docs/demos/package.json) 当前已不再含 `inversify`。
  2. fresh scan 继续确认 [common/config/rush/pnpm-lock.yaml](/Users/bytedance/Documents/GitHub/VRender2/common/config/rush/pnpm-lock.yaml) 中的 `inversify@6.0.1` 仍由 live 的 [docs/package.json](/Users/bytedance/Documents/GitHub/VRender2/docs/package.json) -> `@visactor/vchart@1.3.0` 这条依赖链真实拉入。
  3. fresh `tsc -p docs/demos/tsconfig.json --noEmit` 继续失败，`docs/demos` 的最小 live 验证尚未转绿。
  4. 因此当前 `P2` 继续保持 blocked；这不是旧记录残留，而是重新验证后仍成立的当前状态。
- 是否与设计有差异：
  无。该条目仅补 fresh 复核证据，不扩大任务范围。
- 影响文件：
  `docs/demos/package.json`
  `common/config/rush/pnpm-lock.yaml`
  `docs/package.json`
- 所属层级：
  `legacy removal` / `P2 hygiene cleanup`
- 验证：
  1. `rg -n '"inversify"' docs/demos/package.json`
     - 结果：无命中
  2. `rg -n '@visactor/vchart\": \"1\\.3\\.0\"|@visactor/vrender\": 0\\.14\\.8|@visactor/vrender-components\": 0\\.14\\.8|inversify@6\\.0\\.1|inversify: 6\\.0\\.1' docs/package.json common/config/rush/pnpm-lock.yaml`
     - 结果：继续命中
  3. `common/temp/node_modules/.pnpm/node_modules/.bin/tsc -p docs/demos/tsconfig.json --noEmit`
     - 结果：继续失败
- 是否已解除 handoff 阻塞：
  否。当前仍不能恢复 `legacy removal completed` / `handoff ready`。

### 2026-04-12 17:28 — Legacy removal / P2 blocker 双收口，legacy removal 完成

- 背景：
  `P2 hygiene cleanup` 当前只剩两个已拍板 blocker：
  1. `docs/package.json -> @visactor/vchart@1.3.0` 这条 live package graph 继续把旧 `vrender` / `vrender-components` / `inversify@6.0.1` 拉入 Rush lockfile
  2. `docs/demos` 的最小 live 验证仍失败，表现为 `createBrowserVRenderApp` 在当前 `@visactor/vrender` 类型面不可见，以及 `docs/demos/src/pages/rect.ts` 引用的 `../utils` 缺失
- 结论：
  1. live package graph 已按最小改动收口：
     - [docs/package.json](/Users/bytedance/Documents/GitHub/VRender2/docs/package.json) 已移除不再使用的 `@visactor/vchart@1.3.0` 与 `@visactor/vgrammar`
     - `rush update` 后，Rush lockfile 已不再包含 live graph 拉入的：
       - `@visactor/vchart@1.3.0`
       - `@visactor/vrender@0.14.8`
       - `@visactor/vrender-components@0.14.8`
       - `inversify@6.0.1`
  2. `docs/demos` 的最小 live 目录已按最小范围补齐，不扩成 demo 体系重构：
     - 新增 `index.html`
     - 新增 `src/main.ts`
     - 新增 `src/utils.ts`
     - 新增 `src/types/vrender.d.ts`
     - 新增 `vite.config.js`
     - [docs/demos/package.json](/Users/bytedance/Documents/GitHub/VRender2/docs/demos/package.json) 已移除 `inversify`，并把 `vrender` / `vrender-kits` / `vrender-components` workspace 版本对齐到当前仓库版本
  3. `docs/demos` 的最小 live 验证已转绿：
     - `tsc -p docs/demos/tsconfig.json --noEmit`
     - `vite build`
     - `vite --host 127.0.0.1 --port 3027 --strictPort`
  4. 因此本轮两个 `P2` blocker 已全部解除：
     - `P2 completed`
     - `legacy removal completed`
     - 若结合此前已保持为绿的 pre-handoff gate，则当前可恢复 `handoff ready`
- 是否与设计有差异：
  无。本条严格停留在已拍板的两个 blocker 内：
  1. 不回头修改 `P0` runtime installer surface
  2. 不继续扩大 `P1` caller cleanup
  3. 不重开 D3 Phase 1-4 主设计
  4. 不把 archive/changelog 历史引用当成本轮必须清零对象
- 影响文件：
  `docs/package.json`
  `docs/demos/package.json`
  `docs/demos/tsconfig.json`
  `docs/demos/index.html`
  `docs/demos/vite.config.js`
  `docs/demos/src/main.ts`
  `docs/demos/src/utils.ts`
  `docs/demos/src/types/vrender.d.ts`
  `common/config/rush/pnpm-lock.yaml`
  `docs/refactor/state-engine/README.md`
  `docs/refactor/state-engine/D3_ARCHIVE_INDEX.md`
  `docs/refactor/state-engine/D3_PRE_HANDOFF_HARDENING.md`
  `docs/refactor/state-engine/D3_PRE_HANDOFF_HARDENING_SUMMARY.md`
  `docs/refactor/state-engine/D3_LEGACY_PATH_REMOVAL_STATUS.md`
- 验证：
  1. `rg -n '"inversify"' docs/demos/package.json`
     - 结果：无命中
  2. `rg -n '@visactor/vchart@1\\.3\\.0|@visactor/vrender@0\\.14\\.8|@visactor/vrender-components@0\\.14\\.8|inversify@6\\.0\\.1' docs/package.json common/config/rush/pnpm-lock.yaml`
     - 结果：无命中
  3. `rush update`
     - 结果：通过
  4. `common/temp/node_modules/.pnpm/node_modules/.bin/tsc -p docs/demos/tsconfig.json --noEmit`
     - 结果：通过
  5. `cd docs/demos && ../../common/temp/node_modules/.pnpm/node_modules/.bin/vite build`
     - 结果：通过
  6. `cd docs/demos && ../../common/temp/node_modules/.pnpm/node_modules/.bin/vite --host 127.0.0.1 --port 3027 --strictPort`
     - 结果：成功启动，输出 `Local: http://127.0.0.1:3027/`
  7. active docs 自检：
     - `README.md`
     - `D3_ARCHIVE_INDEX.md`
     - `D3_PRE_HANDOFF_HARDENING.md`
     - `D3_PRE_HANDOFF_HARDENING_SUMMARY.md`
     - `D3_LEGACY_PATH_REMOVAL_STATUS.md`
     - 当前状态已统一切到最终完成态
- 是否影响 `P2`：
  是。该条目标志 `P2` 已完成。
- 是否已解除 handoff 阻塞：
  是。`legacy removal` 已完成；若结合此前 pre-handoff hardening 与 smoke harness 结论，当前可恢复 `handoff ready`。

### 2026-04-12 17:46 — Consolidated handoff gate / fresh gate 复跑中止于 core red light

- 背景：
  按最终 `consolidated handoff gate` 指令，需要基于 fresh verification 重新跑完整 handoff 门槛，不能沿用历史通过记录；且只要任一 compile / test / smoke / docs live gate 失败，就必须立即停止并反馈 blocker。
- 结论：
  1. 已 fresh 跑：
     - `rush compile -t @visactor/vrender-core`
     - `cd packages/vrender-core && rushx test`
  2. `vrender-core` compile 通过，但 `vrender-core` 全量 test 当前不通过：
     - 失败文件：`packages/vrender-core/__tests__/unit/modules/explicit-bindings.test.ts`
     - 失败用例：`bindRenderModules should bind render services, contributions and providers without ContainerModule`
     - 失败原因：`toDynamicValue` 调用次数断言失配，期望 `1`，实际 `2`
  3. 按 stop 条件，当前已停止后续 consolidated gate：
     - 未继续跑 `vrender-animate` / `vrender` / `react-vrender` / smoke baseline / docs live gate 的 fresh gate 部分
  4. 因此这轮 fresh consolidated gate 当前结论只能是：
     - consolidated gate 未全绿
     - 当前不能继续维持 `handoff ready`
- 是否与设计有差异：
  无。本条只记录 fresh gate 结果，不重开 D3 Phase 1-4 主设计，也不借机扩围修复。
- 影响文件：
  `packages/vrender-core/__tests__/unit/modules/explicit-bindings.test.ts`
  `docs/refactor/state-engine/D3_PHASE4_IMPLEMENTATION_LOG.md`
- 验证：
  1. `rush compile -t @visactor/vrender-core`
     - 结果：通过
  2. `cd packages/vrender-core && rushx test`
     - 结果：失败
     - 汇总：`1 failed, 95 passed, 96 total`
     - blocker：`explicit-bindings.test.ts`
- 是否影响 consolidated handoff gate：
  是。当前已命中 fresh core red light，整套 gate 应视为失败。
- 是否仍能维持 `handoff ready`：
  否。至少在这条 fresh core test red light 被重新收口前，不能继续维持 `handoff ready`。

### 2026-04-13 09:18 — Consolidated handoff gate blocker / explicit-bindings.test.ts 收口

- 背景：
  上一条 consolidated gate fresh 复跑在 `packages/vrender-core/__tests__/unit/modules/explicit-bindings.test.ts` 命中 blocker。失败用例为：
  `bindRenderModules should bind render services, contributions and providers without ContainerModule`
  失败断言是 `toDynamicValue` 调用次数期望 `1`、实际 `2`。
- root cause：
  不是 `bindRenderModules()` 运行时回归，而是测试期望滞后。当前显式绑定路径下，`bindRenderModules()` 合法地产生两次 `toDynamicValue(...)`：
  1. `GroupRender -> DefaultCanvasGroupRender(createContributionProvider(GroupRenderContribution, container))`
  2. `DefaultBaseInteractiveRenderContribution -> new DefaultBaseInteractiveRenderContribution(createContributionProvider(InteractiveSubRenderContribution, container))`
  原测试仍停留在只校验第一条动态绑定的旧语义，因此在 fresh core gate 下转红。
- 修复方式：
  1. 将 `toDynamicValue` 调用次数断言从 `1` 更新为 `2`
  2. 显式取出两次工厂回调并执行
  3. 同时断言：
     - `GroupRenderContribution`
     - `InteractiveSubRenderContribution`
     都通过 `createContributionProvider(...)` 正确绑定到同一个 container
  4. 不修改 `bindRenderModules()` 生产代码，不改变 runtime 行为，只修正测试与当前显式绑定实现的一致性
- 是否与设计有差异：
  无。该修复严格停留在已拍板 blocker 内，不重开 D3 主设计，也不扩围到其它 gate。
- 影响文件：
  `packages/vrender-core/__tests__/unit/modules/explicit-bindings.test.ts`
  `docs/refactor/state-engine/D3_PHASE4_IMPLEMENTATION_LOG.md`
- fresh 验证：
  1. `cd packages/vrender-core && rushx test -- --runInBand __tests__/unit/modules/explicit-bindings.test.ts --verbose`
     - 结果：通过
     - 汇总：`1 suite, 8 tests passed`
  2. `rush compile -t @visactor/vrender-core`
     - 结果：通过
  3. `cd packages/vrender-core && rushx test`
     - 结果：通过
     - 汇总：`96 suites, 523 tests passed`
  4. `ts-jest sourceMap: false` warning 仍会打印，但这是仓库既有 warning，不是本条 blocker
- 是否影响 consolidated handoff gate：
  是。该条 blocker 已解除。
- 是否允许重新启动 consolidated handoff gate：
  是。当前已经满足“先修 core blocker，再重新跑整套 consolidated gate”的前置条件。

### 2026-04-13 16:44 — Consolidated handoff gate / fresh rerun stopped at vrender-animate test hang

- 背景：
  在 `explicit-bindings.test.ts` 收口后，按 fresh consolidated handoff gate 顺序重新启动全量验证。本轮不沿用历史通过记录，必须重新执行 core build/test、上层包 test/compile、动画专项、smoke baseline 与 docs live gate。
- 结论：
  1. 已 fresh 跑：
     - `rush compile -t @visactor/vrender-core`
     - `cd packages/vrender-core && rushx test -- --runInBand __tests__/unit/modules/explicit-bindings.test.ts --verbose`
     - `cd packages/vrender-core && rushx test`
  2. 上述三项均通过：
     - `@visactor/vrender-core` compile：通过
     - `explicit-bindings.test.ts` 定向：`1 suite / 8 tests` 通过
     - `vrender-core` 全量：`96 suites / 523 tests` 通过
  3. 在继续执行 `cd packages/vrender-animate && rushx test` 时，fresh gate 命中新的 blocker：
     - 默认 `rushx test` 在当前 gate 环境下长时间无返回
     - 串行 `rushx test -- --runInBand` 也长时间无返回
     - 多次 fresh 尝试后，均无法在合理时间内得到 pass/fail 结果，因此该项当前应按 hang / red light 处理
  4. 按 consolidated gate stop 条件，本轮在 `vrender-animate` 处停止，未继续把后续 gate 包装成“整体仍可 handoff”
- 是否与设计有差异：
  无。该结论只反映 fresh gate 结果，不重开 D3 主设计，也不扩 legacy removal 范围。
- 影响文件：
  `docs/refactor/state-engine/D3_PHASE4_IMPLEMENTATION_LOG.md`
- fresh 验证：
  1. `rush compile -t @visactor/vrender-core`
     - 结果：通过
  2. `cd packages/vrender-core && rushx test -- --runInBand __tests__/unit/modules/explicit-bindings.test.ts --verbose`
     - 结果：通过
  3. `cd packages/vrender-core && rushx test`
     - 结果：通过
  4. `cd packages/vrender-animate && rushx test`
     - 结果：未完成返回，按 hang 处理
  5. `cd packages/vrender-animate && rushx test -- --runInBand`
     - 结果：未完成返回，按 hang 处理
- 是否影响 consolidated handoff gate：
  是。当前 gate 已在 `vrender-animate` 命中新的 blocker。
- 是否仍能维持 `handoff ready`：
  否。至少在这条 fresh `vrender-animate` gate 收口前，不能继续维持 `handoff ready`。

### 2026-04-13 17:31 — Consolidated handoff gate / vrender-animate test hang 复核收口

- 背景：
  在上一条 consolidated gate 复跑中，`packages/vrender-animate` 被记为 fresh blocker，原因是：
  - `cd packages/vrender-animate && rushx test`
  - `cd packages/vrender-animate && rushx test -- --runInBand`
  两条命令当时都未在可见窗口内返回，因此按 hang 处理。
- root cause：
  1. `rushx test -- --runInBand` 在该包里不是有效的串行验证写法。`package.json` 的脚本是 `jest -c jest.config.js`，因此 `rushx test -- --runInBand --verbose` 实际会变成：
     `jest -c jest.config.js -- --runInBand --verbose`
     其中 `--runInBand` / `--verbose` 会被 Jest 当成 pattern，而不是运行参数，导致：
     - `No tests found`
     - `Pattern: --runInBand|--verbose`
     这条命令不能作为“runInBand 也 hang”的证据。
  2. `rushx test` 本身并未 hang。上一轮更多是执行窗口和轮询策略导致的误判；在本轮 fresh 复核中，plain `rushx test` 可以正常完成并退出。
- 结论：
  1. `packages/vrender-animate` 当前没有新的 runtime blocker。
  2. `vrender-animate` gate 已恢复为绿。
  3. 可以继续从当前点恢复 consolidated handoff gate，而不是继续停在 animate 阶段。
- 是否与设计有差异：
  无。该收口只修正 consolidated gate 的验证结论，不涉及 D3 主设计，也不扩 legacy removal 范围。
- 影响文件：
  `docs/refactor/state-engine/D3_PHASE4_IMPLEMENTATION_LOG.md`
- fresh 验证：
  1. `cd packages/vrender-animate && rushx test -- --runInBand __tests__/unit/ticker.test.ts --verbose`
     - 结果：通过
     - 汇总：`1 suite / 2 tests`
  2. `cd packages/vrender-animate && rushx test -- --runInBand __tests__/unit/timeline.test.ts --verbose`
     - 结果：通过
     - 汇总：`1 suite / 2 tests`
  3. `cd packages/vrender-animate && rushx test -- --runInBand __tests__/unit/animation-runtime-attribute.test.ts --verbose`
     - 结果：通过
     - 汇总：`1 suite / 8 tests`
  4. `cd packages/vrender-animate && rushx test -- --runInBand __tests__/unit/animate-tracking.test.ts --verbose`
     - 结果：通过
     - 汇总：`1 suite / 1 test`
  5. `cd packages/vrender-animate && rushx test -- --runInBand __tests__/unit/graphic-state-extension.test.ts --verbose`
     - 结果：通过
     - 汇总：`1 suite / 3 tests`
  6. `cd packages/vrender-animate && rushx test`
     - 结果：通过
     - 汇总：`8 suites / 30 tests`
  7. `cd packages/vrender-animate && rushx test -- --runInBand --verbose`
     - 结果：失败，但 root cause 是命令写法错误导致 Jest 将参数解析为 pattern，不属于 runtime/blocker
- 是否影响 consolidated handoff gate：
  是。上一条 animate blocker 已解除。
- 是否允许继续 consolidated handoff gate：
  是。当前可以继续跑 `packages/vrender` / `react-vrender` / smoke baseline / docs live gate。

### 2026-04-13 17:35 — Consolidated handoff gate / fresh 全量复跑完成

- 背景：
  在 `explicit-bindings.test.ts` blocker 和 `vrender-animate` 误判 hang 都收口后，重新从当前点继续执行 consolidated handoff gate 的剩余门槛：
  1. `packages/vrender` test / compile
  2. `packages/react-vrender` test / compile
  3. browser smoke baseline
  4. `docs/demos` live gate
  5. `legacy removal completed` 相关 live graph / lockfile 复核
- 结论：
  1. `vrender` / `react-vrender` / 上层 compile gate 均 fresh 通过。
  2. 动画属性级专项仍通过，且覆盖：
     - 状态动画 `t=0 / t=mid / t=end`
     - `animate.to / from`
     - 状态动画中途切状态
     - 自驱动画同属性遇到状态切换
     - `removeChild / removeAllChild / detach / reparent / setStage(null)`
  3. browser smoke baseline 仍通过，6 个 baseline 页全部 `open=true / firstFrame=true / errors=0`。
  4. `docs/demos` live gate 仍通过，`docs/package.json` / `docs/demos/package.json` / lockfile 也仍符合 `legacy removal completed` 结论。
  5. 本轮 consolidated handoff gate 已 fresh 转绿，可以恢复维持 `handoff ready`。
- 是否与设计有差异：
  无。该结论只基于 fresh gate 结果，不重开 D3 Phase 1-4 主设计，也不继续扩 legacy removal 范围。
- 影响文件：
  `docs/refactor/state-engine/D3_PHASE4_IMPLEMENTATION_LOG.md`
- fresh 验证：
  1. `rush compile -t @visactor/vrender-core`
     - 结果：通过
  2. `cd packages/vrender-core && rushx test`
     - 结果：通过
     - 汇总：`96 suites / 523 tests`
  3. `cd packages/vrender-animate && rushx test`
     - 结果：通过
     - 汇总：`8 suites / 30 tests`
  4. `cd packages/vrender-animate && rushx test -- --runInBand __tests__/unit/animation-runtime-attribute.test.ts --verbose`
     - 结果：通过
     - 汇总：`1 suite / 8 tests`
  5. `cd packages/vrender && rushx test`
     - 结果：通过
     - 汇总：`16 suites / 111 tests`，其中 `2 skipped`
  6. `cd packages/react-vrender && rushx test`
     - 结果：通过
     - 汇总：`6 suites / 16 tests`
  7. `cd packages/react-vrender && rushx compile`
     - 结果：通过
  8. `cd packages/vrender && rushx compile`
     - 结果：通过
  9. `cd packages/vrender-kits && rushx compile`
     - 结果：通过
  10. `cd packages/vrender-components && rushx compile`
      - 结果：通过
  11. `packages/vrender rushx start`
      - 结果：通过
      - server：`http://localhost:3012/`
  12. `D3_SMOKE_BASE_URL=http://127.0.0.1:3012/ D3_SMOKE_OUT=/tmp/vrender-smoke-baseline-consolidated.json D3_SMOKE_BASELINE_ONLY=1 common/temp/node_modules/.pnpm/node_modules/.bin/electron packages/vrender/__tests__/browser/scripts/run-smoke-triage.cjs`
      - 结果：通过
      - baseline：`animate-state / interactive-test / rect / state / react / shared-state-batch-smoke`
      - 每页均：`open=true / firstFrame=true / errors=0`
  13. `common/temp/node_modules/.pnpm/node_modules/.bin/tsc -p docs/demos/tsconfig.json --noEmit`
      - 结果：通过
  14. `cd docs/demos && ../../common/temp/node_modules/.pnpm/node_modules/.bin/vite build`
      - 结果：通过
      - 备注：仅有既有 chunk size warning，不是 blocker
  15. `cd docs/demos && ../../common/temp/node_modules/.pnpm/node_modules/.bin/vite --host 127.0.0.1 --port 3027 --strictPort`
      - 结果：启动成功
      - `curl -sI http://127.0.0.1:3027/`：`HTTP/1.1 200 OK`
  16. `rg -n '"inversify"' docs/demos/package.json`
      - 结果：无命中
  17. `rg -n '@visactor/vchart@1\\.3\\.0|@visactor/vrender@0\\.14\\.8|@visactor/vrender-components@0\\.14\\.8|inversify@6\\.0\\.1' docs/package.json docs/demos/package.json common/config/rush/pnpm-lock.yaml`
      - 结果：无命中
- 是否影响 consolidated handoff gate：
  是。当前 consolidated handoff gate 已 fresh 全绿。
- 是否仍能维持 `handoff ready`：
  是。当前可以继续维持：
  - `P0 completed`
  - `P1 formally closed to boundary`
  - `P2 completed`
  - `legacy removal completed`
  - `handoff ready`

### 2026-04-13 17:48 — Consolidated handoff gate blocker / env-check & performance-raf 顶层声明冲突收口

- 背景：
  架构师 fresh 复核 consolidated handoff gate 时，在 core 阶段命中新的 blocker。失败点位于：
  - `packages/vrender-core/__tests__/unit/env-check.test.ts`
  - `packages/vrender-core/__tests__/unit/common/performance-raf.test.ts`
  错误为：
  - `TS2451 Cannot redeclare block-scoped variable 'require'`
  且该问题只在 full test 下暴露，单独跑 `env-check.test.ts` 是绿的。
- root cause：
  这两个 test 文件都被 TypeScript 当成 script 文件处理，顶层 `declare require` 会进入同一个全局作用域：
  - 一处写的是 `declare let require: any`
  - 一处写的是 `declare var require: any`
  在 full test 的统一编译阶段发生同名顶层声明冲突，因此报 `TS2451`。这不是运行时回归，也不是 `env-check` / `performance-raf` 逻辑错误。
- 修复方式：
  1. 在两个 test 文件顶部补 `export {};`，把文件显式变成模块
  2. 将顶层声明统一为模块内的 `declare const require: any`
  3. 不修改任何测试逻辑、mock 逻辑或生产代码，只收口顶层声明作用域
- 是否与设计有差异：
  无。该修复严格停留在当前 consolidated gate blocker 内，不重开 D3 主设计，不修改 `legacy removal completed` 的既有结论。
- 影响文件：
  `packages/vrender-core/__tests__/unit/env-check.test.ts`
  `packages/vrender-core/__tests__/unit/common/performance-raf.test.ts`
  `docs/refactor/state-engine/D3_PHASE4_IMPLEMENTATION_LOG.md`
- fresh 验证：
  1. `cd packages/vrender-core && rushx test -- --runInBand __tests__/unit/env-check.test.ts --verbose`
     - 结果：通过
     - 汇总：`1 suite / 2 tests`
  2. `cd packages/vrender-core && rushx test -- --runInBand __tests__/unit/common/performance-raf.test.ts --verbose`
     - 结果：通过
     - 汇总：`1 suite / 3 tests`
  3. `rush compile -t @visactor/vrender-core`
     - 结果：通过
  4. `cd packages/vrender-core && rushx test`
     - 结果：通过
     - 汇总：`96 suites / 523 tests`
  5. `ts-jest sourceMap: false` warning 仍会打印，但这是仓库既有 warning，不是 blocker
- 是否影响 consolidated handoff gate：
  是。当前 core blocker 已解除。
- 是否允许重新启动 consolidated handoff gate：
  是。当前已满足“先修 core blocker，再从头 fresh 重跑整套 consolidated handoff gate”的前置条件。

### 2026-04-14 10:47 — Consolidated handoff gate / 从起点 fresh 重跑完成

- 背景：
  在 `env-check.test.ts` / `performance-raf.test.ts` 的 core blocker 收口后，按架构师要求从 consolidated gate 起点重新执行整套 handoff 门槛：
  1. `@visactor/vrender-core` compile
  2. `packages/vrender-core rushx test`
  3. `packages/vrender-animate rushx test`
  4. `packages/vrender rushx test`
  5. `packages/react-vrender rushx test`
  6. browser smoke baseline
  7. `docs/demos` live gate
- 结论：
  1. 本轮 consolidated gate 已按起点 fresh 重跑完成。
  2. 所有 gate 全绿，没有新的 blocker。
  3. 当前可以继续维持：
     - `P0 completed`
     - `P1 formally closed to boundary`
     - `P2 completed`
     - `legacy removal completed`
     - `handoff ready`
- 是否与设计有差异：
  无。该结论只基于 fresh 验证结果，不重开 D3 Phase 1-4 主设计，也不继续扩 legacy removal 范围。
- 影响文件：
  `docs/refactor/state-engine/D3_PHASE4_IMPLEMENTATION_LOG.md`
- fresh 验证：
  1. `rush compile -t @visactor/vrender-core`
     - 结果：通过
  2. `cd packages/vrender-core && rushx test`
     - 结果：通过
     - 汇总：`96 suites / 523 tests`
  3. `cd packages/vrender-animate && rushx test`
     - 结果：通过
     - 汇总：`8 suites / 30 tests`
  4. `cd packages/vrender && rushx test`
     - 结果：通过
     - 汇总：`16 suites / 111 tests`，其中 `2 skipped`
  5. `cd packages/react-vrender && rushx test`
     - 结果：通过
     - 汇总：`6 suites / 16 tests`
  6. browser smoke baseline
     - `packages/vrender rushx start`
       - 结果：启动成功
       - 备注：3012 端口占用，本轮实际使用 `http://localhost:3013/`
     - `D3_SMOKE_BASE_URL=http://127.0.0.1:3013/ D3_SMOKE_OUT=/tmp/vrender-smoke-baseline-consolidated-rerun.json D3_SMOKE_BASELINE_ONLY=1 common/temp/node_modules/.pnpm/node_modules/.bin/electron packages/vrender/__tests__/browser/scripts/run-smoke-triage.cjs`
       - 结果：通过
       - baseline：`animate-state / interactive-test / rect / state / react / shared-state-batch-smoke`
       - 每页均：`open=true / firstFrame=true / errors=0`
  7. `common/temp/node_modules/.pnpm/node_modules/.bin/tsc -p docs/demos/tsconfig.json --noEmit`
     - 结果：通过
  8. `cd docs/demos && ../../common/temp/node_modules/.pnpm/node_modules/.bin/vite build`
     - 结果：通过
     - 备注：仅有既有 chunk size warning，不是 blocker
  9. `cd docs/demos && ../../common/temp/node_modules/.pnpm/node_modules/.bin/vite --host 127.0.0.1 --port 3028 --strictPort`
     - 结果：启动成功
     - 备注：3027 端口被现存进程占用，本轮使用 3028 做 fresh 验证
  10. `curl -sI http://127.0.0.1:3028/`
      - 结果：`HTTP/1.1 200 OK`
  11. `rg -n '"inversify"' docs/demos/package.json`
      - 结果：无命中
  12. `rg -n '@visactor/vchart@1\\.3\\.0|@visactor/vrender@0\\.14\\.8|@visactor/vrender-components@0\\.14\\.8|inversify@6\\.0\\.1' docs/package.json docs/demos/package.json common/config/rush/pnpm-lock.yaml`
      - 结果：无命中
- 是否影响 consolidated handoff gate：
  是。当前 consolidated handoff gate 已 fresh 全绿。
- 是否仍能维持 `handoff ready`：
  是。当前可以继续维持 `handoff ready`。

### 2026-04-14 11:26 — Browser smoke 回归 / rect 页面 scene tree 正常但白屏

- 背景：
  用户在真实浏览器中反馈 [rect.ts](/Users/bytedance/Documents/GitHub/VRender2/packages/vrender/__tests__/browser/src/pages/rect.ts) 页面白屏，但 `window.stage`、`renderCount`、`defaultLayer.getChildren()` 看起来都正常。这与 baseline smoke 中的 `rect = open=true / firstFrame=true / errors=0` 结论冲突，因此按真实 blocker 重新排查。
- 结论：
  1. 白屏可以稳定复现。
  2. 不是页面输入或 smoke 误判，而是新的 runtime 接线回归。
  3. 当前工作区中的 [bootstrap.ts](/Users/bytedance/Documents/GitHub/VRender2/packages/vrender/src/entries/bootstrap.ts) 已切到 installer-only app bootstrap，但默认 2D graphics / pickers 仍会受 legacy one-shot `loadXModule/loadXPick` 影响，导致 app registry 只拿到一部分 renderer/picker。
  4. 结果是：
     - `stage` 正常
     - scene tree 正常
     - `drawContribution.getRenderContribution(rect) === null`
     - 画面白屏
  5. 已通过最小 runtime bridge 收口：
     - browser/node app bootstrap 继续走 installer path
     - 追加 legacy env + legacy graphic registrations
     - 将 legacy context 中已有的 renderer/picker 合并回 app registry
  6. 修复后：
     - `rect` 页肉眼可见
     - `debug-rect-stage.cjs` 中 `rect -> DefaultCanvasRectRender`
     - `pixelSample / coarseScan` 不再空白
     - baseline `rect/state` 复验通过
- 与历史问题差异：
  1. 历史问题见 `D3_PRE_HANDOFF_SMOKE_RENDERER_REGRESSION.md`
  2. 历史问题是 app registry 几乎为空、stage 与 legacy renderer 管线完全断层
  3. 这次问题是**部分复发**：app registry 不是空的，但缺失 `rect/circle/image/line/path/polygon/text/richtext/symbol/area` 这批 2D renderer/picker
- 影响文件：
  `packages/vrender/src/entries/bootstrap.ts`
  `packages/vrender/__tests__/unit/entries.test.ts`
  `docs/refactor/state-engine/D3_PRE_HANDOFF_SMOKE_RECT_RUNTIME_BRIDGE_REGRESSION.md`
  `docs/refactor/state-engine/D3_PHASE4_IMPLEMENTATION_LOG.md`
- fresh 验证：
  1. `packages/vrender rushx start`
     - 结果：启动成功
     - 本轮端口：`3015`
  2. `debug-rect-stage.cjs`
     - 修复前：
       - `rect.renderer = null`
       - `pixelSample` 全白
       - `coarseScan = []`
     - 修复后：
       - `rect.renderer = DefaultCanvasRectRender`
       - `pixelSample` 命中真实颜色
       - `coarseScan` 命中多处非白像素
  3. hidden Electron 截图：
     - 修复前：白屏
     - 修复后：rect / symbol / image 可见
  4. `cd packages/vrender && rushx test -- --runInBand __tests__/unit/entries.test.ts --verbose`
     - 结果：通过
     - 汇总：`1 suite / 4 tests`
  5. `cd packages/vrender && rushx test`
     - 结果：通过
     - 汇总：`16 suites / 112 tests`，其中 `2 skipped`
  6. `rush compile -t @visactor/vrender-core`
     - 结果：通过
  7. `D3_SMOKE_BASE_URL=http://127.0.0.1:3015/ D3_SMOKE_OUT=/tmp/vrender-smoke-rect-state.json D3_SMOKE_ROUTES=rect,state common/temp/node_modules/.pnpm/node_modules/.bin/electron packages/vrender/__tests__/browser/scripts/run-smoke-triage.cjs`
     - 结果：通过
     - `rect/state` 均为 `open=true / firstFrame=true / errors=0`
- 是否影响 `handoff ready`：
  否。该回归已在本轮收口，当前不需要撤回 `handoff ready`。

### 2026-04-15 10:07 — Browser page regression / wrap-text LayoutBBox 参数缺失

- 背景：
  用户在 `wrap-text` 测试页观察到运行时错误：
  `CanvasTextLayout.LayoutBBox` 读取 `linesLayout.length` 时抛 `Cannot read properties of undefined`。
- root cause：
  `WrapText.updateMultilineAABBBounds()` 在调用 `CanvasTextLayout.LayoutBBox()` 时漏传了第四个参数 `linesLayout`。
  `Text.updateHorizontalMultilineAABBBounds()` 的同类路径会正确传入 `linesLayout`，因此这不是布局层接口变化，而是 `WrapText` 调用方漏参。
- 修复方式：
  1. 在 `packages/vrender-core/src/graphic/wrap-text.ts` 中，将
     `layoutObj.LayoutBBox(bbox, textAlign, textBaseline as any)`
     改为
     `layoutObj.LayoutBBox(bbox, textAlign, textBaseline as any, linesLayout)`
  2. 新增最小回归测试，固定“WrapText 必须把 `linesLayout` 传给 `LayoutBBox`”
- 影响文件：
  `packages/vrender-core/src/graphic/wrap-text.ts`
  `packages/vrender-core/__tests__/unit/graphic/wrap-text.test.ts`
  `docs/refactor/state-engine/D3_PHASE4_IMPLEMENTATION_LOG.md`
- fresh 验证：
  1. `cd packages/vrender-core && rushx test -- --runInBand __tests__/unit/graphic/wrap-text.test.ts --verbose`
     - 结果：通过
     - 汇总：`1 suite / 1 test`
  2. `rush compile -t @visactor/vrender-core`
     - 结果：通过
  3. `D3_SMOKE_BASE_URL=http://127.0.0.1:3013/ D3_SMOKE_OUT=/tmp/vrender-wrap-text.json D3_SMOKE_ROUTES=wrap-text common/temp/node_modules/.pnpm/node_modules/.bin/electron packages/vrender/__tests__/browser/scripts/run-smoke-triage.cjs`
     - 结果：通过
     - `wrap-text = open=true / firstFrame=true / errors=0`
- 是否影响 `handoff ready`：
  否。该问题已收口，且不改变当前 handoff 结论。

### 2026-04-15 10:24 — Browser page regression / wrap-text ascent-descent 缺失导致页面仍近似空白

- 背景：
  在修复 `LayoutBBox(..., linesLayout)` 漏参后，`wrap-text` 页不再报错，但用户继续反馈“页面没有任何渲染内容”。fresh 截图确认：右侧区域几乎空白，只剩极少内容或完全不可见，说明还存在第二层 root cause。
- root cause：
  `WrapText.updateMultilineAABBBounds()` 自己构造 `linesLayout` 时，把每行的 `ascent/descent` 填成了 `0`。
  这会导致：
  1. `alphabetic` baseline 在 `LayoutBBox()` 中走单行分支时，按 `ascent / (ascent + descent)` 计算百分比，得到 `0 / 0 -> NaN`
  2. 对应文本的 `yOffset / AABBBounds` 变成异常值
  3. renderer 虽然能选中 `DefaultCanvasTextRender`，但文本位置错误，肉眼看起来仍接近空白
- 修复方式：
  1. 在 `packages/vrender-core/src/graphic/wrap-text.ts` 中，为 `linesLayout` 的每个条目补真实的 `measureTextPixelADscentAndWidth(...)` 结果
  2. 覆盖：
     - `maxLineWidth > 0` 的裁剪分支
     - 最后一行 `clipTextWithSuffix(...)` 分支
     - 无宽度限制分支
  3. 不修改 `CanvasTextLayout` 算法本身，只修正 `WrapText` 调用方传入的布局数据
- 影响文件：
  `packages/vrender-core/src/graphic/wrap-text.ts`
  `packages/vrender-core/__tests__/unit/graphic/wrap-text.test.ts`
  `docs/refactor/state-engine/D3_PHASE4_IMPLEMENTATION_LOG.md`
- fresh 验证：
  1. `cd packages/vrender-core && rushx test -- --runInBand __tests__/unit/graphic/wrap-text.test.ts --verbose`
     - 结果：通过
     - 汇总：`1 suite / 2 tests`
  2. `D3_SMOKE_BASE_URL=http://127.0.0.1:3013/ D3_SMOKE_ROUTE=wrap-text common/temp/node_modules/.pnpm/node_modules/.bin/electron packages/vrender/__tests__/browser/scripts/debug-rect-stage.cjs`
     - 结果：通过
     - 现象：
       - `renderContribution(text) = DefaultCanvasTextRender`
       - 第二个文本 `AABBBounds.y1/y2` 已恢复为有限值
  3. hidden Electron fresh 截图：
     - 页面已恢复可见文本内容，不再是完全空白
- 是否影响 `handoff ready`：
  否。该问题已收口，不改变当前 handoff 结论。

### 2026-04-15 10:36 — Browser page regression / wrap-text 首屏近乎空白的页面输入收口

- 背景：
  在修复 `WrapText` 的 `linesLayout` 传参和 `ascent/descent` 数据后，`wrap-text` 页已不再报错，但 fresh 截图仍只剩极少内容。继续追查运行时快照后发现，问题已不在 renderer 或布局层 crash，而在页面输入本身。
- root cause：
  `packages/vrender/__tests__/browser/src/pages/wrap-text.ts` 中第一个示例文本的初始配置是：
  - `maxLineWidth: 0`
  - 然后执行 `animate().to({ maxLineWidth: 300 }, 30000, 'linear')`
  结果是在页面初始 1~2 秒内：
  - `maxLineWidth` 只从 `0` 增长到十几像素
  - 对长文本来说仍不足以显示出任何实际字符
  - 因而页面视觉上仍近似空白
  这不是 core/runtime 回归，而是 demo 输入与“首屏应可见”目标冲突。
- 修复方式：
  1. 仅调整 `wrap-text` 页面第一个示例的初始 `maxLineWidth`
  2. 从 `0` 调整为 `80`
  3. 保留它继续动画到 `300`
  4. 不改其它示例，不改布局算法，不改 smoke baseline 定义
- 影响文件：
  `packages/vrender/__tests__/browser/src/pages/wrap-text.ts`
  `docs/refactor/state-engine/D3_PHASE4_IMPLEMENTATION_LOG.md`
- fresh 验证：
  1. wrap-text 运行时检查：
     - 第一个文本当前 `maxLineWidth ≈ 89.6`
     - `cache.layoutData.lines` 已有多行
     - `bbox.x2 > bbox.x1`、`bbox.y2 > bbox.y1`
  2. fresh hidden Electron 截图：
     - 页面已能看到首个 wrap-text 示例和第二个 `这是abc` 示例
  3. `D3_SMOKE_BASE_URL=http://127.0.0.1:3013/ D3_SMOKE_OUT=/tmp/vrender-wrap-text.json D3_SMOKE_ROUTES=wrap-text common/temp/node_modules/.pnpm/node_modules/.bin/electron packages/vrender/__tests__/browser/scripts/run-smoke-triage.cjs`
     - 结果：`open=true / firstFrame=true / errors=0`
- 是否影响 `handoff ready`：
  否。该页面已恢复到“首屏有可见内容”，不影响当前 handoff 结论。

### 2026-04-16 12:28 — Memory benchmark 性能差距归因留档

- 背景：
  在 `memory.ts` 已改成“页面级单例 app、run 内只重建 stage”之后，用户继续对比当前分支与 `develop` 的 trace，确认性能差距仍明显存在，希望将当前归因结论沉淀为后续专项优化上下文。
- 结论：
  1. 当前分支的剩余差距已经不再主要来自 app/stage 重建策略。
  2. 主因收敛到：D3 重构后单个 `Graphic` 的固定构造成本更高，在 `100 * 10000` 级别的极端构造 benchmark 下被放大。
  3. 这不直接推翻当前 handoff 结论，但应进入后续性能专项。
- 关键证据：
  1. 当前分支 trace：
     - `/Users/bytedance/Downloads/Trace-20260416T121405.json`
     - 最大主线程长任务约 `795.9ms`
     - 热点仍直接落在 `memory.ts`
  2. `develop` trace：
     - `/Users/bytedance/Downloads/Trace-20260416T120626.json`
     - 最大主线程长任务约 `348.9ms`
     - 热点同样落在 `memory.ts`
  3. GC 压力差异：
     - 当前分支 `V8.GC_MC_BACKGROUND_MARKING` 单次约 `60~61ms`
     - `develop` 约 `9~10ms`
  4. 静态代码差异：
     - `develop` 的 `Graphic` 构造核心是 `this.attribute = params`
     - 当前分支额外引入：
       - `cloneAttributeValue(params)`
       - `baseAttributes`
       - `stateStyleResolver`
       - `deepStateStyleResolver`
       - `stateTransitionOrchestrator`
- 影响文件：
  `docs/refactor/state-engine/D3_MEMORY_BENCHMARK_PERF_CONTEXT.md`
  `docs/refactor/state-engine/D3_FOLLOWUPS.md`
  `docs/refactor/state-engine/README.md`
  `docs/refactor/state-engine/D3_ARCHIVE_INDEX.md`
  `docs/refactor/state-engine/D3_PHASE4_IMPLEMENTATION_LOG.md`
- 是否影响当前 handoff 结论：
  否。当前仅作为后续专项优化上下文留档，不回滚 `handoff ready`。

### 2026-04-16 15:40 — Memory benchmark P0 启动 / 问题定界与 cleanup plan

- 背景：
  本轮接手的是 D3 性能专项，不是 smoke 回归，也不是新架构设计。用户已经明确拍板：`memory.ts` 的剩余差距主因是 `Graphic` 的 per-instance 固定构造成本增大，本轮只允许做构造期固定成本与状态相关对象初始化成本优化，不回滚 D3 主架构，不改 renderer / raf / deferred 主链。
- problem framing：
  1. `memory.ts` 现在测的是一个极端同步构造压力场景：点击 `run 100 / 1000 / 10000` 后，会循环执行 `run()`，而每次 `run()` 都先同步创建 `10000` 个 `rect`，再创建 stage 并把这些图元挂到默认 layer。
  2. 它更像一个 per-graphic fixed cost benchmark，而不是常规渲染 benchmark。原因是页面已经改成“单例 app、run 内只重建 stage”，剩余热点仍然落在 `memory.ts` 的同步对象创建区间；在 `100 * 10000` 甚至 `1000 * 10000` 的量级下，每个 `Graphic` 多一次 clone、多一份 `baseAttributes`、多几个状态 helper，都会被线性放大成明显的主线程时长和 GC 压力。
  3. 因此这轮优化目标应限制在构造期固定成本，而不是扩散到 render 热路径。当前 benchmark 的信号是“对象构造太重”，不是“render/pick/bounds/deferred 主链错误”；如果在没有 fresh 证据前把优化扩到 render 热路径，就会把专项问题重新放大成不必要的结构级风险。
- cleanup plan：
  1. 先做 fresh baseline measurement，确保本轮对比口径来自当前分支实测，而不是复述旧 trace。
  2. 只做 `P0.1 + P0.2`：
     - 把 `stateStyleResolver / deepStateStyleResolver / stateTransitionOrchestrator` 从构造期 eager 初始化改为按需创建。
     - 收紧 `attribute/baseAttributes` 的构造期双份深拷贝，优先走“一次 clone + 延迟分离 / simple attrs 快路径”，但不改变 `baseAttributes + resolvedStatePatch -> attribute` 语义。
  3. 在写实现前先补最小回归测试，证明无状态路径与第一次真实使用 state/transition 时的 lazy init 语义成立。
  4. 实现后重新跑 `memory.ts` measurement、`rush compile -t @visactor/vrender-core`、`packages/vrender-core && rushx test`，再决定是否有资格建议进入 `P1`。
- 是否与设计有差异：
  否。本条只是在既有 D3 结论上收紧执行边界，不重开 Phase 1-4 设计。
- 影响文件：
  `docs/refactor/state-engine/D3_PHASE4_IMPLEMENTATION_LOG.md`
- 验证：
  尚未开始代码实现；baseline measurement 与 test-first 还在进行中。
- 是否影响当前 handoff 结论：
  否。这是一个 P0 级性能专项执行入口，不影响既有 handoff 结论。

### 2026-04-16 16:10 — Memory benchmark P0 / Graphic 构造固定成本收口

- 背景：
  本轮只允许做 `P0.1 + P0.2`：压缩 `Graphic` 构造期固定成本，并把状态相关 helper 从 eager 初始化改成按需创建。目标是改善 `memory.ts` 这种 `run 100 / run 1000` 的极端构造压力页，不回滚 D3 主架构，也不改 render / raf / deferred 主链。
- root cause 假设与实际确认：
  1. `memory.ts` 的热点仍然是同步 `Graphic` 构造，不是 app/stage 重建。
  2. 当前构造路径的主要固定成本来自两部分：
     - `attribute/baseAttributes` 在构造期做了两次递归 clone
     - `stateStyleResolver / deepStateStyleResolver / stateTransitionOrchestrator` 对每个实例都 eager 分配
  3. 代码与 fresh measurement 一致表明：先收这两处，`run 100` 就已经能看到构造时间和堆分配下降；`run 1000` 也从 baseline 的 renderer OOM 变成可以完整跑完。
- 实现/结论：
  1. `Graphic` 构造期不再做第二次递归 clone：
     - `baseAttributes` 继续保持一次深 clone 的静态真值
     - `attribute` 改为基于 `baseAttributes` 的更轻量实例视图复制，避免第二次全量递归 clone
     - 这个实现是保守版 `P0.2`，没有共享同一个顶层对象；这样保住了 repo 里现有大量 `graphic.attribute.xxx = ...` 顶层赋值语义，不会把 transient/animation 写回 base truth
  2. `stateStyleResolver / deepStateStyleResolver / stateTransitionOrchestrator` 已改为 lazy init：
     - 只有真正命中 resolver fallback、deep merge 或 animated state transition 时才创建
     - 无状态、无动画、纯基础图形构造路径不再承担这三份实例成本
  3. 没有修改 `baseAttributes + resolvedStatePatch -> attribute` 语义，也没有进入 `P1/P2`。
- 是否与设计有差异：
  否。本轮严格停留在 `P0`：
  1. 没有回滚 D3 主架构
  2. 没有改 shared-state / deferred 主链
  3. 没有进入 `stateTransitionOrchestrator` 共享实例或更深层 truth 表示优化
- 影响文件：
  `packages/vrender-core/src/graphic/graphic.ts`
  `packages/vrender-core/__tests__/unit/graphic/attribute-clone.test.ts`
  `packages/vrender-core/__tests__/unit/graphic/state-helper-lazy-init.test.ts`
  `packages/vrender/__tests__/browser/scripts/measure-memory-benchmark.cjs`
  `docs/refactor/state-engine/D3_PHASE4_IMPLEMENTATION_LOG.md`
- baseline measurement：
  1. `run 100` baseline（no-trace）：
     - 总耗时：`1133.4ms`
     - 构造阶段总耗时：`414.4ms`
     - stage create 总耗时：`147.8ms`
     - add 阶段总耗时：`544.7ms`
     - heap delta：`562.6MB`
  2. `run 100` baseline（trace）：
     - 最大主线程 `RunTask`：`1102.3ms`
     - `V8.GC_MC_BACKGROUND_MARKING`：`45` 次，合计 `2852.8ms`，单次最大 `224.3ms`
     - `MinorGC`：`236` 次，合计 `218.7ms`
     - `MajorGC`：`3` 次，合计 `153.6ms`
  3. `run 1000` baseline（no-trace）：
     - hidden Electron renderer 在约 `29.5s` 时 OOM，日志显示堆占用约 `4.07GB`
     - 因此 baseline 没有得到完整总耗时；该 workload 在 baseline 口径下无法完成
- after measurement：
  1. `run 100` after（no-trace）：
     - 总耗时：`1031.0ms`
     - 构造阶段总耗时：`365.5ms`
     - stage create 总耗时：`141.6ms`
     - add 阶段总耗时：`514.2ms`
     - heap delta：`474.5MB`
  2. `run 100` after（trace）：
     - 最大主线程 `RunTask`：`1038.1ms`
     - `V8.GC_MC_BACKGROUND_MARKING`：`43` 次，合计 `2015.3ms`，单次最大 `124.6ms`
     - `MinorGC`：`166` 次，合计 `289.4ms`
     - `MajorGC`：`3` 次，合计 `139.1ms`
  3. `run 1000` after（no-trace）：
     - 总耗时：`19166.5ms`
     - 构造阶段总耗时：`7624.7ms`
     - stage create 总耗时：`206.3ms`
     - add 阶段总耗时：`11132.5ms`
     - heap delta：`4239.2MB`
     - `longtask` 观察：`1` 次，时长约 `1596ms`
  4. `run 1000` after（trace）：
     - trace-enabled 口径仍会把 workload 放大到 renderer OOM，无法形成可信 GC 对比
     - 因此 `run 1000` 当前只保留 no-trace 总耗时对比
- before / after 结论：
  1. `run 100` 总耗时下降约 `102.4ms`（`1133.4 -> 1031.0ms`）
  2. `run 100` 构造阶段下降约 `48.9ms`（`414.4 -> 365.5ms`）
  3. `run 100` heap delta 下降约 `88.2MB`（`562.6 -> 474.5MB`）
  4. `run 100` trace 中 background marking 总时间下降约 `837.6ms`（`2852.8 -> 2015.3ms`），单次最大也明显下降（`224.3 -> 124.6ms`）
  5. `run 1000` 从 baseline 无法完成，提升到 after 可完整跑完；这说明 `P0` 已经足够改变极端 workload 的可完成性
- 验证：
  1. test-first 新增回归：
     - `attribute-clone.test.ts`
     - `state-helper-lazy-init.test.ts`
     已先红后绿
  2. 定向状态/动画回归通过：
     - `graphic-state.test.ts`
     - `state-animation.test.ts`
     - `normal-attrs.test.ts`
     - `state-resolution.test.ts`
     - 新增的 `attribute-clone/state-helper-lazy-init`
     汇总：`6 suites / 60 tests`
  3. `rush compile -t @visactor/vrender-core` 通过
  4. `packages/vrender-core` 全量 `rushx test` 已执行，但当前工作区里存在无关的 wrap-text 变更与新增测试：
     - `packages/vrender-core/src/graphic/wrap-text.ts` 已被修改
     - `packages/vrender-core/__tests__/unit/graphic/wrap-text.test.ts` 为未跟踪文件
     - 全量测试唯一失败即该未跟踪 wrap-text 测试缺少 `graphicService.validCheck` stub，不属于本轮 P0 修改面
- 是否只停留在 `P0`：
  是。本轮没有进入 `P1`。
- 是否建议进入 `P1`：
  暂不自动进入。原因是：
  1. `P0` 已经带来了明确收益，尤其是 `run 1000` 从 OOM 变成可完成
  2. 但还没有在 trace-enabled `run 1000` 口径下拿到稳定 GC 对比
  3. 因此更合理的结论是：先让架构师 review 本轮 `P0`，确认收益和风险边界，再决定是否继续推进 `P1`

### 2026-04-16 16:35 — Memory benchmark P0 / review 结论收口

- 背景：
  架构侧已基于 fresh verification 复核本轮 `P0`，需要把 review 结论同步为当前事实，避免 implementation log 仍停留在“等待 review 后再决定”的状态。
- review 结论：
  1. 本轮 `P0` 可以接受。
  2. 当前证据不足以直接进入 `P1`，应继续停留在 `P0`。
  3. `memory.ts` 仍应被视为 per-graphic fixed cost benchmark，而不是 renderer / raf / deferred 主链回归。
  4. `stateStyleResolver / deepStateStyleResolver / stateTransitionOrchestrator` 的 lazy init 结论成立，且有定向测试覆盖。
  5. `attribute/baseAttributes` 当前可以确认的契约是：
     - 构造期已从“双份递归 clone”收紧为“一次 deep clone + 轻量 attribute surface clone”
     - 现有顶层 `graphic.attribute.xxx = ...` 兼容成立
     - 不外推成“任意深层嵌套对象原地修改都绝对隔离”的更强契约
- fresh verification 更新：
  1. `rush compile -t @visactor/vrender-core`：通过
  2. 定向状态/动画/normalAttrs 回归：`6 suites / 60 tests` 通过
  3. `packages/vrender-core rushx test`：
     - 当前仍被 dirty worktree 中无关的 `__tests__/unit/graphic/wrap-text.test.ts` 拦住
     - 该失败是 `graphicService.validCheck` stub 缺失，不属于本轮 `P0` 直接改动面
  4. `memory.ts run 100 no-trace`：
     - fresh 复核方向与本轮留档一致，可接受
  5. `memory.ts run 1000 no-trace`：
     - review 侧这轮未独立复现出“after 可完整跑完”
     - 当前环境存在 benchmark/Electron 进程与 dirty worktree 干扰，因此这条证据暂按“待在更干净环境下复测”处理，不作为进入 `P1` 的依据
- 是否影响当前结论：
  1. 不影响 `P0 accepted`
  2. 影响 `P1` 决策：当前明确不进入 `P1`
- 剩余动作/后续项：
  1. 清理 benchmark 运行环境后，重新获取一轮更干净的 `run 1000 no-trace`，条件允许时再尝试 trace 口径
  2. 在新的 `run 1000` fresh 证据出来前，不扩大到 `P1`

### 2026-04-16 16:45 — Memory benchmark P0 / measurement gate 收口

- 背景：
  在 review 结论已经确认“当前停留在 `P0`、不进入 `P1`”后，用户进一步明确了本轮性能对比口径：认可继续按当前计划推进，但性能结果对比可以只使用 `run 100`，不再要求 `run 1000` 作为这轮优化有效性的前置证明。
- 结论：
  1. `run 100` 现已作为本轮 `P0` 的官方性能对比口径。
  2. `run 1000` 不再作为这轮汇报、留档或继续判断 `P0` 是否有效的必选项。
  3. `run 1000` 如后续仍要跑，只作为补充观察项，不影响当前 `P0 accepted / 不进入 P1` 的结论。
- 对当前结论的影响：
  1. 不改变本轮 `P0 accepted`
  2. 不改变“当前不进入 `P1`”
  3. 进一步收紧 measurement gate，避免被 `run 1000` 的环境噪音继续阻塞本轮收口
- 后续项：
  1. 如需补测，优先保持 `run 100` 的同口径可复跑性
  2. `run 1000` 仅作为可选补充，不再作为本轮 gate

### 2026-04-16 17:05 — Memory benchmark P0 / accepted 边界正式收口

- 背景：
  在 `P0 accepted`、`当前不进入 P1` 已经拍板后，还需要把这轮的正式表述边界、measurement gate 和 `P1` 前置条件写成后续维护者可直接复用的固定结论，避免继续从多条过程记录里拼口径。
- 正式结论：
  1. 当前状态维持为 `P0 accepted`。
  2. 当前不进入 `P1`。
  3. 本轮只做了构造期固定成本优化，没有进入 renderer / raf / deferred 主链，也没有进入 shared-state 主链或更深层 truth-model 优化。
- 当前实现边界：
  1. `stateStyleResolver / deepStateStyleResolver / stateTransitionOrchestrator` 已改为按需创建。
  2. `attribute/baseAttributes` 当前实现固定为：
     - `baseAttributes` 保留一次 deep clone
     - `attribute` 使用轻量 surface clone
  3. 当前只承诺：
     - 顶层 `graphic.attribute.xxx = ...` 兼容成立
  4. 当前不承诺：
     - 任意深层嵌套对象原地 mutation 完全隔离
- 当前 measurement gate：
  1. `run 100` no-trace：官方 gate
  2. `run 100` trace：补充证据
  3. `run 1000`：补充观察项，不作为当前进入 `P1` 的正式门槛
- 为什么当前不进入 `P1`：
  1. 这轮 `P0` 已被接受，不需要继续靠扩大优化范围来证明自己
  2. 当前 measurement gate 已正式收紧为 `run 100`，因此没有理由把 `run 1000` 重新升级为新的必选门槛
  3. 当前还缺足够 clean 的下一轮前置条件，尤其是：
     - 无关 dirty worktree 测试不再污染判断
     - `run 100` gate 持续稳定
     - 当前 accepted 表述不需要继续改代码才能成立
- 下一步最小前置条件：
  1. 保持当前 `P0 accepted` 表述与实现持续一致
  2. 维持 `run 100` 官方 gate 的可复跑性
  3. 清理无关 dirty worktree blocker 后，再单独拍板是否需要新的 `P1`
- 是否与设计有差异：
  否。本条只把已经拍板的 `P0 accepted / 不进入 P1` 转写为正式维护口径，不引入新的实现方向。

### 2026-04-16 18:06 — Browser page fix / interactive-test case switching release recursion

- 背景：
  用户在 `interactive-test` 页面先点击“渲染circle”，再点击“渲染rect”时，命中
  `Maximum call stack size exceeded`。栈指向 `Stage._stopAnimates -> stage.release(app-stage.ts) -> app.release -> stage.release(app-stage.ts)`，
  说明问题发生在交互页的 stage/app 清理链，而不是 `circle` 或 `rect` 图元创建本身。
- root cause：
  1. `packages/vrender/__tests__/browser/src/app-stage.ts` 之前的 helper 在 `stage.release()` 包装里先执行原始 `stage.release()`，再执行 `app.release()`。
  2. `AppContext.release()` 会再次释放它追踪的 stage 资源，因此旧 helper 会把 stage release 和 app release 串成递归路径。
  3. 同时，旧 stage 释放后会把 `#main` canvas 从 DOM 中带走；交互页下一次 case 切换如果不补回 canvas，会留下“没有主画布可复用”的半失效状态。
- 修复方式：
  1. `packages/vrender/__tests__/browser/src/app-stage.ts`
     - 把 stage 包装释放改成“恢复原始 `stage.release` 后，仅委托 `app.release()` 执行一次完整清理”，不再手动串联双重 release。
  2. `packages/vrender/__tests__/browser/src/interactive/utils.ts`
     - 在每次切换 case 前调用 `ensureMainCanvas(container)`，保证旧 stage 释放移除画布后，新的 case 仍能拿到 `#main` canvas。
  3. 删除不可靠的 mock 回归测试：
     - `packages/vrender/__tests__/unit/index.test.ts` 中新增的 helper 释放测试无法稳定模拟真实 app/stage 清理链，已移除，避免继续制造包测试红灯。
- 影响文件：
  1. `packages/vrender/__tests__/browser/src/app-stage.ts`
  2. `packages/vrender/__tests__/browser/src/interactive/utils.ts`
  3. `packages/vrender/__tests__/unit/index.test.ts`
- 验证：
  1. `cd packages/vrender && rushx test`
     - 结果：`16/16 suites`，`110 passed`，`2 skipped`
  2. 真实浏览器脚本复验（Electron hidden window）：
     - 路径：`interactive-test`
     - 依次点击：“渲染circle” -> “渲染rect”
     - 结果：
       - `clickedCircle = true`
       - `clickedRect = true`
       - `pageError = null`
       - `errors = []`
       - `rejections = []`
       - 第二次点击后 `hasMainCanvas = true`、`canvasCount = 1`
- 是否影响 handoff：
  否。该问题属于 browser test page 的交互切换回归，本轮已收口，不改变既有 handoff 结论。

### 2026-04-16 18:24 — App-scoped lifecycle / stage release should unregister from app tracking

- 背景：
  在修 `interactive-test` 的切换崩溃时，进一步确认了 `AppContext` 当前只在 `createStage()` 时把 stage 加入 `stageResources`，但单个 `stage.release()` 后不会把它从集合里删除。
  这意味着“单 app，多 stage，app 常驻、stage 反复 release/recreate”的场景里，已释放 stage 仍会被 `AppContext` 强引用，存在长期滞留风险。
- 设计选择：
  不新增要求上层手动“从 app 删除 stage”的 API。生命周期应由 `stage.release()` 自己闭环完成 unregister。
  原因：
  1. 上层额外再调一个 `app.removeStage()` 很容易漏调，生命周期变成两段式，错误概率更高。
  2. `stage.release()` 已经是资源销毁语义，最合理的正式约束就是在这里同步完成 app 内部 tracking 清理。
- 修复方式：
  1. `packages/vrender-core/src/entries/app-context.ts`
     - 在 `createStage()` 中包一层 release。
     - 首次 `stage.release()` 时先把 stage 从 `stageResources` 删除，再执行原始 release。
     - 保证后续 `app.release()` 不会再次持有/释放这个已销毁 stage。
  2. `packages/vrender-core/__tests__/unit/entries/app-context.test.ts`
     - 补回归测试：两个 stage 中一个提前 release 后，再 `context.release()`，应只释放另一个，且已释放 stage 不会再次进入 app 追踪释放链。
  3. 额外修正既有测试环境 stub：
     - `packages/vrender-core/__tests__/unit/graphic/wrap-text.test.ts`
     - 为 `graphicService` 补齐 `validCheck / beforeUpdateAABBBounds / afterUpdateAABBBounds / updateTempAABBBounds / combindShadowAABBBounds / updateHTMLTextAABBBounds` mock，恢复 core 全量测试绿态。
- 影响文件：
  1. `packages/vrender-core/src/entries/app-context.ts`
  2. `packages/vrender-core/__tests__/unit/entries/app-context.test.ts`
  3. `packages/vrender-core/__tests__/unit/graphic/wrap-text.test.ts`
- 验证：
  1. `cd packages/vrender-core && rushx test -- --runInBand __tests__/unit/entries/app-context.test.ts --verbose`
     - 结果：`5/5 tests`
  2. `rush compile -t @visactor/vrender-core`
     - 结果：通过
  3. `cd packages/vrender-core && rushx test`
     - 结果：`99/99 suites`，`532/532 tests`
- 是否影响 handoff：
  否。本条是 app-scoped 生命周期正式补洞和测试回绿，不改变既有 handoff 结论。

### 2026-04-16 19:05 — Memory benchmark maintenance gate / `P1` 准入条件检查

- 背景：
  当前 `P0 accepted / 不进入 P1` 已经拍板。这一轮不是继续做性能实现，而是判断是否已经满足“可以申请开启 `P1`”的 5 条准入条件。
- 无关 blocker 清理/隔离结果：
  1. `packages/vrender-core/__tests__/unit/graphic/wrap-text.test.ts` 当前仍是 **untracked** dirty artifact，不是 tracked repo baseline 的一部分。
  2. `packages/vrender-core/src/graphic/wrap-text.ts` 也存在独立 dirty worktree 变更，且不属于当前 memory 专项实现面。
  3. 因此本轮将这两项**正式隔离**出 memory 专项判断面：
     - 当前 memory / `P1` 准入判断只基于：
       - `rush compile -t @visactor/vrender-core`
       - memory 专项相关 6 组定向测试
       - `run 100` 官方 gate
     - 这两项 wrap-text 脏变更不再继续污染“是否可申请开启 `P1`”的专项判断
  4. 但它们仍然是 worktree 噪音；在真正启动 `P1` 实现前，仍建议清理到更干净的判断环境。
- fresh 验证：
  1. `rush compile -t @visactor/vrender-core`：通过
  2. 定向 6 组测试：
     - `attribute-clone.test.ts`
     - `state-helper-lazy-init.test.ts`
     - `graphic-state.test.ts`
     - `state-animation.test.ts`
     - `normal-attrs.test.ts`
     - `state-resolution.test.ts`
     汇总：`6 suites / 60 tests` 通过
- `run 100` no-trace 连续 3 次：
  1. 第 1 次：
     - 总耗时：`1050.9ms`
     - 构造阶段：`374.5ms`
     - heap delta：`474.45MB`
  2. 第 2 次：
     - 总耗时：`1021.0ms`
     - 构造阶段：`364.0ms`
     - heap delta：`474.63MB`
  3. 第 3 次：
     - 总耗时：`1004.8ms`
     - 构造阶段：`360.7ms`
     - heap delta：`474.49MB`
  4. 稳定性判断：
     - 总耗时 spread：`46.1ms`，约占均值 `4.5%`
     - 构造阶段 spread：`13.8ms`，约占均值 `3.8%`
     - heap delta spread：`0.17MB`，约占均值 `0.04%`
     - 当前可视为稳定、可复跑
- `run 100` trace fresh 结果：
  1. 总耗时：`1046.6ms`
  2. 构造阶段：`372.3ms`
  3. heap delta：`474.52MB`
  4. 主线程长任务：
     - `RunTask.max = 1047.3ms`
     - `longTask.count = 1`
  5. 主要 GC 指标：
     - `backgroundMarking.total = 1614.1ms`
     - `backgroundMarking.max = 122.6ms`
     - `minorGc.total = 212.5ms`
     - `majorGc.total = 135.6ms`
  6. 与当前 accepted 的 `run 100` trace 口径相比，没有看到反向恶化信号：
     - background marking 总量和单次最大值都未恶化
     - 主线程最大长任务与当前 accepted 水平同量级，没有出现新的放大量级
- `P1` 单目标候选：
  1. 目标：
     - 为 `Graphic` 构造路径补一个“simple attrs fast path”，进一步压缩 flat/simple attrs 的 clone 成本
  2. 允许改动文件：
     - `packages/vrender-core/src/graphic/graphic.ts`
     - `packages/vrender-core/__tests__/unit/graphic/attribute-clone.test.ts`
     - 如需要，新增一条同目录下的最小构造性能/语义回归测试
  3. 预期收益：
     - 进一步降低 `run 100` 的构造阶段总耗时与 heap delta
     - 优先服务 `memory.ts` 这类大批简单图元构造场景
  4. 有效性指标：
     - `run 100` no-trace：
       - 总耗时
       - 构造阶段耗时
       - heap delta
     - `run 100` trace：
       - 主线程最大长任务
       - background marking / 主要 GC 指标
     - 定向 6 组测试继续全绿
  5. stop-and-feedback 条件：
     - 若必须触碰 renderer / raf / deferred / shared-state 主链，立即停止
     - 若必须扩大契约到“深层 mutation 完全隔离”，立即停止
     - 若 `run 100` 指标没有可见改善，或任何定向回归转红，立即停止
- 当前是否满足 `P1` 准入条件：
  1. `P0 accepted` 表述仍与实现一致：满足
  2. `run 100` no-trace 连续 3 次 fresh 且稳定：满足
  3. `run 100` trace 已 fresh 跑过且没有反向恶化信号：满足
  4. 无关 blocker 已正式隔离出判断面：满足
  5. 已提出单目标、可测量、低风险的 `P1` 候选：满足
- 结论：
  当前**可以申请开启 `P1`**，但本轮不进入实现。

### 2026-04-16 19:35 — Memory benchmark P1 / simple attrs fast path

- 背景：
  当前 `P1` 已获准开启，但边界被收紧为单目标任务：只给 `Graphic` 构造路径补一个 `simple attrs fast path`。本轮不允许触碰 renderer / raf / deferred / shared-state 主链，也不允许扩大当前契约边界。
- simple attrs 判定规则：
  1. 仅当输入 attrs 是普通对象，且所有**顶层**自有值都不是 plain object 时，才视为 simple attrs。
  2. 允许走 fast path 的值类型：
     - `null / undefined`
     - primitive
     - function
     - array
     - 其它非 plain object leaf value
  3. 只要任一顶层值是 plain object，就立即回退到当前保守路径。
  4. 这个规则保持简单、稳定、可测；不做更复杂 heuristics。
- 实际改动：
  1. `packages/vrender-core/src/graphic/graphic.ts`
     - 新增 `shouldUseSimpleAttributeFastPath()`
     - 新增 `cloneSimpleAttributeRecord()`
     - 构造函数在 simple attrs 场景下，改为两次浅复制，而不再走递归 clone + surface clone
  2. `packages/vrender-core/__tests__/unit/graphic/attribute-clone.test.ts`
     - 新增 simple attrs 规则测试
     - 新增 non-simple attrs 仍走保守路径的测试
- 是否仍保持当前契约边界：
  是。
  1. 仍只承诺顶层 `graphic.attribute.xxx = ...` 兼容成立
  2. 仍不承诺任意深层嵌套对象原地 mutation 完全隔离
  3. 没有改 `state-style-resolver.ts`、`state-transition-orchestrator.ts`，也没有触碰 renderer / raf / deferred / shared-state 主链
- before / after 数据：
  1. `run 100` no-trace：
     - before（当前 `P0 accepted` fresh 3 次均值）：
       - 总耗时：`1025.6ms`
       - 构造阶段：`366.4ms`
       - heap delta：`452.54MB`
     - after（本轮 `P1` fresh 3 次均值）：
       - 总耗时：`932.1ms`
       - 构造阶段：`289.8ms`
       - heap delta：`421.75MB`
     - 变化：
       - 总耗时：`-93.4ms`，约 `-9.1%`
       - 构造阶段：`-76.6ms`，约 `-20.9%`
       - heap delta：`-30.8MB`，约 `-6.8%`
  2. `run 100` trace：
     - before：
       - 总耗时：`1046.6ms`
       - 构造阶段：`372.3ms`
       - heap delta：`452.54MB`
       - `RunTask.max = 1047.3ms`
       - `backgroundMarking.total = 1614.1ms`
       - `backgroundMarking.max = 122.6ms`
       - `minorGc.total = 212.5ms`
       - `majorGc.total = 135.6ms`
     - after：
       - 总耗时：`976.9ms`
       - 构造阶段：`292.8ms`
       - heap delta：`420.51MB`
       - `RunTask.max = 977.9ms`
       - `backgroundMarking.total = 1312.9ms`
       - `backgroundMarking.max = 107.3ms`
       - `minorGc.total = 255.6ms`
       - `majorGc.total = 128.0ms`
     - 判断：
       - 主线程最大长任务与 background marking 继续下降，没有看到主导指标上的反向恶化
       - `minorGc.total` 有小幅上升，但不足以抵消主导指标与总耗时/构造阶段的改善，当前按“无反向恶化信号”处理
- 定向验证：
  1. `rush compile -t @visactor/vrender-core`：通过
  2. 定向 6 组测试：
     - `attribute-clone.test.ts`
     - `state-helper-lazy-init.test.ts`
     - `graphic-state.test.ts`
     - `state-animation.test.ts`
     - `normal-attrs.test.ts`
     - `state-resolution.test.ts`
     汇总：`6 suites / 62 tests` 通过
  3. changed-file lint：
     - `packages/vrender-core/src/graphic/graphic.ts`
     - `packages/vrender-core/__tests__/unit/graphic/attribute-clone.test.ts`
     通过
- 是否满足本轮 `P1` 目标：
  是。
  1. `run 100` no-trace 相比当前 `P0 accepted` 基线有可见改善
  2. `run 100` trace 没有看到主导指标上的反向恶化
  3. 定向测试继续全绿
  4. 契约边界没有扩大
  5. 没有触碰禁止改动的主链

### 2026-04-17 10:18 — Memory benchmark / P1 accepted 维护口径同步

- 背景：
  `P1` 已在架构复核中被接受，但 `D3_MEMORY_BENCHMARK_PERF_CONTEXT.md` 的当前状态仍停留在 `P0 accepted / 当前不进入 P1`，会让后续维护者误读为 `simple attrs fast path` 仍处于待验收状态。
- 结论：
  1. 已将 memory benchmark 的正式维护口径同步为：
     - `P1 accepted`
     - 当前不进入 `P2`
  2. 当前官方 measurement gate 继续保持：
     - `run 100` no-trace：官方 gate
     - `run 100` trace：补充证据
     - `run 1000`：补充观察项，不作为当前进入 `P2` 的正式门槛
  3. 当前 accepted 边界继续保持：
     - 只做构造期固定成本优化
     - 仍只承诺顶层 `graphic.attribute.xxx = ...` 兼容
     - 不承诺任意深层 nested mutation 完全隔离
  4. 当前不进入 `P2` 的原因也已转写为维护口径，而不是过程性判断。
- 影响文件：
  1. `docs/refactor/state-engine/D3_MEMORY_BENCHMARK_PERF_CONTEXT.md`
  2. `docs/refactor/state-engine/D3_PHASE4_IMPLEMENTATION_LOG.md`
- 验证：
  1. 文档一致性核对通过：
     - perf context 已切到 `P1 accepted / 当前不进入 P2`
     - implementation log 保持与当前 accepted 边界一致
  2. 本条未继续改代码，也未重新扩大性能实现范围
- 是否进入 `P2`：
  否。本条只同步正式维护口径，不代表开启新的实现轮次。

### 2026-04-17 11:02 — Memory benchmark / P2 开启与 VTable 业务验证口径留档

- 背景：
  在 `P1 accepted` 之后，用户进一步明确了一个新的业务价值锚点：除了图表场景，VRender 还服务于 VTable。VTable 的典型路径包括大量 `text`、每个单元格的自定义图元，以及透传到 VRender 的 `text stateProxy`。这意味着当前 memory benchmark 剩余差距不再只是“极端 benchmark 现象”，而是对高数量、低状态、基础属性为主的真实业务场景有潜在意义。
- 结论：
  1. 当前继续推进，不以“与 `develop` 仍有接近 1 倍差距”作为理由，而以 **VTable 业务价值** 作为 `P2` 开启依据。
  2. 当前 `P2` 已批准启动，但边界被收紧为：
     - 仍只允许在构造期固定成本路径内优化
     - 不触碰 renderer / raf / deferred / shared-state 主链
     - 不扩大当前契约边界
  3. 本轮已新增 `P2` 执行材料：
     - `docs/refactor/state-engine/D3_MEMORY_BENCHMARK_P2_GUIDE.md`
     - `docs/refactor/state-engine/D3_MEMORY_BENCHMARK_P2_PROMPT.md`
  4. `P2` 的业务验证口径已补充为两类 `VTable-lite` workload：
     - `basic cells`：每个 cell 创建图元 + 文本
     - `text-stateProxy cells`：文本带 `stateProxy`，并带最小语义验证
  5. 当前官方 gate 继续保持：
     - `memory.ts run 100` no-trace：官方 gate
     - `memory.ts run 100` trace：补充证据
     - `run 1000`：补充观察项
- 影响文件：
  1. `docs/refactor/state-engine/D3_MEMORY_BENCHMARK_PERF_CONTEXT.md`
  2. `docs/refactor/state-engine/D3_MEMORY_BENCHMARK_P2_GUIDE.md`
  3. `docs/refactor/state-engine/D3_MEMORY_BENCHMARK_P2_PROMPT.md`
  4. `docs/refactor/state-engine/D3_FOLLOWUPS.md`
  5. `docs/refactor/state-engine/README.md`
  6. `docs/refactor/state-engine/D3_ARCHIVE_INDEX.md`
  7. `docs/refactor/state-engine/D3_PHASE4_IMPLEMENTATION_LOG.md`
- 验证：
  1. 文档一致性已同步：
     - perf context 已切到 `P2 approved to start`
     - README / archive index 已新增入口
     - followups 中的 memory 项已不再作为“仅文档级 follow-up”保留
  2. 本条只做执行材料收口，不继续修改实现代码
- 是否进入 `P2`：
  是。当前已允许进入 `P2`，但仍要求单目标、低风险、可测量地推进。

### 2026-04-17 12:15 — Memory benchmark P2 / VTable-lite workload 与 text cache lazy-init 尝试

- 背景：
  `P2` 已批准启动，但边界被收紧为：
  1. 先建立 `VTable-lite` workload
  2. 先拿 baseline
  3. 只做一个单目标、低风险、可测量的优化
  4. 继续以 `memory.ts run 100` 作为官方 gate
- VTable-lite workload 定义：
  1. `VTable-lite basic cells`
     - `5000` 个 cell
     - 每个 cell 创建：
       - `1` 个背景 `rect`
       - `1` 个 `text`
     - 总图元量级约 `10000`
     - 不启用状态切换，只测基础构造成本
  2. `VTable-lite text-stateProxy cells`
     - 同样为 `5000` 个 cell
     - 每个 cell 创建：
       - `1` 个背景 `rect`
       - `1` 个 `text`
     - 每个 `text` 都挂 `stateProxy`
     - 同时补一个最小语义验证：
       - 对 `10` 个 sample text 调用一次 `useStates(['hover'], false)`
       - 验证 `stateProxy` 产生的 `fill` 生效
- baseline（clean、串行）：
  1. `memory.ts run 100` no-trace
     - 总耗时：`986.0ms`
     - 构造阶段：`304.1ms`
     - heap delta：`422.22MB`
  2. `memory.ts run 100` trace
     - 总耗时：`1025.4ms`
     - 构造阶段：`323.4ms`
     - `RunTask.max = 1025.8ms`
     - `backgroundMarking.total = 962.6ms`
     - `backgroundMarking.max = 105.9ms`
     - `minorGc.total = 290.4ms`
     - `majorGc.total = 140.0ms`
  3. `VTable-lite basic cells run 100` no-trace
     - 总耗时：`991.8ms`
     - 构造阶段：`327.3ms`
     - heap delta：`459.91MB`
  4. `VTable-lite text-stateProxy cells run 100` no-trace
     - 总耗时：`1053.5ms`
     - 构造阶段：`339.2ms`
     - heap delta：`493.10MB`
     - `stateProxy` sample 语义：`10/10` 通过
- 为什么本轮单目标选 `text cache lazy-init`：
  1. `VTable-lite basic cells` 与 `memory.ts` 在相近总图元量级下相比，构造阶段和 heap delta 都更重
  2. 这轮新增的 `text-cache-lazy.test.ts` 证明当前 `Text` 在构造期会 eager 分配 `cache = {}`
  3. 这条额外分配对大量 `text` 的 VTable 场景是直接固定成本，因此选它作为唯一的 `P2` 目标
- 实际改动范围：
  1. `packages/vrender-core/src/graphic/text.ts`
     - `Text.cache` 从 eager 分配改为 lazy init
  2. `packages/vrender-core/__tests__/unit/graphic/text-cache-lazy.test.ts`
     - 新增 text cache lazy-init 回归
  3. `packages/vrender/__tests__/browser/src/pages/vtable-lite-basic.ts`
  4. `packages/vrender/__tests__/browser/src/pages/vtable-lite-text-stateproxy.ts`
  5. `packages/vrender/__tests__/browser/src/pages/vtable-lite-shared.ts`
  6. `packages/vrender/__tests__/browser/src/pages/index.ts`
  7. `packages/vrender/__tests__/browser/scripts/measure-memory-benchmark.cjs`
- after（clean、串行）：
  1. `memory.ts run 100` no-trace
     - 总耗时：`980.7ms`
     - 构造阶段：`304.4ms`
     - heap delta：`421.51MB`
  2. `memory.ts run 100` trace
     - 总耗时：`957.6ms`
     - 构造阶段：`299.0ms`
     - `RunTask.max = 958.4ms`
     - `backgroundMarking.total = 1026.7ms`
     - `backgroundMarking.max = 102.2ms`
     - `minorGc.total = 250.4ms`
     - `majorGc.total = 117.6ms`
  3. `VTable-lite basic cells run 100` no-trace
     - 总耗时：`998.5ms`
     - 构造阶段：`324.5ms`
     - heap delta：`448.43MB`
  4. `VTable-lite text-stateProxy cells run 100` no-trace
     - 总耗时：`969.0ms`
     - 构造阶段：`324.7ms`
     - heap delta：`481.97MB`
     - `stateProxy` sample 语义：`10/10` 通过
- before / after 判断：
  1. `memory.ts run 100` no-trace
     - 总耗时：`986.0 -> 980.7ms`，改善很小
     - 构造阶段：`304.1 -> 304.4ms`，无改善
     - heap delta：`422.22 -> 421.51MB`，改善很小
     - 结论：当前官方 gate **没有形成足够清晰的可见改善**
  2. `memory.ts run 100` trace
     - 总耗时、构造阶段、`RunTask.max`、`minorGc.total`、`majorGc.total` 均改善
     - `backgroundMarking.total` 有上升，但 `backgroundMarking.max` 下降
     - 结论：没有看到主导指标上的反向恶化
  3. `VTable-lite basic cells`
     - 构造阶段与 heap delta 改善，但总耗时略增
  4. `VTable-lite text-stateProxy cells`
     - 总耗时、构造阶段、heap delta 都有可见改善
     - `stateProxy` 语义保持成立
- 定向验证：
  1. `rush compile -t @visactor/vrender-core`：通过
  2. 定向测试：
     - `text-cache-lazy.test.ts`
     - `attribute-clone.test.ts`
     - `state-helper-lazy-init.test.ts`
     - `graphic-state.test.ts`
     - `state-animation.test.ts`
     - `normal-attrs.test.ts`
     - `state-resolution.test.ts`
     汇总：`7 suites / 64 tests` 通过
  3. `wrap-text.test.ts`：`2/2` 通过
  4. changed-file lint：通过
- 契约边界：
  1. 仍只承诺顶层 `graphic.attribute.xxx = ...` 兼容成立
  2. 仍不承诺任意深层 nested mutation 完全隔离
  3. 没有触碰 renderer / raf / deferred / shared-state 主链
- 本轮 `P2` 是否接受：
  否。
  1. 虽然 `VTable-lite text-stateProxy` 业务 gate 证明了 text-heavy 场景有可见帮助
  2. 但当前官方 gate `memory.ts run 100` no-trace 没有形成足够清晰的可见改善
  3. 因此本轮按 stop 条件收口，不把 `P2` 写成 accepted
  4. 当前没有新增已知 `text / cache / layout` 相关副作用证据

### 2026-04-17 12:42 — Text cache lazy-init / WrapText 兼容回归收口

- 背景：
  在上一轮 `P2` 尝试中，`Text.cache` 从 eager init 改成 lazy init 后，`wrap-text.test.ts` fresh 转红，说明当前优化已经带来了真实文本兼容副作用。
- root cause：
  1. `Text` 现在允许 `cache` 在构造期保持未初始化，直到第一次真实布局计算才分配。
  2. `WrapText` 仍沿用旧假设，直接写入 `this.cache.layoutData`。
  3. 当 `WrapText.updateMultilineAABBBounds()` 首次运行时，`cache` 仍可能是 `undefined`，于是触发：
     - `Cannot set properties of undefined (setting 'layoutData')`
  4. 额外核对后，当前源码里唯一 `extends Text` 的子类就是 `WrapText`，没有发现更多 text 子类存在同类 direct-write 分支。
- 修复方式：
  1. 保持 `Text.cache lazy-init` 本身不回退。
  2. 只修 `WrapText` 的兼容层：
     - 将 `wrap-text.ts` 中直接写 `this.cache.layoutData` 的位置改成复用 `Text` 现有的 lazy-cache 入口 `this.getOrCreateCache().layoutData = ...`
  3. 同时补齐并保持：
     - `text-cache-lazy.test.ts`
     - `wrap-text.test.ts`
     两条针对 `Text.cache lazy-init` 与 `WrapText` 兼容的最小回归
- 影响文件：
  1. `packages/vrender-core/src/graphic/text.ts`
  2. `packages/vrender-core/src/graphic/wrap-text.ts`
  3. `packages/vrender-core/__tests__/unit/graphic/text-cache-lazy.test.ts`
  4. `packages/vrender-core/__tests__/unit/graphic/wrap-text.test.ts`
  5. `docs/refactor/state-engine/D3_PHASE4_IMPLEMENTATION_LOG.md`
- fresh 验证：
  1. `rush compile -t @visactor/vrender-core`：通过
  2. `wrap-text.test.ts`：`2/2` 通过
  3. `text-cache-lazy.test.ts`：`2/2` 通过
  4. 当前专项 7 组定向测试：
     - `text-cache-lazy.test.ts`
     - `attribute-clone.test.ts`
     - `state-helper-lazy-init.test.ts`
     - `graphic-state.test.ts`
     - `state-animation.test.ts`
     - `normal-attrs.test.ts`
     - `state-resolution.test.ts`
     汇总：`7 suites / 64 tests` 通过
  5. changed-file lint：通过
- 当前副作用是否已解除：
  是。
  1. 当前已知的 `WrapText`/`cache` 兼容回归已解除
  2. 当前没有新的已知 text/cache 相关副作用证据
- 是否允许恢复继续评估 `P2`：
  是。
  1. 这只是清除已确认副作用，**不等于**恢复接受上一轮 `P2`
  2. 当前可以恢复继续评估 `P2`，但必须从“无已知文本兼容副作用”的状态重新开始判断

### 2026-04-20 00:00 — Text cache lazy-init / 兼容回归复核结论同步

- 背景：
  上一轮已经完成 `Text.cache lazy-init` 对 `WrapText` 的兼容修复，并给出“可以恢复继续评估 `P2`”的工程判断。当前需要把最新复核结论同步为正式维护状态，避免后续维护者把这条判断继续视为未确认意见。
- 复核结论：
  1. 这轮兼容回归修复通过复核。
  2. 当前可以恢复继续评估 `P2`。
  3. 该结论仍然只表示：
     - 已确认的 `text / cache / layout` 兼容副作用已收口
     - 后续可以重新进入 `P2` 评估
     - **不等于** `P2` 已经 accepted
- 是否影响当前状态：
  1. 不改变 `P0 accepted`
  2. 不改变 `P1 accepted`
  3. 允许恢复继续评估 `P2`

### 2026-04-20 10:20 — Memory benchmark P2 / 下一候选方向检查后暂停

- 背景：
  在确认 `Text.cache lazy-init` 的兼容回归已收口后，需要恢复继续评估 `P2`。按当前专项边界，这一步应先确认是否还存在一个**单目标、低风险、可测量**的新候选，而不是继续试探式扩实现。
- 检查结论：
  1. 当前构造路径里仍然显眼的 per-instance 固定分配点，主要是 `Graphic` 构造函数中的 `_AABBBounds = new AABBBounds()`。
  2. 但把这条改成 lazy-init 之后，要保持现有语义与测试稳定，至少会波及：
     - `packages/vrender-core/src/graphic/graphic.ts`
     - `packages/vrender-core/src/graphic/text.ts`
     - `packages/vrender-core/src/graphic/wrap-text.ts`
     - `packages/vrender-core/src/graphic/group.ts`
     - `packages/vrender-core/src/graphic/glyph.ts`
     - `packages/vrender-core/src/graphic/richtext/icon.ts`
  3. 这已经超出当前“单目标、低风险、可测量”的舒适边界，而且从问题形态看，更像把 bounds 分配从构造期延后到 bounds/layout 路径，而不是一个已经明确证明会带来净收益的新候选。
  4. 因此当前没有继续推进实现；按 stop-and-feedback 条件停在“候选不足够合理”的判断点。
- 是否继续进入新的 `P2` 实现：
  否。
  1. 当前还没有一个足够合理的新单目标 `P2` 候选
  2. 在没有新拍板前，不继续扩大到 `_AABBBounds` lazy-init 这类多文件路径

### 2026-04-20 10:40 — Memory benchmark / 已确认基线固定提交

- 背景：
  当前已确认成立的内容需要先固定为可提交基线，避免继续在同一工作区叠加新的 `P2` 尝试，导致 accepted / not accepted 状态混杂。
- 本次固定内容：
  1. `P0 accepted`
  2. `P1 accepted`
  3. `P2 approved to start`
  4. `Text.cache lazy-init` 回归已修复
  5. 当前可以恢复继续评估 `P2`
  6. 当前仍不能把 `P2` 直接写成 accepted
  7. 当前没有足够合理的新单目标 `P2` 候选
- fresh 验证：
  1. `rush compile -t @visactor/vrender-core`
  2. `wrap-text.test.ts`
  3. `text-cache-lazy.test.ts`
  4. 当前专项 7 组定向测试
  结果均通过后才允许提交。
- 当前仍保持：
  1. `P2` 可以继续评估
  2. 但下一轮实现前，需要先单独拍板更宽的候选边界（例如 `_AABBBounds` lazy-init）
