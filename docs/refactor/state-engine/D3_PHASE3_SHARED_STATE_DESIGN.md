# D3 Phase 3 设计文档 — Group-first 共享状态定义

> **目标读者**：协调者 / 总监 reviewer / Phase 3 实现者
> **用途**：Phase 3 正式设计文档
> **设计基线**：`graphic-state-animation-refactor-expectation.md` + `D3_ARCH_DESIGN.md`（Phase 2 已 closed）
> **当前状态**：已关闭（实现已完成、已通过复核并完成 close-out）

---

## 1. 设计结论

Phase 3 先按以下边界收敛，不直接做 `Group + Theme` 完整双层 runtime ownership：

1. `Group` 是 shared-state 的主 owner。
2. `Theme` 只作为只读上游默认来源参与继承，不承担本轮 runtime owner 角色。
3. `Graphic` 默认只持有当前状态集合、scope 引用、版本信息、解析结果与少量局部缓存，不再默认持有完整状态定义。
4. `graphic.states` 仅作为 missing-state fallback，但一旦补入，必须进入与 shared-state 相同的裁决管线。
5. `resolver` 保留为实例级 escape hatch。
6. 实例级 `stateProxy` 不作为 shared-state 主路径能力继续支持；如保留，只能是 legacy compatibility，不能进入本轮 ownership 主设计。
7. `Theme` 的只读默认来源通过 `stage.rootSharedStateScope` 这一类 synthetic root scope 承接，避免“无 Group 时 Theme 无法生效”。
8. active graphics 采用“向 scope 链上的所有 ancestor scopes 注册”的多 scope 注册模型，保证外层 `Group` 变更时仍能找到整个 subtree 的 active graphics。
9. Phase 3 必须先闭环 shared-state ownership、precedence、compile cache、invalidation、refresh contract。
10. `Glyph` 继续单列为 Phase 3 决策项，在 ownership 拍板前不作为 shared-state 的正常扩展面。

一句话总结：

**Phase 3 先做 `Group-first + Theme 只读上游来源 + Graphic 消费结果 + resolver 作为实例逃生口`。**

---

## 2. 为什么这样收敛

这套边界直接对齐重构期望文档：

- 状态定义应主要挂在共享层：`Group / Theme / 模板或上层封装层`
- 图元实例主要只持有当前状态集合、当前解析结果和少量局部缓存
- 不建议把“实例级同名状态覆写”作为核心路径
- 少数实例级局部特殊逻辑通过 `resolver` 处理

如果 Phase 3 直接做 `Group + Theme` 完整双层 ownership，会同时把下面几件事拉进来：

- Theme runtime ownership
- 双层 compile cache
- 双层 invalidation
- 双层 refresh contract

这会显著扩大评审和实现范围，而且会削弱 Phase 3 最核心的问题：**shared-state 在 Group 层是否真的闭环。**

---

## 3. 本轮范围与非目标

### 3.1 本轮范围

Phase 3 本轮只设计并闭环：

1. `Group.sharedStateDefinitions` ownership
2. `Theme.stateDefinitions` 只读默认来源
3. shared-state precedence
4. shared-state compile cache
5. shared-state invalidation
6. 共享定义变更后的 dirty / refresh 契约
7. `graphic.states` missing-state fallback 收口
8. `resolver` 的共享定义消费与缓存边界

### 3.2 本轮不做

以下内容明确不在本轮范围：

1. `Theme` 作为 runtime owner 的完整设计
2. `Group + Theme` 双层 compile cache / invalidation API
3. 把实例级 `stateProxy` 继续设计成 shared-state 常规能力
4. `Glyph` 并回统一 shared-state 主路径
5. Phase 4 性能优化项，例如分帧刷新、跨帧批调度、复杂 budget

---

## 4. Ownership 模型

### 4.1 Owner 角色划分

| 对象 | 本轮角色 | 是否 runtime owner | 说明 |
|------|----------|--------------------|------|
| `Theme` | 只读默认来源 | 否 | 提供默认状态定义，不在本轮直接承担编译后 scope 的 runtime owner 角色 |
| `Stage.rootSharedStateScope` | synthetic root scope host | 是（仅基础设施） | 承接 Theme 默认来源，作为顶层 `Group` 与无 Group 图元的 runtime scope 宿主，不是用户配置的常规 owner |
| `Group` | shared-state 主 owner | 是 | 持有共享定义、有效编译视图、active descendants 注册表 |
| `Graphic` | 消费者 | 否 | 持有当前状态、scope 引用、解析结果与局部缓存 |
| `resolver` | 实例级 escape hatch | 否 | 作为状态定义的一部分运行，读取图元上下文 |
| `stateProxy` | legacy compatibility only | 否 | 不进入 shared-state 主路径，不作为本轮推荐模型 |
| `Glyph` | Phase 3 单独决策项 | 待定 | 本轮不并回 shared-state 主路径 |

### 4.2 共享定义来源层级

Phase 3 固定层级如下：

`近层 Group > 外层 Group > Theme`

说明：

1. 最近祖先 `Group` 的定义优先级最高。
2. 外层 `Group` 作为上游默认来源。
3. `Theme` 只提供最外层默认来源。
4. `Graphic` 不在这个 ownership 层级里承担常规定义来源角色。

### 4.3 root-level 承接方案

Theme 虽然不是 runtime owner，但 Phase 3 不允许出现“没有祖先 Group 时 Theme stateDefinitions 无处承接”的空洞。

本轮固定方案是：

1. `Stage` 持有一个 synthetic `rootSharedStateScope`
2. 该 root scope 只承接 Theme 默认来源，不承接新的用户 authoring 入口
3. 顶层 `Group` 的 `parentScope` 固定指向 `stage.rootSharedStateScope`
4. 没有祖先 `Group` 的图元，直接绑定 `stage.rootSharedStateScope`

这保证：

- Theme 继续是只读默认来源
- Group 仍然是 shared-state 的主 authoring owner
- runtime lookup 始终有完整 scope 链

---

## 5. SharedStateScope 数据模型

Phase 3 不只需要“本地定义 + 编译结果”，而是需要一份可直接消费的 **effective compiled view**。

### 5.1 核心结构

```ts
interface SharedStateScope<T extends Record<string, any>> {
  ownerKind: 'group' | 'root';
  ownerGroup?: Group;
  ownerStage?: IStage;
  parentScope?: SharedStateScope<T>;

  // Theme 只读默认来源
  themeStateDefinitions?: StateDefinitionsInput<T>;

  // 当前 Group 本地原始定义
  localStateDefinitions?: StateDefinitionsInput<T>;

  // 按 precedence 展开的有效原始定义视图
  effectiveSourceDefinitions: StateDefinitionsInput<T>;

  // 按 effectiveSourceDefinitions 编译出的有效定义视图
  effectiveCompiledDefinitions: Map<string, CompiledStateDefinition<T>>;

  // scope 版本，shared definitions 变更时递增
  revision: number;

  // 编译当前 effective view 时所依赖的父 scope revision
  parentRevisionAtBuild?: number;

  // 当前 scope subtree 下的已激活后代图元
  subtreeActiveDescendants: Set<IGraphic>;
}
```

### 5.2 为什么必须持有 effective compiled view

如果 scope 只持有“本地 compiled defs”，而把 parent/theme 的组合逻辑留到 lookup 阶段：

1. compile cache key 会变虚
2. invalidation 依赖会变虚
3. `graphic.states` fallback 无法稳定进入同一裁决管线
4. 后续 refresh contract 难以写死

因此本轮直接拍板：

**`SharedStateScope` 持有一份按 `近层 Group > 外层 Group > Theme` 展开的 effective source view，以及其对应的 effective compiled view。**

---

## 6. Precedence 与 lookup 契约

### 6.1 shared-state 命中规则

图元在 shared-state 模式下的状态定义查找顺序固定为：

1. `boundSharedStateScope.effectiveCompiledDefinitions`
2. `graphic.states` missing-state fallback
3. 若两者都没有，视为 undefined state

其中：

- 若图元存在祖先 `Group`，`boundSharedStateScope` 是最近祖先 `Group` 的 scope
- 若图元不存在祖先 `Group`，`boundSharedStateScope` 是 `stage.rootSharedStateScope`

### 6.2 `graphic.states` fallback 收口策略

`graphic.states` 不是 shared-state ownership 的一层，只是 compatibility fallback。

固定规则：

1. 只允许补 shared scope 中 **不存在** 的 state 名。
2. 如果 `graphic.states` 与 shared scope 中出现同名 state：
   - shared scope 胜出
   - `graphic.states` 同名项被忽略
   - 允许在开发模式发 deprecated / compatibility warn
3. fallback state 一旦补入，不能走单独的旧语义，必须进入同一套：
   - `priority`
   - `rank`
   - `exclude / suppress`
   - `effectiveStates`
   - `resolvedPatch`

### 6.3 fallback 如何进入同一裁决管线

为保证语义统一，本轮直接写死为：

1. 先计算 `missingLocalStateDefinitions = graphic.states` 中所有“shared scope 未命中”的定义。
2. 如果 `missingLocalStateDefinitions` 为空：
   - 直接消费 `scope.effectiveCompiledDefinitions`
3. 如果不为空：
   - 以 `scope.effectiveSourceDefinitions + missingLocalStateDefinitions` 构造一份 **per-graphic effective source view**
   - 再通过同一个 `StateDefinitionCompiler` 编译为 **per-graphic effective compiled view**
   - `StateEngine` 消费这份 effective compiled view，而不是走第二套本地 fallback 逻辑

这意味着：

- `graphic.states` fallback 只影响少数 legacy 图元
- 只有“真的存在 missing-state fallback”的图元才承担额外编译成本
- 语义上仍然只存在一套裁决模型

### 6.4 `stateProxy` 与 shared-state 的关系

Phase 3 主设计不把实例级 `stateProxy` 当作常规能力继续纳入。

固定结论：

1. 一旦图元绑定到非空 shared scope，实例级 `stateProxy` 不再参与 shared-state 命中的同名 state 裁决。
2. `stateProxy` 不得重新接管 shared scope 中已经存在的 state 名。
3. 如需保留 legacy `stateProxy`，只能定义为 compatibility mode，而且不能写成推荐路径。
4. 本轮 shared-state 文档、示例和任务拆分都不再把 `stateProxy` 作为常规入口。

---

## 7. Graphic 持有的数据

Phase 3 下，`Graphic` 默认只持有以下 shared-state 相关数据：

```ts
interface GraphicSharedStateRuntime<T extends Record<string, any>> {
  boundSharedStateScope?: SharedStateScope<T>;
  boundSharedStateRevision?: number;

  // 共享定义是否失效
  sharedStateDirty: boolean;

  // 当前 active/effective states 与结果
  activeStates: string[];
  effectiveStates: string[];
  resolvedStatePatch?: Partial<T>;

  // 仅在使用 graphic.states missing-state fallback 时存在
  localFallbackCompiledDefinitions?: Map<string, CompiledStateDefinition<T>>;
  localFallbackVersion?: number;

  // 当前图元已注册到哪些 scope，用于 active descendants 多 scope 注册
  registeredActiveScopes?: SharedStateScope<T>[];
}
```

图元默认不再长期持有完整 shared-state definitions。

---

## 8. Resolver 缓存边界

这是本轮必须写死的实现前提之一。

### 8.1 缓存边界结论

1. `SharedStateScope` 只缓存 **编译后的定义元数据**，不缓存 resolver 输出。
2. resolver 输出缓存仍然是 **per-graphic cache**，不能跨图元共享。
3. resolver 输出缓存 key 至少绑定：
   - `boundSharedStateRevision`
   - `activeStates/effectiveStates key`
   - `localFallbackVersion`（若使用了 local fallback）
   - `resolverEpoch` / `invalidateResolver()` 版本
4. shared definitions 变更后，所有绑定旧 revision 的 per-graphic resolver cache 都失效。

### 8.2 为什么不能把 resolver 输出放进 scope cache

因为 resolver 是实例级 escape hatch，输入天然依赖图元上下文，例如：

- `baseAttributes`
- 业务数据映射
- 图元局部字段
- 当前 active/effective states

如果把 resolver 输出共享到 scope 层，会直接破坏实例差异能力。

### 8.3 resolver 失效规则

Phase 3 固定规则：

1. shared scope revision 变化时，resolver cache 失效。
2. `graphic.states` fallback 版本变化时，resolver cache 失效。
3. 图元主动调用 `invalidateResolver()` 时，resolver cache 失效。
4. 图元 `baseAttributes` 变化时：
   - 若命中的 resolver 已声明 `declaredAffectedKeys`，且此次变化命中这些 key，则失效
   - 若命中的 resolver 未声明 `declaredAffectedKeys`，保守失效

### 8.4 共享层对 resolver 的要求

shared-state 允许 resolver，但 resolver 必须仍然服从统一定义模型：

1. resolver 是某个 shared state definition 的一部分
2. resolver 输出并入 `resolvedStatePatch`
3. resolver 不改变 shared-state ownership
4. resolver 不把实例级 `stateProxy` 重新带回主路径

---

## 9. 共享定义变更后的 dirty / refresh 契约

这是本轮必须写死的第二个实现前提。

### 9.1 语义要求

如果 `Group.sharedStateDefinitions` 变化后只 bump revision，然后等待图元“下次 `useStates()` 再刷新”，那么当前已激活状态的图元会长期停留在旧结果。

这不允许。

### 9.2 固定刷新契约

当 `Group.sharedStateDefinitions` 变化时：

1. 重建该 `Group` 的 `SharedStateScope.effectiveSourceDefinitions`
2. 重建该 `Group` 的 `effectiveCompiledDefinitions`
3. `scope.revision += 1`
4. 更新该 scope 的 `parentRevisionAtBuild`
5. 标记该 scope `subtreeActiveDescendants` 中所有图元为 `sharedStateDirty = true`
6. 对每个已激活图元安排 shared-state refresh

刷新完成前，不允许这些已激活图元无限期保留旧 `resolvedStatePatch`

### 9.3 刷新何时发生

固定规则：

1. 如果图元当前挂在 `stage` 上：
   - refresh 必须在 **下一次 render 前** 完成
   - 调度点固定为复用现有 render 前 hook，不引入独立 shared-state refresh scheduler
   - 不允许等到“某次未来的业务交互再说”
2. 如果图元当前不在 `stage` 上：
   - 允许同步标 dirty
   - 在其重新进入 render 路径前完成 refresh

### 9.4 refresh 做什么

对一个 `sharedStateDirty` 且当前有 `activeStates` 的图元，refresh 必须执行：

1. 重新绑定或确认 `boundSharedStateScope`
2. 调用 `ensureSharedStateScopeFresh(boundSharedStateScope)`：
   - 先递归确保 parent scope 已 fresh
   - 若 `boundScope.parentRevisionAtBuild !== parentScope.revision`，则重建 bound scope 的 effective view
   - 同一 revision 内，同一 scope 只重建一次
3. 取新的 effective compiled view
4. 若存在 `graphic.states` missing-state fallback，重建或确认 per-graphic effective compiled view
5. 按当前 `activeStates` 重新计算：
   - `effectiveStates`
   - `resolvedStatePatch`
6. 调用静态真值同步路径，把结果收敛回：
   - `baseAttributes + resolvedStatePatch -> attribute`

### 9.5 refresh 不做什么

本轮 refresh contract 明确不做：

1. render tick 内临时解析
2. 每帧重复解释 shared-state definitions
3. Phase 4 才需要的 budget / deferred batching

---

## 10. Active descendants 成本模型

这是本轮必须写死的第三个实现前提。

### 10.1 为什么要单独定义

shared definitions 变化如果每次都扫描整个 `Group` 子树，成本会退化为：

`O(all descendants)`

这与 shared-state 的目标冲突。

### 10.2 固定成本模型

Phase 3 采用：

**多 scope 注册的 `subtreeActiveDescendants` 模型 + 仅对已激活后代做 eager refresh，未激活后代保持 lazy refresh。**

### 10.3 active descendants 的维护规则

图元在以下时机更新注册关系：

1. `activeStates` 从空变非空：注册到 `boundSharedStateScope` 以及其所有 ancestor scopes 的 `subtreeActiveDescendants`
2. `activeStates` 从非空变空：从 `registeredActiveScopes` 中的所有 scope 移除
3. 图元 reparent 到新的 `Group`：从旧 scope 链移除，再注册到新 scope 链
4. 图元销毁 / detach：移除注册

这意味着：

- 外层 `Group` scope 能看到整个 subtree 里的 active graphics
- 内层 `Group` scope 仍只负责最近绑定 scope 的 effective view
- 不需要为“祖先 scope 是否知道后代 active graphic”再维护另一套聚合注册表

### 10.4 复杂度边界

shared definitions 变化时：

1. scope 编译成本：
   - `O(effective definitions in scope hierarchy)`
2. active refresh 标记成本：
   - `O(active descendants in this scope subtree)`
3. inactive descendants：
   - 不立即重算
   - 在下一次参与状态求值时按 revision 懒刷新
4. active 注册/解绑成本：
   - `O(scope depth)`

因此 Phase 3 的成本模型明确为：

**共享定义变更不扫描全部后代，只扫描已激活后代；图元激活/解绑时承担 `O(scope depth)` 的多 scope 注册成本。**

### 10.5 为什么这不会破坏语义

因为：

1. 当前已激活图元必须尽快回到新 shared-state 真值
2. 未激活图元当前没有状态 patch，不需要立刻重算
3. 未激活图元在下一次激活前，不会表现出旧 shared-state 结果

---

## 11. Scope 绑定与 reparent 契约

图元不是永久绑定某个 `Group` scope。

### 11.1 绑定规则

图元默认绑定规则固定为：

1. 若存在祖先 `Group`，绑定最近祖先 `Group` 的 `SharedStateScope`
2. 若不存在祖先 `Group`，绑定 `stage.rootSharedStateScope`

### 11.2 reparent 规则

图元发生 reparent 时：

1. 解绑旧 scope
2. 若当前有 `activeStates`，从旧 scope 链的 `subtreeActiveDescendants` 移除
3. 绑定新 scope
4. 标记 `sharedStateDirty = true`
5. 若当前有 `activeStates`，重新注册到新 scope 链
6. 在新 scope 下完成 refresh

### 11.3 Theme 变更的处理

本轮 `Theme` 只作为只读默认来源，因此 Theme 变更不引入独立 runtime owner。

固定规则：

1. `Theme.stateDefinitions` 变化时，先重建 `stage.rootSharedStateScope`
2. 顶层 `Group` 与无 Group 图元都通过 root scope revision 感知变更
3. `Group` 仍然是 shared-state 的主 authoring owner；root scope 只是 runtime 承接基础设施

---

## 12. 与 Phase 2 主路径的关系

Phase 3 不重开 Phase 2 的属性分层与 authoritative patch 主路径。

继续保持：

`baseAttributes + resolvedStatePatch -> attribute`

Phase 3 只改变一件事：

**`resolvedStatePatch` 的状态定义来源从“实例默认持有”转为“shared scope 编译结果 + 必要的 missing-state fallback”。**

---

## 13. Glyph 边界

这是本轮必须写死的第四个边界。

Phase 3 对 `Glyph` 的要求只有 3 条：

1. 不继续扩 glyph 专属状态语义
2. 先回答 `Glyph ownership`
3. 再回答它是否并回统一 shared-state scope

在这两个问题拍板前：

**`Glyph` 不是 shared-state 设计的正常扩展面。**

---

## 14. 推荐实现切分

Phase 3 建议拆成 4 个实现包，而不是一次性大改：

### 14.1 Package A：Group scope ownership

- `Group.sharedStateDefinitions`
- `SharedStateScope`
- effective source / compiled view
- precedence 闭环

### 14.2 Package B：Graphic scope binding

- `Graphic.boundSharedStateScope`
- scope revision / dirty 标记
- active descendants 注册
- reparent / detach 契约

### 14.3 Package C：shared refresh contract

- Group 变更后的 active descendants refresh
- render 前刷新保证
- inactive lazy refresh

### 14.4 Package D：compatibility 收口

- `graphic.states` missing-state fallback 编译路径
- `resolver` cache boundary
- `stateProxy` compatibility 限缩
- 测试基线重建

---

## 15. 最低验收标准

Phase 3 设计评审通过前，至少要能稳定回答下面这些问题：

1. shared-state owner 是谁
2. Theme 在本轮是不是 runtime owner
3. `graphic.states` fallback 如何进入同一裁决管线
4. resolver cache 为什么不能跨图元共享
5. shared definitions 变化后，当前已激活图元何时刷新
6. refresh 为什么不会退化成扫描整个子树
7. `stateProxy` 为什么不再作为 shared-state 主路径能力
8. `Glyph` 为什么被单列，而不是直接并回主路径

只要其中任一项仍回答为“实现时再看”，Phase 3 设计就还不能进入开发。

---

## 16. 非阻塞后续问题

本版设计只保留 2 个非阻塞后续问题；它们不影响 Phase 3 主路径进入实现：

1. `graphic.states` missing-state fallback 是否只允许在开发模式告警，还是直接在默认模式就输出 deprecated 提示。
2. `Glyph ownership` 在 Phase 3 评审中是单独出文档，还是并入本设计的后续章节。

---

## 17. 下一步

本设计对应的 Phase 3 主路径实现、request-changes fixup 与 close-out 已全部完成。后续按以下顺序推进：

1. 以当前文档与 `D3_PHASE3_IMPLEMENTATION_LOG.md` 作为 Phase 3 归档基线
2. 进入 Phase 4 设计
3. 继续跟踪两个非阻塞后续项：`graphic.states` 告警策略与 `Glyph ownership` 文档拆分方式

---

**文档版本**：v0.3
**创建时间**：2026-04-07
**最后更新**：2026-04-08
**状态**：已关闭（实现、复核与 close-out 全部完成）
