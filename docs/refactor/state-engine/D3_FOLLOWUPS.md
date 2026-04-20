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

---

## 3. 处理规则

后续如果要推进上述项目，建议按以下顺序处理：

1. 先确认是否真的需要进入正式任务，而不是继续保持为文档级 follow-up。
2. 若进入正式任务，新增独立文档或 implementation log 条目承接，不直接修改本文件为开放式讨论。
3. 在正式任务启动前，默认保持当前 `closed` 结论不变，除非发现它们已经实际影响已关闭阶段的运行时正确性。
