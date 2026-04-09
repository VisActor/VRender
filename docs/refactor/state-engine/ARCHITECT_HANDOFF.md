# VRender 状态引擎重构 — 架构师交接文档

> **文档类型**：架构师交接文档
> **交接人**：Claude（前任架构师）
> **接收人**：下一任架构师
> **交接日期**：2026-04-07
> **项目**：VRender 图形状态引擎重构（D3 项目）

---

## 1. 项目背景与目标

### 1.1 重构动机

VRender 当前的状态系统存在以下问题：
- 状态管理与样式合并逻辑分散在 VChart 和 VRender 之间
- 缺乏统一的状态优先级和冲突裁决模型
- 状态定义无法共享，每个图元重复持有
- 属性更新路径不清晰（`attribute`/`normalAttrs`/`finalAttribute` 混用）
- 纯视觉状态切换无法走快路径

### 1.2 重构目标

建立以**图元静态状态真值模型**为核心的状态引擎：

1. 图元自己管理静态展示状态，外部只声明状态
2. 统一的状态优先级和冲突裁决（priority/rank/exclude/suppress）
3. 共享状态定义优先（Group/Theme 层）
4. 属性分层：`baseAttributes` + `resolvedStatePatch` → `attribute`
5. 纯视觉状态切换保持快路径
6. 状态与动画边界清晰

### 1.3 重构范围

**包含**：
- 静态展示状态（hover/selected/disabled/业务自定义态）
- 状态过渡动画
- 属性分层机制

**不包含**：
- appear/update/exit/highlight 等动画生命周期状态
- morph 能力
- incremental draw 整体重写

---

## 2. 当前项目状态

### 2.1 已完成工作（Phase 1）

**Phase 1：状态引擎内核** 已完成并通过验证。

**已实现能力**：
- `StateDefinition<T>` / `CompiledStateDefinition<T>` 类型系统
- `StateDefinitionCompiler`（归一化、rank 分配、exclude/suppress 传递闭包）
- `StateEngine`（activeStates/effectiveStates、priority/rank 排序、exclude/suppress 裁决、resolver 缓存）
- `StateModel` 增强（委托 StateEngine、新增 effectiveStates 返回）
- `graphic.states: StateDefinitionsInput<T>` 公开类型
- `graphic.invalidateResolver()` 方法
- `graphic.effectiveStates` / `graphic.resolvedStatePatch` 属性

**验证结果**：
```
✅ rush compile -t @visactor/vrender-core 通过
✅ vrender-components / vrender-kits / vrender compile 通过
✅ vrender-core test: 82/82 suites, 451/451 tests 通过
✅ 状态相关测试: 12/12 suites, 101/101 tests 通过
✅ ESLint: 0 error / 0 warning
```

**Phase 1 关键文件**：
- `packages/vrender-core/src/graphic/state/state-definition.ts` — 类型定义
- `packages/vrender-core/src/graphic/state/state-definition-compiler.ts` — 编译器
- `packages/vrender-core/src/graphic/state/state-engine.ts` — 状态引擎
- `packages/vrender-core/src/graphic/state/state-model.ts` — 模型增强
- `packages/vrender-core/src/graphic/graphic.ts` — 集成点（StateEngine 创建、useStates 增强）

### 2.2 待完成工作

**Phase 2：属性分层**（待实现）
- 引入 `baseAttributes` 字段
- 实现 `_syncAttribute()` 同步机制
- 修改 `setAttribute/setAttributes/_setAttributes/initAttributes` 写入目标
- `normalAttrs` 兼容处理
- 状态变化后触发 `_syncAttribute()`

**Phase 3：共享状态定义**（待实现）
- Group `sharedStateDefinitions`
- Theme `stateDefinitions`
- prototype chain 继承

**Phase 4：性能优化**（待实现）
- 影响分类精细化（PAINT 独立路径）
- 分帧状态提交
- delta diff & commit

### 2.3 设计文档状态

| 文档 | 版本 | 状态 | 说明 |
|------|------|------|------|
| `D3_ARCH_DESIGN.md` | v1.6 | 草稿，待评审 | 整体架构设计，需下一任继续完善并进入评审 |
| `D3_PHASE1_IMPLEMENTATION_GUIDE.md` | v1.0 | 已完成 | Phase 1 实现指南，已执行完毕 |
| `D3_PHASE1_DEVELOPER_PROMPT.md` | v1.0 | 已完成 | Phase 1 开发者沟通，已执行完毕 |
| `D3_PHASE2_IMPLEMENTATION_GUIDE.md` | v1.0 | 待实现 | Phase 2 实现指南，已撰写待执行 |
| `D3_PHASE2_DEVELOPER_PROMPT.md` | v1.0 | 待实现 | Phase 2 开发者沟通，已撰写待执行 |

**关键说明**：
- `D3_ARCH_DESIGN.md` v1.6 是完整的架构设计文档，但尚未经过正式评审
- 下一任架构师需要继续完善设计文档，解决评审中发现的问题
- Phase 2 实现指南已撰写，但需要在设计文档评审通过后再执行

---

## 3. 关键上下文信息

### 3.1 核心设计决策（已确定）

**属性分层模型**：
```
baseAttributes（Layer 1）    ← setAttribute 写入的真值
resolvedStatePatch（Layer 2） ← StateEngine 计算的 patch
attribute（Layer 3）          ← _syncAttribute() 同步结果
```

**状态裁决顺序**：
1. 去重候选集
2. 按 priority 升序 + rank 升序排序（低优先级在前）
3. 倒序遍历裁决（高优先级先裁决）
4. exclude 从候选集移除，suppress 标记到 suppressedSet
5. effectiveStates = activeStates - suppressed

**resolver 缓存策略**：
- 图元级短缓存
- 缓存键：(resolverFn, effectiveStates.join(','), definitionVersion)
- 失效条件：effectiveStates 变化 / definition 变化 / 业务显式失效

### 3.2 待决策问题（下一任需要确认）

**Phase 2 关键决策**：
1. `normalAttrs` 处理方式：删除 / 兼容别名 / 过渡保留？
2. `finalAttribute` 与动画层边界：动画层直接写 attribute 还是 finalAttribute？
3. `setAttribute` 触发时机：立即同步还是批量延迟？
4. UpdateTag 处理：Phase 2 是否引入 PAINT 独立路径？

**设计文档评审关注点**：
- 纯视觉快路径是否被破坏（_syncAttribute 是否无条件打 bounds tag）
- attribute 同步是否能正确表达最终属性视图（patch 消失 key 的回退）
- 状态动画目标定义是否清晰（final result vs resolvedStatePatch）
- 实例级状态定义是否已移出核心路径
- 状态集合是否先归一化去重再进入排序裁决

### 3.3 技术约束

**必须保持兼容**：
- `graphic.useStates/addState/removeState/toggleState/clearStates`
- `graphic.stateProxy/stateSort/stateMergeMode`
- `graphic.attribute` 读取（语义变为同步后的 final result）

**Breaking Change（已接受）**：
- `graphic.attribute.fill = 'red'` 直接赋值不再保证
- `graphic.normalAttrs` 需要决策处理方式

**性能目标**：
- 纯视觉状态切换保持快路径
- 几千级图元交互稳定
- 几万级图元有分帧兜底

---

## 4. 文档索引

### 4.1 必读文档（按优先级）

| 优先级 | 文档路径 | 说明 |
|--------|----------|------|
| P0 | `docs/refactor/graphic-state-animation-refactor-expectation.md` | **重构期望文档**，所有设计的最终参照 |
| P0 | `docs/refactor/state-engine/D3_ARCH_DESIGN.md` | **架构设计文档** v1.6，需继续完善并评审 |
| P1 | `docs/refactor/state-engine/D3_PHASE2_IMPLEMENTATION_GUIDE.md` | Phase 2 实现指南，待执行 |
| P1 | `docs/refactor/state-engine/D3_PHASE2_DEVELOPER_PROMPT.md` | Phase 2 开发者沟通，待执行 |
| P2 | `docs/refactor/state-engine/D3_PHASE1_IMPLEMENTATION_GUIDE.md` | Phase 1 实现指南（已完成，参考） |
| P2 | `docs/refactor/state-engine/D3_PHASE1_DEVELOPER_PROMPT.md` | Phase 1 开发者沟通（已完成，参考） |

### 4.2 关键代码文件

| 文件路径 | 说明 |
|----------|------|
| `packages/vrender-core/src/graphic/state/state-definition.ts` | 类型定义（StateDefinition, CompiledStateDefinition, StateResolveContext） |
| `packages/vrender-core/src/graphic/state/state-definition-compiler.ts` | 编译器实现 |
| `packages/vrender-core/src/graphic/state/state-engine.ts` | 状态引擎实现 |
| `packages/vrender-core/src/graphic/state/state-model.ts` | 模型增强（委托 StateEngine） |
| `packages/vrender-core/src/graphic/state/state-style-resolver.ts` | 样式解析器（resolveWithCompiled） |
| `packages/vrender-core/src/interface/graphic.ts` | IGraphic 接口（effectiveStates, resolvedStatePatch, invalidateResolver） |
| `packages/vrender-core/src/graphic/graphic.ts` | Graphic 实现（StateEngine 集成点） |

### 4.3 测试文件

| 文件路径 | 说明 |
|----------|------|
| `packages/vrender-core/__tests__/unit/graphic/state-definition-compiler.test.ts` | 编译器测试 |
| `packages/vrender-core/__tests__/unit/graphic/state-engine.test.ts` | 状态引擎测试 |
| `packages/vrender-core/__tests__/unit/graphic/state-model.test.ts` | 模型测试（现有） |
| `packages/vrender-core/__tests__/unit/graphic/graphic-state.test.ts` | 集成测试（现有） |

---

## 5. 下一任架构师任务清单

### 5.1  immediate 任务（交接后 1-2 周）

- [ ] 完整阅读 `graphic-state-animation-refactor-expectation.md` 和 `D3_ARCH_DESIGN.md` v1.6
- [ ] 审查 Phase 1 实现代码（state-definition.ts, state-engine.ts, graphic.ts 集成点）
- [ ] 确认 Phase 2 关键决策（normalAttrs/finalAttribute/触发时机/UpdateTag）
- [ ] 完善 `D3_ARCH_DESIGN.md`，解决以下潜在问题：
  - 纯视觉快路径是否被破坏
  - attribute 同步是否能正确表达最终属性视图
  - 状态动画目标定义是否清晰
  - 实例级状态定义是否已移出核心路径
  - 状态集合是否先归一化去重
- [ ] 组织设计文档评审会

### 5.2 短期任务（1 个月内）

- [ ] 完成设计文档评审，收敛所有技术决策
- [ ] 确认 Phase 2 实现指南与最终设计一致
- [ ] 指导开发者执行 Phase 2 实现
- [ ] 审查 Phase 2 代码，确保符合设计

### 5.3 中期任务（2-3 个月）

- [ ] 设计 Phase 3（共享状态定义）
- [ ] 设计 Phase 4（性能优化）
- [ ] 推动整体重构完成并发布

---

## 6. 重要联系人与沟通渠道

### 6.1 项目角色

| 角色 | 职责 | 当前状态 |
|------|------|----------|
| 协调者（用户） | 项目整体协调、决策确认 | 活跃 |
| 架构师（交接人） | 已完成 Phase 1，交接中 | 即将退出 |
| 架构师（接收人） | 继续完成设计并进入评审 | 待接手 |
| 资深开发者 | Phase 1 已实现，待 Phase 2 | 活跃 |

### 6.2 沟通记录

**已完成评审**：
- Phase 1 设计评审（多轮，已收敛）
- Phase 1 实现验收（已通过）

**待进行评审**：
- D3_ARCH_DESIGN.md v1.6 正式评审（下一任组织）
- Phase 2 设计评审（待 Phase 2 指南更新后）

---

## 7. 风险与注意事项

### 7.1 已知风险

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| Phase 2 属性分层改动面大 | 可能影响现有测试和下游包 | 保持 normalAttrs 兼容，逐步迁移 |
| 动画层与 _syncAttribute 并发 | 可能产生不一致状态 | 明确动画层直接写 attribute，状态系统负责恢复 |
| 纯视觉快路径被破坏 | 性能回归 | 确保 _syncAttribute 不无条件打 bounds tag |

### 7.2 注意事项

- **不要跳过设计评审直接实现 Phase 2**：Phase 2 实现指南基于 v1.6 设计，若设计评审有变更，指南需要同步更新
- **保持与资深开发者的密切沟通**：开发者已实现 Phase 1，对代码熟悉，技术决策需要征求其意见
- **关注下游包影响**：vrender-components / vrender-kits 依赖 vrender-core，类型变更需要同步适配

---

## 8. 交接确认

### 8.1 交接人确认（Claude）

- [x] 所有设计文档已整理完毕
- [x] Phase 1 实现已完成并通过验证
- [x] Phase 2 实现指南已撰写
- [x] 关键上下文已记录
- [x] 待决策问题已列出

### 8.2 接收人确认（下一任架构师）

请接收人在接手后确认：

- [ ] 已阅读本交接文档
- [ ] 已阅读期望文档和 D3_ARCH_DESIGN.md v1.6
- [ ] 已审查 Phase 1 实现代码
- [ ] 已理解当前项目状态和待完成工作
- [ ] 已准备好继续完成设计并进入评审

---

## 9. 附录

### 9.1 术语表

| 术语 | 说明 |
|------|------|
| activeStates | 真实激活状态集合（含 suppressed） |
| effectiveStates | 真正参与样式求值的状态集合（不含 suppressed） |
| resolvedStatePatch | effectiveStates 解析出的合并 patch |
| baseAttributes | setAttribute 写入的真值（Layer 1） |
| exclude | 互斥：目标状态从 activeStates 移除 |
| suppress | 压制：目标状态保留在 activeStates 但不进入 effectiveStates |
| resolver | 单状态黑盒，给定图元上下文计算 patch |
| declaredAffectedKeys | resolver 声明的稳定 key 集，用于编译期 paint-only 判定 |

### 9.2 参考链接

- 期望文档：`docs/refactor/graphic-state-animation-refactor-expectation.md`
- 架构设计：`docs/refactor/state-engine/D3_ARCH_DESIGN.md`
- Phase 2 指南：`docs/refactor/state-engine/D3_PHASE2_IMPLEMENTATION_GUIDE.md`
- Phase 2 Prompt：`docs/refactor/state-engine/D3_PHASE2_DEVELOPER_PROMPT.md`

---

**交接完成日期**：2026-04-07
**下一任架构师接手日期**：待填写
