# D3 重构最终总结

> **文档类型**：项目归档总结
> **用途**：汇总 D3 项目 Phase 1-4 的最终结论，供协调者、总监和后续维护者快速了解全局结果
> **当前状态**：已归档
> **重要说明**：本文件不是新的规范源；规范仍以 `graphic-state-animation-refactor-expectation.md`、`D3_ARCH_DESIGN.md` 及各 Phase 的 design / execution / implementation log 为准

---

## 1. 项目结论

D3 重构已按四个阶段完成闭环：

1. Phase 1：状态引擎内核，已完成
2. Phase 2：属性分层与核心路径收口，已 `closed`
3. Phase 3：Group-first 共享状态定义，已 `closed`
4. Phase 4：性能优化（观测 + strict paint-only deferred），已 `closed`

说明：
Phase 1 以“实现完成并通过验证”作为阶段收口，没有单独走后续 Phase 采用的 close-out 模板；项目级正式 close-out 主要发生在 Phase 2-4。

项目最终建立了以**图元静态状态真值模型**为核心的状态系统：

`baseAttributes + resolvedStatePatch -> attribute`

同时收口了：

- 统一状态裁决模型：`priority / rank / exclude / suppress`
- Group-first shared-state ownership
- 纯视觉状态切换快路径与最小 deferred 调度模型
- 状态与动画的边界

---

## 2. 各阶段最终结论

### Phase 1

- 解决了什么：
  建立状态定义、编译、裁决、resolver 缓存与 `StateEngine` 主路径，结束“状态逻辑散落在图元和业务侧”的局面。
- 关键拍板：
  先落状态引擎内核，不在本阶段重开属性分层、shared-state 和性能优化。
- 最终交付：
  `StateDefinition` / `CompiledStateDefinition`、`StateDefinitionCompiler`、`StateEngine`、`StateModel` 增强、`graphic.invalidateResolver()`、`graphic.effectiveStates` / `graphic.resolvedStatePatch`。
- 验证结果：
  `rush compile -t @visactor/vrender-core` 通过；`vrender-core` 测试 `82/82 suites, 451/451 tests` 通过；状态相关测试 `12/12 suites, 101/101 tests` 通过。
- 留下的 follow-up：
  属性分层、shared-state 与性能优化转入后续 Phase。

### Phase 2

- 解决了什么：
  把静态状态真值正式收口到 `baseAttributes + resolvedStatePatch -> attribute`，并清理旧的 `normalAttrs / finalAttribute / onStop(props)` 主路径依赖。
- 关键拍板：
  `resolvedStatePatch` 成为唯一 authoritative patch；动画不再隐式 end-commit；`paint-only` 走独立更新语义；`stateProxy fully decides` 仅作为 legacy compatibility 接受。
- 最终交付：
  属性分层、`_syncAttribute()`、`_restoreAttributeFromStaticTruth()`、`UPDATE_PAINT`、strict paint-only 提交路径、动画恢复契约、正式写路径矩阵。
- 留下的 follow-up：
  `Glyph` ownership 转为 Phase 3 正式输入；`graphic.states` 告警策略未在本阶段拍板。

### Phase 3

- 解决了什么：
  把共享状态定义正式收口到 `Theme -> stage.rootSharedStateScope -> Group scopes -> Graphic`，结束实例级状态定义作为主模型的设计方向。
- 关键拍板：
  `Group` 是 shared-state 主 owner；`Theme` 只做只读默认来源；`graphic.states` 只做 missing-state fallback；实例级 `stateProxy` 退出 shared-state 主路径；resolver 保留为实例 escape hatch。
- 最终交付：
  `rootSharedStateScope`、`Group.sharedStateScope`、effective compiled view、多 scope active 注册、render 前 refresh 契约、shared-state invalidation / rebinding 主路径。
- 留下的 follow-up：
  `Glyph ownership` 文档拆分与后续落点继续保留；`graphic.states` 告警策略仍未拍板。

### Phase 4

- 解决了什么：
  在不重开 Phase 2/3 主模型的前提下，补齐状态切换性能观测、strict `paint-only` deferred 和最小批量调度闭环。
- 关键拍板：
  Phase 4 第一版只做“观测 + 调度”；观测点只落在状态切换 / shared refresh / batch job 边界；`StateBatchJob` 固定为 `single-intent job`；job identity 固定为 `contextOwnerId + configFingerprint + targetStatesKey`；shared refresh 第一版只做观测，不默认 deferred。
- 最终交付：
  Stage 级 perf snapshot、最小事件环、`pendingIntentByGraphic`、per-graphic committed snapshot、strict `paint-only` deferred、single-intent state batch scheduler、ineligible reason breakdown。
- 验证结果：
  `packages/vrender-core` 全量测试 `94/94 suites, 478/478 tests` 通过；Phase 4 专项测试 `5/5 suites, 10/10 tests` 通过；兼容 fixup 定向回归 `2/2 suites, 25/25 tests` 通过。
- 留下的 follow-up：
  `graphic.states` 告警策略与 `Glyph ownership` 文档拆分继续作为非阻塞项跟踪。

---

## 3. 项目级关键拍板

整个 D3 项目最终收敛出的关键结论如下：

1. 静态状态真值只允许存在于 `baseAttributes + resolvedStatePatch -> attribute`，动画不是新的真值源。
2. 共享状态定义以 `Group-first` 为主模型，`Theme` 只提供只读默认来源。
3. 实例级 `resolver` 被保留为 escape hatch，但实例级 `stateProxy` 不再是推荐主路径。
4. 性能优化只作为主模型之上的可选增强，不能把状态解释逻辑重新带回 render / pick / bounds 热路径。
5. close-out、验收模板、实现留档都被正式纳入交付物，而不是仅靠对话记录留存。

---

## 4. 当前保留的非阻塞项

当前项目仍保留 2 个明确的非阻塞 follow-up：

1. `graphic.states` missing-state fallback 的告警策略
2. `Glyph ownership` 的文档拆分与后续归属

这两项不会影响 Phase 2 / Phase 3 / Phase 4 已 `closed` 的结论，后续应在独立 follow-up 清单中跟踪，不再回流污染已关闭阶段的主文档。

补充：

browser alpha gate 关闭后新增的上层接入、node runtime、VTable-lite P2、multi-env / on-demand support matrix 等收尾事项，不属于 Phase 1-4 主线 reopen。它们统一看：

- [D3_POST_ALPHA_WRAPUP_PLAN.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_POST_ALPHA_WRAPUP_PLAN.md)
- [D3_FOLLOWUPS.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_FOLLOWUPS.md)

---

## 5. 规范源入口

如果后续需要追溯具体规范、边界或实现证据，请按以下顺序回看：

1. `graphic-state-animation-refactor-expectation.md`
2. `D3_ARCH_DESIGN.md`
3. 各 Phase 的正式 design / execution prompt / implementation log / acceptance template
4. `D3_ARCHIVE_INDEX.md`
5. `D3_FOLLOWUPS.md`
