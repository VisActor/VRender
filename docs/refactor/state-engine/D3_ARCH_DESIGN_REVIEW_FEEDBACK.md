# D3 架构设计修订意见

面向文档：

- `/Users/bytedance/Documents/GitHub/VRender2/D3_ARCH_DESIGN.md`
- `/Users/bytedance/Documents/GitHub/VRender-develop/graphic-state-animation-refactor-expectation.md`

本文档用于给架构评审会提供可执行的修订意见。结论先行：

- 当前 `D3_ARCH_DESIGN.md` 的总体方向与重构期望基本一致。
- 但仍存在若干原则性偏差，其中前 3 项会直接破坏本次重构最关注的两个目标：
  - 纯视觉状态切换的性能快路径
  - 最终属性与状态真值的一致性
- 建议先完成这些修订，再进入实现分解。

## 必须修改

### 1. 纯视觉快路径被破坏，状态提交没有做到按 delta 精确分类

当前设计中，`_syncAttribute()` 无条件触发 `addUpdateBoundTag()`：

- `D3_ARCH_DESIGN.md:353`
- `D3_ARCH_DESIGN.md:364`

同时 `submitUpdate()` 中把 `paint` 与 `bounds` 归入同一路径：

- `D3_ARCH_DESIGN.md:581`
- `D3_ARCH_DESIGN.md:585`

这会导致纯视觉状态切换仍然触发 bounds 更新路径，与期望文档中的以下约束冲突：

- `graphic-state-animation-refactor-expectation.md:435`
- `graphic-state-animation-refactor-expectation.md:459`

建议修订为：

- 将“最终属性同步”和“更新提交通知”拆开，不要在 `_syncAttribute()` 内无条件打 bounds tag。
- 状态提交必须基于真实 delta 和影响分类精确提交。
- `paint-only` 状态切换只能进入视觉快路径，不能默认抬升到 bounds 路径。
- 只有当 patch 真实触及 `shape / bounds / transform / layout` 相关 key 时，才进入对应慢路径。

这是必须先修正的点，否则“支持几何状态但不拖慢默认路径”这一核心目标无法成立。

### 2. `attribute` 同步方案不能正确表达最终属性视图，存在残留 key 风险

当前 `_syncAttribute()` 的逻辑是：

- 先覆盖 `baseAttributes`
- 再覆盖 `resolvedStatePatch`
- 不清理已经从 patch 中消失的 key

对应位置：

- `D3_ARCH_DESIGN.md:353`
- `D3_ARCH_DESIGN.md:360`

`clearStates()` 也只是将 `_resolvedPatch` 置空：

- `D3_ARCH_DESIGN.md:533`
- `D3_ARCH_DESIGN.md:536`

这会带来直接的语义问题：

- 当某状态移除后，之前由状态写入的属性可能残留在 `attribute` 上
- `clearStates()` 后 `attribute` 不一定真正回落到 `baseAttributes`
- `attribute` 不再等价于“当前最终生效属性视图”

而期望文档对此的约束是明确的：

- `graphic-state-animation-refactor-expectation.md:313`
- `graphic-state-animation-refactor-expectation.md:323`

建议修订为：

- 明确定义“最终属性视图”的刷新语义，不能只做覆盖式写入。
- 如果继续保留稳定对象身份，就必须在同步时处理 patch 消失 key 的回退问题。
- `clearStates()` 后应保证 `attribute` 与当前 `baseAttributes` 一致，而不是仅清空 `_resolvedPatch`。
- 文档层需要明确“最终属性视图正确性”优先于“仅保留对象身份稳定”。

如果这一点不修正，状态系统的真值模型会被旧值污染，后续动画、pick、render 都会受到影响。

### 3. 状态过渡动画的目标不应定义为 `resolvedStatePatch`

当前设计把状态动画目标写成：

- `D3_ARCH_DESIGN.md:315`
- `D3_ARCH_DESIGN.md:316`

即“目标 = `resolvedStatePatch`”。

这个定义与我们前面确认的语义不一致。问题在于：

- 状态过渡动画服务的是“静态状态真值变化”
- 它的目标应该是新的最终结果，而不是单独的 patch
- 当状态移除、视觉回落到 `baseAttributes` 时，空 patch 并不能表达完整目标值

对应期望约束：

- `graphic-state-animation-refactor-expectation.md:496`
- `graphic-state-animation-refactor-expectation.md:510`

建议修订为：

- 将状态过渡动画目标定义为“新的 final result”。
- 动画系统可以内部利用 patch 信息做优化，但语义层不能把 patch 当成最终目标。
- 当状态再次变化时，状态过渡动画的目标应跟随新的 final result 更新、重启或中断。

如果这一点不修正，状态撤销、状态链式切换、自驱动画结束后的控制权回收都会出现解释不一致。

## 建议修改

### 4. 不建议把实例级同名状态定义重新纳入核心路径

当前编译流程把状态来源定义为：

- `Group → Theme → 实例`
- `实例 > Group > Theme`

对应位置：

- `D3_ARCH_DESIGN.md:617`
- `D3_ARCH_DESIGN.md:618`
- `D3_ARCH_DESIGN.md:655`

这与期望文档中“共享定义优先，实例级局部差异走 resolver”的方向不一致：

- `graphic-state-animation-refactor-expectation.md:223`
- `graphic-state-animation-refactor-expectation.md:249`

建议修订为：

- 将实例级同名状态覆写从核心路径中移出。
- 核心路径只保留共享状态定义编译与实例消费。
- 少量实例差异通过 `state resolver` 处理。

这样能明显降低状态来源层次、调试复杂度与共享定义失效成本。

### 5. 状态集合需要先归一化和去重，再进入排序与冲突裁决

当前 `_applyStateInternal()` 中直接把旧状态与新状态拼接后排序：

- `D3_ARCH_DESIGN.md:469`
- `D3_ARCH_DESIGN.md:471`

但没有看到明确的去重步骤。这与我们确认过的“状态集合语义”不一致：

- `graphic-state-animation-refactor-expectation.md:142`
- `graphic-state-animation-refactor-expectation.md:165`

建议修订为：

- 所有状态 API 最终都先落到“集合编辑”。
- 在进入排序、`exclude/suppress` 裁决前先完成归一化和去重。
- `activeStates` 与 `effectiveStates` 对外都应表现为稳定有序集合，而不是可能含重复项的数组。

这一点虽然实现成本不高，但必须在架构层说清楚，否则后续 patch 重复应用和冲突裁决歧义都会出现。

### 6. `attribute` 的工程折中需要在文档中明说，而不是默认视为已对齐

当前文档明确选择：

- 保留 `attribute` 的稳定可变对象身份
- 不将其做成只读/受控视图

对应位置：

- `D3_ARCH_DESIGN.md:329`
- `D3_ARCH_DESIGN.md:419`
- `D3_ARCH_DESIGN.md:440`

这与期望文档里的“只读读取入口”仍有差距：

- `graphic-state-animation-refactor-expectation.md:323`

我不认为这一定是错误，但它是一个需要显式承认的工程折中。建议：

- 在架构文档中单独写明这是兼容现有动画与 transform 路径的工程取舍。
- 同时写明：`attribute` 仍表示最终属性，但直接写入不是保障路径。
- 避免在后续评审中把这个点误判为“已经完全满足只读视图目标”。

### 7. 文档中的伪代码需要再收敛，避免影响评审可信度

目前至少有几处伪代码层面的明显问题：

- `setAttributes()` 中 `_syncAttribute()` 被调用了两次：
  - `D3_ARCH_DESIGN.md:405`
  - `D3_ARCH_DESIGN.md:409`
- `resolved == null` 是上文合法分支，但后面仍然直接 `Object.keys(resolved)`：
  - `D3_ARCH_DESIGN.md:397`
  - `D3_ARCH_DESIGN.md:412`
- 分帧调度示意代码里，时间窗口变量没有在 `await raf.wait()` 后重置，示意逻辑不完整：
  - `D3_ARCH_DESIGN.md:837`

这些不一定是最终实现问题，但会降低文档评审时的说服力。建议在下轮版本中统一修正。

## 建议给架构评审会的结论

建议在评审会上先把以下判断达成一致，再进入实现分工：

1. 当前方案方向正确，但还不能直接进入实现细化。
2. 前 3 项属于原则性修订，必须先改。
3. 第 4、5 项属于模型收敛问题，建议一并修正，避免实现期继续发散。
4. 第 6、7 项属于文档清晰度与工程折中表达问题，应在评审版中补足。

如果要进一步压缩成一句话发给架构师，可以用：

> 方案主方向对齐，但纯视觉快路径、最终属性真值、状态动画目标这三处仍有原则性偏差，建议先修正后再进入实现拆分；实例级状态定义和集合归一化也建议同步收敛。

## 本次评审最关注的点

请架构师和开发在后续讨论中优先围绕以下内容做判断：

- 性能
  - 纯视觉状态切换是否仍然保有快路径
  - 批量状态切换是否避免无意义的 bounds/layout 开销
- 稳定性
  - `attribute` 是否始终能表达正确的最终属性视图
  - 状态切换、状态撤销、动画结束后控制权是否一致
- 可维护性
  - 状态来源是否足够收敛
  - `activeStates/effectiveStates` 语义是否稳定可推理
- 可调试性
  - 状态为什么生效、为什么被压制、最终属性为何如此，是否可以直接解释

这几项是本次重构的重点关注内容，不建议在后续实现中为了局部兼容或局部便利而退化。
