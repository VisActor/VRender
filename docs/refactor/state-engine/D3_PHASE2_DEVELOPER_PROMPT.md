# D3 Phase 2 开发者沟通 Prompt — 属性分层与核心路径收口

> **目标读者**：资深开发者
> **沟通目的**：基于 Phase 1 完成状态，执行扩围后的 Phase 2
> **设计基线**：`D3_ARCH_DESIGN.md`（v1.9） + `D3_PHASE2_IMPLEMENTATION_GUIDE.md`（v2.2）
> **状态**：已可执行

---

## 背景

Phase 1 已完成并通过验证，当前已具备：

- `StateDefinition<T>` / `CompiledStateDefinition<T>`
- `StateDefinitionCompiler`
- `StateEngine`（`activeStates / effectiveStates / resolvedPatch / resolver cache`）
- `StateModel` 增强
- `graphic.effectiveStates` / `graphic.resolvedStatePatch`
- `graphic.invalidateResolver()`

Phase 2 已由架构侧重新定界，不再是“最小桥接版属性分层”，而是要在本阶段完成**静态状态真值主路径切换**。

---

## Phase 2 最终目标

把静态状态真值正式收敛到：

```typescript
baseAttributes + resolvedStatePatch -> attribute
```

完成后必须满足：

1. 静态状态正式写路径写入 `baseAttributes`
2. `resolvedStatePatch` 成为唯一 authoritative patch
3. `_syncAttribute()` 原地同步最终结果
4. 状态切换/清除/resolver 失效都回到当前静态真值
5. 纯视觉状态切换具备 paint-only 提交语义
6. 状态色/动画目标不得固化进 `baseAttributes`

---

## 已确认的决策

以下不是开放讨论项，默认按此执行：

### 1. `normalAttrs`

- 退出静态状态核心路径
- 只保留 deprecated 兼容壳
- 不再承诺旧 snapshot/restore 语义

### 2. `finalAttribute`

- 保留，但仅作为动画层目标缓存
- 不再参与静态状态真值
- 不允许反写到 `baseAttributes`

### 3. 写入时机

- `setAttribute / setAttributes / 正式内部写路径` 立即触发 `_syncAttribute()`
- Phase 2 先保证正确性与主路径收口

### 4. 性能范围

- `UpdateCategory` / `submitUpdateByKeys()` / `submitUpdateByDelta()` / paint-only 提交语义纳入 Phase 2
- 分帧调度仍留在 Phase 4

### 5. authoritative patch 算法

- `resolvedStatePatch` 是唯一 authoritative patch
- 单状态内部覆盖顺序固定为：`definition.patch -> definition.resolver -> stateProxy`
- 同名 `stateProxy` 覆盖同名静态 `states`
- `definition.resolver()` 或 `stateProxy()` 返回 `null / undefined` 表示 skip；返回 patch 对象后，对象内 key 按字面参与 patch
- `stateMergeMode === 'deep'` 在 patch 生成阶段完成
- `resolveWithCompiled()` 不再允许留在主路径

### 6. 动画结束恢复契约

- 唯一恢复动作是 `_restoreAttributeFromStaticTruth()`
- `onStop(props)` 不允许再调用 `setAttributes(props)` 提交到 base
- `getFinalAttribute()` 只允许读目标，不允许 `setAttributes(finalAttribute)` 做恢复
- `finalAttribute` 仅作为动画目标缓存
- Phase 2 成品中不能残留任何 `setAttributes(finalAttribute)` 恢复路径

### 7. 正式写路径矩阵

以下结论已经拍板：

- `setAttribute / setAttributes / _setAttributes / initAttributes / translate / scale / rotate` 都属于正式真值写入，目标层是 `baseAttributes`
- `applyStateAttrs / updateNormalAttrs / onStop(props) / 状态动画 jump/noAnimate` 都不是正式真值写入
- `resolvedStatePatch` 只允许 `StateEngine` 内部重算写入

### 8. 四个执行前澄清

- 普通动画的隐式 end-commit-to-base 语义也一并取消，不只针对状态动画
- paint-only 的冷启动路径必须是显式本地缓存预热路径，不能静默回退到 `addUpdateBoundTag()`
- `normalAttrs` 保留为可读的 deprecated alias/view，不再保留旧 snapshot/restore 语义
- 本轮执行以 `D3_PHASE2_EXECUTION_PROMPT.md` 为最高优先级依据

---

## 你需要完成的任务

请严格按 [D3_PHASE2_IMPLEMENTATION_GUIDE.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE2_IMPLEMENTATION_GUIDE.md) 执行。核心任务如下：

1. 在 `Graphic` 上建立 `baseAttributes`、`_syncAttribute()` 和真实 delta 计算
2. 收口 `setAttribute / setAttributes / _setAttributes / initAttributes` 以及正式内部写路径
3. 收口 `stateProxy / stateMergeMode`，让 `resolvedStatePatch` 成为最终 authoritative patch
4. 切换 `useStates / clearStates / invalidateResolver` 到新静态真值主路径
5. 让 `normalAttrs` 退出核心逻辑，只保留 deprecated 兼容壳
6. 收缩 `finalAttribute` 为动画目标缓存，改造动画结束恢复语义
7. 落地 `UpdateCategory` 和 paint-only 提交路径
8. 重写相关测试基线

---

## 三个必须优先解决的风险点

### 风险 1：`stateProxy` 兼容语义

当前 compiled path 下，`stateProxy` 仍依赖 `StateStyleResolver.resolveWithCompiled()` 做二次合并。  
Phase 2 切主路径时，不能丢失以下语义：

- `stateProxy` 覆盖静态 `states`
- nullish skip
- `stateMergeMode === 'deep'` 深合并
- `resolveWithCompiled()` 从主路径退出后语义仍完全闭环

### 风险 2：动画结束污染 base

当前存在多处：

```typescript
getFinalAttribute() -> setAttributes(finalAttribute)
```

在新模型下，这会把“状态覆盖后的最终值”错误写进 `baseAttributes`。  
必须改造成“恢复 `attribute` 到当前静态真值”，而不是“把动画终点提交到 base”。

另外，`onStop(props)` 也不能再作为隐式 base commit 通道。

### 风险 3：paint-only 路径失真

当前底层没有现成的 `addUpdatePaintTag()` 公共能力。  
Phase 2 不能简单继续用 `addUpdateBoundTag()` 占位。

要求：

- 为 paint-only 更新建立独立提交语义
- `addUpdatePaintTag()` 不得向父级传播 bounds 变化
- `DirtyBoundsPlugin` 必须有承接点
- 纯视觉 delta 路径不能静默回退到 `addUpdateBoundTag()`
- 如果现有渲染管线无法支撑，这是 blocker，必须先反馈，不要默默降级

---

## 关键业务校验场景

请在实现和测试时始终对照以下场景：

### 场景 A：默认色来自数据映射

一组柱子图形，默认颜色来自业务数据的线性映射。  
这意味着默认颜色属于 `baseAttributes` 或其上游业务真值，而不是状态切换时临时生成的终值。

### 场景 B：选中色来自另一套映射

选中状态的颜色与原始颜色相关，但使用另一套映射表。  
清除选中后，图形必须恢复默认映射结果，不能因为动画结束或状态恢复流程把选中色固化为新的 base。

额外要求：

- 如果选中/取消选中只改 `fill / opacity`，不应进入 bounds 慢路径
- 如果选中态新增 `stroke` 或加粗 `lineWidth`，必须进入 `bounds/pick` 慢路径

---

## 实现边界

以下事情你可以做：

- 改 `graphic.ts`、`state-engine.ts`、`state-transition-orchestrator.ts`
- 适度清理 `state-style-resolver.ts` 的职责
- 改 `vrender-animate` 的恢复边界
- 新增更新分类辅助文件和专项测试

以下事情这次不要做：

- 引入 Group/Theme 共享状态定义
- 做分帧状态调度
- 借机整体重写动画系统

---

## 提交前必须确认

在你准备提交实现前，请确保以下问题都有明确答案：

1. `resolvedStatePatch` 是否已经是最终 patch，而不是半成品？
2. `clearStates()` 后 `attribute` 是否来自 `baseAttributes`，而不是 `normalAttrs`？
3. 动画结束是否存在任何把 `finalAttribute` 或动画终点写回 `baseAttributes` 的路径？
4. `onStop(props)` 是否已经从状态路径的 base commit 通道中移除？
5. 纯视觉状态切换是否还会无条件触发 `bounds` 更新？
6. `stroke / lineWidth / shadowBlur` 是否能按真实属性变化进入慢路径？
7. `stateProxy` 与 `deep merge` 相关测试是否通过？
8. 成品代码中是否已经清除所有 `setAttributes(finalAttribute)` 恢复调用？
9. paint-only 路径是否不存在任何静默 `addUpdateBoundTag()` 回退？

---

## 何时必须先停下来反馈

如果你遇到以下任一情况，不要自行降级范围，先反馈：

1. 发现 `stateProxy/stateMergeMode` 无法并入新 patch 主路径
2. 发现动画恢复语义必须大规模重写 `vrender-animate` 才能成立
3. 发现当前渲染管线根本无法支撑 paint-only 提交语义

---

## 验证要求

最低要求：

- `rush compile -t @visactor/vrender-core`
- 状态相关单测通过
- 新增专项测试覆盖：
  - 属性分层与状态恢复
  - 动画结束不污染 base
  - paint-only 与 geometry 分类

---

**执行原则**：不要追求“中间过程优雅”，但必须保证最终真值模型正确，且不能牺牲性能优先级。  
**如果实现过程中发现 Phase 1 代码与 Phase 2 新边界冲突，请先提出，不要自行缩小 Phase 2 范围。**
