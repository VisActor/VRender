# D3 Legacy Removal Node Runtime / Smoke Harness Alignment 执行 Prompt

> **文档类型**：开发者执行 Prompt
> **用途**：指导实现 agent 单独处理 `stage-graphic.test.ts` 的 app-scoped node runtime / smoke harness 对齐问题
> **当前状态**：待执行
> **重要说明**：本文件只承接已接受的方案 A，不重开 D3 主设计，不扩大当前 `P1 caller cleanup`，也不推进 `P2`

---

你现在负责执行 D3 `legacy removal` 的一个独立专项：

> **node runtime / smoke harness alignment**

这轮任务的唯一目标是：

1. 为 `vrender-core` unit smoke 建立稳定的 app-scoped node runtime 路径
2. 在这条路径稳定后，处理 `packages/vrender-core/__tests__/unit/smoke/stage-graphic.test.ts`

注意：

1. 这不是新的 Phase。
2. 这不是继续扩大当前 `P1 internal caller cleanup`。
3. 这不是 `P2 hygiene cleanup`。
4. 当前已接受的边界是：`stage-graphic.test.ts` 已超出当前 `P1 caller cleanup`，必须单独处理。

你必须先读：

1. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_LEGACY_PATH_REMOVAL_PLAN.md`
2. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_LEGACY_PATH_REMOVAL_STATUS.md`
3. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_LEGACY_NODE_RUNTIME_SMOKE_ALIGNMENT.md`
4. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE4_IMPLEMENTATION_LOG.md`
5. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_ARCHIVE_INDEX.md`

本专项只做四件事：

## 1. 建立最小 app-scoped node smoke helper

要求：

1. helper 面向 `vrender-core` unit smoke 使用
2. helper 以 app-scoped runtime 为正式路径
3. helper 不得继续依赖 deprecated root `createStage()`
4. helper 必须避免 source Jest 环境混入 package alias/cjs 侧旧 runtime

## 2. 收口 node env / canvas / context stub 与 app-scoped runtime 的适配

要求：

1. 当前 fake window/context/canvas stub 必须满足 app-scoped node 渲染链的最小预期
2. 不允许用“换回 legacy path”来规避问题
3. 不允许靠 package/cjs runtime 绕过 source 环境差异而不解释一致性

## 3. 在 helper 稳定后处理 `stage-graphic.test.ts`

要求：

1. 只在 helper 路径稳定后再迁这条 test
2. 迁移后 test 仍需保持绿色
3. 不允许把 test 降级、跳过，或改成不再覆盖原有 smoke 语义

## 4. 回填结论与边界

要求：

1. 继续把过程回填到：
   `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE4_IMPLEMENTATION_LOG.md`
2. 若验证成功，明确记录：
   - 这条专项是否已完成
   - `stage-graphic.test.ts` 是否已从 deprecated root `createStage()` 迁出
   - 是否足以让 `P1` 正式收口到自然边界

本轮明确不做：

1. 不继续批量替换 repo 里其他 `createStage()` caller
2. 不继续扩大 browser page / smoke baseline 迁移
3. 不推进 `P2 hygiene cleanup`
4. 不重开 D3 Phase 1-4 主设计
5. 不修改 `legacy removal` 的 `P0 / P1 / P2` 验收边界

验证门槛：

1. `packages/vrender-core`
   - `rushx test -- --runInBand __tests__/unit/smoke/stage-graphic.test.ts --verbose`
2. `packages/vrender-core rushx compile`
3. 若 helper 触及相关安装链，补跑最小相关单测：
   - node env
   - runtime installer
   - 必要的 smoke sibling tests

通过标准：

1. `stage-graphic.test.ts` 在 app-scoped 路径下通过
2. helper 不再依赖 deprecated root `createStage()`
3. 不再通过 package alias/cjs 绕路“碰巧通过”
4. `packages/vrender-core rushx compile` 通过
5. 不引入新的 `vrender-core` runtime regression

何时必须停下来反馈：

1. 如果 source Jest 环境下无法建立稳定的 app-scoped node smoke helper
2. 如果必须修改 D3 已关闭的主架构边界才能让这条路径成立
3. 如果 fake node window/context/canvas stub 与正式 node runtime 预期差距过大，已经不适合作为 smoke harness
4. 如果必须继续扩大 `P1 caller cleanup`，才能让这条专项通过

留档要求：

继续回填：

`/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE4_IMPLEMENTATION_LOG.md`

每次留档至少写清：

1. 背景/问题
2. 结论
3. 影响文件
4. 所属层级：`node runtime / smoke harness alignment`
5. 验证结果
6. 是否影响 `P1` 自然边界结论

输出格式：

1. `Node smoke alignment status`
2. `Files changed`
3. `Documentation updates`
4. `Verification`
5. `Remaining blockers`
6. `Can P1 be formally closed to boundary`

要求：

1. 先明确当前 helper / runtime / harness 还剩哪些红灯
2. 如果 `stage-graphic.test.ts` 仍未能在 app-scoped 路径下稳定通过，直接列 blocker
3. 在这条专项没绿前，不要把 `P1` 写成已完全完成

---

## 提交给架构师复核时，必须附带的内容

当你完成本轮实现或得出阶段性结论后，不要只回复“已完成”或“已通过”。  
你必须同时给出一段可直接转发给架构师的 review 请求，内容至少覆盖以下事实：

1. 当前专项状态：
   - 是否已完成
   - 是否仍有 blocker
   - `stage-graphic.test.ts` 是否已从 deprecated root `createStage()` 迁出
2. 关键实现点：
   - 是否已建立最小 app-scoped node smoke helper
   - helper 是否仍混入 package alias / cjs runtime
   - fake node window/context/canvas stub 是否已对齐到 app-scoped node runtime 的最小预期
3. 影响文件：
   - helper 文件
   - `stage-graphic.test.ts`
   - 如有必要的 env / runtime installer / test util 文件
4. 验证结果：
   - `packages/vrender-core rushx test -- --runInBand __tests__/unit/smoke/stage-graphic.test.ts --verbose`
   - `packages/vrender-core rushx compile`
   - 如触及安装链，补跑的最小相关单测
5. 边界判断：
   - 这次工作是否仍严格限定在 `node runtime / smoke harness alignment`
   - 是否没有继续扩大 `P1 caller cleanup`
   - 这次结果是否足以支持“`P1` 可以正式按 natural boundary 收口”

你返回给协调者的消息里，必须直接附上一段可复制的 review prompt。建议使用下面这个模板：

```md
请对 D3 legacy removal 的 node runtime / smoke harness alignment 专项结果做架构复核，并确认：
1. `packages/vrender-core/__tests__/unit/smoke/stage-graphic.test.ts` 是否已经不再属于当前 `P1 caller cleanup`
2. 这条专项是否已建立稳定的 app-scoped node runtime / smoke harness 路径
3. 当前结果是否足以支持 `P1` 正式按“caller cleanup reached natural boundary”收口

必读文档：
1. /Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_LEGACY_NODE_RUNTIME_SMOKE_ALIGNMENT.md
2. /Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_LEGACY_NODE_RUNTIME_SMOKE_PROMPT.md
3. /Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_LEGACY_PATH_REMOVAL_STATUS.md
4. /Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE4_IMPLEMENTATION_LOG.md

请重点核对：

1. 当前专项边界是否被严格遵守
- 没有继续扩大 `P1 caller cleanup`
- 没有推进 `P2 hygiene cleanup`
- 没有重开 D3 Phase 1-4 主设计

2. app-scoped node smoke helper 是否已经建立
- helper 是否仍依赖 deprecated root `createStage()`
- helper 是否仍混入 package alias / cjs runtime
- fake node window/context/canvas stub 是否已满足当前 smoke 链最小预期

3. `stage-graphic.test.ts` 的当前状态
- 是否已迁到 app-scoped 路径
- 若已迁移，是否仍保持原 smoke 语义并稳定通过
- 若未迁移，当前 blocker 是否真实成立

4. 验证是否足够
- `packages/vrender-core rushx test -- --runInBand __tests__/unit/smoke/stage-graphic.test.ts --verbose`
- `packages/vrender-core rushx compile`
- 如触及安装链，相关最小单测

5. 结论判断
- 当前专项是否已完成
- `P1` 是否可以正式按 natural boundary 收口
- 在你确认前，是否仍需继续维持“不能宣称 legacy removal completed / handoff ready”

请按以下结构回复：
1. 是否通过本专项架构复核
2. 是否仍存在 blocker 或 request changes
3. 是否足以支持 `P1` 正式按 natural boundary 收口
4. 当前是否可以继续进入 `P2`
```
