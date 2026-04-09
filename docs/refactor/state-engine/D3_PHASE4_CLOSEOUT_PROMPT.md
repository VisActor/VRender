# D3 Phase 4 Close-out Prompt

> **目标读者**：Phase 4 实现 agent / 协调者
> **用途**：Phase 4 主体实现通过架构复核后的收尾执行指令
> **当前状态**：已执行完成，Phase 4 已 closed

---

## 目标

Phase 4 当前状态不是“未完成”，而是：

**主体实现已完成，并已通过架构复核，但还不能标记为正式 `closed`。**

你这轮的任务不是继续扩展 Phase 4 范围，而是完成 close-out gate，让 Phase 4 可以正式关闭，并把非阻塞后续项明确留档。

---

## 你必须先读

1. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/graphic-state-animation-refactor-expectation.md`
2. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE4_EXECUTION_PROMPT.md`
3. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE4_PERFORMANCE_DESIGN.md`
4. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_ARCH_DESIGN.md`
5. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE4_IMPLEMENTATION_GUIDE.md`
6. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE4_REVIEW_NOTES.md`
7. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE4_IMPLEMENTATION_LOG.md`
8. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE4_ACCEPTANCE_TEMPLATE.md`

---

## 当前 close-out gate

Phase 4 只有在以下事项全部完成后，才能标记为正式 `closed`：

1. Phase 4 当前实现结论仍保持为 `Approve`，且不存在未关闭 blocker。
2. Phase 4 相关文档状态已同步：
   - `D3_PHASE4_PERFORMANCE_DESIGN.md`
   - `D3_PHASE4_IMPLEMENTATION_GUIDE.md`
   - `D3_PHASE4_DEVELOPER_PROMPT.md`
   - `D3_PHASE4_REVIEW_NOTES.md`
   - `D3_PHASE4_EXECUTION_PROMPT.md`
   - `D3_PHASE4_IMPLEMENTATION_LOG.md`
   - `README.md`
   - `D3_ARCH_DESIGN.md`
3. `D3_PHASE4_IMPLEMENTATION_LOG.md` 已回填最终 close-out 记录，至少包含：
   - Phase 4 主体实现完成结论
   - 全量回归与兼容 fixup 收口结论
   - 最终验证摘要
   - 非阻塞后续项跟踪状态
4. `D3_PHASE4_ACCEPTANCE_TEMPLATE.md` 已被用于形成最终验收说明，或已按同样结构输出最终验收结论。
5. `graphic.states` 告警策略与 `Glyph ownership` 拆分方式继续明确保留为非阻塞后续项，不在 close-out 阶段被误扩为新的 blocker。
6. 完成以上后，再将 Phase 4 状态改为正式 `closed`。

---

## 本轮不要做的事

以下事项这轮不要重开：

1. 不重开 Phase 4 telemetry / deferred / identity / committed snapshot / cache 边界设计讨论。
2. 不把 close-out 变成新的代码扩围入口。
3. 不把 `graphic.states` 告警策略和 `Glyph ownership` 拆分方式升级为本轮阻塞项。
4. 不提前开启后续阶段实现工作。

---

## close-out 执行顺序

按以下顺序完成：

1. 核对 Phase 4 当前实现结论与 review verdict，确认无未关闭 blocker。
2. 同步 Phase 4 相关文档状态，避免“实现已通过复核，但文档仍停留在可执行阶段”的错位。
3. 在 `D3_PHASE4_IMPLEMENTATION_LOG.md` 中回填最终 close-out 记录。
4. 使用 `D3_PHASE4_ACCEPTANCE_TEMPLATE.md` 形成最终验收说明。
5. 将 Phase 4 标记为正式 `closed`。

---

## 必须更新的文档

至少检查并按需要更新：

- `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE4_PERFORMANCE_DESIGN.md`
- `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE4_IMPLEMENTATION_GUIDE.md`
- `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE4_DEVELOPER_PROMPT.md`
- `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE4_REVIEW_NOTES.md`
- `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE4_EXECUTION_PROMPT.md`
- `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE4_IMPLEMENTATION_LOG.md`
- `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE4_ACCEPTANCE_TEMPLATE.md`
- `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/README.md`
- `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_ARCH_DESIGN.md`

---

## 最低验证要求

至少完成并汇报：

1. close-out gate 是否已全部满足。
2. `D3_PHASE4_IMPLEMENTATION_LOG.md` 是否已补齐最终 close-out 条目。
3. `D3_PHASE4_ACCEPTANCE_TEMPLATE.md` 是否已形成最终验收说明。
4. Phase 4 相关文档状态与 README / 总架构文档是否已同步。

如果 close-out 过程中引入代码改动，必须补跑受影响测试；如果只有文档变更，至少完成文档一致性自检。

---

## 你的输出格式

请按以下结构回复：

1. `Close-out status`
2. `Files changed`
3. `Documentation updates`
4. `Verification`
5. `Remaining non-blocking follow-ups`
6. `Can Phase 4 be marked closed`

要求：

- 先明确 close-out gate 是否全部满足
- 如果仍有未满足项，直接列 blocker
- 不要把“实现已通过复核”和“Phase 4 已正式 closed”混为一谈
- 明确引用你更新过的 implementation log 条目
