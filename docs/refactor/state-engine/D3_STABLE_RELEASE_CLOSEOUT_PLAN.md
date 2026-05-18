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

Initial code-level matrix:

| Env | Env loader | Canvas module | Window contribution | Public app-scoped default creator | Current stable status |
| --- | --- | --- | --- | --- | --- |
| `browser` | yes | yes | yes | `createBrowserVRenderApp` | Tier 1 candidate; browser alpha gate 已关，stable 仍需 release-day rerun |
| `node` | yes | yes | yes | `createNodeVRenderApp` | Tier 1 candidate; source/runtime tests 已过，native canvas 需固定 Node ABI |
| `taro` | yes | yes | yes | `createTaroVRenderApp` | code-level app-scoped path connected; stable 前需真实端 smoke |
| `feishu` | yes | yes | yes | `createFeishuVRenderApp` | code-level app-scoped path connected; stable 前需真实端 smoke |
| `tt` | yes | yes | yes | `createTTVRenderApp` | code-level app-scoped path connected; stable 前需真实端 smoke |
| `wx` | yes | yes | yes | `createWxVRenderApp` | code-level app-scoped path connected; stable 前需真实端 smoke |
| `lynx` | yes | yes | yes | `createLynxVRenderApp` | code-level app-scoped path connected; stable 前需真实端 smoke |
| `harmony` | yes | yes | yes | `createHarmonyVRenderApp` | code-level app-scoped path connected; stable 前需真实端 smoke |
| `native` | no obvious env loader | no obvious canvas module | partial window contribution only | not yet | cannot claim stable support until owner decides tier and fills missing pieces |

Current progress:

- `browser` / `node` / `taro` / `feishu` / `tt` / `wx` / `lynx` / `harmony` 均已接入 app-scoped env installer 与 public app creator。
- miniapp env / window contribution binding 已从 module-level boolean 改为 container-level idempotence，避免 legacy container 和 app-scoped runtime container 互相污染或漏绑。
- `installMathPickersToApp` 作为非 browser env 的 app-scoped picker helper 暴露，miniapp public bootstrap 统一走 math picker。
- 已验证 public creator bootstrap 顺序单测；真实端渲染 smoke 仍依赖外部项目环境和测试版发布后补证据。
- `vrender` 发布构件一致性测试已覆盖 `es/cjs` 的 miniapp entry 与 `IApp` factory 类型面；本地 build 已生成对应 ignored artifacts 用于验证。

### P0-5 Upper-Layer Integration Gates

Owner: VRender-side + VChart/VTable-side

完成标准：

1. VChart app-provider-first/source-level 对齐完成。
2. VChart 不再通过 clearStates -> setStates 避免 state 问题；使用 public refresh/setStates options。
3. VTable 图形动画 appear/fade 场景使用最终静态属性 + from 起始态的契约，或由 VRender 提供明确等价 API。
4. Text stateProxy real-path 覆盖至少一个真实上层 workload。

### P0-6 Performance And Memory Closure

Owner: VRender-side

完成标准：

1. P0/P1 memory benchmark 结论保持 accepted。
2. VTable-lite / memory P2 必须给出最终结论：
   - accepted with evidence，或
   - closed as no-go with measured rationale。
3. 不允许稳定版仍保留 `P2 approved to start, not accepted` 状态。

### P0-7 Documentation And Release Contract

Owner: Coordinator / maintainers

完成标准：

1. README、adoption guide、alpha coordination、post-alpha plan 与本 stable closeout 文档口径一致。
2. release note 明确正式支持的 env tier。
3. D3 follow-up 清单清零：每一项都有 completed / rejected / moved-out-of-D3 状态。

## 4. First Execution Slice

当前先推进 VRender-side 最小闭环：

1. 修复 public Node app-scoped env activation。
2. 补 Node public runtime 单测。
3. 跑 `vrender` targeted tests、compile、lint。
4. 回填本文件中的 P0-1 / P0-3 进度。

第二执行片已开始并完成代码级接入：

1. 接入 `taro` / `feishu` / `tt` / `wx` / `lynx` / `harmony` 的 app-scoped installers。
2. 新增对应 public app creators。
3. 用单测确认 public creator bootstrap pipeline。

下一步需要在发布测试版后，借助外部项目环境逐端补 create/render/release/recreate smoke；在真实端环境到位前，本仓库只能关闭代码级架构一致性，不能宣称端侧 Tier 1 完成。

## 5. Stop Rules

遇到以下情况必须停止并回到架构判断：

1. 某环境需要改变 `baseAttributes + resolvedStatePatch -> attribute` 静态真值模型。
2. 某环境只能通过 root legacy singleton 才能渲染，且没有 app-scoped 迁移路径。
3. 某优化需要扩大 `stateProxy` 深层 nested mutation 承诺。
4. 某端缺少真实测试环境，但 release note 准备宣称 Tier 1 正式支持。
5. 为了追求“无后续项”而把未验证能力静默写成 completed。
