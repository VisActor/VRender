# D3 Phase 2 实现任务文档 — 属性分层与核心路径收口

> **目标读者**：资深开发者
> **面向文档**：`D3_ARCH_DESIGN.md`（v1.9）
> **阶段**：Phase 2 — 属性分层 + 核心路径收口
> **状态**：已执行，Phase 2 已 closed

---

## 文档使用说明

本文档是 Phase 2 的直接执行依据。Phase 2 已不再是“最小桥接版属性分层”，而是要在本阶段完成**静态状态真值主路径切换**，确保后续 Phase 3/4 建立在正确的真值模型上。

开始实现前请先阅读：

1. `docs/refactor/state-engine/graphic-state-animation-refactor-expectation.md`
2. `docs/refactor/state-engine/D3_ARCH_DESIGN.md`（v1.9）
3. 本文档完整内容

---

## Phase 2 目标

Phase 2 完成后，VRender 的静态状态真值必须正式收敛到：

```typescript
baseAttributes（Layer 1）
resolvedStatePatch（Layer 2）
attribute（Layer 3，稳定对象身份）
```

核心含义：

1. `setAttribute / setAttributes / 内部正式写路径` 写入 `baseAttributes`
2. `StateEngine` 输出唯一可信的 `resolvedStatePatch`
3. `_syncAttribute()` 将 `baseAttributes + resolvedStatePatch` 原地同步到 `attribute`
4. 状态切换、resolver 失效、动画结束恢复都回到当前静态真值
5. 纯视觉状态切换不能无条件退化为 `bounds` 更新

这 5 条之外，再补 2 条硬约束：

1. “固化进默认真值” 在 Phase 2 中一律禁止：
   - 状态色、hover 色、selected 色和状态动画目标都不能写回 `baseAttributes`
   - 禁止路径包括 `setAttribute / setAttributes`、`onStop(props)`、`getFinalAttribute() -> setAttributes(finalAttribute)`、动画结束回写
2. bounds 是否重算由真实属性变化决定：
   - `fill / opacity / shadowColor` 等纯视觉变化不能统一打 `bounds`
   - `stroke / lineWidth / shadowBlur` 等真实影响包围盒或 pick 的变化必须进入相应慢路径

---

## 执行前补充澄清

### 澄清 1：普通动画的“结束提交”也一并取消

Phase 2 不是只切掉状态动画的结束提交，而是切掉所有动画的隐式 end-commit-to-base 语义。

固定结论：

- `setAttributes(finalAttribute)` 这类动画结束恢复路径不允许进入成品
- `onStop(props) -> setAttributes(props)` 这类路径不允许进入成品
- `animate.to(...)` 结束后不再自动把终值提交为新的静态真值
- 若业务要固化动画终值，必须显式调用 `setAttribute / setAttributes`

### 澄清 2：paint-only 的冷启动路径

当 `globalAABBBounds` 缓存不存在或失效时，不允许静默回退到 `addUpdateBoundTag()`。

固定结论：

- 定义显式的本地缓存预热路径，例如 `ensurePaintDirtyBoundsCache(owner)`
- owner 取 `glyphHost ?? graphic`
- 该路径只建立 dirty rect 所需的 bounds 缓存，不表示 geometry/bounds 语义升级
- 不设置 `UPDATE_BOUNDS`
- 不调用 `addUpdateBoundTag()`
- 不向父级传播 bounds 变化
- 若存在 `shadowRoot` 且纯视觉更新会影响其渲染，也按同样规则预热并标脏 `shadowRoot`

### 澄清 3：`normalAttrs` 的兼容边界

`normalAttrs` 在 Phase 2 中保留为可读的 deprecated 兼容别名，但不保留旧 snapshot/restore 语义。

固定结论：

- `graphic.normalAttrs` 仍然应存在并可读
- 推荐实现为 `baseAttributes` 的 deprecated alias/view
- 内核不能再依赖它
- 历史测试里，凡是断言它承担状态恢复职责的，都应改写

### 澄清 4：执行依据优先级

本轮直接以 `D3_PHASE2_EXECUTION_PROMPT.md` 作为最高优先级执行依据。

若实现指南与开发者 prompt 存在边角措辞冲突，以 execution prompt 为准。

---

## 已确认的架构决策

### 决策 1：Phase 2 扩围

Phase 2 不仅做属性分层，还要完成**核心路径收口**。不能保留 `normalAttrs + applyStateAttrs` 作为静态状态主路径，再额外叠一层 `baseAttributes`。

### 决策 2：`normalAttrs`

`normalAttrs` 退出静态状态核心路径，仅保留 deprecated 兼容壳。

约束：

- 不再作为 source of truth
- 不再承担 snapshot/restore 主语义
- 允许 break change，但如果保留兼容壳，兼容壳也不能重新把旧逻辑拉回核心路径

### 决策 3：`finalAttribute`

`finalAttribute` 不在 Phase 2 删除，但必须收缩为**动画层目标缓存**。

约束：

- `finalAttribute` 不是静态状态真值
- 不能参与 `baseAttributes` 写入
- 动画 tick 可继续直接写 `attribute`
- 动画结束时必须恢复当前静态真值，不能把 `finalAttribute` 反写进 `baseAttributes`

### 决策 4：写入时机

Phase 2 采用**立即同步**：

- 每次 `setAttribute / setAttributes / 正式内部写路径` 都触发 `_syncAttribute()`
- 正确性优先，批量/延迟同步留给 Phase 4

### 决策 5：性能优先前移

更新分类与 paint-only 提交语义前移到 Phase 2。

约束：

- `submitUpdateByKeys()` / `submitUpdateByDelta()` / `UpdateCategory` 属于 Phase 2 范围
- 纯视觉状态切换不能继续无条件调用 `addUpdateBoundTag()`
- 分帧调度仍留在 Phase 4

### 决策 6：authoritative patch 算法拍板

`resolvedStatePatch` 是唯一 authoritative patch。固定算法如下：

1. 遍历 `effectiveStates`（低优先级在前，高优先级在后）
2. 为每个状态生成 `statePatch`
3. Phase 2 为兼容 legacy `stateProxy`，接受如下单状态语义：
   - 只要该状态存在 `stateProxy(stateName, effectiveStates)`，该状态的样式贡献就由 proxy **完全决定**
   - 此时不再对同一状态叠加 `definition.patch / definition.resolver(...)`
   - 这不是未来 shared-state 模型的推荐语义，只是 Phase 2 的兼容收口
4. 若未配置 `stateProxy`，单状态内部覆盖顺序固定为：
   - `definition.patch`
   - `definition.resolver(...)`
5. `definition.resolver()` 或 `stateProxy()` 返回 `null / undefined` 时按 skip 处理；在 Phase 2 中，proxy 若返回 nullish，则该状态不回退到静态定义
6. `stateMergeMode === 'deep'` 的深合并发生在 patch 生成阶段
7. `resolveWithCompiled()` 降级为 deprecated 兼容辅助，不再允许作为主路径步骤

### 决策 7：动画结束恢复契约拍板

Phase 2 唯一允许的恢复动作是 `_restoreAttributeFromStaticTruth()`。

固定约束：

1. `onStop(props)` 不再允许调用 `setAttributes(props)` 进入正式 base 写入路径
2. `finalAttribute` 只作为动画目标缓存，不是静态真值
3. 状态动画目标更新时必须刷新 `finalAttribute`
4. 动画结束、中断、状态再次变化时，恢复依据永远是“当前 `baseAttributes + resolvedStatePatch`”

### 决策 8：paint-only 最小落地机制拍板

Phase 2 的最小机制固定为：

1. 新增 `UpdateTag.UPDATE_PAINT`
2. 新增 `addUpdatePaintTag()`，只标记当前图元，不向父级传播 bounds 变化
3. 继续复用 `onAttributeUpdate -> AutoRenderPlugin` 调度下一帧
4. 在 `DirtyBoundsPlugin` 上补 `onAttributeUpdate` 承接：若仅有 `UPDATE_PAINT`，直接按缓存 `globalAABBBounds` 标脏
5. paint-only 路径不允许静默降级回 `addUpdateBoundTag()`；若存在无缓存 bounds 的冷启动场景，必须定义独立冷启动路径并单独测试
6. `PICK` 在 Phase 2 中不引入独立 tag；提交阶段显式 piggyback 到 `BOUNDS`

---

## Phase 2 不做什么

以下内容不在 Phase 2 范围：

- Group `sharedStateDefinitions` / Theme `stateDefinitions`
- 分帧状态调度（`PerformanceRAF.wait()` / `StateBatchScheduler`）
- 外部业务上下文自动追踪
- Morph 能力重构
- 动画系统整体重写
- `Glyph` 专属状态语义继续扩张；`Glyph` 在 Phase 2 只跟随主路径切换，Phase 3 再决定是否并回统一状态主路径

---

## 实施文件范围

### 必改文件

| 文件 | 责任 |
|------|------|
| `packages/vrender-core/src/graphic/graphic.ts` | 属性分层主实现、状态主路径切换、动画恢复边界 |
| `packages/vrender-core/src/graphic/state/state-engine.ts` | authoritative patch 计算、stateProxy/stateMergeMode 收口 |
| `packages/vrender-core/src/graphic/state/state-style-resolver.ts` | 清理旧桥接依赖，保留必要兼容辅助 |
| `packages/vrender-core/src/graphic/state/state-transition-orchestrator.ts` | 状态动画目标边界、`finalAttribute` 维护 |
| `packages/vrender-core/src/interface/graphic.ts` | `baseAttributes`、deprecated 兼容语义、内部能力声明 |
| `packages/vrender-core/src/common/enums.ts` | 如需要，补充 paint-only 提交语义支持 |
| `packages/vrender-core/src/graphic/glyph.ts` | 跟随 `Graphic` 主路径切换，避免保留旧恢复逻辑 |
| `packages/vrender-animate/src/animate-extension.ts` | `finalAttribute` 读取/恢复契约调整 |

### 建议新增文件

| 文件 | 责任 |
|------|------|
| `packages/vrender-core/src/graphic/state/attribute-update-classifier.ts` | `UpdateCategory`、`ATTRIBUTE_CATEGORY`、按 key 分类提交工具 |

### 必测文件

| 文件 | 说明 |
|------|------|
| `packages/vrender-core/__tests__/unit/graphic/graphic-state.test.ts` | 主流程回归 |
| `packages/vrender-core/__tests__/unit/graphic/state-resolution.test.ts` | `stateProxy/stateMergeMode` 语义 |
| `packages/vrender-core/__tests__/unit/graphic/state-transition-orchestrator.test.ts` | 动画边界 |
| `packages/vrender-core/__tests__/unit/graphic/normal-attrs.test.ts` | deprecated 兼容壳更新 |
| `packages/vrender-core/__tests__/unit/graphic/state-performance.test.ts` | 不回退到旧 snapshot 模型 |
| `packages/vrender-core/__tests__/unit/graphic/attribute-layer-core.test.ts` | 新增：属性分层与真值恢复专项测试 |
| `packages/vrender-core/__tests__/unit/graphic/state-update-category.test.ts` | 新增：delta 分类与 paint-only 提交 |
| `packages/vrender-core/__tests__/unit/graphic/state-animation-boundary.test.ts` | 新增：动画结束不污染 base 的边界测试 |

---

## 正式写路径矩阵

以下矩阵在 Phase 2 已拍板，不留给开发者临场判断：

| 路径 | 写入层 | 是否正式真值写入 | 是否允许临时 bypass | 实施要求 |
|------|--------|------------------|---------------------|----------|
| `setAttribute` | `baseAttributes` | 是 | 否 | 写后立即 `_syncAttribute()` |
| `setAttributes` | `baseAttributes` | 是 | 否 | 写后立即 `_syncAttribute()` |
| `_setAttributes` | `baseAttributes` | 是 | 否 | 内部正式写入口，不得再直写 `attribute` |
| `initAttributes` | `baseAttributes` + 初次 `_syncAttribute()` | 是 | 否 | 初始化必须建立 base 真值 |
| `translate / translateTo` | `baseAttributes` | 是 | 否 | 变换路径正式收口到 base |
| `scale / scaleTo` | `baseAttributes` | 是 | 否 | 同上 |
| `rotate / rotateTo` | `baseAttributes` | 是 | 否 | 同上 |
| `applyStateAttrs` | `attribute` + `finalAttribute` | 否 | 是 | 仅保留动画桥接/兼容语义 |
| `updateNormalAttrs` | `normalAttrs` | 否 | 是 | 仅 deprecated 兼容壳 |
| `onStop(props)` | `attribute`（通过 `_restoreAttributeFromStaticTruth()`） | 否 | 是 | 禁止 `setAttributes(props)` 提交到 base |
| 状态动画 `jump / noAnimate` 写入 | `attribute` + `finalAttribute` | 否 | 是 | 仅临时接管展示，不得污染 base |
| `resolvedStatePatch` 重算 | `resolvedStatePatch` | 否 | 否 | 只允许 `StateEngine` 内部写入 |

---

## 实施任务

### Task 1：建立属性分层基元

**目标**：在 `Graphic` 上建立 `baseAttributes + resolvedStatePatch + attribute` 三层模型和 `_syncAttribute()` 真值同步机制。

**必须完成**：

1. 新增 `baseAttributes`
2. 新增 `_syncAttribute()`，返回真实 delta（至少能拿到 key 的 `prev/next`）
3. delta 比较必须基于“旧 final result vs 新 final result”
4. 删除 key 必须进入 delta
5. `attribute` 保持稳定对象身份

**验收标准**：

- `attribute` 始终等价于 `baseAttributes + resolvedStatePatch`
- patch 消失后，被覆盖的 key 会正确回退到 `baseAttributes`
- `clearStates()` 后 `attribute` 与 `baseAttributes` 一致
- `submitUpdateByKeys()` 或等价提交逻辑可以基于真实 delta 做 value-aware 分类

### Task 2：收口所有正式写路径到 base 层

**目标**：把正式属性写语义统一收敛到 `baseAttributes`，禁止静态真值继续直接写 `attribute`。

**必须完成**：

1. 修改 `setAttribute`
2. 修改 `setAttributes`
3. 修改 `_setAttributes`
4. 修改 `initAttributes`
5. 按写路径矩阵改造 `translate / translateTo / scale / scaleTo / rotate / rotateTo`

**约束**：

- 不能只改公开 API，不改内部正式写路径
- 动画 tick 直接写 `attribute` 允许保留，但必须被标记为“动画临时接管”
- `applyStateAttrs / updateNormalAttrs / onStop(props)` 不得再偷偷进入 base 写入路径

**验收标准**：

- 静态属性写入不再直接写 `attribute`
- `onBeforeAttributeUpdate` 仍按原语义执行
- 现有 transform 路径不出现“attribute 变了但 base 没变”的静态真值分裂

### Task 3：收口 patch 主路径，解决 `stateProxy/stateMergeMode`

**目标**：让 `resolvedStatePatch` 成为唯一 authoritative patch，不能再依赖旧 `StateStyleResolver` 桥接来补齐主结果。

**必须完成**：

1. 将 `stateProxy fully decides per-state contribution` 明确收口到 Phase 2 主路径
2. 明确这只是 legacy `stateProxy` 兼容语义，不是未来 shared-state 模型的推荐语义
3. 将 nullish skip 明确落在 patch 生成阶段
4. 将 `stateMergeMode === 'deep'` 落在 patch 生成阶段，而不是 `_syncAttribute()` 阶段
5. 让 `resolvedStatePatch` 反映最终 patch 结果，而不是“编译 patch 的半成品”
6. 将 `resolveWithCompiled()` 降级为兼容辅助，不再允许主路径依赖

**关键风险**：

当前仓库中，`stateProxy` 在 compiled path 下仍依赖 `resolveWithCompiled()` 做二次合并。如果不把这一层并入新主路径，Phase 2 切主路径后会直接破坏兼容语义。

**验收标准**：

- `graphic.resolvedStatePatch` 可直接作为 `_syncAttribute()` 的 patch 输入
- `stateProxy fully decides` 语义与 nullish skip 行为在代码、测试、文档中一致
- 深合并模式与现有测试基线一致
- `resolveWithCompiled()` 不再出现在状态主流程的必经路径上

### Task 4：切换静态状态主路径

**目标**：让 `useStates / clearStates / invalidateResolver` 直接驱动新真值模型，而不是继续走 `normalAttrs` 恢复模型。

**必须完成**：

1. `useStates()`：
   - `StateEngine` 求得 `activeStates/effectiveStates/resolvedStatePatch`
   - `_syncAttribute()` 同步
   - 无动画路径直接提交结果
2. `clearStates()`：
   - 清空 `resolvedStatePatch`
   - `_syncAttribute()` 恢复 `baseAttributes`
3. `invalidateResolver()`：
   - 重新求 patch
   - `_syncAttribute()` 同步
4. `Graphic` 与 `Glyph` 的状态路径都要跟进

**约束**：

- `updateNormalAttrs()` / `applyStateAttrs()` 不能再承担无动画静态状态主路径
- `currentStates/effectiveStates/resolvedStatePatch` 必须在切换后保持可读、可调试

**验收标准**：

- 无动画状态切换不依赖 `normalAttrs`
- 清状态时恢复来自 `baseAttributes`，而不是旧 snapshot
- resolver 失效后结果立即可读
- `clearStates()` 后不会残留旧 `finalAttribute` 或旧状态 patch 对结果的污染

### Task 5：收缩旧兼容层

**目标**：保留必要兼容，但把旧模型明确降级为边界层。

**必须完成**：

1. `normalAttrs`：
   - 退出核心逻辑
   - 作为 deprecated 兼容壳保留
   - 不再承诺旧 snapshot 语义
2. `finalAttribute`：
   - 只作为动画目标缓存
   - 不参与静态状态真值和恢复
3. `applyStateAttrs` / `updateNormalAttrs` / `getNormalAttribute`：
   - 若仍保留，只允许承担动画桥接职责

**验收标准**：

- 内核不再依赖 `normalAttrs` 做状态恢复
- `finalAttribute` 不会被误当作 `baseAttributes`
- 旧接口存在时，其语义在文档和测试中被明确收缩

### Task 6：重定义动画边界与动画结束恢复

**目标**：确保动画系统与新真值模型兼容，尤其避免“动画结束把 final result 写进 base”。

**必须完成**：

1. 将 `Graphic.onStop(props)` 固定改为状态路径恢复入口，不再走 `setAttributes(props)`
2. 清理 `vrender-animate` 中所有 `getFinalAttribute() -> setAttributes(finalAttribute)` 恢复路径
3. 落地 `_restoreAttributeFromStaticTruth()`，作为动画结束/中断/状态再次变化时的唯一恢复动作
4. 维护 `finalAttribute` 生命周期：仅保存当前动画目标，恢复后按受控 key 清理
5. 状态动画与自驱动画结束后，结果必须回到**当前**静态真值

**业务场景校验**：

- 柱子默认颜色来自原始数据映射
- 选中颜色来自另一套映射
- 清除选中后，必须回到默认映射结果，不能因为动画结束而把选中色写进 `baseAttributes`

**验收标准**：

- 动画结束不污染 `baseAttributes`
- 状态切换过程中目标更新时，动画仍服从当前静态真值
- `finalAttribute` 仍可供动画逻辑读取目标，但不是持久真值
- `onStop(props)` 不再是隐式 base commit 通道
- 成品代码中不允许残留 `setAttributes(finalAttribute)` 恢复路径

### Task 7：落地更新分类与 paint-only 提交语义

**目标**：把性能关键的分类提交前移到 Phase 2，避免静态状态切换统一走重路径。

**必须完成**：

1. 实现 `UpdateCategory`
2. 实现按真实 delta 的分类能力，支持 value-aware key（如 `stroke / shadowBlur`）
3. 实现 `submitUpdateByKeys()` 或等价 `submitUpdateByDelta()`
4. 为 paint-only 场景提供独立提交语义
5. 新增 `UpdateTag.UPDATE_PAINT`、`addUpdatePaintTag()` 及其清理逻辑
6. 在 `DirtyBoundsPlugin` 上落地 paint-only dirty rect 承接

**约束**：

- 不能继续“无论什么 key 都打 `addUpdateBoundTag()`”
- `addUpdatePaintTag()` 不得向父级传播 bounds 变化
- 不允许在 paint-only 路径中静默降级到 `addUpdateBoundTag()`
- 若存在无缓存 bounds 的初始化场景，必须定义独立冷启动处理，不得伪装成 paint-only
- 如果渲染管线无法支持 paint-only dirty 语义，这是 Phase 2 blocker，不允许无声降级

**验收标准**：

- 纯视觉状态切换不向父级传播 bounds 更新
- 几何/transform/layout/pick 变化仍按原重路径提交
- 分类逻辑由真实 delta 驱动，而不是由状态列表变化驱动
- `fill / opacity` 与 `stroke / lineWidth / shadowBlur` 的分类差异有专项测试
- 成品代码中不存在“纯视觉 delta -> `addUpdateBoundTag()`”的静默回退

### Task 8：重建测试与验证基线

**目标**：用新真值模型重写测试基线，明确哪些旧语义被保留、哪些被主动移除。

**必须覆盖**：

1. `baseAttributes` 写入与状态覆盖/恢复
2. patch 消失 key 回退
3. `stateProxy` 优先级与 deep merge
4. `normalAttrs` deprecated 兼容壳
5. `finalAttribute` 仅作为动画目标缓存
6. 动画结束不污染 base
7. paint-only 与 geometry 分类

**最低验证命令**：

```bash
source ~/.nvm/nvm.sh && nvm use 20.19.6 >/dev/null && rush compile -t @visactor/vrender-core
source ~/.nvm/nvm.sh && nvm use 20.19.6 >/dev/null && ./node_modules/.bin/jest --config jest.config.js --runInBand __tests__/unit/graphic/graphic-state.test.ts
source ~/.nvm/nvm.sh && nvm use 20.19.6 >/dev/null && ./node_modules/.bin/jest --config jest.config.js --runInBand __tests__/unit/graphic/state-resolution.test.ts __tests__/unit/graphic/state-transition-orchestrator.test.ts
```

---

## Phase 2 完成定义

只有同时满足以下条件，Phase 2 才算完成：

1. 静态状态真值主路径已切换到 `baseAttributes + resolvedStatePatch -> attribute`
2. `normalAttrs` 已退出核心逻辑
3. `finalAttribute` 不再污染 `baseAttributes`
4. `stateProxy/stateMergeMode` 兼容语义已并入新 patch 主路径
5. paint-only 提交语义已经落地，而不是文档占位
6. `rush compile` 与状态相关测试通过
7. 成品代码中不存在残留的 `setAttributes(finalAttribute)` / `onStop(props)` base commit 路径
8. `PICK` 在 Phase 2 中已显式 piggyback 到 `BOUNDS`，没有悬空分类
8. paint-only 成品实现不存在静默降级回 `addUpdateBoundTag()` 的路径

---

## 明确禁止

以下做法在 Phase 2 中视为未完成，而不是“后续优化”：

- 新增 `baseAttributes`，但无动画状态仍靠 `normalAttrs` 恢复
- 保留 `resolveWithCompiled()` 作为主结果必需桥接，却把 `resolvedStatePatch` 当最终 patch 使用
- 继续允许动画结束通过 `setAttributes(finalAttribute)` 把最终值写入 base
- 继续允许 `onStop(props)` 通过 `setAttributes(props)` 把状态动画终点写入 base
- 把 paint-only 提交继续降级成 `addUpdateBoundTag()` 占位
- 在纯视觉 delta 路径里保留任何静默 `addUpdateBoundTag()` 回退

---

**文档版本**：v2.2
**创建时间**：2026-04-07
**最后更新**：2026-04-07
**状态**：待评审
