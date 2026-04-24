# 状态引擎重构文档

## 核心文档

| 文档 | 说明 |
|------|------|
| `graphic-state-animation-refactor-expectation.md` | 重构期望文档（根本指导文档） |
| `D3_ARCH_DESIGN.md` | D3 架构设计文档 v1.12（当前最新版） |
| `D3_PHASE1_IMPLEMENTATION_GUIDE.md` | **Phase 1 实现任务文档**（给资深开发者，含 10 步详解、伪代码、测试矩阵） |
| `D3_PHASE1_DEVELOPER_PROMPT.md` | **开发者沟通 Prompt**（含期望文档背景、FAQ、待确认问题） |
| `D3_PHASE2_IMPLEMENTATION_GUIDE.md` | **Phase 2 实现任务文档**（v2.2，属性分层与核心路径收口） |
| `D3_PHASE2_DEVELOPER_PROMPT.md` | **Phase 2 开发者沟通 Prompt**（设计收敛版） |
| `D3_PHASE2_EXECUTION_PROMPT.md` | **Phase 2 最终执行指令**（给实现 agent） |
| `D3_PHASE2_CLOSEOUT_PROMPT.md` | **Phase 2 close-out 执行指令**（给实现 agent） |
| `D3_PHASE2_IMPLEMENTATION_LOG.md` | **Phase 2 实现留档**（开发过程记录） |
| `D3_PHASE2_REVIEW_NOTES.md` | **Phase 2 评审说明**（给协调者与总监） |
| `D3_PHASE2_DIRECTOR_REVIEW_PROMPT.md` | **总监评审 Prompt**（给 review agent） |
| `D3_PHASE3_SHARED_STATE_DESIGN.md` | **Phase 3 正式设计文档**（Group-first 共享状态定义） |
| `D3_PHASE3_IMPLEMENTATION_GUIDE.md` | **Phase 3 实施任务文档**（Group-first shared-state） |
| `D3_PHASE3_DEVELOPER_PROMPT.md` | **Phase 3 开发者沟通 Prompt**（执行边界收敛版） |
| `D3_PHASE3_REVIEW_NOTES.md` | **Phase 3 评审说明**（给协调者与总监） |
| `D3_PHASE3_DIRECTOR_REVIEW_PROMPT.md` | **Phase 3 总监评审 Prompt**（给 review agent） |
| `D3_PHASE3_EXECUTION_PROMPT.md` | **Phase 3 最终执行指令**（给实现 agent） |
| `D3_PHASE3_CLOSEOUT_PROMPT.md` | **Phase 3 close-out 执行指令**（给实现 agent / 协调者） |
| `D3_PHASE3_ACCEPTANCE_TEMPLATE.md` | **Phase 3 最终验收模板**（给协调者 / 架构师 / 总监） |
| `D3_PHASE3_IMPLEMENTATION_LOG.md` | **Phase 3 实现留档**（开发过程记录） |
| `D3_PHASE4_PERFORMANCE_DESIGN.md` | **Phase 4 正式设计文档**（观测 + 调度优先） |
| `D3_PHASE4_IMPLEMENTATION_GUIDE.md` | **Phase 4 实施任务文档**（观测 + strict paint-only deferred） |
| `D3_PHASE4_DEVELOPER_PROMPT.md` | **Phase 4 开发者沟通 Prompt**（执行边界收敛版） |
| `D3_PHASE4_REVIEW_NOTES.md` | **Phase 4 评审说明**（给协调者与总监） |
| `D3_PHASE4_DIRECTOR_REVIEW_PROMPT.md` | **Phase 4 总监评审 Prompt**（给 review agent） |
| `D3_PHASE4_EXECUTION_PROMPT.md` | **Phase 4 最终执行指令**（给实现 agent） |
| `D3_PHASE4_CLOSEOUT_PROMPT.md` | **Phase 4 close-out 执行指令**（给实现 agent / 协调者） |
| `D3_PHASE4_ACCEPTANCE_TEMPLATE.md` | **Phase 4 最终验收模板**（给协调者 / 架构师 / 总监） |
| `D3_PHASE4_IMPLEMENTATION_LOG.md` | **Phase 4 实现留档**（开发过程记录） |
| `D3_FINAL_SUMMARY.md` | **D3 最终总结**（项目级收口；归档文档，不是新的规范源） |
| `D3_ARCHIVE_INDEX.md` | **D3 归档索引**（后续维护者导航入口；归档文档，不是新的规范源） |
| `D3_FOLLOWUPS.md` | **D3 后续项跟踪**（非阻塞 follow-up 清单；归档文档，不是新的规范源） |
| `D3_PRE_HANDOFF_HARDENING.md` | **D3 交付前加固方案**（上层图表库接入前的最小验证与 release gate；归档/执行文档，不是新的规范源） |
| `D3_PRE_HANDOFF_HARDENING_SUMMARY.md` | **D3 交付前加固结果**（历史 hardening 收口结果；legacy removal 已完成，overall handoff 已恢复） |
| `D3_PRE_HANDOFF_SMOKE_HARNESS.md` | **D3 交付前 smoke harness 规划**（将 `packages/vrender rushx start` 收口为 handoff smoke 环境；归档/执行文档，不是新的规范源） |
| `D3_PRE_HANDOFF_SMOKE_PROMPT.md` | **D3 smoke harness 开发者执行 Prompt**（给实现 agent） |
| `D3_PRE_HANDOFF_SMOKE_TRIAGE.md` | **D3 smoke triage 与 baseline 留档**（全量页面 triage、baseline 清单、历史 exclusions、迁移结论） |
| `D3_PRE_HANDOFF_SMOKE_RENDERER_REGRESSION.md` | **browser 空白页问题留档**（scene tree 正常但 renderer registry 为空的定位与修复） |
| `D3_UPPER_LAYER_ADOPTION_GUIDE.md` | **上层业务接入指南**（给 `vchart` / `vtable` 等上层仓库 agent 的新版本 VRender 使用说明） |
| `D3_UPPER_LAYER_INTEGRATION_FRICTION_REVIEW.md` | **上层接入困难点评审文档**（从上层使用者视角评估 app-scoped 接入的摩擦点、归因层级与建议动作） |
| `D3_UPPER_LAYER_LOGIC_CHAIN_AUDIT.md` | **上层接入逻辑链审计文档**（检查推荐链与真实上层链是否已经对齐） |
| `D3_VCHART_APP_SCOPED_ALIGNMENT_PLAN.md` | **VChart app-scoped 对齐实施计划**（external-stage 证据已通过，下一步推进 app-provider-first / VChart-created-stage 源码级对齐） |
| `D3_MULTI_ENV_ON_DEMAND_GOVERNANCE.md` | **multi-env / on-demand 治理任务文档**（决定是否继续保留更宽 public contract，并给出治理工作流） |
| `D3_ALPHA_COORDINATION.md` | **alpha 协作文档**（给 `VRender agent` / `VChart agent` / 协调者的当前 alpha gate、blocker 和 handoff 状态面） |
| `D3_POST_ALPHA_WRAPUP_PLAN.md` | **alpha 后收尾优先级计划**（browser alpha gate 关闭后的必要收尾、owner、优先级与完成标准） |
| `D3_MEMORY_BENCHMARK_PERF_CONTEXT.md` | **memory benchmark 性能问题上下文**（`memory.ts` 与 `develop` 的性能差距归因与后续优化边界） |
| `D3_MEMORY_BENCHMARK_P2_GUIDE.md` | **memory benchmark P2 实施任务文档**（面向 VTable-lite 业务场景的构造期固定成本优化） |
| `D3_MEMORY_BENCHMARK_P2_PROMPT.md` | **memory benchmark P2 开发者执行 Prompt**（给实现 agent） |
| `D3_LEGACY_PATH_REMOVAL_PLAN.md` | **legacy path removal 规划**（legacy binding / deprecated createStage / hygiene 残留的分层迁移计划） |
| `D3_LEGACY_PATH_REMOVAL_PROMPT.md` | **legacy path removal 开发者执行 Prompt**（给实现 agent） |
| `D3_LEGACY_PATH_REMOVAL_STATUS.md` | **legacy path removal 当前结论**（P0 completed / P1 formally closed to boundary / P2 completed；legacy removal 已完成，overall handoff 已恢复） |
| `D3_LEGACY_P0_INSTALLER_GUIDE.md` | **legacy P0 installer surface 实施任务文档**（下一轮只聚焦补正式安装链，不扩大 P1/P2） |
| `D3_LEGACY_P0_INSTALLER_PROMPT.md` | **legacy P0 installer surface 开发者执行 Prompt**（给实现 agent） |
| `D3_LEGACY_NODE_RUNTIME_SMOKE_ALIGNMENT.md` | **legacy node runtime / smoke harness alignment 专项文档**（将 `stage-graphic.test.ts` 从当前 P1 caller cleanup 中正式剥离） |
| `D3_LEGACY_NODE_RUNTIME_SMOKE_PROMPT.md` | **legacy node runtime / smoke harness alignment 开发者执行 Prompt**（给实现 agent） |
| `D3_LEGACY_P2_HYGIENE_GUIDE.md` | **legacy P2 hygiene cleanup 实施任务文档**（只做 live package / lockfile / active docs 清理） |
| `D3_LEGACY_P2_HYGIENE_PROMPT.md` | **legacy P2 hygiene cleanup 开发者执行 Prompt**（给实现 agent） |

## 归档与导航

> 以下文档只承担归档、导航和 follow-up 跟踪职责；**canonical source 仍然是** `graphic-state-animation-refactor-expectation.md`、`D3_ARCH_DESIGN.md` 和各 Phase 的 design / execution / implementation log。

| 文档 | 说明 |
|------|------|
| `D3_FINAL_SUMMARY.md` | 项目级最终总结，只写结论，不重复阶段细节 |
| `D3_ARCHIVE_INDEX.md` | 归档入口，回答“后续维护者先看哪份、每份文档解决什么问题” |
| `D3_FOLLOWUPS.md` | 非阻塞 follow-up 跟踪清单，不重开已关闭阶段设计 |
| `D3_PRE_HANDOFF_HARDENING.md` | 上层图表库接入前的最小加固方案，聚焦测试缺口、release gate 与 handoff 门槛 |
| `D3_PRE_HANDOFF_HARDENING_SUMMARY.md` | pre-handoff hardening 的历史完成记录；当前总体 handoff 已恢复为 ready，legacy removal 也已完成 |
| `D3_PRE_HANDOFF_SMOKE_HARNESS.md` | `packages/vrender rushx start` 的 browser smoke harness 收口规划 |
| `D3_PRE_HANDOFF_SMOKE_PROMPT.md` | browser smoke harness 的实现 agent 执行入口 |
| `D3_PRE_HANDOFF_SMOKE_TRIAGE.md` | browser smoke harness 的 triage/baseline/exclusions 最终留档 |
| `D3_PRE_HANDOFF_SMOKE_RENDERER_REGRESSION.md` | browser 空白页问题的定位与修复留档 |
| `D3_UPPER_LAYER_ADOPTION_GUIDE.md` | `vchart` / `vtable` 等上层仓库 agent 的接入说明 |
| `D3_UPPER_LAYER_INTEGRATION_FRICTION_REVIEW.md` | app-scoped 上层接入摩擦点的正式评审文档 |
| `D3_UPPER_LAYER_LOGIC_CHAIN_AUDIT.md` | 推荐接入链与当前真实上层链的一致性审计文档 |
| `D3_VCHART_APP_SCOPED_ALIGNMENT_PLAN.md` | 让 `VChart` 拿到第一条真实 app-scoped integration evidence 的跨仓库实施计划 |
| `D3_MULTI_ENV_ON_DEMAND_GOVERNANCE.md` | multi-env / on-demand contract 是否继续保留及如何治理的专项入口 |
| `D3_ALPHA_COORDINATION.md` | `VRender` / `VChart` 双 agent 和协调者共用的 alpha gate / blocker / handoff 状态面 |
| `D3_POST_ALPHA_WRAPUP_PLAN.md` | browser alpha gate 关闭后，统一整理 alpha 后必要收尾事项、优先级、owner 与完成标准 |
| `D3_MEMORY_BENCHMARK_PERF_CONTEXT.md` | `memory.ts` benchmark 性能问题的归因与后续优化上下文 |
| `D3_MEMORY_BENCHMARK_P2_GUIDE.md` | memory benchmark `P2` 的实施文档（补 VTable-lite 业务验证口径与单目标优化边界） |
| `D3_MEMORY_BENCHMARK_P2_PROMPT.md` | memory benchmark `P2` 的实现 agent 执行入口 |
| `D3_LEGACY_PATH_REMOVAL_PLAN.md` | legacy binding / deprecated createStage / hygiene 残留的收口规划 |
| `D3_LEGACY_PATH_REMOVAL_PROMPT.md` | legacy path removal 的实现 agent 执行入口 |
| `D3_LEGACY_PATH_REMOVAL_STATUS.md` | legacy path removal 的最终结论与收口证据（P2 已完成） |
| `D3_LEGACY_P0_INSTALLER_GUIDE.md` | legacy removal 下一轮只聚焦 P0 installer surface 的实施文档 |
| `D3_LEGACY_P0_INSTALLER_PROMPT.md` | legacy removal 下一轮 P0 installer surface 的实现 agent 执行入口 |
| `D3_LEGACY_NODE_RUNTIME_SMOKE_ALIGNMENT.md` | 将 `stage-graphic.test.ts` 单独拆出的 node runtime / smoke harness alignment 专项 |
| `D3_LEGACY_NODE_RUNTIME_SMOKE_PROMPT.md` | 上述专项的实现 agent 执行入口 |
| `D3_LEGACY_P2_HYGIENE_GUIDE.md` | legacy removal 最后一轮 `P2 hygiene cleanup` 的实施文档 |
| `D3_LEGACY_P2_HYGIENE_PROMPT.md` | legacy removal 最后一轮 `P2 hygiene cleanup` 的实现 agent 执行入口 |

## 历史开发者沟通

| 文档 | 说明 |
|------|------|
| `D3_DEVELOPER_PROMPT.md` | D3 v1.0 开发者沟通 Prompt（已过时） |
| `D3_DEVELOPER_PROMPT_V2.md` | D3 v1.1 开发者沟通 Prompt（已过时） |

## 评审反馈

| 文档 | 说明 |
|------|------|
| `D3_ARCH_DESIGN_REVIEW_FEEDBACK.md` | 第一轮评审反馈（v1.2 → v1.3） |
| `D3_ARCH_DESIGN_REVIEW_FEEDBACK_ROUND2.md` | 第二轮评审反馈（v1.3 → v1.4） |
| `D3_ARCH_DESIGN_REVISION_PROMPT_ROUND2.md` | 第二轮修订 Prompt |
| `D3_ARCH_DESIGN_REVIEW_FEEDBACK_ROUND3.md` | 第三轮评审反馈（v1.4 → v1.5） |
| `D3_PHASE2_REVIEW_NOTES.md` | Phase 2 正式评审说明 |
| `D3_PHASE2_DIRECTOR_REVIEW_PROMPT.md` | Phase 2 总监 review prompt |

## 实施阶段

| 阶段 | 文档 | 状态 |
|------|------|------|
| Phase 1: 状态引擎内核 | `D3_PHASE1_DEVELOPER_PROMPT.md` | 已完成 |
| Phase 2: 属性分层与核心路径收口 | `D3_PHASE2_IMPLEMENTATION_GUIDE.md` / `D3_PHASE2_EXECUTION_PROMPT.md` / `D3_PHASE2_CLOSEOUT_PROMPT.md` / `D3_PHASE2_IMPLEMENTATION_LOG.md` | 已关闭 |
| Phase 3: Group-first 共享状态定义 | `D3_PHASE3_SHARED_STATE_DESIGN.md` / `D3_PHASE3_IMPLEMENTATION_GUIDE.md` / `D3_PHASE3_DEVELOPER_PROMPT.md` / `D3_PHASE3_REVIEW_NOTES.md` / `D3_PHASE3_DIRECTOR_REVIEW_PROMPT.md` / `D3_PHASE3_EXECUTION_PROMPT.md` / `D3_PHASE3_CLOSEOUT_PROMPT.md` / `D3_PHASE3_ACCEPTANCE_TEMPLATE.md` / `D3_PHASE3_IMPLEMENTATION_LOG.md` | 已关闭 |
| Phase 4: 性能优化 | `D3_PHASE4_PERFORMANCE_DESIGN.md` / `D3_PHASE4_IMPLEMENTATION_GUIDE.md` / `D3_PHASE4_DEVELOPER_PROMPT.md` / `D3_PHASE4_REVIEW_NOTES.md` / `D3_PHASE4_DIRECTOR_REVIEW_PROMPT.md` / `D3_PHASE4_EXECUTION_PROMPT.md` / `D3_PHASE4_IMPLEMENTATION_LOG.md` / `D3_PHASE4_CLOSEOUT_PROMPT.md` / `D3_PHASE4_ACCEPTANCE_TEMPLATE.md` | 已关闭 |
