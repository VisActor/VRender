# D3 Phase 3 实施任务文档 — Group-first 共享状态定义

> **目标读者**：资深开发者
> **面向文档**：`D3_ARCH_DESIGN.md`（v1.10） + `D3_PHASE3_SHARED_STATE_DESIGN.md`（v0.2）
> **阶段**：Phase 3 — Group-first 共享状态定义
> **状态**：已关闭（主体实现、review fixup 与 close-out 全部完成）

---

## 文档使用说明

本文档是 Phase 3 的直接实施依据。Phase 3 不是继续扩张 Phase 2 的属性分层，而是在 Phase 2 已闭环的真值模型上，把**共享状态定义 ownership、precedence、compile cache、invalidation、refresh contract** 收口到 `Group-first` 模型。

开始实施前请先阅读：

1. `docs/refactor/state-engine/graphic-state-animation-refactor-expectation.md`
2. `docs/refactor/state-engine/D3_ARCH_DESIGN.md`
3. `docs/refactor/state-engine/D3_PHASE3_SHARED_STATE_DESIGN.md`
4. 本文档完整内容

---

## Phase 3 目标

Phase 3 完成后，VRender 的 shared-state 主路径必须收敛到：

```ts
Theme.stateDefinitions  --只读默认来源-->
stage.rootSharedStateScope
  -> outer Group scope
  -> inner Group scope
  -> Graphic 消费 effective compiled view
  -> StateEngine 计算 resolvedStatePatch
  -> baseAttributes + resolvedStatePatch -> attribute
```

完成后必须满足：

1. `Group` 是 shared-state 的主 owner。
2. `Theme` 只作为只读上游默认来源，不直接承担 runtime owner 角色。
3. 无祖先 `Group` 的图元也能通过 `stage.rootSharedStateScope` 消费 Theme 默认状态定义。
4. `graphic.states` 仅作为 missing-state fallback，但进入与 shared-state 相同的裁决管线。
5. resolver 输出缓存严格是 `per-graphic cache`，不能跨图元共享。
6. Group shared definitions 变更后，当前 active descendants 必须在下一次 render 前完成 refresh。
7. active descendants 的成本模型必须稳定在：
   - 共享定义变更：`O(active descendants in changed scope subtree)`
   - 图元激活/解绑：`O(scope depth)`
8. `stateProxy` 不得继续作为 shared-state 常规路径能力。

---

## 已确认的架构决策

以下不是开放讨论项，默认按此执行。

### 决策 1：Group-first ownership

- `Group.sharedStateDefinitions` 是 shared-state 的主 authoring 入口
- 最近祖先 `Group` 优先级最高
- 外层 `Group` 与 `Theme` 只提供上游默认来源

### 决策 2：Theme 只读来源由 synthetic root scope 承接

- `Theme` 不是 runtime owner
- `Stage` 持有 `rootSharedStateScope`
- 顶层 `Group.parentScope = stage.rootSharedStateScope`
- 无祖先 `Group` 的图元直接绑定 `stage.rootSharedStateScope`

### 决策 3：SharedStateScope 持有 effective compiled view

- scope 不只持有本地定义
- scope 必须持有按 `近层 Group > 外层 Group > Theme` 展开的 `effectiveSourceDefinitions`
- 同时持有对应的 `effectiveCompiledDefinitions`

### 决策 4：active descendants 采用多 scope 注册

- active graphic 注册到 `boundSharedStateScope` 以及其所有 ancestor scopes
- 外层 `Group` 变更时，可直接定位整个 subtree 的 active graphics
- 不再单独设计另一套 subtree 聚合表

### 决策 5：refresh 固定复用 render 前 hook

- 不引入独立 shared-state refresh scheduler
- active descendants refresh 必须在下一次 render 前完成

### 决策 6：`graphic.states` 只做 missing-state fallback

- 只允许补 shared scope 中不存在的 state 名
- 同名 state 由 shared scope 胜出
- fallback state 必须重新编译进同一套 `CompiledStateDefinition` 和同一套裁决管线

### 决策 7：resolver 是实例级 escape hatch

- resolver 可以继续保留
- resolver 输出缓存不能跨图元共享
- resolver 输出并入 `resolvedStatePatch`

### 决策 8：实例级 `stateProxy` 退出 shared-state 主路径

- shared-state 命中的同名 state 不再允许被实例级 `stateProxy` fully decides
- 如保留 compatibility，只能作为 legacy 模式，不能进入推荐设计

### 决策 9：Glyph 不在本轮主路径

- Phase 3 不继续扩 glyph 专属状态语义
- Glyph ownership 单列决策
- 在拍板前不把 glyph 当作 shared-state 的正常扩展面

---

## 四个必须写死的实现前提

### 前提 1：resolver 缓存边界

固定要求：

1. `SharedStateScope` 只缓存编译后的定义元数据
2. resolver 输出缓存是 `per-graphic cache`
3. resolver cache key 至少绑定：
   - `boundSharedStateRevision`
   - `activeStates/effectiveStates key`
   - `localFallbackVersion`
   - `resolverEpoch`
4. shared definitions 变更、fallback 变化、`invalidateResolver()`、相关 `baseAttributes` 变化都必须触发失效

### 前提 2：已激活图元刷新机制

固定要求：

1. `Group.sharedStateDefinitions` 变化后，不能只 bump revision 等待未来某次交互
2. 当前 active descendants 必须在下一次 render 前完成 refresh
3. refresh 固定复用现有 render 前 hook
4. refresh 时必须：
   - `ensureSharedStateScopeFresh(boundScope)`
   - 重新计算 `effectiveStates / resolvedStatePatch`
   - 走静态真值同步路径

### 前提 3：active descendants 成本模型

固定要求：

1. 共享定义变更不扫描全部后代
2. 只对 changed scope subtree 中的 active descendants 做 eager refresh
3. 图元激活/解绑承担 `O(scope depth)` 的多 scope 注册成本
4. inactive descendants 保持 lazy refresh

### 前提 4：`graphic.states` fallback 收口策略

固定要求：

1. `graphic.states` 不是 ownership 层，只是 compatibility fallback
2. fallback state 一旦补入，必须重新编译为 per-graphic effective compiled view
3. `StateEngine` 消费这份 compiled view，而不是走第二套本地旧逻辑
4. 同名 shared-state 与 local fallback 冲突时，shared-state 胜出

---

## 实施文件范围

### 必改文件

| 文件 | 责任 |
|------|------|
| `packages/vrender-core/src/graphic/group.ts` | `Group.sharedStateDefinitions` owner、scope 重建、子树 active refresh 入口 |
| `packages/vrender-core/src/core/stage.ts` | `rootSharedStateScope` 承接、render 前 refresh 调度 |
| `packages/vrender-core/src/graphic/graphic.ts` | scope 绑定、active 注册、fallback 编译路径、refresh 入口 |
| `packages/vrender-core/src/graphic/state/state-engine.ts` | shared compiled view 消费、resolver cache key 扩展 |
| `packages/vrender-core/src/graphic/state/state-definition-compiler.ts` | shared-state / fallback 共用编译输入与编译输出 |
| `packages/vrender-core/src/graphic/theme.ts` | Theme 默认状态定义对接 root scope 的只读来源 |
| `packages/vrender-core/src/interface/graphic/group.ts` | Group shared-state 能力声明 |
| `packages/vrender-core/src/interface/graphic.ts` | Graphic shared-state runtime 字段声明 |
| `packages/vrender-core/src/interface/stage.ts` | `rootSharedStateScope` / refresh hook 等接口声明 |

### 建议新增文件

| 文件 | 责任 |
|------|------|
| `packages/vrender-core/src/graphic/state/shared-state-scope.ts` | `SharedStateScope` 类型、scope 构建、effective view 重建 |
| `packages/vrender-core/src/graphic/state/shared-state-refresh.ts` | `ensureSharedStateScopeFresh()`、active refresh 辅助逻辑 |

### 必测文件

| 文件 | 说明 |
|------|------|
| `packages/vrender-core/__tests__/unit/graphic/shared-state-scope.test.ts` | Group/Theme/root scope precedence |
| `packages/vrender-core/__tests__/unit/graphic/shared-state-refresh.test.ts` | active descendants refresh 契约 |
| `packages/vrender-core/__tests__/unit/graphic/shared-state-fallback.test.ts` | `graphic.states` missing-state fallback 收口 |
| `packages/vrender-core/__tests__/unit/graphic/shared-state-resolver-cache.test.ts` | resolver per-graphic cache 边界 |
| `packages/vrender-core/__tests__/unit/graphic/group-state-invalidation.test.ts` | Group 变更 -> subtree active refresh |

---

## 推荐实施切分

### Task 1：建立 root scope 与 Group scope 基础设施

**目标**：把 `Theme -> root scope -> Group scope` 的 ownership 链建立起来。

**必须完成**：

1. 在 `Stage` 上引入 `rootSharedStateScope`
2. 在 `Group` 上引入 `sharedStateDefinitions`
3. 定义 `SharedStateScope` 的 effective source / compiled view 结构
4. 顶层 `Group.parentScope` 指向 `stage.rootSharedStateScope`

**验收标准**：

- 无祖先 `Group` 的图元也能绑定有效 shared scope
- root scope 只承接 Theme 默认来源，不成为新的 authoring 入口

### Task 2：闭环 effective compiled view 与 precedence

**目标**：把 `近层 Group > 外层 Group > Theme` 写成唯一 precedence。

**必须完成**：

1. scope 持有 `effectiveSourceDefinitions`
2. scope 持有 `effectiveCompiledDefinitions`
3. scope 记录 `parentRevisionAtBuild`
4. parent revision 变化时，bound scope 可重建 effective view

**验收标准**：

- lookup 不再在运行时临时拼接 parent/theme 定义
- 同一 revision 内，同一 scope 不重复重编译

### Task 3：Graphic scope binding 与多 scope active 注册

**目标**：让 active descendants refresh 有真实注册基础。

**必须完成**：

1. `Graphic` 绑定最近祖先 `Group` scope，或 fallback 到 `stage.rootSharedStateScope`
2. active graphic 注册到 scope 链上的所有 ancestor scopes
3. `registeredActiveScopes` 用于后续解绑 / reparent / detach
4. inactive graphic 不进入 active registry

**验收标准**：

- 外层 `Group` 变更时能定位到内层 active graphics
- reparent 后旧 scope 链与新 scope 链注册都正确

### Task 4：共享定义变更后的 refresh 契约

**目标**：保证 active descendants 不会长期停留在旧 shared-state 结果。

**必须完成**：

1. `Group.sharedStateDefinitions` 变化时重建 scope effective view
2. bump `scope.revision`
3. 标记 `subtreeActiveDescendants` 为 `sharedStateDirty`
4. render 前 hook 中执行 refresh
5. refresh 通过 `ensureSharedStateScopeFresh()` 递归保证 parent scope fresh

**验收标准**：

- 当前 active descendants 在下一次 render 前完成 patch 重算和静态真值同步
- 不引入独立 refresh scheduler

### Task 5：`graphic.states` missing-state fallback 收口

**目标**：避免 shared-state 与本地 fallback 形成两套语义。

**必须完成**：

1. 识别 shared scope 未命中的 local states
2. 构造 per-graphic `effectiveSourceDefinitions`
3. 使用同一个 `StateDefinitionCompiler` 生成 per-graphic `effectiveCompiledDefinitions`
4. `StateEngine` 统一消费 compiled view
5. 同名 shared-state 覆盖 local fallback

**验收标准**：

- fallback state 参与同一套 `priority / rank / exclude / suppress / effectiveStates / resolvedPatch`
- 不再存在第二套 local states 裁决逻辑

### Task 6：resolver cache boundary 与 compatibility 收口

**目标**：把 resolver 和 legacy compatibility 的边界收紧。

**必须完成**：

1. resolver cache 改成严格的 per-graphic key
2. shared revision / fallback version / resolver epoch 进入 cache key
3. shared-state 命中的同名 state 不再允许实例级 `stateProxy` 接管
4. 如保留 legacy `stateProxy`，明确限缩为 compatibility 模式

**验收标准**：

- resolver 输出不跨图元共享
- `stateProxy` 不再出现在 shared-state 主路径文义中

### Task 7：测试、验证与文档回填

**目标**：用最小但充分的测试矩阵证明 Phase 3 闭环。

**必须完成**：

1. root scope / Group scope precedence 测试
2. active descendants refresh 测试
3. `graphic.states` missing-state fallback 测试
4. resolver per-graphic cache 测试
5. reparent / detach / destroy 注册变更测试
6. 文档与实现一致性回填

**验收标准**：

- Phase 3 的 4 个实现前提都有专项测试对应
- 文档和实现没有“设计说一套、代码另一套”的漂移

---

## 三个必须优先解决的风险点

### 风险 1：scope ownership 失真

如果 root scope、Group scope、Graphic binding 三者之间没有唯一链路，Phase 3 会重新退化成“定义来源散落多处”的旧问题。

### 风险 2：refresh 语义不闭环

如果 shared definitions 变化只 bump revision，而不安排 active descendants refresh，已激活图元会长期停留在旧结果。

### 风险 3：fallback 回到第二套本地语义

如果 `graphic.states` 只是 lookup miss 时临时补丁，而不是重新编译进同一套 compiled view，shared-state 与 fallback state 会形成两套裁决模型。

---

## 关键校验场景

请在实现和测试时始终对照以下场景：

### 场景 A：外层 Group 提供默认 hover

外层 Group 定义 `hover.fill = red`，内层 Group 没有同名定义，子图元进入 `hover` 后应消费外层 Group 的 shared-state。

### 场景 B：内层 Group 覆盖外层同名状态

外层 Group 定义 `selected.opacity = 0.5`，内层 Group 定义 `selected.opacity = 1`。子图元进入 `selected` 时应命中最近祖先 Group 的定义。

### 场景 C：没有祖先 Group 但 Theme 有默认状态

图元直接挂在 stage 上，Theme 提供 `hover.fill = blue`。图元进入 `hover` 时应通过 `stage.rootSharedStateScope` 生效。

### 场景 D：Group shared definitions 变化时的 active refresh

子图元当前处于 `hover`，外层 Group 修改了 `hover.fill`。在下一次 render 前，图元必须完成 patch 重算和属性同步。

### 场景 E：local fallback 只补 missing state

shared scope 中已有 `hover`，图元本地 `states` 只定义 `selected`。此时 `hover` 走 shared-state，`selected` 走 per-graphic fallback compiled view，但两者都进入同一裁决模型。

---

## 实现边界

以下事情你可以做：

- 改 `group.ts`、`stage.ts`、`graphic.ts`、`state-engine.ts`
- 新增 shared-state scope / refresh 辅助文件
- 调整 Theme 默认来源接入点
- 新增 shared-state 专项测试

以下事情这次不要做：

- 把 Theme 提升成完整 runtime owner
- 引入分帧 refresh scheduler
- 继续扩展实例级 `stateProxy` 主路径能力
- 处理 Glyph ownership 的最终实现
- 借机整体重写状态动画系统

---

## 何时必须先停下来反馈

如果遇到以下任一情况，不要自行降级，先反馈：

1. 无法在不扫描全部 descendants 的前提下实现 active refresh
2. root scope 无法与现有 `Stage/Group` 继承关系兼容
3. `graphic.states` fallback 无法进入同一套编译与裁决管线
4. resolver cache 需要跨图元共享才能工作
5. 发现 Glyph 必须先并回主路径，Phase 3 其余任务才能成立

---

## 验证要求

最低要求：

1. `rush compile -t @visactor/vrender-core`
2. shared-state 相关专项测试通过
3. 至少覆盖：
   - root scope / Group scope precedence
   - active descendants refresh
   - `graphic.states` fallback 统一裁决
   - resolver per-graphic cache
   - reparent / detach / destroy 注册更新

---

## 完成定义

满足以下条件，Phase 3 才能进入实现完成态：

1. `Group-first + Theme root scope` ownership 闭环成立
2. active descendants refresh 契约成立
3. `graphic.states` fallback 进入同一裁决管线
4. resolver cache 边界被严格限制在 per-graphic
5. shared-state 主路径不再依赖实例级 `stateProxy`
6. Glyph 仍被明确隔离在 Phase 3 主路径之外
7. 文档、测试、实现语义一致

---

**执行原则**：Phase 3 先把 ownership、refresh 与 compile/cache 做对，不追求一步做完 Theme 完整 owner 或 Phase 4 的性能形态。  
**如果实现过程中发现现有 Group/Stage 结构无法承接 root scope，请先反馈，不要把 Theme 偷偷升级成 runtime owner。**
