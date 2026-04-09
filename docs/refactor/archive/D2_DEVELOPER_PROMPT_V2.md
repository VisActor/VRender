# D2 开发者沟通 Prompt V2 - 图形状态动画配置绑定

> **目标读者**：资深开发者（另一个 Agent）
> **沟通目的**：基于架构审查后的修订方向，与开发者讨论技术实现细节
> **文档状态**：已定案，同步 V2.0 设计口径
> **前置文档**：`D2_ARCH_DESIGN.md`（v2.0，已包含所有已定案结论）

---

## 📋 已定案的结论（开发者可直接使用，无需再讨论）

以下结论已在 D2_ARCH_DESIGN.md v2.0 中写死，开发者在答题时应以此为准：

### 核心范围

| 项目 | 结论 |
|------|------|
| D2 v1 目标 | VRender 接管状态样式解析和状态过渡执行；VChart 仍负责状态决策 |
| hasAnimation gate | 保留，`hasAnimation === true` 是触发动画的必要条件 |
| 动画配置类型 | 直接复用 `IAnimateConfig`，不建新类型 |
| enter/exit | **只支持 enter，不支持 exit** |
| 状态名 | 继续用通用 `'state'`，不改造 `AnimationStateManager` |
| 排除范围 | glyph（`glyphStates`/`glyphStateProxy`）、`stateProxy` 携带动画配置、实例钩子 |
| 多状态策略 | 按"最后一个状态"提取，按 `stateSort` 排序最后一位；无 `stateSort` 时保持调用顺序 |
| stateProxy 策略 | 只参与样式解析，不参与动画配置提取；动画只从静态 `states` 提取 |
| enter+exit 同时执行 | **彻底排除** |

### 类型定义

```typescript
export interface IStateDefinition<T> {
  style: Partial<T>;
  animation?: IAnimateConfig;  // 仅 enter 方向
}

export function isStateDefinition<T>(value: unknown): value is IStateDefinition<T> {
  return value != null && typeof value === 'object' && 'style' in value;
}
```

### 动画配置优先级（v2.0 定案）

| 优先级 | 来源 |
|--------|------|
| 1 | `applyStateAttrs` 第 5 参数 |
| 2 | **状态定义的 `animation`**（D2 v1 新增）|
| 3 | `graphic.stateAnimateConfig` |
| 4 | `context.stateAnimateConfig` |
| 5 | `DefaultStateAnimateConfig` |

---

## 🔧 剩余需要讨论的技术问题

### 问题 1：样式解析的职责边界

**已定案**：样式解析在 `StateStyleResolver.resolve()` 中进行，通过 `isStateDefinition` 类型守卫区分新旧格式。

**需要开发者回答**：

```typescript
// 候选实现 A：在 resolver 内部做类型检测
sortedStates.forEach(stateName => {
  const stateValue = stateProxy
    ? stateProxy(stateName, sortedStates)
    : states?.[stateName];

  const style = isStateDefinition(stateValue)
    ? (stateValue as IStateDefinition<T>).style
    : (stateValue as Partial<T>);  // 旧格式直接使用

  // ... 合并 style
});
```

```typescript
// 候选实现 B：在 graphic.ts 中预先规范化
// useStates 中，先把状态值规范化：
const normalizedStates = states
  ? Object.fromEntries(
      Object.entries(states).map(([k, v]) => [
        k,
        isStateDefinition(v) ? v.style : v
      ])
    )
  : undefined;
// 然后把原始 states（含 IStateDefinition）传给 resolver 做动画提取
```

**问题**：
- 样式合并逻辑放在 `StateStyleResolver` 内部（方案 A），还是在上层 `graphic.ts` 预先规范化后传给 resolver（方案 B）？
- 方案 A 更内聚，但 resolver 需要同时处理样式和检测逻辑
- 方案 B 更干净，但需要在 graphic.ts 中多做一步转换
- 你的选择和理由？

---

### 问题 2：动画配置提取的传递路径

**已定案**：动画配置提取发生在 `graphic.useStates()` → `applyStateAttrs()` 路径中。

**需要开发者回答**：

```typescript
// 方案 A：在 graphic.ts 中预先提取，传入 applyStateAttrs
useStates(states: string[], hasAnimation?: boolean) {
  // ...
  const resolvedStateAttrs = resolver.resolve(...);
  // 提取目标状态的动画配置
  const stateAnimationConfig = this.extractStateAnimation(
    this.states,       // 静态 states
    stateProxy,         // stateProxy（只用于提取样式，不用于动画）
    transition.states   // 当前状态列表
  );
  this.applyStateAttrs(resolvedStateAttrs, transition.states, hasAnimation, false, stateAnimationConfig);
}
```

```typescript
// 方案 B：直接修改 applyStateAttrs 签名，由它内部查询
applyStateAttrs(attrs, stateNames, hasAnimation, isClear, states, stateProxy) {
  // applyStateAttrs 内部查询最后一个状态的 animation
  const stateAnimationConfig = this.extractStateAnimation(states, stateProxy, stateNames);
  // ... 后续逻辑
}
```

**问题**：
- 方案 A 的优点是 `useStates` 流程清晰，提取逻辑集中
- 方案 B 的优点是 `applyStateAttrs` 仍然是唯一的动画配置注入点
- 你的选择和理由？

---

### 问题 3："最后一个状态"的提取实现

**已定案规则**：
- 有 `stateSort` 时：排序后取最后一个
- 无 `stateSort` 时：保持调用顺序，取最后一个

**需要开发者回答**：具体实现位置和代码结构。

```typescript
// 提取逻辑
function extractLastStateAnimation<T>(
  states: Record<string, Partial<T> | IStateDefinition<T>> | undefined,
  stateSort: ((a: string, b: string) => number) | undefined,
  currentStates: string[]
): IAnimateConfig | undefined {
  const sorted = stateSort
    ? [...currentStates].sort(stateSort)
    : [...currentStates];
  const lastState = sorted[sorted.length - 1];

  if (!lastState || !states) {
    return undefined;
  }

  const stateValue = states[lastState];
  if (isStateDefinition(stateValue) && stateValue.animation) {
    return stateValue.animation;
  }
  return undefined;
}
```

**问题**：
- 这个提取函数放在哪里：`graphic.ts` 还是 `state-transition-orchestrator.ts`？
- 如果放在 `graphic.ts`，它调用 `applyStateAttrs` 时传入
- 如果放在 `orchestrator`，则 orchestrator 需要能访问到 `states` 和 `stateSort`

---

### 问题 4：测试策略

**现有测试覆盖的核心行为**（state-animation.test.ts、state-transition-orchestrator.test.ts）均需扩展。

**需要开发者回答**：

1. **现有测试基线是否需要重构**？还是只需追加新测试用例？

2. **新增测试场景**：
   - 新格式状态定义（带 animation）正确触发对应配置
   - 旧格式状态定义仍然兼容（`isStateDefinition` 返回 false）
   - 混合格式（部分新格式部分旧格式）
   - 从状态定义提取的动画配置覆盖 `DefaultStateAnimateConfig`
   - 多状态时按 `stateSort` 最后一位提取
   - 无 `stateSort` 时保持调用顺序

3. **需要重点覆盖的边界情况**：
   - 状态定义有 `animation: {}`（空对象）时的行为
   - 状态定义有 `animation: { duration: undefined }`（部分字段 undefined）时的行为

---

### 问题 5：实施顺序与工作量

**建议的 Phase 划分**：

```
Phase 1（D2.1）：类型与样式解析
  - 添加 IStateDefinition 类型和 isStateDefinition 守卫
  - 修改 StateStyleResolver.resolve() 兼容新旧格式
  - 修改 getState() 返回类型
  - 单元测试覆盖
  预估：★☆☆☆☆ 小

Phase 2（D2.2）：动画配置绑定
  - 实现 extractStateAnimation 逻辑
  - 修改 graphic.ts useStates 流程
  - 修改 orchestrator.applyTransition 接受注入配置
  - 更新测试基线
  预估：★★☆☆☆ 中
```

**需要开发者回答**：
1. 预估工作量是否合理？
2. 是否有遗漏的边界场景需要单独处理？

---

## ❓ 需要开发者最终回答的问题清单

1. **职责边界**：动画配置提取放在 resolver 内部（方案 A）还是 graphic.ts（方案 B）？
2. **传递路径**：提取后传给 `applyStateAttrs`（方案 A）还是修改 `applyStateAttrs` 签名由其内部查询（方案 B）？
3. **提取实现**：提取函数放在 `graphic.ts` 还是 `state-transition-orchestrator.ts`？
4. **测试策略**：现有基线如何处理，新增哪些测试场景？
5. **实施顺序**：Phase 划分和工作量预估是否合理？

---

## 📚 参考文档

| 文档 | 说明 |
|------|------|
| `D2_ARCH_DESIGN.md` | v2.0，已包含所有已定案结论 |
| `packages/vrender-core/src/graphic/state/state-style-resolver.ts` | 需修改的 resolver |
| `packages/vrender-core/src/graphic/state/state-transition-orchestrator.ts` | 需修改的 orchestrator |
| `packages/vrender-core/src/graphic/graphic.ts` | useStates 和 applyStateAttrs |
| `packages/vrender-core/src/interface/graphic.ts` | IGraphic 和 IAnimateConfig |
| `packages/vrender-core/__tests__/unit/graphic/state-animation.test.ts` | 现有动画测试基线 |

---

**沟通完成后**，请将你的回答整理成文档，标注需要架构设计师确认的技术决策点。
