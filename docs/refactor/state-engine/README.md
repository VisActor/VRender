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

## 归档与导航

> 以下文档只承担归档、导航和 follow-up 跟踪职责；**canonical source 仍然是** `graphic-state-animation-refactor-expectation.md`、`D3_ARCH_DESIGN.md` 和各 Phase 的 design / execution / implementation log。

| 文档 | 说明 |
|------|------|
| `D3_FINAL_SUMMARY.md` | 项目级最终总结，只写结论，不重复阶段细节 |
| `D3_ARCHIVE_INDEX.md` | 归档入口，回答“后续维护者先看哪份、每份文档解决什么问题” |
| `D3_FOLLOWUPS.md` | 非阻塞 follow-up 跟踪清单，不重开已关闭阶段设计 |

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
