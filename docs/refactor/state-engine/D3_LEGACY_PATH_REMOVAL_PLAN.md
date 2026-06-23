# D3 Legacy Path Removal Plan

> **文档类型**：legacy path removal 规划文档
> **用途**：收口“旧 inversify / legacy container 路径还剩什么、如何分阶段迁移、何时才算真正删除完成”
> **当前状态**：待执行
> **重要说明**：本文件不是新的架构设计文档，也不是新的规范源；D3 主规范仍以 `graphic-state-animation-refactor-expectation.md`、`D3_ARCH_DESIGN.md` 和各 Phase 主文档为准

---

## 1. Audit summary

### 1.1 核心运行时已迁移的部分

`vrender-core` 的核心运行时主路径已经完成迁移，正式模型是：

1. `AppContext`
2. factory
3. registry
4. app-scoped `createBrowserApp/createNodeApp`
5. app/context scoped `createStage()`

相关文件：

- [packages/vrender-core/src/entries/app-context.ts](/Users/bytedance/Documents/GitHub/VRender2/packages/vrender-core/src/entries/app-context.ts)
- [packages/vrender-core/src/entries/browser.ts](/Users/bytedance/Documents/GitHub/VRender2/packages/vrender-core/src/entries/browser.ts)
- [packages/vrender-core/src/entries/node.ts](/Users/bytedance/Documents/GitHub/VRender2/packages/vrender-core/src/entries/node.ts)

因此，当前不能说“core 仍依赖第三方 inversify 才能运行”。这部分已经不是问题核心。

### 1.2 仍在承担功能的 compatibility bridge

当前仓库里仍保留并真实承担功能的是一套 **legacy binding compatibility path**。

核心桥接点包括：

1. `getLegacyBindingContext()`
2. legacy `bind / rebind / toService / inSingletonScope`
3. `configureLegacyApplication()`
4. deprecated `createStage()`
5. `legacy -> app registry sync`

相关文件：

- [packages/vrender-core/src/legacy/binding-context.ts](/Users/bytedance/Documents/GitHub/VRender2/packages/vrender-core/src/legacy/binding-context.ts)
- [packages/vrender-core/src/legacy/bootstrap.ts](/Users/bytedance/Documents/GitHub/VRender2/packages/vrender-core/src/legacy/bootstrap.ts)
- [packages/vrender-core/src/modules.ts](/Users/bytedance/Documents/GitHub/VRender2/packages/vrender-core/src/modules.ts)
- [packages/vrender-core/src/create.ts](/Users/bytedance/Documents/GitHub/VRender2/packages/vrender-core/src/create.ts)
- [packages/vrender/src/entries/bootstrap.ts](/Users/bytedance/Documents/GitHub/VRender2/packages/vrender/src/entries/bootstrap.ts)
- [packages/vrender/src/legacy.ts](/Users/bytedance/Documents/GitHub/VRender2/packages/vrender/src/legacy.ts)

这意味着现状不是“旧路径只剩几个死导出”，而是“兼容桥仍然在正式功能链路里工作”。

### 1.3 残留主要集中在哪些包

当前残留的主承担面不在 core 主运行时，而在以下包和入口层：

1. `vrender-kits`
   - env / register / picker 仍主要以 legacy binding context 为装配目标
2. `vrender-components`
   - poptip / scrollbar 等插件装配仍直接绑定到 legacy context
3. `vrender`
   - legacy bootstrap 仍通过 `legacy -> app registry sync` 兜底
   - deprecated `createStage()` 仍是 repo 内部大量调用的入口
4. `react-vrender`
   - `Stage.tsx` 仍直接调用 deprecated `createStage()`
5. browser smoke/demo pages
   - 大量页面仍直接使用 `createStage()`，少量页面还直接使用 `getLegacyBindingContext()`
6. `docs/demos`
   - 仍直接使用 `createStage()`
   - `package.json` 仍保留 `inversify`

### 1.4 文本/依赖/历史资产残留

以下项也尚未完全清理，但优先级应低于 runtime 主链迁移：

1. `docs/demos/package.json` 中的 `inversify`
2. lockfile 中的 `inversify@6.0.1`
3. 文档、生成产物、历史测试/示例中的旧引用

这些项不应被误认为“已经构成当前核心运行时依赖”，但如果目标是“完整删除旧路径”，它们最终也必须收口。

---

## 2. Removal target definition

### 2.1 什么叫“旧路径完整删除”

只有同时满足以下三层，才可以宣称“旧路径完整删除”：

1. `P0` 正式运行时代码不再依赖 legacy binding path
2. `P1` 仓库内部调用不再走 deprecated `createStage` / legacy bootstrap
3. `P2` 文档、demo、生成产物、lockfile 清理完成

也就是说：

> **完整删除 = P0 + P1 + P2 全部完成**

### 2.2 什么叫“可接受的暂时兼容保留”

可接受的暂时兼容保留，必须满足：

1. 仅作为 deprecated compatibility surface 对外保留
2. 不再承担 repo 内部正式 runtime 正常工作的必要条件
3. 不再被 repo 内部源码 / 测试 / smoke / demo 作为主路径消费

如果一个 compatibility bridge 仍是仓库内部运行所必需，它就不能被定义为“可接受的暂时保留”。

### 2.3 本轮验收目标应落在哪一层

我正式拍板：

1. `P0` runtime removal：必须做
2. `P1` internal caller removal：必须做
3. `P2` hygiene cleanup：**同样必须做，才允许继续宣称 handoff ready**

原因：

1. 当前 handoff 对象是上层图表库，不只是 core 内核开发者
2. 如果 demo/docs/内部 smoke 仍大量走旧入口，上层接入时仍会被旧路径持续误导
3. 因此这次 handoff 目标不是“runtime 大体已迁移”，而是“仓库对外与对内口径都收口”

---

## 3. Migration plan by package

### 3.1 `vrender-kits`

#### 当前为什么还在用 legacy path

`vrender-kits` 当前的 env / register / picker 装配，默认目标仍是 `getLegacyBindingContext()`：

- [packages/vrender-kits/src/env/browser.ts](/Users/bytedance/Documents/GitHub/VRender2/packages/vrender-kits/src/env/browser.ts)
- [packages/vrender-kits/src/register/register-rect.ts](/Users/bytedance/Documents/GitHub/VRender2/packages/vrender-kits/src/register/register-rect.ts)
- [packages/vrender-kits/src/picker/canvas-module.ts](/Users/bytedance/Documents/GitHub/VRender2/packages/vrender-kits/src/picker/canvas-module.ts)

这说明 kits 不是“只剩几个旧 helper”，而是在实际决定 env / graphic / picker 是否真正注册。

#### 新路径应替换成什么

必须新增并推广 **app-scoped installer path**，统一以 `app` 或 `app.context` 为装配目标：

1. env installer
2. graphic/register installer
3. picker installer

目标是：

1. 不再默认落到 `getLegacyBindingContext()`
2. 不再依赖 legacy `bind/rebind/toService`
3. 能直接把 renderer / picker / env 装配到当前 app registry / factory

#### 是否允许暂时保留 compatibility bridge

允许保留 deprecated wrapper，但只允许作为对外 compatibility facade；不允许继续作为 repo 内部主路径。

#### 迁移完成后的验证

1. `packages/vrender-kits rushx compile`
2. kits 的 env/register/picker 单测
3. `packages/vrender` browser smoke baseline
4. hidden Electron renderer regression 场景
5. 验证不再依赖 `legacy -> app registry sync`

### 3.2 `vrender-components`

#### 当前为什么还在用 legacy path

`loadPoptip()` / `loadScrollbar()` 仍直接绑定到 legacy context：

- [packages/vrender-components/src/poptip/module.ts](/Users/bytedance/Documents/GitHub/VRender2/packages/vrender-components/src/poptip/module.ts)
- [packages/vrender-components/src/scrollbar/module.ts](/Users/bytedance/Documents/GitHub/VRender2/packages/vrender-components/src/scrollbar/module.ts)

#### 新路径应替换成什么

统一切到 app/plugin model：

1. 通过 `app.installPlugin(...)`
2. 或通过 app-scoped registry/contribution installer 完成插件装配

组件模块不应再直接触碰 legacy binding context。

#### 是否允许暂时保留 compatibility bridge

可以短期保留 deprecated wrapper，但 repo 内部不得继续把它作为正式功能链的唯一装配路径。

#### 迁移完成后的验证

1. `packages/vrender-components rushx compile`
2. components unit/electron/browser example 测试
3. poptip / scrollbar 的真实功能 smoke

### 3.3 `vrender`

#### 当前为什么还在用 legacy path

`vrender` 当前仍依赖两个 legacy 点：

1. `vrender/src/entries/bootstrap.ts` 里的 `legacy -> app registry sync`
2. `vrender/src/legacy.ts` 里的 deprecated `createStage()`

前者仍是真实运行时桥接，后者仍是 repo 内部大量消费的入口。

#### 新路径应替换成什么

1. `bootstrapVRenderBrowserApp / bootstrapVRenderNodeApp`
   - 直接把默认 pipeline 安装到 app registry
   - 不再通过 legacy context 预注册后再同步
2. repo 内部统一改用：
   - `createBrowserVRenderApp()`
   - `createNodeVRenderApp()`
   - `app.createStage()`

#### 是否允许暂时保留 compatibility bridge

`vrender/src/legacy.ts` 可短期保留为对外 deprecated facade。  
但 `legacy -> app registry sync` 只能视为短期桥接，不得视为正式机制。

#### 迁移完成后的验证

1. `packages/vrender rushx compile`
2. `packages/vrender rushx test`
3. browser smoke baseline
4. renderer blank-page regression 场景

### 3.4 `react-vrender`

#### 当前为什么还在用 legacy path

[packages/react-vrender/src/Stage.tsx](/Users/bytedance/Documents/GitHub/VRender2/packages/react-vrender/src/Stage.tsx) 仍直接调用 deprecated `createStage()`。

#### 新路径应替换成什么

必须切到 app/createStage 新入口模型。建议固定为：

1. mount 时创建 `createBrowserVRenderApp()`
2. 使用 `app.createStage()`
3. unmount 时：
   - 先清 reconciler container
   - 再 `stage.release()`
   - 最后 `app.release()`

#### 是否允许暂时保留 compatibility bridge

不允许。  
`react-vrender` 是仓库内部绑定层，不能继续依赖 deprecated facade。

#### 迁移完成后的验证

1. `packages/react-vrender rushx compile`
2. `packages/react-vrender rushx test`
3. `packages/vrender` 中 `react.tsx` smoke 页

### 3.5 `docs/demos`

#### 当前为什么还在用 legacy path

当前只有一个 demo 页，仍直接调用 `createStage()`：

- [docs/demos/src/pages/rect.ts](/Users/bytedance/Documents/GitHub/VRender2/docs/demos/src/pages/rect.ts)

同时 `package.json` 里仍保留 `inversify`：

- [docs/demos/package.json](/Users/bytedance/Documents/GitHub/VRender2/docs/demos/package.json)

#### 新路径应替换成什么

1. 页面入口改为 app-scoped stage 创建
2. 迁移完成后再清理 `inversify`

#### 是否允许暂时保留 compatibility bridge

不建议。  
既然 `docs/demos` 已在 handoff 范围内，P2 也被纳入 handoff gate，就不应再继续保留旧入口。

#### 迁移完成后的验证

1. `docs/demos` 本地可启动并渲染
2. `package.json` / lockfile 清理一致

### 3.6 browser smoke/demo pages

#### 当前为什么还在用 legacy path

`packages/vrender/__tests__/browser/src/pages/*` 中绝大多数页面仍直接调用 deprecated `createStage()`；少量页面还直接使用 `getLegacyBindingContext()`。

#### 新路径应替换成什么

1. baseline smoke 页优先全部切到 `createBrowserVRenderApp().createStage()`
2. 依赖 kits/components 的页改走新的 app-scoped installer
3. 非 baseline 历史页允许分批迁移，但不能继续充当当前 handoff smoke 证据

#### 是否允许暂时保留 compatibility bridge

非 baseline 历史页可以暂留，但必须：

1. 明确标记为 historical/non-baseline
2. 不再作为当前 handoff 证据

#### 迁移完成后的验证

1. `packages/vrender rushx start` baseline smoke 全绿
2. triage 表明确哪些历史页暂留

---

## 4. Compatibility policy

### 4.1 `getLegacyBindingContext()`

正式进入 `deprecated-only` 状态。

政策：

1. 允许保留
2. 不再允许 repo 内部 runtime 源码、React 绑定、baseline smoke、正式测试继续依赖
3. 仅允许：
   - compatibility adapter
   - 显式 legacy tests
   - 必须单独标识的历史示例

### 4.2 `vrender/src/legacy.ts` 的 `createStage()`

政策：

1. 可短期保留为对外 deprecated facade
2. 不允许 repo 内部继续使用
3. 不能再作为 `react-vrender`、browser smoke、repo 自有 tests/examples 的主入口

### 4.3 `react-vrender`

政策：

1. 必须切到 app/createStage 新入口模型
2. 不接受继续内部依赖 deprecated `createStage()` 的方案

### 4.4 `vrender` bootstrap 里的 legacy-to-registry sync

政策：

1. 明确定义为短期桥接
2. 不视为正式机制
3. 一旦 `vrender-kits` / `vrender-components` 的 app-scoped installer 到位，就应删除

### 4.5 `vrender-core` 的 legacy exports

政策：

1. 短期可保留
2. 但必须视为 quarantine area，不再与默认主入口口径混淆
3. 中期应迁移到显式 legacy 子入口，或从默认 index 中剥离

---

## 5. Verification gate

### 5.1 `P0` Runtime gate

必须同时满足：

1. 代码扫描
   - `packages/vrender-kits/src`
   - `packages/vrender-components/src`
   - `packages/vrender/src`
   - `packages/react-vrender/src`
   中不再存在 runtime 主路径对 `getLegacyBindingContext()`、legacy `bind/rebind/toService`、`syncLegacyPipelineToAppRegistry()` 的依赖
2. compile
   - `packages/vrender-core`
   - `packages/vrender-kits`
   - `packages/vrender-components`
   - `packages/vrender`
   - `packages/react-vrender`
3. 单测
   - `packages/vrender-core rushx test`
   - `packages/vrender rushx test`
   - `packages/react-vrender rushx test`
   - kits/components 对应 env/register/picker/plugin 单测
4. smoke
   - `packages/vrender rushx start` baseline smoke
   - hidden Electron renderer regression

### 5.2 `P1` Internal caller gate

必须同时满足：

1. 代码扫描
   - repo 内部源码、tests、browser smoke、demo 不再调用 deprecated `createStage()`
2. browser smoke
   - baseline 页全绿
   - 非 baseline 页 triage 完整
3. React 绑定
   - `packages/react-vrender` compile/test 通过
   - `react.tsx` smoke 页通过
4. components
   - poptip / scrollbar 功能 smoke 通过

### 5.3 `P2` Hygiene gate

必须同时满足：

1. `docs/demos/package.json` 不再保留无用 `inversify`
2. lockfile 中不再保留无主依赖的 `inversify`
3. 文档、生成产物、历史引用扫描完成并清理

### 5.4 如何确认不是“只改 import，功能链路断了”

必须额外看 3 类证据：

1. renderer / picker / plugin 是否真实注册到 app registry
2. baseline smoke 页是否真实有首帧、交互和状态变化
3. React / components 的生命周期和插件行为是否仍成立

---

## 6. Recommended execution order

### 6.1 先做什么

1. `vrender-kits`
   - env / register / picker 先切到 app-scoped installer
2. `vrender-components`
   - plugin 装配切到 app/plugin model
3. `vrender`
   - 删除 `legacy -> app registry sync`
   - repo 内部统一改用 app-scoped entry
4. `react-vrender`
   - 切到 app-scoped Stage model

### 6.2 后做什么

5. repo 内部 tests / browser smoke / demo 的 `P1` 清理
   - baseline smoke 页优先
   - 其余内部 tests/examples/demo 分批退出 deprecated `createStage`

### 6.3 最后做什么

6. `docs/demos` / lockfile / 文档资产的 `P2` 卫生清理

### 6.4 handoff 结论

当前 handoff 门槛应明确为：

> **legacy path removal 的 `P0 + P1 + P2` 全部完成后，才允许继续宣称 handoff ready。**

换句话说：

1. 只完成 `P0`：不够
2. 完成 `P0 + P1`：仍不够
3. 只有 `P0 + P1 + P2` 全部完成，才能对外宣称：
   - legacy path removal 已收口
   - 当前仓库可按新入口模型 handoff
