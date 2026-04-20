# D3 Memory Benchmark 性能问题上下文

> **文档类型**：性能问题上下文留档
> **用途**：记录 `memory.ts` benchmark 在 D3 重构后与 `develop` 分支的性能差异、已完成归因、以及后续优化任务的边界
> **当前状态**：`P1 accepted`，`P2 approved to start`
> **重要说明**：本文件不是新的规范源；它只承接 `memory.ts` benchmark 的问题背景、当前 accepted 边界与后续 gate，不重开实现方案或 Phase 1-4 主设计

---

## 1. 问题摘要

`memory` 页面是一个极端的构造压力页。

当前页面逻辑：

1. 点击 `run 100 / 1000 / 10000`
2. 每次 `run()` 都会创建 `10000` 个 `rect`
3. 当前页面已调整为：
   - 页面级单例 app
   - 每次 `run()` 仅重建 stage
   - 不再每次重建整个 app

即使在这个前提下，当前重构分支与 `develop` 分支相比，仍存在显著性能差距。

---

## 2. 结论

当前重构分支比 `develop` 仍慢，主要原因已经**不再是 app/stage 重建策略**，而是：

> 单个 `Graphic` 实例在 D3 重构后变重了，导致 `memory.ts` 这种“100 次 * 每次 10000 个 rect”的极端构造场景里，纯 JS 分配和 GC 压力明显上升。

这意味着：

1. 第一阶段问题
   - “每次 run 都重建 app + stage”
   - 已经通过复用单 app 收口一截
2. 第二阶段问题
   - 单个 `Graphic` 的固定构造成本增加
   - 当前仍然是剩余主要差距

---

## 3. 证据

### 3.1 Trace 对比

用于对比的 trace：

- 当前分支：
  - `/Users/bytedance/Downloads/Trace-20260416T121405.json`
- `develop` 分支：
  - `/Users/bytedance/Downloads/Trace-20260416T120626.json`

对比结果：

1. 当前分支
   - 最大主线程长任务约 `795.9ms`
   - 热点仍然直接落在 `memory.ts`
2. `develop`
   - 最大主线程长任务约 `348.9ms`
   - 热点同样直接落在 `memory.ts`

这说明：

1. 即使已经改成“复用单 app，只重建 stage”
2. 主差距仍然发生在 `memory.ts` 的同步对象创建阶段
3. 不再主要是 app bootstrap / release

### 3.2 GC 压力差异

同样两份 trace 中，GC 事件规模差异明显：

1. 当前分支
   - `V8.GC_MC_BACKGROUND_MARKING` 单次约 `60~61ms`
2. `develop`
   - 同类事件约 `9~10ms`

这说明：

1. 当前分支在同样 workload 下，对象分配量明显更大
2. 性能差距不是“某个函数慢一点”
3. 而是整批对象更重、GC 更频繁

### 3.3 页面逻辑已与 `develop` 对齐到可比口径

旧的差异曾经包括：

1. 当前分支每次 `run()` 会重建 app + stage
2. `develop` 通过 legacy `createStage()` 复用单例 browser app

这部分已经被收口：

1. 当前页面现在复用单 app
2. 每次 `run()` 只重建 stage

因此当前剩余差距，已经更纯粹地落在 **per-graphic 构造成本**。

---

## 4. 静态代码差异与当前 `P0 / P1` 状态

`develop` 的 `packages/vrender-core/src/graphic/graphic.ts` 构造函数核心是：

- `this.attribute = params`

`P0` 落地前，当前分支的同一路径曾经变成：

- `const initialAttributes = cloneAttributeValue(params)`
- `this.attribute = initialAttributes`
- `this.baseAttributes = cloneAttributeValue(initialAttributes)`

并且每个 `Graphic` 实例还会额外初始化：

- `stateStyleResolver`
- `deepStateStyleResolver`
- `stateTransitionOrchestrator`

这些都是每个 graphic 实例一份。

当前 `P0 accepted` 后，构造路径已经收紧为：

1. `baseAttributes` 保留一次 deep clone，继续作为静态真值
2. `attribute` 使用基于 `baseAttributes` 的轻量 surface clone
3. `stateStyleResolver / deepStateStyleResolver / stateTransitionOrchestrator` 改为按需创建，不再在构造期 eager 初始化

当前边界只承诺：

1. 顶层 `graphic.attribute.xxx = ...` 兼容成立

当前不承诺：

1. 任意深层嵌套对象原地 mutation 都完全隔离

当前 `P1 accepted` 后，在不扩大主架构边界的前提下，构造路径进一步增加了一个受控的 `simple attrs fast path`：

1. 仅当输入 attrs 是普通对象，且所有顶层自有值都不是 plain object 时才启用
2. fast path 仍然保持：
   - `baseAttributes` 与 `attribute` 分离
   - 顶层 `graphic.attribute.xxx = ...` 兼容
3. 任一顶层 plain object 值都会立即回退到当前保守路径
4. 当前不把这条 fast path 外推成更强的深层 nested mutation 契约

---

## 5. 为什么这会被 memory benchmark 放大

`memory.ts` 的 `run 100` 相当于创建：

- `100 * 10000 = 1,000,000` 个 `rect`

在这个量级下，当前分支相较 `develop` 多出来的是：

1. 每个 graphic 至少多一次深拷贝
2. 每个 graphic 多一份 `baseAttributes`
3. 每个 graphic 多 3 个状态相关对象

因此这页的剩余差距，本质上是：

> D3 真值模型和状态框架带来的每图元固定成本上升，在极端“百万级对象构造”场景下被放大了。

---

## 6. 这不意味着什么

这个问题**不等于**：

1. 正常业务图表页一定慢一倍
2. 某个单独 renderer 回归
3. `performance-raf` 单点导致全部卡顿

更准确地说：

1. 这是一个极端 benchmark
2. 它主要衡量的是 **每个 Graphic 的固定构造成本**
3. 对真实上层图表场景，它是一个重要信号，但不能直接等价为“所有图表页都会同等退化”

---

## 7. 当前 accepted 边界与后续 scope

当前 `P1 accepted` 的正式边界是：

1. 只做构造期固定成本优化
2. 只做状态相关对象初始化成本优化
3. 在 `P0` 的基础上，只增加一个单目标 `simple attrs fast path`
4. 不回滚 D3 主架构
5. 不改 renderer / raf / deferred 主链
6. 不改 shared-state 主链
7. 不进入对象池、更深层 truth-model 表示优化或全仓性能优化

后续如果要再讨论专项优化，方向仍应聚焦：

1. `Graphic` 构造期固定分配
   - `attribute/baseAttributes`
   - 深拷贝/对象分配
2. 状态相关对象的创建时机与实例成本
   - `stateStyleResolver`
   - `deepStateStyleResolver`
   - `stateTransitionOrchestrator`

但这些只属于后续候选方向；当前已批准开启 `P2`，但 `P2` 仍必须维持单目标、低风险、可测量边界。

---

## 8. 当前 measurement gate

当前专项 measurement gate 已收紧为：

1. `run 100` no-trace
   - 当前官方 gate
   - 用于 before / after 对比与当前 accepted 优化的有效性判断
2. `run 100` trace
   - 补充证据
   - 用于辅助观察主线程长任务和 GC 压力变化
3. `run 1000`
   - 仅作为补充观察项
   - 当前不作为进入 `P2` 的正式门槛

---

## 9. 为什么当前可以开启 `P2`

当前可以开启 `P2`，不是因为“还没追平 develop”，而是因为已经有明确业务价值锚点：

1. `memory.ts` 仍然揭示了高数量场景中的 per-graphic fixed cost 问题。
2. VRender 还承载 **VTable** 这类真实业务场景，而 VTable 的典型路径是：
   - 大量 `text`
   - 每个单元格的自定义图元
   - 透传到 VRender 的 `text stateProxy`
3. 这说明当前剩余问题不只是 benchmark 数字，而是对“高数量、低状态、基础属性为主”的真实业务路径有潜在意义。

因此，当前 `P2` 的开启条件已经转化为：

1. 仍只允许在构造期固定成本路径内优化
2. 仍不触碰 renderer / raf / deferred / shared-state 主链
3. 除 `memory.ts` 外，必须补一条 VTable-lite 业务验证口径
4. `P2` 仍然必须是单目标、可测量、低风险的专项，而不是全仓性能优化

不建议把当前 `P2` 的开启直接解读成：

1. D3 主架构需要回滚
2. `legacy removal` 结论失效
3. 当前应该无限制继续扩大性能专项

---

## 10. 当前状态

当前状态应理解为：

1. 问题已确认
2. 根因已从“app/stage 重建策略”进一步收敛到“per-graphic 固定成本”
3. `P0` 已经落地并被接受
4. `P1` 已经落地并被接受
5. 当前官方 measurement gate 已固定为 `run 100`
6. `run 1000` 已降格为补充观察项
7. 当前 `P2` 已批准启动
