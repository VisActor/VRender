# D3 后续项跟踪

> **文档类型**：归档后续项清单
> **用途**：记录 D3 项目已确认的非阻塞 follow-up，供后续规划与维护使用
> **当前状态**：持续跟踪
> **重要说明**：本文件不是新的设计讨论场；它只承接已明确降级为非阻塞的问题，不重开 Phase 2 / 3 / 4 已关闭设计

---

## 1. 跟踪原则

1. 这里只记录已确认的非阻塞项。
2. 每项都必须说明为什么不阻塞当前 `closed` 结论。
3. 若后续要推进，优先在归属阶段或新任务文档中开工，不在本文件里继续展开设计。
4. browser alpha gate 关闭后的执行优先级，以 [D3_POST_ALPHA_WRAPUP_PLAN.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_POST_ALPHA_WRAPUP_PLAN.md) 为准。

---

## 2. 当前后续项

### F-01 `graphic.states` missing-state fallback 告警策略

- 问题：
  当前 shared-state 主路径已经把 `graphic.states` 收口为 missing-state fallback，但 fallback 的告警策略尚未拍板，例如是 dev-only warning、deprecated 提示，还是完全静默兼容。
- 当前状态：
  已识别、已降级为非阻塞 follow-up，尚未进入独立实现。
- 为什么是非阻塞：
  Phase 3 ownership、fallback 裁决语义和 Phase 4 主路径都已经闭环；这个问题只影响开发时提示策略，不影响当前 `closed` 阶段的运行时正确性。
- 建议归属阶段/负责人：
  建议作为后续文档与兼容性治理任务处理；默认由架构师与维护者共同拍板，必要时实现 agent 配合落地。
- 是否影响现有 closed 结论：
  否。不影响 Phase 3 / Phase 4 已 `closed` 的结论。

### F-02 `Glyph ownership` 文档拆分与归属

- 问题：
  `Glyph` 在 D3 中一直被明确隔离为非主路径扩展面，但后续仍需决定它的 ownership 文档应该单独拆出，还是并入后续维护章节。
- 当前状态：
  已识别、已降级为非阻塞 follow-up，当前仅保持“隔离、不扩展 glyph 专属状态语义”的约束。
- 为什么是非阻塞：
  Phase 2 已保证 `Glyph` 跟随主路径回到正确真值；Phase 3 / Phase 4 主路径没有再把 `Glyph` 拉回核心模型，因此该问题只影响后续文档组织与维护入口，不影响当前闭环结果。
- 建议归属阶段/负责人：
  建议作为后续架构文档整理任务处理，由架构师主导，必要时结合实际代码维护者意见。
- 是否影响现有 closed 结论：
  否。不影响 Phase 2 / Phase 3 / Phase 4 已 `closed` 的结论。

### F-03 `memory` benchmark 中的 per-graphic 固定构造成本偏高

- 问题：
  `memory.ts` benchmark 在已经改成“复用单 app、只重建 stage”之后，当前分支相较 `develop` 仍存在显著性能差距。进一步归因后，主因已经收敛到 `Graphic` 在 D3 重构后每实例固定成本上升，而不是 app/stage 重建策略。
- 当前状态：
  已从 follow-up 升级为独立性能专项；后续不再在本文件中继续展开。
- 为什么是非阻塞：
  这是一个极端构造 benchmark 的性能问题，不等于当前 handoff 主链不可用，也不直接推翻 Phase 1-4 或 legacy removal 的完成结论。
- 证据入口：
  看：
  - [D3_MEMORY_BENCHMARK_PERF_CONTEXT.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_MEMORY_BENCHMARK_PERF_CONTEXT.md)
  - [D3_MEMORY_BENCHMARK_P2_GUIDE.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_MEMORY_BENCHMARK_P2_GUIDE.md)
- 建议归属阶段/负责人：
  已单独开启 `P2` 性能专项，由架构师拍板边界，实施 agent 配合落地。
- 是否影响现有 closed 结论：
  否。不影响当前 `legacy removal completed` 和阶段关闭结论。

### F-04 默认 browser env / picker 安装链过宽

- 问题：
  当前 `VRender` 的 legacy browser env 初始化链会默认调用 `loadCanvasPicker(container)`，而 `loadCanvasPicker` 又会无条件装配 `arc3d` / `pyramid3d` / `rect3d` 等 picker 贡献。这意味着即便当前上层页面实际只跑 2D chart，只要走了这条默认 browser env/bootstrap 路径，就可能被可选 3D binding 的缺口提前截断。
- 当前状态：
  已从纯 follow-up 升级为当前 alpha 兼容性修复方向。当前 alpha 协调线继续通过 `D3_ALPHA_COORDINATION.md` 跟踪具体 blocker 的收口；本文件只保留问题定义与归属，不再在这里展开实现细节。
- 为什么是后续项：
  这属于更宽的安装链/默认装配收口问题。它解释了为什么当前 2D 页面仍会被 3D runtime binding 影响，但不改变 D3 Phase 1-4 已 `closed` 的结论。当前用户已明确允许借这次 `VChart` 验证把该问题直接纳入修复范围。
- 证据入口：
  - [D3_ALPHA_COORDINATION.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_ALPHA_COORDINATION.md)
  - `packages/vrender-kits/src/env/browser.ts`
  - `packages/vrender-kits/src/picker/canvas-module.ts`
- 建议归属阶段/负责人：
  当前已升级为 alpha 线的兼容性/安装链治理任务，由协调者在 `D3_ALPHA_COORDINATION.md` 中收口当前 blocker，再由实现 agent 直接修复。
- 是否影响现有 closed 结论：
  否。不影响 Phase 2 / Phase 3 / Phase 4 已 `closed` 的结论；它只影响后续 handoff / alpha 线的稳健性治理。

### F-05 multi-env 一等支持 / app-scoped 按需装配 contract 治理

- 问题：
  进入 app-scoped 主路径后，VRender 的 browser/node 默认入口已经清晰，但历史上存在的多环境支持与细粒度按需装配能力没有同步升级成对等 public contract。当前能力层面仍然存在，但 user-facing contract、public surface、类型面、验证面都已经分层，容易被上层误读成“新主路径已等价承接旧能力”。
- 当前状态：
  已完成 browser alpha 所需的最小治理收口；长期 support matrix、advanced public surface 与验证矩阵继续按 post-alpha P1 follow-up 处理。
- 为什么是非阻塞：
  当前 browser root-package 主路径已经足以支撑 handoff 与上层继续验证；这条问题影响的是更宽 contract 的明确化与长期治理，不直接推翻 Phase 2 / 3 / 4 或 `legacy removal completed` 的既有结论。
- 证据入口：
  看：
  - [D3_UPPER_LAYER_INTEGRATION_FRICTION_REVIEW.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_UPPER_LAYER_INTEGRATION_FRICTION_REVIEW.md)
  - [D3_MULTI_ENV_ON_DEMAND_GOVERNANCE.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_MULTI_ENV_ON_DEMAND_GOVERNANCE.md)
  - [D3_VCHART_APP_SCOPED_ALIGNMENT_PLAN.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_VCHART_APP_SCOPED_ALIGNMENT_PLAN.md)
  - [D3_UPPER_LAYER_ADOPTION_GUIDE.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_UPPER_LAYER_ADOPTION_GUIDE.md)
- 建议归属阶段/负责人：
  post-alpha 阶段继续由架构师与维护者拍板 support matrix / public surface，再由实现 agent 分 workstream 推进。
- 是否影响现有 closed 结论：
  否。不影响 D3 主线 closed 结论；它影响的是 VRender 是否继续正式承诺更宽的 multi-env / on-demand contract。

---

## 3. 处理规则

后续如果要推进上述项目，建议按以下顺序处理：

1. 先确认是否真的需要进入正式任务，而不是继续保持为文档级 follow-up。
2. 若进入正式任务，新增独立文档或 implementation log 条目承接，不直接修改本文件为开放式讨论。
3. 在正式任务启动前，默认保持当前 `closed` 结论不变，除非发现它们已经实际影响已关闭阶段的运行时正确性。

---

## Browser Alpha Post-Gate Follow-ups (2026-04-23)

以下事项在 `browser alpha gate closed` 后继续保留，但不再作为当前 browser alpha blocker：

执行优先级和完成标准统一看：

- [D3_POST_ALPHA_WRAPUP_PLAN.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_POST_ALPHA_WRAPUP_PLAN.md)

### F-Alpha-01 node app-scoped runtime

- Owner: `VRender-side`
- 当前状态：open
- 说明：`createNodeVRenderApp().createStage()` 仍未转绿。这是 node lane，不属于当前 browser alpha gate。

### F-Alpha-02 VChart source-level external-stage-first alignment

- Owner: `cross-repo integration`
- 当前状态：follow-up
- 说明：`createBrowserVRenderApp() + app.createStage() + { stage }` 的 consumer-side 路径已完成 fresh rerun 并成立；下一步应按 `D3_VCHART_APP_SCOPED_ALIGNMENT_PLAN.md` 推进源码级 external-stage-first 对齐。

### F-Alpha-03 full internal migration decision

- Owner: `cross-repo integration`
- 当前状态：follow-up
- 说明：当前不作为 alpha 先决条件。应在 external-stage-first 稳定后，再决定是否继续做 full internal migration。

### F-Alpha-04 text stateProxy real-path coverage

- Owner: `cross-repo integration`
- 当前状态：follow-up
- 说明：当前只覆盖到非 text `stateProxy`。这条属于覆盖补齐，不再阻塞当前 browser alpha gate。

### F-Alpha-05 external stage ownership governance hardening

- Owner: `VChart-side`
- 当前状态：follow-up
- 说明：external-stage-first 路径已可用，但源码侧 ownership 契约与治理沉淀仍建议继续收口，不再作为当前 browser alpha gate blocker。
