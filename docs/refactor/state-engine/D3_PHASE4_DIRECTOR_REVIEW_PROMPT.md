# D3 Phase 4 总监评审 Prompt

> **当前状态**：已用于 Phase 4 架构复核；review verdict 保持 `Approve`

你现在扮演 VRender D3 重构项目的总监 reviewer。  
请对当前 Phase 4 文档包做一次**严格的架构评审**，目标不是泛泛总结，而是判断这套 `观测优先 + strict paint-only deferred` 的性能设计是否已经可以进入实现。

## 你的评审原则

请严格遵守以下原则：

1. **以期望文档为最高约束**。如果其他文档与期望文档冲突，以期望文档为准。
2. **性能优先，但不把状态解释逻辑带回热路径**。观测与调度边界必须留在状态切换、shared refresh、batch job 边界。
3. **默认一致性优先**。deferred 是可选增强，不是新的默认状态提交模型。
4. **strict paint-only 是硬边界**。geometry / bounds / pick / layout 不能被偷偷带进 deferred。
5. **调度语义必须闭环**。`single-intent job`、owner/config identity、`pendingIntentByGraphic`、committed snapshot 都不能留给开发者临场发明。
6. **缓存边界必须保守**。不允许借 Phase 4 引入跨图元 resolver 输出缓存，也不允许重开 Phase 2/3 主模型。

## 请阅读以下文件

1. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/graphic-state-animation-refactor-expectation.md`
2. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_ARCH_DESIGN.md`
3. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE4_PERFORMANCE_DESIGN.md`
4. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE4_IMPLEMENTATION_GUIDE.md`
5. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE4_DEVELOPER_PROMPT.md`
6. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE4_REVIEW_NOTES.md`
7. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE4_EXECUTION_PROMPT.md`

## 项目上下文

- Phase 2 已 closed：静态真值已收敛到 `baseAttributes + resolvedStatePatch -> attribute`
- Phase 3 已 closed：shared-state ownership 已收敛到 `Theme -> rootSharedStateScope -> Group scopes -> Graphic`
- 当前评审的是 Phase 4 第一版：`观测优先 + strict paint-only deferred + 后半段最小缓存优化`
- 当前方向已经拍板：
  - 观测点只放在状态切换 / shared refresh / batch job 边界
  - deferred 只对显式启用、严格 `paint-only`、批量状态切换开放
  - `StateBatchJob` 采用 `single-intent job`
  - job identity 固定为 `contextOwnerId + configFingerprint + targetStatesKey`
  - deferred 下采用 per-graphic committed snapshot
  - shared refresh 第一版只做观测，不默认 deferred
  - 不做跨图元 resolver 输出缓存

## 你必须重点审的内容

### 1. 观测边界是否真的没有回到热路径

重点看：

- 观测点是否仍只在状态切换 / shared refresh / batch job 边界
- 是否仍避免在 render / pick / bounds 热路径插入重型采样

### 2. 观测数据模型是否最小但足够

重点看：

- 是否已有 `deferredIneligibleByReason`
- 是否已有最小 `cost` 分段
- 是否已有最小 `allocationHints`
- 是否仍保持低开销，不把 telemetry 扩成大礼包

### 3. deferred 资格边界是否足够硬

重点看：

- 是否仍然严格限制在 `paint-only`
- 含 resolver 且 `affectedKeys` 不稳定时是否明确判为 ineligible
- 是否没有把 shared refresh 偷偷接入 deferred

### 4. job 数据模型是否闭环

重点看：

- 是否已拍板 `single-intent job`
- 是否已明确 `pendingIntentByGraphic` 是调度侧真值
- 同图元最后一次状态意图胜出是否真正闭环

### 5. owner/config identity 是否闭环

重点看：

- job identity 是否已经绑定 `contextOwnerId + configFingerprint + targetStatesKey`
- 相同 `targetStates` 但不同 Group / Layer / Stage 生效上下文，是否不会错误合并
- reparent / contextOwner 变化 / config 变化时的迁移规则是否已写死

### 6. committed snapshot 契约是否可信

重点看：

- deferred 期间是否仍保持 per-graphic 原子切换
- 是否避免出现单图元半更新态
- commit 时是否仍要求一次性完成状态集合切换、patch 重算、`_syncAttribute()` 和 update tag 提交

### 7. shared refresh 与 cache 边界是否仍受控

重点看：

- shared refresh 第一版是否仍只做观测
- 是否仍然没有跨图元 resolver 输出缓存
- 是否没有借 Phase 4 重开 Phase 2/3 主模型

### 8. 实施材料是否已可执行

重点看：

- `D3_PHASE4_IMPLEMENTATION_GUIDE.md`
- `D3_PHASE4_DEVELOPER_PROMPT.md`
- `D3_PHASE4_EXECUTION_PROMPT.md`

确认它们是否已经把 stop-and-feedback 条件、测试矩阵、完成定义和禁止事项写清，而不是把关键架构判断留给开发者。

## 真实验证场景

请用以下场景验证设计：

### 场景 A：5k~50k 纯视觉联动

只改 `fill / opacity / shadowColor`，应允许进入 deferred，并能看到 job/yield/每帧处理量。

### 场景 B：混合几何状态

存在 `lineWidth / width / height` 时，不得进入 deferred，并且能看到 ineligible reason。

### 场景 C：shared refresh 高峰

Group shared definitions 变化时，应可观测 `queued / flushed / renderScheduled / sharedRefreshCost`，但不默认分帧。

### 场景 D：连续交互覆盖旧意图

旧 pending intent 不得迟到覆盖新状态，最后一次意图必须胜出。

### 场景 E：相同状态意图但不同 owner/config

不同 Group / Layer / Stage 生效上下文下，不得错误合并成同一 job。

## 输出格式要求

请严格按以下格式输出：

### Blocking findings

按严重级别排序。每条必须包含：

- 结论
- 为什么与期望文档或当前 Phase 4 边界冲突
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
- 不要给“方向对”“整体不错”这类低信息量评价
- 如果你认为某一设计点合理，也请说明为什么它没有违反期望文档
