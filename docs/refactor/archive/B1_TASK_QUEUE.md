# B1 任务队列 - 图形状态系统重构

> **文档类型**：任务执行队列
> **负责人**：架构设计师（Claude）制定，资深开发者执行
> **审核者**：总监与协调者
> **设计文档**：B1_ARCH_DESIGN.md
> **当前阶段**：🔄 阶段二 - 连接与集成（进行中）

---

## 👥 角色分工

- **架构设计师**：定义任务、验收标准、审查完成质量
- **资深开发者**：执行任务、编写代码、标记完成状态
- **总监与协调者**：监控进度、决策、验收

---

## 📋 任务组 1：阶段一 - 职责提取（隔离验证）

### 🟡 任务 1.1：提取 StateModel 类

**优先级**：🟡 P1
**预估时间**：2-3 小时
**当前状态**：✅ 已完成
**负责人**：资深开发者

**任务描述**：
将 `graphic.ts` 中的状态管理逻辑提取到独立的 `StateModel` 类中。

**具体任务**：
- [x] 创建 `packages/vrender-core/src/graphic/state/state-model.ts`
- [x] 将 `states`、`stateSort`、`currentStates` 的管理逻辑提取到 `StateModel`
- [x] 实现状态关系查询接口（互斥组、优先级排序）
- [x] 保持 `stateProxy` 作为可选属性
- [x] 编写对照测试：确保 `StateModel` 的行为与重构前完全一致
- [x] 确保 TypeScript 编译通过

**验收标准**：
- [x] `StateModel` 类功能完整
- [x] 对照测试通过（行为无差异）
- [x] TypeScript 编译通过

**补充说明**：
- `StateModel` 当前只承接状态集合、当前状态列表、排序和互斥关系查询，不提前介入样式解析或动画编排。
- 对照测试固定了 `useStates` 在“先比较、后排序”这一现有细节，确保后续集成阶段不会静默改变行为。

---

### 🟡 任务 1.2：创建 StateStyleResolver 模块

**优先级**：🟡 P1
**预估时间**：2-3 小时
**当前状态**：✅ 已完成
**负责人**：资深开发者

**任务描述**：
创建纯函数化的 `StateStyleResolver`，将 `normal attrs` + `states` + `stateProxy` 解析为最终目标样式。

**具体任务**：
- [x] 创建 `packages/vrender-core/src/graphic/state/state-style-resolver.ts`
- [x] 实现 `IStateStyleResolver` 接口
- [x] 实现深度合并：嵌套对象的属性级别合并，而非整体替换
- [x] `stateProxy` 优先级高于静态 `states` 对象
- [x] 编写对照测试：确保解析结果与当前 `useStates()` 中的合并逻辑一致
- [x] 确保 TypeScript 编译通过

**验收标准**：
- [x] `StateStyleResolver` 为纯函数（无副作用）
- [x] 深度合并行为正确
- [x] `stateProxy` 优先级正确
- [x] 对照测试通过
- [x] TypeScript 编译通过

**补充说明**：
- 默认解析路径保持当前 `graphic.useStates()` 的浅合并行为，用于阶段一对照测试与后续集成兼容。
- 深度合并能力已在模块中实现，但需要显式开启；这样可以同时满足职责提取和行为稳定两侧约束。

---

### 🟡 任务 1.3：创建 StateTransitionOrchestrator 模块

**优先级**：🟡 P1
**预估时间**：2-3 小时
**当前状态**：✅ 已完成
**负责人**：资深开发者

**任务描述**：
创建 `StateTransitionOrchestrator`，将 `applyStateAttrs()` 中的动画/非动画拆分逻辑提取出来。

**具体任务**：
- [x] 创建 `packages/vrender-core/src/graphic/state/state-transition-orchestrator.ts`
- [x] 实现 `IStateTransitionOrchestrator` 接口
- [x] 实现 `analyzeTransition()`：分析跳变/动画/禁止动画属性
- [x] 实现 `applyTransition()`：执行状态切换
- [x] 实现 `applyClearTransition()`：清状态回退
- [x] 配置化禁止动画的属性规则
- [x] 保持与 `DefaultStateAnimateConfig` 的兼容
- [x] 编写对照测试：确保转换结果与当前行为一致
- [x] 确保 TypeScript 编译通过

**验收标准**：
- [x] `TransitionPlan` 返回结构正确
- [x] 禁止动画属性可配置
- [x] 对照测试通过
- [x] TypeScript 编译通过

**补充说明**：
- `StateTransitionOrchestrator` 当前只抽离状态切换编排，不提前改变 `graphic.applyStateAttrs()` 的既有语义。
- `context.stateAnimateConfig` 优先级、`DefaultStateAnimateConfig` 回退、`finalAttribute` 同步以及清状态时对 `undefined` 属性的默认值动画回退，都已由对照测试固定。

---

### 🟡 任务 1.4：编写对照测试套件

**优先级**：🟡 P1
**预估时间**：3-4 小时
**当前状态**：✅ 已完成
**负责人**：资深开发者

**任务描述**：
为阶段一所提取的三个新模块编写对照测试，确保重构后行为与重构前完全一致。

**具体任务**：
- [x] 为 `StateModel` 编写对照测试（对照现有 `graphic-state.test.ts`）
- [x] 为 `StateStyleResolver` 编写对照测试（对照现有 `state-resolution.test.ts`）
- [x] 为 `StateTransitionOrchestrator` 编写对照测试（对照现有 `state-animation.test.ts`）
- [x] 覆盖所有边界情况：空状态、嵌套属性、`stateProxy` 返回 null/undefined 等
- [x] 确保所有对照测试通过

**验收标准**：
- [x] 三个模块的对照测试全部通过
- [x] 覆盖率覆盖核心路径
- [x] 边界情况覆盖完整

**补充说明**：
- 新增 `state-module-parity.test.ts`，直接把 `StateModel`、`StateStyleResolver`、`StateTransitionOrchestrator` 与当前 `graphic.ts` 的旧实现并排对照，而不是只校验模块内部自洽。
- 阶段一相关定向套件共 9 个 suite、73 条用例全部通过，覆盖状态列表变更、浅合并、`stateProxy` 优先级、`normalAttrs` 备份恢复、动画/非动画拆分和清状态回退。

---

## 📋 任务组 2：阶段二 - 连接与集成

### 🟡 任务 2.1：重构 graphic.ts 状态方法

**优先级**：🟡 P1
**预估时间**：2-3 小时
**当前状态**：✅ 已完成
**负责人**：资深开发者

**任务描述**：
重构 `graphic.ts` 中的 `useStates`、`addState`、`removeState`、`clearStates` 方法，内部委托给新模块。

**具体任务**：
- [x] 修改 `graphic.ts`：`useStates()` 内部委托给 `StateModel` + `StateStyleResolver` + `StateTransitionOrchestrator`
- [x] 修改 `graphic.ts`：`addState()` 委托给 `StateModel.useStates()`
- [x] 修改 `graphic.ts`：`removeState()` 委托给 `StateModel`
- [x] 修改 `graphic.ts`：`clearStates()` 委托给 `StateTransitionOrchestrator.applyClearTransition()`
- [x] 保持公开 API 签名不变
- [x] 所有状态相关测试通过
- [x] TypeScript 编译通过

**验收标准**：
- [x] 公开 API 签名保持不变
- [x] 所有状态单元测试通过
- [x] TypeScript 编译通过
- [x] 行为与阶段一对照测试一致

**补充说明**：
- `graphic.ts` 当前已把 `useStates`、`addState`、`removeState`、`toggleState`、`clearStates` 和 `applyStateAttrs` / `updateNormalAttrs` 的核心路径委托给新模块，但外部 API 和现有测试语义保持不变。
- `updateNormalAttrs()` 仍保留“原地回写 `stateAttrs`”这一兼容行为，只是底层备份计算改由 `StateStyleResolver.computeNormalAttrsBackup()` 完成。

---

### 🟡 任务 2.2：清理 GraphicStateExtension 与新模块的职责重叠

**优先级**：🟡 P1
**预估时间**：2-3 小时
**当前状态**：✅ 已完成
**负责人**：资深开发者

**任务描述**：
清理 `vrender-animate` 中 `GraphicStateExtension` 与新重构模块的职责重叠。

**具体任务**：
- [x] 分析 `GraphicStateExtension` (`vrender-animate/src/state/graphic-extension.ts`) 与新模块的重叠部分
- [x] 明确 `GraphicStateExtension` 的保留职责
- [x] 移除与 `StateTransitionOrchestrator` 重复的逻辑
- [x] 统一动画追踪入口
- [x] 确保动画相关测试通过
- [x] TypeScript 编译通过

**验收标准**：
- [x] 职责边界清晰
- [x] 动画测试通过
- [x] TypeScript 编译通过

**补充说明**：
- `GraphicStateExtension` 现在明确只做 `AnimationStateManager` / `AnimationStateStore` 的 lazy bridge，不再在 `extend()` 阶段预创建 manager，也不承载 graphic 状态语义或样式解析。
- 新增 `vrender-animate/__tests__/unit/graphic-state-extension.test.ts`，固定了“延迟初始化、纯转发、不修改 `currentStates` / `normalAttrs`”这组边界约束。

---

### 🟡 任务 2.3：统一动画追踪

**优先级**：🟡 P1
**预估时间**：2-3 小时
**当前状态**：✅ 已完成
**负责人**：资深开发者

**任务描述**：
移除 `graphic` 级别的 `animates` Map，统一由 `AnimationStateManager` 管理动画追踪。

**具体任务**：
- [x] 分析 `graphic.animates` Map 的使用位置
- [x] 移除 `animate-extension.ts` 中的 `animates` Map 管理
- [x] 将动画追踪统一到 `AnimationStateManager`
- [x] 更新所有引用 `graphic.animates` 的代码
- [x] 确保所有动画测试通过
- [x] TypeScript 编译通过

**验收标准**：
- [x] `graphic.animates` Map 已移除或不再使用
- [x] 动画追踪统一由 `AnimationStateManager` 管理
- [x] 所有动画测试通过
- [x] TypeScript 编译通过

**补充说明**：
- 统一追踪入口现在是 `AnimationStateManager.trackAnimate / untrackAnimate / forEachTrackedAnimate / getTrackedAnimates`；`Graphic`、`Animate`、`Step`、`AnimateExtension`、富文本插件都已切到这组 hook。
- `graphic.animates` 仍保留为兼容别名，但只指向 `AnimationStateManager` 内部维护的同一份 Map，不再作为 graphic 层独立状态源。
- 新增 `animate-tracking.test.ts`、补充 `normal-attrs.test.ts` 与 `state-animation.test.ts`，固定了“无 `animates` 字段时仍能识别活动动画”和“状态停止委托给 animation state manager”的行为。

---

### 🟡 任务 2.4：解耦 stateAnimateConfig 上下文依赖

**优先级**：🟢 P2
**预估时间**：1-2 小时
**当前状态**：✅ 已完成
**负责人**：资深开发者

**任务描述**：
将 `stateAnimateConfig` 从 `this.context` 中解耦，改为可选参数传入。

**具体任务**：
- [x] 修改状态方法的签名，支持可选 `animateConfig` 参数
- [x] 移除或降级 `this.context.stateAnimateConfig` 的依赖
- [x] 保持向后兼容：`context.stateAnimateConfig` 仍可作为默认值来源
- [x] 所有测试通过
- [x] TypeScript 编译通过

**验收标准**：
- [x] `animateConfig` 可通过参数传入
- [x] 向后兼容 `context.stateAnimateConfig`
- [x] 所有测试通过
- [x] TypeScript 编译通过

**补充说明**：
- `StateTransitionOrchestrator` 不再直接读取 `graphic.context` 或 `graphic.stateAnimateConfig`；动画配置现在由 `graphic.resolveStateAnimateConfig()` 先解析，再显式传入 orchestrator。
- 当前优先级为：显式 `animateConfig` > `graphic.stateAnimateConfig` > `context.stateAnimateConfig` > `DefaultStateAnimateConfig`。
- 新增/更新了 `state-animation.test.ts` 与 `state-transition-orchestrator.test.ts`，覆盖显式配置覆盖、graphic 配置优先和 context 兜底三条路径。

---

## 📋 任务组 3：阶段三 - 行为校正（可选）

### 🟢 任务 3.1：深度合并嵌套状态属性

**优先级**：🟢 P2
**预估时间**：1-2 小时
**当前状态**：✅ 已完成
**负责人**：资深开发者

**任务描述**：
实现嵌套状态属性的深度合并（而非当前的整体替换）。

**具体任务**：
- [x] 修改 `StateStyleResolver` 支持深度合并
- [x] 编写深度合并的测试用例
- [x] 确保与现有浅合并行为的兼容性（通过 feature flag 或配置）
- [x] 更新文档

**验收标准**：
- [x] 深度合并功能正常
- [x] 向后兼容可配置

**补充说明**：
- 默认行为仍保持浅合并；只有显式设置 `graphic.stateMergeMode = 'deep'` 时，`graphic.useStates()` 才会走深度合并路径。
- 深度合并在 graphic 集成层使用当前属性快照作为基底，因此首次进入状态时，未覆盖的嵌套字段会被保留。
- `state-resolution.test.ts` 新增了 `stateMergeMode='deep'` 的集成测试，`state-style-resolver.test.ts` 继续覆盖 resolver 级别的显式 deep 模式。

---

### 🟢 任务 3.2：补充 beforeStateUpdate 事件

**优先级**：🟢 P2
**预估时间**：1-2 小时
**当前状态**：✅ 已完成
**负责人**：资深开发者

**任务描述**：
在状态应用前补充 `beforeStateUpdate` 事件，支持拦截。

**具体任务**：
- [x] 在 `applyStateAttrs` 前触发 `beforeStateUpdate` 事件
- [x] 事件携带新旧状态信息
- [x] 编写相关测试
- [x] 更新文档

**验收标准**：
- [x] `beforeStateUpdate` 事件正常工作
- [x] 测试覆盖
- [x] 文档更新

**补充说明**：
- `beforeStateUpdate` 已在 `graphic.useStates()` / `clearStates()` 以及 glyph 对应路径中落地，触发时机位于 `currentStates`、`normalAttrs` 和属性实际更新之前。
- 事件 detail 固定包含 `prevStates`、`nextStates`、`attrs`、`hasAnimation`、`isClear`、`type=AttributeUpdateType.STATE`，监听器可通过 `preventDefault()` 终止本次状态应用。
- 在无 stage event manager 的环境下，graphic 会回退到本地节点事件分发，保证单测和离线调用也能收到该事件。

---

### 🟢 任务 3.3：配置化禁止动画属性规则

**优先级**：🟢 P2
**预估时间**：1-2 小时
**当前状态**：✅ 已完成
**负责人**：资深开发者

**任务描述**：
将禁止动画的属性列表从硬编码改为可配置。

**具体任务**：
- [x] 在 `IAnimateConfig` 中添加禁止动画属性配置
- [x] 修改 `StateTransitionOrchestrator` 支持该配置
- [x] 编写测试
- [x] 更新文档

**验收标准**：
- [x] 禁止动画属性可配置
- [x] 测试覆盖
- [x] 文档更新

**补充说明**：
- `IAnimateConfig` 当前支持 `noAnimateAttrs?: string[] | Record<string, boolean | number>`，用于追加禁止动画属性。
- orchestrator 会把 `animateConfig.noAnimateAttrs` 与图形内建的 `getNoWorkAnimateAttr()` 结果合并，因此默认规则保持兼容，外部配置只做增量扩展。
- 相关测试已覆盖 orchestrator 级别的拆分结果，以及 `graphic.useStates()` 的集成路径。

---

## 📊 任务完成追踪

### 统计信息
- **总任务数**：11 个
- **已完成**：11 个
- **进行中**：0 个
- **待开始**：0 个

### 当前进度
```
进度：100% (11/11)
[████████████████████████████████████████████████████████████████]
```

---

## ✅ 完成标准

### 阶段一完成
- [x] 任务 1.1：StateModel 类提取完成
- [x] 任务 1.2：StateStyleResolver 创建完成
- [x] 任务 1.3：StateTransitionOrchestrator 创建完成
- [x] 任务 1.4：对照测试全部通过

### 阶段二完成
- [x] 任务 2.1：graphic.ts 状态方法重构完成
- [x] 任务 2.2：GraphicStateExtension 职责清理完成
- [x] 任务 2.3：动画追踪统一完成
- [x] 任务 2.4：stateAnimateConfig 解耦完成

### 阶段三完成（可选）
- [x] 任务 3.1：深度合并实现
- [x] 任务 3.2：beforeStateUpdate 事件补充
- [x] 任务 3.3：禁止动画属性配置化

### 整体完成
- [x] 所有核心任务（P1）完成
- [x] TypeScript 编译通过
- [x] 所有单元测试通过（vrender-core: 432/432 tests, vrender-animate: 18/18 tests）
- [x] ESLint 检查通过（0 error / 0 warning）
- [ ] B1 架构验收通过

---

## 🎯 执行顺序

### 推荐顺序
1. **任务 1.1**：提取 StateModel（基础依赖）
2. **任务 1.2**：创建 StateStyleResolver（基础依赖）
3. **任务 1.3**：创建 StateTransitionOrchestrator（依赖 1.1、1.2）
4. **任务 1.4**：编写对照测试（依赖 1.1、1.2、1.3）
5. **任务 2.1**：重构 graphic.ts（依赖 1.1、1.2、1.3）
6. **任务 2.2**：清理 GraphicStateExtension（依赖 2.1）
7. **任务 2.3**：统一动画追踪（依赖 2.2）
8. **任务 2.4**：解耦 stateAnimateConfig（依赖 2.1）
9. **任务 3.1-3.3**：阶段三可选任务（可按需执行）

### 并行可能性
- 任务 1.1、1.2、1.3 可以并行（独立模块）
- 任务 2.2 依赖 2.1，2.3 依赖 2.2
- 任务 2.4 可与 2.1 并行
- 任务 3.1、3.2、3.3 可并行

---

**文档版本**：v1.1
**创建时间**：2026-04-02
**最后更新**：2026-04-03
**状态**：🔄 已完成，待验收
