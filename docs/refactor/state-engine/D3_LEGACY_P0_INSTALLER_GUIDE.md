# D3 Legacy Removal P0 Installer Surface 实施任务文档

> **文档类型**：legacy removal 子任务实施文档
> **用途**：只聚焦补齐 app-scoped installer surface，解除 `P0` runtime blocker
> **当前状态**：已定义，待执行
> **重要说明**：本文件不是新的架构设计文档；边界以 `D3_LEGACY_PATH_REMOVAL_PLAN.md`、`D3_LEGACY_PATH_REMOVAL_STATUS.md` 与 `D3_PRE_HANDOFF_HARDENING.md` 为准

---

## 1. 任务定位

这轮只做一件事：

> **补齐 `P0` 的 app-scoped installer surface，让正式 runtime 主链不再依赖 legacy binding bridge。**

这不是新的 Phase，也不是对 D3 Phase 1-4 的补设计。  
它只是 `legacy path removal` 在当前 `blocked` 状态下必须优先完成的 runtime 收口任务。

---

## 2. 当前 blocker

当前 `legacy path removal` 之所以是 `blocked`，不是因为 repo 内 caller 还没清完，而是因为：

1. `vrender-kits` 的 env / register / picker 主路径仍默认装配到 legacy binding context
2. `vrender-components` 的 runtime 插件装配仍直接绑定 legacy context
3. `vrender` bootstrap 仍依赖 `syncLegacyPipelineToAppRegistry()` 把 legacy pipeline 同步到 app registry

在这条正式安装链没有补齐之前：

1. 不能安全地继续批量替换 repo 内 `createStage()` caller
2. 不能继续硬删 `legacy -> app registry sync`
3. `P0` 无法完成

---

## 3. 本轮边界

### 3.1 P0 必做

1. 为 `vrender-kits` 补正式 app-scoped installer surface
2. 为 `vrender-components` 补正式 app/plugin-scoped installer surface
3. 让 `vrender` bootstrap 直接安装默认 pipeline 到 app registry
4. 解除 `vrender` 对 `syncLegacyPipelineToAppRegistry()` 的运行时依赖

### 3.2 本轮明确不做

1. 不继续扩大 `P1`
   - 不继续批量替换 repo 内其它 `createStage()` caller
   - baseline/browser/demo 已完成的局部迁移保留，但不继续扩围
2. 不做 `P2`
   - 不处理 `docs/demos/package.json` 的 `inversify`
   - 不处理 lockfile hygiene
   - 不做文档/产物/历史引用清扫
3. 不重开 D3 Phase 1-4 主设计
4. 不把 compatibility facade 一次性物理删除到影响外部兼容

---

## 4. 目标交付

### 4.1 `vrender-kits`

必须补三类 installer：

1. env installer
2. graphic/register installer
3. picker installer

目标要求：

1. 正式新路径必须以 `app` / `app.context` / `app.registry` 为安装目标
2. 不再要求 zero-arg 默认落到 `getLegacyBindingContext()`
3. legacy wrapper 可以暂留，但不能继续承担 repo 内正式 runtime 正常工作的必要条件

建议交付形态：

1. 新增明确的 app-scoped installer API
2. 保留 legacy wrapper 作为 deprecated facade，并在内部改为调用新 installer 或明确隔离

### 4.2 `vrender-components`

必须补 app/plugin-scoped installer surface，至少覆盖：

1. `poptip`
2. `scrollbar`

目标要求：

1. runtime 插件装配不再直接 `bind/rebind` legacy context
2. 组件模块可以通过 `app` 或 app-scoped plugin installer 完成注册
3. legacy wrapper 可以暂留，但不能继续作为 repo 内正式安装链

### 4.3 `vrender`

必须让 bootstrap 直接安装默认 pipeline 到 app registry。

目标要求：

1. `bootstrapVRenderBrowserApp()` / `bootstrapVRenderNodeApp()` 不再依赖 `syncLegacyPipelineToAppRegistry()`
2. `renderer` / `contribution` / `plugin` / `env` 的正式安装链直接落在当前 app 上
3. 修复 `packages/vrender/__tests__/core/stage.test.ts` 当前暴露的 runtime 红灯

---

## 5. 停机条件

出现以下任一情况，必须停下来反馈，不要继续扩大 caller replacement：

1. 发现 `vrender-kits` 的 env / register / picker 无法抽成统一 installer surface
2. 发现 `vrender-components` 的插件模型需要重开 D3 主设计才能迁移
3. 删除 `syncLegacyPipelineToAppRegistry()` 后，`packages/vrender` baseline smoke 大面积失效，且根因无法在 installer 层收口
4. 为了让 `P0` 通过，必须反向恢复 repo 内新的 `createStage()` 迁移
5. 发现当前 blocker 不是 installer 缺口，而是更底层的 `AppContext/registry` 主模型问题

---

## 6. 最低验证矩阵

这轮至少要完成以下验证：

### 6.1 必跑

1. `packages/vrender` 定向：
   - `rushx test -- --runInBand __tests__/core/stage.test.ts --verbose`
2. `packages/vrender rushx test`
3. `packages/react-vrender rushx test`
4. `packages/react-vrender rushx compile`
5. `packages/vrender rushx compile`
6. `packages/vrender-kits rushx compile`
7. `packages/vrender-components rushx compile`
8. baseline browser smoke

### 6.2 强烈建议补跑

1. `vrender-kits` env/register/picker 相关单测
2. `vrender-components` 真实功能 smoke
3. hidden Electron 下的 renderer / picker 回归验证

### 6.3 通过标准

必须同时满足：

1. `stage.test.ts` 从当前 red light 变为通过
2. `packages/vrender rushx test` 通过
3. baseline browser smoke 仍可用
4. `react-vrender` compile/test 仍通过
5. 新安装链不再依赖 `syncLegacyPipelineToAppRegistry()` 才能工作

---

## 7. 完成定义

只有满足以下全部条件，才可以把本轮 `P0 installer surface` 标记为完成：

1. `vrender-kits` 已有正式 app-scoped installer surface
2. `vrender-components` 已有正式 app/plugin-scoped installer surface
3. `vrender` bootstrap 的正式 runtime 路径已不再依赖 `syncLegacyPipelineToAppRegistry()`
4. `packages/vrender/__tests__/core/stage.test.ts` 通过
5. `packages/vrender rushx test` 通过
6. baseline browser smoke 通过
7. `packages/react-vrender rushx test/compile` 仍通过
8. 本轮没有继续扩大 `P1` caller replacement
9. implementation log 已补齐本轮背景、结论、影响文件、验证结果、是否仍阻塞 handoff

---

## 8. 留档要求

继续把过程回填到：

- [D3_PHASE4_IMPLEMENTATION_LOG.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE4_IMPLEMENTATION_LOG.md)

每次留档至少写清：

1. 背景/问题
2. 结论
3. 影响文件
4. 所属层级：`P0`
5. 验证结果
6. 是否仍阻塞 handoff
