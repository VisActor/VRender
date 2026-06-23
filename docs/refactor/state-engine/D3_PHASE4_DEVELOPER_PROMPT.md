# D3 Phase 4 开发者沟通 Prompt — 性能优化

> **目标读者**：资深开发者
> **沟通目的**：基于 Phase 2 / Phase 3 已 closed 状态，执行 Phase 4
> **设计基线**：`D3_ARCH_DESIGN.md`（v1.11） + `D3_PHASE4_PERFORMANCE_DESIGN.md`（v0.1）
> **状态**：已关闭（实现已完成、已通过复核并完成 close-out）

---

## 背景

Phase 2 和 Phase 3 已完成并 closed，当前已具备：

- `baseAttributes + resolvedStatePatch -> attribute`
- `UpdateCategory` / `UPDATE_PAINT` / `paint-only` 提交边界
- `Theme -> rootSharedStateScope -> Group scopes -> Graphic effective compiled view`
- shared refresh 契约
- 现有 `Stage.renderNextFrame()` / `AutoRenderPlugin` / `DirtyBoundsPlugin` / `PerformanceRAF.addAnimationFrameCb()`

Phase 4 的目标不是重写状态内核，而是把**观测、严格 paint-only 的批量调度、后半段缓存边界**收口到性能子系统。

---

## Phase 4 最终目标

把 Phase 4 主路径收敛到：

```ts
state change / shared refresh / batch scheduling boundary
  -> Stage state perf snapshot
  -> strict paint-only deferred eligibility
  -> single-intent StateBatchJob
  -> per-graphic committed snapshot atomic commit
```

完成后必须满足：

1. 观测点只落在状态切换、shared refresh、batch job 边界
2. deferred 只对显式启用且严格 `paint-only` 的批量状态切换开放
3. `StateBatchJob` 使用 `single-intent job`
4. job identity 固定为 `contextOwnerId + configFingerprint + targetStatesKey`
5. 同图元最后一次意图胜出
6. per-graphic committed snapshot 原子切换成立
7. shared refresh 第一版只做观测，不默认 deferred
8. resolver 输出缓存仍不得跨图元共享

---

## 已确认的决策

以下不是开放讨论项，默认按此执行：

### 1. 观测优先

- 先做 Stage 级 snapshot
- 先补 reason breakdown / cost / allocation hints
- 不先做性能大礼包

### 2. strict paint-only deferred

- 只有显式启用、批量状态切换、严格 `PAINT` 才能进入 deferred
- 含 resolver 且 `affectedKeys` 不稳定时一律 ineligible

### 3. single-intent job

- 一个 job 只能表示一种状态意图
- 不在 job 内支持 per-graphic 多意图

### 4. job identity 必须绑定 owner/config

- `targetStates` 相同不代表能合并
- 必须同时看：
  - `contextOwnerId`
  - `configFingerprint`
  - `targetStatesKey`

### 5. committed snapshot

- 图元入队后不立即切状态
- 真正 commit 时才一次性切换 `activeStates / patch / attribute`

### 6. shared refresh

- 这一版只做 observability
- 不默认进入 deferred

### 7. cache 边界

- 可以做局部复用、队列去重、分类结果复用
- 不做跨图元 resolver 输出缓存

---

## 你需要完成的任务

请严格按 [D3_PHASE4_IMPLEMENTATION_GUIDE.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE4_IMPLEMENTATION_GUIDE.md) 执行。核心任务如下：

1. 建立 Stage 级 `state perf snapshot`
2. 接入状态切换 / shared refresh / batch job 观测
3. 建立 strict paint-only deferred eligibility
4. 建立 single-intent `StateBatchJob`
5. 落地 `contextOwnerId + configFingerprint + targetStatesKey` identity
6. 落地 committed snapshot 与 yield 循环
7. 建立 Phase 4 专项测试矩阵

---

## 四个必须优先解决的风险点

### 风险 1：观测目标与数据模型不闭环

如果 snapshot 只有粗粒度 counters，就无法解释：

- 哪类状态被 deferred 拦下
- resolver / patch / shared refresh / batch slice 谁在耗时

这是 blocker。

### 风险 2：job identity 抹平区域级 config 语义

如果 `jobsByIntentKey` 只看 `targetStates`，不同 Group / Layer / Stage 生效上下文会被错误合并。  
这不是实现小差异，而是语义错误。

### 风险 3：最后一次意图胜出不闭环

如果没有 `pendingIntentByGraphic` 或等价 side table，旧 pending intent 可能迟到覆盖新状态。  
不允许靠“应该不会发生”来规避。

### 风险 4：deferred 破坏单图元一致性

如果图元入队就立刻改 `activeStates`，而 `attribute` 仍是旧值，会形成半更新态。  
这违反 Phase 4 已拍板的 committed snapshot 契约。

---

## 关键校验场景

### 场景 A：5k~50k 纯视觉联动

- 只改 `fill / opacity / shadowColor`
- 可进入 deferred
- 能看到 job 总量、yield 次数、每帧处理量

### 场景 B：混合几何状态

- 一部分改 `fill`
- 一部分改 `lineWidth / width / height`
- 非 `paint-only` 图元不得进入 deferred
- `deferredIneligibleByReason` 必须可见

### 场景 C：shared refresh 高峰

- 外层 Group shared definitions 变化
- active descendants 很多
- 能看到 queued / flushed / renderScheduled / shared refresh cost
- 不默认接入 deferred

### 场景 D：连续交互覆盖旧意图

- 还没提交完的 job 遇到新一轮状态意图
- 最后一次意图胜出
- 旧 pending intent 不迟到提交

### 场景 E：同状态意图但不同 owner/config

- `targetStates` 相同
- 生效 deferred config 来源不同
- 不得合并成同一 job

---

## 实现边界

以下事情你可以做：

- 改 `stage.ts`、`layer.ts`、`group.ts`、`graphic.ts`
- 改 `performance-raf.ts`
- 新增 perf monitor / batch scheduler 辅助文件
- 新增 Phase 4 专项测试

以下事情这次不要做：

- 把 deferred 扩到 geometry / bounds / pick / layout
- 把 shared refresh 默认接入 deferred
- 做跨图元 resolver 输出缓存
- 重开 Phase 2 / Phase 3 主模型
- 处理 `Glyph ownership` 的最终实现

---

## 提交前必须确认

在你准备提交实现前，请确保以下问题都有明确答案：

1. `deferredIneligibleByReason` 是否真的可见？
2. `cost` 是否足够分辨 resolver / patch / shared refresh / batch slice？
3. deferred 资格是否仍严格等于 `paint-only`？
4. job identity 是否真的绑定 owner/config，而不是只看 `targetStates`？
5. 同图元最后一次意图胜出是否由调度侧真值承接？
6. committed snapshot 是否仍保持 per-graphic 原子切换？
7. shared refresh 是否仍只做观测，没有被偷偷接成 deferred？
8. resolver cache 是否仍然没有跨图元共享？

---

## 何时必须先停下来反馈

如果遇到以下任一情况，不要自行降级，先反馈：

1. deferred 无法严格限制在 `paint-only`
2. identity 如果不绑定 owner/config 就无法解释区域级策略
3. 不引入 `pendingIntentByGraphic` 就无法保证最后一次意图胜出
4. shared refresh 必须接入 deferred 才能成立
5. 想要有效 telemetry 必须回到 render / pick / bounds 热路径
6. resolver cache 如果不跨图元共享就无法工作

---

## 验证要求

最低要求：

1. `rush compile -t @visactor/vrender-core`
2. Phase 4 专项测试通过
3. 新增专项测试至少覆盖：
   - snapshot / reason breakdown / cost
   - deferred eligibility
   - single-intent job / coalesce / cancel
   - owner/config identity
   - committed snapshot
   - shared refresh observability

---

**执行原则**：Phase 4 第一版先把“观测 + strict paint-only deferred”做对，不追求把所有大规模状态切换都塞进同一个调度器。  
**如果实现过程中发现 job identity 无法稳定绑定 owner/config，请先提出，不要偷偷放宽 job 合并规则。**
