# D3 Phase 1 开发者沟通 Prompt — 状态引擎内核

> **目标读者**：资深开发者
> **沟通目的**：基于重构期望文档和 Phase 1 实现任务文档，执行状态引擎内核的实现
> **文档状态**：待开发

---

## 📋 背景

### 重构期望文档（必须先读）

本次重构的根本指导文档是 `graphic-state-animation-refactor-expectation.md`（位于同一目录下）。它定义了重构的**目标、边界、场景和约束**，是所有实现决策的最终参照。

**核心要点（供快速参考）**：

1. **核心目标**：图元自己管理自己的静态展示状态真值；外部只声明状态，不手工拼接样式
2. **重构范围**：静态展示状态（hover/selected/disabled/业务自定义态）+ 状态过渡动画
3. **不包含**：appear/update/exit/highlight 等动画生命周期状态、morph 能力本身、incremental draw 整体重写
4. **属性分层**：`baseAttributes` + `resolvedStatePatch` → `attribute`
5. **Breaking change**：`graphic.attribute.fill = 'red'` 直接赋值不再可靠，推荐 `setAttribute`
6. **exclude vs suppress**：exclude = 从 activeStates 移除（不自动恢复）；suppress = 保留在 activeStates 但不进入 effectiveStates
7. **性能策略**：纯视觉状态切换保持快路径，几何/bounds/pick 变化走慢路径但不影响默认路径
8. **共享状态定义**：优先放在 Group/Theme，避免单图元重复持有
9. **状态与动画边界**：静态状态真值是 source of truth；过渡动画服从真值；自驱动画结束后回到真值
10. **resolver**：单状态黑盒，给定图元上下文计算 patch；不进入 render/animation/pick/bounds tick；不自动追踪业务上下文变化

### D3 架构设计文档（必须参考）

`D3_ARCH_DESIGN.md`（v1.6）是对期望文档的完整工程落地方案。

**Phase 1 涉及的章节**：
- 第 1 部分（背景与核心目标）
- 第 2 部分（状态模型）：activeStates/effectiveStates、priority/rank、exclude/suppress
- 第 3 部分（状态解析与 resolver）
- 第 4 部分（实施计划 Phase 1）

### Phase 1 实现任务文档（直接执行依据）

`D3_PHASE1_IMPLEMENTATION_GUIDE.md`（同一目录下）是 Phase 1 的完整实现规范，包含 10 个实施步骤，每步都有验收标准。详细代码示例、伪代码、测试矩阵见该文档。

---

## 🎯 Phase 1 任务概要

Phase 1 交付一个新的状态引擎内核，提供以下能力：

| 能力 | 说明 |
|------|------|
| `activeStates` / `effectiveStates` | Flat state model |
| priority + rank 排序 | 内核统一决定状态应用顺序 |
| exclude / suppress 裁决 | 互斥和压制语义 |
| StateDefinition 编译器 | 简写格式归一化、传递闭包预计算 |
| 单状态 resolver | 给定图元上下文计算 patch |
| resolver 显式失效 | `invalidateResolver()` |

### Phase 1 边界（不做什么）

以下**不在 Phase 1 范围内**，由后续 Phase 处理：

- **属性分层**（Phase 2）：`baseAttributes` / `resolvedStatePatch` / `_syncAttribute()` / `setAttribute` 语义收敛
- **共享状态定义**（Phase 3）：Group `sharedStateDefinitions` / Theme `stateDefinitions`
- **性能优化**（Phase 4）：影响分类精细化 / 分帧状态提交 / delta diff
- **PAINT 独立提交路径**（Phase 4）：当前 `submitUpdate()` 中的 UpdateTag 路径暂不变动

### Phase 1 对外兼容要求

Phase 1 结束后，以下公开接口**必须保持完全兼容**：

- `graphic.states: StateDefinitionsInput<T>` — 逐条状态允许简写/完整格式混用
- `graphic.useStates(['hover'])` — 行为不变，结果由新引擎计算
- `graphic.addState/removeState/toggleState/clearStates` — 行为不变
- `graphic.stateProxy` — 仍可工作
- `graphic.stateSort` — 仍可工作
- `graphic.stateMergeMode` — 仍可工作

### Phase 1 公开类型决策

**`graphic.states` 的类型改为 `StateDefinitionsInput<T>`**（逐条状态允许简写/完整格式混用）。

决策理由：
- StateEngine 内核已支持完整格式，开放公开类型是"API 诚实"而非"能力未就绪"
- TypeScript 联合类型扩展是加法，Phase 2 属性分层时类型变化是扩展（加 `baseAttributes`），不是破坏性修改
- 推后到 Phase 2 再开放等于用类型断言绕过检查，开发者负担相同但时间更晚
- 下游包（vrender-components 等）需要配合做一轮类型适配，属于预期内成本

### Phase 1 内部不改动

- `setAttribute` / `setAttributes` / `_setAttributes` / `initAttributes` 的实现**完全不改动**
- `normalAttrs` / `finalAttribute` / `applyStateAttrs` / `updateNormalAttrs` 的逻辑**完全不改动**
- 现有 `state-model.ts` 的公开方法**外部调用签名不变**
- 现有 `state-style-resolver.ts` 的 `resolve()` 方法**完全不动**

---

## 🔧 实施步骤总览

```
Step 1: state-definition.ts（新建，类型定义）
  ↓
Step 2: state-definition-compiler.ts（新建，依赖 Step 1）
  ↓
Step 3: state-engine.ts（新建，依赖 Step 1+2）
  ↓
Step 4: state-model.ts（修改，依赖 Step 1+2+3）
  ↓
Step 5: state-style-resolver.ts（修改，依赖 Step 1）
  ↓
Step 6: interface/graphic.ts（修改，依赖 Step 1）
  ↓
Step 7: graphic.ts（修改，依赖 Step 1-6）
  ↓
Step 8: graphic/index.ts（修改，依赖 Step 1-3）
  ↓
Step 9: 单元测试（新建，依赖 Step 1-3）
  ↓
Step 10: 现有测试适配（依赖 Step 7+8）
```

详细步骤、代码示例、验收标准见 `D3_PHASE1_IMPLEMENTATION_GUIDE.md`。

---

## 📚 参考文档

| 文档 | 说明 |
|------|------|
| `graphic-state-animation-refactor-expectation.md` | **必须先读**，重构目标/边界/约束 |
| `D3_ARCH_DESIGN.md`（v1.6） | 完整工程落地方案 |
| `D3_PHASE1_IMPLEMENTATION_GUIDE.md` | **直接执行依据**，10 步详解 |

### 参考代码

| 文件 | 行号 | 内容 |
|------|------|------|
| `graphic.ts` | 305 | `declare states?: Record<string, Partial<T>>;` — 改为 `StateDefinitionsInput<T>` |
| `graphic.ts` | 733 | `setAttributes(...)` — Phase 1 不改动 |
| `graphic.ts` | 748 | `_setAttributes(...)` — Phase 1 不改动 |
| `graphic.ts` | 767 | `setAttribute(...)` — Phase 1 不改动 |
| `graphic.ts` | 1045 | `createStateModel()` — 需增强 |
| `graphic.ts` | 1136 | `clearStates(...)` — 需增强 |
| `graphic.ts` | 1174 | `useStates(...)` — 需增强 |
| `graphic.ts` | 1205 | `addUpdateBoundTag()` — Phase 1 不改动 |
| `state-model.ts` | 全文 | 需增强，委托 StateEngine |
| `state-style-resolver.ts` | 全文 | 需新增 resolveWithCompiled |

---

## ❓ 常见问题

### Q: Phase 1 resolver 的 `baseAttributes` 到底传什么值？

A: Phase 1 resolver 的 `baseAttributes` 传现有 `stateResolveBaseAttrs`：
```typescript
const stateResolveBaseAttrs = this.normalAttrs ?? ((this as any).finalAttribute ?? this.attribute)
```
这是当前 `useStates` 流程中已有的解析基准，不是 Phase 2 的"基础属性真值"（Phase 2 会引入真正的 `baseAttributes` 并与 `normalAttrs` 解耦）。

### Q: 为什么 state-model.ts 要保留"旧路径"作为零改动分支？

A: 通过"有 stateEngine 走新路径，无 stateEngine 走旧路径"的分支设计实现平滑过渡。现有代码路径完全不感知 StateEngine 的存在。

### Q: resolver 的 `graphic` 字段为什么 Phase 1 用 `any`？

A: 直接引用 `IGraphic<T>` 会产生循环依赖。Phase 2 中 `baseAttributes` 明确后可以通过 `StateResolveContext` 中传递必要的上下文来消除循环依赖，Phase 1 不做此优化。

### Q: 为什么 exclude/suppress 裁决在倒序遍历时要做索引调整？

A: 因为 `splice` 会改变数组长度。如果被 exclude 的项在当前索引之前，则当前正在处理的索引也需要相应前移一位，否则会跳过一个元素。

---

## ❓ 需要开发者最终回答的问题清单

1. **`baseAttributes` 传值时机**：已确认 Phase 1 使用现有 `stateResolveBaseAttrs = normalAttrs ?? finalAttribute ?? attribute`。具体实现是在 `Graphic` 层调用 `recomputePatch` 时传入，不是 StateEngine 层 placeholder。请确认实现位置在 `graphic.ts` 的 `useStates` 流程中。

2. **环形依赖的运行时处理**：如果 A exclude B 且 B exclude A，当前裁决算法会让双方都保留对方在 exclude 中（只警告不抛错）。你是否有更好的处理策略？或者接受当前方案？

3. **resolver 的 `graphic` 引用**：Phase 1 中 `StateResolveContext.graphic` 是 `any`。在 `Graphic` 层集成 StateEngine 时，直接传 `this` 即可（Phase 1 不解决循环依赖类型问题）。请确认不会有运行时副作用。

4. **下游类型适配策略**：`graphic.states` 类型已决定改为 `StateDefinitionsInput<T>` 联合类型。请评估 vrender-components / vrender-kits 等下游包的适配工作量，给出具体的修改范围估算。

5. **性能考量**：你对 `recomputePatch` 中 resolver 缓存的实现有什么优化建议？当前的 Map 缓存是否足够？

---

## 📊 实施计划参考

| 阶段 | 内容 | 预估 |
|------|------|------|
| Phase 1 | 状态引擎内核 | ★★★☆☆ |
| Phase 2 | 属性分层 | ★★★★☆ |
| Phase 3 | 共享状态定义 | ★★☆☆☆ |
| Phase 4 | 性能优化 | ★★★☆☆ |

---

**沟通完成后**，请将你的回答整理成文档，标注需要架构设计师确认的技术决策点。

如果实现过程中发现架构设计与实现有偏差，请在实现前提出，不要在实现中自行决定。
