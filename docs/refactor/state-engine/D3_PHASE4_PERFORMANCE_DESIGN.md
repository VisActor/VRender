# D3 Phase 4 设计文档 — 性能优化

> **目标读者**：协调者 / 总监 reviewer / Phase 4 实现者
> **用途**：Phase 4 正式设计文档
> **设计基线**：`graphic-state-animation-refactor-expectation.md` + `D3_ARCH_DESIGN.md`（Phase 2 / Phase 3 已 closed）
> **当前状态**：已关闭（实现已完成、已通过复核并完成 close-out）

---

## 1. 设计结论

Phase 4 第一版不做“性能大礼包”，而是按以下顺序收敛：

1. **观测优先**
   先建立状态切换、shared-state refresh 与批量调度的运行时观测能力，让性能瓶颈先可见、可归因、可复盘。
2. **调度闭环**
   再建立 `paint-only` 默认可用的批量状态调度 / 分帧提交能力，目标是削峰、控帧长，而不是追求绝对最短总耗时。
3. **缓存优化收口**
   最后补 resolver / patch / batch job 相关缓存优化，但它们只作为 Phase 4 后半段，不主导本轮设计。

一句话总结：

**Phase 4 先做 `观测 + paint-only 批量调度`，缓存优化只作为后半段的局部增强，不重新改写状态解释主路径。**

---

## 2. 为什么这样收敛

这套边界直接对齐期望文档的 4 条核心约束：

1. 性能优化重点应放在**状态切换阶段**，而不是 render/pick/bounds 热路径。
2. 默认语义仍然优先保证一致性，性能策略只是**可选增强**。
3. 批量状态切换是**独立性能策略**，不能直接等同于现有 incremental draw。
4. 只有 `paint-only` 才默认进入分帧 / 批量调度；涉及 geometry / bounds / pick / layout 的变化仍同步收敛。

如果 Phase 4 第一版直接把“观测、调度、缓存、shared refresh 优化、debug 面板、跨图元 cache”一次拉满，会同时引入：

- 过多尚未验证收益的复杂基础设施
- 难以界定责任边界的多层缓存
- 难以解释的调度副作用
- 更高的 review 成本和实现风险

更合理的顺序是：

1. 先回答“慢在哪里”
2. 再回答“哪些场景值得进入分帧调度”
3. 最后才回答“哪些 cache 真正带来收益”

---

## 3. 本轮范围与非目标

### 3.1 本轮范围

Phase 4 第一版只设计并闭环：

1. 状态切换与 shared-state refresh 的运行时观测
2. `paint-only` 批量状态调度 / 分帧提交
3. 批量任务的生命周期、取消、合并与调试边界
4. 缓存优化的边界与优先级
5. 性能成本模型与验收场景

### 3.2 本轮不做

以下内容明确不在本轮范围：

1. 把状态解释逻辑重新带回 render / pick / bounds 热路径
2. 把 deferred state update 直接做成 incremental draw 的别名
3. 让 geometry / bounds / pick / layout 变化默认进入分帧调度
4. 自动猜测是否应启用分帧状态提交
5. 跨图元共享 resolver 输出缓存
6. 重新打开 Phase 2 真值模型与 Phase 3 shared-state ownership
7. `Glyph ownership` 的最终实现

---

## 4. Phase 4 的输入与现有基础

Phase 4 不是从零开始。当前内核已经具备这些基础：

1. Phase 2 已建立：
   - `baseAttributes + resolvedStatePatch -> attribute`
   - `UpdateCategory`
   - `UPDATE_PAINT`
   - `paint-only` dirty rect 与显式冷启动路径
2. Phase 3 已建立：
   - `Theme -> rootSharedStateScope -> Group scopes -> Graphic effective compiled view`
   - active descendants refresh 契约
   - shared-state refresh 显式调度 `stage.renderNextFrame()`
3. 当前渲染侧已经有：
   - `Stage.renderNextFrame()`
   - `AutoRenderPlugin`
   - `DirtyBoundsPlugin`
   - `PerformanceRAF.addAnimationFrameCb()`

这意味着：

1. Phase 4 不需要发明新的状态真值模型。
2. Phase 4 可以复用现有 render 前 / 下一帧调度基础设施。
3. Phase 4 的关键是把**性能策略**从“零散的优化点”收敛为可观测、可解释、可控的子系统。

---

## 5. 观测子系统

### 5.1 设计目标

Phase 4 第一优先级不是“先优化”，而是**先让性能问题可见**。

观测子系统必须回答：

1. 当前状态切换中，多少是 `paint-only`，多少落入 `bounds / shape / layout / pick`
2. shared-state refresh 到底刷了多少 active graphics
3. resolver / patch / shared refresh / batch slice 哪一段在耗时，以及哪类内部对象创建更可能形成分配压力
4. 大规模联动时，是谁触发了帧预算耗尽
5. 为什么某一批状态切换没有进入 deferred 路径，以及具体被哪类资格规则拦下

### 5.2 观测边界

观测必须落在**状态切换与调度边界**，而不是每次 render / pick / bounds 都做重型采样。

Phase 4 固定的观测点如下：

1. `StateEngine` 完成一次状态重算时
2. `Graphic.submitUpdateByDelta()` 完成一次 delta 分类时
3. shared-state refresh queue 入队 / flush 时
4. batch job 创建、yield、完成、取消、合并时
5. deferred path 判定为“不符合资格”时

固定禁止：

1. 不在 render 热路径中重新解释状态定义
2. 不在 pick / bounds 每次读取时追加重型统计逻辑
3. 不把 debug 事件流默认开到逐图元详细日志

### 5.3 观测数据模型

Phase 4 固定采用两层观测：

1. **轻量聚合计数器**
2. **可选的有界事件环**

建议的 Stage 级快照模型：

```ts
type DeferredIneligibleReason =
  | 'config_disabled'
  | 'context_disabled'
  | 'non_batch_operation'
  | 'mixed_update_category'
  | 'resolver_unstable_keys'
  | 'graphic_unavailable';

interface IStatePerfSnapshot {
  counters: {
    stateCommits: number;
    sharedRefreshCommits: number;
    deferredJobsCreated: number;
    deferredJobsCompleted: number;
    deferredJobsCancelled: number;
    deferredJobsCoalesced: number;
    deferredGraphicsCommitted: number;
    deferredBudgetYields: number;
    deferredIneligibleGraphics: number;
  };
  deferredIneligibleByReason: Record<DeferredIneligibleReason, number>;
  categoryBreakdown: {
    paint: number;
    transform: number;
    shape: number;
    bounds: number;
    layout: number;
    pick: number;
  };
  refresh: {
    queuedGraphics: number;
    flushedGraphics: number;
    ensureFreshCalls: number;
    renderScheduled: number;
  };
  resolver: {
    cacheHits: number;
    cacheMisses: number;
    invalidations: number;
  };
  cost: {
    resolverTotalMs: number;
    resolverMaxMs: number;
    patchTotalMs: number;
    patchMaxMs: number;
    sharedRefreshTotalMs: number;
    sharedRefreshMaxMs: number;
    batchSliceTotalMs: number;
    batchSliceMaxMs: number;
  };
  allocationHints: {
    patchObjectsCreated: number;
    batchEntriesCreated: number;
    refreshQueuePushes: number;
  };
  batch: {
    pendingJobs: number;
    maxPendingJobs: number;
    maxGraphicsInJob: number;
    maxFrameSliceCost: number;
  };
}
```

可选的事件环只记录高价值事件，例如：

- `state-commit`
- `shared-refresh-flush`
- `deferred-job-start`
- `deferred-job-yield`
- `deferred-job-cancel`
- `deferred-job-complete`
- `deferred-ineligible`

事件环必须满足：

1. 默认关闭
2. 有固定上限
3. 不保存逐图元完整 patch
4. 只用于调试和问题复盘

### 5.4 配置与暴露方式

观测能力固定为 Stage 级主入口：

```ts
interface IStatePerfConfig {
  enabled?: boolean;
  recordEvents?: boolean;
  maxEventRecords?: number;
}

interface IStage {
  statePerfConfig?: IStatePerfConfig;
  getStatePerfSnapshot(): IStatePerfSnapshot;
  resetStatePerfSnapshot(): void;
}
```

说明：

1. 统计归属在 Stage，而不是单个 Graphic。
2. Group / Layer 可以影响 deferred 调度配置，但不各自持有完整性能统计中心。
3. 若未开启 `recordEvents`，仍允许保留低开销计数器。
4. `deferredIneligibleByReason` 必须至少覆盖上面 6 类固定 reason，不允许只保留总量。
5. `cost` 采用边界阶段的累计值 + 最大值，不要求逐图元明细。
6. `allocationHints` 只统计本子系统内部可控对象创建次数，不承诺精确 GC / heap telemetry。

### 5.5 观测的低开销约束

必须写死：

1. 聚合计数器只允许做数字累加，不做对象克隆
2. 事件环关闭时不得分配事件对象
3. resolver 观测只记录命中/失效计数，不记录完整 resolver 输出
4. batch 观测不得把每个图元的 patch 存进历史记录
5. `cost` 只允许在状态切换 / shared refresh / batch slice 边界上做 `performance.now()` 包围，不得扩散到 render 热路径
6. `allocationHints` 只统计框架内部显式创建的 patch / batch entry / refresh queue entry，不做通用对象分配追踪

---

## 6. 批量状态调度子系统

### 6.1 默认语义仍然是同步收敛

Phase 4 不改变默认语义：

1. 普通规模状态切换仍同步完成
2. `activeStates / effectiveStates / resolvedStatePatch / attribute / render` 默认保持一次提交内一致
3. deferred state update 是**性能兜底策略**，不是新的默认状态语义

### 6.2 调度资格

只有满足以下条件，状态切换才允许进入 deferred 路径：

1. 显式启用了 deferred state config
2. 目标操作是批量状态切换，而不是单图元常规交互
3. 目标图元的本次状态变化经保守分类后，结果严格等于 `PAINT`
4. 不涉及：
   - `TRANSFORM`
   - `SHAPE`
   - `BOUNDS`
   - `LAYOUT`
   - `PICK`
5. 含 resolver 但无法稳定判定 `affectedKeys` 的状态，一律视为**不符合 deferred 资格**

固定说明：

1. `PICK` 在 Phase 2 仍 piggyback 到 `BOUNDS`，因此含 pick 风险的状态切换一律不进入 deferred 路径。
2. shared definition 变化触发的 active refresh 在 Phase 4 第一版只做**观测**，不默认进入 deferred 路径。
3. geometry / bounds / layout / pick 相关变化仍保持同步收敛。

### 6.3 配置层级

deferred state config 保持区域级配置：

```ts
interface IDeferredStateConfig {
  enabled?: boolean;
  frameBudget?: number;
  maxGraphicsPerFrame?: number;
}

interface IDeferredStateContextConfig {
  deferred?: IDeferredStateConfig;
  priority?: number;
  localEnabled?: boolean;
}
```

配置优先级固定为：

`Group > Layer > Stage > 全局默认`

说明：

1. 它是区域级渲染策略，不是单次 `useStates()` 的临时参数。
2. VChart / VTable 等上层可向 VRender 透传 Stage 级默认配置。

### 6.4 job identity 与区域级 owner/config 语义

这是 Phase 4 进入实施前必须拍板的最后一个基础约束：

**job identity 不只绑定状态意图，还必须绑定“谁提供了生效 deferred config”。**

也就是说，一个 deferred job 的身份固定由以下三部分组成：

1. `contextOwnerId`
   - 本次批量调度中，真正提供生效 deferred config 的区域级 owner
   - 必须是按 `Group > Layer > Stage > 全局默认` 解析后的最终 owner
2. `configFingerprint`
   - 本次真正生效的 deferred config 快照
   - 至少包含：`enabled / frameBudget / maxGraphicsPerFrame`
3. `targetStatesKey`
   - 本次状态意图对应的稳定 key

建议数据模型：

```ts
type StateBatchIntentKey = string;

interface IResolvedDeferredContext {
  contextOwner: IStage | ILayer | IGroup;
  contextOwnerId: number;
  config: Required<IDeferredStateConfig>;
  configFingerprint: string;
}
```

固定要求：

1. **不同 `contextOwnerId` 的图元不得合并到同一个 job**
   - 即使 `targetStates` 完全相同
   - 即使 `frameBudget / maxGraphicsPerFrame` 数值恰好一样
2. **相同 `contextOwnerId` 但 `configFingerprint` 不同的图元不得合并到同一个 job**
3. 只有同时满足：
   - `contextOwnerId` 相同
   - `configFingerprint` 相同
   - `targetStatesKey` 相同
   才允许复用同一个 job
4. `contextOwner` 不是附带元数据，而是 job identity 的组成部分
5. `config` 在 job 创建后按快照冻结，不因 owner 后续配置变化而原地突变

这条规则的目的，是把以下语义写死：

1. 区域级 deferred config 的作用域边界必须真实存在
2. Group / Layer / Stage 的配置优先级不能在 batch 合并时被抹平
3. 即使是“同一状态意图”，不同区域也不自动共享同一个 job

### 6.5 任务模型

Phase 4 第一版在这里正式拍板：**采用 single-intent job 模型**，不采用 per-graphic intent job。

原因：

1. Phase 4 当前的批量优化目标主要是“一批图元应用同一种状态意图”，single-intent job 更符合这个主场景。
2. 它把 job 本身保持为单一语义单元，便于统计、取消、归档和调试。
3. “同图元最后一次意图胜出”通过 scheduler side table 闭环即可，不需要把 job 扩成多意图容器。

Phase 4 固定引入独立 `StateBatchJob`，而不是直接复用 incremental draw 任务模型。

```ts
type StateBatchJobKind = 'apply_states';
type StateBatchIntentKey = string;

interface IStateBatchJob {
  id: number;
  kind: StateBatchJobKind;
  intentKey: StateBatchIntentKey;
  status: 'pending' | 'running' | 'completed' | 'cancelled';
  targetStates: string[];
  targetStatesKey: string;
  pendingGraphics: Set<IGraphic>;
  orderedGraphics: IGraphic[];
  config: Required<IDeferredStateConfig>;
  contextOwner: IStage | ILayer | IGroup;
  contextOwnerId: number;
  configFingerprint: string;
  createdAt: number;
  processedCount: number;
}

interface IDeferredStateSchedulerState {
  jobsByIntentKey: Map<StateBatchIntentKey, IStateBatchJob>;
  pendingIntentByGraphic: Map<IGraphic, StateBatchIntentKey>;
}
```

固定要求：

1. 一个 job 只能代表**一种状态意图 + 一份区域级 deferred config 语境**。
2. job identity 固定为：
   `contextOwnerId + configFingerprint + targetStatesKey`
3. `targetStatesKey` 只负责表达状态意图，不负责表达区域 owner / config 语义。
4. `pendingIntentByGraphic` 的 value 必须对应完整 job identity，而不是只保存 `targetStates`。
5. `pendingIntentByGraphic` 是“同图元最后一次意图胜出”的唯一调度侧真值。
6. `pendingGraphics` 表示当前仍归属该 job、尚未提交的图元集合。
7. `orderedGraphics` 只负责稳定遍历顺序，不等价于当前仍有效的 pending membership。
8. job 保存的是**状态操作意图**，不是预计算 patch 结果。
9. job 在真正提交图元时，仍调用正式状态主路径。
10. job 不缓存跨图元的 resolver 输出。
11. job 不维护第二套状态真值。

### 6.6 延迟收敛一致性契约

这是 Phase 4 必须写死的核心语义：

**deferred 模式下，状态意图可以先入队，但单个 graphic 的 committed state snapshot 只在真正被 job 提交时原子切换。**

也就是说：

1. 图元进入 batch job 后，不立即改写 `activeStates / effectiveStates / resolvedStatePatch / attribute`
2. 在该图元真正被处理的那一帧，才一次性完成：
   - 状态集合切换
   - patch 重算
   - `_syncAttribute()`
   - update tag 提交
3. 因此多帧窗口内允许“有的图元已是新状态，有的图元仍是旧状态”
4. 但**单个图元内部**不允许出现：
   - `activeStates` 已变新
   - `attribute` / render 仍是旧值

这条契约的目的，是保持 per-graphic 的一致性和可调试性。

### 6.7 合并、取消与重入规则

Phase 4 第一版固定采用“single-intent job + per-graphic pending intent side table”的 coalesce 语义：

1. 若同一 graphic 在尚未被 batch commit 前，又收到**相同 intentKey** 的 deferred paint-only 状态操作：
   - 不创建新 job
   - 若该 graphic 已在对应 job 的 `pendingGraphics` 中，则保持原 membership，不重复入队
2. 若同一 graphic 在尚未被 batch commit 前，又收到**不同 intentKey** 的 deferred paint-only 状态操作：
   - 从旧 intent job 的 `pendingGraphics` 中移除
   - 更新 `pendingIntentByGraphic`
   - 归入新的 intent job；若该 job 不存在，则新建
   - 若旧 job 已无 `pendingGraphics`，则将旧 job 标记为 `cancelled` 或直接移除
3. 若 graphic 在排队期间被销毁 / detach / release：
   - 从当前 intent job 的 `pendingGraphics` 中移除
   - 从 `pendingIntentByGraphic` 中删除
4. 若 graphic 在排队期间收到必须同步收敛的状态变化：
   - 立即从当前 deferred intent job 中移除
   - 从 `pendingIntentByGraphic` 中删除
   - 交由同步主路径处理
5. job 自身允许被取消，但取消只影响**尚未提交**的 `pendingGraphics`
6. run loop 遇到以下情况必须 `skip`：
   - graphic 已不在 `pendingGraphics`
   - `pendingIntentByGraphic.get(graphic) !== job.intentKey`
   - graphic 已不可渲染或已 release
7. 若 graphic 在排队期间发生 reparent，或其区域级 deferred config 来源发生变化：
   - 重新解析 `IResolvedDeferredContext`
   - 若新的 `contextOwnerId + configFingerprint + targetStatesKey` 发生变化，则必须从旧 job 中移除并重新归入新 identity 对应的 job
   - 若新上下文不再满足 deferred 资格，则从旧 job 中移除并回退到同步主路径
8. 若 owner 的 deferred config 在 job 运行期间发生变化：
   - 该变化**不原地修改已有 job 的 `config` 快照**
   - 只影响后续新入队 graphics，或触发现有未提交 graphics 迁移到新 identity job

这保证：

1. 旧 pending intent 不会迟到覆盖新状态
2. “同图元最后一次意图胜出”由 `pendingIntentByGraphic` 明确承接
3. deferred 不会演化成一套难以解释的双真值系统
4. 区域级 config / owner 的边界不会在 job 合并阶段被抹平

### 6.8 调度循环

Phase 4 第一版复用现有 `PerformanceRAF`，并新增轻量 `wait()` 包装：

```ts
class PerformanceRAF {
  addAnimationFrameCb(callback: FrameRequestCallback): number;
  wait(): Promise<void>;
}
```

`wait()` 只是 `addAnimationFrameCb` 的 Promise 包装，不引入新的全局 scheduler。

建议的 batch 调度循环：

```ts
function enqueueDeferredIntent(
  graphic: IGraphic,
  targetStates: string[],
  owner: IStage | ILayer | IGroup,
  config: Required<IDeferredStateConfig>
): void {
  const resolvedContext = resolveDeferredContext(graphic, owner, config);
  const nextIntentKey = makeIntentKey(
    resolvedContext.contextOwnerId,
    resolvedContext.configFingerprint,
    targetStates
  );
  const prevIntentKey = pendingIntentByGraphic.get(graphic);

  if (prevIntentKey === nextIntentKey) {
    return;
  }

  if (prevIntentKey) {
    removeGraphicFromIntentJob(graphic, prevIntentKey);
  }

  const job = getOrCreateIntentJob(
    nextIntentKey,
    targetStates,
    resolvedContext.contextOwner,
    resolvedContext.config
  );
  if (!job.pendingGraphics.has(graphic)) {
    job.pendingGraphics.add(graphic);
    job.orderedGraphics.push(graphic);
  }
  pendingIntentByGraphic.set(graphic, nextIntentKey);
}

async function runJob(job: IStateBatchJob, raf: PerformanceRAF): Promise<void> {
  let frameStart = performance.now();
  let processedInFrame = 0;

  for (const graphic of job.orderedGraphics) {
    if (shouldYield(job.config, frameStart, processedInFrame)) {
      await raf.wait();
      frameStart = performance.now();
      processedInFrame = 0;
    }

    if (
      !job.pendingGraphics.has(graphic) ||
      pendingIntentByGraphic.get(graphic) !== job.intentKey ||
      isGraphicUnavailable(graphic) ||
      hasGraphicDeferredIdentityChanged(graphic, job)
    ) {
      continue;
    }

    commitGraphicDeferredStates(graphic, job.targetStates);
    job.pendingGraphics.delete(graphic);
    pendingIntentByGraphic.delete(graphic);
    processedInFrame++;
  }

  if (job.pendingGraphics.size === 0) {
    job.status = 'completed';
    jobsByIntentKey.delete(job.intentKey);
  }
}
```

关键要求：

1. 每帧是否 yield 只看：
   - `frameBudget`
   - `maxGraphicsPerFrame`
2. job 提交期间不预计算全量 patch 队列
3. 每次真正提交仍走正式 `useStates()` / 状态主路径
4. render 调度继续复用现有 `stage.renderNextFrame()` 去重能力
5. skip / remove / cancel 规则必须与 `pendingIntentByGraphic` 保持一致，不能只改 `orderedGraphics`

### 6.9 与现有基础设施的承接关系

Phase 4 对现有基础设施的承接关系固定如下：

1. `PerformanceRAF`
   - 只新增 `wait()` 包装
   - 不新增另一套帧调度器
2. `Stage.renderNextFrame()`
   - 继续承担下一帧渲染调度
   - batch commit 触发的属性更新仍走现有 dedupe
3. `AutoRenderPlugin`
   - 继续响应 `onAttributeUpdate`
4. `DirtyBoundsPlugin`
   - 继续承接 `UPDATE_PAINT` dirty rect
5. incremental draw
   - 只复用区域级调度思想与局部基础设施
   - 不把 state batch job 直接建模成 incremental draw job

---

## 7. 缓存优化边界

缓存优化是 Phase 4 后半段，但必须先把边界写死。

### 7.1 可以做的缓存优化

可以优先考虑：

1. resolver cache 命中观测与失效合并
2. `UpdateCategory` 分类结果的局部复用
3. batch job 对重复状态意图的 coalesce
4. shared-state refresh queue 的去重
5. patch merge 过程中的临时对象复用

### 7.2 明确不做的缓存优化

本轮明确不做：

1. 跨图元共享 resolver 输出缓存
2. 把完整 resolved patch 作为共享静态结果跨图元复用
3. 为了 cache 命中而引入新的 source of truth
4. 在 render 热路径做惰性解释并顺手缓存

### 7.3 缓存优化的前提

任何缓存优化都必须先满足：

1. 观测指标能证明该段开销真实存在
2. 不改变 Phase 2/3 已定的真值语义
3. 失效规则可推理、可测试
4. 不把 debug 成本转嫁到线上默认路径

---

## 8. 成本模型

Phase 4 第一版的目标成本模型如下：

1. **默认同步路径**
   - 继续保证语义清晰
   - 不因 Phase 4 引入额外重型观测成本
2. **deferred paint-only 路径**
   - 目标不是绝对最短总耗时
   - 而是控制单帧阻塞，保持交互响应
3. **观测子系统**
   - 默认只增加低开销计数器
   - 详细事件环关闭时近似常数开销
4. **缓存优化**
   - 只有在观测证明收益明确后才启用

因此 Phase 4 的核心目标不是：

- “把所有状态切换都变快”

而是：

- “把大规模 `paint-only` 状态切换的最差帧耗时压下来，并让性能问题可定位”

---

## 9. 关键场景

Phase 4 至少需要覆盖以下场景：

### 场景 A：大规模纯视觉联动

5k~50k 图元进入 `selected / blur / select-revert`，只改 `fill / opacity / shadowColor`。

要求：

1. 可进入 deferred 路径
2. 支持多帧收敛
3. 单个图元仍保持 committed snapshot 一致
4. 能看到 job 总量、yield 次数、每帧处理量

### 场景 B：混合几何状态

同一批图元中，部分状态改 `fill`，部分状态改 `lineWidth` 或 `width / height`。

要求：

1. 非 `paint-only` 图元不得进入 deferred 路径
2. 不能因为 batch job 存在而拖慢同步路径
3. 指标里能看到 deferred ineligible 的 reason breakdown

### 场景 C：shared refresh 高峰

外层 Group shared definitions 更新，active descendants 很多。

要求：

1. 第一版至少能观测刷新规模和 render 调度次数
2. 不要求第一版默认分帧 shared refresh
3. 必须能定位 shared refresh 是否成为瓶颈

### 场景 D：连续交互覆盖旧意图

还未提交完的 deferred job 遇到新一轮 hover / selected / clearStates。

要求：

1. 同图元最后一次状态意图胜出
2. 旧 pending intent 不得迟到覆盖新状态
3. 调试信息中可见 coalesced / cancelled 次数

### 场景 E：性能问题定位

用户反馈“联动选中卡顿”。

要求：

1. 能区分是 resolver 耗时高、patch merge 耗时高、shared refresh 过多，还是 deferred job budget 不足
2. 能从 Stage 级 snapshot 看出主要瓶颈方向

---

## 10. 建议的实施拆分

Phase 4 建议拆成 3 个实现包，而不是一次性大改：

### 10.1 P4-A：观测基线

目标：

1. 建立 Stage 级 `state perf snapshot`
2. 接入状态提交、shared refresh、batch job 关键计数器
3. 补齐 `deferredIneligibleByReason` 与分段成本指标
4. 建立最小事件环与调试接口

### 10.2 P4-B：paint-only 批量调度

目标：

1. 建立 `StateBatchJob`
2. 新增 `PerformanceRAF.wait()`
3. 落地 `paint-only` deferred path
4. 固定 single-intent job 的 merge / cancel / committed snapshot 语义

### 10.3 P4-C：缓存优化收口

目标：

1. 基于观测结果决定 resolver / patch / batch job 哪些 cache 值得做
2. 不引入跨图元 resolver 结果共享
3. 为后续 Phase 4 close-out 准备性能基准

---

## 11. 评审时必须稳定回答的问题

Phase 4 评审通过前，至少要能稳定回答下面这些问题：

1. 为什么观测点放在状态切换边界，而不是 render 热路径
2. 为什么 deferred 默认只适用于 `paint-only`
3. deferred 模式下，为什么 `activeStates / attribute` 不立即切换
4. 为什么 Phase 4 第一版采用 single-intent job，而不是 per-graphic multi-intent job
5. 为什么相同 `targetStates` 但不同 `contextOwnerId / configFingerprint` 不能合并成同一个 job
6. 为什么 batch job 保存的是状态意图，而不是预计算 patch
7. 为什么 shared refresh 第一版只做观测、不默认分帧
8. 为什么 cache 优化不能先于观测落地
9. 为什么不能跨图元共享 resolver 输出缓存

只要其中任一项仍回答为“实现时再看”，Phase 4 设计就还不能进入实施任务文档编写。

---

## 12. 非阻塞后续问题

本版设计只保留 2 个非阻塞后续问题；它们不影响 Phase 4 第一版进入实施设计：

1. `graphic.states` missing-state fallback 告警策略最终采用开发模式告警，还是默认 deprecated 提示。
2. `Glyph ownership` 的文档拆分方式，是单独出文档，还是并入后续章节。

它们继续跟踪，但不成为 Phase 4 性能子系统的 blocker。

---

## 13. 下一步

本设计文档完成后，下一步按以下顺序推进：

1. 基于本设计文档与已产出的实施材料，进入总监 / review agent 复核
2. 产出并维护：
   - `D3_PHASE4_DIRECTOR_REVIEW_PROMPT.md`
   - `D3_PHASE4_EXECUTION_PROMPT.md`
   - `D3_PHASE4_IMPLEMENTATION_LOG.md`
3. 再进入 Phase 4 实现与后续 close-out

---

**文档版本**：v0.1
**创建时间**：2026-04-08
**最后更新**：2026-04-09
**状态**：已关闭（实现已完成、已通过复核并完成 close-out）
