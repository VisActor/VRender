# D3 归档索引

> **文档类型**：归档导航文档
> **用途**：告诉后续维护者“先看哪份、每份文档解决什么问题”
> **当前状态**：已归档
> **重要说明**：本文件不是新的规范源；规范仍以 `graphic-state-animation-refactor-expectation.md`、`D3_ARCH_DESIGN.md` 及各 Phase 主文档为准

---

## 1. 首先看什么

按使用场景，推荐阅读顺序如下：

1. 只想快速知道 D3 项目最终做成了什么：
   看 [D3_FINAL_SUMMARY.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_FINAL_SUMMARY.md)
2. 需要看最终规范源：
   先看 [graphic-state-animation-refactor-expectation.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/graphic-state-animation-refactor-expectation.md)，再看 [D3_ARCH_DESIGN.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_ARCH_DESIGN.md)
3. 需要理解某个阶段为什么这么设计：
   看对应 Phase 的 design 文档和 review notes
4. 需要实现、排障或核对交付证据：
   看对应 Phase 的 execution prompt、implementation log、close-out prompt、acceptance template
5. 需要知道还有什么没做但不阻塞：
   看 [D3_FOLLOWUPS.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_FOLLOWUPS.md)
6. 需要确认 legacy removal 最终如何收口，以及当前为什么已经可以恢复宣称 `handoff ready`：
   先看 [D3_LEGACY_PATH_REMOVAL_STATUS.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_LEGACY_PATH_REMOVAL_STATUS.md)
7. 准备交给上层图表库前，要看还必须补哪些验证：
   看 [D3_PRE_HANDOFF_HARDENING.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PRE_HANDOFF_HARDENING.md)
8. 需要处理 `packages/vrender rushx start` 的 browser smoke harness：
   看 [D3_PRE_HANDOFF_SMOKE_HARNESS.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PRE_HANDOFF_SMOKE_HARNESS.md)
9. 需要看 smoke baseline、全量 triage 和 exclusions 结果：
   看 [D3_PRE_HANDOFF_SMOKE_TRIAGE.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PRE_HANDOFF_SMOKE_TRIAGE.md)
10. 遇到“页面空白但 scene tree 正常”的 browser 渲染问题：
   看 [D3_PRE_HANDOFF_SMOKE_RENDERER_REGRESSION.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PRE_HANDOFF_SMOKE_RENDERER_REGRESSION.md)
11. 需要看 legacy binding / deprecated createStage / hygiene 残留最终是如何收口的：
   看 [D3_LEGACY_PATH_REMOVAL_PLAN.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_LEGACY_PATH_REMOVAL_PLAN.md)
12. 需要看 legacy path removal 最终推进到了哪里，以及 `P2` 如何完成收口：
   看 [D3_LEGACY_PATH_REMOVAL_STATUS.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_LEGACY_PATH_REMOVAL_STATUS.md)
13. 需要看下一轮为什么只做 `P0 installer surface`，而不是继续批量清 caller：
   看 [D3_LEGACY_P0_INSTALLER_GUIDE.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_LEGACY_P0_INSTALLER_GUIDE.md)
14. 需要看为什么 `stage-graphic.test.ts` 已被从当前 `P1 caller cleanup` 中剥离：
   看 [D3_LEGACY_NODE_RUNTIME_SMOKE_ALIGNMENT.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_LEGACY_NODE_RUNTIME_SMOKE_ALIGNMENT.md)
15. 需要看 legacy removal 最后一轮为什么只做 `P2 hygiene cleanup`：
   看 [D3_LEGACY_P2_HYGIENE_GUIDE.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_LEGACY_P2_HYGIENE_GUIDE.md)
16. 需要看 `memory.ts` benchmark 与 `develop` 的性能差距为什么在复用单 app 后仍然存在：
   看 [D3_MEMORY_BENCHMARK_PERF_CONTEXT.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_MEMORY_BENCHMARK_PERF_CONTEXT.md)
17. 需要看为什么 `memory benchmark` 现在继续推进到 `P2`，以及 VTable-lite 的业务验证口径是什么：
   看 [D3_MEMORY_BENCHMARK_P2_GUIDE.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_MEMORY_BENCHMARK_P2_GUIDE.md)

---

## 2. 规范源与归档文档的分工

### 规范源

这些文件定义“系统应该是什么”：

- [graphic-state-animation-refactor-expectation.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/graphic-state-animation-refactor-expectation.md)
- [D3_ARCH_DESIGN.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_ARCH_DESIGN.md)
- 各 Phase 的正式设计文档
- 各 Phase 的 execution prompt

### 证据与过程留档

这些文件回答“系统是怎么落地和被验收的”：

- 各 Phase 的 implementation log
- 各 Phase 的 review notes
- 各 Phase 的 acceptance template
- 各 Phase 的 close-out prompt

### 归档与导航

这些文件只负责收口、导航和 follow-up 承接：

- [D3_FINAL_SUMMARY.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_FINAL_SUMMARY.md)
- [D3_ARCHIVE_INDEX.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_ARCHIVE_INDEX.md)
- [D3_FOLLOWUPS.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_FOLLOWUPS.md)
- [D3_PRE_HANDOFF_HARDENING.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PRE_HANDOFF_HARDENING.md)
- [D3_PRE_HANDOFF_HARDENING_SUMMARY.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PRE_HANDOFF_HARDENING_SUMMARY.md)
- [D3_PRE_HANDOFF_SMOKE_HARNESS.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PRE_HANDOFF_SMOKE_HARNESS.md)
- [D3_PRE_HANDOFF_SMOKE_PROMPT.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PRE_HANDOFF_SMOKE_PROMPT.md)
- [D3_PRE_HANDOFF_SMOKE_TRIAGE.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PRE_HANDOFF_SMOKE_TRIAGE.md)
- [D3_PRE_HANDOFF_SMOKE_RENDERER_REGRESSION.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PRE_HANDOFF_SMOKE_RENDERER_REGRESSION.md)
- [D3_MEMORY_BENCHMARK_PERF_CONTEXT.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_MEMORY_BENCHMARK_PERF_CONTEXT.md)
- [D3_MEMORY_BENCHMARK_P2_GUIDE.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_MEMORY_BENCHMARK_P2_GUIDE.md)
- [D3_MEMORY_BENCHMARK_P2_PROMPT.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_MEMORY_BENCHMARK_P2_PROMPT.md)
- [D3_LEGACY_PATH_REMOVAL_PLAN.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_LEGACY_PATH_REMOVAL_PLAN.md)
- [D3_LEGACY_PATH_REMOVAL_PROMPT.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_LEGACY_PATH_REMOVAL_PROMPT.md)
- [D3_LEGACY_PATH_REMOVAL_STATUS.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_LEGACY_PATH_REMOVAL_STATUS.md)
- [D3_LEGACY_P0_INSTALLER_GUIDE.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_LEGACY_P0_INSTALLER_GUIDE.md)
- [D3_LEGACY_P0_INSTALLER_PROMPT.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_LEGACY_P0_INSTALLER_PROMPT.md)
- [D3_LEGACY_NODE_RUNTIME_SMOKE_ALIGNMENT.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_LEGACY_NODE_RUNTIME_SMOKE_ALIGNMENT.md)
- [D3_LEGACY_NODE_RUNTIME_SMOKE_PROMPT.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_LEGACY_NODE_RUNTIME_SMOKE_PROMPT.md)
- [D3_LEGACY_P2_HYGIENE_GUIDE.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_LEGACY_P2_HYGIENE_GUIDE.md)
- [D3_LEGACY_P2_HYGIENE_PROMPT.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_LEGACY_P2_HYGIENE_PROMPT.md)

---

## 3. 按阶段找文档

### Phase 1：状态引擎内核

- 设计与范围：
  [D3_PHASE1_IMPLEMENTATION_GUIDE.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE1_IMPLEMENTATION_GUIDE.md)
- 开发沟通：
  [D3_PHASE1_DEVELOPER_PROMPT.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE1_DEVELOPER_PROMPT.md)
- 验收背景：
  [ARCHITECT_HANDOFF.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/ARCHITECT_HANDOFF.md)

### Phase 2：属性分层与核心路径收口

- 主设计依据：
  [D3_ARCH_DESIGN.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_ARCH_DESIGN.md)
- 实施与执行：
  [D3_PHASE2_IMPLEMENTATION_GUIDE.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE2_IMPLEMENTATION_GUIDE.md)
  [D3_PHASE2_EXECUTION_PROMPT.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE2_EXECUTION_PROMPT.md)
- 评审与关闭：
  [D3_PHASE2_REVIEW_NOTES.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE2_REVIEW_NOTES.md)
  [D3_PHASE2_CLOSEOUT_PROMPT.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE2_CLOSEOUT_PROMPT.md)
  [D3_PHASE2_IMPLEMENTATION_LOG.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE2_IMPLEMENTATION_LOG.md)

### Phase 3：Group-first 共享状态定义

- 主设计依据：
  [D3_PHASE3_SHARED_STATE_DESIGN.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE3_SHARED_STATE_DESIGN.md)
- 实施与执行：
  [D3_PHASE3_IMPLEMENTATION_GUIDE.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE3_IMPLEMENTATION_GUIDE.md)
  [D3_PHASE3_EXECUTION_PROMPT.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE3_EXECUTION_PROMPT.md)
- 评审与关闭：
  [D3_PHASE3_REVIEW_NOTES.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE3_REVIEW_NOTES.md)
  [D3_PHASE3_CLOSEOUT_PROMPT.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE3_CLOSEOUT_PROMPT.md)
  [D3_PHASE3_ACCEPTANCE_TEMPLATE.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE3_ACCEPTANCE_TEMPLATE.md)
  [D3_PHASE3_IMPLEMENTATION_LOG.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE3_IMPLEMENTATION_LOG.md)

### Phase 4：性能优化

- 主设计依据：
  [D3_PHASE4_PERFORMANCE_DESIGN.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE4_PERFORMANCE_DESIGN.md)
- 实施与执行：
  [D3_PHASE4_IMPLEMENTATION_GUIDE.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE4_IMPLEMENTATION_GUIDE.md)
  [D3_PHASE4_EXECUTION_PROMPT.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE4_EXECUTION_PROMPT.md)
- 评审与关闭：
  [D3_PHASE4_REVIEW_NOTES.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE4_REVIEW_NOTES.md)
  [D3_PHASE4_CLOSEOUT_PROMPT.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE4_CLOSEOUT_PROMPT.md)
  [D3_PHASE4_ACCEPTANCE_TEMPLATE.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE4_ACCEPTANCE_TEMPLATE.md)
  [D3_PHASE4_IMPLEMENTATION_LOG.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE4_IMPLEMENTATION_LOG.md)

---

## 4. 常见问题时看哪份

| 问题 | 先看 |
|------|------|
| D3 最终目标是什么 | `graphic-state-animation-refactor-expectation.md` |
| 静态真值模型为什么这么定 | `D3_ARCH_DESIGN.md` |
| Phase 2 为什么禁止动画 end-commit | `D3_PHASE2_IMPLEMENTATION_GUIDE.md` + `D3_PHASE2_IMPLEMENTATION_LOG.md` |
| shared-state ownership 为什么是 Group-first | `D3_PHASE3_SHARED_STATE_DESIGN.md` |
| Phase 4 deferred 为什么只对 strict paint-only 开放 | `D3_PHASE4_PERFORMANCE_DESIGN.md` |
| 某阶段有没有真的通过验收 | 对应 Phase 的 `IMPLEMENTATION_LOG` + `ACCEPTANCE_TEMPLATE` |
| 还有哪些没做但不阻塞 | `D3_FOLLOWUPS.md` |
| 上层接入前还必须补哪些验证 | `D3_PRE_HANDOFF_HARDENING.md` |
| pre-handoff hardening 为什么曾经先通过、legacy removal 又如何最终收口 | `D3_PRE_HANDOFF_HARDENING_SUMMARY.md` + `D3_LEGACY_PATH_REMOVAL_STATUS.md` |
| `rushx start` 的 browser smoke harness 该怎么收口 | `D3_PRE_HANDOFF_SMOKE_HARNESS.md` |
| smoke baseline、全量 triage 和 exclusions 结果在哪 | `D3_PRE_HANDOFF_SMOKE_TRIAGE.md` |
| 页面空白但 scene tree 正常时先查什么 | `D3_PRE_HANDOFF_SMOKE_RENDERER_REGRESSION.md` |
| legacy 路径剩余项当时如何拆成 P0 / P1 / P2 并最终收口 | `D3_LEGACY_PATH_REMOVAL_PLAN.md` |
| legacy path removal 最终如何关闭，以及 handoff ready 为什么可以恢复 | `D3_LEGACY_PATH_REMOVAL_STATUS.md` |
| 下一轮 legacy removal 为什么只做 P0 installer surface | `D3_LEGACY_P0_INSTALLER_GUIDE.md` |
| 为什么 `stage-graphic.test.ts` 不再混入当前 P1 caller cleanup | `D3_LEGACY_NODE_RUNTIME_SMOKE_ALIGNMENT.md` |
| legacy removal 最后一轮为什么只剩 `P2 hygiene cleanup` | `D3_LEGACY_P2_HYGIENE_GUIDE.md` |
| memory benchmark 为什么现在开启 `P2`，以及 VTable-lite 业务验证怎么定义 | `D3_MEMORY_BENCHMARK_P2_GUIDE.md` |

---

## 5. 归档后维护原则

1. 新问题优先回到规范源修订，不要把归档文档当作新的设计基线。
2. 已 `closed` 的阶段如需补充说明，优先更新该阶段的 implementation log 或 review notes。
3. 非阻塞项统一进入 [D3_FOLLOWUPS.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_FOLLOWUPS.md)，避免继续污染已关闭阶段主文档。
