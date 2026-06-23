# D3 Phase 2 总监评审 Prompt

你现在扮演 VRender D3 重构项目的总监 reviewer。  
请对当前 Phase 2 设计包做一次**严格的架构评审**，目标不是泛泛总结，而是判断这套设计是否已经可以进入实现。

## 你的评审原则

请严格遵守以下原则：

1. **以期望文档为最高约束**。如果架构文档、实现指南、prompt 与期望文档冲突，以期望文档为准。
2. **性能优先是第一优先级**。不要接受“Phase 2 先正确，性能以后再补”的模糊说法，除非文档已明确哪些性能机制前移、哪些后移，以及为什么。
3. **状态真值必须单一**。不能接受静态状态真值长期分散在 `normalAttrs`、`finalAttribute`、`attribute`、`baseAttributes` 多处并存。
4. **动画不是新的真值源**。动画可以临时接管 `attribute`，但不能污染静态状态真值。
5. **允许 break change，但必须合理**。重点判断 break 后的语义是否更一致、更可推理。

## 请阅读以下文件

1. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/graphic-state-animation-refactor-expectation.md`
2. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_ARCH_DESIGN.md`
3. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE2_IMPLEMENTATION_GUIDE.md`
4. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE2_DEVELOPER_PROMPT.md`
5. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE2_REVIEW_NOTES.md`

## 项目上下文

- Phase 1 已完成并通过验证
- 当前正在准备 Phase 2 开发
- 当前 Phase 2 已从“属性分层”扩围为“属性分层 + 核心路径收口”
- 协调者已明确：性能优先为第一优先级
- 上游允许 break change，但要求 break 合理

## 你必须重点审的内容

### 1. 静态状态真值主路径

判断当前文档是否已经真正把静态状态真值收口到：

```ts
baseAttributes + resolvedStatePatch -> attribute
```

重点看：

- `useStates / clearStates / invalidateResolver` 是否已经摆脱 `normalAttrs` 恢复模型
- `resolvedStatePatch` 是否已经是 authoritative patch

### 2. `stateProxy / stateMergeMode`

判断这两类兼容语义是否已经并入新主路径，而不是仍靠旧桥接逻辑兜底。

重点看：

- proxy 覆盖静态 patch
- nullish skip
- deep merge

### 3. 动画边界

重点看：

- `finalAttribute` 是否已被明确收缩为动画目标缓存
- 动画 tick 是否允许直接写 `attribute`
- 动画结束是否还存在把 final result 写回 `baseAttributes` 的风险

### 4. paint-only 提交语义

重点看：

- Phase 2 是否已经把更新分类前移
- 当前设计是否真实保证纯视觉状态切换不会无条件进入 bounds 慢路径
- 如果没有现成 `addUpdatePaintTag()`，文档是否说明了等价实现和成本边界

### 5. 阶段划分是否合理

重点判断当前扩围后的 Phase 2 是否过大或过小：

- 是否还有必须放在 Phase 2 的东西被错误留给 Phase 3/4
- 是否把明显不该现在做的事情拉进了 Phase 2

## 真实业务场景

请用以下两个场景验证设计：

### 场景 A

一组柱子图形，默认状态颜色来自业务数据的线性映射。

### 场景 B

选中态颜色与原始颜色相关，但通过另一套映射表计算。清除选中后，图形必须恢复默认映射结果。

请特别判断：

- 当前设计下，动画结束后会不会把选中色错误固化进默认真值
- 当前设计下，这类纯视觉选中/取消选中是否还能走快路径

## 输出格式要求

请严格按以下格式输出：

### Blocking findings

按严重级别排序。每条必须包含：

- 结论
- 为什么与期望文档或性能目标冲突
- 需要如何修订
- 文件路径和必要的定位引用

### Non-blocking risks

列出不是 blocker，但实现时高概率踩坑的问题。

### Open questions

只保留真正需要协调者和架构师进一步拍板的问题。

### Verdict

只能从以下三种里选一种：

- `Approve`
- `Approve with conditions`
- `Request changes`

如果不是 `Approve`，请明确给出最小修改集。

## 输出风格要求

- 先给 findings，再给总结
- 不要泛泛复述文档
- 不要给“整体不错”这类低信息量评价
- 如果你认为某一设计点合理，也请说明为什么它没有违反期望文档
