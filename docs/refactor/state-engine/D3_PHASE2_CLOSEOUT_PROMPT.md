# D3 Phase 2 Close-out Prompt

> **目标读者**：Phase 2 实现 agent
> **用途**：Phase 2 主体实现完成后的收尾执行指令
> **当前状态**：待执行

---

## 目标

Phase 2 当前状态不是“未完成”，而是：

**主体实现已完成，但还不能标记为正式 `closed`。**

你这轮的任务不是继续扩展 Phase 2 范围，而是完成架构复核要求的 close-out gate，让 Phase 2 可以正式关闭。

---

## 你必须先读

1. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/graphic-state-animation-refactor-expectation.md`
2. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE2_EXECUTION_PROMPT.md`
3. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_ARCH_DESIGN.md`
4. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE2_IMPLEMENTATION_GUIDE.md`
5. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE2_REVIEW_NOTES.md`
6. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE2_IMPLEMENTATION_LOG.md`

---

## 当前 close-out gate

Phase 2 只有在以下事项全部完成后，才能标记为正式 `closed`：

1. 文档已同步接受 `stateProxy fully decides per-state contribution` 语义，并明确标注：
   - 这是 **Phase 2 为兼容 legacy `stateProxy` 而接受的语义**
   - 这 **不是** 未来 shared-state 模型的推荐语义
2. `packages/vrender-animate/src/animate-extension.ts` 中残留的 `finalAttribute -> setAttributes` fallback 已处理：
   - 要么直接删除
   - 要么硬化为只允许 transient path，且在没有 `_restoreAttributeFromStaticTruth()` 时显式报错或告警
   - 无论哪种，都不允许再走 `setAttributes(finalAttribute)` 正式写入路径
3. `PICK` 路径语义已明确：
   - 要么补正式提交通路
   - 要么文档明确声明当前 `PICK` 暂时 piggyback 在 `BOUNDS/SHAPE`
4. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE2_IMPLEMENTATION_LOG.md` 已回填 close-out 记录
5. 完成以上后，再将 Phase 2 状态改为 `closed`

---

## 已知问题与处理要求

### 1. `stateProxy` 语义与执行文档不一致

当前代码实际语义是：

**只要存在 `stateProxy`，该 state 的样式贡献就由 proxy 完全决定。**

相关位置：

- `/Users/bytedance/Documents/GitHub/VRender2/packages/vrender-core/src/graphic/state/state-engine.ts`
- `/Users/bytedance/Documents/GitHub/VRender2/packages/vrender-core/__tests__/unit/graphic/state-engine.test.ts`

本轮要求：

- 不把这件事继续留成“代码和文档不一致”
- 直接把文档同步到当前实现
- 同时写明它只是 Phase 2 的 legacy compatibility 语义，避免提前锁死 Phase 3 shared-state 设计

### 2. `animate-extension` 残留违禁 fallback

当前仍存在库级别风险路径：

- `/Users/bytedance/Documents/GitHub/VRender2/packages/vrender-animate/src/animate-extension.ts`

本轮要求二选一：

1. 删除 fallback
2. 硬化 fallback

“硬化”的最低要求：

- 不再调用 `setAttributes(finalAttribute)`
- 不能形成 base commit
- 如果目标对象不具备 `_restoreAttributeFromStaticTruth()` 或等价 transient path，必须显式报错或告警

### 3. `PICK` 语义未闭合

当前分类器已产出 `PICK`：

- `/Users/bytedance/Documents/GitHub/VRender2/packages/vrender-core/src/graphic/state/attribute-update-classifier.ts`

但 `submitUpdateByDelta()` 没有单独的 `PICK` 提交通路：

- `/Users/bytedance/Documents/GitHub/VRender2/packages/vrender-core/src/graphic/graphic.ts`

本轮不强制你做大范围机制扩张，但必须把语义闭合：

- 如果成本可控，直接补正式提交通路
- 如果不宜在 Phase 2 收尾阶段继续扩机制，就在文档里明确：
  - Phase 2 当前 `PICK` 暂时 piggyback 于 `BOUNDS/SHAPE`
  - Phase 3/紧邻 follow-up 继续收口

### 4. `Glyph` 不作为本轮代码 blocker，但必须写入 Phase 3 输入

本轮不要求你继续扩 glyph 状态系统，但如果你同步更新文档，必须确保文档里明确：

1. `Glyph` 是永久特例还是回归统一状态主路径，留给 Phase 3 决策
2. 在决策前，不继续扩展 glyph 专属状态语义
3. Phase 3 需要给出 ownership 与测试基线

---

## 执行要求

按以下顺序完成：

1. 处理 `animate-extension` 残留 fallback
2. 同步 `stateProxy` 语义文档
3. 明确 `PICK` 路径
4. 回填 implementation log
5. 给出 close-out 完成结论

注意：

- 这不是重新打开 Phase 2 架构讨论
- 不要额外扩张 Phase 2 范围
- 不要把关键判断再抛回给协调者
- 你只能在“补正式提交通路”和“文档明确暂存语义”之间做 `PICK` 的收尾选择

---

## 必须更新的文档

至少检查并按需要更新：

- `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_ARCH_DESIGN.md`
- `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE2_IMPLEMENTATION_GUIDE.md`
- `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE2_REVIEW_NOTES.md`
- `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE2_IMPLEMENTATION_LOG.md`

如果你认为需要，也可以同步更新：

- `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE2_EXECUTION_PROMPT.md`

---

## 最低验证要求

至少完成并汇报：

1. 针对 `animate-extension` 的代码扫描或测试，证明成品中不再残留 `finalAttribute -> setAttributes` fallback
2. 与 `stateProxy` 语义相关的单测或文档对齐说明
3. `PICK` 路径的实现验证或文档说明
4. implementation log 已补录 close-out 记录

如果有代码变更，补跑受影响测试。

---

## 你的输出格式

请按以下结构回复：

1. `Close-out status`
2. `Files changed`
3. `Code changes`
4. `Documentation updates`
5. `Verification`
6. `Can Phase 2 be marked closed`

要求：

- 先明确 close-out gate 是否全部满足
- 如果仍有未满足项，直接列 blocker
- 不要把“主体实现已完成”和“Phase 2 已正式 closed”混为一谈
- 明确引用你更新过的 implementation log 条目
