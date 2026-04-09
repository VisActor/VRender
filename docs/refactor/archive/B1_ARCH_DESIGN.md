# B1 架构设计文档 - 图形状态系统重构

> **文档类型**：架构设计文档
> **负责人**：架构设计师（Claude）
> **审核者**：总监与协调者
> **版本**：v1.1
> **创建时间**：2026-04-02
> **状态**：草稿，待审核

---

## 📋 文档变更记录

| 版本 | 日期 | 作者 | 变更内容 | 审核状态 |
|------|------|------|----------|----------|
| v1.0 | 2026-04-02 | 架构设计师 | 初始草案 | ⏸️ 待审核 |
| v1.1 | 2026-04-03 | 资深开发者 | 补充阶段三落地说明：深度合并开关、`beforeStateUpdate` 事件、禁止动画属性配置 | ⏸️ 待审核 |

---

## 🎯 重构目标

### B1：图形状态系统重构

**目标**：重构 `graphic state model -> state style resolution -> state transition orchestration -> animation execution` 链路，实现职责清晰分层。

**当前问题**（经代码探索确认）：

| 问题 | 位置 | 说明 |
|------|------|------|
| 双重动画追踪 | `graphic.ts` + `animate-extension.ts` | `animates` Map 和 `_animationStateManager` 分别管理动画，职责重叠 |
| `finalAttribute` 紧耦合 | `applyStateAttrs()` | 状态应用直接修改 `finalAttribute`，动画层与状态层边界模糊 |
| `normalAttrs` 变异问题 | `updateNormalAttrs()` | 状态切换时 `normalAttrs` 被原地修改，`clearStates` 后可能产生不一致 |
| 状态解析浅合并 | `useStates()` 中的 `Object.assign()` | 嵌套对象被整体替换而非深度合并 |
| 动画/非动画拆分内嵌 | `applyStateAttrs()` | 属性是否可动画的判断逻辑与状态应用逻辑耦合 |
| 多层状态管理器 | `GraphicStateExtension` mixin | 基础状态方法与扩展状态方法功能重叠 |
| `stateAnimateConfig` 上下文依赖 | `applyStateAttrs()` | 依赖 `this.context.stateAnimateConfig`，影响隔离测试 |
| 缺少 `beforeStateUpdate` 事件 | `applyStateAttrs()` | 只有 `afterStateUpdate`，无法在状态应用前拦截 |

---

## 📐 架构设计

### 目标：五层职责模型

```
┌─────────────────────────────────────────────────────────────┐
│                    Graphic Runtime Hooks                      │
│         useStates / addState / removeState / clearStates      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      State Model                             │
│    定义状态集合、优先级、互斥关系、叠加规则                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   State Style Resolver                      │
│       normal attrs + states + stateProxy → 目标样式           │
│                    （纯函数，无副作用）                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              State Transition Orchestrator                    │
│      判断哪些属性直接跳变、哪些进入 transition                │
│      判断哪些属性禁止动画                                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Animation Executor                        │
│           只负责执行动画，不负责状态语义                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 各层详细设计

### 1. Graphic Runtime Hooks（入口层）

**职责**：作为状态的发起者，不负责状态求值和动画编排。

**当前接口**（保持兼容）：
- `useStates(states: string[], hasAnimation?: boolean): void`
- `addState(stateName: string, keepCurrentStates?: boolean, hasAnimation?: boolean): void`
- `removeState(stateName: string | string[], hasAnimation?: boolean): void`
- `clearStates(hasAnimation?: boolean): void`

**重构要求**：
- 保持上述公开接口签名不变
- 内部委托给 State Model 和 Orchestrator，不再直接操作 `normalAttrs`
- 事件 `afterStateUpdate` 保留，并补充可拦截的 `beforeStateUpdate`

**实施补充（2026-04-03）**：
- `beforeStateUpdate` 已在状态实际落盘前触发，事件 detail 包含 `type`、`attrs`、`prevStates`、`nextStates`、`hasAnimation`、`isClear`。
- 监听器可通过 `preventDefault()` 阻断本次状态应用；阻断后不会更新 `currentStates`、`normalAttrs`，也不会触发 `afterStateUpdate`。
- 在无 stage event manager 的单测/离线场景下，事件会回退到 graphic 本地的节点事件分发，保证行为一致。

### 2. State Model（状态模型）

**职责**：定义 graphic 有哪些状态，以及状态之间的关系规范。

**当前 `states` 属性**：
```typescript
declare states?: Record<string, Partial<T>>;
```

**新增设计**：
- 状态优先级（通过 `stateSort` 函数，已支持）
- 状态互斥关系（同一时刻只能存在一个的互斥组）
- 状态叠加规则（哪些状态允许叠加，哪些会互相覆盖）

**文件位置**：`vrender-core/src/graphic/state/state-model.ts`

**重构要求**：
- 将 `states`、`stateSort`、`currentStates` 的管理逻辑从 `graphic.ts` 提取到 `StateModel` 类
- 提供状态关系查询接口（互斥组、优先级排序）
- 保持 `stateProxy` 作为可选的动态属性计算器

### 3. State Style Resolver（状态样式解析器）

**职责**：将 `normal attrs` + `states` + `stateProxy` 解析为最终目标样式。

**当前问题**：
- `useStates()` 中通过 `Object.assign()` 进行浅合并，嵌套对象整体替换
- `updateNormalAttrs()` 既有读取也有写入，职责不纯

**新增设计**：
```typescript
interface IStateStyleResolver {
  // 纯函数：将 normalAttrs + states + stateProxy → 目标样式
  resolve(
    normalAttrs: Partial<T>,
    states: Record<string, Partial<T>>,
    stateProxy: ((stateName: string, targetStates?: string[]) => Partial<T>) | undefined,
    currentStates: string[],
    stateSort: ((a: string, b: string) => number) | undefined
  ): Partial<T>;

  // 计算应存入 normalAttrs 的回退值（纯函数）
  computeNormalAttrsBackup(
    normalAttrs: Partial<T>,
    targetAttrs: Partial<T>,
    finalAttribute: Record<string, any>
  ): Partial<T>;
}
```

**文件位置**：`vrender-core/src/graphic/state/state-style-resolver.ts`

**重构要求**：
- 纯函数化：不修改任何对象引用，输入相同则输出相同
- 支持深度合并：嵌套对象的属性级别合并，而非整体替换
- `stateProxy` 的优先级高于静态 `states` 对象

**实施补充（2026-04-03）**：
- 默认解析路径仍保持浅合并，用于兼容既有状态行为。
- 已提供 `graphic.stateMergeMode = 'deep'` 开关，用于显式开启嵌套对象级深度合并。
- 深度合并在 graphic 集成层会以当前属性快照作为基底，避免首次进入状态时丢失未覆盖的嵌套字段。

### 4. State Transition Orchestrator（状态切换编排器）

**职责**：判断从旧状态切换到新状态时，哪些属性直接跳变、哪些进入动画、哪些禁止动画。

**当前问题**：
- `applyStateAttrs()` 中硬编码了"哪些属性禁止动画"的判断
- 跳变/动画的判断逻辑与状态应用逻辑耦合

**新增设计**：
```typescript
interface IStateTransitionOrchestrator {
  // 分析从 prevAttrs 到 nextAttrs 的转换
  // 返回：直接跳变属性 / 需要动画的属性 / 禁止动画的属性
  analyzeTransition(
    prevAttrs: Partial<T>,
    nextAttrs: Partial<T>,
    config: IAnimateConfig | undefined,
    hasAnimation: boolean
  ): TransitionPlan;

  // 执行状态切换
  applyTransition(
    graphic: IGraphic,
    transitionPlan: TransitionPlan,
    finalAttribute: Record<string, any>
  ): void;

  // 清状态回退
  applyClearTransition(
    graphic: IGraphic,
    normalAttrs: Partial<T>,
    hasAnimation: boolean
  ): void;
}

interface TransitionPlan {
  jumpAttrs: Partial<T>;      // 直接跳变
  animateAttrs: Partial<T>;    // 需要动画
  noAnimateAttrs: Partial<T>;  // 禁止动画
}
```

**文件位置**：`vrender-core/src/graphic/state/state-transition-orchestrator.ts`

**重构要求**：
- `applyStateAttrs()` 中的动画/非动画拆分逻辑移入此处
- 配置化禁止动画的属性规则（而非硬编码）
- 保持与现有 `DefaultStateAnimateConfig` 的兼容

**实施补充（2026-04-03）**：
- `IAnimateConfig` 新增 `noAnimateAttrs?: string[] | Record<string, boolean | number>`，用于追加禁止动画属性。
- orchestrator 会将 `graphic.getNoWorkAnimateAttr()` 返回的图形默认禁动规则与 `animateConfig.noAnimateAttrs` 合并，默认行为保持不变，配置只做增量扩展。
- `graphic.applyStateAttrs()` 与 `applyClearTransition()` 都会传入已解析的 `animateConfig`，确保普通状态切换和清状态回退使用同一套规则。

### 5. Animation Executor（动画执行器）

**职责**：只负责执行 transition 或独立动画，不再负责定义状态语义。

**当前状态**：
- `AnimationStateManager` (`vrender-animate/src/state/animation-state.ts`) 管理动画状态
- `AnimateExecutor` (`vrender-animate/src/executor/animate-executor.ts`) 执行动画
- `GraphicStateExtension` mixin 连接 graphic 和 animation state

**重构要求**：
- 动画层应只回答：如何执行、何时完成、如何中断
- 动画层不应回答：应该应用哪个状态、目标样式是什么
- `GraphicStateExtension` 与 `State Transition Orchestrator` 的边界重新划定
- 移除双重动画追踪：统一由 `AnimationStateManager` 管理，不再在 `graphic` 级别维护独立的 `animates` Map

---

## 🔧 重构实施计划

### 阶段一：职责提取（隔离验证）

1. 从 `graphic.ts` 提取 `StateModel` 类
2. 创建 `StateStyleResolver` 纯函数模块
3. 创建 `StateTransitionOrchestrator` 模块
4. 编写每层的单元测试，确保行为与重构前完全一致
5. 通过对照测试验证：重构前后的状态行为无差异

### 阶段二：连接与集成

1. 重构 `graphic.ts` 状态方法，内部委托给新模块
2. 清理 `GraphicStateExtension` 与新模块的职责重叠
3. 统一动画追踪：移除 `graphic.animates` Map，统一由 `AnimationStateManager` 管理
4. 解耦 `stateAnimateConfig` 的上下文依赖，改为可选参数传入

### 阶段三：行为校正（如果时间允许）

1. 深度合并嵌套状态属性（而非整体替换）
2. 补充 `beforeStateUpdate` 事件
3. 配置化禁止动画属性规则

---

## ⚠️ 兼容性边界

### 必须保持兼容的公开 API

| API | 签名 | 说明 |
|-----|------|------|
| `useStates` | `(states: string[], hasAnimation?: boolean) => void` | 保持不变 |
| `addState` | `(stateName: string, keepCurrentStates?: boolean, hasAnimation?: boolean) => void` | 保持不变 |
| `removeState` | `(stateName: string \| string[], hasAnimation?: boolean) => void` | 保持不变 |
| `clearStates` | `(hasAnimation?: boolean) => void` | 保持不变 |
| `states` | `Record<string, Partial<T>>` | 属性保持，可扩展 |
| `stateProxy` | `(stateName: string, targetStates?: string[]) => Partial<T>` | 保持，可扩展 |
| `stateSort` | `(a: string, b: string) => number` | 保持 |
| `stateAnimateConfig` | `IAnimateConfig` | 保持，可迁移到参数传入 |

### 可以改变的内部行为

- 状态解析算法（从浅合并改为深度合并）
- `normalAttrs` 的管理方式
- 动画追踪的数据结构
- 事件触发的时机和类型
- `applyStateAttrs`、`updateNormalAttrs` 等内部方法签名

### 需要记录的行为变化

- 嵌套状态属性的合并规则变更（浅合并 → 深度合并）
- `beforeStateUpdate` 事件新增，支持在状态更新前拦截
- `IAnimateConfig.noAnimateAttrs` 可追加禁止动画属性规则

---

## 📊 影响范围

| 模块 | 影响 | 说明 |
|------|------|------|
| `vrender-core/src/graphic/graphic.ts` | 高 | 状态方法重构，职责委托 |
| `vrender-core/src/graphic/glyph.ts` | 中 | glyph 的 subGraphic 状态处理 |
| `vrender-animate/src/state/` | 高 | AnimationStateManager 与新 orchestrator 的边界 |
| `vrender-animate/src/animate-extension.ts` | 中 | finalAttribute 管理重构 |
| `vrender-core/src/animate/config.ts` | 低 | 保持兼容 |
| `vrender-components/` | 低 | 依赖状态 API，但不依赖内部实现 |

---

## 🎯 下一步

1. ⏸️ 审核此草案：总监与协调者审核设计
2. ⏸️ 确认方案：审核通过后确认执行
3. ⏸️ 任务分解：将设计转化为具体任务
4. ⏸️ 开发者执行：资深开发者按任务执行

---

**文档版本**：v1.0
**创建时间**：2026-04-02
**最后更新**：2026-04-02
**状态**：⏸️ 待审核
