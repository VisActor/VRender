# Phase 1 实现任务文档 — 状态引擎内核

> **目标读者**：资深开发者
> **面向文档**：`D3_ARCH_DESIGN.md`（v1.6）
> **阶段**：Phase 1 — 状态引擎内核
> **架构师**：Claude（架构设计师）

---

## 文档使用说明

本文档是 Phase 1 的完整实现任务规范，遵循 harness 原则：

- **上下文自包含**：所有设计决策的前因后果都在本文档中说明，不依赖口头记忆。
- **结论前置**：每个任务的开头就是"做什么"，设计原理作为支撑背景。
- **验收标准明确**：每个任务都有可检验的完成标准，不是模糊的"实现相应功能"。
- **边界清晰**：Phase 1 不做什么在本文档开头明确说明，避免 Scope Creep。

**开始实现前请先阅读**：
1. `D3_ARCH_DESIGN.md`（v1.6）第 176-253 行（整体架构图和状态迁移流程）
2. `D3_ARCH_DESIGN.md`（v1.6）第 326-340 行（属性分层子系统核心原则）
3. `D3_ARCH_DESIGN.md`（v1.6）第 477-625 行（状态引擎子系统详细设计）
4. `D3_ARCH_DESIGN.md`（v1.6）第 627-650 行（状态定义编译器子系统）
5. `D3_ARCH_DESIGN.md`（v1.6）第 886-960 行（Resolver 子系统）

---

## Phase 1 范围与约束

### Phase 1 做什么

Phase 1 交付一个新的状态引擎内核，提供以下能力：

1. **Flat state model**：`activeStates` / `effectiveStates`
2. **priority + rank 双维排序**：内核统一决定状态应用顺序，不再依赖调用方传入顺序
3. **exclude / suppress 裁决语义**：
   - `exclude`：目标状态从 `activeStates` 中移除，不自动恢复
   - `suppress`：目标状态保留在 `activeStates` 但不进入 `effectiveStates`
4. **StateDefinition 编译器**：将简写格式归一化为完整编译产物，预计算传递闭包
5. **单状态 resolver**：给定图元上下文计算 patch，支持声明式 `declaredAffectedKeys`
6. **resolver 显式失效机制**：`invalidateResolver()`

### Phase 1 不做什么（边界）

以下内容**不在 Phase 1 范围内**，由后续 Phase 处理：

- **属性分层**（Phase 2）：`baseAttributes` / `resolvedStatePatch` / `_syncAttribute()` / `setAttribute` 语义收敛
- **共享状态定义**（Phase 3）：Group `sharedStateDefinitions` / Theme `stateDefinitions` / prototype chain
- **性能优化**（Phase 4）：影响分类精细化 / 分帧状态提交 / delta diff & commit / paint-only 快路径
- **UpdateTag 新增 `PAINT` 分支**（Phase 4）：当前 `submitUpdate()` 中的 `addUpdateBoundTag` 路径暂不变动

### Phase 1 对外接口约束

Phase 1 结束后，以下公开接口**必须保持完全兼容**：

| 接口 | 兼容要求 |
|------|----------|
| `graphic.states: StateDefinitionsInput<T>` | 混用类型（逐条简写/完整格式均公开支持） |
| `graphic.useStates(['hover'])` | 行为不变，结果由新引擎计算 |
| `graphic.addState/removeState/toggleState/clearStates` | 行为不变 |
| `graphic.stateProxy` | 仍可工作 |
| `graphic.stateSort` | 仍可工作 |
| `graphic.stateMergeMode` | 仍可工作 |
| `graphic.normalAttrs` | Phase 1 不改动（Phase 2 才移除） |
| `graphic.setAttribute/setAttributes` | Phase 1 不改动（Phase 2 才收敛） |

### Phase 1 公开类型决策

**`graphic.states` 的类型改为 `StateDefinitionsInput<T>`**（逐条状态允许简写/完整格式混用）。

决策理由：
- StateEngine 内核已支持完整格式，开放公开类型是"API 诚实"而非"能力未就绪"
- TypeScript 联合类型扩展是加法，Phase 2 属性分层时类型变化是扩展（加 `baseAttributes`），不是破坏性修改
- 推后到 Phase 2 再开放，等于用类型断言绕过检查，开发者负担相同但时间更晚
- 下游包（vrender-components 等）需要配合做一轮类型适配，属于预期内成本

### Phase 1 内部约束

- `setAttribute` / `setAttributes` / `_setAttributes` / `initAttributes` 的实现**完全不改动**
- `normalAttrs` / `finalAttribute` / `applyStateAttrs` / `updateNormalAttrs` 的逻辑**完全不改动**
- 现有 `state-model.ts` 中的公开方法**外部调用签名不变**
- 现有 `state-style-resolver.ts` 的 `resolve()` 方法**完全不动**

---

## 实施步骤总览

```
Step 1: state-definition.ts（新建，类型定义，无外部依赖）
  ↓
Step 2: state-definition-compiler.ts（新建，依赖 Step 1）
  ↓
Step 3: state-engine.ts（新建，依赖 Step 1 + 2）
  ↓
Step 4: state-model.ts（修改，依赖 Step 1 + 2 + 3）
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
Step 10: 现有测试适配（依赖 Step 7 + 8）
```

---

## Step 1: 新建 `state-definition.ts`

### 任务

在 `packages/vrender-core/src/graphic/state/state-definition.ts` 新建文件，定义 Phase 1 所需的全部类型。

### 类型清单

必须定义以下类型（**不能多也不能少**）：

#### 1. `StateDefinition<T>`

```typescript
export interface StateDefinition<T extends Record<string, any> = Record<string, any>> {
  name: string;
  priority?: number;        // 默认 0
  rank?: number;           // 编译后由编译器分配，运行时只读
  patch?: Partial<T>;
  resolver?: (ctx: StateResolveContext<T>) => Partial<T> | void;
  declaredAffectedKeys?: string[] | Set<string>;  // resolver 用，可选
  exclude?: string[];
  suppress?: string[];
}
```

#### 2. `CompiledStateDefinition<T>`

```typescript
export interface CompiledStateDefinition<T extends Record<string, any> = Record<string, any>> {
  name: string;
  priority: number;         // 归一化后的数值
  rank: number;             // 编译器分配
  patch?: Partial<T>;
  resolver?: (ctx: StateResolveContext<T>) => Partial<T> | void;
  declaredAffectedKeys?: Set<string>;
  exclude: Set<string>;      // 传递闭包
  suppress: Set<string>;     // 传递闭包
  hasResolver: boolean;
  affectedKeys: Set<string>; // 静态 patch 由编译器提取，resolver 来自 declaredAffectedKeys
}
```

#### 3. `StateResolveContext<T>`

```typescript
export interface StateResolveContext<T extends Record<string, any> = Record<string, any>> {
  graphic: any;  // Phase 1 用 any 避免循环依赖；Phase 2 可收紧为 IGraphic<T>
  activeStates: ReadonlyArray<string>;
  effectiveStates: ReadonlyArray<string>;
  baseAttributes: Partial<T>;   // Phase 1: resolver 通过 Graphic 层传入 stateResolveBaseAttrs
  resolvedPatch: Partial<T>;
}
```

#### 4. `StateTransitionResult`

```typescript
export interface StateTransitionResult {
  changed: boolean;
  activeStates: string[];
  effectiveStates: string[];
  suppressed: string[];
}
```

#### 5. `StateDefinitionsInput<T>`（也是 `graphic.states` 的公开类型）

```typescript
export type StateDefinitionsInput<T extends Record<string, any> = Record<string, any>> =
  Record<string, Partial<T> | StateDefinition<T>>;
```

允许同一个 `states` 对象内混用简写和完整格式：

```typescript
graphic.states = {
  hover: { fill: 'red' },                                                  // 简写
  selected: { name: 'selected', priority: 10, patch: { stroke: 'blue' } }  // 完整格式
};
```

> **公开类型决策**：`StateDefinitionsInput<T>` 是 `graphic.states` 的公开类型。逐条状态允许简写/完整混用，支持渐进式迁移。Phase 2 属性分层时，此类型会扩展加入 `baseAttributes` 字段。

#### 6. `IStateEngineOptions<T>`（引擎构造选项）

```typescript
export interface IStateEngineOptions<T extends Record<string, any> = Record<string, any>> {
  compiledDefinitions: Map<string, CompiledStateDefinition<T>>;
  stateSort?: (a: string, b: string) => number;
  stateProxy?: (stateName: string, targetStates?: string[]) => Partial<T> | undefined;
  states?: StateDefinitionsInput<T>;  // 混用格式 fallback
  mergeMode?: 'shallow' | 'deep';
}
```

### 验收标准

1. 文件无外部 import（纯类型文件）
2. 所有类型都可以被 TypeScript 正确推断
3. `CompiledStateDefinition` 中 `exclude` 和 `suppress` 是 `Set<string>`（不是 `string[]`）

---

## Step 2: 新建 `state-definition-compiler.ts`

### 任务

在 `packages/vrender-core/src/graphic/state/state-definition-compiler.ts` 新建文件，实现 `StateDefinitionCompiler` 类。

### 核心职责

#### 2.1 归一化

**检测逻辑**：
- 如果对象有 `name` / `patch` / `priority` / `exclude` / `suppress` / `resolver` / `declaredAffectedKeys` 中的任一字段 → 完整格式
- 否则 → 简写格式（整个对象就是 patch）

```typescript
private normalizeDefinition(name: string, value: any): StateDefinition<T> {
  const keys = Object.keys(value ?? {});
  const hasFullKey = keys.some(k =>
    ['name', 'patch', 'priority', 'exclude', 'suppress', 'resolver', 'declaredAffectedKeys'].includes(k)
  );
  if (hasFullKey) {
    return { name: value.name ?? name, ...value };
  }
  return { name, priority: 0, patch: value as Partial<T> };
}
```

#### 2.2 rank 分配

- 对同 `priority` 的状态按名称字典序分配稳定 rank
- `priority` 小的排在前面（低 rank）
- 编译结果中 rank 必须全局唯一且稳定

#### 2.3 传递闭包

对 `exclude` 和 `suppress` 分别计算传递闭包：
- A exclude B，B exclude C → A.exclude = {B, C}
- A suppress B，B suppress C → A.suppress = {B, C}

**算法**：迭代式，直到集合不再增长。设置安全上界 `size * size + 1` 次迭代，超出则报环形依赖警告。

**环形检测**：如果 A exclude B 且 B exclude A，报 `console.warn` 但不抛异常，两方都保留对方在 exclude 中。

#### 2.4 affectedKeys 提取

- **静态 patch**：从 patch 对象提取 key 集合
- **resolver + declaredAffectedKeys**：使用声明的 key 集
- **resolver 无 declaredAffectedKeys**：返回空集

### 公开方法

```typescript
class StateDefinitionCompiler<T extends Record<string, any> = Record<string, any>> {
  compile(definitions: StateDefinitionsInput<T>): Map<string, CompiledStateDefinition<T>>;
}
```

### 验收标准

1. `compile({ hover: { fill: 'red' } })` → name='hover', patch={fill:'red'}, priority=0, rank=0, exclude={}, suppress={}, affectedKeys={'fill'}
2. `compile({ selected: { name: 'selected', priority: 10, patch: { stroke: 'blue' }, exclude: ['hover'] } })` → exclude={'hover'}
3. A exclude B, B exclude C → A.exclude={'B', 'C'}
4. A suppress B, B suppress C → A.suppress={'B', 'C'}
5. A exclude B, B exclude A → 两方都保留对方，`console.warn` 被调用
6. 混合格式均正确归一化
7. 同 priority 的多个状态按字典序分配 rank
8. `compile({})` → 空 Map，不抛异常
9. resolver 状态无 declaredAffectedKeys → affectedKeys 为空集

---

## Step 3: 新建 `state-engine.ts`

### 任务

在 `packages/vrender-core/src/graphic/state/state-engine.ts` 新建文件，实现 `StateEngine` 类。这是 Phase 1 最核心的文件。

### 核心流程 `resolveTransition(candidateStates)`

必须严格按以下顺序执行：

```
1. 去重：[...new Set(candidateStates)]
2. 排序：有编译定义按 priority+rank；无定义的 fallback stateSort 后追加
3. 裁决（倒序遍历）：
   - exclude：从候选集移除（splice）
   - suppress：标记到 suppressedSet
4. activeStates = 裁剪后候选集
   effectiveStates = activeStates - suppressedSet
5. recomputePatch(effectiveStates)
6. 返回 StateTransitionResult
```

### 详细设计

#### 3.1 排序规则

```typescript
private sortStates(states: string[]): string[] {
  const withDef: string[] = [];
  const withoutDef: string[] = [];

  for (const s of states) {
    if (this.compiledDefinitions.has(s)) {
      withDef.push(s);
    } else {
      withoutDef.push(s);
    }
  }

  // 有定义的按 priority + rank 升序（低在前）
  withDef.sort((a, b) => {
    const defA = this.compiledDefinitions.get(a)!;
    const defB = this.compiledDefinitions.get(b)!;
    if (defA.priority !== defB.priority) {
      return defA.priority - defB.priority;
    }
    return defA.rank - defB.rank;
  });

  // 无定义的 fallback stateSort 后追加到末尾
  if (this.stateSort && withoutDef.length > 1) {
    withoutDef.sort(this.stateSort);
  }

  return [...withDef, ...withoutDef];
}
```

**排序语义**：低 priority 的状态先出现在数组前面，高 priority 后出现。后续 patch 应用时，高 priority 的覆盖低 priority。

#### 3.2 裁决算法

```typescript
private adjudicate(sorted: string[]): { active: string[]; suppressedSet: Set<string> } {
  const candidate = [...sorted];
  const suppressedSet = new Set<string>();

  // 倒序遍历：高优先级在后，倒序时先处理高优先级
  for (let i = candidate.length - 1; i >= 0; i--) {
    const stateName = candidate[i];
    if (!candidate.includes(stateName)) {
      continue; // 已被更高优先级 exclude 移除
    }

    const def = this.compiledDefinitions.get(stateName);
    if (!def) { continue; }

    // exclude：全量扫描候选集（O(n)，可接受）
    for (const excluded of def.exclude) {
      const idx = candidate.indexOf(excluded);
      if (idx !== -1) {
        candidate.splice(idx, 1);
        if (idx < i) { i--; } // 调整索引
      }
    }

    // suppress：标记
    for (const s of def.suppress) {
      suppressedSet.add(s);
    }
  }

  return { active: candidate, suppressedSet };
}
```

#### 3.3 patch 重算 `recomputePatch`

```typescript
private recomputePatch(effectiveStates: string[]): void {
  const newPatch: Partial<T> = {};
  const newCacheKey = effectiveStates.join(',');

  // 检查 resolver 缓存是否仍有效
  if (this.resolverCacheValid && this.resolverCacheKey === newCacheKey) {
    // 缓存有效，复用 resolver 结果
    for (const stateName of effectiveStates) {
      const def = this.compiledDefinitions.get(stateName);
      if (!def) {
        const compat = this.getCompatPatch(stateName);
        if (compat) { this.mergeInto(newPatch, compat); }
        continue;
      }
      if (def.hasResolver) {
        const cached = this.resolverPatchCache.get(stateName);
        if (cached) { this.mergeInto(newPatch, cached); }
      } else if (def.patch) {
        this.mergeInto(newPatch, def.patch);
      }
    }
  } else {
    // 缓存失效，重新执行 resolver
    this.resolverPatchCache.clear();
    this.resolverCacheKey = newCacheKey;

    for (const stateName of effectiveStates) {
      const def = this.compiledDefinitions.get(stateName);
      if (!def) {
        const compat = this.getCompatPatch(stateName);
        if (compat) { this.mergeInto(newPatch, compat); }
        continue;
      }

      if (def.hasResolver && def.resolver) {
        const ctx: StateResolveContext<T> = {
          graphic: null as any, // Phase 1 由 Graphic 层传入
          activeStates: this._activeStates,
          effectiveStates,
          baseAttributes: {},  // Phase 1: resolver 通过 Graphic 层传入 stateResolveBaseAttrs
          resolvedPatch: newPatch
        };
        const patch = def.resolver(ctx);
        if (patch) {
          this.resolverPatchCache.set(stateName, patch);
          this.mergeInto(newPatch, patch);
        }
      } else if (def.patch) {
        this.mergeInto(newPatch, def.patch);
      }
    }

    this.resolverCacheValid = true;
  }

  this._resolvedPatch = newPatch;
  this.patchVersion++;
}
```

> **注意**：Phase 1 resolver 的 `baseAttributes` 通过 `Graphic` 层传入现有 `stateResolveBaseAttrs`（即 `normalAttrs ?? finalAttribute ?? attribute`），详见 Step 7 的 `useStates` 增强。

#### 3.4 公开方法签名

```typescript
class StateEngine<T extends Record<string, any> = Record<string, any>> {
  constructor(options: IStateEngineOptions<T>);

  // 状态迁移
  applyStates(stateNames: string[]): StateTransitionResult;
  addState(stateName: string, keepCurrentStates?: boolean): StateTransitionResult;
  removeState(stateNames: string | string[]): StateTransitionResult;
  toggleState(stateName: string): StateTransitionResult;
  clearStates(): StateTransitionResult;

  // 失效
  invalidateResolverCache(): void;

  // 只读访问器
  get activeStates(): ReadonlyArray<string>;
  get effectiveStates(): ReadonlyArray<string>;
  get resolvedPatch(): Partial<T>;
  get suppressed(): ReadonlyArray<string>;

  // 兼容
  hasState(stateName?: string): boolean;
  getCompatPatch(stateName: string): Partial<T> | undefined;
}
```

### 验收标准

1. `applyStates(['hover'])` → activeStates=['hover'], effectiveStates=['hover'], suppressed=[]
2. `applyStates(['hover', 'selected'])` 且 selected(p=10) exclude hover(p=0) → activeStates=['selected'], hover 被移除
3. `applyStates(['hover', 'selected'])` 且 selected(p=10) suppress hover(p=0) → activeStates=['hover','selected'], effectiveStates=['selected'], suppressed=['hover']
4. selected exclude hover → removeState('selected') 后 hover 不自动恢复
5. addState('active', true) → 追加；addState('active', false) → 替换
6. toggleState('hover') → 开时追加，关时移除
7. clearStates() → activeStates=[], effectiveStates=[], patch={}
8. resolver 执行后第二次 applyStates 相同集合 → resolver 只执行一次
9. invalidateResolverCache() → resolver 缓存清除，下次 applyStates 重新执行
10. 无编译定义的状态 → 通过 stateProxy / states fallback

---

## Step 4: 修改 `state-model.ts`

### 任务

修改 `packages/vrender-core/src/graphic/state/state-model.ts`。

### 修改内容

#### 4.1 新增 `IStateModelOptions` 字段

```typescript
interface IStateModelOptions<T> {
  // ... 现有字段 ...
  stateEngine?: StateEngine<T>;  // 新增
}
```

#### 4.2 新增只读访问器

```typescript
get effectiveStates(): ReadonlyArray<string> {
  return this.stateEngine?.effectiveStates ?? this.currentStates ?? [];
}

get resolvedPatch(): Partial<T> | undefined {
  return this.stateEngine?.resolvedPatch;
}
```

#### 4.3 状态操作委托

当 `this.stateEngine` 存在时，`useStates` / `addState` / `removeState` / `toggleState` / `clearStates` 内部委托 `stateEngine` 对应方法，并扩展返回值的 `effectiveStates` 字段。

当 `this.stateEngine` 不存在时，**完全保持现有逻辑不变**（零改动路径）。

```typescript
// useStates 示例
useStates(states: string[]): IStateModelTransition {
  if (this.stateEngine) {
    const result = this.stateEngine.applyStates(states);
    return {
      changed: result.changed,
      states: result.activeStates,
      effectiveStates: result.effectiveStates  // 新增字段
    };
  }
  // 现有逻辑不变...
}
```

### 重要约束

- **不删除任何现有方法**
- **不改变现有方法的外部调用签名**

### 验收标准

1. 传入 stateEngine 时，useStates 返回值包含 effectiveStates
2. 不传入 stateEngine 时，现有逻辑完全不变
3. StateModel 的外部调用方式无需修改

---

## Step 5: 修改 `state-style-resolver.ts`

### 任务

修改 `packages/vrender-core/src/graphic/state/state-style-resolver.ts`。

### 修改内容

新增方法：

```typescript
resolveWithCompiled(
  normalAttrs: Partial<T>,
  compiledDefinitions: Map<string, CompiledStateDefinition<T>>,
  stateProxy: StateProxy<T> | undefined,
  effectiveStates: string[],
  resolvedPatch: Partial<T>  // 由 StateEngine 已经计算好的 patch
): Partial<T>
```

**语义**：直接返回 `resolvedPatch`（StateEngine 已计算好）。对无编译定义的匿名状态，通过 `stateProxy` 获取 patch 并追加到 resolvedPatch。

**现有 `resolve()` 方法完全不改动**。

### 验收标准

1. `resolveWithCompiled` 能正确处理无编译定义的状态
2. 现有 `resolve()` 方法的行为完全不变

---

## Step 6: 修改 `interface/graphic.ts`

### 任务

修改 `packages/vrender-core/src/interface/graphic.ts`。

### 修改内容

在 `IGraphic` 接口中新增声明：

```typescript
// 新增属性
effectiveStates?: string[];
resolvedStatePatch?: Partial<T>;

// 新增方法
invalidateResolver: () => void;
```

### 修改内容详解

**A. 新增属性/方法**（`IGraphic` 接口）：

```typescript
// 新增只读属性
effectiveStates?: string[];
resolvedStatePatch?: Partial<T>;

// 新增方法
invalidateResolver: () => void;
```

**B. 修改 `states` 类型**（`IGraphic` 接口，`declare states` 字段）：

```typescript
// 旧（不修改）
declare states?: Record<string, Partial<T>>;

// 新（改为联合类型）
declare states?: StateDefinitionsInput<T>;
```

`StateDefinitionsInput<T>` 是 Step 1 定义的混用类型：

```typescript
export type StateDefinitionsInput<T> =
  Record<string, Partial<T> | StateDefinition<T>>;  // 逐条可混用简写/完整格式
```

### 下游适配预期

将 `states` 改为联合类型后，以下场景需要适配：

| 场景 | 适配方式 |
|------|----------|
| 简写 `{ hover: { fill: 'red' } }` | 无需改动 |
| 完整格式 `{ hover: { name: 'hover', patch: { fill: 'red' }, priority: 10 } }` | 无需改动（之前是类型报错，现在合法） |
| 下游直接声明 `Record<string, Partial<T>>` | 需改为 `StateDefinitionsInput<T>` 或保留简写格式 |
| vrender-components 中 `states` 相关类型 | 配合修改 |

### 验收标准

1. `IGraphic` 接口中新增了 `effectiveStates`、`resolvedStatePatch`、`invalidateResolver`
2. `IGraphic` 接口中 `states` 字段类型改为 `StateDefinitionsInput<T>`
3. 下游包（vrender-components 等）`rush compile` 通过

---

## Step 7: 修改 `graphic.ts`

### 任务

修改 `packages/vrender-core/src/graphic/graphic.ts`。

### 修改内容

#### 7.1 字段声明（~line 305-338 附近）

新增：

```typescript
declare effectiveStates?: string[];
declare resolvedStatePatch?: Partial<T>;
protected stateEngine?: StateEngine<T>;
protected compiledStateDefinitions?: Map<string, CompiledStateDefinition<T>>;
```

#### 7.2 `createStateModel()`（line 1045-1052）

增强为：

```typescript
protected createStateModel() {
  // 1. 编译状态定义（如有）
  if (this.states && Object.keys(this.states).length > 0) {
    if (!this.compiledStateDefinitions) {
      const compiler = new StateDefinitionCompiler<T>();
      this.compiledStateDefinitions = compiler.compile(this.states);
    }
  }

  // 2. 创建 StateEngine（如有编译产物）
  if (!this.stateEngine && this.compiledStateDefinitions) {
    this.stateEngine = new StateEngine<T>({
      compiledDefinitions: this.compiledStateDefinitions,
      stateSort: this.stateSort,
      stateProxy: this.stateProxy as any,
      states: this.states,
      mergeMode: this.stateMergeMode
    });
  }

  // 3. 创建 StateModel
  return new StateModel<T>({
    states: this.states,
    currentStates: this.currentStates,
    stateSort: this.stateSort,
    stateProxy: this.stateProxy as any,
    stateEngine: this.stateEngine  // 新增
  });
}
```

#### 7.3 `useStates` 流程（line 1174-1203）

在现有流程中，新增对 StateEngine 结果的利用：

```typescript
useStates(states: string[], hasAnimation?: boolean) {
  // ... 现有空状态检查不变 ...
  const transition = this.createStateModel().useStates(states);
  if (!transition.changed) { return; }

  // Phase 1：如果有 StateEngine，直接使用其 resolvedPatch
  let resolvedStateAttrs: Partial<T>;
  if (this.stateEngine) {
    resolvedStateAttrs = { ...this.stateEngine.resolvedPatch };
    this.effectiveStates = [...this.stateEngine.effectiveStates];
    this.resolvedStatePatch = { ...this.stateEngine.resolvedPatch };
    // Phase 1 resolver 的 baseAttributes 通过 Graphic 层传入现有 stateResolveBaseAttrs
  } else {
    // fallback 到旧逻辑（Phase 1 不改动这部分）
    const stateResolveBaseAttrs = (this.normalAttrs ?? ((this as any).finalAttribute ?? this.attribute)) as Partial<T>;
    const resolver = this.stateMergeMode === 'deep' ? this.deepStateStyleResolver : this.stateStyleResolver;
    resolvedStateAttrs = resolver.resolve(
      stateResolveBaseAttrs, this.states, this.stateProxy as any,
      transition.states, this.stateSort
    );
  }

  // ... 后续 beforeStateUpdate / updateNormalAttrs / applyStateAttrs 不变 ...
}
```

#### 7.4 新增 `invalidateResolver()` 方法

```typescript
invalidateResolver(): void {
  this.stateEngine?.invalidateResolverCache();
  if (this.currentStates && this.currentStates.length > 0 && this.stateEngine) {
    const resolvedStateAttrs = { ...this.stateEngine.resolvedPatch };
    this.updateNormalAttrs(resolvedStateAttrs);
    this.applyStateAttrs(resolvedStateAttrs, [...this.stateEngine.effectiveStates], false);
  }
}
```

#### 7.5 `clearStates` 增强

```typescript
clearStates(hasAnimation?: boolean) {
  // ... 现有 transition 检查不变 ...
  // 新增：清理 StateEngine 状态
  this.stateEngine?.clearStates();
  this.effectiveStates = [];
  this.resolvedStatePatch = undefined;
  // ... 现有逻辑不变 ...
}
```

### 重要约束

- **不动**：`setAttribute` / `setAttributes` / `_setAttributes` / `initAttributes`
- **不动**：`normalAttrs` / `finalAttribute` / `applyStateAttrs` / `updateNormalAttrs`
- **不动**：UpdateTag 相关调用（Phase 4 才处理 PAINT 独立路径）

### 验收标准

1. `graphic.states = { hover: { fill: 'red' } }` 后调用 `useStates(['hover'])` → effectiveStates=['hover'], resolvedStatePatch={fill:'red'}
2. `graphic.states` 不设置时，使用现有逻辑（normalAttrs 路径）
3. `invalidateResolver()` 调用后 resolver 重新执行
4. `clearStates()` 后 effectiveStates=[], resolvedStatePatch=undefined

---

## Step 8: 修改 `graphic/index.ts`

### 任务

修改 `packages/vrender-core/src/graphic/index.ts`，新增导出。

### 修改内容

```typescript
export { StateEngine } from './state/state-engine';
export { StateDefinitionCompiler } from './state/state-definition-compiler';
export type {
  StateDefinition,
  CompiledStateDefinition,
  StateResolveContext,
  StateDefinitionsInput,
  StateTransitionResult,
  IStateEngineOptions
} from './state/state-definition';
```

### 验收标准

1. 外部可以通过 `from '@visactor/vrender-core'` 访问 `StateEngine` 和 `StateDefinitionCompiler`
2. 所有新类型都可以被正确推断

---

## Step 9: 单元测试（新建）

### 9.1 `state-definition-compiler.test.ts`

**路径**：`packages/vrender-core/__tests__/unit/graphic/state-definition-compiler.test.ts`

必须覆盖的测试矩阵：

| 测试场景 | 输入 | 预期输出 |
|---------|------|---------|
| 简写格式归一化 | `{ hover: { fill: 'red' } }` | name='hover', patch={fill:'red'}, priority=0, rank=0 |
| 完整格式编译 | `{ selected: { name:'selected', priority:10, patch:{stroke:'blue'}, exclude:['hover'] } }` | priority=10, exclude={'hover'} |
| 混合格式 | `{ hover:{fill:'red'}, selected:{name:'selected', priority:5, patch:{stroke:'blue'} } }` | hover(p=0), selected(p=5) |
| exclude 传递闭包 | A exclude B, B exclude C | A.exclude={'B','C'} |
| suppress 传递闭包 | A suppress B, B suppress C | A.suppress={'B','C'} |
| 环形 exclude | A exclude B, B exclude A | 两方都保留对方，`console.warn` 调用 |
| 环形 suppress | A suppress B, B suppress A | 两方都保留对方，`console.warn` 调用 |
| affectedKeys 静态 patch | patch={fill:'red', stroke:'blue'} | affectedKeys={'fill','stroke'} |
| affectedKeys resolver+declared | resolver + declaredAffectedKeys=['fill','opacity'] | affectedKeys={'fill','opacity'} |
| affectedKeys resolver 无声明 | resolver 无 declaredAffectedKeys | affectedKeys=空集 |
| 同 priority rank 分配 | priority=0 的 hover 和 active | 按字典序分配 rank |
| 空定义集 | `{}` | 空 Map |
| null/undefined value | `{ hover: null }` | 视为空 patch |

### 9.2 `state-engine.test.ts`

**路径**：`packages/vrender-core/__tests__/unit/graphic/state-engine.test.ts`

必须覆盖的测试矩阵：

| 测试场景 | 操作 | 预期结果 |
|---------|------|---------|
| 单状态 applyStates | `applyStates(['hover'])` | active=['hover'], effective=['hover'], suppressed=[] |
| priority 排序 | hover(p=0) + selected(p=10) | 数组中 hover 在 selected 前 |
| exclude 裁决 | selected(p=10) exclude hover(p=0) | active=['selected'], hover 被移除 |
| suppress 裁决 | selected(p=10) suppress hover(p=0) | active=['hover','selected'], effective=['selected'], suppressed=['hover'] |
| exclude 不自动恢复 | selected exclude hover → removeState('selected') | hover 不恢复 |
| addState 追加 | 当前 hover → addState('active', true) | active=['hover','active'] |
| addState 替换 | 当前 hover → addState('active', false) | active=['active'] |
| toggleState 开 | 当前 hover → toggleState('active') | active=['hover','active'] |
| toggleState 关 | 当前 hover+active → toggleState('hover') | active=['active'] |
| clearStates | 当前 hover+active | active=[], effective=[], patch={} |
| resolver 执行 | 带 resolver 的状态 | resolver 被调用，结果参与 patch |
| resolver 缓存 | 连续两次 applyStates 相同 | resolver 只执行一次 |
| invalidateResolver | 执行后 | 缓存清除，下次 applyStates 重新执行 |
| 无编译定义 fallback | 匿名状态通过 stateProxy | 通过 stateProxy 获取 patch |
| patch shallow merge | hover(fill='red') + selected(stroke='blue') | patch={fill:'red', stroke:'blue'} |
| 无状态时 clearStates | 无状态时 clearStates() | changed=false |
| 相同状态再次 applyStates | applyStates(['hover']) 两次 | changed=false |

---

## Step 10: 现有测试适配

### 需要验证的现有测试

1. `packages/vrender-core/__tests__/unit/graphic/state-model.test.ts`
2. `packages/vrender-core/__tests__/unit/graphic/state-style-resolver.test.ts`
3. `packages/vrender-core/__tests__/unit/graphic/graphic-state.test.ts`

### 验收标准

- 以上三个测试文件中的所有现有测试用例全部通过
- 不修改任何现有测试用例的期望值
- 如有新增失败，明确记录是现有 bug（而非 Phase 1 引入）还是 Phase 1 引入的新问题

---

## 验证方案

### 类型验证

```bash
# vrender-core 自身类型检查
cd packages/vrender-core && rush compile

# 下游包类型检查（states 类型变更后需验证）
rush build -p @visactor/vrender-components
rush build -p @visactor/vrender-kits
rush build -p @visactor/vrender
```

vrender-core 自身零类型错误。下游包如出现类型错误，需要适配：
- 将 `Record<string, Partial<T>>` 改为 `StateDefinitionsInput<T>`
- 或使用简写格式（天然兼容）

### 单元测试

```bash
cd packages/vrender-core && rush test -- --path packages/vrender-core/__tests__/unit/graphic/state-definition-compiler.test.ts
cd packages/vrender-core && rush test -- --path packages/vrender-core/__tests__/unit/graphic/state-engine.test.ts
```

新增测试全部通过。

### 兼容性测试

```bash
cd packages/vrender-core && rush test -- --path packages/vrender-core/__tests__/unit/graphic/state-model.test.ts
cd packages/vrender-core && rush test -- --path packages/vrender-core/__tests__/unit/graphic/state-style-resolver.test.ts
cd packages/vrender-core && rush test -- --path packages/vrender-core/__tests__/unit/graphic/graphic-state.test.ts
```

现有测试全部通过。

### 手动验证场景

1. **简写格式**：`graphic.states = { hover: { fill: 'red' } }` → `graphic.useStates(['hover'])` → 填充变为红色
2. **priority 排序**：`graphic.states = { hover: { fill: 'blue' }, selected: { name: 'selected', priority: 10, patch: { fill: 'red' } } }` → `graphic.useStates(['hover', 'selected'])` → 最终 fill='red'（selected 覆盖 hover）
3. **exclude**：`graphic.states = { hover: { fill: 'blue' }, selected: { name: 'selected', priority: 10, patch: { fill: 'red' }, exclude: ['hover'] } }` → `graphic.useStates(['hover', 'selected'])` → 最终只有 selected 生效，hover 被 exclude
4. **suppress**：`graphic.states = { hover: { fill: 'blue' }, selected: { name: 'selected', priority: 10, patch: { fill: 'red' }, suppress: ['hover'] } }` → `graphic.useStates(['hover', 'selected'])` → effectiveStates 只有 selected，hover 在 suppressed 中
5. **resolver + declaredAffectedKeys**：状态使用 resolver 并声明 affectedKeys，`invalidateResolver` 正确触发重新执行

---

## 关键代码位置参考

### 现有文件

| 文件 | 行号 | 内容 |
|------|------|------|
| `graphic.ts` | 305 | `declare states?: Record<string, Partial<T>>;` — 改为 `StateDefinitionsInput<T>` |
| `graphic.ts` | 311 | `declare normalAttrs?: Partial<T>;` |
| `graphic.ts` | 733 | `setAttributes(...)` — Phase 1 不改动 |
| `graphic.ts` | 748 | `_setAttributes(...)` — Phase 1 不改动 |
| `graphic.ts` | 767 | `setAttribute(...)` — Phase 1 不改动 |
| `graphic.ts` | 1045 | `createStateModel()` — 需增强 |
| `graphic.ts` | 1058 | `applyStateAttrs(...)` — Phase 1 不改动 |
| `graphic.ts` | 1087 | `updateNormalAttrs(...)` — Phase 1 不改动 |
| `graphic.ts` | 1136 | `clearStates(...)` — 需增强 |
| `graphic.ts` | 1152 | `removeState(...)` |
| `graphic.ts` | 1159 | `toggleState(...)` |
| `graphic.ts` | 1166 | `addState(...)` |
| `graphic.ts` | 1174 | `useStates(...)` — 需增强 |
| `graphic.ts` | 1205 | `addUpdateBoundTag()` — Phase 1 不改动 |
| `graphic.ts` | 1219 | `addUpdateShapeAndBoundsTag()` — Phase 1 不改动 |
| `graphic.ts` | 1239 | `addUpdatePositionTag()` — Phase 1 不改动 |
| `graphic.ts` | 1265 | `addUpdateLayoutTag()` — Phase 1 不改动 |
| `interface/graphic.ts` | ~723-756 | IGraphic 接口状态相关声明 |
| `state-model.ts` | 全文 | 需增强，委托 StateEngine |
| `state-style-resolver.ts` | 全文 | 需新增 resolveWithCompiled 方法 |

### 新建文件

| 文件 | 依赖 |
|------|------|
| `state-definition.ts` | 无外部依赖 |
| `state-definition-compiler.ts` | 依赖 state-definition.ts |
| `state-engine.ts` | 依赖 state-definition.ts |
