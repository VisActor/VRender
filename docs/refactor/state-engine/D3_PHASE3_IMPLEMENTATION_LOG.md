# D3 Phase 3 实现留档

> **用途**：记录 Phase 3 实现过程中的关键发现、实现取舍、blocker、验证结果
> **维护者**：Phase 3 实现 agent
> **状态**：已关闭（实现、复核、close-out 全部完成）

---

## 使用要求

本文件不是可选附件，而是 Phase 3 执行过程的一部分。

这不是设计文档的副本。不要在这里重复 ownership、precedence 或 refresh 方案正文；这里只记录执行过程中真正影响实现和验收的信息。

以下内容必须留档：

1. 任务分段完成情况
2. 与设计文档不一致的代码现实
3. 影响实现路径的关键判断
4. blocker / 风险
5. 关键验证结果
6. 剩余非阻塞后续项的推进情况

禁止只记录低信息量状态，例如：

- “开始开发”
- “继续处理”
- “差不多完成”

每条记录都必须让后续阅读者能回答：

- 发生了什么
- 为什么重要
- 是否与设计有差异
- 如何影响实现、验证或完成定义

---

## 当前跟踪的非阻塞后续项

以下两项继续跟踪，但不阻塞 Phase 3 主路径实现：

1. `graphic.states` missing-state fallback 的告警策略
   - 候选：只在开发模式告警
   - 候选：默认输出 deprecated 提示
2. `Glyph ownership` 的文档拆分方式
   - 候选：单独出文档
   - 候选：并入后续章节

如果实现过程中触碰这两项，必须记录：

- 为什么需要触碰
- 是否影响当前 Phase 3 完成定义
- 是否仍保持非阻塞属性

---

## 推荐记录格式

```md
### YYYY-MM-DD HH:mm — Task X / 标题

- 背景：
- 实现/结论：
- 是否与设计有差异：
- 影响文件：
- 验证：
- 是否影响完成定义：
- 剩余动作/后续项：
```

---

## 实现记录

### 2026-04-08 Phase 3 执行基线建立

- 背景：
  Phase 3 设计包已获得 `Approve`，进入正式实现准备阶段，需要建立统一执行入口和留档基线。
- 实现/结论：
  1. 已建立 `D3_PHASE3_EXECUTION_PROMPT.md` 作为 Phase 3 最高优先级执行文档。
  2. 已明确 Phase 3 执行优先级：期望文档 > execution prompt > Phase 3 正式设计文档 > 总体架构文档 > 实施任务文档 > 开发者 prompt > review notes。
  3. 已将 `graphic.states` 告警策略和 `Glyph ownership` 文档拆分方式降格为非阻塞后续项，不作为本轮实现 blocker。
- 是否与设计有差异：
  否。仅把已拍板边界转写为执行文档和留档要求。
- 影响文件：
  `docs/refactor/state-engine/D3_PHASE3_EXECUTION_PROMPT.md`
  `docs/refactor/state-engine/D3_PHASE3_IMPLEMENTATION_LOG.md`
  `docs/refactor/state-engine/README.md`
- 验证：
  已完成文档自检，确认 Phase 3 状态字段与索引一致；尚未开始代码实现。
- 是否影响完成定义：
  否。该条目用于建立执行基线，不代表任何代码任务已完成。
- 剩余动作/后续项：
  1. 由实现 agent 按 execution prompt 启动代码实现。
  2. 后续每完成一个主任务、发现一个 blocker 或完成一次关键验证，都必须继续回填本日志。

### 2026-04-08 现状代码映射 / shared-state 基础设施缺口确认

- 背景：
  开始进入 Phase 3 代码实现前，需要先核实现有 `stage/group/graphic/state-engine/theme` 是否已经具备任何 shared-state runtime 基础设施，避免把“从零建立”误写成“增量接线”。
- 实现/结论：
  1. 当前 `vrender-core` 源码中还没有 `rootSharedStateScope`、`sharedStateDefinitions`、`effectiveCompiledDefinitions`、`registeredActiveScopes` 等任何 Phase 3 runtime 字段或辅助文件。
  2. `Graphic.createStateModel()` 仍然只围绕实例级 `states + stateProxy + StateEngine` 工作，`StateEngine` 当前直接消费一份 per-graphic `compiledDefinitions`。
  3. `Theme` 侧当前只有图形主题样式能力，没有 `stateDefinitions` 承接点；`Stage` 也没有 render 前 shared-state refresh 逻辑。
  4. 这意味着 Phase 3 本轮实现不是“补两个接口”，而是要完整建立 root scope / Group scope / active registration / refresh contract 主路径。
- 是否与设计有差异：
  否。执行文档已允许新增 `shared-state-scope.ts` / `shared-state-refresh.ts` 等基础设施文件；这里只是确认现状缺口确实存在。
- 影响文件：
  `packages/vrender-core/src/core/stage.ts`
  `packages/vrender-core/src/graphic/group.ts`
  `packages/vrender-core/src/graphic/graphic.ts`
  `packages/vrender-core/src/graphic/state/state-engine.ts`
  `packages/vrender-core/src/graphic/state/state-definition-compiler.ts`
  `packages/vrender-core/src/graphic/theme.ts`
- 验证：
  已完成源码扫描：当前 `packages/vrender-core/src` 内无 `stateDefinitions` / `sharedStateScope` / `rootSharedStateScope` 命中。
- 是否影响完成定义：
  否。该条目说明 Phase 3 必须完整建立主路径，但不构成 blocker。
- 剩余动作/后续项：
  1. 先写 shared-state 专项红灯测试，固定 precedence、refresh、fallback 和 reparent 行为。
  2. 再按测试驱动补 runtime 基础设施和 refresh hook。

### 2026-04-08 共享状态红灯测试建立

- 背景：
  Phase 3 需要先用专项测试锁住 root scope、Group precedence、active descendants refresh、fallback 统一裁决、resolver cache 边界与注册生命周期，再开始改运行时代码。
- 实现/结论：
  1. 已新增 shared-state 专项测试与测试辅助：
     - `shared-state-scope.test.ts`
     - `shared-state-refresh.test.ts`
     - `shared-state-fallback.test.ts`
     - `shared-state-resolver-cache.test.ts`
     - `group-state-invalidation.test.ts`
     - `shared-state-test-utils.ts`
  2. 首轮红灯结果已经证明当前仓库仍缺失 Phase 3 主路径能力：
     - `rootSharedStateScope` 尚不存在
     - outer Group shared definitions 还不能被 inner descendants 消费
     - shared resolver 还未进入主路径
     - shared-state 同名 state 仍会被实例级 `stateProxy` 接管
  3. `shared-state-fallback.test.ts` 当前已先绿，说明 Phase 2 的 per-graphic fallback 编译主链可复用，但还没有接上 shared scope precedence。
- 是否与设计有差异：
  否。红灯结果符合执行文档预期，说明 Phase 3 的缺口真实存在。
- 影响文件：
  `packages/vrender-core/__tests__/unit/graphic/shared-state-test-utils.ts`
  `packages/vrender-core/__tests__/unit/graphic/shared-state-scope.test.ts`
  `packages/vrender-core/__tests__/unit/graphic/shared-state-refresh.test.ts`
  `packages/vrender-core/__tests__/unit/graphic/shared-state-fallback.test.ts`
  `packages/vrender-core/__tests__/unit/graphic/shared-state-resolver-cache.test.ts`
  `packages/vrender-core/__tests__/unit/graphic/group-state-invalidation.test.ts`
- 验证：
  已运行定向 jest：
  `./node_modules/.bin/jest --config jest.config.js --runInBand __tests__/unit/graphic/shared-state-scope.test.ts __tests__/unit/graphic/shared-state-refresh.test.ts __tests__/unit/graphic/shared-state-fallback.test.ts __tests__/unit/graphic/shared-state-resolver-cache.test.ts __tests__/unit/graphic/group-state-invalidation.test.ts --verbose`
  结果：
  - `shared-state-fallback.test.ts` 通过
  - 其余 shared-state 核心场景按预期失败
- 是否影响完成定义：
  否。该条目是 Phase 3 TDD 的 red 基线。
- 剩余动作/后续项：
  1. 先清理测试辅助文件里的类型噪音，使红灯只反映 shared-state 行为缺口。
  2. 然后开始补 root scope、Group scope、注册链与 refresh 主路径。

### 2026-04-08 Phase 3 主路径实现 / shared scope + refresh contract

- 背景：
  shared-state 红灯已经固定住核心缺口，接下来需要按 execution prompt 建立 `Theme -> root scope -> Group scopes -> Graphic compiled view` 主路径，并把 active descendants refresh 闭环到 render 前 hook。
- 实现/结论：
  1. 新增 `shared-state-scope.ts`：
     - 建立 `SharedStateScope`
     - 支持 `createRootSharedStateScope()` / `createGroupSharedStateScope()`
     - 固化 `effectiveSourceDefinitions + effectiveCompiledDefinitions`
     - 提供 `ensureSharedStateScopeFresh()` 处理 parent revision 失效
  2. 新增 `shared-state-refresh.ts`：
     - 建立 stage 级 pending refresh queue
     - `markScopeActiveDescendantsDirty()` 只按 active descendants 入队
     - `flushStageSharedStateRefresh()` 固定复用 render 前 hook
  3. `Stage` 现在持有 `rootSharedStateScope`，并通过 `Theme.stateDefinitions` setter callback 承接 Theme 默认来源。
  4. `Group` 现在持有：
     - `sharedStateDefinitions`
     - `sharedStateScope`
     且在定义变化时会重建本 scope effective view，并把当前 subtree 下的 active descendants 标为 `sharedStateDirty`。
  5. `Graphic` 现在持有：
     - `boundSharedStateScope`
     - `boundSharedStateRevision`
     - `registeredActiveScopes`
     - `localFallbackCompiledDefinitions`
     - `sharedStateDirty`
     并在激活状态时注册到整个 scope ancestor 链。
  6. `graphic.states` fallback 已收口到统一编译路径：
     - shared scope miss 的 state 才会补入
     - 命中 shared 的同名 state 不再走第二套本地逻辑
     - fallback 会重新编译成 per-graphic effective compiled view
  7. `stateProxy` 已从 shared-state 主路径切断：
     - shared 命中的同名 state 不再被实例级 `stateProxy` 接管
     - 只在 local missing-state fallback 路径中保留 legacy compatibility
  8. reparent / detach / release 的注册更新已闭环：
     - `Group.removeChild()` / `appendChild()` 不再依赖“stage 变了才重绑”
     - 同 stage 结构重挂载也会重建 shared-state binding
- 是否与设计有差异：
  基本无差异。实现上选择了“scope 立即重建 + descendant scope lazy ensureFresh + graphic render 前 eager refresh”的组合：
  - changed scope 自己立即重建并 bump revision
  - descendants 通过 `parentRevisionAtBuild` 在真正 refresh 时重建 effective view
  - active descendants 由 render 前 hook 保证在下一次 render 前完成 patch 重算和静态真值同步
  这一点与 execution prompt 的 refresh contract 一致。
- 影响文件：
  `packages/vrender-core/src/graphic/state/shared-state-scope.ts`
  `packages/vrender-core/src/graphic/state/shared-state-refresh.ts`
  `packages/vrender-core/src/core/stage.ts`
  `packages/vrender-core/src/graphic/group.ts`
  `packages/vrender-core/src/graphic/graphic.ts`
  `packages/vrender-core/src/graphic/state/state-engine.ts`
  `packages/vrender-core/src/graphic/theme.ts`
  `packages/vrender-core/src/interface/graphic.ts`
  `packages/vrender-core/src/interface/graphic/group.ts`
  `packages/vrender-core/src/interface/stage.ts`
  `packages/vrender-core/src/interface/graphic/theme.ts`
- 验证：
  第一轮专项 shared-state 红灯已经全部转绿，覆盖：
  - root scope / Group precedence
  - active descendants refresh
  - fallback 统一裁决
  - resolver per-graphic cache
  - reparent / detach / release 注册更新
- 是否影响完成定义：
  是。该条目对应 Phase 3 的主体实现。
- 剩余动作/后续项：
  1. 补跑 compile 与既有状态回归测试。
  2. 若 compile / 回归通过，再补 implementation summary 与非阻塞 follow-ups。

### 2026-04-08 Phase 3 验证完成 / 实现可交付

- 背景：
  Phase 3 主路径代码已经落地，需要按 execution prompt 的完成定义补齐最终验证，并确认没有因为最后的 shared-state 接线引入 lint/compile/regression 问题。
- 实现/结论：
  1. 已重新整理 Phase 3 变更面代码，清掉 shared-state 相关的格式与空安全噪音，确保新增实现文件与改动文件定向 lint 为零告警。
  2. 已重新运行 `rush compile -t @visactor/vrender-core`，确认 shared-state 基础设施、Stage/Group/Graphic 接线和接口扩展全部通过编译。
  3. 已重新运行 shared-state + 既有状态回归测试包，确认没有破坏 Phase 2 已有状态语义，同时覆盖 Phase 3 completion definition 要求的关键场景：
     - root scope / Group scope precedence
     - active descendants refresh
     - `graphic.states` fallback 统一裁决
     - resolver per-graphic cache
     - reparent / detach / release 注册更新
  4. 按 execution prompt 对照，Phase 3 完成定义 8 条全部满足：
     - `Group-first + Theme root scope` ownership 已闭环
     - effective compiled view 已成为唯一主路径
     - active descendants refresh 契约成立
     - `graphic.states` fallback 已进入同一裁决管线
     - resolver cache 边界严格保持 per-graphic
     - shared-state 主路径不再依赖实例级 `stateProxy`
     - `Glyph` 仍明确隔离在本轮主路径之外
     - 文档、测试、实现语义与 implementation log 已同步
- 是否与设计有差异：
  无新增设计差异。本轮只补最终验证和日志，不扩实现范围。
- 影响文件：
  `packages/vrender-core/src/graphic/group.ts`
  `packages/vrender-core/src/graphic/graphic.ts`
  `packages/vrender-core/src/graphic/state/shared-state-scope.ts`
  `packages/vrender-core/src/interface/graphic.ts`
  `docs/refactor/state-engine/D3_PHASE3_IMPLEMENTATION_LOG.md`
- 验证：
  1. compile：
     `source ~/.nvm/nvm.sh && nvm use 20.19.6 >/dev/null && rush compile -t @visactor/vrender-core`
     结果：通过
  2. 定向 jest：
     `source ~/.nvm/nvm.sh && nvm use 20.19.6 >/dev/null && ./node_modules/.bin/jest --config jest.config.js --runInBand __tests__/unit/graphic/state-engine.test.ts __tests__/unit/graphic/state-resolution.test.ts __tests__/unit/graphic/graphic-state.test.ts __tests__/unit/graphic/state-module-parity.test.ts __tests__/unit/graphic/shared-state-scope.test.ts __tests__/unit/graphic/shared-state-refresh.test.ts __tests__/unit/graphic/shared-state-fallback.test.ts __tests__/unit/graphic/shared-state-resolver-cache.test.ts __tests__/unit/graphic/group-state-invalidation.test.ts --verbose`
     结果：`9/9 suites`、`52/52 tests` 通过
  3. 定向 eslint：
     `./node_modules/.bin/eslint src/core/stage.ts src/graphic/group.ts src/graphic/graphic.ts src/graphic/theme.ts src/graphic/state/state-engine.ts src/graphic/state/shared-state-scope.ts src/graphic/state/shared-state-refresh.ts src/interface/graphic.ts src/interface/graphic/group.ts src/interface/stage.ts src/interface/graphic/theme.ts __tests__/unit/graphic/shared-state-test-utils.ts __tests__/unit/graphic/shared-state-scope.test.ts __tests__/unit/graphic/shared-state-refresh.test.ts __tests__/unit/graphic/shared-state-fallback.test.ts __tests__/unit/graphic/shared-state-resolver-cache.test.ts __tests__/unit/graphic/group-state-invalidation.test.ts`
     结果：`0 error / 0 warning`
- 是否影响完成定义：
  是。该条目标志 Phase 3 已满足 execution prompt 的完成定义，可进入“实现完成”状态。
- 剩余动作/后续项：
  1. `graphic.states` missing-state fallback 的告警策略仍按 execution prompt 作为非阻塞后续项继续跟踪。
  2. `Glyph ownership` 文档拆分方式仍按 execution prompt 作为非阻塞后续项继续跟踪。

### 2026-04-08 Phase 3 review fixup / request-changes 收口

- 背景：
  架构复核指出 3 个实现级问题，分别是：
  1. `removeChild/removeAllChild -> child.setStage(null, null)` 在图元仍有 tracked animate 时会因为 `stage.getTimeline()` 直接崩溃。
  2. shared definition 变化后只标脏，不主动调度 `renderNextFrame()`，真实运行时可能停留在旧样式直到别的更新偶然触发渲染。
  3. `incrementalAppendChild()` 仍绕过普通 append 的 shared-state rebinding 主路径。
- 实现/结论：
  1. `Graphic.setStage()` 已显式处理 `stage == null`：
     - 不再无条件解引用 `stage.getTimeline()`
     - 对 global tracked animates 采用“有 next timeline 才重绑；无 next timeline 只做旧 timeline 脱钩”的策略
     - 同时避免 layer-only 变更时向同一个 timeline 重复 `addAnimate`
  2. shared-state refresh 调度已补到主链：
     - 新增 `scheduleStageSharedStateRefresh()`
     - `markScopeActiveDescendantsDirty()` 在存在 active descendants 时会显式调度 `stage.renderNextFrame()`
     - `markSharedStateDirty()` 也会同步调度，确保 active graphic 在 reparent / rebinding 后不会只入队不触发下一帧
  3. `Group.incrementalAppendChild()` 已切回与普通 `appendChild()` 同构的 stage/layer/shared-state rebinding 逻辑，不再只做裸 `stage/layer` 赋值。
  4. 已新增/扩展专项测试：
     - `shared-state-refresh.test.ts` 新增“shared definitions change -> renderNextFrame scheduled”断言
     - `group-state-invalidation.test.ts` 新增“animated detach 不崩”与“incremental append 重新绑定 active shared-state graphic”断言
- 是否与设计有差异：
  无。以上修复都属于对 execution prompt refresh contract 和 tree lifecycle contract 的补齐，不改变 Phase 3 已确定的 ownership / precedence / fallback / resolver 边界。
- 影响文件：
  `packages/vrender-core/src/graphic/graphic.ts`
  `packages/vrender-core/src/graphic/group.ts`
  `packages/vrender-core/src/graphic/state/shared-state-refresh.ts`
  `packages/vrender-core/__tests__/unit/graphic/shared-state-refresh.test.ts`
  `packages/vrender-core/__tests__/unit/graphic/group-state-invalidation.test.ts`
  `packages/vrender-core/__tests__/unit/graphic/shared-state-test-utils.ts`
- 验证：
  1. review fix 定向 red->green：
     `./node_modules/.bin/jest --config jest.config.js --runInBand __tests__/unit/graphic/shared-state-refresh.test.ts __tests__/unit/graphic/group-state-invalidation.test.ts --verbose`
     结果：`2/2 suites`、`6/6 tests` 通过
  2. 其余 compile / shared-state 回归 / eslint 见本条后续最终验证结果
- 是否影响完成定义：
  是。该条目补齐了 Phase 3 从“主体实现完成”到“可通过架构复核”的最小修复集。
- 剩余动作/后续项：
  1. 重新运行 compile、shared-state/state 回归包和定向 eslint，确认没有引入回归。
  2. 保持 `graphic.states` 告警策略与 `Glyph ownership` 作为非阻塞后续项，不扩大本轮实现范围。

### 2026-04-08 Phase 3 close-out 基线建立

- 背景：
  Phase 3 主路径实现已经通过架构复核，接下来需要把状态从“已实现、已通过复核”稳定收口到正式 `closed`，并避免 Phase 3 文档包、README 与总架构文档继续停留在“可执行”阶段。
- 实现/结论：
  1. 已新增 `D3_PHASE3_CLOSEOUT_PROMPT.md`，把 Phase 3 close-out gate、必读文档、执行顺序、验证要求和输出格式写成正式收尾指令。
  2. 已新增 `D3_PHASE3_ACCEPTANCE_TEMPLATE.md`，固定最终验收说明结构，避免 close-out 时只留下聊天结论。
  3. 已把 Phase 3 相关文档状态、README 阶段索引以及 `D3_ARCH_DESIGN.md` 同步到“实现已通过复核，待 close-out”。
  4. `graphic.states` 告警策略与 `Glyph ownership` 继续保持为非阻塞后续项，不在本轮 close-out 中升级为 blocker。
- 是否与设计有差异：
  否。本条仅补齐 Phase 3 收尾材料与文档状态同步，不改 shared-state 主路径设计与实现结论。
- 影响文件：
  `docs/refactor/state-engine/D3_PHASE3_CLOSEOUT_PROMPT.md`
  `docs/refactor/state-engine/D3_PHASE3_ACCEPTANCE_TEMPLATE.md`
  `docs/refactor/state-engine/D3_PHASE3_SHARED_STATE_DESIGN.md`
  `docs/refactor/state-engine/D3_PHASE3_IMPLEMENTATION_GUIDE.md`
  `docs/refactor/state-engine/D3_PHASE3_DEVELOPER_PROMPT.md`
  `docs/refactor/state-engine/D3_PHASE3_REVIEW_NOTES.md`
  `docs/refactor/state-engine/D3_PHASE3_EXECUTION_PROMPT.md`
  `docs/refactor/state-engine/D3_PHASE3_IMPLEMENTATION_LOG.md`
  `docs/refactor/state-engine/README.md`
  `docs/refactor/state-engine/D3_ARCH_DESIGN.md`
- 验证：
  已完成文档一致性自检，确认：
  1. Phase 3 close-out / acceptance 新文档已纳入 README 索引。
  2. Phase 3 相关文档状态已同步到 close-out 阶段。
  3. `D3_ARCH_DESIGN.md` 与 README 阶段状态已不再停留在 Phase 3 待启动或可执行阶段。
- 是否影响完成定义：
  否。Phase 3 实现完成定义仍以前述实现与验证条目为准；本条建立的是正式 close-out 路径。
- 剩余动作/后续项：
  1. 后续按 `D3_PHASE3_CLOSEOUT_PROMPT.md` 完成最终验收与状态切换。
  2. close-out 完成后，再将 Phase 3 正式标记为 `closed`。

### 2026-04-08 Phase 3 正式 close-out / closed

- 背景：
  Phase 3 主体实现、request-changes fixup 与架构复核都已完成，当前只剩 close-out gate 的正式收口：确认 `Approve` 结论仍成立、同步文档状态、形成最终验收说明，并把 Phase 3 状态从“待 close-out”切到 `closed`。
- 实现/结论：
  1. 已重新对照 `D3_PHASE3_CLOSEOUT_PROMPT.md` 的 6 条 gate，确认当前实现结论仍为 `Approve`，不存在未关闭 blocker。
  2. 已同步 Phase 3 相关文档状态：
     - `D3_PHASE3_SHARED_STATE_DESIGN.md`
     - `D3_PHASE3_IMPLEMENTATION_GUIDE.md`
     - `D3_PHASE3_DEVELOPER_PROMPT.md`
     - `D3_PHASE3_REVIEW_NOTES.md`
     - `D3_PHASE3_EXECUTION_PROMPT.md`
     - `D3_PHASE3_IMPLEMENTATION_LOG.md`
     - `README.md`
     - `D3_ARCH_DESIGN.md`
     并补充了 `D3_PHASE3_CLOSEOUT_PROMPT.md`、`D3_PHASE3_ACCEPTANCE_TEMPLATE.md` 的归档状态，避免文档包内部继续保留“可执行 / 待 close-out”的错位口径。
  3. 已使用 `D3_PHASE3_ACCEPTANCE_TEMPLATE.md` 形成最终验收说明，固定了：
     - `Acceptance status`
     - `Evidence summary`
     - `Remaining non-blocking follow-ups`
     - `Can Phase 3 be marked closed`
  4. 已明确保留两个非阻塞后续项：
     - `graphic.states` missing-state fallback 告警策略
     - `Glyph ownership` 文档拆分方式
     它们继续跟踪，但不回升为本轮 blocker。
  5. Phase 3 现在可以从“主体实现已完成，并已通过复核”正式切换到 `closed`。
- 是否与设计有差异：
  无。本条仅完成 close-out 留档与状态切换，不改 shared-state ownership、precedence、refresh、fallback、resolver 或 `stateProxy` 边界。
- 影响文件：
  `docs/refactor/state-engine/D3_PHASE3_SHARED_STATE_DESIGN.md`
  `docs/refactor/state-engine/D3_PHASE3_IMPLEMENTATION_GUIDE.md`
  `docs/refactor/state-engine/D3_PHASE3_DEVELOPER_PROMPT.md`
  `docs/refactor/state-engine/D3_PHASE3_REVIEW_NOTES.md`
  `docs/refactor/state-engine/D3_PHASE3_EXECUTION_PROMPT.md`
  `docs/refactor/state-engine/D3_PHASE3_IMPLEMENTATION_LOG.md`
  `docs/refactor/state-engine/D3_PHASE3_ACCEPTANCE_TEMPLATE.md`
  `docs/refactor/state-engine/D3_PHASE3_CLOSEOUT_PROMPT.md`
  `docs/refactor/state-engine/README.md`
  `docs/refactor/state-engine/D3_ARCH_DESIGN.md`
- 验证：
  1. close-out gate 自检：已逐项对照 `D3_PHASE3_CLOSEOUT_PROMPT.md`，6/6 条满足。
  2. implementation log：已包含
     - 主体实现完成结论
     - request-changes fixup 收口结论
     - 最终验证摘要
     - 非阻塞后续项跟踪状态
  3. acceptance template：已补齐本次最终验收记录。
  4. 文档状态一致性：Phase 3 相关文档、README 与 `D3_ARCH_DESIGN.md` 已统一为 `closed` 口径。
- 是否影响完成定义：
  是。该条目标志 Phase 3 close-out gate 已全部满足，阶段状态可正式标记为 `closed`。
- 剩余动作/后续项：
  1. `graphic.states` missing-state fallback 告警策略：继续作为非阻塞后续项跟踪。
  2. `Glyph ownership` 文档拆分方式：继续作为非阻塞后续项跟踪。
