# D2 架构设计文档 - 图形状态动画配置绑定

> **文档类型**：架构设计文档
> **负责人**：架构设计师（Claude）
> **审核者**：总监与协调者
> **版本**：v2.0
> **创建时间**：2026-04-03
> **状态**：草稿，待审核

---

## 📋 文档变更记录

| 版本 | 日期 | 作者 | 变更内容 | 审核状态 |
|------|------|------|----------|----------|
| v1.0 | 2026-04-03 | 架构设计师 | 初始草案 | ❌ 审查退回 |
| v2.0 | 2026-04-03 | 架构设计师 | 按审查意见全面修订 | ⏸️ 待审核 |

---

## 🎯 重构目标

### D2 目标（v2.0 修订版）

**VRender 接管状态样式解析和状态过渡执行，使 VRender 成为"样式 + 动画执行"的单一事实来源。**

- **VChart 职责**：负责业务层状态决策（决定调用哪个 `useStates`），不再处理样式合并和动画配置
- **VRender 职责**：状态样式解析、状态过渡动画配置绑定和执行

### 核心能力

D2 v1 增加的唯一能力：**允许在 `states` 定义中携带 `animation` 配置，当 `hasAnimation === true` 时自动使用该配置注入动画链。**

### 不在 v1 范围内的内容

| 排除项 | 原因 |
|--------|------|
| glyph 状态（`glyphStates`/`glyphStateProxy`�� | 有独立实现路径，结构不同，v1 不碰 |
| `stateProxy` 携带动画配置 | `stateProxy` 只参与样式解析，动画配置只从静态 `states` 提取 |
| 实例钩子（`onStateEnter`/`onStateExit`） | 现有事件机制（`beforeStateUpdate`/`afterStateUpdate`）足够 |
| 多状态 animation merge | 不做，按"最后一个状态"规则提取 |
| enter+exit 同时执行 | 保持 `applyAnimationState` 现有契约 |
| exit 方向配置 | v1 不支持 exit，只支持 enter |

---

## 📊 现状分析

### B1 阶段成果（已完成）

B1 已建立五层职责模型：

```
Layer 1: Graphic Runtime Hooks   — useStates / addState / removeState / clearStates
Layer 2: State Model             — 状态集合、优先级、互斥关系
Layer 3: State Style Resolver    — 样式解析，支持 shallow/deep merge
Layer 4: State Transition Orchestrator — animate/jump/noAnimate 属性分类
Layer 5: Animation Executor      — 动画执行（vrender-animate）
```

### 当前状态动画配置来源

| 优先级（高→低） | 配置位置 | 说明 |
|----------------|----------|------|
| 1 | `applyStateAttrs` 第 5 参数 | 仅内部调用，公开 API 无此入口 |
| 2 | `graphic.stateAnimateConfig` | 所有状态共用同一配置 |
| 3 | `context.stateAnimateConfig` | 所有 graphic 共用 |
| 4 | `DefaultStateAnimateConfig` | { duration: 200, easing: 'cubicOut' } |

### 真实问题

当前 `graphic.states` 只含 `Partial<T>` 样式，不含动画配置。如果 hover 需要 100ms、selected 需要 300ms，当前无法在 `states` 中表达 —— 必须给每个 graphic 设置不同的 `stateAnimateConfig`，且所有状态共用同一个。

D2 v1 要解决：**让每个状态自己携带 enter 动画配置。**

---

## 📐 目标架构

### 状态定义格式（v2.0）

```typescript
// 旧格式（保持兼容）
states: {
  hover: { fill: 'red' }
}

// 新格式
states: {
  hover: {
    style: { fill: 'red' },
    animation: { duration: 200, easing: 'cubicOut' }
  }
}

// 联合类型
type StateValue<T> = Partial<T> | IStateDefinition<T>;
interface IGraphic<T> {
  states?: Record<string, StateValue<T>>;
}
```

### 动画配置优先级（v2.0）

| 优先级 | 配置来源 | 说明 |
|--------|----------|------|
| 1 | `applyStateAttrs` 第 5 参数 | 仅内部调用，v1 极少使用 |
| 2 | 状态定义的 `animation` | D2 v1 新增：按"最后一个状态"规则提取 |
| 3 | `graphic.stateAnimateConfig` | 现有 |
| 4 | `context.stateAnimateConfig` | 现有 |
| 5 | `DefaultStateAnimateConfig` | { duration: 200, easing: 'cubicOut' } |

### "最后一个状态"规则

当多个状态同时激活时（如 `useStates(['hover', 'selected'])`），按以下规则提取动画配置：

1. **有 `stateSort` 时**：按 `stateSort` 排序，取排序后最后一个状态（优先级最高）
2. **无 `stateSort` 时**：保持调用顺序，取最后一个传入的状态

### 架构流程图

```
graphic.useStates(['hover', 'selected'], true)
           │
           ▼
┌──────────────────────────────────────────────────┐
│  StateModel.useStates()                           │
│  → 返回 { changed, states: ['hover', 'selected'] } │
└──────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────┐
│  StateStyleResolver.resolve()                     │
│  → 样式合并：遍历状态，取 style（兼容新旧格式）     │
│  → 返回 resolvedStateAttrs                        │
└──────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────┐
│  动画配置提取（新增）                               │
│  → 按规则确定"最后一个状态"：selected              │
│  → 从 states['selected'] 中提取 animation           │
│  → 注入优先级链                                    │
└──────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────┐
│  applyStateAttrs(resolvedStateAttrs, ..., config)  │
└──────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────┐
│  orchestrator.analyzeTransition()                  │
│  → 分析 animate/jump/noAnimate                    │
└──────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────┐
│  orchestrator.applyTransition()                    │
│  → 传入 resolved config                           │
│  → graphic.applyAnimationState(['state'], [...])   │
└──────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────┐
│  AnimationStateManager                             │
│  → 执行动画，状态名仍为 'state'                    │
└──────────────────────────────────────────────────┘
```

### stateProxy 处理策略

`stateProxy` 继续只参与**样式解析**，不参与动画配置提取：

- 样式合并阶段：`stateProxy` 返回值与静态 `states` 同等对待（新格式下只取其 `style`）
- 动画提取阶段：只查询**静态 `states[lastStateName]**
- 如果 graphic 完全依赖 `stateProxy` 且无静态 `states` 定义，则无状态动画配置可用，fallback 到 `stateAnimateConfig` 链

---

## 🔧 类型设计

### 新增类型

```typescript
// 在 vrender-core/src/interface/graphic.ts 中定义
export interface IStateDefinition<T> {
  /** 状态样式 */
  style: Partial<T>;
  /** 状态进入动画配置（仅支持 enter 方向） */
  animation?: IAnimateConfig;
}

// 类型守卫
export function isStateDefinition<T>(value: unknown): value is IStateDefinition<T> {
  return value != null && typeof value === 'object' && 'style' in value;
}
```

### 受影响的现有类型

```typescript
// IGraphic 中 states 的类型从：
states?: Record<string, Partial<T>>;
// 变更为：
states?: Record<string, Partial<T> | IStateDefinition<T>>;

// getState 返回类型从：
getState: (stateName: string) => Partial<T>;
// 变更为：
getState: (stateName: string) => Partial<T> | IStateDefinition<T> | undefined;
```

### 不受影响的类型

| 类型 | 不变原因 |
|------|----------|
| `IAnimateConfig` | 复用，不扩展 |
| `StateProxy<T>` | 继续返回 `Partial<T>`，v1 不扩展返回类型 |
| `IStateModelOptions<T>` | 只做只读传递，类型不变 |
| `IGraphicAttribute` | 不变 |
| `IGlyphGraphicAttribute` | glyph out-of-scope |

---

## 📁 文件变更清单

### 必须修改的文件

| 文件 | 变更内容 | 性质 |
|------|----------|------|
| `vrender-core/src/interface/graphic.ts` | 添加 `IStateDefinition` 类型、`isStateDefinition` 类型守卫；修改 `IGraphic.states` 和 `getState` 返回类型 | 类型定义 |
| `vrender-core/src/graphic/state/state-style-resolver.ts` | 兼容两种格式：类型守卫检测，提取 `style` 部分参与样式合并 | 核心逻辑 |
| `vrender-core/src/graphic/state/state-transition-orchestrator.ts` | 接受外部注入的 `stateAnimationConfig`；若无则 fallback | 核心逻辑 |
| `vrender-core/src/graphic/graphic.ts` | 在 `useStates` → `applyStateAttrs` 路径中提取目标状态的动画配置并传入 orchestrator；修改 `getState` 返回类型 | 集成逻辑 |
| `vrender-core/src/graphic/group.ts` | 若有状态相关逻辑，需同步更新 | 需确认 |

### 测试文件（需同步扩展）

| 文件 | 新增测试 |
|------|----------|
| `vrender-core/__tests__/unit/graphic/state-style-resolver.test.ts` | 新格式解析、旧格式兼容、混合格式 |
| `vrender-core/__tests__/unit/graphic/state-transition-orchestrator.test.ts` | 状态动画配置注入、优先级覆盖 |
| `vrender-core/__tests__/unit/graphic/state-animation.test.ts` | 新格式触发正确动画配置、优先级链 |

### 明确不修改的文件

| 文件 | 原因 |
|------|------|
| `vrender-core/src/interface/graphic/glyph.ts` | glyph out-of-scope |
| `vrender-core/src/graphic/glyph.ts` | glyph out-of-scope |
| `vrender-core/src/graphic/state/state-model.ts` | 只做只读传递，不改变类型 |
| `vrender-animate/src/state/animation-state.ts` | 不改造 AnimationStateManager |
| `vrender-animate/src/state/graphic-extension.ts` | 保持现有 `applyAnimationState` 契约 |

---

## 🎯 实施计划

### Phase 1：D2.1 类型与样式解析

1. 在 `interface/graphic.ts` 中添加 `IStateDefinition` 类型和 `isStateDefinition` 守卫
2. 修改 `IGraphic.states` 和 `getState` 返回类型
3. 修改 `StateStyleResolver.resolve()` 兼容新旧格式
4. 单元测试：新格式解析、旧格式兼容、混合格式

### Phase 2：D2.2 动画配置绑定

1. 在 `graphic.ts` 的 `useStates` 流程中实现"最后一个状态"提取逻辑
2. 将提取出的动画配置通过 `applyStateAttrs` 传入 `StateTransitionOrchestrator`
3. 修改 `orchestrator.applyTransition` 接受并使用注入的配置
4. 更新测试基线

### Phase 3（可选，不进 v1）：增强事件 payload

- `beforeStateUpdate` / `afterStateUpdate` 增加 `enteredStates` / `exitedStates`

---

## ⚠️ 兼容性说明

### 向后兼容

- 旧格式 `states: { hover: { fill: 'red' } }` 完全兼容 —— `isStateDefinition` 返回 false，直接作为 `Partial<T>` 处理
- `hasAnimation === false` 行为不变
- 所有状态操作方法（`useStates`/`addState`/`removeState`/`clearStates`）签名不变

### D2 v1 引入的变化

| 变化点 | 说明 |
|--------|------|
| `states` 类型扩展 | 静态类型可表达 `IStateDefinition`，运行时自动兼容旧格式 |
| `getState` 返回类型 | 可返回 `IStateDefinition<T>` |
| 动画配置来源扩展 | `hasAnimation=true` 时，若状态定义含 `animation`，优先于 `stateAnimateConfig` |

### 已知限制

| 限制 | 原因 |
|------|------|
| 不支持 exit 方向配置 | v1 范围限定，需新建类型才能支持 |
| `stateProxy` 不携带动画配置 | v1 范围限定 |
| glyph 不支持新格式 | v1 范围限定 |
| 多状态不做 animation merge | v1 范围限定，按"最后一个状态"提取 |

---

## 📊 影响范围评估

| 模块 | 影响级别 | 说明 |
|------|----------|------|
| `vrender-core/src/interface/graphic.ts` | 高 | 新增类型，修改现有类型定义 |
| `vrender-core/src/graphic/state/state-style-resolver.ts` | 高 | 核心逻辑修改 |
| `vrender-core/src/graphic/graphic.ts` | 高 | 集成逻辑修改 |
| `vrender-core/src/graphic/state/state-transition-orchestrator.ts` | 中 | 接受注入配置 |
| `vrender-core/__tests__/unit/` | 中 | 测试扩展 |
| `vrender-animate` | 无 | 不修改 |
| `vrender-components` | 无 | 只依赖公开 API |
| `vrender-kits` | 无 | 无状态相关代码 |

---

## 🎯 下一步

1. ⏸️ **审核此草案**：总监与协调者审核 v2.0 设计
2. ⏸️ **确认方案**：审核通过后确认执行
3. ⏸️ **任务分解**：将 Phase 1 / Phase 2 转化为具体任务
4. ⏸️ **开发者执行**：资深开发者按任务执行

---

**文档版本**：v2.0
**创建时间**：2026-04-03
**最后更新**：2026-04-03
**状态**：⏸️ 待审核
