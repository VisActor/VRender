# D3 交付前加固结果

> **文档类型**：交付前加固结果记录
> **用途**：记录本轮 handoff 前 P0 补测、运行时修复、上层测试收口与 release gate 结果
> **当前状态**：历史结果已留档；legacy removal 现已完成，当前总体 handoff 状态已恢复为 `handoff ready`
> **执行基线**：`D3_PRE_HANDOFF_HARDENING.md`

---

## 1. 本轮目标

本轮不是新的 Phase，也不重开 D3 主设计。

唯一目标是：在 D3 Phase 1-4 已完成并关闭的前提下，把当前仓库在交给上层图表库前仍缺失的验证和已知红灯收口到可 handoff 状态。

补充说明：

1. 本文记录的是 **pre-handoff hardening 这条子任务本身** 的完成情况。
2. 它曾经支撑过一轮 `handoff ready` 结论。
3. 后续 `legacy path removal` 曾把 handoff 门槛进一步收紧；目前 `P0 / P1 / P2` 已全部完成，因此当前总体状态也已恢复为 `handoff ready`，结论以 [D3_LEGACY_PATH_REMOVAL_STATUS.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_LEGACY_PATH_REMOVAL_STATUS.md) 为准。

本轮明确不做：

1. 不重开 Phase 1-4 的 ownership / precedence / refresh / fallback / resolver / `stateProxy` 设计讨论。
2. 不把 `graphic.states` 告警策略和 `Glyph ownership` 重新升级为 blocker。
3. 不把这轮工作扩成新的架构阶段。

---

## 2. 本轮完成内容

### 2.1 动画属性级专项补测

已新增：

- `packages/vrender-animate/__tests__/unit/animation-runtime-attribute.test.ts`

测试基于 `ManualTicker`，覆盖了真实属性级断言，而不是只验证 callback / payload / delegation：

1. 状态动画 `t=0 / t=mid / t=end` 的 `graphic.attribute`
2. 动画结束后 `baseAttributes` 不被污染
3. `animate.to(...)`
4. `animate.from(...)`
5. 状态动画进行中再次切状态
6. 自驱动画作用于同一属性时遇到状态切换
7. `removeChild / removeAllChild`
8. `setStage(null)`
9. `reparent`

### 2.2 动画运行时收口

为通过真实属性级测试并满足 handoff gate，本轮收口了以下运行时问题：

1. `Step.onEnd()` 不再把 step props 反写入 base
2. `Animate.advance()` 自然结束时立即走 `restoreStaticAttribute()`
3. `Animate.from()` 改接 `FromTo`
4. `FromTo` 的起始帧写入改为 transient path，避免污染 `baseAttributes`
5. `Graphic.setStage()` 对 stage-bound animations 的 `detach / rebind` 逻辑完成收口，避免旧 timeline 迟到写回

相关文件：

- `packages/vrender-animate/src/step.ts`
- `packages/vrender-animate/src/animate.ts`
- `packages/vrender-animate/src/custom/fromTo.ts`
- `packages/vrender-core/src/graphic/graphic.ts`

### 2.3 `packages/vrender` 测试语义收口

已修复：

- `packages/vrender/__tests__/graphic/graphic-state.test.ts`

收口方向：

1. 把旧 `normalAttrs` snapshot / restore / null 外观断言改为 D3 新真值模型断言
2. `normalAttrs` 仅再作为 `baseAttributes` 的 deprecated alias 检查
3. 让 `packages/vrender rushx test` 成为可通过的正式 handoff 门槛

### 2.4 `packages/react-vrender` 绑定层适配

已修复：

- `packages/react-vrender/src/Stage.tsx`
- `packages/react-vrender/__tests__/unit/Stage.test.tsx`
- `packages/react-vrender/__tests__/unit/hostConfig.test.ts`

收口内容：

1. `createStage()` 返回值与 object-ref 赋值的类型适配
2. 卸载时显式 `release`
3. `hostConfig.test.ts` 改成同步可收敛的 reconciler mock，消除测试结束后的异步 document 生命周期错误
4. 额外补跑 `packages/react-vrender rushx compile`，确认不是只在 Jest mock 下成立

---

## 3. release gate 结果

`D3_PRE_HANDOFF_HARDENING.md` 定义的 release gate 已全部通过：

1. `rush compile -t @visactor/vrender-core`：通过
2. `packages/vrender-core rushx test`：`94/94` suites，`478/478` tests
3. `packages/vrender-animate rushx test`：`8/8` suites，`30/30` tests
4. `packages/vrender rushx test`：`14/14` suites，`48/48` tests，`2 skipped`
5. `packages/react-vrender rushx test`：`6/6` suites，`16/16` tests
6. 新增 `ManualTicker` 动画属性级专项测试：已纳入并通过
7. 受影响上层包 compile：
   - `packages/vrender rushx compile`：通过
   - `packages/vrender-kits rushx compile`：通过
   - `packages/vrender-components rushx compile`：通过

额外验证：

8. `packages/react-vrender rushx compile`：通过

非阻塞说明：

- `ts-jest sourceMap: false` warning 仍存在，但这是仓库既有 warning，不构成本轮 blocker。

---

## 4. 受影响文件

代码与测试：

- `packages/vrender-animate/__tests__/unit/animation-runtime-attribute.test.ts`
- `packages/vrender-animate/src/step.ts`
- `packages/vrender-animate/src/animate.ts`
- `packages/vrender-animate/src/custom/fromTo.ts`
- `packages/vrender-core/src/graphic/graphic.ts`
- `packages/vrender/__tests__/graphic/graphic-state.test.ts`
- `packages/react-vrender/src/Stage.tsx`
- `packages/react-vrender/__tests__/unit/Stage.test.tsx`
- `packages/react-vrender/__tests__/unit/hostConfig.test.ts`

留档：

- `docs/refactor/state-engine/D3_PHASE4_IMPLEMENTATION_LOG.md`
- `docs/refactor/state-engine/D3_PRE_HANDOFF_HARDENING_SUMMARY.md`

---

## 5. 与主设计的关系

本轮没有重开 D3 主设计。

结论是：

1. 本轮修复的都是 D3 已有契约下的验证缺口或实现缺口
2. 没有新增 Phase 5，也没有改写已关闭的 Phase 1-4 主边界
3. `graphic.states` missing-state fallback 告警策略、`Glyph ownership` 文档拆分方式继续保留为非阻塞后续项

---

## 6. 留档位置

这轮 hardening 的过程与最终 gate 结论，已经回填到：

- `docs/refactor/state-engine/D3_PHASE4_IMPLEMENTATION_LOG.md`

关键条目：

1. `2026-04-09 23:42 — Pre-handoff hardening / 动画属性级补测与上层红灯收口（阶段性）`
2. `2026-04-09 23:58 — Pre-handoff hardening / release gate 全通过，进入 handoff ready`
3. `2026-04-10 11:09 — Legacy path removal / P1 局部迁移推进，P0 runtime installer blocker 确认`

---

## 7. 当前结论

需要区分“本轮 hardening 子任务结论”和“当前总体 handoff 结论”。

### 7.1 本轮 hardening 子任务结论

本轮 `pre-handoff hardening` 本身已经完成，并且其定义的 release gate 当时全部通过。

### 7.2 当前总体 handoff 结论

当前可以恢复宣称：

- `handoff ready`

原因是：

1. `legacy path removal` 曾被纳入更严格的 handoff 门槛
2. 其 `P0 / P1 / P2` 现已全部完成
3. 因此当前总体结论以下列文档为准：
   - [D3_LEGACY_PATH_REMOVAL_STATUS.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_LEGACY_PATH_REMOVAL_STATUS.md)

简化表述：

1. **hardening 子任务：已完成**
2. **当前总体 handoff：已恢复为 `handoff ready`**
