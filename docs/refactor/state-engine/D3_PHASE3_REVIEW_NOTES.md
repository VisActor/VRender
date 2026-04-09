# D3 Phase 3 评审说明

> **用途**：供协调者与总监对 Phase 3 设计包做正式评审
> **评审目标**：判断 Group-first 共享状态定义设计是否已可进入实施任务编写与开发执行
> **当前状态**：设计评审与实现复核均已完成；review verdict 保持 `Approve`，Phase 3 已关闭

---

## 本轮评审包含哪些文档

本轮评审请以以下 5 份文档为准：

1. [graphic-state-animation-refactor-expectation.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/graphic-state-animation-refactor-expectation.md)
2. [D3_ARCH_DESIGN.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_ARCH_DESIGN.md)
3. [D3_PHASE3_SHARED_STATE_DESIGN.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE3_SHARED_STATE_DESIGN.md)
4. [D3_PHASE3_IMPLEMENTATION_GUIDE.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE3_IMPLEMENTATION_GUIDE.md)
5. [D3_PHASE3_DEVELOPER_PROMPT.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE3_DEVELOPER_PROMPT.md)

其中：

- 期望文档是最高约束
- `D3_ARCH_DESIGN.md` 负责总体阶段边界
- `D3_PHASE3_SHARED_STATE_DESIGN.md` 是本轮正式设计基线
- 实施任务文档与开发者 prompt 负责把设计翻译成可执行边界

---

## 本轮评审要解决什么

这轮评审不是讨论“要不要做共享状态定义”，而是回答一个更具体的问题：

**当前这版 `Group-first + Theme 只读上游来源` 的 shared-state 设计，是否已经足够闭环，可以进入实现。**

建议把结论限定为三种：

1. `Approve`
2. `Approve with conditions`
3. `Request changes`

---

## 本轮评审结论

本轮总监 review 结论为 `Approve`，且在 request-changes fixup 收口后仍保持有效。

结论含义：

1. Phase 3 文档包已经可以作为正式开发基线继续推进
2. 当前保留的仅是非阻塞后续问题，不再构成进入实现的前置条件
3. 实施任务文档和开发者 prompt 不应再以“待评审”状态继续流转
4. Phase 3 主体实现后续已通过架构复核，close-out 已完成，不重新打开设计讨论

---

## 本轮相对 Phase 2 的核心变化

Phase 2 已把静态真值收敛到：

`baseAttributes + resolvedStatePatch -> attribute`

Phase 3 在这个基础上只改变一件事：

**状态定义从“实例默认持有”切到“shared scope 编译结果 + 必要的 missing-state fallback”。**

本轮设计新增并拍板了 8 个关键点：

1. `Group` 是 shared-state 的主 owner
2. `Theme` 只作为只读默认来源，不作为直接 runtime owner
3. `Stage.rootSharedStateScope` 作为 synthetic root scope 承接 Theme 来源
4. `SharedStateScope` 持有 effective source / effective compiled view
5. active graphics 采用多 scope 注册，而不是只注册最近绑定 scope
6. refresh 固定复用 render 前 hook，不引入独立 scheduler
7. `graphic.states` 只做 missing-state fallback，但必须进入同一套裁决管线
8. resolver 保留为实例 escape hatch；实例级 `stateProxy` 退出 shared-state 主路径

---

## 必须重点审的 7 个问题

### 1. ownership 是否真的闭环

评审时重点看：

- `Group` 是否已经是主 owner
- `Theme` 是否只保留只读默认来源角色
- `Stage.rootSharedStateScope` 是否把无 Group 场景补齐

### 2. precedence 与 effective compiled view 是否可信

评审时重点看：

- `近层 Group > 外层 Group > Theme` 是否已经写成唯一 precedence
- scope 是否真的持有 effective compiled view，而不是 lookup 时临时拼

### 3. active descendants 注册与 refresh 是否闭环

评审时重点看：

- active graphic 是否注册到整个 scope 链
- outer Group 变化时是否能看到 inner active graphics
- refresh 是否明确发生在下一次 render 前

### 4. 成本模型是否成立

评审时重点看：

- 共享定义变更是否避免扫描全部 descendants
- active refresh 是否控制在 `O(active descendants in changed scope subtree)`
- 多 scope 注册的成本是否明确为 `O(scope depth)`

### 5. `graphic.states` fallback 是否仍然只有一套语义

评审时重点看：

- fallback 是否只补 shared scope miss 的 state
- fallback state 是否重新编译进同一套 compiled view
- 是否还残留第二套 local states 裁决逻辑

### 6. resolver 与 `stateProxy` 的边界是否清楚

评审时重点看：

- resolver 输出缓存是否被明确限制为 `per-graphic`
- `stateProxy` 是否已经退出 shared-state 主路径
- legacy compatibility 是否被限制在非推荐路径

### 7. Glyph 边界是否被隔离干净

评审时重点看：

- Glyph 是否继续被单列为 Phase 3 决策项
- 本轮 shared-state 实施是否没有把 glyph 当作正常扩展面

---

## 建议的评审流程

### Step 1：先对照期望文档

先看当前 Phase 3 是否仍然符合这些核心约束：

- 共享状态定义优先放在 Group/Theme/模板等共享层
- 图元实例主要只持有当前状态、解析结果和少量缓存
- 实例级同名覆写不是目标模型
- 局部特殊逻辑通过 resolver 逃生口解决

### Step 2：再审 ownership 与 refresh contract

这是本轮最关键的部分。要先判断：

- root scope 是否补齐无 Group 场景
- active descendants 多 scope 注册是否真的闭环
- render 前 refresh 是否足够收口语义

### Step 3：最后审开发者是否能直接执行

重点看：

- 实施任务文档是否已经拆成具体任务
- 开发者 prompt 是否还把关键决策抛回给实现者
- 是否还残留“实现时再看”的架构空洞

---

## 建议评审输出格式

建议输出统一为：

1. `Blocking findings`
2. `Non-blocking risks`
3. `Open questions`
4. `Verdict`

其中 `Blocking findings` 请优先说明：

- 结论
- 为什么与期望或设计边界冲突
- 应如何修

---

## 建议通过门槛

只有同时满足以下条件，才建议给出 `Approve` 或 `Approve with conditions`：

1. `Group-first + Theme root scope` ownership 闭环成立
2. active descendants refresh 契约成立
3. `graphic.states` fallback 已进入同一裁决管线
4. resolver cache 边界已被严格限制在 per-graphic
5. shared-state 主路径不再依赖实例级 `stateProxy`
6. Glyph 已被隔离在本轮 shared-state 主路径之外
7. 实施任务文档和开发者 prompt 没有把关键架构判断留给开发者

只要其中任一项仍是“实现时再看”，更合理的结论应是 `Request changes`。

---

## 当前建议给评审会的预期结论

我建议本轮评审优先判断这 5 个闭环是否已成立：

1. root scope 是否把 Theme 只读来源补齐
2. 多 scope active 注册是否把 outer Group -> inner active graphics 的可见性补齐
3. `graphic.states` missing-state fallback 是否已被统一编译进同一套裁决管线
4. resolver cache 与 `stateProxy` 的边界是否足够硬
5. Glyph 是否真的被隔离为 Phase 3 后续决策项

这 5 点若都成立，本轮设计就可以作为 Phase 3 正式基线继续推进。

---

## 附：评审时可直接对照的验证场景

### 场景 A：外层 Group 默认 hover

外层 Group 定义 `hover.fill = red`，内层 Group 无同名定义，子图元进入 `hover` 后应命中外层 Group。

### 场景 B：内层 Group 覆盖外层同名状态

内层 Group 定义 `selected.opacity = 1`，应覆盖外层 Group 的 `selected.opacity = 0.5`。

### 场景 C：无 Group 场景下 Theme 默认状态

图元直接挂在 stage 上，Theme 定义 `hover.fill = blue`，应通过 `rootSharedStateScope` 生效。

### 场景 D：active descendants refresh

外层 Group shared definitions 变化时，inner active graphic 必须在下一次 render 前完成 refresh。

### 场景 E：missing-state fallback

shared scope 中已有 `hover`，图元本地只定义 `selected`，两者都必须进入同一套裁决模型。

只要这些场景里有任一项无法稳定回答，设计就还不能进入实现。
