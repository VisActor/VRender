# D3 Post-Alpha Wrap-Up Plan

> **文档类型**：alpha 后收尾优先级计划
> **用途**：在 `browser alpha gate closed` 之后，整理 D3 重构剩余事项、优先级、owner 与完成标准
> **当前状态**：历史 post-alpha 计划，stable closeout 已关闭主要 P1 项
> **重要说明**：本文件不是新的设计规范，不重开 Phase 1-4、legacy removal 或 browser alpha gate；它只负责 alpha 发布后的必要收尾排序
> **2026-05-18 更新**：本文保留 browser alpha 后历史优先级口径。稳定正式版目标已升级为“D3 全环境最终完成、无 D3 follow-up”，新 release gate 以 [D3_STABLE_RELEASE_CLOSEOUT_PLAN.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_STABLE_RELEASE_CLOSEOUT_PLAN.md) 为准；其中 node app-scoped runtime、multi-env support matrix、性能 P2 结论等已提升为 stable release P0 gate。

---

## 1. Current baseline

当前已经形成的基线：

1. D3 Phase 1-4 已完成或关闭
2. `legacy removal completed`
3. browser binding / installer root-cause 已通过 consumer-side re-check
4. `VChart` full-link browser functional lane 已通过
5. `textHeavy` recreate perf blocker 已完成双边验证并移出 browser alpha gate
6. external-stage app-scoped consumer rerun 已通过
7. browser alpha ready / browser alpha verification build 已完成历史阶段目标
8. node app-scoped runtime 已进入 stable Tier 1
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
| 发布口径分层 | Coordinator | release-day | 历史 alpha release note 保持 browser-first；stable release note 可写 node 已进入 Tier 1 |

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
- Status: completed for D3 stable release
- Source: [D3_ALPHA_COORDINATION.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_ALPHA_COORDINATION.md)

Node app-scoped runtime 已作为 stable Tier 1 关闭：`createNodeVRenderApp({ envParams })` 与 legacy-compatible `vglobal.setEnv('node', CanvasPkg)` 路径均已覆盖，真实 native canvas smoke 已在 Node 20.19.6 下通过。剩余约束是 CI / 本地测试必须保证 Node ABI 与 `canvas` native binding 匹配。

完成标准：

1. node app-scoped create -> render -> release -> recreate 路径转绿
2. adoption guide 明确 node 已进入 stable Tier 1，但 CI / 本地验证必须使用匹配 `canvas` native binding 的 Node ABI
3. 若 node lane 后续发现不支持某些 capability，应明确列为限制而不是隐含失败

### P1-2 Text stateProxy real-path coverage

- Owner: `cross-repo integration`
- Status: completed
- Source: [D3_UPPER_LAYER_ADOPTION_GUIDE.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_UPPER_LAYER_ADOPTION_GUIDE.md)

当前 consumer 验证命中了真实上层非 text `stateProxy`；随后已补 VTable-lite text `stateProxy` workload，覆盖真实上层 text 路径。

完成标准：

1. 至少一条上层或 VTable-lite 相关 workload 覆盖 text `stateProxy`
2. 覆盖不改变现有 `stateProxy` 边界：只承诺顶层 `graphic.attribute.xxx = ...`
3. 结果回填到 follow-up 或对应专项文档

完成证据：

1. `packages/vrender/__tests__/browser/src/pages/vtable-lite-text-stateproxy.ts`
2. `packages/vrender/__tests__/browser/src/pages/vtable-lite-shared.ts`
3. `D3_PHASE4_IMPLEMENTATION_LOG.md` 中记录 `VTable-lite text-stateProxy cells run 100`，`stateProxy` sample 语义 `10/10` 通过

### P1-3 Memory benchmark / VTable-lite P2

- Owner: `VRender-side`
- Status: closed as no-go for D3 stable release
- Source: [D3_MEMORY_BENCHMARK_P2_GUIDE.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_MEMORY_BENCHMARK_P2_GUIDE.md)

`P2` 不影响 browser alpha。稳定版收尾阶段已基于现有 before / after 数据关闭为 D3 stable release no-go：`VTable-lite text-stateProxy cells` 有可见收益，但官方 `memory.ts run 100` no-trace 没有形成足够清晰改善。

完成标准：

1. `memory.ts run 100` no-trace 相比 `P1 accepted` 基线继续改善
2. 至少一条 VTable-lite workload 证明收益或明确证明不值得继续
3. 不扩大状态系统契约，不引入深层 nested mutation 承诺
4. 结果回填到 `D3_PHASE4_IMPLEMENTATION_LOG.md`

关闭结论：

1. 本轮 `P2` 不接受为 D3 stable release 成果。
2. `P1 accepted` 仍是 D3 stable release 的性能基线。
3. 后续性能优化可作为独立专项重开，不再作为 D3 stable release follow-up 保留。

### P1-4 Multi-env / on-demand support matrix finalization

- Owner: `VRender-side` / maintainers
- Status: stable support matrix completed; advanced on-demand surface moved out of D3 release
- Source: [D3_MULTI_ENV_ON_DEMAND_GOVERNANCE.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_MULTI_ENV_ON_DEMAND_GOVERNANCE.md)

stable support matrix 已固化，避免“能力仍在”被误读成“全部进入一等 app-scoped contract”。

完成标准：

1. 明确 Tier 1 / Tier 2 / Tier 3 环境列表
2. 明确 default bootstrap 与 advanced/custom assembly 的 public surface
3. 记录哪些 on-demand 能力继续正式承诺，哪些只作为 legacy/custom path
4. adoption guide 与 README 导航口径一致

关闭结论：

1. Tier 1: `browser` / `node` / `wx` / `lynx` / `harmony`
2. Tier 2: `taro` / `feishu` / `tt`
3. Tier 3 / unsupported by stable default contract: `native`
4. 细粒度 on-demand assembly 与更强 runtime isolation 移出 D3 stable release，后续独立治理

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
- Status: completed
- Source: [D3_FOLLOWUPS.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_FOLLOWUPS.md)

已在 VRender core 中补充 deprecated warning：只有绑定 shared scope 后由 `graphic.states` 补齐缺失 shared definition 的路径会提示，普通本地图元状态和 shared definition 命中路径不提示。

### P2-3 Glyph ownership documentation split

- Owner: maintainers
- Status: closed as documented boundary
- Source: [D3_FOLLOWUPS.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_FOLLOWUPS.md)

`Glyph` 仍是非主路径扩展面，稳定版不并回 shared-state 主路径；`glyphStates` / `glyphStateProxy` 与 `subAttributes` 继续作为 Glyph 专属 surface。

### P2-4 Legacy/custom assembly samples cleanup

- Owner: `VRender-side`
- Status: completed for D3 stable scope
- Source: [D3_LEGACY_PATH_REMOVAL_STATUS.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_LEGACY_PATH_REMOVAL_STATUS.md)

`packages/vrender` browser pages 的 direct deprecated root `createStage()` scan 已补入 `background.ts` 并切到 app-scoped `createBrowserPageStage()`；剩余 triage-only 页面是能力验证口径，不再代表推荐接入方式或 D3 stable release follow-up。

---

## 7. Priority table

| Priority | Item | Owner | Why now |
| --- | --- | --- | --- |
| Release-day | lock alpha evidence and docs | Coordinator | 保证 alpha 发布口径与证据一致 |
| P0 | VChart app-provider-first source-level alignment | `cross-repo integration` / `VChart-side` | 把 `/tmp` 证据沉淀成正式上层路径，同时降低普通用户对 app 的感知 |
| P0 | external stage ownership contract hardening | `VChart-side` | 防止推荐路径的 ownership 再次被误用 |
| P1 | node app-scoped runtime readiness | `VRender-side` | 已作为 D3 stable Tier 1 关闭 |
| P1 | text stateProxy real-path coverage | `cross-repo integration` | 已由 VTable-lite text-stateProxy workload 补齐 |
| P1 | memory benchmark / VTable-lite P2 | `VRender-side` | 已关闭为 D3 stable release no-go |
| P1 | multi-env / on-demand support matrix | `VRender-side` / maintainers | stable support matrix 已关闭，advanced on-demand 移出 D3 release |
| P2 | full internal migration decision | `cross-repo integration` | 只有 app-provider-first 稳定后才值得决策 |
| P2 | `graphic.states` warning strategy | maintainers | 已完成 deprecated warning |
| P2 | Glyph ownership docs | maintainers | 已关闭为文档化特例边界 |
| P2 | legacy/custom samples cleanup | `VRender-side` | 已完成 D3 stable scope scan 补强 |

---

## 8. Agent routing after alpha

历史调度规则已执行到 stable closeout。后续建议调度规则：

1. **给 VChart agent**
   - 执行 P0-1 / P0-2
   - 不重跑 browser alpha gate
   - 不直接跳 full internal migration
2. **给 VRender agent**
   - 保持 Tier 1 release-day rerun 与 Node ABI 检查
   - 对 taro / feishu / tt 做真实端 smoke 后决定是否从 Tier 2 升级
   - 若维护者决定保留 advanced on-demand assembly，再补 public app-scoped installer surface
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

- browser alpha 历史阶段已关闭
- stable release 阶段第一收尾任务不是继续刷旧 gate，而是把 `VChart` app-provider-first 路径沉淀到源码级正式链路
- node runtime、text `stateProxy` 覆盖、VTable-lite P2、multi-env support matrix 均已形成 stable closeout 结论
- advanced on-demand assembly、Tier 2 端升级、runtime isolation 是非 D3 stable release blocker 的后续治理
- full internal migration 是决策项，不是 alpha 后立即默认执行项
