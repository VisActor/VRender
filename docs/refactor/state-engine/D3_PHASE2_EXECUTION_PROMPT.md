# D3 Phase 2 最终执行指令

> **目标读者**：Phase 2 实现 agent
> **用途**：作为正式实现启动 prompt
> **设计基线**：`D3_ARCH_DESIGN.md`（v1.9） + `D3_PHASE2_IMPLEMENTATION_GUIDE.md`（v2.2）
> **状态**：已执行，Phase 2 已 closed

---

## 角色与目标

你现在作为 VRender D3 重构项目的实现 agent，负责落地 Phase 2。

这不是开放式设计讨论，而是按已拍板架构执行实现。你的目标不是“做出一个大致可运行的版本”，而是交付一个满足 Phase 2 成品门槛的实现。

请遵循以下原则：

1. 期望文档是最高约束。
2. 性能优先是第一优先级。
3. 静态状态真值必须单一，不能长期分散在 `normalAttrs / finalAttribute / attribute / baseAttributes`。
4. 动画不是新的真值源。
5. 不要把关键架构决策转回给协调者；本轮该拍板的都已拍板。

---

## 你必须先读

1. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/graphic-state-animation-refactor-expectation.md`
2. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_ARCH_DESIGN.md`
3. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE2_IMPLEMENTATION_GUIDE.md`
4. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE2_DEVELOPER_PROMPT.md`
5. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE2_REVIEW_NOTES.md`
6. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE2_IMPLEMENTATION_LOG.md`

---

## 两个硬性验收条件

这是 Phase 2 放行附带的成品门槛，任一不满足都算未完成：

1. 任何残留的 `setAttributes(finalAttribute)` / `onStop(props)` base commit 路径都不能带进成品。
2. paint-only 不允许在实现中静默降级回 `addUpdateBoundTag()`。

补充解释：

- “不能带进成品” 指最终代码中不能残留这类恢复/提交路径。
- “不能静默降级” 指不能在纯视觉 delta 路径里偷偷回退为 bounds 更新。
- 如果存在冷启动或缓存缺失场景，必须显式定义独立路径并单独测试，不能伪装成 paint-only 回退。

---

## 执行前补充澄清

### 1. 普通动画的“结束提交”语义

本轮结论是：**一并取消**。

也就是说，Phase 2 取消的不只是状态动画，而是所有“动画结束后隐式把终值提交为新的静态真值”的路径。包括但不限于：

- `setAttributes(finalAttribute)`
- `onStop(props) -> setAttributes(props)`
- custom animation 在结束时把终值写回 base 的逻辑

结论：

- `animate.to(...)` 结束后，不再自动把终值变成新的静态真值
- 如果业务真的需要把动画终值固化为新的静态真值，必须显式调用 `setAttribute / setAttributes`
- 这应作为 Phase 2 的既定 breaking behavior 处理，而不是只改状态动画

### 2. paint-only 的冷启动 / 无缓存 bounds 路径

本轮结论是：**定义显式的本地缓存预热路径，而不是 full update 路径，也不是静默 `addUpdateBoundTag()` 回退**。

固定规则：

- paint-only dirty rect 的取值对象是当前渲染 owner：
  - 优先取 `glyphHost`
  - 否则取当前 `graphic`
- 若 owner 已有有效 `globalAABBBounds` 缓存，直接用它标脏
- 若缓存不存在或失效，允许走一次显式的 `ensurePaintDirtyBoundsCache(owner)` 本地预热路径：
  - 同步计算并缓存 owner 的 `AABBBounds / globalAABBBounds`
  - 不设置 `UPDATE_BOUNDS`
  - 不调用 `addUpdateBoundTag()`
  - 不向父级传播 bounds 变化
- 对 `shadowRoot`：
  - 如果当前纯视觉更新会影响 shadow 渲染，也要按同样规则预热并标脏 `shadowRoot.globalAABBBounds`
  - 仍然不进入父级 bounds 传播
- `PICK` 在 Phase 2 中不引入独立 tag：
  - 提交阶段显式 piggyback 到 `BOUNDS`
  - 这是 Phase 2 的收尾方案，不代表后续阶段必须长期保留该设计

这一路径的定位是“为了拿到 dirty rect 的局部缓存建立”，不是“geometry/bounds 语义升级”。

### 3. `normalAttrs` deprecated 壳保留程度

本轮结论是：**保留为可读的 deprecated 兼容别名，但不保留旧 snapshot/restore 语义**。

固定要求：

- `graphic.normalAttrs` 仍然应存在并可读
- 它的兼容外观应对齐当前静态 base 真值，推荐实现为 `baseAttributes` 的 deprecated alias/view
- 它不再承担旧的快照、恢复、状态切换备份语义
- 内核不能再依赖它
- 旧测试里凡是断言“状态恢复依赖 normalAttrs”的，都应改写为新真值模型断言
- 只保留“存在、可读、与 base 真值一致、带 deprecated 语义”这类兼容测试

### 4. 执行依据优先级

本轮结论是：**直接以 `D3_PHASE2_EXECUTION_PROMPT.md` 作为最高优先级执行依据**。

优先级如下：

1. `graphic-state-animation-refactor-expectation.md`
2. `D3_PHASE2_EXECUTION_PROMPT.md`
3. `D3_ARCH_DESIGN.md`
4. `D3_PHASE2_IMPLEMENTATION_GUIDE.md`
5. `D3_PHASE2_DEVELOPER_PROMPT.md`

如果后 3 份文档与 execution prompt 存在边角措辞冲突，以 execution prompt 为准。

---

## 已拍板的架构结论

### 1. 静态真值模型

Phase 2 的静态真值固定为：

`baseAttributes + resolvedStatePatch -> attribute`

要求：

- 正式写路径写入 `baseAttributes`
- `resolvedStatePatch` 是唯一 authoritative patch
- `_syncAttribute()` 负责把静态真值同步到稳定对象 `attribute`
- `normalAttrs` 退出核心路径，只保留 deprecated 兼容壳
- `finalAttribute` 只保留为动画目标缓存

### 2. authoritative patch 唯一路径

固定算法：

1. 遍历 `effectiveStates`，顺序是低优先级在前，高优先级在后
2. 为每个状态生成 `statePatch`
3. Phase 2 为兼容 legacy `stateProxy`，接受如下单状态语义：
   - 只要该状态存在 `stateProxy(stateName, effectiveStates)`，该状态的样式贡献就由 proxy **完全决定**
   - 此时不再对同一状态叠加 `definition.patch / definition.resolver(...)`
   - 这不是未来 shared-state 模型的推荐语义，只是 Phase 2 的兼容收口
4. 若未配置 `stateProxy`，单状态内部覆盖顺序固定为：
   - `definition.patch`
   - `definition.resolver(...)`
5. `definition.resolver()` 或 `stateProxy()` 返回 `null / undefined` 表示 skip；在 Phase 2 中，proxy 若返回 nullish，则该状态不回退到静态定义
6. `stateMergeMode === 'deep'` 的深合并发生在 patch 生成阶段
7. `resolveWithCompiled()` 不允许继续留在主路径，只能降级为兼容辅助

### 3. 动画结束恢复唯一契约

唯一允许的恢复动作是：

`_restoreAttributeFromStaticTruth()`

要求：

- `onStop(props)` 不再允许调用 `setAttributes(props)` 进入正式 base 写入路径
- `getFinalAttribute()` 只允许读目标，不允许 `setAttributes(finalAttribute)` 做恢复
- `finalAttribute` 仅作为动画目标缓存
- 动画结束、中断、状态再次变化时，都恢复到“当前 `baseAttributes + resolvedStatePatch`”
- 状态动画目标更新时必须刷新 `finalAttribute`
- 普通业务如果要把动画结果变成新的静态真值，必须显式调用 `setAttribute / setAttributes`，不能借动画恢复路径隐式提交

### 4. paint-only 最小落地机制

Phase 2 固定落地方案：

1. 新增 `UpdateTag.UPDATE_PAINT`
2. 新增 `addUpdatePaintTag()`，只标记当前图元，不向父级传播 bounds
3. 继续复用 `onAttributeUpdate -> AutoRenderPlugin` 调度下一帧
4. 在 `DirtyBoundsPlugin` 上补 `onAttributeUpdate` 承接：若仅有 `UPDATE_PAINT`，按缓存 `globalAABBBounds` 标脏
5. 纯视觉 delta 路径中，不允许静默调用 `addUpdateBoundTag()`

### 5. 正式写路径矩阵

以下已经拍板，不要自行改语义：

正式真值写入，目标层是 `baseAttributes`：

- `setAttribute`
- `setAttributes`
- `_setAttributes`
- `initAttributes`
- `translate / translateTo`
- `scale / scaleTo`
- `rotate / rotateTo`

非正式真值写入：

- `applyStateAttrs`
- `updateNormalAttrs`
- `onStop(props)`
- 状态动画 `jump / noAnimate`

`resolvedStatePatch` 只允许 `StateEngine` 内部重算写入。

---

## 你要修改的主要文件

优先关注：

- `packages/vrender-core/src/graphic/graphic.ts`
- `packages/vrender-core/src/graphic/state/state-engine.ts`
- `packages/vrender-core/src/graphic/state/state-style-resolver.ts`
- `packages/vrender-core/src/graphic/state/state-transition-orchestrator.ts`
- `packages/vrender-core/src/interface/graphic.ts`
- `packages/vrender-core/src/common/enums.ts`
- `packages/vrender-core/src/plugins/builtin-plugin/dirty-bounds-plugin.ts`
- `packages/vrender-core/src/plugins/builtin-plugin/auto-render-plugin.ts`
- `packages/vrender-core/src/graphic/glyph.ts`
- `packages/vrender-animate/src/animate-extension.ts`
- `packages/vrender-animate/src/step.ts`
- `packages/vrender-animate/src/custom/*` 中所有残留 `getFinalAttribute() -> setAttributes(finalAttribute)` 的路径

如有需要可新增：

- `packages/vrender-core/src/graphic/state/attribute-update-classifier.ts`

---

## 实现任务

按这个顺序做：

1. 建立 `baseAttributes + resolvedStatePatch + attribute` 三层模型。
2. 改造 `_syncAttribute()`，让它基于“旧 final result vs 新 final result”生成真实 delta。
3. 收口所有正式写路径到 `baseAttributes`。
4. 将 `useStates / clearStates / invalidateResolver` 切到新主路径。
5. 将 `stateProxy / stateMergeMode` 收口到 `StateEngine` authoritative patch 主路径。
6. 清理 `resolveWithCompiled()` 的主路径职责。
7. 清理 `normalAttrs` 在静态状态恢复中的核心职责。
8. 实现 `_restoreAttributeFromStaticTruth()`，并移除状态路径里的 `setAttributes(finalAttribute)` / `onStop(props)` base commit 语义。
9. 落地 `UPDATE_PAINT`、`addUpdatePaintTag()`、paint-only dirty rect 承接。
10. 新增或重写测试，覆盖真值模型、动画恢复边界、paint-only 分类与禁止回退。

---

## 必须验证的业务场景

### 场景 A

一组柱子默认颜色来自业务数据线性映射。

你必须保证：

- 默认颜色属于 `baseAttributes`
- 状态切换期间默认映射值不会被污染
- 清状态后恢复的是默认映射结果，而不是某次状态动画终点

### 场景 B

选中态颜色来自另一套映射，清除选中后必须恢复默认映射结果。

你必须明确验证：

- 动画结束后选中色不会写回 `baseAttributes`
- 清除选中后恢复链路是：状态移除 -> patch 重算 -> `_restoreAttributeFromStaticTruth()` / `_syncAttribute()`
- 如果只改 `fill / opacity`，不进入 bounds 慢路径
- 如果新增 `stroke` 或修改 `lineWidth`，进入 `bounds/pick` 慢路径

---

## 过程留档要求

开发过程中，重要内容不能只停留在聊天记录里。你必须同步维护：

`/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE2_IMPLEMENTATION_LOG.md`

至少在以下时机更新：

1. 完成一个主任务时
2. 发现与设计不一致的代码现实时
3. 做出实现级取舍时
4. 遇到 blocker 或阶段性风险时
5. 完成一次关键验证时

每次留档至少写清：

- 时间
- 背景/问题
- 结论
- 影响文件
- 是否影响两个硬性验收条件
- 验证结果或待验证项

不要只写“已完成”这类低信息量记录。

---

## 你提交前必须自证的事项

请不要只说“我改完了”，你必须给出自证结果：

1. 哪些文件改了，分别承担什么职责。
2. authoritative patch 主路径是否已经完全脱离 `resolveWithCompiled()`。
3. 是否已清除所有 `setAttributes(finalAttribute)` 恢复路径。
4. `onStop(props)` 是否已从状态路径的 base commit 通道中移除。
5. 是否已实现 `UPDATE_PAINT` 和 `addUpdatePaintTag()`。
6. paint-only 路径是否不存在任何静默 `addUpdateBoundTag()` 回退。
7. 哪些测试新增或改写了，覆盖了哪些边界。
8. 过程留档是否已更新，更新了哪些关键条目。
9. 跑了哪些验证命令，结果是什么。

---

## 最低验证要求

至少执行并汇报这些：

1. `rush compile -t @visactor/vrender-core`
2. 状态相关单测
3. 新增专项测试，至少覆盖：
   - 属性分层与状态恢复
   - `stateProxy / stateMergeMode`
   - 动画结束不污染 base
   - paint-only 与 geometry 分类
   - 禁止回退：不得残留 `setAttributes(finalAttribute)` / `onStop(props)` base commit 路径
   - 禁止回退：纯视觉 delta 不得静默走 `addUpdateBoundTag()`

---

## 何时必须停下来反馈

以下情况不要自行降级，先停下来反馈：

1. 发现 `stateProxy/stateMergeMode` 无法并入新 patch 主路径。
2. 发现 paint-only 必须静默回退到 `addUpdateBoundTag()` 才能工作。
3. 发现状态动画恢复必须保留 `setAttributes(finalAttribute)` 或 `onStop(props)` base commit 才能工作。
4. 发现 Phase 1 现有实现与本轮拍板边界直接冲突，且无法局部修复。

---

## 你的输出格式

请按下面格式回复协调者：

1. `Implementation summary`
2. `Files changed`
3. `Documentation updates`
4. `Verification`
5. `Residual risks`

要求：

- 先说是否满足两个硬性验收条件
- 如果任一条件不满足，直接说明 blocker，不要包装成“基本完成”
- 明确引用你更新过的实现留档文档
- 不要把关键架构判断再抛回给协调者
