# D3 Phase 3 最终执行指令

> **目标读者**：Phase 3 实现 agent
> **用途**：作为正式实现启动 prompt
> **设计基线**：`D3_PHASE3_SHARED_STATE_DESIGN.md`（v0.2） + `D3_ARCH_DESIGN.md`（v1.10）
> **状态**：已执行完成，Phase 3 已 closed，作为完成定义与归档对照基线

---

## 角色与目标

你现在作为 VRender D3 重构项目的实现 agent，负责落地 Phase 3。

这不是开放式设计讨论，而是按已拍板架构执行实现。你的目标不是“做出一个大致可运行的版本”，而是交付一个满足 Phase 3 完成定义的实现。

请遵循以下原则：

1. 期望文档是最高约束。
2. shared-state ownership 必须收敛到共享层，而不是重新回到实例默认持有。
3. 实例级同名覆写不是目标模型；局部特殊逻辑只能通过 resolver 这类 escape hatch 解决。
4. refresh 语义必须闭环；不能接受“先 bump revision，之后某次交互再说”。
5. 不要把关键架构决策转回给协调者；本轮该拍板的都已拍板。

---

## 你必须先读

1. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/graphic-state-animation-refactor-expectation.md`
2. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE3_EXECUTION_PROMPT.md`
3. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE3_SHARED_STATE_DESIGN.md`
4. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_ARCH_DESIGN.md`
5. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE3_IMPLEMENTATION_GUIDE.md`
6. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE3_DEVELOPER_PROMPT.md`
7. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE3_REVIEW_NOTES.md`
8. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE3_IMPLEMENTATION_LOG.md`

---

## 执行依据优先级

本轮执行优先级固定如下：

1. `graphic-state-animation-refactor-expectation.md`
2. `D3_PHASE3_EXECUTION_PROMPT.md`
3. `D3_PHASE3_SHARED_STATE_DESIGN.md`
4. `D3_ARCH_DESIGN.md`
5. `D3_PHASE3_IMPLEMENTATION_GUIDE.md`
6. `D3_PHASE3_DEVELOPER_PROMPT.md`
7. `D3_PHASE3_REVIEW_NOTES.md`

如果后 4 份文档与 execution prompt 存在边角措辞冲突，以 execution prompt 为准。

---

## 已拍板的硬约束

### 1. ownership 主路径

Phase 3 的 shared-state ownership 固定为：

```ts
Theme.stateDefinitions
  -> stage.rootSharedStateScope
  -> outer Group scope
  -> inner Group scope
  -> Graphic 消费 effective compiled view
  -> StateEngine 计算 resolvedStatePatch
```

固定要求：

1. `Group` 是 shared-state 主 owner，也是唯一常规 authoring 入口。
2. `Theme` 只作为只读默认来源，不直接承担 runtime owner 角色。
3. `Stage` 持有 synthetic `rootSharedStateScope`，承接 Theme 默认来源。
4. 无祖先 `Group` 的图元直接绑定 `stage.rootSharedStateScope`。
5. `Graphic` 默认只持有：当前状态集合、scope 引用、版本信息、解析结果和少量局部缓存，不再默认持有完整状态定义。

### 2. precedence 与 effective compiled view

固定要求：

1. precedence 只有一套：`近层 Group > 外层 Group > Theme`。
2. `SharedStateScope` 必须持有 `effectiveSourceDefinitions`。
3. `SharedStateScope` 必须持有对应的 `effectiveCompiledDefinitions`。
4. lookup 不允许在运行时临时拼接 parent/theme 定义。
5. parent revision 变化后，bound scope 必须可以重建 effective view。

### 3. active descendants 注册与 refresh contract

固定要求：

1. active graphic 必须注册到 `boundSharedStateScope` 以及其所有 ancestor scopes。
2. `Graphic` 必须维护 `registeredActiveScopes`，用于 reparent / detach / destroy 时解绑。
3. `Group.sharedStateDefinitions` 变化时，必须：
   - 重建 changed scope 的 effective view
   - bump `scope.revision`
   - 标记 `subtreeActiveDescendants` 为 `sharedStateDirty`
4. refresh 固定复用现有 render 前 hook。
5. 当前 active descendants 必须在下一次 render 前完成：
   - `ensureSharedStateScopeFresh(boundScope)`
   - `effectiveStates / resolvedStatePatch` 重算
   - 静态真值同步
6. inactive descendants 保持 lazy refresh。

### 4. 成本模型

固定要求：

1. shared definitions 变更不允许扫描全部 descendants。
2. eager refresh 只允许作用于 `changed scope subtree` 下的 active descendants。
3. shared definitions 变更的目标复杂度是 `O(active descendants in changed scope subtree)`。
4. 图元激活/解绑承担 `O(scope depth)` 的多 scope 注册成本。

### 5. `graphic.states` fallback 收口

固定要求：

1. `graphic.states` 不是 ownership 层，只是 compatibility fallback。
2. fallback 只允许补 shared scope 中不存在的 state 名。
3. 同名 state 必须由 shared-state 胜出。
4. fallback state 一旦补入，必须重新编译进 per-graphic `effectiveCompiledDefinitions`。
5. `StateEngine` 只消费这一份 compiled view，不允许保留第二套 local states 裁决逻辑。

### 6. resolver 与 `stateProxy` 边界

固定要求：

1. resolver 继续保留为实例级 escape hatch。
2. resolver 输出缓存严格是 `per-graphic cache`，不能跨图元共享。
3. resolver cache key 至少绑定：
   - `boundSharedStateRevision`
   - `activeStates/effectiveStates key`
   - `localFallbackVersion`
   - `resolverEpoch`
4. shared definitions 变更、fallback 变化、`invalidateResolver()`、相关 `baseAttributes` 变化都必须触发失效。
5. shared-state 命中的同名 state 不再允许由实例级 `stateProxy` 接管。
6. 如仓库仍保留 legacy `stateProxy` compatibility，它不能进入 shared-state 主路径，也不能写成推荐模型。

### 7. 本轮禁止事项

以下事情这次不要做：

1. 把 `Theme` 提升成完整 runtime owner。
2. 引入独立 shared-state refresh scheduler。
3. 重新把实例级 `stateProxy` 带回 shared-state 主路径。
4. 处理 `Glyph ownership` 的最终实现。
5. 借机重开 Phase 2 真值模型或状态动画边界。

---

## 主要实现文件

优先关注：

- `packages/vrender-core/src/graphic/group.ts`
- `packages/vrender-core/src/core/stage.ts`
- `packages/vrender-core/src/graphic/graphic.ts`
- `packages/vrender-core/src/graphic/state/state-engine.ts`
- `packages/vrender-core/src/graphic/state/state-definition-compiler.ts`
- `packages/vrender-core/src/graphic/theme.ts`
- `packages/vrender-core/src/interface/graphic/group.ts`
- `packages/vrender-core/src/interface/graphic.ts`
- `packages/vrender-core/src/interface/stage.ts`

如有需要可新增：

- `packages/vrender-core/src/graphic/state/shared-state-scope.ts`
- `packages/vrender-core/src/graphic/state/shared-state-refresh.ts`

建议同步建立或更新测试：

- `packages/vrender-core/__tests__/unit/graphic/shared-state-scope.test.ts`
- `packages/vrender-core/__tests__/unit/graphic/shared-state-refresh.test.ts`
- `packages/vrender-core/__tests__/unit/graphic/shared-state-fallback.test.ts`
- `packages/vrender-core/__tests__/unit/graphic/shared-state-resolver-cache.test.ts`
- `packages/vrender-core/__tests__/unit/graphic/group-state-invalidation.test.ts`

---

## 实现任务

按这个顺序做：

1. 建立 `stage.rootSharedStateScope` 与 `Group.sharedStateDefinitions` 基础设施。
2. 闭环 `effectiveSourceDefinitions + effectiveCompiledDefinitions`，写死 `近层 Group > 外层 Group > Theme`。
3. 建立 `Graphic` scope binding 与多 scope active 注册。
4. 落地 Group shared definitions 变更后的 refresh contract。
5. 收口 `graphic.states` missing-state fallback，使其进入同一套编译与裁决管线。
6. 收紧 resolver cache 边界，并切断 shared-state 主路径对实例级 `stateProxy` 的依赖。
7. 建立专项测试矩阵，并同步回填实现留档。

---

## 必须验证的场景

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

### 场景 F：reparent / detach / destroy

图元重挂载、脱离父节点或销毁后，旧 scope 链注册必须被移除，新 scope 链注册必须正确建立，不能留下脏的 active registry。

---

## 过程留档要求

开发过程中，重要内容不能只停留在聊天记录里。你必须同步维护：

`/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE3_IMPLEMENTATION_LOG.md`

至少在以下时机更新：

1. 完成一个主任务时
2. 发现与设计不一致的代码现实时
3. 做出实现级取舍时
4. 遇到 blocker 或阶段性风险时
5. 完成一次关键验证时

留档要求：

1. 只记录执行信息，不重复设计文档正文。
2. 每条记录至少写清：背景、实现/结论、是否与设计有差异、影响文件、验证结果、后续动作。
3. `graphic.states` 告警策略和 `Glyph ownership` 文档拆分方式继续作为后续项跟踪，但不阻塞本轮实现。

---

## 何时必须先停下来反馈

如果遇到以下任一情况，不要自行降级，先反馈：

1. 无法在 `O(active descendants)` 范围内完成 shared definitions 变更刷新。
2. `rootSharedStateScope` 无法与现有 `Stage/Group` 结构兼容，不能稳定承接 Theme 默认来源。
3. `graphic.states` fallback 无法进入同一套编译与裁决管线。
4. resolver cache 如果不跨图元共享就无法工作。
5. 必须先处理 `Glyph ownership`，Phase 3 其余任务才能成立。
6. 需要重新允许实例级 `stateProxy` 接管 shared-state 命中的同名 state。

---

## 最低验证要求

至少执行并汇报这些：

1. `rush compile -t @visactor/vrender-core`
2. shared-state 相关专项测试
3. 新增专项测试至少覆盖：
   - root scope / Group scope precedence
   - active descendants refresh
   - `graphic.states` fallback 统一裁决
   - resolver per-graphic cache
   - reparent / detach / destroy 注册更新
4. 如实现触及额外路径，补充对应定向测试

---

## 完成定义

满足以下条件，Phase 3 才能进入“实现完成”状态：

1. `Group-first + Theme root scope` ownership 闭环成立。
2. precedence 与 effective compiled view 形成唯一主路径。
3. active descendants refresh 契约成立。
4. `graphic.states` fallback 进入同一裁决管线。
5. resolver cache 边界被严格限制在 per-graphic。
6. shared-state 主路径不再依赖实例级 `stateProxy`。
7. `Glyph` 仍被明确隔离在本轮主路径之外。
8. 文档、测试、实现语义一致，并已回填实现留档。

---

## 当前跟踪的非阻塞后续项

以下两项继续跟踪，但不阻塞本轮实现：

1. `graphic.states` missing-state fallback 的告警策略：
   - 开发模式告警
   - 或默认输出 deprecated 提示
2. `Glyph ownership` 的文档拆分方式：
   - 单独出文档
   - 或并入后续章节

如果实现过程中必须触碰这两项，请最小化改动、同步留档，并避免把它们扩大成新的架构分支。

---

## 你的输出格式

请按下面格式回复：

1. `Implementation summary`
2. `Files changed`
3. `Documentation updates`
4. `Verification`
5. `Remaining non-blocking follow-ups`
6. `Can Phase 3 be marked implemented`

要求：

- 先说明是否满足完成定义
- 如果任一完成条件不满足，直接列 blocker
- 明确引用你更新过的 implementation log 条目
- 不要把关键架构判断再抛回给协调者
