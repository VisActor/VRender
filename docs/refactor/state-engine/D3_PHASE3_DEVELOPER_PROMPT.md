# D3 Phase 3 开发者沟通 Prompt — Group-first 共享状态定义

> **目标读者**：资深开发者
> **沟通目的**：基于 Phase 2 已 closed 状态，执行 Phase 3
> **设计基线**：`D3_ARCH_DESIGN.md`（v1.10） + `D3_PHASE3_SHARED_STATE_DESIGN.md`（v0.2）
> **状态**：已关闭（保留为历史开发入口归档）

---

## 背景

Phase 2 已完成并 closed，当前已具备：

- `baseAttributes + resolvedStatePatch -> attribute`
- `StateEngine` authoritative patch 主路径
- `resolver cache` 与 `invalidateResolver()` 基础能力
- `paint-only / bounds / pick` 的 Phase 2 提交边界
- Phase 3 的正式设计基线：[D3_PHASE3_SHARED_STATE_DESIGN.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE3_SHARED_STATE_DESIGN.md)

Phase 3 的目标不是继续扩展实例级状态能力，而是把**共享状态定义**收敛到 `Group-first` 模型。

---

## Phase 3 最终目标

把 shared-state 主路径收敛到：

```ts
Theme.stateDefinitions
  -> stage.rootSharedStateScope
  -> Group shared scopes
  -> Graphic 消费 effective compiled view
  -> StateEngine 计算 resolvedStatePatch
```

完成后必须满足：

1. `Group` 是 shared-state 主 owner
2. `Theme` 只作为只读默认来源，由 `stage.rootSharedStateScope` 承接
3. `Graphic` 默认不再持有完整状态定义
4. `graphic.states` 只做 missing-state fallback，但进入同一裁决管线
5. resolver 输出缓存严格是 `per-graphic`
6. Group shared definitions 变化后，active descendants 在下一次 render 前完成 refresh
7. shared-state 主路径不再把实例级 `stateProxy` 当作常规能力

---

## 已确认的决策

以下不是开放讨论项，默认按此执行：

### 1. Group-first ownership

- `Group.sharedStateDefinitions` 是 shared-state 的主 authoring 入口
- precedence 固定为：`近层 Group > 外层 Group > Theme`

### 2. Theme root scope 承接

- `Theme` 不是 runtime owner
- `Stage` 持有 synthetic `rootSharedStateScope`
- 顶层 `Group` 和无 Group 图元都通过它接收 Theme 默认状态定义

### 3. active descendants 多 scope 注册

- active graphic 注册到 `boundSharedStateScope` 以及所有 ancestor scopes
- 这样外层 `Group` 变更时，可以直接定位整个 subtree 的 active graphics

### 4. refresh 调度点

- 固定复用现有 render 前 hook
- 不引入独立 shared-state refresh scheduler

### 5. `graphic.states` fallback

- 只允许补 shared scope 中不存在的 state 名
- 同名 state 由 shared scope 胜出
- fallback state 必须重新编译进同一套 compiled view

### 6. resolver cache

- scope 只缓存编译元数据
- resolver 输出缓存只允许 `per-graphic`
- shared revision / fallback version / resolver epoch 进入 cache key

### 7. `stateProxy`

- 不继续作为 shared-state 主路径能力支持
- 如保留 legacy compatibility，也不能进入推荐实现

### 8. Glyph

- 继续单列为 Phase 3 决策项
- 本轮不继续扩 glyph 专属状态语义

---

## 你需要完成的任务

请严格按 [D3_PHASE3_IMPLEMENTATION_GUIDE.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE3_IMPLEMENTATION_GUIDE.md) 执行。核心任务如下：

1. 建立 `stage.rootSharedStateScope` 与 `Group.sharedStateDefinitions`
2. 闭环 `effectiveSourceDefinitions + effectiveCompiledDefinitions`
3. 建立 Graphic scope binding 与多 scope active 注册
4. 落地 Group 变更后的 active descendants refresh 契约
5. 收口 `graphic.states` missing-state fallback，使其进入同一裁决管线
6. 收紧 resolver cache 边界与 `stateProxy` compatibility
7. 建立专项测试矩阵

---

## 三个必须优先解决的风险点

### 风险 1：outer Group 看不到 inner active graphics

如果 active 注册只发生在最近绑定 scope，上层 Group shared definitions 变更时就无法刷新整个 subtree 的 active graphics。  
Phase 3 已拍板使用多 scope 注册，不允许退回“只注册最近 scope”的实现。

### 风险 2：无 Group 场景下 Theme 语义失效

如果没有 `stage.rootSharedStateScope`，Theme 的只读默认来源会在无 Group 场景下失去 runtime 承接点。  
不允许用“没有 Group 就没有 shared-state”来规避。

### 风险 3：fallback 回到第二套本地语义

如果 `graphic.states` 只是 lookup miss 时临时补 patch，而不是重新编译进 per-graphic effective compiled view，shared-state 与 local fallback 会形成两套语义。  
这是 blocker。

---

## 关键校验场景

请在实现和测试时始终对照以下场景：

### 场景 A：外层 Group 默认状态

外层 Group 定义 `hover.fill = red`，内层 Group 没有同名定义，子图元进入 `hover` 后应命中外层 Group shared-state。

### 场景 B：内层 Group 覆盖外层同名状态

外层 Group 定义 `selected.opacity = 0.5`，内层 Group 定义 `selected.opacity = 1`，子图元进入 `selected` 时应命中最近祖先 Group。

### 场景 C：无 Group 但 Theme 有默认状态

图元直接挂在 stage 上，Theme 提供 `hover.fill = blue`，图元进入 `hover` 时应通过 `rootSharedStateScope` 生效。

### 场景 D：active descendants refresh

子图元当前处于 `hover`，外层 Group 修改了 `hover.fill`，在下一次 render 前必须完成 patch 重算和静态真值同步。

### 场景 E：missing-state fallback

shared scope 中已有 `hover`，图元本地只定义 `selected`。此时 `hover` 走 shared-state，`selected` 走 fallback compiled view，但两者都进入同一套裁决模型。

---

## 实现边界

以下事情你可以做：

- 改 `group.ts`、`stage.ts`、`graphic.ts`、`state-engine.ts`
- 新增 shared-state scope / refresh 辅助文件
- 调整 Theme 默认来源接入点
- 新增 shared-state 专项测试

以下事情这次不要做：

- 把 Theme 升级成完整 runtime owner
- 做独立 shared-state refresh scheduler
- 把实例级 `stateProxy` 重新带回主路径
- 处理 Glyph ownership 的最终实现
- 借机重开 Phase 2 的真值模型

---

## 提交前必须确认

在你准备提交实现前，请确保以下问题都有明确答案：

1. `rootSharedStateScope` 是否真的承接了无 Group 场景下的 Theme 默认来源？
2. active graphic 是否注册到了整个 scope 链，而不只是最近绑定 scope？
3. outer Group shared definitions 变化时，是否能定位并刷新 inner active graphics？
4. refresh 是否固定发生在 render 前，而不是等未来交互？
5. `graphic.states` fallback 是否已重新编译进同一套 compiled view？
6. resolver 输出是否仍然严格是 `per-graphic cache`？
7. shared-state 命中的同名 state 是否还会被实例级 `stateProxy` 接管？
8. Glyph 是否仍被明确隔离在本轮主路径之外？

---

## 何时必须先停下来反馈

如果遇到以下任一情况，不要自行降级，先反馈：

1. 无法在 `O(active descendants)` 范围内完成 shared definitions 变更刷新
2. root scope 与现有 Stage/Group 结构冲突，无法稳定承接 Theme 默认来源
3. `graphic.states` fallback 无法进入同一套编译与裁决管线
4. resolver cache 如果不跨图元共享就无法工作
5. 必须先处理 Glyph ownership，Phase 3 其余任务才能成立

---

## 验证要求

最低要求：

1. `rush compile -t @visactor/vrender-core`
2. shared-state 相关专项测试通过
3. 新增专项测试至少覆盖：
   - root scope / Group scope precedence
   - active descendants refresh
   - `graphic.states` fallback 统一裁决
   - resolver per-graphic cache
   - reparent / detach / destroy 注册更新

---

**执行原则**：不要在 Phase 3 中把 Theme runtime owner、Glyph ownership、Phase 4 refresh scheduler 混进主路径；先把 Group-first ownership 与 refresh 契约做对。  
**如果实现过程中发现现有 Group/Stage 结构不足以承接 root scope，请先提出，不要偷偷降低 Theme 语义。**
