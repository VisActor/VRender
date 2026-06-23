# D3 Phase 2 评审说明

> **用途**：供协调者与总监对 D3 v1.9 / Phase 2 v2.2 进行正式评审
> **评审目标**：判断是否可以进入 Phase 2 开发实现，而不是继续停留在架构修订阶段
> **当前状态**：Phase 2 已 closed

---

## 本轮评审包含哪些文档

本轮评审请以以下 4 份文档为准：

1. [graphic-state-animation-refactor-expectation.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/graphic-state-animation-refactor-expectation.md)
2. [D3_ARCH_DESIGN.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_ARCH_DESIGN.md)
3. [D3_PHASE2_IMPLEMENTATION_GUIDE.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE2_IMPLEMENTATION_GUIDE.md)
4. [D3_PHASE2_DEVELOPER_PROMPT.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE2_DEVELOPER_PROMPT.md)

其中：

- 期望文档是最高约束
- 架构文档定义设计边界
- Phase 2 指南是开发者的执行依据
- 开发者 prompt 是沟通与边界收敛材料

---

## 本轮相对上一版的核心变化

本轮不是小修，而是把 Phase 2 从“属性分层”升级为“属性分层 + 核心路径收口”。

重点变化有 10 项：

1. Phase 2 不再接受“新旧两套静态真值主路径并存”的最小桥接方案。
2. `normalAttrs` 退出静态状态核心路径，只保留 deprecated 兼容壳。
3. `finalAttribute` 收缩为动画层目标缓存，不再参与静态状态真值。
4. `stateProxy / stateMergeMode` 被明确纳入 Phase 2 主任务，不能留作隐式桥接逻辑。
5. 更新分类与 paint-only 提交语义前移到 Phase 2。
6. 动画结束后的恢复语义明确改为“回到当前静态真值”，而不是“把 final result 写回 base”。
7. `resolvedStatePatch` 的 authoritative patch 算法已写死，不再让开发者决定覆盖顺序。
8. `resolveWithCompiled()` 已降级为 deprecated 兼容辅助，不再允许留在主路径。
9. paint-only 的最小落地机制已绑定到当前 `UpdateTag / onAttributeUpdate / AutoRenderPlugin / DirtyBoundsPlugin`。
10. 正式写路径矩阵已拍板，`setAttribute / transform / onStop / jump/noAnimate` 的职责已固定。
11. Phase 2 放行附带两个成品验收条件：清除所有 `setAttributes(finalAttribute)` / `onStop(props)` base commit 路径；paint-only 不得静默回退到 `addUpdateBoundTag()`。

---

## Phase 2 架构复核结论

### 当前结论

当前结论已经更新为：

**Phase 2 已完成 close-out，并可标记为正式 `closed`。**

close-out 收口后的明确结果：

- `stateProxy fully decides per-state contribution` 已被文档显式接纳为 Phase 2 的 legacy compatibility 语义
- `animate-extension` 中残留的 `finalAttribute -> setAttributes` 正式写入 fallback 已移除
- `PICK` 在 Phase 2 中已显式 piggyback 到 `BOUNDS`
- implementation log 已补录 close-out 记录与验证结果

### Close-out gate（已满足）

Phase 2 close-out 的 5 项 gate 当前均已满足：

1. 文档已同步接受 `stateProxy fully decides per-state contribution` 语义，并明确标注为 **Phase 2 为兼容 legacy `stateProxy` 而接受的语义**，不是未来 shared-state 模型的推荐语义。
2. [animate-extension.ts](/Users/bytedance/Documents/GitHub/VRender2/packages/vrender-animate/src/animate-extension.ts) 中残留的 `finalAttribute -> setAttributes` fallback 已删除，缺少 transient path 时改为显式 `warn`。
3. `PICK` 路径语义已闭合：Phase 2 当前不引入独立 pick tag，而是在提交阶段显式 piggyback 到 `BOUNDS`。
4. [D3_PHASE2_IMPLEMENTATION_LOG.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE2_IMPLEMENTATION_LOG.md) 已补齐 close-out 记录，写清结论、影响文件和验证结果。
5. Phase 2 状态已从“待 close-out”切换为 `closed`。

### 已收口的 3 个 close-out 关注点

1. `stateProxy` 实现语义已与执行文档对齐。当前代码与文档均明确：**只要存在 `stateProxy`，该 state 的样式贡献就由 proxy 完全决定**；但这只作为 Phase 2 的 legacy compatibility 语义保留。
2. 动画扩展层的库级别违禁 fallback 已移除，成品代码中不再残留 `finalAttribute -> setAttributes` 正式写入路径。
3. `PICK` 分类已不再悬空：Phase 2 明确通过 `BOUNDS` 提交路径 piggyback 处理 pick 相关失效。

### Glyph 的处理要求

`Glyph` 不再只是风险备注，而是 **Phase 3 的正式输入**。Phase 3 必须明确回答：

1. `Glyph` 是永久特例，还是要并回统一状态主路径。
2. 在决策前，不继续扩展 glyph 专属状态语义。
3. Phase 3 需要给出 `Glyph` 的 ownership、状态来源和测试基线。

---

## 这轮评审要解决什么

这轮评审不是泛泛讨论方向，而是要回答一个具体问题：

**当前设计是否已经足够闭环，可以让资深开发者按文档直接开始 Phase 2 实现？**

建议把结论限定为三种：

1. `Approve`
2. `Approve with conditions`
3. `Request changes`

---

## 必须重点审的 6 个问题

### 1. 静态状态真值主路径是否真正闭环

评审时重点看：

- `baseAttributes + resolvedStatePatch -> attribute` 是否已经是唯一静态真值主路径
- `useStates / clearStates / invalidateResolver` 是否已经脱离 `normalAttrs` 快照恢复模型
- `clearStates()` 后是否能稳定回到 `baseAttributes`

如果这一点没闭环，Phase 2 不应开工。

### 2. `stateProxy / stateMergeMode` 是否被纳入新主路径

评审时重点看：

- compiled path 下，`resolvedStatePatch` 是否已经是最终 authoritative patch
- 是否仍然隐式依赖 `StateStyleResolver.resolveWithCompiled()` 兜底
- deep merge、proxy 覆盖静态 state、nullish skip 语义是否还成立

如果这一点不清楚，实现时一定会出现“文档说切主路径，代码还靠旧桥接”的分裂。

### 3. 动画边界是否足够清晰

评审时重点看：

- `finalAttribute` 是否被明确降级为动画目标缓存
- 动画 tick 直接写 `attribute` 是否仍被允许
- 动画结束时是否存在把 `finalAttribute` 或动画终点反写进 `baseAttributes` 的风险

这里的核心不是“动画能不能工作”，而是“动画不会污染静态真值”。

### 4. paint-only 路径是否真的成立

评审时重点看：

- Phase 2 是否已经把 `UpdateCategory` 和 `submitUpdateByKeys()` 纳入范围
- 纯视觉状态切换是否仍会无条件打 `bounds` 路径
- `UpdateTag.UPDATE_PAINT`、`addUpdatePaintTag()`、`DirtyBoundsPlugin` 承接点是否已经写实
- 是否已经明确“不向父级传播 bounds 变化”

这点必须按“性能优先第一优先级”审，不接受口头上的“后面再优化”。

### 5. 正式写路径矩阵是否已经拍板

评审时重点看：

- `setAttribute / setAttributes / _setAttributes / initAttributes`
- `translate / scale / rotate`
- `applyStateAttrs / updateNormalAttrs / onStop(props)`
- 状态动画 `jump / noAnimate`

是否都已写清：

- 写入哪一层
- 是否属于正式真值写入
- 是否允许临时 bypass

### 6. break change 是否合理

当前项目允许 break change，但前提是合理。

评审时重点看：

- `normalAttrs` 降级是否足够清楚
- `graphic.attribute.xxx = value` 不再保证是否表达清楚
- `finalAttribute` 的收缩是否会引入上层不可接受的调用不确定性

重点不是“有没有 break”，而是“break 后语义是否更一致、更可推理”。

---

## 建议的评审流程

### Step 1：先审是否满足期望文档

不要先审实现便利性。先看当前设计是否符合期望文档：

- 状态真值属于图元
- 共享定义优先
- 性能优先
- 动画不成为新的真值源

### Step 2：再审 Phase 2 边界是否过大或过小

要重点判断：

- 当前扩围是否合理
- 是否仍有关键机制被错误留到 Phase 3/4
- 是否把不该现在做的事情过早拉进来

### Step 3：最后再看开发者是否能直接执行

重点判断：

- 实现指南是否已足够明确
- 开发者 prompt 是否还残留待架构师临场拍板的问题
- blocker 是否已经显式写清楚

### Step 4：最后用业务场景反证

必须用下面两个问题反证设计是否真的闭环：

- 场景 A 的默认映射色是否稳定留在 `baseAttributes`
- 场景 B 的选中色是否只停留在 `resolvedStatePatch / finalAttribute`，清状态后是否能恢复默认映射

---

## 建议评审输出格式

建议你和总监的评审输出统一为：

1. `Blocking findings`
2. `Non-blocking risks`
3. `Open questions`
4. `Verdict`

其中 `Blocking findings` 请优先给：

- 结论
- 为什么与期望冲突
- 需要怎样修

---

## 建议评审结论的最低门槛

只有同时满足以下条件，才建议给出 `Approve` 或 `Approve with conditions`：

1. 静态真值主路径已明确收口
2. `stateProxy / stateMergeMode` 已明确纳入主路径
3. 动画结束不污染 `baseAttributes`
4. paint-only 提交语义在 Phase 2 中有明确落地路径
5. 开发者无需再替架构补关键决策
6. 写路径矩阵与业务场景 A/B 都能稳定回答
7. 成品代码中不存在残留的 `setAttributes(finalAttribute)` / `onStop(props)` base commit 路径
8. paint-only 成品实现不存在静默降级回 `addUpdateBoundTag()` 的路径

只要其中任一项仍是“实现时再看”，更合理的结论应是 `Request changes`。

---

## 当前建议给评审会的预期结论

我建议本轮评审优先判断这 4 个闭环是否已成立：

1. authoritative patch 唯一路径是否可信
2. 动画结束恢复唯一契约是否可信
3. paint-only 最小落地机制是否可信
4. 正式写路径矩阵是否已足够让开发者直接执行
5. 两个成品验收条件是否都已被写进执行文档并可测试验证

这 4 点若仍有任一项不稳，结论就不应进入实现。

对于已经完成实现的复核场景，建议把结论进一步收紧为：

- **主体实现可放行**
- **Phase 2 不进入正式 closed，直到 close-out gate 完成**

---

## 附：评审时可直接对照的业务场景

### 场景 A

柱子默认颜色来自业务数据的线性映射。

### 场景 B

选中态颜色来自另一套映射表，清除选中后必须恢复默认映射结果。

评审时可以直接问：

- 当前设计下，动画结束后会不会把选中色写回默认态？
- 当前设计下，纯视觉选中/取消选中是否会无条件触发 bounds 慢路径？
- 当前设计下，选中态新增 `stroke` 或 `lineWidth` 时，是否明确进入 bounds/pick 慢路径？

只要这些问题不能稳定回答，设计就还没有完全闭环。
