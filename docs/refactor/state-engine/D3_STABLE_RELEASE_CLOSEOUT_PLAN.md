# D3 Stable Release Closeout Plan

> Status: active stable-release closeout
> Created: 2026-05-18
> Scope: D3 全环境最终完成、稳定正式版无 D3 follow-up

## 1. Release Goal

D3 browser alpha 已关闭，但稳定正式版的目标更高：不能只证明 browser 链路可用，也不能继续保留“node / multi-env / support matrix / performance P2 / low-priority follow-up”作为 D3 尾项。

稳定正式版完成定义：

1. D3 Phase 1-4 和 legacy removal 结论保持 closed，不重开静态真值模型。
2. Browser、Node 和维护者确认的一等环境，均能通过统一 app-scoped env 安装架构完成 create -> render -> release -> recreate。
3. 其他端环境在正式测试环境到位后通过 smoke；在测试环境到位前，必须先完成代码级 support matrix 和架构一致性审查。
4. 所有 D3 follow-up 必须被完成、关闭为 no-go 决策，或明确改归非 D3 release 范畴；不能以“后续再看”留在 D3 稳定版清单。

## 2. Architecture Principle: Env Loading Must Be Uniform

正式版不接受 browser / node / miniapp 各走一套隐式初始化逻辑。环境加载的架构约束如下：

1. app-scoped runtime 入口先配置 app 的 registry / factory / runtime application，再激活目标 env。
2. env activation 由统一 helper 执行，负责 `getRuntimeInstallerGlobal().setEnv(env, envParams)` 和 force 语义。
3. `envParams` 是 env activation 的输入，不存储在 `IApp` 上；当前 runtime global 仍是 runtime installer 的共享执行面，因此每次 public app bootstrap 必须显式激活 env，避免复用上一轮 app 的 stale env。
4. Browser 可以无 envParams；Node 必须有 node-canvas 兼容包，来源可以是：
   - `createNodeVRenderApp({ envParams: CanvasPkg })`
   - 兼容旧调用：先 `vglobal.setEnv('node', CanvasPkg)`，再 `createNodeVRenderApp()`
5. Miniapp 一等 env（`taro` / `feishu` / `tt` / `wx` / `lynx` / `harmony`）必须复用同一 activation helper；不能重新引入 root-only 或 legacy-only 的隐式加载链。
6. `envParams` 不随 app 持久化；每次 public app creator / bootstrap 都重新激活当前 env。调用方需要跨 env 或重复创建 app 时，应把 env 参数传给对应 creator，而不是依赖上一个 app 的 runtimeGlobal 状态。

## 3. Stable P0 Gates

### P0-1 Unified App Env Activation

Owner: VRender-side

完成标准：

1. Browser 和 Node public app creators 都走统一 env activation helper。
2. Node app-scoped public path 不依赖 stale runtimeGlobal。
3. 缺少 Node envParams 时给出明确错误，不静默落到 browser 或复用旧 app 参数。
4. Browser 现有 app-scoped 行为不回退。

Current progress:

- `installBrowserEnvToApp` / `installNodeEnvToApp` 已收敛到统一 runtime env activation helper。
- `createBrowserVRenderApp({ envParams? })` / `createNodeVRenderApp({ envParams? })` 已统一入口形态。
- `createNodeVRenderApp({ envParams: CanvasPkg })` 已补 public API 入口。
- Node 兼容旧 `vglobal.setEnv('node', CanvasPkg)` 的路径已加回归测试。
- 已验证：
  - `packages/vrender rushx test --runInBand __tests__/unit/entries.test.ts __tests__/unit/node-app-runtime.test.ts __tests__/unit/build-artifact-consistency.test.ts`
  - `packages/vrender` 在 Node 20.19.6 下 direct Jest 全量通过：18 suites / 147 tests passed, 2 skipped。

### P0-2 Browser Render Gate

Owner: VRender-side

完成标准：

1. `createBrowserVRenderApp().createStage()` create -> render -> release -> recreate 通过。
2. canvas object 和 canvas id 两条路径通过。
3. app-scoped registry / renderer / picker 不依赖 legacy sync 才能渲染。
4. browser smoke 页面中无 root-only 初始化残留导致的空白页。

### P0-3 Node Render Gate

Owner: VRender-side

完成标准：

1. `createNodeVRenderApp({ envParams: CanvasPkg }).createStage()` create -> render -> export buffer -> release -> recreate 通过。
2. 旧兼容路径 `vglobal.setEnv('node', CanvasPkg)` + `createNodeVRenderApp()` 通过。
3. 缺少 node-canvas 参数时错误信息明确。
4. 真实 native `canvas` 环境验证需要在 Node ABI 匹配的测试环境执行；mock 只能作为架构单测，不替代发布前 native smoke。

Current progress:

- app-scoped Node 架构单测已覆盖：
  - 缺少 envParams 时不复用 stale runtime state，并抛出明确错误；
  - `createNodeVRenderApp({ envParams })` 能 create -> render -> export buffer -> release；
  - legacy-compatible `vglobal.setEnv('node', CanvasPkg)` -> `createNodeVRenderApp()` 能继承 envParams。
- 真实 `canvas` native smoke 已在 Node 20.19.6 / NODE_MODULE_VERSION 115 下通过。
- 当前 `rushx` 在 `packages/vrender` 目录会使用 Node 22.22.0 / NODE_MODULE_VERSION 127；仓库安装的 `canvas@2.11.2` native binding 是 Node 20 ABI，因此 Node 22 下 native canvas test 会自动 skip，包级 jsdom 测试会被 ABI mismatch 阻断。正式 CI 需要统一 Node 与 native canvas ABI。

### P0-4 Multi-Env Support Matrix

Owner: VRender-side / maintainers

完成标准：

1. 明确 Tier 1 / Tier 2 / Tier 3 环境：
   - Tier 1: 稳定版正式承诺，必须有自动化或正式 smoke 证据。
   - Tier 2: 代码路径保留，需有维护者确认的限制说明。
   - Tier 3: legacy/custom assembly，不作为稳定版默认承诺。
2. 对 `browser` / `node` / `taro` / `feishu` / `tt` / `wx` / `lynx` / `harmony` / `native` 逐项记录：
   - env installer 是否存在
   - canvas module 是否存在
   - window contribution 是否存在
   - public app creator 是否存在或是否只支持 custom assembly
   - create/render/release/recreate 验证状态
3. 后续用户提供真实端环境后，逐项补 smoke，而不是改架构。

Stable release support matrix:

| Env | Env loader | Canvas module | Window contribution | Public app-scoped default creator | Current stable status |
| --- | --- | --- | --- | --- | --- |
| `browser` | yes | yes | yes | `createBrowserVRenderApp` | Tier 1; browser alpha gate 已关，release-day 仍需 rerun |
| `node` | yes | yes | yes | `createNodeVRenderApp` | Tier 1; source/runtime tests 与 Node 20.19.6 native canvas smoke 已过，CI 需固定 Node ABI |
| `wx` | yes | yes | yes | `createWxVRenderApp` | Tier 1; 真实微信小程序 smoke 已确认常规图元、文本、动画、组件、事件、批量、资源等能力正常 |
| `lynx` | yes | yes | yes | `createLynxVRenderApp` | Tier 1; Lynx 真机/宿主 smoke 已确认可渲染并完成常规能力验证 |
| `harmony` | yes | yes | yes | `createHarmonyVRenderApp` | Tier 1; Harmony 测试环境 smoke 已确认可渲染并完成常规能力验证 |
| `taro` | yes | yes | yes | `createTaroVRenderApp` | Tier 2; code-level app-scoped path connected，待真实端 smoke 后再升级 |
| `feishu` | yes | yes | yes | `createFeishuVRenderApp` | Tier 2; code-level app-scoped path connected，待真实端 smoke 后再升级 |
| `tt` | yes | yes | yes | `createTTVRenderApp` | Tier 2; code-level app-scoped path connected，待真实端 smoke 后再升级 |
| `native` | no obvious env loader | no obvious canvas module | partial window contribution only | not yet | Tier 3 / unsupported by stable default contract until owner fills missing pieces |

Current progress:

- `browser` / `node` / `taro` / `feishu` / `tt` / `wx` / `lynx` / `harmony` 均已接入 app-scoped env installer 与 public app creator。
- miniapp env / window contribution binding 已从 module-level boolean 改为 container-level idempotence，避免 legacy container 和 app-scoped runtime container 互相污染或漏绑。
- `installMathPickersToApp` 作为非 browser env 的 app-scoped picker helper 暴露，miniapp public bootstrap 统一走 math picker。
- 已验证 public creator bootstrap 顺序单测；wx / lynx / harmony 真实端 smoke 已补齐，taro / feishu / tt 保持代码级连接与 Tier 2 限制说明。
- `vrender` 发布构件一致性测试已覆盖 `es/cjs` 的 miniapp entry 与 `IApp` factory 类型面；本地 build 已生成对应 ignored artifacts 用于验证。
- 当前不承诺同一 JS runtime 内多个 env 同时完全隔离；public creator 每次都会显式激活当前 env，调用方需要跨 env 时必须按 env/page 作用域管理 app 生命周期。

### P0-5 Upper-Layer Integration Gates

Owner: VRender-side + VChart/VTable-side

完成标准：

1. VChart app-provider-first/source-level 对齐完成。
2. VChart 不再通过 clearStates -> setStates 避免 state 问题；使用 public refresh/setStates options。
3. VTable 图形动画 appear/fade 场景使用最终静态属性 + from 起始态的契约，或由 VRender 提供明确等价 API。
4. Text stateProxy real-path 覆盖至少一个真实上层 workload。

Current progress:

- VChart state sync 已收敛到 `graphic.setStates(states, { animate, animateSameStatePatchChange: true })` 的 public state refresh 路径；VRender 已支持 same-state patch changed animation。
- VRender line update 已修复 sibling channel ownership，`TagPointsUpdate` 可从标准 update target 来源读取目标 `points/segments`，不再要求 VChart 为该路径外部预写 `setFinalAttributes(finalAttrs)`。
- VRender-components label layout 已移除 render 期间临时 `mark.initAttributes(finalAttrs)` / restore 原图元的路径，改为只读 `context.finalAttrs` / final-bounds layout context；VChart 侧 label 相关处理已完成，后续不再作为 VRender 当前执行片阻塞项。
- VTable appear/fade 相关动画静态真值契约已由 VRender 单测锁住：普通 fade appear 应保持最终 `opacity` 为静态真值并使用 `animate().from({ opacity: 0 })` 表示起始态；`animate().to({ opacity: 1 })` 不会把终点写入 `baseAttributes`。
- VTable-lite text-stateProxy workload 已存在并完成语义验证：`packages/vrender/__tests__/browser/src/pages/vtable-lite-text-stateproxy.ts` / `vtable-lite-shared.ts` 对 `10` 个 sample text 调用 `useStates(['hover'], false)`，`stateProxy` sample 语义 `10/10` 通过。

### P0-6 Performance And Memory Closure

Owner: VRender-side

完成标准：

1. P0/P1 memory benchmark 结论保持 accepted。
2. VTable-lite / memory P2 必须给出最终结论：
   - accepted with evidence，或
   - closed as no-go with measured rationale。
3. 不允许稳定版仍保留 `P2 approved to start, not accepted` 状态。

Current decision:

- `P1 accepted` 结论保持成立。
- `P2` 已关闭为 D3 stable release no-go：上一轮 `Text.cache` lazy-init 对 `VTable-lite text-stateProxy cells` 有可见收益，且 `stateProxy` sample 语义保持 `10/10` 通过；但官方 `memory.ts run 100` no-trace gate 没有形成足够清晰改善，因此本轮不接受为 D3 P2。
- 后续若继续追构造期固定成本，应作为独立性能专项重开，不再作为 D3 stable release follow-up。

### P0-7 Documentation And Release Contract

Owner: Coordinator / maintainers

完成标准：

1. README、adoption guide、alpha coordination、post-alpha plan 与本 stable closeout 文档口径一致。
2. release note 明确正式支持的 env tier。
3. D3 follow-up 清单清零：每一项都有 completed / rejected / moved-out-of-D3 状态。

Current progress:

- Stable support matrix 已明确为 Tier 1: `browser` / `node` / `wx` / `lynx` / `harmony`；Tier 2: `taro` / `feishu` / `tt`；Tier 3: `native`。
- `text stateProxy` 与 memory P2 已从 follow-up 中收口，memory P2 关闭为 D3 stable release no-go。
- `graphic.states` missing-state fallback 告警策略已完成：绑定 shared scope 后由 `graphic.states` 补齐缺失 shared definition 时输出一次性 deprecated warning。
- `Glyph ownership` 已关闭为文档化边界：稳定版不把 `Glyph` 并回 shared-state 主路径，`glyphStates` / `glyphStateProxy` 继续作为 Glyph 专属 surface。
- legacy/custom sample cleanup 已完成 D3 stable scope 补强：`packages/vrender` browser `background.ts` 已纳入 deprecated root `createStage()` scan 并切到 app-scoped page stage helper。
- VTable 侧 app/stage ownership 与 appear/fade 动画契约 prompt 已补充：[D3_VTABLE_APP_SCOPED_ADOPTION_PROMPT.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_VTABLE_APP_SCOPED_ADOPTION_PROMPT.md)。
- Release notes 草案已补充：[D3_STABLE_RELEASE_NOTES_DRAFT.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_STABLE_RELEASE_NOTES_DRAFT.md)。
- 2026-05-25 VRender-side local rerun 已完成，Node 使用 `20.19.6`：
  - `packages/vrender-core` full unit: 107 passed / 1 skipped suites, 597 passed / 3 skipped tests
  - `packages/vrender` full unit: 19 suites passed, 154 passed / 2 skipped tests
  - `packages/vrender-components` full unit: 36 suites / 114 tests passed
  - `packages/vrender-core` compile passed
  - `packages/vrender` compile passed
  - `packages/vrender-components` compile passed
  - `packages/vrender` targeted app entry / node runtime / build artifact / legacy-removal tests: 4 suites / 101 tests passed
  - `packages/vrender-animate` animation runtime targeted test: 1 suite / 44 tests passed
  - `packages/vrender-animate` compile passed
  - affected `vrender-core` / `vrender` / `vrender-components` / `vrender-animate` eslint passed
  - `git diff --check` passed
- 仍需在正式 release-day 按目标发布环境复跑 browser / node / components targeted suites，并由 VTable 回填 appear/fade 调用契约结论。

## 4. Current Next Slice

Node 与 wx / lynx / harmony 已进入 stable Tier 1，且 VChart label 相关处理已完成后，当前 VRender owner 的下一执行片切到 VRender release-day 证据与剩余契约边界：

1. **VRender release-day rerun**
   - rerun `vrender-components` label targeted / full unit / compile。
   - rerun `packages/vrender` targeted tests，Node lane 使用 Node 20.19.6 或其它与 `canvas` native binding 匹配的版本。
   - rerun `git diff --check`、affected lint/typecheck。
2. **VTable appear/fade 调用契约**
   - 上层优先采用“先写最终静态属性，再用 `animate().from(...)` 表示起始态”的普通图元 appear 写法。
   - 若必须保留 wait + to 链式写法，应显式确认动画终点不会替代静态真值；否则由上层先 `setAttribute` 最终态。
3. **Tier 2 env 后续**
   - taro / feishu / tt 保持 Tier 2，等真实端环境可用后再补 smoke 并决定是否升级；不阻塞 D3 stable release。
4. **Non-blocking advanced governance**
   - advanced on-demand assembly 与更强 runtime isolation 不作为 D3 stable release blocker；若维护者决定继续推进，应单独开治理任务。
5. **Release notes finalization**
   - 版本号确定为 `0.3.0` 或 `1.0.0` 后，以 `D3_STABLE_RELEASE_NOTES_DRAFT.md` 为底稿整理正式 changelog。

## 5. Stop Rules

遇到以下情况必须停止并回到架构判断：

1. 某环境需要改变 `baseAttributes + resolvedStatePatch -> attribute` 静态真值模型。
2. 某环境只能通过 root legacy singleton 才能渲染，且没有 app-scoped 迁移路径。
3. 某优化需要扩大 `stateProxy` 深层 nested mutation 承诺。
4. 某端缺少真实测试环境，但 release note 准备宣称 Tier 1 正式支持。
5. 为了追求“无后续项”而把未验证能力静默写成 completed。
