# D3 Post-Alpha Wrap-Up Plan

> **文档类型**：alpha 后收尾优先级计划
> **用途**：在 `browser alpha gate closed` 之后，整理 D3 重构剩余事项、优先级、owner 与完成标准
> **当前状态**：待执行
> **重要说明**：本文件不是新的设计规范，不重开 Phase 1-4、legacy removal 或 browser alpha gate；它只负责 alpha 发布后的必要收尾排序

---

## 1. Current baseline

当前已经形成的基线：

1. D3 Phase 1-4 已完成或关闭
2. `legacy removal completed`
3. browser binding / installer root-cause 已通过 consumer-side re-check
4. `VChart` full-link browser functional lane 已通过
5. `textHeavy` recreate perf blocker 已完成双边验证并移出 browser alpha gate
6. external-stage app-scoped consumer rerun 已通过
7. 当前可以按 **browser alpha ready / browser alpha verification build** 处理
8. 当前仍不是 **node-complete alpha**
9. root app creator public typing 已补齐，上层 TypeScript 调用方可直接消费 `IApp`

当前待发布分支最新提交：

- `4d1798865`

其中：

- `9b6508ea70ac223be87a2e86608ebcb3db49d1cf` 是最新 browser runtime/perf gate 修复提交
- `4d1798865` 在其后补齐 root app creator public typing 与 artifact guard

当前状态面入口：

- [D3_ALPHA_COORDINATION.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_ALPHA_COORDINATION.md)

---

## 2. Do not reopen

alpha 后收尾不能重新打开下面已经关闭的阶段或 blocker：

1. Phase 1 状态引擎内核
2. Phase 2 属性分层与静态真值主路径
3. Phase 3 Group-first shared-state
4. Phase 4 strict paint-only deferred / batch 调度
5. legacy removal P0/P1/P2 收口
6. browser root export / `container` export blocker
7. browser `canvas: 'id'` blocker
8. `installNodeEnvToApp` / picker binding blocker
9. `textHeavy mixed scene recreate` perf blocker
10. browser alpha gate 本身

如果后续发现新的回归，应作为新问题记录，不要把旧阶段状态改回 open。

---

## 3. Release-day housekeeping

这些事项建议在 alpha 发布动作附近完成，目的是保证发布材料与代码状态一致。

| Item | Owner | Priority | 完成标准 |
| --- | --- | --- | --- |
| 锁定 browser alpha 证据面 | Coordinator | release-day | `D3_ALPHA_COORDINATION.md` 保持 `browser alpha gate closed`，关键 rerun artifact 路径可追溯 |
| 确认 VRender 变更都已进入目标提交/分支 | VRender-side | release-day | `9b6508...` runtime 修复及 `4d179...` typing 变更已进入待发布分支 |
| 确认新增 D3 文档进入版本控制 | Coordinator | release-day | `D3_ALPHA_COORDINATION.md`、接入/治理/收尾文档不再处于遗漏的 untracked 状态 |
| 发布口径分层 | Coordinator | release-day | release note 明确写成 browser alpha，不宣称 node-complete alpha |

---

## 4. P0 post-alpha closeout

P0 是 alpha 发布后最先要收尾的事项。它们不阻塞 browser alpha 发布，但会直接影响上层是否能把 alpha 结果沉淀成长期可维护的接入路径。

### P0-1 VChart app-provider-first source-level alignment

- Owner: `cross-repo integration` / `VChart-side`
- Status: follow-up
- Source: [D3_VCHART_APP_SCOPED_ALIGNMENT_PLAN.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_VCHART_APP_SCOPED_ALIGNMENT_PLAN.md)

当前已有 `/tmp` consumer harness 证明 external-stage integration path 可行：

1. `createBrowserVRenderApp()` 可用
2. `app.createStage()` 可用
3. `new VChart(..., { stage })` 可用
4. init / update / recreate / release / stage reuse 证据已通过

但这还不是最终用户侧的 `VChart` 源码级正式对齐。alpha 后第一优先级应是把 app-provider-first / VChart-created-stage 路径落到 `VChart` 的正式 harness / test / source-level contract 中。

完成标准：

1. `VChart` 源码或正式 runtime harness 中存在一条明确的 app-provider-first 路径
2. 该路径直接使用：
   - `createBrowserVRenderApp()`
   - `app.createStage()`
   - `new VChart(spec, { dom })` 或等价内部创建链
3. 覆盖 init / update / recreate / release
4. 明确外部传入 stage 的 ownership：谁创建，谁释放
5. 明确 `VChart` 自己内部创建 stage 时的 ownership：
   - 普通 `new VChart(spec, { dom })` 应先尝试从场景/上下文获取 app
   - 获取不到 app 时，`VChart` 应创建或复用 VChart-managed shared app
   - `chart.release()` 应释放 `VChart` 自己创建的 stage
   - `chart.release()` 在 shared fallback app 场景下释放 app 引用，最后一个使用者释放后清理 app
   - external stage 只借用，不释放
6. 覆盖同页多个 `VChart` 实例：
   - scene-app-owned 模式下，多个 chart 复用同一个 scene app
   - 每个 `VChart` 仍应自己创建并释放自己的 stage
   - 单个 `chart.release()` 不释放 scene-owned app
   - VChart-managed shared fallback 模式下，多个 chart 复用 fallback app，避免重复 bootstrap
   - external-stage-owned 模式下，`chart.release()` 不释放外部 stage/app
7. 不要求同时完成 full internal migration

### P0-2 External stage ownership contract hardening

- Owner: `VChart-side`
- Status: follow-up
- Source: [D3_UPPER_LAYER_INTEGRATION_FRICTION_REVIEW.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_UPPER_LAYER_INTEGRATION_FRICTION_REVIEW.md)

external-stage 路径已经证明可用，但源码侧仍应把 ownership contract 固定下来，避免后续调用方重新把外部 stage 当成内部 owned stage 释放。

完成标准：

1. `VChart` 明确区分 internal stage 与 external stage
2. `chart.release()` 不释放外部创建并传入的 stage
3. 有最小测试或 runtime harness 证明 external stage 在 `chart.release()` 后仍可被创建者继续管理
4. 有最小测试或 runtime harness 证明 scene-app-owned 模式下 `chart.release()` 只释放本 chart 创建的 stage，不释放 shared app
5. 有最小测试或 runtime harness 证明 VChart-managed shared fallback app 会被多个 chart 复用，且最后一个使用者释放后正确清理
6. 文档中写清 ownership contract

---

## 5. P1 post-alpha closeout

P1 是 alpha 发布后应尽快排期的质量与契约收尾项。它们不属于当前 browser alpha gate，但会影响后续 beta / 正式版风险。

### P1-1 Node app-scoped runtime readiness

- Owner: `VRender-side`
- Status: open
- Source: [D3_ALPHA_COORDINATION.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_ALPHA_COORDINATION.md)

当前 `createNodeVRenderApp().createStage()` 仍未作为 node-complete alpha 关闭。它不阻塞 browser alpha，但不能继续被文档误写成与 browser 等强。

完成标准：

1. node app-scoped create -> render -> release -> recreate 路径转绿
2. node readiness 与 browser readiness 在 adoption guide 中分层表达
3. 若 node lane 暂不支持某些 capability，应明确列为限制而不是隐含失败

### P1-2 Text stateProxy real-path coverage

- Owner: `cross-repo integration`
- Status: follow-up
- Source: [D3_UPPER_LAYER_ADOPTION_GUIDE.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_UPPER_LAYER_ADOPTION_GUIDE.md)

当前 consumer 验证命中了真实上层非 text `stateProxy`，但尚未覆盖真实上层 text `stateProxy` 路径。

完成标准：

1. 至少一条上层或 VTable-lite 相关 workload 覆盖 text `stateProxy`
2. 覆盖不改变现有 `stateProxy` 边界：只承诺顶层 `graphic.attribute.xxx = ...`
3. 结果回填到 follow-up 或对应专项文档

### P1-3 Memory benchmark / VTable-lite P2

- Owner: `VRender-side`
- Status: `P2 approved to start`, not accepted
- Source: [D3_MEMORY_BENCHMARK_P2_GUIDE.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_MEMORY_BENCHMARK_P2_GUIDE.md)

`P2` 不影响 browser alpha，但它仍是 D3 性能收尾中最重要的业务向专项。

完成标准：

1. `memory.ts run 100` no-trace 相比 `P1 accepted` 基线继续改善
2. 至少一条 VTable-lite workload 证明收益或明确证明不值得继续
3. 不扩大状态系统契约，不引入深层 nested mutation 承诺
4. 结果回填到 `D3_PHASE4_IMPLEMENTATION_LOG.md`

### P1-4 Multi-env / on-demand support matrix finalization

- Owner: `VRender-side` / maintainers
- Status: governance completed enough for browser alpha; long-term contract still needs matrix
- Source: [D3_MULTI_ENV_ON_DEMAND_GOVERNANCE.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_MULTI_ENV_ON_DEMAND_GOVERNANCE.md)

治理任务已经把口径收住，但 alpha 后仍需要把长期 support matrix 固化，避免“能力仍在”被误读成“全部进入一等 app-scoped contract”。

完成标准：

1. 明确 Tier 1 / Tier 2 / Tier 3 环境列表
2. 明确 default bootstrap 与 advanced/custom assembly 的 public surface
3. 记录哪些 on-demand 能力继续正式承诺，哪些只作为 legacy/custom path
4. adoption guide 与 README 导航口径一致

---

## 6. P2 post-alpha closeout

P2 是建议保留但不应挤占 P0/P1 的后续项。

### P2-1 Full internal migration decision

- Owner: `cross-repo integration`
- Status: decision pending
- Source: [D3_VCHART_APP_SCOPED_ALIGNMENT_PLAN.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_VCHART_APP_SCOPED_ALIGNMENT_PLAN.md)

只有 app-provider-first 源码级对齐稳定后，才决定是否继续 full internal migration。

可能结论：

1. 继续内部迁移到 root app creator
2. 长期保留 compatibility-heavy internal path，但将 app-provider-first 写成正式推荐集成方式

### P2-2 `graphic.states` missing-state warning strategy

- Owner: maintainers
- Status: follow-up
- Source: [D3_FOLLOWUPS.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_FOLLOWUPS.md)

这是开发体验和兼容提示策略，不影响 D3 已关闭结论。

### P2-3 Glyph ownership documentation split

- Owner: maintainers
- Status: follow-up
- Source: [D3_FOLLOWUPS.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_FOLLOWUPS.md)

`Glyph` 仍是非主路径扩展面，建议后续作为文档整理项处理。

### P2-4 Legacy/custom assembly samples cleanup

- Owner: `VRender-side`
- Status: follow-up
- Source: [D3_LEGACY_PATH_REMOVAL_STATUS.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_LEGACY_PATH_REMOVAL_STATUS.md)

继续清理或标注 triage-only demo / legacy sample，避免它们被误当作当前推荐用法。

---

## 7. Priority table

| Priority | Item | Owner | Why now |
| --- | --- | --- | --- |
| Release-day | lock alpha evidence and docs | Coordinator | 保证 alpha 发布口径与证据一致 |
| P0 | VChart app-provider-first source-level alignment | `cross-repo integration` / `VChart-side` | 把 `/tmp` 证据沉淀成正式上层路径，同时降低普通用户对 app 的感知 |
| P0 | external stage ownership contract hardening | `VChart-side` | 防止推荐路径的 ownership 再次被误用 |
| P1 | node app-scoped runtime readiness | `VRender-side` | 从 browser alpha 走向 node-complete alpha 的必要项 |
| P1 | text stateProxy real-path coverage | `cross-repo integration` | 补齐真实上层状态覆盖缺口 |
| P1 | memory benchmark / VTable-lite P2 | `VRender-side` | 继续收口高数量业务场景构造成本 |
| P1 | multi-env / on-demand support matrix | `VRender-side` / maintainers | 固化长期 public contract |
| P2 | full internal migration decision | `cross-repo integration` | 只有 app-provider-first 稳定后才值得决策 |
| P2 | `graphic.states` warning strategy | maintainers | 开发体验项，不影响运行时正确性 |
| P2 | Glyph ownership docs | maintainers | 文档组织项 |
| P2 | legacy/custom samples cleanup | `VRender-side` | 降低后续误读成本 |

---

## 8. Agent routing after alpha

建议调度规则：

1. **先给 VChart agent**
   - 执行 P0-1 / P0-2
   - 不重跑 browser alpha gate
   - 不直接跳 full internal migration
2. **再给 VRender agent**
   - 执行 P1-1 node runtime
   - 执行 P1-3 memory / VTable-lite P2
   - 参与 P1-4 support matrix 的实现面
3. **协调者 / 架构维护者**
   - 维护 release note 口径
   - 决策 P1-4 support matrix
   - 决策 P2-1 full internal migration 是否启动

---

## 9. Stop rules

后续执行中遇到下面情况，应停止并回到协调判断：

1. 某项 follow-up 需要改变 `baseAttributes + resolvedStatePatch -> attribute` 静态真值模型
2. 某项 follow-up 需要扩大 `stateProxy` 深层 nested mutation 兼容承诺
3. 某项 follow-up 需要重开已关闭的 browser alpha gate
4. full internal migration 被提前启动，且没有先完成 app-provider-first 源码级对齐
5. multi-env / on-demand 任务开始无差别扩 public surface，而没有先拍板 support matrix

---

## 10. Current verdict

当前统一判断：

- browser alpha 可以发布验证版
- alpha 后第一收尾任务不是继续刷 gate，而是把 `VChart` app-provider-first 路径沉淀到源码级正式链路
- node runtime、text `stateProxy` 覆盖、VTable-lite P2、multi-env/on-demand support matrix 是后续高优先级收尾
- full internal migration 是决策项，不是 alpha 后立即默认执行项
