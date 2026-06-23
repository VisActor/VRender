# D3 Phase 3 总监评审 Prompt

你现在扮演 VRender D3 重构项目的总监 reviewer。  
请对当前 Phase 3 设计包做一次**严格的架构评审**，目标不是泛泛总结，而是判断这套 `Group-first` 共享状态定义设计是否已经可以进入实现。

## 你的评审原则

请严格遵守以下原则：

1. **以期望文档为最高约束**。如果架构文档、实施任务文档、开发者 prompt 与期望文档冲突，以期望文档为准。
2. **共享定义 ownership 必须收敛到共享层**。`Group / Theme / 模板层` 才是目标放置位置，图元实例不应重新接管 shared-state 主设计。
3. **实例级同名覆写不是目标模型**。局部特殊逻辑只能通过 resolver 这类 escape hatch 解决，不能把实例级 `stateProxy` 重新带回 shared-state 主路径。
4. **refresh 语义必须闭环**。不能接受“先 bump revision，之后某次交互再说”的模糊设计；已激活图元必须有明确刷新契约。
5. **性能边界必须可推理**。active descendants refresh、compile cache、fallback 收口都必须有明确成本模型，不能靠全量扫描兜底。

## 请阅读以下文件

1. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/graphic-state-animation-refactor-expectation.md`
2. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_ARCH_DESIGN.md`
3. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE3_SHARED_STATE_DESIGN.md`
4. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE3_IMPLEMENTATION_GUIDE.md`
5. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE3_DEVELOPER_PROMPT.md`
6. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE3_REVIEW_NOTES.md`

## 项目上下文

- Phase 2 已 closed，静态真值已经收敛到 `baseAttributes + resolvedStatePatch -> attribute`
- 当前评审的是 Phase 3：`Group-first + Theme 只读上游来源`
- `Group` 被拍板为 shared-state 主 owner
- `Theme` 不作为 runtime owner，而是通过 `stage.rootSharedStateScope` 承接
- active graphics 已拍板采用多 scope 注册
- refresh 已拍板复用 render 前 hook，不引入独立 scheduler
- `graphic.states` 仅允许作为 missing-state fallback
- resolver 保留为实例 escape hatch；实例级 `stateProxy` 不再作为 shared-state 常规能力
- Glyph 继续单列为 Phase 3 决策项，不进入本轮主路径

## 你必须重点审的内容

### 1. ownership 是否真正闭环

判断当前文档是否已经真正把 shared-state ownership 收口到：

```ts
Theme.stateDefinitions
  -> stage.rootSharedStateScope
  -> outer Group scope
  -> inner Group scope
  -> Graphic 消费 effective compiled view
```

重点看：

- `Group` 是否已经是 shared-state 主 owner
- `Theme` 是否只保留只读默认来源角色
- 无祖先 `Group` 的图元是否也能稳定消费 Theme 默认状态定义

### 2. precedence 与 effective compiled view

重点看：

- `近层 Group > 外层 Group > Theme` 是否已经写成唯一 precedence
- `SharedStateScope` 是否真的持有 effective source / effective compiled view
- lookup 是否已经摆脱“运行时临时拼接 parent/theme 定义”

### 3. active descendants 注册与 refresh contract

重点看：

- active graphic 是否注册到整个 scope 链，而不只是最近绑定 scope
- outer Group shared definitions 变化时，是否能定位 inner active graphics
- refresh 是否明确要求“下一次 render 前完成”
- refresh 是否复用了既有 render 前 hook，而不是引入新的隐式调度点

### 4. 成本模型是否成立

重点看：

- 共享定义变更是否避免扫描全部 descendants
- active refresh 是否控制在 `O(active descendants in changed scope subtree)`
- 图元激活/解绑是否明确承担 `O(scope depth)` 成本
- resolver cache 是否仍被严格限制为 `per-graphic`

### 5. `graphic.states` fallback 是否仍只有一套语义

重点看：

- fallback 是否只补 shared scope miss 的 state
- fallback state 是否重新编译进同一套 compiled view
- 是否还残留第二套 local states 裁决逻辑

### 6. resolver 与 `stateProxy` 的边界

重点看：

- resolver 是否仍被清晰保留为实例级 escape hatch
- shared-state 命中的同名 state 是否已禁止被实例级 `stateProxy` 接管
- 如果文档提到 legacy compatibility，是否明确限制在非推荐路径

### 7. Glyph 是否被正确隔离

重点看：

- Glyph 是否继续被单列为 Phase 3 决策项
- 本轮 shared-state 实施文档是否没有把 glyph 当作正常扩展面

### 8. 实施任务文档和开发者 prompt 是否已可执行

重点看：

- 是否已经把实现前提写死，而不是留给开发者临场判断
- 是否仍残留“实现时再看”的架构空洞
- 是否已经把 stop-and-feedback 条件写清

## 真实验证场景

请用以下场景验证设计：

### 场景 A：外层 Group 默认 hover

外层 Group 定义 `hover.fill = red`，内层 Group 无同名定义，子图元进入 `hover` 后应命中外层 Group shared-state。

### 场景 B：内层 Group 覆盖外层同名状态

外层 Group 定义 `selected.opacity = 0.5`，内层 Group 定义 `selected.opacity = 1`，子图元进入 `selected` 时应命中最近祖先 Group。

### 场景 C：无 Group 场景下 Theme 默认状态

图元直接挂在 stage 上，Theme 定义 `hover.fill = blue`，图元进入 `hover` 时应通过 `stage.rootSharedStateScope` 生效。

### 场景 D：active descendants refresh

子图元当前处于 `hover`，外层 Group 修改了 `hover.fill`。在下一次 render 前，子图元必须完成 patch 重算和静态真值同步。

### 场景 E：missing-state fallback

shared scope 中已有 `hover`，图元本地只定义 `selected`。此时 `hover` 走 shared-state，`selected` 走 per-graphic fallback compiled view，但两者都必须进入同一套裁决模型。

## 输出格式要求

请严格按以下格式输出：

### Blocking findings

按严重级别排序。每条必须包含：

- 结论
- 为什么与期望文档或当前 Phase 3 边界冲突
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
