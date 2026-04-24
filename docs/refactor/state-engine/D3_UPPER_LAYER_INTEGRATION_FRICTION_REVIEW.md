# D3 Upper-Layer Integration Friction Review

> **文档类型**：上层接入困难点评审文档
> **用途**：从 `vchart` / `vtable` / 其它上层仓库使用者与维护者视角，评估当前 app-scoped `app + stage` 接入模型的真实摩擦点、归因层级与后续动作
> **当前状态**：评审完成
> **范围边界**：本文件不继续处理 alpha blocker、不做性能专项、不重开 D3 主架构；只评估当前接入体验是否足够好用、哪里仍会影响上层接入成功率

---

## 1. Problem framing

### 1.1 Current status update

本评审中的“新入口 TypeScript API 表达过弱”已经被后续治理任务收口：`createBrowserVRenderApp()` / `createNodeVRenderApp()` 的 public typing 已修正为返回 `IApp`，并补了类型与构建产物一致性检查。

因此，当前仍需要 post-alpha 继续处理的高优先级摩擦主要是：

1. `VChart` source-level external-stage-first 对齐
2. external stage ownership contract hardening
3. node app-scoped runtime readiness
4. text `stateProxy` 真实上层覆盖
5. multi-env / on-demand 长期 support matrix 与 advanced public surface

执行优先级统一看：

- [D3_POST_ALPHA_WRAPUP_PLAN.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_POST_ALPHA_WRAPUP_PLAN.md)

结论先行：

- 对 **browser + 根包 `@visactor/vrender` + 由调用方自己创建并持有 stage** 的主路径而言，当前新接入方式 **总体可接受**，已经足以作为上层继续验证和迁移的新默认入口。
- 当前最大的摩擦点 **不是** “多了一个 `app` 概念” 本身，而是：
  - 新入口的 **TypeScript API 表达过弱**
  - `app` / `stage` 的 **ownership 与 release 语义表达不够清楚**
  - **多环境支持** 在新路径下已经分层，但非 browser/node 的 app-scoped 一等入口还不完整
  - **按需装配** 仍然存在，但没有跟着新主路径一起升级成同等清晰的 app-scoped contract
  - **node readiness** 与 **external stage ownership** 仍有真实边界项
- 因此，当前问题不能只归因为“正常迁移成本”。其中至少有两类会直接影响上层 agent 或业务开发者一次做对的概率：
  - `createBrowserVRenderApp()` / `createNodeVRenderApp()` 的发布类型面仍返回 `object`，会逼迫 TypeScript 调用方做 `any/cast`
  - ownership/release 边界没有被当前文档充分讲透，已经在上层仓库暴露为 external stage release 误判风险

本次评审依据的主要事实面：

- 上层接入指南：`docs/refactor/state-engine/D3_UPPER_LAYER_ADOPTION_GUIDE.md:23-148`
- legacy removal 收口证据：`docs/refactor/state-engine/D3_LEGACY_PATH_REMOVAL_STATUS.md:30-56`, `96-119`
- browser smoke / triage 结论：`docs/refactor/state-engine/D3_PRE_HANDOFF_SMOKE_TRIAGE.md:10-115`
- alpha coordination 中的剩余跨仓库边界：`docs/refactor/state-engine/D3_ALPHA_COORDINATION.md:32-49`, `116-125`
- 根包入口与 compat surface：`packages/vrender/src/index.ts:5-10`, `packages/vrender/src/legacy.ts:8-25`
- app ownership / release 真实行为：`packages/vrender-core/src/entries/app-context.ts:91-134`
- React 绑定当前生命周期顺序：`packages/react-vrender/src/Stage.tsx:19-25`, `57-97`

---

## 2. Current usage model

结论先行：

- 当前最自然的上层接入路径已经不是 root `createStage()`，而是“**先创建 app，再由 app 创建 stage**”。
- 这条路径相比旧 `createStage()` 在概念上 **略复杂**，但如果把 lifecycle 说清楚，它在 stage recreate、多 stage 和自定义装配场景下比旧路径更清晰。
- 当前真正的问题是：这套模型在代码里已经成立，但在 API 表达和文档呈现上还没有同样清晰。

说明：

- 本节提到的“按需加载”主要指 **runtime-level 的按需环境/图形/picker 装配与注册**，不是这轮没有量化的 bundle tree-shaking 结论。

### 2.1 上层现在需要理解的概念

上层要正确接入，至少需要理解下面 5 个概念：

1. **入口层级**：默认优先用根包 `@visactor/vrender`，而不是直接从 `@visactor/vrender-core` / `@visactor/vrender-kits` 自己拼装。根包入口会自动跑默认 bootstrap 安装链，见 `packages/vrender/src/index.ts:5-10`, `packages/vrender/src/entries/browser.ts:12-13`, `packages/vrender/src/entries/node.ts:12-13`。
2. **运行时选择**：browser 侧用 `createBrowserVRenderApp()`，node 侧用 `createNodeVRenderApp()`；这是 runtime-specific app creator，不再是一个 root `createStage()` 同时兜底所有环境，见 `docs/refactor/state-engine/D3_UPPER_LAYER_ADOPTION_GUIDE.md:57-94`。
3. **ownership**：`app.createStage()` 创建出来的 stage 由 app 跟踪；`app.release()` 会释放它仍然持有的 stage，见 `packages/vrender-core/src/entries/app-context.ts:91-122`。
4. **compat boundary**：根包仍导出 deprecated `createStage()`，但它只是兼容面，会在内部懒创建 singleton app，不应继续扩进新代码，见 `packages/vrender/src/legacy.ts:11-25`。
5. **装配层级**：如果绕过根包直接触达 core/kits，就要自己负责 env / graphics / picker 安装链，见 `packages/vrender-kits/src/installers/app.ts:200-240`。

### 2.2 一个普通业务方最自然的路径

如果业务方只想做“创建一个 browser stage、可重建、页面结束时正确释放”，当前最自然路径应当是：

1. `import { createBrowserVRenderApp } from '@visactor/vrender'`
2. 页面或组件初始化时创建 **一个** app
3. 需要 stage 时调用 `app.createStage(...)`
4. 若同页会多次 recreate stage，则复用同一个 app，只释放旧 stage，再创建新 stage
5. 页面彻底结束时释放 app

这个路径与当前 repo 自己的 helper 和 React 绑定是一致的：

- 简单页面 helper 会直接创建 app 再 `app.createStage(...)`，见 `packages/vrender/__tests__/browser/src/page-stage.ts:7-21`
- 需要重复重建 stage 的页面会复用同一个 app，见 `packages/vrender/__tests__/browser/src/pages/memory.ts:10-24`
- React `Stage` 组件会在 mount 创建 app + stage，在 unmount 时按 `stage.release()` 再 `app.release()` 的顺序释放，见 `packages/react-vrender/src/Stage.tsx:57-97`

### 2.3 相比旧方式是更简单还是更复杂

判断：

- 对 **单 stage、只创建一次就销毁** 的最简单场景，新路径比旧 `createStage()` **略复杂**，因为多了一个 `app`。
- 对 **stage recreate / multi-stage / custom assembly** 场景，新路径 **理论上更清晰**，因为 ownership 从隐式全局/legacy 变成了显式 app scope。
- 当前体感复杂度之所以偏高，主要不是架构本身更差，而是：
  - API 没把“这是一个可操作的 app 接口”表达清楚
  - 文档没有把 app 与 stage 的 release contract 用场景化方式讲清楚

### 2.4 多环境与按需装配在新路径下怎么理解

结论：

1. **多环境能力没有被删除，但已经分层**
   - `vrender-core` 仍保留 `createMiniappApp()`，见 `packages/vrender-core/src/entries/index.ts:1-8`, `packages/vrender-core/src/entries/miniapp.ts:4-11`
   - `vrender-kits` 仍导出 browser / node / feishu / lynx / taro / wx / tt / harmony 等 env loader，见 `packages/vrender-kits/src/env/index.ts:1-11`
   - 但 app-scoped installer surface 当前只有 `installBrowserEnvToApp()` 与 `installNodeEnvToApp()`，见 `packages/vrender-kits/src/installers/app.ts:200-217`
2. **根包推荐入口当前是 browser/node full-default bootstrap，不是多环境统一 creator**
   - `createBrowserVRenderApp()` / `createNodeVRenderApp()` 会直接跑默认 env + graphics + pickers 安装链，见 `packages/vrender/src/entries/bootstrap.ts:150-183`
3. **按需装配能力仍然存在，但主要停留在 legacy 或更底层 surface**
   - legacy 侧仍有按图形注册的 `registerRect()` / `registerLine()` / `registerArc()` 等入口，见 `packages/vrender-kits/src/register/register-rect.ts:6-19`, `packages/vrender-kits/src/register/register-line.ts:6-19`, `packages/vrender-kits/src/register/register-arc.ts:6-19`
   - 这些入口会直接操作 legacy binding context，而不是一个明确的 app-scoped public installer surface
4. **新的根包路径虽然不是按需装配，但它至少把“默认装配何时发生”变成了显式动作**
   - 根包 import 本身不再自动跑 legacy bootstrap，只有显式调用 creator 才会触发默认安装，见 `packages/vrender/__tests__/unit/index.test.ts:4-61`
5. **当前的 app-scoped 也不应被理解成完全隔离的 per-app/per-env runtime container**
   - `runtimeInstallerContext` 与 `runtimeGlobal` 当前仍是 runtime-installer 级单例，见 `packages/vrender-core/src/entries/runtime-installer.ts:34-36`, `89-95`
   - `configureRuntimeApplicationForApp()` 会重写共享的 `application.*` factory，见 `packages/vrender-core/src/entries/runtime-installer.ts:97-120`
   - 因而从实现上推断，当前 app-scoped 更接近“app-scoped registry + stage ownership + bootstrap timing”，而不是完全隔离的多环境容器

因此：

- 对普通 browser/node 上层，当前新路径更像“**全量默认装配的标准入口**”
- 对多环境或强依赖按需装配的上层，当前新路径还不是一条等价替代旧能力的一等路径
- 对同进程混合多环境的调用方，也不应在没有额外验证前假设各 app 已实现完全隔离

---

## 3. Upper-layer friction points

结论先行：

- 当前真正会影响上层接入成功率的摩擦点共有 6 类：**类型面表达、ownership/release 语义、多环境分层缺口、按需装配分层缺口、external stage 边界、node readiness 表达**。
- 其余诸如“browser/node 双入口”“root vs core/kits 分层”“兼容 `createStage()` 仍保留”属于真实摩擦，但多数仍可归为可控迁移成本。

### 3.1 High: 新入口存在，但 TypeScript API 表达仍然过弱

判断：`API 表达问题`

关键事实：

- 发布产物的声明里，`createBrowserVRenderApp()` / `createNodeVRenderApp()` 当前都只返回 `object`，见 `packages/vrender/es/entries/browser.d.ts:1-4`, `packages/vrender/es/entries/node.d.ts:1-4`
- 但 core 内部其实已经存在明确的 `IApp` / `IEntry` 形状，见 `packages/vrender-core/src/entries/types.ts:18-30`
- `react-vrender` 当前必须本地声明 `TVRenderApp` 并用 `(VRender as any).createBrowserVRenderApp()` 强转，见 `packages/react-vrender/src/Stage.tsx:19-25`
- repo 内其它 helper 也都在重复写本地 `TManagedApp` / `as unknown as ...`，见 `packages/vrender/__tests__/util.ts:27-58`, `packages/vrender/__tests__/browser/src/app-stage.ts:3-10`

这为什么是高优先级摩擦：

- 对 TypeScript 上层仓库，这不是“文档写清楚就能消失”的问题；调用方即使知道正确入口，IDE 和类型系统也不会直接告诉它 `app.createStage()` / `app.release()` 是合法的吗。
- 对 agent 来说，这会显著提高误判概率，因为它看到的是 `object` 而不是可操作的 public app interface。
- `D3_LEGACY_PATH_REMOVAL_STATUS.md:48-50` 里“声明面尚未稳定暴露”这句历史描述，本质上也在指向这件事，但当前更准确的表述应是：**入口已经导出，但类型表达仍未完成**。

### 3.2 High: `app` 拥有 `stage` 的 contract 在代码里成立，但在文档和调用面上不够直观

判断：`生命周期/ownership 设计问题` + `文档问题`

关键事实：

- `AppContext.createStage()` 会把创建出的 stage 纳入 `stageResources` 跟踪，见 `packages/vrender-core/src/entries/app-context.ts:91-110`
- `AppContext.release()` 会释放 app 仍持有的所有 stage，再清理 registry/plugin，见 `packages/vrender-core/src/entries/app-context.ts:113-134`
- React 绑定当前采取的释放顺序是：reconciler container -> `stage.release()` -> `app.release()`，见 `packages/react-vrender/src/Stage.tsx:85-93`
- 测试 helper 为了避免“stage 释放了但 app 还悬着”，专门做了 `stage.release => app.release` 的包裹，见 `packages/vrender/__tests__/util.ts:32-58`, `packages/vrender/__tests__/browser/src/app-stage.ts:11-30`

这为什么是高优先级摩擦：

- 上层最容易问的不是“用哪个函数创建”，而是“销毁时到底谁负责谁”。
- 现有 adoption guide 虽然建议“普通单 stage 场景里仍建议 `stage.release()` 后再 `app.release()`”，见 `docs/refactor/state-engine/D3_UPPER_LAYER_ADOPTION_GUIDE.md:76-81`，但没有进一步解释：
  - `app.release()` 是否也会释放 stage
  - 什么场景下应该只释放 stage、什么场景下必须释放整个 app
  - stage recreate 时 app 是否应被保留
- 这意味着文档给了顺序建议，但还没把 ownership contract 讲成“可以不问人就做对”的规则。

### 3.3 High: external stage / external ownership 场景已经暴露出真实误用风险

判断：`需要单独专项治理`

关键事实：

- `D3_ALPHA_COORDINATION.md:122-125` 已明确把“外部传入 stage 被 `chart.release()` 误释放”列为 open blocker
- 当前只读抽查的上层样本里，`VChart` 会把外部传入的 stage 存进内部状态，见 `VChart/packages/vchart/src/core/vchart.ts:401-402`
- `VChart` 当前 `Compiler.release()` 里本意是“不要释放外部传入 stage”，但先把 `_option` 置空后再比较 `_stage !== this._option?.stage`，导致判断恒成立并最终走到 `this._stage.release()`，见 `VChart/packages/vchart/src/compile/compiler.ts:694-704`

这为什么是高优先级摩擦：

- 这不只是单个上层仓库 bug；它说明“stage ownership 来自谁、释放责任归谁”这件事，当前跨仓库契约并没有被表达得足够硬。
- 这类场景不是靠补一段“推荐写法”就能完全消掉，需要一个跨仓库的 ownership contract 对齐任务。

### 3.4 Medium-High: browser / node 双入口本身可理解，但当前文档没有把 node readiness 降级讲清楚

判断：`文档问题` + `需要单独专项治理`

关键事实：

- adoption guide 把 browser 与 node 放成对等推荐入口，见 `docs/refactor/state-engine/D3_UPPER_LAYER_ADOPTION_GUIDE.md:57-94`
- 但 coordination 文档明确写了：`createNodeVRenderApp().createStage()` 的 node runtime 仍是 open blocker，而且不是 browser alpha gate 先决条件，见 `docs/refactor/state-engine/D3_ALPHA_COORDINATION.md:43-49`, `116-125`

这为什么是中高优先级摩擦：

- 对 browser-only 上层，这不是 blocker。
- 对需要 node export / SSR / server-side render path 的上层，这个信息如果不被提前写清楚，就会被误解成“browser 和 node 都已经同样 ready”。
- 所以这里的真正问题不是“双入口太难理解”，而是 **当前 readiness 说明没有分层**。

### 3.5 Medium-High: 多环境支持仍在，但非 browser/node 的 app-scoped 一等路径还不完整

判断：`API 表达问题` + `需要单独专项治理`

关键事实：

- `vrender-core` 仍有 `createMiniappApp()`，见 `packages/vrender-core/src/entries/miniapp.ts:4-11`
- `vrender-kits` 仍保留 feishu / harmony / wx / taro / tt / lynx 等 env loader，见 `packages/vrender-kits/src/env/index.ts:1-11`, `packages/vrender-kits/src/env/feishu.ts:18-31`, `packages/vrender-kits/src/env/harmony.ts:18-31`, `packages/vrender-kits/src/env/wx.ts:19-32`, `packages/vrender-kits/src/env/taro.ts:19-32`, `packages/vrender-kits/src/env/tt.ts:18-31`, `packages/vrender-kits/src/env/lynx.ts:19-32`
- 但 app-scoped installer 当前只有 browser/node 两套，见 `packages/vrender-kits/src/installers/app.ts:200-240`
- `vrender-kits` 的 root installer export 测试当前也只固定 browser/node 两套 app installer surface，见 `packages/vrender-kits/__tests__/unit/root-installer-exports.test.ts:14-29`
- 当前 app bootstrap 对 legacy context 只同步 renderers/pickers，不同步 env contribution，自然也不会把额外 legacy env loader 自动提升为 app-scoped env contract，见 `packages/vrender/src/entries/bootstrap.ts:113-148`, `150-183`
- repo 内现有 triage 已经记录过一条实际混用失败：显式调用 `initBrowserEnv()` / `initFeishuEnv()` / `initAllEnv()` 会打乱 app-scoped browser handler 装配链，见 `docs/refactor/state-engine/D3_LEGACY_PATH_REMOVAL_STATUS.md:232-234`
- 从实现上看，runtime installer 的 binding context 与 global 仍是单例，这也意味着当前多环境 app-scoped 主要是 surface 分层，不应被推断为完整的 per-env runtime isolation，见 `packages/vrender-core/src/entries/runtime-installer.ts:34-36`, `80-120`

这为什么是中高优先级摩擦：

- 从“是否还能做多环境”角度看，答案是 **能，但主要还停留在 legacy/底层 path**。
- 从“新 app-scoped 路径是否已经给多环境提供对等一等入口”角度看，答案是 **没有**。
- 这意味着多环境支持在能力层面没有彻底退化，但在 user-facing contract 上已经变成了不均衡支持。

### 3.6 Medium-High: 按需装配仍存在，但新的主路径不再是按需装配路径

判断：`调用方式约束问题` + `API 表达问题`

关键事实：

- 根包 creator 会自动执行默认 env、默认 graphics、默认 pickers 安装链，见 `packages/vrender/src/entries/bootstrap.ts:150-183`
- `installDefaultGraphicsToApp()` 当前内部是硬编码的默认图形集合，不是按图形的 public installer family，见 `packages/vrender-kits/src/installers/app.ts:93-114`, `185-224`
- `installBrowserPickersToApp()` / `installNodePickersToApp()` 也是默认集合，不是细粒度 picker 装配接口，见 `packages/vrender-kits/src/installers/app.ts:118-136`, `226-240`
- 当前公开的 app-scoped installer surface 里，没有 `installRectToApp()` / `installArcToApp()` 这一类细粒度接口，见 `packages/vrender-kits/src/installers/app.ts:200-240`
- 与此相对，legacy 侧仍然保留 `registerRect()` 这类按图形注册入口，见 `packages/vrender-kits/src/register/register-rect.ts:6-19`
- 根包 import 本身不再自动跑 bootstrap，这是明确化的一步，而不是回归，见 `packages/vrender/__tests__/unit/index.test.ts:4-61`
- 现有“按需加载”样例 `anxu-picker` 仍依赖旧 kits/picker 装配出口，且已被 triage 文档明确排除出 baseline，见 `packages/vrender/__tests__/browser/src/pages/anxu-picker.ts:1-16`, `docs/refactor/state-engine/D3_PRE_HANDOFF_SMOKE_TRIAGE.md:90-100`
- 新默认 browser picker 安装链还曾出现“安装面过宽，把 optional picker 带进默认路径”的偏差，虽已修正，但它说明默认路径与 optional/按需边界目前仍然脆弱，见 `docs/refactor/state-engine/D3_PHASE4_IMPLEMENTATION_LOG.md:570-585`

这为什么是中高优先级摩擦：

- 如果把 root app creator 理解成“标准默认入口”，它的 full-default 行为是合理的。
- 但如果上层之前依赖的是“细粒度按需装配”，那么新的主路径 **并不等价**。
- 所以这里的真实判断不是“按需加载被删除了”，而是：**按需装配还在，但不再是新主路径的一等能力**。

### 3.7 Medium: root package 与 core/kits 直连装配的分层仍然容易被上层选错

判断：`调用方式约束问题` + `文档问题`

关键事实：

- 根包 `@visactor/vrender` 已经把 `core` / `kits` / `animate` / `components` 都一起 re-export，见 `packages/vrender/src/index.ts:5-10`
- 根包 app creator 默认会执行 browser/node bootstrap pipeline，自动安装 env / graphics / pickers / animation，见 `packages/vrender/src/entries/browser.ts:12-13`, `packages/vrender/src/entries/node.ts:12-13`, `packages/vrender/src/entries/bootstrap.ts:150-183`
- 如果上层绕过根包直接走 kits installer，则需要自己理解和执行 app-scoped 安装链，见 `packages/vrender-kits/src/installers/app.ts:200-240`

这为什么是中优先级摩擦：

- adoption guide 已经给出“上层默认优先根包”的正确方向，见 `docs/refactor/state-engine/D3_UPPER_LAYER_ADOPTION_GUIDE.md:128-148`
- 但对不熟仓库结构的 agent 来说，根包 re-export 太多，仍然会诱导它“既然都能 import 到，那我直接从 core/kits 拼也行”。
- 这里更像调用方式边界不够硬，而不是 runtime 主链还没准备好。

### 3.8 Medium: compat `createStage()` 继续保留，迁移期有价值，但会持续制造歧义

判断：`正常迁移成本` + `文档问题` + `默认行为问题`

关键事实：

- 根包仍导出 `createStage`，见 `packages/vrender/src/index.ts:9-10`
- compat 实现会在 browser/node 环境下各自懒创建 singleton app，再把 `createStage()` 转发给该 app，见 `packages/vrender/src/legacy.ts:11-25`
- 根包单测也固定了这种行为，见 `packages/vrender/__tests__/unit/index.test.ts:63-92`

这为什么仍算摩擦：

- 迁移期保留 compat 是合理的，否则大面积 caller 会被一次性打断。
- 但只要它仍与新入口并列出现在根包里，上层就容易继续把它当“最省事的入口”。
- 所以它目前更像一个必要但持续制造歧义的兼容面，而不是新的主用法。

### 3.9 Medium-Low: 默认 browser 入口已经基本开箱即用，这一项本身不是 blocker

判断：`正常迁移成本`

关键事实：

- 根包 browser / node creator 当前默认都会跑 bootstrap 安装链，见 `packages/vrender/__tests__/unit/entries.test.ts:9-83`, `86-156`
- 文档也已经明确“上层默认优先根包，而不是自己补 env / graphics / picker 安装”，见 `docs/refactor/state-engine/D3_UPPER_LAYER_ADOPTION_GUIDE.md:128-148`, `221-239`

结论：

- “默认入口是否足够开箱即用”在 browser root-package 主路径上，当前答案基本是 **是**。
- 这里不应被误判成当前上层接入的主 friction。

---

## 4. Which issues are real blockers vs normal migration cost

结论先行：

- 当前并非所有摩擦都一样严重。
- 真正会影响上层“第一次就接对”的 blocker，集中在 **类型面、ownership、multi-env 非对等支持、on-demand 非一等支持、external stage、node readiness**。
- `app` 概念引入本身、browser/node 双入口本身、root vs core/kits 分层本身，多数仍属于可以接受的迁移成本。

### 4.1 Real blockers

1. **新 app creator 的 TS 类型面太弱**
   - 归类：`API 表达问题`
   - 为什么算 blocker：TypeScript 上层调用会直接撞到 `object` 返回值，不能靠文档完全兜住。
2. **ownership / release contract 没有被当前文档讲透**
   - 归类：`文档问题` + `生命周期/ownership 设计问题`
   - 为什么算 blocker：recreate、页面 teardown、helper 编写、React unmount 都依赖这条 contract。
3. **external stage ownership 当前仍会触发真实释放错误**
   - 归类：`需要单独专项治理`
   - 为什么算 blocker：这已经不是理论上的“可能踩坑”，而是 coordination 文档里挂账的现存问题。
4. **node app-scoped runtime readiness 未与 browser 分层表达**
   - 归类：`文档问题` + `需要单独专项治理`
   - 为什么算 blocker：对需要 node path 的上层，这是 readiness 风险而不是学习成本。
5. **非 browser/node 环境在新路径下还没有对等的 app-scoped 一等入口**
   - 归类：`API 表达问题` + `需要单独专项治理`
   - 为什么算 blocker：对多环境上层，这已经不是文档能单独补平的差距。
6. **按需装配能力仍在，但没有对应的一等 app-scoped public surface**
   - 归类：`调用方式约束问题` + `API 表达问题`
   - 为什么算 blocker：对依赖 minimal assembly 的上层，这不是简单改调用名就能完成的迁移。

### 4.2 Normal migration cost

1. **从 `createStage()` 迁到 `app.createStage()` 需要多理解一个 `app`**
   - 归类：`正常迁移成本`
   - 说明：这是显式 ownership 换来的额外概念负担，本身可以接受。
2. **browser / node 使用两套 creator**
   - 归类：`正常迁移成本`
   - 说明：只要 readiness 被写清楚，这不是异常复杂设计。
3. **同页多 stage / recreate 需要复用 app**
   - 归类：`调用方式约束问题`
   - 说明：这是需要记住的 usage rule，但不是架构错误。
4. **root package 与 core/kits 分层需要做选择**
   - 归类：`调用方式约束问题`
   - 说明：对高级自定义装配是正常成本，对普通上层应通过“默认根包”原则压平。

### 4.3 Boundary For Multi-Env And On-Demand Consumers

判断：

- 对 **browser/node + 默认装配** 的上层，本轮结论仍然是“可接受，可继续迁移”。
- 对 **非 browser/node 环境** 的上层，当前 app-scoped 路径还不能被描述成“已经完整承接旧 multi-env 能力”。
- 对 **依赖按需装配** 的上层，当前 app-scoped 路径更像“默认全量入口”，不能直接等价成旧的细粒度装配模型。

---

## 5. Documentation adequacy

结论先行：

- `D3_UPPER_LAYER_ADOPTION_GUIDE.md` **方向正确、信息量也不低**，但它 **还不足以** 让上层 agent 在“不问人”的前提下稳定处理所有关键接入场景。
- 它已经覆盖了“推荐入口、compat boundary、root vs core/kits、迁移 grep/checklist”这些大方向，但仍缺少 **ownership / lifecycle 场景化表达** 与 **当前 readiness caveat**。
- 它也没有把 **multi-env / on-demand 在新路径下的分层变化** 讲清楚。

### 5.1 已经足够好的部分

1. **推荐入口清楚**
   - 已经明确新代码优先 `createBrowserVRenderApp()` / `createNodeVRenderApp()`，见 `docs/refactor/state-engine/D3_UPPER_LAYER_ADOPTION_GUIDE.md:27-29`, `57-94`
2. **compat boundary 清楚**
   - 已经写清 `createStage()` 仍能跑，但属于 deprecated compat surface，见 `docs/refactor/state-engine/D3_UPPER_LAYER_ADOPTION_GUIDE.md:106-125`
3. **根包优先原则清楚**
   - 已经写清上层默认优先 `@visactor/vrender`，而不是直接从 core 拼装，见 `docs/refactor/state-engine/D3_UPPER_LAYER_ADOPTION_GUIDE.md:128-148`
4. **迁移 checklist 已有实操价值**
   - 已经提供 grep 入口和 smoke 建议，见 `docs/refactor/state-engine/D3_UPPER_LAYER_ADOPTION_GUIDE.md:242-331`

### 5.2 目前仍不够的部分

1. **ownership 说明不够**
   - 缺少一句明确 contract：`app` 拥有自己创建的 stage，`app.release()` 会释放其仍持有的 stage。
2. **生命周期步骤不够场景化**
   - 缺少“单 stage、recreate、多 stage、external canvas、external stage”五类场景矩阵。
3. **API 选择 guidance 还不够硬**
   - 还缺少一句更强的决策规则：普通上层不要混用 root 默认 bootstrap 与 core/kits 手动安装。
4. **node readiness caveat 没有前置**
   - 当前 guide 会被误读为 browser/node readiness 对等。
5. **类型面 caveat 完全没有写**
   - 当前 guide 没提醒 TS 调用方：新入口虽已导出，但 public typing 仍偏弱。
6. **multi-env 路由规则没有写**
   - 当前 guide 没说明：browser/node 是 app-scoped 一等路径，其他环境当前更多仍停留在 legacy/底层 path。
7. **on-demand guidance 没有写**
   - 当前 guide 没说明：root app creator 是默认全量装配入口，不是细粒度按需装配入口。
8. **multi-env isolation caveat 没有写**
   - 当前 guide 没说明：app-scoped 当前更接近 registry/lifecycle scope，不应默认推断成完全隔离的 per-app/per-env runtime container。

### 5.3 其它文档的适配度

1. **`D3_LEGACY_PATH_REMOVAL_STATUS.md`**
   - 适合看收口证据，不适合直接当上层接入指南。
   - 其中 `30-56` 对 React 切换到 app-scoped 模型的事实有价值，但 `48-50` 的描述已经带有阶段性历史色彩，不能直接替代当前 user-facing guidance。
2. **`D3_PRE_HANDOFF_SMOKE_TRIAGE.md`**
   - 适合提供 smoke baseline 与迁移样本，尤其是 `107-115` 的“应写入上层接入说明的迁移结论”。
   - 但它不是 lifecycle / ownership 指南。
3. **`D3_ALPHA_COORDINATION.md`**
   - 当前最有价值的是它保留了 node blocker 与 external stage ownership 这两个仍然需要上层知道的 caveat，见 `116-125`。
   - 这些 caveat 目前没有被 adoption guide 前置表达出来。

本轮判断：

- 现有文档 **不是“不够详细”**，而是 **缺少最关键的 ownership/lifecycle/typing/readiness 几条硬规则**。
- 因此问题重点不在“再加更多背景”，而在“把最容易做错的地方写成明确规则”。

---

## 6. Recommended actions

结论先行：

- 当前最优先动作不是重开 API 大设计，而是按层次处理。
- 第一优先级应是：**补齐文档里的 ownership/lifecycle/readiness 规则**，并 **修正新入口的 public typing**。
- 对多环境与按需装配，还需要额外把“能力仍在，但路径已分层”写成硬规则，否则上层会误把默认入口当成全场景入口。
- external stage ownership 与 node runtime 不适合在这轮 review 里顺手解决，应单独挂任务。

### 6.1 只补文档即可

1. 在 `D3_UPPER_LAYER_ADOPTION_GUIDE.md` 增加一个“场景矩阵”小节，覆盖：
   - browser 单 stage
   - stage recreate
   - 同页多 stage
   - external canvas
   - external stage ownership
2. 明确写一条 ownership contract：
   - `app.createStage()` 创建出的 stage 归该 app 管理
   - `app.release()` 会释放仍由该 app 跟踪的 stage
   - external stage 若由上层传入，所有权仍归创建者
3. 在 guide 的入口推荐处加一句 readiness caveat：
   - browser path 是当前主推荐路径
   - node path 仍需参考 coordination 中的已知边界
4. 在 compat 小节补一句更硬的说明：
   - root `createStage()` 仍会工作，但它内部走的是 compat singleton app，不应继续扩进新调用方
5. 增加一张 multi-env / on-demand routing table：
   - browser/node 默认接入：根包 app creator
   - 非 browser/node 环境：当前仍主要依赖 legacy/底层 env loader，不能假设已存在对等 app-scoped creator
   - 强依赖按需装配：当前不要把 root app creator 当成细粒度装配接口
6. 增加一句 isolation caveat：
   - app-scoped 当前不等于完全隔离的 per-app/per-env runtime container；混合多环境进程要单独验证

### 6.2 需要上层调用方式明确约束

1. 上层普通业务默认应坚持：
   - 根包 `@visactor/vrender`
   - runtime-specific app creator
   - `app.createStage()`
2. 同页多次重建 stage 时，应复用同一个 app，而不是每次 recreate 都重新拼装运行时。
3. 接受 external stage 的上层框架必须显式区分：
   - 自己创建并拥有的 stage
   - 外部传入、自己只借用的 stage
4. 同一个 caller 不应混用：
   - 根包默认 bootstrap
   - core/kits 手动 env/graphics/picker 安装
5. 如果上层明确需要非 browser/node 环境或细粒度装配，应先把自己归类为“高级自定义装配 caller”，不要直接套 browser/node 默认指南。

### 6.3 建议 VRender API / 默认行为优化

1. 把 `createBrowserVRenderApp()` / `createNodeVRenderApp()` 的 public return type 从 `object` 改成显式 app interface
   - 最直接的目标类型可以复用 `vrender-core` 中已有的 `IApp` / `IEntry` 形状，见 `packages/vrender-core/src/entries/types.ts:18-30`
2. 保持 compat `createStage()`，但把 deprecation 语义再做强一点
   - 至少要确保上层在类型提示和文档中不会把它误读成仍推荐的新主入口
3. 若后续评估仍显示单 stage ownership 频繁被误用，再考虑补一个轻量 helper
   - 但这应放在 typing 修正与文档补齐之后，而不是现在先重做 API
4. 如果多环境仍是正式产品能力，应补齐 app-scoped env installer / creator 族，而不是长期只靠 legacy env loader 兜底
5. 如果按需装配仍是正式产品能力，应补齐细粒度 app-scoped installer surface，或者明确宣告 root app creator 故意只做 full-default path
6. 如果“同进程混合多环境”仍是正式承诺，应评估是否继续接受 `runtimeInstallerContext` / `runtimeGlobal` / `application.*` 的共享单例实现；若接受，也需要把边界文档化

### 6.4 建议单独开任务，不适合当前 alpha 线顺手改

1. **Cross-repo external stage ownership 治理**
   - 目标：把“谁创建，谁释放”写成跨仓库一致 contract，并修正上层现存误释放点
2. **Node app-scoped runtime readiness 治理**
   - 目标：让 node path 的 readiness、验证基线和 browser path 分层清楚，而不是继续混在一个“推荐入口”表述里
3. **Upper-layer typing hardening**
   - 目标：确保上层 TypeScript 仓库与 agent 不需要 `any/cast` 才能正确消费新 app-scoped 入口
4. **Multi-env app-scoped surface 治理**
   - 目标：决定 feishu / harmony / wx / taro / tt / lynx / miniapp 等环境，到底要不要进入一等 app-scoped 契约；若要，就补齐对应 surface
5. **App-scoped on-demand assembly 治理**
   - 目标：决定“按需装配”是否仍作为正式承诺保留；若保留，就补齐 public installer surface，而不是只剩 legacy/内部 escape hatch

---

## 7. Conclusion

最终结论：

- 当前新的 app-scoped 接入方式，对 **browser 主路径** 来说 **总体可接受**，可以继续作为上层仓库的新默认接入方向。
- 但它 **还没有好到“上层 agent 不问人也能稳定一次做对所有场景”**。当前最大的摩擦点不是 app 概念本身，而是：
  - **新入口类型面过弱**
  - **ownership / lifecycle contract 表达不够清楚**
  - **multi-env 能力仍在，但非 browser/node 的 app-scoped 契约还不完整**
  - **按需装配能力仍在，但不再是新主路径的一等能力**
  - **external stage ownership 与 node readiness 仍有真实边界项**

因此当前最合理的优先级是：

1. 先补齐文档里的 ownership/lifecycle/readiness 规则
2. 紧接着修正 app creator 的 public typing
3. 再把 multi-env / on-demand 的分层边界写清楚
4. 对 external stage ownership、node runtime、multi-env surface、on-demand app installer 单独开后续治理任务

如果只问一句“当前新接入方式对上层是否总体可接受”，答案是：

- **在 browser root-package 主路径下，可以接受**
- **在 TS-heavy、external-stage、node-path、multi-env、on-demand assembly，以及需要同进程混合多环境隔离的场景下，还不能把它描述成已经完全低摩擦**

如果只问一句“当前最大的 friction 是什么”，答案是：

- **不是多了一个 `app`**
- **而是 app 虽已成为真实 ownership 边界，但这个边界还没有被类型系统、文档和跨仓库契约同时表达清楚**
