# D3 开发者沟通 Prompt - 图形状态引擎重构

> **目标读者**：资深开发者（另一个 Agent）
> **沟通目的**：基于期望文档和 D3 架构设计，与开发者讨论技术实现细节
> **文档状态**：待讨论
> **前置必读文档**：
> 1. `graphic-state-animation-refactor-expectation.md`（期望文档）
> 2. `D3_ARCH_DESIGN.md`（架构设计文档）

---

## 📋 背景

### 期望文档（必须先读）

本次重构的根本指导文档是 `graphic-state-animation-refactor-expectation.md`。它定义了重构的**目标、边界、场景和约束**。D3 架构设计是对这份期望文档的工程落地方案。

**期望文档的核心要点（供快速参考）**：

1. **核心目标**：图元自己管理静态展示状态真值；外部只声明状态，不手工拼接样式
2. **重构范围**：静态展示状态（hover/selected/disabled/业务自定义态）+ 状态过渡动画
3. **不包含**：appear/update/exit/highlight 等动画生命周期状态、morph 能力本身、incremental draw 整体重写
4. **平铺状态模型**：所有状态一视同仁，不引入 interaction/selection/business 槽位
5. **属性分层**：`baseAttributes` + `resolvedStatePatch` → `attribute`（computed view）
6. **Breaking change**：不再保证 `graphic.attribute.fill = 'red'` 直接赋值的兼容；写语义收敛到 `setAttribute`/`setAttributes`
7. **exclude vs suppress**：exclude = 从 activeStates 移除（不自动恢复）；suppress = 保留在 activeStates 但不进入 effectiveStates
8. **性能策略**：批量状态切换可分帧（仅 paint-only），几何/bounds/pick 变化保持同步收敛
9. **共享状态定义**：优先放在 Group/Theme，避免单图元重复持有
10. **状态与动画边界**：静态状态真值是 source of truth；过渡动画服从真值；自驱动画结束后回到真值

---

## 🎯 D3 架构设计概要

D3 是对期望文档的完整工程落地方案，包含以下子系统：

### 1. 属性分层子系统
- `baseAttributes`：setAttribute 写入的真值
- `resolvedStatePatch`：effectiveStates 解析出的合并 patch
- `attribute`：缓存的 computed view（只读）
- `getComputedAttribute(name)`：单属性读取优化
- **Breaking change**：直接赋值 `graphic.attribute.fill = 'red'` 不再可靠

### 2. 状态引擎子系统
- `activeStates`：归一化后的激活状态集合（包含 suppress 的状态，不含 exclude 的状态）
- `effectiveStates`：`activeStates` 的子集（不含 suppress 的状态）
- priority + rank 双维排序
- exclude（移除）/ suppress（压制）语义
- 不自动恢复被 exclude 的状态

### 3. 状态定义编译器子系统
- StateDefinition：name / priority / rank / patch / resolver / exclude[] / suppress[]
- 兼容简写格式 `{ hover: { fill: 'red' } }`
- exclude/suppress 传递闭包计算

### 4. 共享状态定义子系统
- Group sharedStateDefinitions
- Theme stateDefinitions
- prototype chain 继承

### 5. 影响分类子系统
- UpdateCategory：PAINT / SHAPE / BOUNDS / TRANSFORM / LAYOUT / PICK
- 基于 patch delta 自动推断影响范围
- paint-only 走快路径

### 6. 批量状态切换子系统
- 两层配置：VRender 层（Stage/Layer/Group）+ VChart 接入层（透传用户配置）
- 仅 paint-only 默认分帧
- 涉及几何/bounds/pick 保持同步收敛

---

## 🔧 需要讨论的技术细节

### 讨论 1：attribute 缓存的版本管理

**已定案**：必须有缓存，不能每次读取都计算。

**当前设计**：三级缓存 + 版本号/缓存戳脏检查。

```typescript
class Graphic<T> {
  // 三级缓存
  baseAttributes: T;                    // 持久
  private _resolvedPatchCache: Partial<T>;  // 状态集合变化时重算
  private _attributeCache: T | null;   // 懒刷新

  // 版本管理
  private _baseVersion: number = 0;     // baseAttributes 版本
  private _patchVersion: number = 0;   // resolvedStatePatch 版本
  private _cacheVersion: number = 0;   // attribute 缓存版本

  get attribute(): T {
    if (this._attributeCache == null ||
        this._baseVersion !== this._cacheBaseVersion ||
        this._patchVersion !== this._cachePatchVersion) {
      this._attributeCache = Object.assign({}, this.baseAttributes, this.resolvedStatePatch);
      this._cacheBaseVersion = this._baseVersion;
      this._cachePatchVersion = this._patchVersion;
    }
    return this._attributeCache;
  }
}
```

**问题**：
- 版本号管理是否有更简洁的方案？（例如用递增的 globalVersion）
- `getGraphicTheme` 变化（theme defaults 变化）时如何触发缓存失效？
- 涉及 GC 压力：每次 attribute 读取都会 `Object.assign` 生成新对象，是否有优化空间？
- `attribute` 缓存和 `resolvedStatePatch` 缓存是否需要合并？

**请开发者回答**：具体实现建议，以及 GC 压力的评估。

---

### 讨论 2：exclude/suppress 的实现路径

**已定案规则**：
- exclude：目标状态从 activeStates 中移除，不自动恢复
- suppress：目标状态保留在 activeStates 但不进入 effectiveStates
- 裁决顺序：先处理 exclude，再处理 suppress，再排序

**当前实现草案**：

```typescript
applyState(newStateNames: string[]): StateTransitionResult {
  // 1. 追加到 activeStates
  let active = [...this._activeStates, ...newStateNames];

  // 2. 应用 exclude（可能多次应用，直到闭包稳定）
  let changed = true;
  while (changed) {
    changed = false;
    for (const name of active) {
      const def = this.getStateDefinition(name);
      if (def?.exclude) {
        for (const excluded of def.exclude) {
          if (active.includes(excluded)) {
            active = active.filter(s => s !== excluded);
            changed = true;
          }
        }
      }
    }
  }

  // 3. 确定 suppressed 集合
  const suppressed = new Set<string>();
  for (const name of active) {
    const def = this.getStateDefinition(name);
    if (def?.suppress) {
      def.suppress.forEach(s => suppressed.add(s));
    }
  }

  // 4. effectiveStates = activeStates - suppressed
  this._effectiveStates = active.filter(s => !suppressed.has(s));
  this._activeStates = active;

  // 5. 排序
  this.sortActiveStates();

  // 6. 重算 patch
  this.recomputePatch();
}
```

**问题**：
- exclude 闭包的 while 循环在最坏情况下是否需要保护？（环形 exclude）
- suppress 集合的计算是否需要迭代？（A suppress B，B suppress C）
- 每次状态变化都重新计算 exclude/suppress 闭包，开销如何？
- 是否需要预计算 exclude/suppress 的传递闭包？

**请开发者回答**：具体实现建议，以及 exclude/suppress 闭包的性能考量。

---

### 讨论 3：状态定义来源的合并策略

**已定案**：共享状态定义优先（Group → Theme → 实例）。

**合并优先级**：实例 > Group > Theme（同优先级时）。

**问题**：
- 合并策略如何处理同名冲突？是否直接覆盖，还是需要显式声明优先级？
- StateDefinition 编译结果缓存在哪里？Group 持有还是图元持有？
- 如果 Group 的共享定义变化，如何通知子图元刷新？

```typescript
// 候选方案 A：图元持有编译结果
// 每次状态变化时，从 Group prototype chain 收集定义并编译
// 缺点：每次都重复编译

// 候选方案 B：Group 持有编译结果，图元持有引用
// Group 定义变化时标记所有子图元 dirty
// 缺点：需要维护父子关系

// 候选方案 C：混合
// Group 持有模板版本号 + 编译结果缓存
// 图元持有模板引用 + 版本号
// 版本号变化时懒重编译
```

**请开发者回答**：具体实现建议，以及 prototype chain 如何与状态定义继承配合。

---

### 讨论 4：影响分类的精细化

**已定案**：基于 patch delta 自动推断影响范围，区分 PAINT / SHAPE / BOUNDS / TRANSFORM / LAYOUT / PICK。

**当前分类表**：

```typescript
const ATTRIBUTE_CATEGORY: Record<string, UpdateCategory> = {
  fill: UpdateCategory.PAINT,
  stroke: UpdateCategory.PAINT,
  opacity: UpdateCategory.PAINT,
  lineWidth: UpdateCategory.SHAPE | UpdateCategory.BOUNDS,
  width: UpdateCategory.SHAPE | UpdateCategory.BOUNDS,
  height: UpdateCategory.SHAPE | UpdateCategory.BOUNDS,
  x: UpdateCategory.TRANSFORM | UpdateCategory.BOUNDS,
  y: UpdateCategory.TRANSFORM | UpdateCategory.BOUNDS,
  // ...
};
```

**问题**：
- 这个分类表是静态的，如何处理动态属性（例如某些图元类型特有的属性）？
- 是否需要图形类型级别的分类扩展机制？
- patch delta 的影响分类是否需要 diff 后再做判断？
- 当多个状态的 patch 合并后，如何合并影响分类？

**请开发者回答**：具体实现建议，以及图形类型扩展机制的设计。

---

### 讨论 5：分帧状态调度的实现

**已定案**：两层配置体系（VRender + VChart 透传），仅 paint-only 默认分帧。

**实现草案**：

```typescript
class StateBatchScheduler {
  schedule(graphics: IGraphic[], states: string[], config: IDeferredStateConfig): IDeferredStateJob {
    // 1. 过滤：只处理 paint-only 状态
    const paintOnly = graphics.filter(g => this.isPaintOnly(g, states));
    const sync = graphics.filter(g => !this.isPaintOnly(g, states));

    // 2. 同步处理几何/bounds/pick 变化
    for (const g of sync) {
      g.applyState(states);
    }

    // 3. 分帧处理 paint-only
    return this.deferredSchedule(paintOnly, config);
  }

  private async deferredSchedule(graphics: IGraphic[], config: IDeferredStateConfig) {
    const { frameBudget = 8, maxGraphicsPerFrame = 100 } = config;
    const start = performance.now();
    let count = 0;

    for (const g of graphics) {
      if (performance.now() - start >= frameBudget || count >= maxGraphicsPerFrame) {
        await PerformanceRAF.wait();
        count = 0;
      }
      g.applyState(states);
      count++;
    }
  }
}
```

**问题**：
- `isPaintOnly` 的判断如何实现？基于 StateDefinition 的 `affectsGeometry` 标志？
- 分帧期间图元的 `attribute` 缓存如何管理？
- 如何处理分帧取消（中途用户再次交互）？
- PerformanceRAF 是否已有 `wait()` API？还是需要新增？

**请开发者回答**：具体实现建议，以及与现有 PerformanceRAF 的集成方式。

---

### 讨论 6：resolver 执行时机的保护

**已定案**：resolver 只在状态集合变化时执行，不进入 render/animation/pick/bounds tick。

**问题**：
- 如何确保 resolver 不会在 tick 期间被意外调用？
- 是否需要显式的"安全上下文"检查？
- resolver 结果的缓存策略如何设计？

**请开发者回答**：具体实现建议。

---

### 讨论 7：现有测试基线的迁移

**当前测试覆盖**（state-animation.test.ts、state-transition-orchestrator.test.ts 等）需要适配新的架构。

**问题**：
- 新增测试：activeStates/effectiveStates 语义、exclude/suppress 规则、优先级排序
- 修改测试：attribute 读取路径、setAttribute 语义、缓存失效触发
- 兼容性测试：旧格式 states 是否仍然工作
- 性能测试：大规模状态切换的性能基线

**请开发者回答**：测试策略建议，以及需要重点覆盖的边界场景。

---

## ❓ 需要开发者最终回答的问题清单

1. **attribute 缓存**：三级缓存 + 版本管理的具体实现，GC 压力评估
2. **exclude/suppress**：闭包计算的性能，环形依赖保护
3. **状态定义合并**：来源合并策略，prototype chain 配合方式
4. **影响分类**：图形类型扩展机制，patch 合并后的分类合并
5. **分帧调度**：isPaintOnly 实现，PerformanceRAF 集成，分帧取消
6. **resolver 保护**：安全上下文检查，结果缓存策略
7. **测试策略**：基线迁移方案，重点覆盖的边界场景

---

## 📚 参考文档

| 文档 | 说明 |
|------|------|
| `graphic-state-animation-refactor-expectation.md` | **必须先读**，重构期望文档 |
| `D3_ARCH_DESIGN.md` | D3 架构设计文档（v1.0） |
| `packages/vrender-core/src/graphic/graphic.ts` | 当前 graphic 实现，attribute 写入读取路径 |
| `packages/vrender-core/src/graphic/state/state-style-resolver.ts` | 当前样式解析器 |
| `packages/vrender-core/src/graphic/state/state-transition-orchestrator.ts` | 当前状态过渡编排器 |
| `packages/vrender-core/src/common/enums.ts` | UpdateTag 定义 |
| `packages/vrender-core/src/common/performance-raf.ts` | PerformanceRAF 现有 API |

---

## 📊 实施计划参考

| Phase | 内容 | 预估 |
|-------|------|------|
| 1 | 状态引擎内核（activeStates/effectiveStates、priority/rank、exclude/suppress、编译器） | ★★★☆☆ |
| 2 | 属性分层（baseAttributes / resolvedStatePatch / attribute 缓存 / setAttribute 收敛） | ★★★★☆ |
| 3 | 共享状态定义（Group sharedStateDefinitions / Theme / prototype chain） | ★★☆☆☆ |
| 4 | 性能优化（影响分类 / 分帧提交 / delta diff / paint-only 快路径） | ★★★☆☆ |

---

**沟通完成后**，请将你的回答整理成文档，标注需要架构设计师确认的技术决策点。
