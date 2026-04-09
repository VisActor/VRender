# D3 交付前加固方案

> **文档类型**：交付前验证与加固方案
> **用途**：在 D3 主线已完成并关闭后，收敛“交给上层图表库前还必须补哪些验证”
> **当前状态**：待执行
> **重要说明**：本文件不是新的架构设计文档，也不是新的规范源；规范仍以 `graphic-state-animation-refactor-expectation.md`、`D3_ARCH_DESIGN.md` 及各 Phase 主文档为准

---

## 1. Current assessment

当前仓库已经具备上层接入基础，但还没有达到“可以无额外加固直接 handoff 给上层图表库”的状态。

### 1.1 已经基本收口的部分

以下链路当前已经具备较强基础，足以作为上层接入的内核前提：

1. 静态真值模型与状态裁决主路径
   - `baseAttributes + resolvedStatePatch -> attribute`
   - 状态恢复不再依赖旧 `normalAttrs / finalAttribute / onStop(props)` 主路径
2. shared-state 主路径
   - `Theme -> stage.rootSharedStateScope -> Group scopes -> Graphic`
   - ownership / refresh / fallback / resolver cache 边界已经闭环
3. Phase 4 strict `paint-only` deferred
   - `single-intent job`
   - `pendingIntentByGraphic`
   - `contextOwnerId + configFingerprint + targetStatesKey`
   - per-graphic committed snapshot

这些部分说明 D3 主模型已经收口，不需要在 handoff 前重开架构讨论。

### 1.2 当前明显偏弱的部分

当前最明显的验证薄弱点是**动画能力的真实属性级测试**，而不是状态主链本身。

现有测试已经覆盖了很多：

1. 状态切换 payload / config / 委托路径
2. shared-state refresh / fallback / deferred / identity 主路径
3. 动画结束恢复契约的 helper 级测试

但仍然缺少：

1. 真实时间推进下，`graphic.attribute` 的连续变化断言
2. 动画进行中的树操作边界断言
3. 状态动画与自驱动画在同一属性上的真实冲突边界断言

### 1.3 当前已确认的 handoff 前红灯

除动画补测外，当前还有两项已经实跑确认的上层红灯，必须进入 `P0`：

1. `packages/vrender rushx test` 当前失败
   - 主要失败集中在 `packages/vrender/__tests__/graphic/graphic-state.test.ts`
   - 根因更偏“上层测试语义滞后”：仍在断言旧的 `normalAttrs` 语义和旧状态恢复外观，没有对齐 D3 Phase 2/3 之后的新真值模型
2. `packages/react-vrender rushx test` 当前失败
   - 至少包含两类问题：
     - `packages/react-vrender/src/Stage.tsx` 的类型适配问题
     - `packages/react-vrender/__tests__/unit/hostConfig.test.ts` 的异步更新 / 卸载清理不完整，导致 `document` 生命周期错误
   - 根因更偏“绑定层适配 + 测试生命周期收口”

这两项不是推测风险，而是当前已确认的真实失败，因此必须作为 handoff 前门槛处理。

---

## 2. Animation testing gap

### 2.1 当前动画测试现状

当前 `vrender-core` / `vrender-animate` 中的动画相关测试，主要分为三类：

1. 接口 / 委托 / payload 测试
   - 例如状态动画 payload 是否正确、是否调用 `applyAnimationState`、是否调用 manager/executor
2. ticker / timeline 机制测试
   - 例如 `tick(delta)` 是否驱动 `advance(delta)`、`ManualTicker` 是否推进时间
3. 恢复契约 / close-out helper 测试
   - 例如动画结束后是否走 `_restoreAttributeFromStaticTruth()`，是否禁止 `finalAttribute -> setAttributes`

这些测试对当前 D3 主线有价值，但它们大多不是**真实属性级行为测试**。

### 2.2 为什么当前还不够

当前不足主要在 3 个层面：

1. 没有充分证明真实 ticker 推进下，图元属性会按预期变化
   - 现有很多测试只验证 callback、payload 或 mock 委托
   - 没有把 `t=0 / t=mid / t=end` 的 `graphic.attribute` 作为主断言对象
2. 没有充分证明动画结束后不会污染静态真值
   - helper 层 contract 已测到
   - 但“真实动画跑完后是否仍不污染 `baseAttributes`”的完整链路还偏弱
3. 没有充分覆盖状态动画与自驱动画的边界
   - 这类冲突在上层图表库里非常常见
   - 如果只测 manager delegation / callback，很容易漏掉“旧动画结果迟到写回”或“状态已变但属性未恢复”的问题

### 2.3 应如何补齐

本轮应统一采用 `ManualTicker` 或自定义 deterministic ticker 来补测，目标不是再测一遍接口，而是测**真实属性变化**。

最低要求如下：

1. 状态动画属性级测试
   - 在 `t=0 / t=mid / t=end` 断言 `graphic.attribute`
   - 结束后断言 `baseAttributes` 未被污染
2. 自驱动画属性级测试
   - 覆盖 `animate.to(...) / from(...)`
   - 断言中间插值、结束恢复与静态真值边界
3. 两类冲突边界都必须覆盖
   - 状态动画进行中再次切状态
   - 自驱动画作用于同一属性时遇到状态切换
4. 动画生命周期与树操作边界也必须补到
   - 动画进行中 `removeChild / removeAllChild` 不崩
   - `detach / reparent / setStage(null)` 后 timeline、恢复语义、属性结果正确
   - 不出现旧动画结果迟到写回

---

## 3. Pre-handoff checklist

### P0 必做

1. 基于 `ManualTicker` 或自定义 deterministic ticker，补状态动画属性级测试  
   目标：真实验证 `useStates(..., true)` 在 `t=0 / t=mid / t=end` 的属性变化，以及动画结束后不污染 `baseAttributes`。

2. 基于 `ManualTicker` 或自定义 deterministic ticker，补自驱动画属性级测试  
   目标：真实验证 `animate.to(...) / from(...)` 的中间插值、结束恢复和静态真值边界。

3. 补两类动画冲突边界测试，而且两类都必须覆盖  
   目标：
   - 状态动画进行中再次切状态
   - 自驱动画作用于同一属性时遇到状态切换  
   两类都必须以真实属性级断言收口，不能只测 callback 或 manager delegation。

4. 补动画生命周期与树操作边界测试  
   目标：
   - 动画进行中 `removeChild / removeAllChild` 不崩
   - `detach / reparent / setStage(null)` 后 timeline / 恢复语义 / 属性结果正确
   - 不出现旧动画结果迟到写回

5. 修复并对齐 `packages/vrender rushx test`  
   目标：
   - 把 `vrender` 的状态相关测试对齐到 D3 当前语义
   - 清理对旧 `normalAttrs` / 旧状态恢复外观的陈旧断言
   - 使 `packages/vrender rushx test` 成为可通过的正式 handoff 门槛

6. 修复并对齐 `packages/react-vrender rushx test`  
   目标：
   - 完成 React 绑定层对新架构 / 新生命周期的适配收口
   - 至少处理 `Stage.tsx` 的类型适配问题
   - 至少处理 `hostConfig.test.ts` 的异步更新 / 卸载清理问题
   - 使 `packages/react-vrender rushx test` 成为可通过的正式 handoff 门槛

7. 执行并通过交付前 release gate  
   目标：以下门槛全部通过后，才允许 handoff 给上层图表库：

   - `rush compile -t @visactor/vrender-core`
     - 通过标准：编译通过
     - 是否阻塞 handoff：是
   - `packages/vrender-core rushx test`
     - 通过标准：全量通过
     - 是否阻塞 handoff：是
   - `packages/vrender-animate rushx test`
     - 通过标准：全量通过
     - 是否阻塞 handoff：是
   - `packages/vrender rushx test`
     - 通过标准：全量通过，并完成状态相关旧语义断言收口
     - 是否阻塞 handoff：是
   - `packages/react-vrender rushx test`
     - 通过标准：全量通过，并完成 React 绑定层类型与生命周期适配收口
     - 是否阻塞 handoff：是
   - 新增的 `ManualTicker / 动画属性级专项测试`
     - 通过标准：覆盖状态动画、自驱动画、两类冲突边界、树操作边界且全部通过
     - 是否阻塞 handoff：是
   - 受影响上层包 compile
     - 目标包：`packages/vrender`、`packages/vrender-kits`、`packages/vrender-components`
     - 通过标准：编译通过
     - 是否阻塞 handoff：是

### P1 强烈建议

1. 补一页给上层库的最小升级 / 接入说明  
   目标：明确直接改 `graphic.attribute.xxx` 不再可靠、动画结束不隐式 end-commit、`graphic.states` 在 shared-state 下仅是 missing-state fallback、deferred 仅对显式启用的 strict `paint-only` batch 生效。

2. 补一个 chart-like 集成 smoke  
   目标：用更接近上层真实使用方式的批量 `hover / selected / clear` 场景验证 shared-state、动画、deferred 同时存在时的语义一致性。

### P2 后续项

1. `graphic.states` missing-state fallback 告警策略  
   目标：后续再决定 dev-only warning、deprecated 提示或其他兼容策略；本轮不回升为 blocker。

2. `Glyph ownership` 文档拆分方式  
   目标：后续再决定是单独文档还是并入维护章节；本轮不回升为 blocker。

3. 更复杂的动画竞争与性能联合基准  
   目标：后续再扩多动画叠加、可视回归、性能/动画联合基准；不作为当前 handoff 前的最小门槛。

---

## 4. Non-goals

这轮明确不做以下事情：

1. 不重开 Phase 1-4 的主设计讨论。
2. 不新增新的大阶段文档，也不引入所谓“Phase 5”。
3. 不把既有 follow-up 项重新升级为当前 blocker。
4. 不把这轮任务扩成新的 shared-state / deferred / animation 架构迭代。
5. 只聚焦“在当前仓库内，把交付给上层图表库前必须补齐的验证做完”。
