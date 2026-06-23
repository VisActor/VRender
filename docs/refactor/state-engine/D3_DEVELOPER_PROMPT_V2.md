# D3 开发者沟通 Prompt V2 - 图形状态引擎重构

> **目标读者**：资深开发者（另一个 Agent）
> **沟通目的**：基于期望文档、D3 架构设计 v1.1，与开发者讨论技术实现细节
> **文档状态**：待讨论
> **版本**：v1.1
> **前置必读文档**：
> 1. `graphic-state-animation-refactor-expectation.md`（期望文档，必须先读）
> 2. `D3_ARCH_DESIGN.md`（架构设计文档 v1.1）

---

## 📋 背景

### 期望文档（必须先读）

本次重构的根本指导文档是 `graphic-state-animation-refactor-expectation.md`。它定义了重构的**目标、边界、场景和约束**。D3 架构设计是对这份期望文档的工程落地方案，已更新至 v1.1。

### D3 v1.1 关键修订（必读）

相比之前的草案，v1.1 修正了 6 处原则性问题：

| 修订点 | v1.0 问题 | v1.1 修订 |
|--------|-----------|-----------|
| **attribute 语义** | 改为 Proxy/getter 只读 computed view | 保留稳定对象身份，通过 `_syncAttribute()` 原地同步，不再保证直接赋值兼容 |
| **exclude/suppress 裁决顺序** | "先裁决再排序" | **先排序再裁决**，编译时预计算闭包 |
| **resolver 缓存策略** | "共享层持有 resolver 结果" | 只做**图元级短缓存**，共享层不持有实例相关结果 |
| **API 边界** | `applyState` 作为公开 API | 仅内部方法名，外部用现有 `useStates/addState/removeState/toggleState/clearStates` |
| **currentStates 改名** | 强制改名为 `activeStates` | D3 v1 先保持兼容别名映射 |
| **PerformanceRAF.wait()** | 当作现有 API | 明确为**新增 API** |
| **stateProxy 扩展** | 扩展为可返回完整 StateDefinition | D3 v1 不扩展，仍为 `Partial<T>` |

---

## 🎯 D3 v1.1 架构设计概要

### 属性分层（修订）

```
baseAttributes（T）        setAttribute 写入的真值，状态系统不可覆盖
resolvedStatePatch        effectiveStates 解析出的合并 patch
attribute（T）           稳定对象，_syncAttribute() 原地同步计算结果
```

`_syncAttribute()` = `Object.assign(attribute, baseAttributes, resolvedStatePatch)`，直接写入现有对象。大量现有代码（step.ts:174、transform 路径等）对 attribute 可变对象的依赖完全兼容。

### exclude/suppress 裁决顺序（修订）

```
Step 1: 追加新状态到候选集
Step 2: 编译时预计算 exclude/suppress 传递闭包（无 while 循环）
Step 3: 按 priority 降序 + rank 升序排序
Step 4: 从高到低依次裁决（按排序后顺序）
Step 5: effectiveStates = activeStates - suppressed
Step 6: 从低到高应用 patch
Step 7: _syncAttribute() → diff & commit → 动画
```

### resolver 缓存策略（修订）

- 共享层只共享静态定义 + 编译结果
- resolver.patch **不做共享层缓存**
- resolver 结果仅**图元级短缓存**：缓存键 = `(resolverFn, effectiveStates.join(','), definitionVersion)`

---

## 🔧 需要讨论的技术细节

### 讨论 1：_syncAttribute 的实现策略

**当前设计**：

```typescript
private _syncAttribute(): void {
  // 1. 先写 base 层
  for (const key in this.baseAttributes) {
    (this.attribute as any)[key] = (this.baseAttributes as any)[key];
  }
  // 2. 再写 patch 层
  for (const key in this.resolvedStatePatch) {
    (this.attribute as any)[key] = (this.resolvedStatePatch as any)[key];
  }
  this._attributeVersion++;
  this.addUpdateBoundTag();
}
```

**问题**：
- `_syncAttribute` 全量写入 attribute，每次都要遍历 baseAttributes + patch 的所有 key。当字段多（50+）时开销如何？
- 是否有优化空间？例如：只写入 patch 覆盖的 key + base 原始 key，保留 attribute 中不属于 base/patch 的字段（动画中间值）？

```typescript
// 优化方案
private _syncAttribute(): void {
  // 保留 attribute 中不在 base+patch 范围内的字段（如动画中间值）
  for (const key in this._prevPatch) {
    if (!(key in this.resolvedStatePatch) && !(key in this.baseAttributes)) {
      // 动画中间值，保留
    } else {
      delete (this.attribute as any)[key];
    }
  }
  Object.assign(this.attribute, this.baseAttributes);
  Object.assign(this.attribute, this.resolvedStatePatch);
  this._attributeVersion++;
  this.addUpdateBoundTag();
}
```

**请开发者回答**：_syncAttribute 的具体实现策略，以及全量写入的性能评估。

---

### 讨论 2：exclude/suppress 裁决算法

**当前设计**（候选集用 Array，排序后从后往前遍历）：

```typescript
// candidate 已按 priority 降序 + rank 升序排好
// 高优先级在后面（candidate[last] = highest priority）
// 从后往前遍历（先处理高优先级）
for (let i = candidate.length - 1; i >= 0; i--) {
  const stateName = candidate[i];
  const def = this.compiledDefinitions.get(stateName);
  // exclude[]: 从候选集移除
  // suppress[]: 标记 suppressed
}
```

**问题**：
- 候选集用 Array：`indexOf` + `splice` 是 O(n)，大量状态时是否需要用 Set 替代？
- 环形 exclude 依赖（A exclude B，B exclude A）如何检测和处理？例如报编译警告并做仲裁？
- 编译时已预计算闭包，运行时是否还需要遍历 n×m 次（n=状态数，m=exclude+suppress 列表长度）？

**请开发者回答**：裁决算法的具体实现建议，以及环形依赖检测。

---

### 讨论 3：动画层与 _syncAttribute 的交互

**关键场景**：状态切换动画执行中，`attribute` 正被 Step 逐步覆盖。此时 `_syncAttribute` 再次被调用会怎样？

**当前设计假设**：`stopStateAnimates()` 在状态切换前停止旧动画，`_syncAttribute` 只在动画停止后执行。

**问题**：
- `stopStateAnimates()` 停止的是什么动画？（状态动画 vs 普通动画）
- 动画执行期间再次触发状态切换，如何避免 `_syncAttribute` 打断正在进行动画？
- Step 持续写入 attribute，与 `_syncAttribute` 的写入是否有并发风险？

**请开发者回答**：动画层与状态引擎的协作机制。

---

### 讨论 4：resolver 缓存的具体实现

**当前设计**：

```typescript
// 图元级短缓存
private _resolverPatchCache: Map<string, Partial<T>>;  // key: effectiveStates.join(',')
private _resolverCacheDefVersion: number = -1;

private getResolverPatch(stateName: string): Partial<T> | undefined {
  const cacheKey = this._effectiveStates.join(',');
  if (this._resolverCacheDefVersion === this._definitionVersion &&
      this._resolverPatchCache.has(cacheKey)) {
    return this._resolverPatchCache.get(cacheKey);
  }
  // 重新计算并缓存
  const def = this.compiledDefinitions.get(stateName);
  if (!def?.resolver) { return undefined; }
  const patch = def.resolver(this.graphic, this.context);
  this._resolverPatchCache.set(cacheKey, patch);
  this._resolverCacheDefVersion = this._definitionVersion;
  return patch;
}
```

**问题**：
- `_definitionVersion` 如何维护？当 Group 的 sharedStateDefinitions 变化时，如何 invalidate 子图元缓存？
- 懒失效 vs 显式事件通知哪个更合适？
- 是否需要 LRU 淘汰策略（resolver 可能产生大量不同的 patch 组合）？

**请开发者回答**：resolver 缓存实现和 definition 版本追踪机制。

---

### 讨论 5：分帧调度的 attribute 一致性

**问题**：
- 分帧期间部分图元已完成 `_syncAttribute`，部分还未完成
- render tick 读取 attribute 时会看到不一致状态
- 这是否由"允许短暂视觉不一致"兜底？还是需要 render 层做额外处理？
- `_syncAttribute` 是否应该在 RAF 边界内完成，确保一帧内所有图元同步？

**请开发者回答**：分帧期间 attribute 一致性的处理策略。

---

### 讨论 6：PerformanceRAF.wait() 的新增位置

**问题**：
- `PerformanceRAF` 是 `vglobal` 上的实例还是独立类？
- `wait()` 加在 `PerformanceRAF` 实例上还是 `vglobal` 上？

```typescript
// 候选 A
const raf = application.global.performanceRAF;
await raf.wait();

// 候选 B
await application.global.waitForNextFrame();

// 候选 C
// 不暴露，由 StateBatchScheduler 内部封装
```

**请开发者回答**：`PerformanceRAF.wait()` 的正确添加位置。

---

### 讨论 7：sharedStateDefinitions 的变更通知

**问题**：
- Group.sharedStateDefinitions 变化时，如何 invalidate 子图元的缓存？
- 懒失效（下次状态操作时检测版本）vs 显式事件通知哪个更合适？
- 如何避免频繁通知触发大量 invalidate？

**请开发者回答**：共享定义变更通知机制的实现方案。

---

## ❓ 需要开发者最终回答的问题清单

1. **\_syncAttribute**：全量写入 vs 增量写入，动画中间值保留策略，性能评估
2. **裁决算法**：候选集用 Array vs Set，环形依赖检测
3. **动画交互**：`_syncAttribute` 与正在进行的动画的并发安全性
4. **resolver 缓存**：definition 版本追踪，懒失效 vs 显式通知，LRU 淘汰
5. **分帧一致性**：分帧期间 attribute 不一致的处理
6. **PerformanceRAF.wait()**：新增 API 的位置和形式
7. **共享定义通知**：懒失效 vs 显式事件通知

---

## 📚 参考文档

| 文档 | 说明 |
|------|------|
| `graphic-state-animation-refactor-expectation.md` | **必须先读**，重构期望文档 |
| `D3_ARCH_DESIGN.md` v1.1 | D3 架构设计文档 |
| `packages/vrender-core/src/graphic/graphic.ts` | 当前 graphic 实现 |
| `packages/vrender-core/src/common/performance-raf.ts` | PerformanceRAF 现有 API |
| `packages/vrender-animate/src/step.ts` | 动画 Step，依赖 attribute 可变对象 |
| `packages/vrender-core/src/graphic/theme.ts` | Theme 实现 |

---

## 📊 实施计划参考（v1.1 确认版）

| Phase | 内容 | 预估 |
|-------|------|------|
| 1 | 状态引擎内核（activeStates/effectiveStates、priority/rank、exclude/suppress裁决、编译器、resolver） | ★★★☆☆ |
| 2 | 属性分层（baseAttributes / resolvedStatePatch / attribute + _syncAttribute / setAttribute 收敛） | ★★★★☆ |
| 3 | 共享状态定义（Group sharedStateDefinitions / Theme / prototype chain） | ★★☆☆☆ |
| 4 | 性能优化（影响分类 / 分帧提交 / delta diff / paint-only 快路径 + PerformanceRAF.wait()） | ★★★☆☆ |

---

**沟通完成后**，请将你的回答整理成文档，标注需要架构设计师确认的技术决策点。
