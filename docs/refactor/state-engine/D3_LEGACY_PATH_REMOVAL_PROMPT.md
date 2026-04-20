# D3 Legacy Path Removal 执行 Prompt

> **文档类型**：开发者执行 Prompt
> **用途**：指导实现 agent 收口 legacy binding / deprecated createStage / docs-demo 旧路径
> **当前状态**：待执行
> **重要说明**：本文件不是新的架构设计文档；执行边界以 `D3_LEGACY_PATH_REMOVAL_PLAN.md` 和 `D3_PRE_HANDOFF_HARDENING.md` 为准

---

你现在负责执行 D3 的 legacy path removal。

注意：

1. 这不是新阶段，不是 Phase 5。
2. 不重开 D3 Phase 1-4 主设计。
3. 这轮只收口 legacy binding / deprecated entry / docs-demo 旧路径。
4. 当前 handoff 门槛已被收紧为：`P0 + P1 + P2` 全部完成后，才允许继续宣称 handoff ready。

你必须先读：

1. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/graphic-state-animation-refactor-expectation.md`
2. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_ARCH_DESIGN.md`
3. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PRE_HANDOFF_HARDENING.md`
4. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_LEGACY_PATH_REMOVAL_PLAN.md`
5. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_ARCHIVE_INDEX.md`
6. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_FOLLOWUPS.md`
7. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE4_IMPLEMENTATION_LOG.md`

执行原则：

1. 先切 runtime 依赖，再切 repo 内部调用，再做 hygiene 清理。
2. 不要只改 import；必须证明功能链路没有断。
3. 不允许把 compatibility bridge 继续当作 repo 内部主路径。
4. 不允许把 `react-vrender` 继续留在 deprecated `createStage()` 上。

本轮目标分三层，三层都必须完成：

## P0 Runtime removal

目标：

1. `vrender-kits` runtime 主路径不再依赖 `getLegacyBindingContext()`
2. `vrender-components` runtime 主路径不再依赖 `getLegacyBindingContext()`
3. `vrender` bootstrap 不再依赖 `legacy -> app registry sync`
4. `react-vrender` runtime 主路径切到 app/createStage 模型

## P1 Internal caller removal

目标：

1. repo 内部源码 / tests / browser smoke / demo 不再使用 deprecated `createStage()`
2. baseline smoke 页全部走 app-scoped 新入口
3. 非 baseline 历史页允许暂留，但不得继续充当 handoff 证据

## P2 Hygiene cleanup

目标：

1. `docs/demos` 页面切到新入口
2. `docs/demos/package.json` 中无用 `inversify` 删除
3. lockfile 中无主 `inversify` 清理
4. 文档 / 生成产物 / 历史引用扫描清理完成

按包拆分的执行要求：

### 1. `vrender-kits`

- 当前问题：
  env / register / picker 默认仍以 legacy binding context 为装配目标
- 迁移目标：
  改成 app-scoped installer surface
- 验证：
  kits compile + env/register/picker 单测 + `packages/vrender` baseline smoke

### 2. `vrender-components`

- 当前问题：
  `loadPoptip` / `loadScrollbar` 仍直接绑定 legacy context
- 迁移目标：
  改成 app/plugin model
- 验证：
  components compile + unit/electron/browser example + poptip/scrollbar 功能 smoke

### 3. `vrender`

- 当前问题：
  bootstrap 仍依赖 `legacy -> app registry sync`
  repo 内部大量调用 deprecated `createStage()`
- 迁移目标：
  bootstrap 直接安装默认 pipeline 到 app registry
  repo 内部统一改用 `createBrowserVRenderApp/createNodeVRenderApp`
- 验证：
  `packages/vrender rushx compile`
  `packages/vrender rushx test`
  browser smoke baseline

### 4. `react-vrender`

- 当前问题：
  `Stage.tsx` 仍直接调用 deprecated `createStage()`
- 迁移目标：
  mount 时创建 app，使用 `app.createStage()`；unmount 时释放 stage 和 app
- 验证：
  `packages/react-vrender rushx compile`
  `packages/react-vrender rushx test`
  `react.tsx` smoke 页

### 5. `docs/demos`

- 当前问题：
  仍直接使用 `createStage()`，且 `package.json` 仍保留 `inversify`
- 迁移目标：
  改到 app-scoped 入口并清理依赖
- 验证：
  demo page 可启动渲染
  `package.json` / lockfile 清理一致

### 6. browser smoke/demo pages

- 当前问题：
  大量页面仍直接使用 deprecated `createStage()`；少量还直接使用 `getLegacyBindingContext()`
- 迁移目标：
  baseline 页优先全部迁移；非 baseline 历史页做清单化降级
- 验证：
  baseline smoke 全绿
  triage 表更新完成

何时必须停下来反馈：

1. 如果 `vrender-kits` / `vrender-components` 没有现成 app-scoped installer 能力，且需要先补公共装配 API
2. 如果删除 `legacy -> app registry sync` 后，baseline smoke 大面积回退，说明 runtime 链路尚未真正迁完
3. 如果 `react-vrender` 切到 app model 后需要重开 D3 生命周期主设计
4. 如果 P2 清理暴露出新的 runtime 必要依赖，而不是单纯卫生问题

留档要求：

继续把关键记录回填到：

`/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE4_IMPLEMENTATION_LOG.md`

每次留档至少写清：

1. 背景/问题
2. 结论
3. 影响文件
4. 所属层级：P0 / P1 / P2
5. 验证结果
6. 是否仍阻塞 handoff

输出格式：

1. `Legacy removal status`
2. `Files changed`
3. `Documentation updates`
4. `Verification`
5. `Remaining blockers`
6. `Can handoff remain ready`

要求：

1. 先说明 `P0 / P1 / P2` 各自还剩哪些红灯
2. 如果 `P2` 未完成，直接说明当前不能继续宣称 handoff ready
3. 不要把关键迁移边界再抛回协调者
