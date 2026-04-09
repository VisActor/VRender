# D3 架构设计文档 - VRender 图形状态引擎重构

> **文档类型**：架构设计文档
> **负责人**：架构设计师（Claude）
> **审核者**：总监与协调者
> **版本**：v1.12
> **创建时间**：2026-04-04
> **状态**：Phase 2 已 closed，Phase 3 已 closed，Phase 4 已 closed

---

## 📋 文档变更记录

| 版本 | 日期 | 作者 | 变更内容 | 审核状态 |
|------|------|------|----------|----------|
| v1.0 | 2026-04-04 | 架构设计师 | 基于期望文档重写，v3 替代之前所有 D2 版本 | ⏸️ 待审核 |
| v1.1 | 2026-04-04 | 架构设计师 | 修订 6 处原则性问题：attribute 语义（_syncAttribute）、exclude/suppress 裁决顺序、resolver 缓存策略、API 边界收口、PerformanceRAF.wait 明确为新增能力 | ⏸️ 待审核 |
| v1.2 | 2026-04-05 | 架构设计师 | 修正 2 个高优先级矛盾（直接赋值不再保证、onBeforeAttributeUpdate 伪代码）和 2 个低优先级文案（computed view 描述、裁决注释） | ⏸️ 待审核 |
| v1.3 | 2026-04-05 | 架构设计师 | 修订 7 项：①纯视觉快路径（_syncAttribute 不无条件打 bounds tag，精确 delta 分类）②patch 消失 key 回退（clearStates 后 attribute 与 baseAttributes 一致）③状态动画目标改为 final result ④实例同名状态移出核心路径 ⑤集合归一化去重 ⑥attribute 折中明说 ⑦伪代码重复调用修正 | ⏸️ 待审核 |
| v1.4 | 2026-04-06 | 架构设计师 | 二轮修订 5 项：①真实 delta 模型（affectedKeys 改为旧值/新值对比，含删除 key）②resolver 业务显式失效机制（invalidateResolver API + 失效后步骤链）③消除实例级状态定义前后矛盾（总览图移除实例层）④isPaintOnly 改为基于 affectedKeys+ATTRIBUTE_CATEGORY 完整分类判定 ⑤伪代码自洽（UpdateCategory bitflag 读法、resolver 签名统一、clearStates 返回值闭合） | ⏸️ 待审核 |
| v1.5 | 2026-04-06 | 架构设计师 | 三轮修订 4 项：①PAINT 独立提交路径（submitUpdate 中 PAINT 不映射到 addUpdateBoundTag，新增 addUpdatePaintTag 语义）②_syncAttribute 真实 delta 修正（先完整计算新目标值，再与旧 attribute 逐 key 对比，避免中间态误报）③resolver 场景 paint-only 判定补齐运行时约束（含 resolver 且未声明稳定 affectedKeys 时保守判定为非 paint-only）④全文旧语义清扫（流程图 Step 6-7 重写、总览图 resolver 触发时机补全、clearStates changed 语义修正） | ⏸️ 待审核 |
| v1.6 | 2026-04-06 | 架构设计师 | 实现前补全：①submitUpdate() 补充 PICK 分支（addUpdatePickTag），使分类模型与提交逻辑完全一致②resolver 稳定 affectedKeys 正式协议（declaredAffectedKeys 字段、StateDefinition 声明来源、编译阶段合并、默认语义为 affectedKeys 空集） | ⏸️ 待审核 |
| v1.7 | 2026-04-07 | 架构设计师 | Phase 2 扩围收口：①Phase 2 从“属性分层”升级为“属性分层 + 核心路径收口”②`normalAttrs` 退出静态状态核心路径，降级为 deprecated 兼容壳③`finalAttribute` 收缩为动画目标缓存，不再参与静态真值④`stateProxy/stateMergeMode` 并入新 patch 主路径⑤更新分类与 paint-only 提交语义前移至 Phase 2 ⑥动画结束恢复语义改为回到当前静态真值，不再把 final result 反写入 base | ⏸️ 待审核 |
| v1.8 | 2026-04-07 | 架构设计师 | 总监 review 收口：①authoritative patch 唯一路径写死（含 `stateProxy` 覆盖顺序、nullish skip、deep merge 位置、`resolveWithCompiled()` 降级）②动画结束恢复唯一契约写死③paint-only 最小落地机制绑定现有 `UpdateTag / onAttributeUpdate / AutoRenderPlugin / DirtyBoundsPlugin`④正式写路径矩阵拍板⑤补充业务场景 A/B 校验 | ⏸️ 待审核 |
| v1.9 | 2026-04-07 | 架构设计师 | 放行条件收口：①Phase 2 成品不得残留 `setAttributes(finalAttribute)` / `onStop(props)` base commit 路径②paint-only 不得静默降级回 `addUpdateBoundTag()`，冷启动路径必须显式定义 | ⏸️ 待审核 |
| v1.10 | 2026-04-07 | 实现 agent | Phase 2 close-out：①文档正式接受 `stateProxy fully decides per-state contribution`，并明确仅作为 legacy compatibility 语义②`PICK` 在 Phase 2 明确 piggyback 到 `BOUNDS`，不引入独立 pick tag③Phase 2 状态改为 closed，`Glyph` 明确列为 Phase 3 输入 | ✅ 已关闭 |
| v1.11 | 2026-04-08 | 架构设计师 | Phase 3 状态同步：①shared-state 主路径实现并通过架构复核②新增 Phase 3 close-out prompt 与最终验收模板③总览状态、README 与 Phase 3 文档状态同步到 `closed` | ✅ 已评审通过 |
| v1.12 | 2026-04-09 | 实现 agent | Phase 4 close-out：①性能优化主路径已实现并通过架构复核②新增 Phase 4 close-out prompt 与最终验收模板③总览状态、README 与 Phase 4 文档状态同步到 `closed` | ✅ 已关闭 |

---

## 📋 背景

本架构设计基于 `graphic-state-animation-refactor-expectation.md` 中的期望文档，要求 VRender 建立以"图元静态状态真值模型"为核心的全新状态引擎。

**与之前 D2 的本质区别**：之前 D2 只聚焦"states 携带 animation 配置"，本架构要求重建状态引擎内核，包括属性分层、状态优先级/排除/压制语义、共享状态定义、性能快慢路径等多个维度。

---

## 🎯 重构目标

### 核心目标

建立以**图元静态状态真值模型**为核心的状态引擎：

1. **图元自己管理自己的静态展示状态**，外部只声明状态，不手工拼接状态样式
2. **统一的状态优先级和冲突裁决模型**（priority/rank/exclude/suppress）
3. **共享状态定义优先**放在 Group/Theme 层，避免单图元重复持有
4. **属性分层**：`baseAttributes` + `resolvedStatePatch` → `attribute`（synchronized final attribute object，语义等价于 computed result，但承载方式是稳定对象）
5. **写语义统一收敛**到 `setAttribute`/`setAttributes`，不再支持直接赋值（`graphic.attribute.fill = 'red'` 行为不再可靠）
6. **快慢路径分离**：纯视觉状态切换保持快路径，几何状态切换走慢路径但不影响默认路径
7. **动画边界清晰**：静态状态真值与状态过渡动画分离

### 不在重构范围内的内容

- `appear`/`update`/`exit`/`highlight` 等动画生命周期状态
- morph 能力本身
- 现有 incremental draw 机制的整体重写
- 状态与动画的大一统重写
- `Glyph` 专属状态语义继续扩张；Phase 2 仅保证它跟随主路径回到正确真值，Phase 3 再决定是否并回统一状态主路径

---

## 📐 核心概念模型

### 1. 属性分层

当前问题：所有属性（base 样式、state 覆盖、动画中间值）都写在同一个 `attribute` 对象中。

目标架构引入三层属性：

```typescript
// Layer 1: baseAttributes
// 业务通过 setAttribute / setAttributes 写入的真值
// 由图元独立持有，不与其他图元共享
baseAttributes: T;

// Layer 2: resolvedStatePatch
// effectiveStates 解析出的合并 patch
// 由状态引擎计算，是状态系统对 baseAttributes 的增量覆盖
resolvedStatePatch: Partial<T>;

// Layer 3: attribute
// 对外暴露的最终生效属性，语义 = baseAttributes + resolvedStatePatch
// attribute 保留为稳定对象身份，不是只读 getter
// 通过 _syncAttribute() 原地同步计算结果
attribute: T;
```

**重要**：保留 `attribute` 的稳定对象身份，不引入 Proxy/defineProperty 拦截。大量现有代码（动画层 step.ts、transform 路径等）直接依赖 `attribute` 是可变对象。修订方案通过 `_syncAttribute` 私有同步机制实现属性分层。

**直接赋值语义**：D3 架构不再保证 `graphic.attribute.fill = 'red'` 直接赋值的可靠行为，推荐使用 `setAttribute('fill', 'red')`。不引入任何拦截机制来兼容直接赋值。

### 2. 状态定义

每个状态定义包含以下最小信息：

```typescript
interface StateDefinition<T> {
  /** 状态名称 */
  name: string;
  /** 优先级，数值越大优先级越高，裁决时高优先级状态生效 */
  priority?: number;
  /** 编译后的稳定顺序，用于同优先级时的二级排序 */
  rank?: number;
  /** 状态 patch，即该状态对 baseAttributes 的覆盖 */
  patch?: Partial<T>;
  /** 状态 resolver，单状态黑盒，给定图元上下文计算 patch */
  resolver?: (ctx: StateResolveContext) => Partial<T> | void;
  /** resolver 返回的稳定 key 集（可选）；用于编译期 paint-only 判定 */
  declaredAffectedKeys?: Set<string>;
  /** 互斥列表，进入此状态时自动移除列表中的状态 */
  exclude?: string[];
  /** 压制列表，进入此状态时该状态保留在 activeStates 但不进入 effectiveStates */
  suppress?: string[];
}
```

**与当前 `states` 格式的兼容性**：
- 当前 `states: { hover: { fill: 'red' } }` 为简写格式
- 新格式中 `{ fill: 'red' }` 等同于 `{ patch: { fill: 'red' } }`（无 resolver、无优先级、无互斥）
- 解析器自动将简写格式归一化为完整 `StateDefinition`

### 3. 状态集合

```typescript
// activeStates：归一化后的真实激活状态集合
// 包含被 suppress 的状态，不包含被 exclude 移除的状态
activeStates: ReadonlyArray<string>;

// effectiveStates：真正参与样式求值的状态集合
// 是 activeStates 的子集，不包含被 suppress 的状态
effectiveStates: ReadonlyArray<string>;
```

### 4. 状态解析

```typescript
// resolvedStatePatch = merge(baseAttributes, effectiveStates[0].patch, effectiveStates[1].patch, ...)
// 按 effectiveStates 顺序从低到高依次覆盖
// 高优先级状态后应用，覆盖低优先级
resolvedStatePatch: Partial<T>;
```

### 5. 状态迁移语义

| 语义 | activeStates | effectiveStates | 说明 |
|------|-------------|----------------|------|
| 进入状态 A | 包含 A | A 不被 A.suppress 则包含 A | |
| `exclude` 列表 | 互斥状态被移除 | 移除后不受 A 影响 | 不自动恢复 |
| `suppress` 列表 | 压制状态保留 | 不参与 patch 计算 | A 退出后恢复 |

### 6. 排序规则与裁决顺序

**裁决总原则**：先排序，再裁决。高优先级状态对低优先级状态生效。

状态顺序由内核统一决定，不再依赖调用方传入顺序：

```typescript
// 排序 comparator：
// priority 大的排后面（高优先级 → 覆盖低优先级）
// priority 相同时，rank 小的排后面
// 返回负数表示 a 排在前，返回正数表示 a 排在后
// 所以 "a 在前，b 在后" = "a 的最终结果被 b 覆盖"
sort(activeStates): activeStates.sort((a, b) => {
  const defA = this.compiledDefinitions.get(a);
  const defB = this.compiledDefinitions.get(b);
  const pA = defA?.priority ?? 0;
  const pB = defB?.priority ?? 0;
  if (pA !== pB) {
    return pA - pB;   // pA 小 → a 排在前 → b 覆盖 a（高 priority 覆盖低 priority）
  }
  return (defA?.rank ?? 0) - (defB?.rank ?? 0);  // rank 小 → a 排在前 → b 覆盖 a
});
```

**裁决执行顺序**（在排序完成后，从高到低依次裁决）：
1. 当前状态 S 的 `exclude[]` 中的任何状态都从候选集移除
2. 当前状态 S 的 `suppress[]` 中的任何状态标记为 suppressed
3. 遍历完成后，`effectiveStates = activeStates - suppressed`

**exclude/suppress 传递闭包**：在编译阶段预计算好传递闭包（消除环形依赖），运行时不做 while 循环。

**不自动恢复**：被 exclude 移除的状态在排斥方消失后不自动恢复。

---

## 📐 架构设计

### 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                    External (VChart)                          │
│  调用 graphic.useStates(['hover']) / addState() / removeState() │
│  不再手工拼接样式，只声明状态                                  │
│  外部 API 边界：useStates / addState / removeState /          │
│  toggleState / clearStates（applyState 是内部方法名）          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    State Definition Layer                     │
│  状态定义来源：                                                │
│  1. Group/Theme 共享状态定义模板（核心路径）                   │
│  2. 单状态 resolver（可读取业务上下文，处理实例级差异）         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 State Definition Compiler                      │
│  编译状态定义为稳定中间产物：                                   │
│  - 合并同来源的多个状态定义                                    │
│  - 展开简写格式为完整 StateDefinition                          │
│  - 预计算 exclude/suppress 传递闭包（编译阶段，无 while 循环）   │
│  - 排序并分配 rank                                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    State Engine Kernel                        │
│  管理：                                                       │
│  - baseAttributes（setAttribute 写入）                       │
│  - activeStates / effectiveStates（currentStates 保持兼容）   │
│  - resolvedStatePatch                                        │
│  - 版本号 / 脏标记                                           │
│  执行（内部）：                                                │
│  - _applyStateInternal() / removeState() / toggleState() 等  │
│  - 追加 → 排序（编译后闭包）→ 裁决（按排序后顺序）→ patch 重算  │
│  - _syncAttribute() 同步 → updateTag 提交                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    State Patch Resolver                       │
│  输入：baseAttributes + effectiveStates                       │
│  输出：resolvedStatePatch                                    │
│  规则：                                                       │
│  - 按 effectiveStates 顺序（已排序）依次应用 patch            │
│  - 支持 shallow/deep merge                                   │
│  - resolver 黑盒参与单状态 patch 计算（结果仅当前图元持有）      │
│  - 触发时机：状态集合变化 / 共享定义变化 / 业务显式失效           │
│  - 不进入 render/animation/pick/bounds tick                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Attribute Sync Layer                       │
│  attribute = baseAttributes + resolvedStatePatch（原地同步）    │
│  保留 attribute 的稳定对象身份                                  │
│  _syncAttribute() 将计算结果原地同步回 attribute 对象           │
│  用于 render / pick / layout / animation 等所有读取路径       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   State Transition Animator                    │
│  状态过渡动画服务静态状态切换                                  │
│  - 接收目标：新的 final result（attribute 最终值）              │
│  - 分析 animate/jump 属性差异                                 │
│  - 执行过渡动画                                              │
│  - 状态再次变化时，目标跟随新的 final result 更新/重启/中断    │
│  - 自驱动画结束后控制权回到当前状态真值                       │
└─────────────────────────────────────────────────────────────┘
```

### 状态迁移流程

```
useStates(['hover', 'selected'])
           │
           ▼
┌──────────────────────────────────────┐
│ Step 1: 追加新状态到候选集             │
│ activeStates 候选 = ['hover', 'selected']│
└──────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│ Step 2: 编译阶段预计算的 exclude/suppress 闭包        │
│ → 查 CompiledStateDefinition.exclude[] 和 suppress[]  │
│ → 运行时不做 while 循环                │
└──────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│ Step 3: 按 priority 降序 + rank 升序排序            │
│ sort(['hover', 'selected'], ...)     │
│ → 排序后: ['hover'(low), 'selected'(high)]│
└──────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│ Step 4: 从高到低依次执行裁决（按排序后顺序）          │
│ selected (high) 的 exclude/suppress → 候选集裁剪   │
│ hover (low) 的 exclude/suppress → 候选集裁剪         │
│ 结果: activeStates = 裁剪后候选集    │
│ suppressed = 被 suppress 标记的状态集合│
│ effectiveStates = activeStates - suppressed│
└──────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│ Step 5: 按排序顺序从低到高应用 patch            │
│ patch = merge(base, hover.patch, selected.patch)│
│ → effectiveStates[0](low) 先应用，      │
│   effectiveStates[last](high) 后应用   │
│ → high 覆盖 low                       │
└──────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│ Step 6: _syncAttribute() 原地同步    │
│ → 先计算新目标值 = base + patch      │
│ → 再与旧 attribute 逐 key 对比       │
│ → 生成真实 delta（key -> prev/next） │
│ → 将新目标值写入 attribute 对象      │
│ → 版本号递增                         │
└──────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│ Step 7: Delta 分类 & Commit          │
│ → 基于真实 delta 做 value-aware 分类 │
│ → 仅纯视觉 key 走 PAINT              │
│ → `stroke/lineWidth/shadowBlur` 等按 │
│   真实属性变化进入 bounds/pick 慢路径│
│ → PAINT 走独立视觉快路径             │
│ → SHAPE/BOUNDS/TRANSFORM/LAYOUT 走慢路径│
│ → 仅 delta 不为空时提交              │
└──────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│ Step 8: 动画（如果有 hasAnimation）    │
│ → 目标 = 新的 final result（attribute 值）│
│ → 动画服从静态状态真值               │
│ → 状态再次变化时，目标跟随更新       │
└──────────────────────────────────────┘
```

---

## 🔧 关键子系统设计

### 1. 属性分层子系统

#### 核心原则

**保留 `attribute` 的稳定对象身份**。大量现有代码（动画层 step.ts、transform 路径、`setAttributes(this.target.attribute)` 等）直接依赖 `attribute` 是可变对象。将 `attribute` 改为 Proxy/getter 风格的只读 computed view 会与这些路径产生根本性冲突。

修订方案：通过 `_syncAttribute()` 私有同步机制实现属性分层，`attribute` 始终是稳定对象。

**工程折中说明**：保留 `attribute` 的稳定可变对象身份是基于以下工程考量的折中决策：
- 大量现有代码（动画层 step.ts、transform 路径等）直接依赖 `attribute` 是可变对象，改为只读/受控视图会产生根本性冲突
- `attribute` 仍表示最终属性视图，但直接写入不是保障路径，推荐通过 `setAttribute` 写入
- 这一折中意味着 `graphic.attribute.fill = 'red'` 不再被保证，但不引入拦截机制以避免性能损失
- 后续迭代可考虑逐步迁移到更严格的受控视图模式

#### Phase 2 执行策略

Phase 2 不再是“只加一层 `baseAttributes` 的最小桥接改造”，而是**静态状态真值主路径正式切换**：

- 静态状态主路径统一收敛为 `baseAttributes + resolvedStatePatch -> attribute`
- `useStates / clearStates / invalidateResolver` 的无动画路径不再依赖 `normalAttrs` 快照恢复
- `stateProxy / stateMergeMode` 的兼容语义必须并入新的 patch 计算主路径，不能继续依赖旧桥接逻辑兜底
- `normalAttrs` 仅保留 deprecated 兼容壳，不再承担 source of truth
- `finalAttribute` 仅保留为动画层目标缓存，不再参与静态状态解析、恢复和写语义
- 动画结束后的恢复动作必须回到**当前静态真值**，不能将 `finalAttribute` 或动画终点反写进 `baseAttributes`

#### Phase 2 闭环约束

- **“固化进默认真值” 的准确定义**：状态色、hover 色、selected 色和其他状态动画目标，不能通过 `setAttribute / setAttributes`、`onStop(props)`、`getFinalAttribute() -> setAttributes(finalAttribute)` 或任何动画结束钩子写回 `baseAttributes`
- **bounds 是否重算由真实属性变化决定**：只改 `fill / opacity / shadowColor` 等纯视觉属性时，不得因为“发生了状态切换”就统一打 `bounds`；改了 `stroke / lineWidth / shadowBlur` 等会真实影响包围盒或 pick 结果的属性时，必须进入相应慢路径

#### _syncAttribute 机制

```typescript
class Graphic<T> {
  // Layer 1: baseAttributes
  // setAttribute 写入的真值，状态系统不可覆盖
  baseAttributes: T = {} as T;

  // Layer 2: resolvedStatePatch
  // 状态引擎计算的当前 patch
  get resolvedStatePatch(): Partial<T> {
    return this.stateEngine.resolvedPatch;
  }

  // Layer 3: attribute
  // 稳定对象，通过 _syncAttribute() 原地同步计算结果
  attribute: T = {} as T;

  // 私有同步方法：将 baseAttributes + resolvedStatePatch 同步到 attribute
  // 语义：attribute 始终等价于 baseAttributes + resolvedStatePatch
  // 不生成新对象，直接写入现有 attribute 对象
  // 返回本次同步的真实 delta（旧 final result vs 新 final result 对比）
  //
  // 关键：
  // 1. resolvedStatePatch 自身已经是 authoritative patch
  //    - shallow 模式：每个 key 的最终覆盖值
  //    - deep 模式：已在 patch 生成阶段吸收 base/低优先级 patch 后的完整嵌套值
  // 2. _syncAttribute 只负责“最终视图同步 + delta 生成”，不再承担 state merge
  private _syncAttribute(): Map<string, { prev: unknown; next: unknown }> {
    const delta = new Map<string, { prev: unknown; next: unknown }>();

    // 1. 保存旧 final result 快照（当前 attribute 的全部 key 和值）
    const oldSnapshot: Record<string, any> = {};
    for (const key in this.attribute) {
      oldSnapshot[key] = (this.attribute as any)[key];
    }

    // 2. 计算完整的新目标值：baseAttributes + resolvedStatePatch
    //    先写 base，再写 patch 覆盖同名 key
    const newTarget: Record<string, any> = {};
    for (const key in this.baseAttributes) {
      newTarget[key] = (this.baseAttributes as any)[key];
    }
    for (const key in this.resolvedStatePatch) {
      newTarget[key] = (this.resolvedStatePatch as any)[key];
    }

    // 3. 对比旧 final result 与新目标值，生成真实 delta
    const allKeys = new Set<string>();
    for (const key in oldSnapshot) { allKeys.add(key); }
    for (const key in newTarget) { allKeys.add(key); }

    for (const key of allKeys) {
      const inOld = key in oldSnapshot;
      const inNew = key in newTarget;
      if (inOld && inNew) {
        // 新旧都有：值不同才算 delta
        if (oldSnapshot[key] !== newTarget[key]) {
          delta.set(key, { prev: oldSnapshot[key], next: newTarget[key] });
        }
      } else {
        // 新增 key 或被删除的 key：一定是 delta
        delta.set(key, { prev: oldSnapshot[key], next: newTarget[key] });
      }
    }

    // 4. 将新目标值写入 attribute（原地更新，保持对象身份稳定）
    // 先清除旧 key
    for (const key in oldSnapshot) {
      if (!(key in newTarget)) {
        delete (this.attribute as any)[key];
      }
    }
    // 写入新值
    for (const key in newTarget) {
      (this.attribute as any)[key] = newTarget[key];
    }

    // 5. 版本号递增
    this._attributeVersion++;

    return delta;
  }
}
```

#### 写路径

```typescript
// setAttribute / setAttributes 统一写入 baseAttributes
// 然后调用 _syncAttribute() 同步到 attribute
// onBeforeAttributeUpdate 语义与现有实现保持一致：
//   - 返回空/falsy → 走默认写入路径
//   - 返回对象 → 用返回对象替代参数写入
setAttribute(key: string, value: any, context?: ISetAttributeContext) {
  const params = this.onBeforeAttributeUpdate?.({ [key]: value }, this.attribute, key, context);
  if (params == null) {
    // 返回空值：走默认写入路径
    (this.baseAttributes as any)[key] = value;
  } else {
    // 返回对象：用返回对象替代参数
    (this.baseAttributes as any)[key] = (params as any)[key];
  }

  // 同步到 attribute，返回本次涉及的 key
  const delta = this._syncAttribute();

  // 精确提交通知：基于真实修改的 key 做影响分类
  this.submitUpdateByDelta(delta);
}

setAttributes(params: Partial<T>, context?: ISetAttributeContext) {
  const resolved = this.onBeforeAttributeUpdate?.(params, this.attribute, null, context);
  const toWrite = (resolved != null) ? resolved : params;

  // 批量写入 base 层
  for (const key in toWrite) {
    (this.baseAttributes as any)[key] = (toWrite as any)[key];
  }

  // 同步到 attribute
  const delta = this._syncAttribute();

  // 精确提交通知
  this.submitUpdateByDelta(delta);
}

// submitUpdateByDelta：基于真实 delta 做影响分类，精确设置 updateTag
// 既看 key，也看 prev/next 值，保证 bounds/pick 是否重算由真实属性变化决定
private submitUpdateByDelta(delta: Map<string, { prev: unknown; next: unknown }>): void {
  let category: UpdateCategory = 0;
  for (const [key, entry] of delta) {
    category |= classifyAttributeDelta(key, entry.prev, entry.next);
  }
  this.submitUpdate(category);
}
```

#### 正式写路径矩阵

| 路径 | 写入层 | 是否正式真值写入 | 是否允许临时 bypass | Phase 2 结论 |
|------|--------|------------------|---------------------|--------------|
| `setAttribute` | `baseAttributes` | 是 | 否 | 统一正式入口，写入后立即 `_syncAttribute()` |
| `setAttributes` | `baseAttributes` | 是 | 否 | 统一正式入口，批量写入后立即 `_syncAttribute()` |
| `_setAttributes` | `baseAttributes` | 是 | 否 | 内部正式入口，不再直接写 `attribute` |
| `initAttributes` | `baseAttributes` + 初次 `_syncAttribute()` | 是 | 否 | 初始化静态真值，不保留“只初始化 attribute”的旧语义 |
| `translate / translateTo` | `baseAttributes` | 是 | 否 | 变换属于静态真值写入，不能只改 `attribute` |
| `scale / scaleTo` | `baseAttributes` | 是 | 否 | 同上 |
| `rotate / rotateTo` | `baseAttributes` | 是 | 否 | 同上 |
| `applyStateAttrs` | `attribute` + `finalAttribute` | 否 | 是 | 降级为动画桥接/兼容壳，不得写 `baseAttributes` |
| `updateNormalAttrs` | `normalAttrs` | 否 | 是 | 仅 deprecated 兼容壳，核心路径不得依赖 |
| `onStop(props)` | `attribute`（通过 `_restoreAttributeFromStaticTruth()`） | 否 | 是 | 不允许再走 `setAttributes(props)` 正式 base 写入路径 |
| 状态动画 `jump / noAnimate` 写入 | `attribute` + `finalAttribute` | 否 | 是 | 允许临时接管展示，但不得污染 `baseAttributes` |
| `resolvedStatePatch` 重算 | `resolvedStatePatch` | 否（它是状态层 authoritative patch） | 否 | 仅允许由 `StateEngine` 内部重算写入 |

**拍板结论**：

- `onStop(props)` 不再是正式静态真值写入口；状态切换和状态动画结束后唯一允许的恢复动作是 `_restoreAttributeFromStaticTruth()`
- 如果普通业务动画希望在动画结束后把结果变成新的静态真值，必须显式调用 `setAttribute / setAttributes`；不能借 `onStop(props)` 隐式提交
- `applyStateAttrs / updateNormalAttrs` 可以保留一段兼容期，但只能作为边界层存在，任何无动画静态状态切换都不得再依赖它们

#### 读路径

```typescript
// attribute 仍然是稳定的可变对象
// render / pick / animation 等直接读取 this.attribute 即可
// 无需做任何路径修改

// 单属性读取优化（可选）
getComputedAttribute(name: string): any {
  // resolvedStatePatch 有缓存，直接查
  if (name in this.resolvedStatePatch) {
    return (this.resolvedStatePatch as any)[name];
  }
  // 再查 baseAttributes
  if (name in this.baseAttributes) {
    return (this.baseAttributes as any)[name];
  }
  // 最后查 theme defaults
  return this.getDefaultAttribute(name);
}
```

#### 直接赋值的处理

D3 架构**不再保证** `graphic.attribute.fill = 'red'` 直接赋值的可靠行为。

- 推荐使用 `setAttribute('fill', 'red')`
- 不引入任何拦截机制（Proxy/defineProperty）
- 外部直接修改 attribute 的行为不进入保障范围
- 现有代码（如 step.ts:174）直接修改 attribute 的路径在 D3 中仍可工作，但属于非推荐路径

#### 兼容层收口

- `normalAttrs`：退出静态状态核心路径，仅保留 deprecated 兼容壳；不再保证旧的 snapshot/restore 语义
- `finalAttribute`：仅表示动画层维护的目标属性缓存；它可以与 `attribute` 共存，但不是静态状态真值的一部分
- `applyStateAttrs` / `updateNormalAttrs`：Phase 2 后只允许作为动画桥接或过渡兼容逻辑存在，不能继续作为静态状态切换主路径
- `onStop(props)` / `getFinalAttribute() -> setAttributes(finalAttribute)` 这类动画结束恢复路径必须改造，避免把状态覆盖后的最终值错误写入 `baseAttributes`

#### 动画结束恢复唯一契约

Phase 2 不再允许“动画结束把最终值提交回静态真值”这类隐式协议。唯一允许的恢复动作如下：

```typescript
private _restoreAttributeFromStaticTruth(context = { type: AttributeUpdateType.ANIMATE_END }): void {
  // 1. 丢弃动画结束 props 作为 base 输入的资格
  // 2. 读取当前 baseAttributes
  // 3. 读取当前 resolvedStatePatch（可能已因中途状态变化而更新）
  // 4. 调用 _syncAttribute() 重新得到当前静态真值
  // 5. 基于真实 delta 提交 update
  // 6. 清理 finalAttribute 中由已结束动画持有的目标 key
}
```

**唯一协议**：

- `finalAttribute` 的生命周期仅限“动画目标缓存”
- 状态目标更新时，`finalAttribute` 必须被新的 targetAttrs 覆盖刷新
- 动画结束、被中断或状态再次切换时，都必须执行 `_restoreAttributeFromStaticTruth()`
- 恢复依据永远是“当前 `baseAttributes + resolvedStatePatch`”，不是旧 `finalAttribute`，也不是刚结束动画的终点
- `getFinalAttribute()` 只允许读目标，不允许再接 `setAttributes(finalAttribute)` 做恢复
- `onStop(props)` 在状态路径下不得调用正式 base 写入；它只允许转发到 `_restoreAttributeFromStaticTruth()`

#### 缓存失效触发条件

- `setAttribute` / `setAttributes` 写入 → `_syncAttribute()` → `attribute` 更新 + 版本号递增
- `useStates` / `removeState` 等 → `resolvedStatePatch` 重算 → `_syncAttribute()` → `attribute` 更新
- `_syncAttribute` 本身即是缓存刷新操作，不需要额外的脏检查

### 2. 状态引擎子系统

#### authoritative patch 唯一路径

`resolvedStatePatch` 在 Phase 2 中被正式定义为**唯一 authoritative patch**。它不是“编译 patch 的半成品”，也不是等待 `resolveWithCompiled()` 二次桥接后的中间结果。

唯一主路径如下：

1. 对 `effectiveStates` 按已裁决顺序从低到高遍历
2. 对单个状态先生成 `statePatch`
3. 单状态 patch 生成遵循 Phase 2 的 legacy compatibility 语义：
   - 如果该状态存在 `stateProxy(stateName, effectiveStates)`，则 **该状态的样式贡献完全由 proxy 决定**
   - 此时不再对同一状态叠加 `definition.patch / definition.resolver(...)`
   - 这是 Phase 2 为兼容 legacy `stateProxy` 接受的语义，不是未来 shared-state 模型的推荐语义
4. 若未配置 `stateProxy`，单状态 patch 的内部覆盖顺序固定为：
   - `definition.patch`
   - `definition.resolver(...)`
5. `stateProxy()` / `definition.resolver()` **返回值层** 的 `null / undefined` 表示 skip；在 Phase 2 中，若该状态已走 `stateProxy` 路径，则 nullish 结果也不再回退到静态定义
6. `stateMergeMode === 'deep'` 的深合并发生在 **patch 生成阶段**，不是 `_syncAttribute()` 阶段
7. 生成完每个 `statePatch` 后，再把它合并进总的 `resolvedStatePatch`
8. `_syncAttribute()` 只消费最终 `resolvedStatePatch`，不再参与状态 merge

`resolveWithCompiled()` 的定位同步收缩为：

- Phase 2 后**不再允许**它出现在 `useStates / clearStates / invalidateResolver / 状态动画目标生成` 的主路径上
- 如果保留，只能作为 deprecated 兼容辅助或调试断言工具
- 开发与测试应以 `StateEngine.resolvedPatch` 为唯一 patch 输出基线

```typescript
class StateEngine<T extends Record<string, any>> {
  // 配置
  private compiledDefinitions: Map<string, CompiledStateDefinition<T>>;

  // 状态真值
  private _activeStates: string[] = [];
  private _effectiveStates: string[] = [];
  private _resolvedPatch: Partial<T> = {};

  // 版本管理
  private patchVersion: number = 0;

  // 状态迁移（内部方法，对外通过 Graphic 的现有 API 暴露）
  _applyStateInternal(stateNames: string[]): StateTransitionResult {
    // 1. 追加新状态到候选集并去重
    const candidate = [...new Set([...this._activeStates, ...stateNames])];

    // 2. 按 priority 降序 + rank 升序排序
    candidate.sort((a, b) => {
      const defA = this.compiledDefinitions.get(a);
      const defB = this.compiledDefinitions.get(b);
      const pA = defA?.priority ?? 0;
      const pB = defB?.priority ?? 0;
      if (pA !== pB) {
        return pA - pB;  // pA 小 → a 排在前 → b 覆盖 a（高 priority 覆盖低 priority）
      }
      return (defA?.rank ?? 0) - (defB?.rank ?? 0);  // 同上
    });

    // 3. 从高到低依次执行裁决（按排序后顺序）
    const suppressed = new Set<string>();
    // 从后往前遍历（高优先级在后，倒序遍历时先处理高优先级）
    for (let i = candidate.length - 1; i >= 0; i--) {
      const stateName = candidate[i];
      const def = this.compiledDefinitions.get(stateName);
      if (!def) { continue; }

      // 当前状态的 exclude[]：从候选集中移除
      if (def.exclude.size > 0) {
        for (const excluded of def.exclude) {
          const idx = candidate.indexOf(excluded);
          if (idx !== -1) {
            candidate.splice(idx, 1);
          }
        }
      }

      // 当前状态的 suppress[]：标记为 suppressed
      if (def.suppress.size > 0) {
        def.suppress.forEach(s => suppressed.add(s));
      }
    }

    // 4. 确定 activeStates 和 effectiveStates
    this._activeStates = candidate;
    this._effectiveStates = candidate.filter(s => !suppressed.has(s));

    // 5. 重计算 patch（按 effectiveStates 顺序从低到高应用）
    this.recomputePatch();

    // 6. diff 并提交（由 Graphic 调用 _syncAttribute + submitUpdate）
    return { changed: true, states: this._activeStates, suppressed: [...suppressed] };
  }

  removeState(stateNames: string | string[]): StateTransitionResult {
    // 1. 从 activeStates 移除
    // 2. 不自动恢复被 exclude 的状态
    // 3. 重新计算 effectiveStates
    // 4. 重计算 patch
    const names = Array.isArray(stateNames) ? stateNames : [stateNames];
    this._activeStates = this._activeStates.filter(s => !names.includes(s));
    // suppress 裁决在移除后重新应用（被压制状态可能因此恢复）
    return this._applyStateInternal([]);
  }

  toggleState(name: string): StateTransitionResult;

  clearStates(): StateTransitionResult {
    const hadActiveStates = this._activeStates.length > 0;
    this._activeStates = [];
    this._effectiveStates = [];
    this._resolvedPatch = {};
    this.patchVersion++;
    return {
      changed: hadActiveStates,  // 有激活状态被清除才算有变化
      states: [],
      suppressed: []
    };
  }

  private recomputePatch(): void {
    const nextPatch: Partial<T> = {};

    for (const stateName of this._effectiveStates) {
      const definition = this.compiledDefinitions.get(stateName);
      let statePatch: Partial<T> = {};

      // Phase 2 legacy compatibility:
      // if proxy exists, this state's contribution is fully decided by proxy.
      const proxyPatch = this.stateProxy?.(stateName, this._effectiveStates);
      if (this.stateProxy) {
        if (proxyPatch != null) {
          this.mergePatch(statePatch, proxyPatch, this.baseAttributes);
        }
      } else {
        if (definition?.patch) {
          this.mergePatch(statePatch, definition.patch, this.baseAttributes);
        }
        if (definition?.resolver) {
          const resolverPatch = definition.resolver({
            graphic: this.graphic,
            activeStates: this._activeStates,
            effectiveStates: this._effectiveStates,
            baseAttributes: this.baseAttributes,
            resolvedPatch: nextPatch
          });
          if (resolverPatch != null) {
            this.mergePatch(statePatch, resolverPatch, this.baseAttributes);
          }
        }
      }

      // 兼容：只有 proxy 提供 patch 的状态也可参与最终结果；若 proxy 返回 nullish，则不回退到静态定义
      if ((!definition && proxyPatch == null) || (this.stateProxy && proxyPatch == null)) {
        continue;
      }
      this.mergePatch(nextPatch, statePatch, this.baseAttributes);
    }

    this._resolvedPatch = nextPatch;
    this.patchVersion++;
  }

  private mergePatch(target: Partial<T>, patch: Partial<T>, baseAttributes: Partial<T>): void {
    if (!patch) { return; }

    for (const key in patch) {
      const nextValue = (patch as any)[key];

      if (this.mergeMode === 'deep' && isPlainObject(nextValue)) {
        const previousValue =
          isPlainObject((target as any)[key]) ? (target as any)[key] :
          isPlainObject((baseAttributes as any)[key]) ? (baseAttributes as any)[key] :
          {};
        (target as any)[key] = deepMerge(previousValue, nextValue);
        continue;
      }

      (target as any)[key] = cloneValue(nextValue);
    }
  }

  get resolvedPatch(): Partial<T> {
    return this._resolvedPatch;
  }

  get activeStates(): ReadonlyArray<string> {
    return this._activeStates;
  }

  get effectiveStates(): ReadonlyArray<string> {
    return this._effectiveStates;
  }

  private classifyUpdate(prev: Partial<T>, next: Partial<T>): UpdateCategory {
    // 基于 key 的影响分类
  }

  // 精确提交：基于 bitflag 分类结果，走不同的更新路径
  // PAINT 拥有独立于 BOUNDS 的提交语义，确保纯视觉状态切换不会触发 bounds 重算
  private submitUpdate(category: UpdateCategory): void {
    if (category & UpdateCategory.SHAPE) {
      this.addUpdateShapeAndBoundsTag();
    }
    if (category & UpdateCategory.BOUNDS) {
      this.addUpdateBoundTag();
    }
    if (category & UpdateCategory.PAINT) {
      // 纯视觉更新：仅标记需要重绘，不触发 bounds/layout/pick 重算
      // 当前底层框架若无独立 paint tag，则等价于标记脏区域但不扩展包围盒
      this.addUpdatePaintTag();
    }
    if (category & UpdateCategory.TRANSFORM) {
      this.addUpdatePositionTag();
    }
    if (category & UpdateCategory.LAYOUT) {
      this.addUpdateLayoutTag();
    }
    // Phase 2 does not introduce an independent pick tag.
    // PICK currently piggybacks on the bounds path to invalidate pick-related caches.
  }
}
```

### 3. 状态定义编译器子系统

```typescript
// 编译阶段：处理共享状态定义模板、resolver
// 输出稳定的 CompiledStateDefinition 供 StateEngine 使用

interface CompiledStateDefinition<T> {
  name: string;
  priority: number;
  rank: number;
  patch?: Partial<T>;
  resolver?: (ctx: StateResolveContext) => Partial<T> | void;
  declaredAffectedKeys?: Set<string>;  // 状态定义中声明的稳定 key 集（仅 resolver 状态需要）
  exclude: Set<string>;   // 传递闭包（编译时计算，运行时只读）
  suppress: Set<string>;  // 传递闭包（编译时计算，运行时只读）
  hasResolver: boolean;    // 是否包含 resolver，用于跳过无需 resolver 的状态
  affectedKeys: Set<string>;  // patch 涉及的 key 集合（静态 patch 由编译器提取；resolver 来自 declaredAffectedKeys）
  affectsGeometry: boolean;     // 是否影响几何属性（调试/日志辅助标记）
}

// 编译流程：
// 1. 收集所有来源的状态定义（Group → Theme）
// 2. 合并同优先级同名定义（Group > Theme）
// 3. 展开简写格式
// 注：实例级同名状态覆写不在核心路径中，少量实例差异通过 state resolver 处理
// 4. 预计算 exclude/suppress 传递闭包（编译时完成，消除运行时 while 循环）
//    - A exclude B，B exclude C → A.exclude = {B, C}
//    - A suppress B，B suppress C → A.suppress = {B, C}
// 5. 排序并分配 rank
// 6. 检测环形依赖（如 A exclude B 且 B exclude A），报编译警告
// 7. 提取 affectedKeys：
//    - 静态 patch：直接从 patch 对象提取 key 集合
//    - 含 declaredAffectedKeys 的 resolver：合并 declaredAffectedKeys
//    - 未声明的 resolver：affectedKeys 为空集（isPaintOnly 保守判定）
```

### 4. 共享状态定义子系统

#### 设计原则

- **状态定义以共享为主，实例以消费为主**
- 共享层（Group/Theme）持有编译后的状态定义模板
- 图元实例持有：当前 activeStates、resolvedStatePatch
- 实例级同名状态覆写不在核心路径中，少量实例差异通过 `state resolver` 处理

#### Group 状态共享

```typescript
class Group {
  // 共享状态定义模板
  sharedStateDefinitions: Map<string, StateDefinition<T>>;

  // 编译后的共享定义（Group 级别）
  private compiledSharedDefinitions: Map<string, CompiledStateDefinition<T>>;

  // 编译入口
  compileSharedStateDefinitions(): void {
    // 1. 从 Theme 收集默认状态定义
    // 2. 与 Group 本地定义合并
    // 3. 编译为稳定中间产物
    // 4. 建立 prototype chain 供子图元继承
  }

  // 子图元获取状态定义
  getStateDefinition(name: string): CompiledStateDefinition<T> | undefined {
    // 通过 prototype chain 查 Group/Theme 共享定义
    // 实例级同名状态覆写不在核心路径中
  }
}
```

#### Theme 状态共享

```typescript
interface ITheme {
  // Theme 级别的状态定义
  stateDefinitions?: Record<string, StateDefinition<any>>;
}

// 图元从 Theme 继承状态定义
// 通过 prototype chain 访问，零拷贝开销
```

### 5. 影响分类子系统

```typescript
// 影响分类，对应 updateTag 的精细化版本
enum UpdateCategory {
  PAINT = 1 << 0,      // 仅视觉重绘
  SHAPE = 1 << 1,      // 形状重生成
  BOUNDS = 1 << 2,     // 包围盒重算
  TRANSFORM = 1 << 3,  // 变换矩阵重算
  LAYOUT = 1 << 4,    // 布局重算
  PICK = 1 << 5,       // 拾取结果变化
}

type AttributeDeltaClassifier = (prev: unknown, next: unknown) => UpdateCategory;

const ATTRIBUTE_CATEGORY: Record<string, UpdateCategory> = {
  fill: UpdateCategory.PAINT,
  opacity: UpdateCategory.PAINT,
  shadowColor: UpdateCategory.PAINT,
  lineWidth: UpdateCategory.SHAPE | UpdateCategory.BOUNDS | UpdateCategory.PICK,
  width: UpdateCategory.SHAPE | UpdateCategory.BOUNDS,
  height: UpdateCategory.SHAPE | UpdateCategory.BOUNDS,
  x: UpdateCategory.TRANSFORM | UpdateCategory.BOUNDS,
  y: UpdateCategory.TRANSFORM | UpdateCategory.BOUNDS
};

// 对少数“是否影响 bounds/pick 取决于真实值变化”的属性，必须做 value-aware 分类
const ATTRIBUTE_DELTA_CLASSIFIER: Record<string, AttributeDeltaClassifier> = {
  stroke: (prev, next) => {
    const prevEnabled = prev != null && prev !== false;
    const nextEnabled = next != null && next !== false;
    if (prevEnabled !== nextEnabled) {
      return UpdateCategory.PAINT | UpdateCategory.BOUNDS | UpdateCategory.PICK;
    }
    return UpdateCategory.PAINT;
  },
  shadowBlur: (prev, next) => {
    const prevBlur = Number(prev ?? 0);
    const nextBlur = Number(next ?? 0);
    if (prevBlur !== nextBlur && (prevBlur > 0 || nextBlur > 0)) {
      return UpdateCategory.PAINT | UpdateCategory.BOUNDS;
    }
    return UpdateCategory.PAINT;
  }
};

function classifyAttributeDelta(key: string, prev: unknown, next: unknown): UpdateCategory {
  const dynamicClassifier = ATTRIBUTE_DELTA_CLASSIFIER[key];
  if (dynamicClassifier) {
    return dynamicClassifier(prev, next);
  }
  return ATTRIBUTE_CATEGORY[key] ?? UpdateCategory.PAINT;
}
```

#### 提交语义与 updateTag 映射

`submitUpdate` 根据分类结果精确映射到底层 updateTag，**PAINT 不等同于 BOUNDS**：

| 分类 flag | 提交动作 | 说明 |
|-----------|----------|------|
| `PAINT` | `addUpdatePaintTag()` | 仅标记视觉重绘，不触发 bounds/layout/pick 重算 |
| `SHAPE` | `addUpdateShapeAndBoundsTag()` | 形状重生成 + bounds 重算 |
| `BOUNDS` | `addUpdateBoundTag()` | 仅 bounds 重算 |
| `TRANSFORM` | `addUpdatePositionTag()` | 变换矩阵重算 |
| `LAYOUT` | `addUpdateLayoutTag()` | 布局重算 |
| `PICK` | piggyback 到 `addUpdateBoundTag()` | Phase 2 不新增独立 pick tag；提交阶段显式将 PICK 升级为 BOUNDS 以触发拾取相关失效 |

#### paint-only 最小落地机制

Phase 2 的 paint-only 不是抽象原则，而是绑定当前渲染管线的最小实现：

1. **新增 `UpdateTag.UPDATE_PAINT`**  
   在现有 `UpdateTag` 上补一个独立 bit，例如 `0b01000000`。它只表示“当前图元需要重绘”，不表示 bounds 脏。

2. **新增 `Graphic.addUpdatePaintTag()`**  
   该方法只设置当前图元的 `UPDATE_PAINT`：
   - 不调用 `parent.addChildUpdateBoundTag()`
   - 不调用 `glyphHost.addUpdateBoundTag()`
   - 不设置 `UPDATE_BOUNDS`

3. **继续复用 `onAttributeUpdate` 调度渲染**  
   `AutoRenderPlugin` 已经监听 `graphicService.hooks.onAttributeUpdate`，因此 paint-only 不需要新增调度系统；只要触发 `onAttributeUpdate`，下一帧就会被调度。

4. **在 `DirtyBoundsPlugin` 上补 paint-only dirty rect 承接**  
   新增一个 `onAttributeUpdate` tap：
   - 如果 `graphic._updateTag` 含 `UPDATE_PAINT` 且**不含** `UPDATE_BOUNDS`
   - 直接用当前缓存的 `graphic.globalAABBBounds` 调 `stage.dirty(graphic.globalAABBBounds)`
   - 不触发 `beforeUpdateAABBBounds / afterUpdateAABBBounds`
   - 不向父级传播 bounds 变化

5. **不得在 paint-only 路径里静默降级为 `BOUNDS`**  
   如果图元尚无可用的 `globalAABBBounds`（例如初始化或缓存失效），这不是 paint-only 路径里偷偷调用 `addUpdateBoundTag()` 的理由。实现必须满足二选一：
   - 在进入 paint-only 之前就保证 bounds 缓存已建立
   - 显式定义一个独立于 paint-only 的冷启动路径，并在实现与测试里单独覆盖
   无论哪种，都不能把“纯视觉更新 -> `addUpdateBoundTag()`”作为静默回退。

**结论**：

- `fill / opacity / shadowColor` 等纯视觉属性变化，只会进入 `UPDATE_PAINT`
- `stroke / lineWidth / shadowBlur` 等若真实变化影响包围盒或 pick，则分类结果必须带上 `BOUNDS / PICK`
- paint-only 的关键不是“永远不重算 bounds”，而是“不能因为发生状态切换就统一走 bounds”
- Phase 2 成品中不得残留 `setAttributes(finalAttribute)` 或 `onStop(props)` 的 base commit 恢复路径
```

### 6. 批量状态切换子系统

#### 两层配置体系

分帧状态提交支持两层配置：

```typescript
// VRender 层：引擎能力配置
interface IDeferredStateConfig {
  // 是否启用分帧提交
  enabled?: boolean;
  // 每帧预算（ms），超过则暂停
  frameBudget?: number;
  // 每帧最大处理图元数
  maxGraphicsPerFrame?: number;
}

// Stage/Layer/Group 层：区域级配置
interface IDeferredStateContextConfig {
  // 透传 VRender 层的配置
  deferred?: IDeferredStateConfig;
  // 区域级优先级
  priority?: number;
  // 区域级启用开关（优先级高于 Stage）
  localEnabled?: boolean;
}

// Stage 配置示例：
stage.deferredStateConfig = {
  frameBudget: 8,  // 8ms 帧预算
  maxGraphicsPerFrame: 100  // 每帧最多 100 个图元
};

// Layer 配置示例：
layer.deferredStateConfig = {
  localEnabled: true,  // 本层启用分帧
  deferred: { maxGraphicsPerFrame: 50 }
};

// Group 配置示例：
group.deferredStateConfig = {
  localEnabled: true,
  deferred: { frameBudget: 4 }
};
```

VChart 作为上层接入者，可以向 VRender 透传用户配置：

```typescript
// VChart 示例
const stage = createStage(config);
stage.deferredStateConfig = {
  enabled: userConfig.enableDeferredState ?? false,
  frameBudget: userConfig.deferredFrameBudget ?? 8,
  maxGraphicsPerFrame: userConfig.deferredMaxPerFrame ?? 100
};
```

#### 默认：同步收敛

普通规模状态切换在一次提交中完成，保证状态一致性。

#### 可选：分帧状态提交

针对大规模交互（几千/几万图元状态联动），支持可选的分帧策略：

```typescript
// 需要新增的 API：在 PerformanceRAF 上增加 Promise 风格的帧等待
class PerformanceRAF {
  // 新增：返回 Promise，在下一帧执行时 resolve
  wait(): Promise<void> {
    return new Promise(resolve => {
      this.addAnimationFrameCb(() => resolve());
    });
  }
}

// 图元级别的 deferred 状态队列
interface IDeferredStateQueue {
  add(graphic: IGraphic, states: string[]): void;
  commitFrame(): Promise<void>;
  cancel(): void;
}

// 调度器
class StateBatchScheduler {
  // 使用 PerformanceRAF.wait() 进行帧内分片
  // 优先处理 paint-only 状态切换（基于 affectedKeys + UpdateCategory 判断）
  // 涉及几何/bounds/pick 的状态切换保持同步
  schedule(
    graphics: IGraphic[],
    stateNames: string[],
    config: IDeferredStateConfig
  ): IDeferredStateJob {
    // 过滤 paint-only
    const paintOnly = graphics.filter(g => this.isPaintOnly(g, stateNames));
    const sync = graphics.filter(g => !this.isPaintOnly(g, stateNames));

    // 同步处理几何/bounds/pick 变化
    for (const g of sync) {
      g.useStates(stateNames);
    }

    // 分帧处理 paint-only
    return this.deferredCommit(paintOnly, stateNames, config);
  }

  // isPaintOnly：基于编译期 affectedKeys + compile-time conservative classifier 判断
  // 仅当所有状态 patch 涉及的 key 影响分类都只包含 PAINT 时才判定为 paint-only
  // 涉及 SHAPE/BOUNDS/TRANSFORM/LAYOUT/PICK 中任何一项的状态变化都必须同步收敛
  //
  // resolver 状态的特殊处理：
  //   - 如果 resolver 声明了稳定的 affectedKeys（编译期可确定），走编译期分类
  //   - 如果 resolver 未声明 affectedKeys（运行时动态），则 conservatively 判定为非 paint-only
  //   - 这样避免运行时 resolver 返回包含几何 key 的 patch 却被错误分帧
  isPaintOnly(g: IGraphic, stateNames: string[]): boolean {
    for (const name of stateNames) {
      const def = this.getCompiledDefinition(g, name);
      if (!def) { continue; }

      // 含 resolver 且未声明稳定 affectedKeys → conservatively 判定为非 paint-only
      if (def.hasResolver && (def.affectedKeys.size === 0)) {
        return false;
      }

      // 检查 patch 涉及的所有 key 的影响分类
      const category = this.classifyByKeys(def.affectedKeys);
      // 只有分类结果恰好等于 PAINT（不含其他任何 flag）才判定为 paint-only
      if (category !== UpdateCategory.PAINT) {
        return false;
      }
    }
    return true;
  }

  private classifyByKeys(keys: Set<string>): UpdateCategory {
    let category: UpdateCategory = 0;
    for (const key of keys) {
      // 对 `stroke / shadowBlur` 这类需要运行时值参与判断的 key，
      // 编译期一律 conservatively 视为非 paint-only
      if (key === 'stroke') {
        category |= UpdateCategory.PAINT | UpdateCategory.BOUNDS | UpdateCategory.PICK;
        continue;
      }
      if (key === 'shadowBlur') {
        category |= UpdateCategory.PAINT | UpdateCategory.BOUNDS;
        continue;
      }
      category |= ATTRIBUTE_CATEGORY[key] ?? UpdateCategory.PAINT;
    }
    return category;
  }

  // 分帧提交（基于 PerformanceRAF.wait()）
  private async deferredCommit(
    graphics: IGraphic[],
    stateNames: string[],
    config: IDeferredStateConfig
  ): Promise<void> {
    const { frameBudget = 8, maxGraphicsPerFrame = 100 } = config;
    const raf = application.global.performanceRAF;
    let count = 0;
    let frameStart = performance.now();

    for (const g of graphics) {
      if (count >= maxGraphicsPerFrame || performance.now() - frameStart >= frameBudget) {
        await raf.wait();  // 新增 API
        count = 0;
        frameStart = performance.now();  // 重置帧起始时间
      }
      g.useStates(stateNames);
      count++;
    }
  }
}
```

**关键约定**：
- `PerformanceRAF.wait()` 是新增 API，不是现有能力
- `isPaintOnly` 基于编译后的 `affectedKeys` + `ATTRIBUTE_CATEGORY` 表判断，不依赖手工 flag
- 仅 paint-only 默认分帧；涉及几何/bounds/pick 保持同步收敛

**关键约束**：
- 仅 paint-only 状态变化默认走分帧
- 涉及几何/bounds/pick 变化时保持同步收敛
- 分帧期间允许短暂视觉不一致，最终在若干帧内完全收敛
- 配置层级优先级：Group > Layer > Stage > 全局默认

### 7. Resolver 子系统

#### 单状态 Resolver

```typescript
interface StateResolveContext {
  graphic: IGraphic;
  activeStates: ReadonlyArray<string>;
  effectiveStates: ReadonlyArray<string>;
  baseAttributes: Partial<any>;
  resolvedPatch: Partial<any>;
}

// 单状态 resolver（与 StateDefinition.resolver 字段签名一致）：
// resolver(context) => patch | void
// 只处理单个状态的 patch 计算，不做整组状态合并
// 注意：resolver 绑定在具体 StateDefinition 上，调用时不需要传 name
//
// 不做整组黑盒 resolver，避免让 priority/exclude/suppress/merge 退化
```

#### Resolver 缓存策略

- **共享层只共享静态定义和编译结果**，resolver 函数本身不缓存，resolver.patch 不共享
- resolver patch 仅做**图元级短缓存**：
  - 缓存键：`(resolverFn, currentEffectiveStates.join(','), definitionVersion)`
  - 失效条件（以下任一）：
    1. effectiveStates 变化
    2. definition 版本变化
    3. **业务显式失效**（见下方）
  - resolver 结果天然实例相关（可读取 graphic 上下文），不能跨图元共享
  - 不作为长期稳定主数据

#### 稳定 affectedKeys 声明协议

resolver 如果返回的 key 集在业务语义上稳定（可提前预知），可以在状态定义中声明 `declaredAffectedKeys`，参与编译期 paint-only 判定：

```typescript
interface StateDefinition<T> {
  // ...
  /** resolver 返回的稳定 key 集（可选）；用于编译期 paint-only 判定 */
  declaredAffectedKeys?: Set<string>;
}
```

**协议约定**：
- **声明来源**：`StateDefinition.declaredAffectedKeys` 由状态定义编写者在编写时声明
- **编译阶段**：编译器将 `declaredAffectedKeys` 合并进 `CompiledStateDefinition.affectedKeys`
- **不声明时的默认语义**：`affectedKeys` 为空集，`isPaintOnly` 对该状态保守返回 `false`（含 resolver 且 `affectedKeys.size === 0` 时判定为非 paint-only）
- **声明正确性由编写者保证**：如果声明的 key 集与运行时实际返回不符，分帧调度可能错误分类，后果由使用方承担
- **静态 patch（非 resolver）**：`affectedKeys` 由编译器从 `patch` 对象静态提取，无需声明

#### 业务显式失效机制

resolver 可以读取图元外部业务上下文，但 VRender 不自动探测上下文变化。因此必须提供业务显式失效机制：

- **失效入口**（图元级）：`graphic.invalidateResolver()` 或 `graphic.invalidateState()`
- **批量失效**（批量图元级）：`group.invalidateResolver(graphics?)` 或 `stage.invalidateResolver(graphics)`
- **失效后触发的步骤**：
  1. resolver 缓存清除
  2. patch 重算（recomputePatch）
  3. final result 同步（_syncAttribute）
  4. 真实 delta 分类提交（submitUpdateByKeys）
- **安全约束**：
  - 不进入 render/animation/pick/bounds tick
  - 失效操作是同步的，调用后图元属性立即可用
  - 不会触发状态集合变化（activeStates/effectiveStates 不变）

#### Resolver 执行时机

- 仅在以下时机执行：
  1. 状态集合变化时
  2. effectiveStates 变化时
  3. 业务显式失效时
- 不进入 render/animation/pick/bounds tick
- 通过安全上下文检查确保不在 tick 内触发

## ✅ 业务场景校验

### 场景 A：柱子默认颜色来自业务数据线性映射

- 默认颜色属于 `baseAttributes`
- 业务重新映射颜色时，正式写入口是 `setAttribute / setAttributes`
- 进入 hover / selected 等状态后，状态色只进入 `resolvedStatePatch` 或动画期的 `finalAttribute`
- 无论状态动画是否发生，默认映射值都不能被状态终点覆盖回 `baseAttributes`

### 场景 B：选中态颜色来自另一套映射

- 选中色只能存在于 `resolvedStatePatch` 或动画目标缓存 `finalAttribute`
- 动画结束后，选中色**不允许**通过 `onStop(props)`、`setAttributes(finalAttribute)` 或其他恢复路径写回 `baseAttributes`
- 清除选中后的恢复链路固定为：
  1. `removeState / clearStates`
  2. `StateEngine` 重算 `resolvedStatePatch`
  3. `_restoreAttributeFromStaticTruth()` / `_syncAttribute()`
  4. `attribute` 回到当前 `baseAttributes + resolvedStatePatch`
- 如果选中/取消选中只改 `fill / opacity`，只进入 paint-only 路径，不进入 bounds 慢路径
- 如果选中态新增 `stroke` 或加粗 `lineWidth`，必须进入 `BOUNDS / PICK` 慢路径；因为这是由真实属性变化触发，不是由“状态切换”这一动作触发

---

## ⚠️ Breaking Changes

### 公开 API 变更

| 变更 | 说明 |
|------|------|
| `graphic.attribute.fill = 'red'` | 不再保证可靠，推荐 setAttribute，不引入拦截机制 |
| `graphic.attribute` 语义 | 保留为稳定对象，通过 `_syncAttribute()` 同步 base + patch，不改为只读 getter |
| `setAttribute(key, value)` | 语义收敛为写入 baseAttributes 并触发 `_syncAttribute()` |
| `graphic.normalAttrs` | 退出核心路径，仅保留 deprecated 兼容壳；不再保证旧 snapshot 语义 |
| `graphic.finalAttribute` | 收缩为动画层内部目标缓存；不再参与静态状态真值或 base 写入 |
| `graphic.states` 类型 | 从 `Record<string, Partial<T>>` 扩展为支持完整 StateDefinition |
| `graphic.stateProxy` | D3 v1 不扩展，不返回完整 StateDefinition；Phase 2 为兼容 legacy 语义接受“proxy fully decides per-state contribution”，但这不是未来 shared-state 模型的推荐语义 |
| `graphic.stateMergeMode` | 保持兼容，但 patch merge 不能再依赖旧 `applyStateAttrs` 桥接，必须由新主路径统一管理 |
| `graphic.currentStates` | D3 v1 保持兼容（别名映射），暂不强制改名 activeStates |
| 新增 `effectiveStates` | 只读属性，通过 `stateEngine.effectiveStates` 访问，表示真正参与样式求值的状态集合 |
| `applyState` | 仅作为内部方法名，不是新增公开 API |
| 状态操作入口 | 继续使用 `useStates / addState / removeState / toggleState / clearStates` |

---

## 📁 影响范围与实施计划

### 影响范围评估

| 模块 | 影响级别 | 说明 |
|------|----------|------|
| `vrender-core/src/graphic/graphic.ts` | 极高 | 属性分层、静态状态主路径切换、动画恢复边界、updateTag 分类提交 |
| `vrender-core/src/graphic/group.ts` | 高 | 共享状态定义模板 |
| `vrender-core/src/graphic/state/` | 高 | 状态引擎、patch 主路径、影响分类与动画桥接收口 |
| `vrender-core/src/interface/graphic.ts` | 高 | 类型定义大规模变更 |
| `vrender-core/src/theme/` | 中 | Theme 状态定义支持 |
| `vrender-core/src/core/stage.ts` | 中 | 分帧状态调度配置 |
| `vrender-core/src/render/` | 中 | attribute 读取路径适配 |
| `vrender-core/src/picker/` | 低 | pickable/visible 读取适配 |
| `vrender-animate` | 中 | `finalAttribute` 边界、动画结束恢复语义、状态动画目标适配 |
| `vrender-components` | 低 | 依赖公开 API，迁移成本可控 |
| `vrender-kits` | 低 | 无状态相关代码 |

### 分阶段实施计划

```
Phase 1: 状态引擎内核
  - Flat state model（activeStates/effectiveStates）
  - priority/rank 排序
  - exclude/suppress 语义
  - StateDefinition 编译器
  - 单状态 resolver
  预估：★★★☆☆ 大

Phase 2: 属性分层与核心路径收口
  - baseAttributes / resolvedStatePatch / attribute 分层
  - setAttribute / setAttributes / transform 写路径收敛到 baseAttributes
  - 静态状态主路径切到 _syncAttribute（含 useStates / clearStates / invalidateResolver）
  - stateProxy / stateMergeMode 合并语义收口到新 patch 主路径
  - normalAttrs 退出核心路径；finalAttribute 收缩为动画目标缓存
  - 动画结束恢复回当前静态真值，不再把 final result 反写进 base
  - delta diff / UpdateCategory / paint-only 提交语义落地
  - 现有测试基线重建
  预估：★★★★★ 极大

Phase 3: 共享状态定义
  - Group sharedStateDefinitions
  - Theme stateDefinitions
  - prototype chain 继承
  预估：★★☆☆☆ 中

Phase 4: 性能优化
  - 分帧状态提交
  - 批量状态调度 / frame budget
  - 大规模联动场景优化
  - resolver / patch / batch job 缓存优化
  预估：★★★☆☆ 大
```

---

## 🎯 下一步

1. ✅ **Phase 1**：状态定义与引擎主路径落地
2. ✅ **Phase 2**：属性分层与核心路径收口完成并 closed
3. ✅ **Phase 3**：共享状态定义主路径已实现、通过复核并完成 close-out
4. ✅ **Phase 4**：性能优化已实现、通过复核并完成 close-out；继续跟踪 `graphic.states` 告警策略与 `Glyph ownership`

---

**文档版本**：v1.12
**创建时间**：2026-04-04
**最后更新**：2026-04-09
**状态**：✅ Phase 2 已 closed；✅ Phase 3 已 closed；✅ Phase 4 已 closed
