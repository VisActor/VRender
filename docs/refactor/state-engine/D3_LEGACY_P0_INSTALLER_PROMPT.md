# D3 Legacy Removal P0 Installer Surface 执行 Prompt

> **文档类型**：开发者执行 Prompt
> **用途**：指导实现 agent 只补 `P0 installer surface`，解除 runtime blocker
> **当前状态**：待执行
> **重要说明**：本文件不是新的架构设计文档；执行边界以 `D3_LEGACY_P0_INSTALLER_GUIDE.md`、`D3_LEGACY_PATH_REMOVAL_PLAN.md` 和 `D3_LEGACY_PATH_REMOVAL_STATUS.md` 为准

---

你现在负责执行 D3 `legacy path removal` 的下一轮任务，但这轮**只做 `P0 installer surface`**。

注意：

1. 不重开 D3 Phase 1-4 主设计。
2. 不调整 `legacy path removal` 的验收边界。
3. 不继续扩大 `P1` caller replacement。
4. 不做 `P2` hygiene 清理。
5. 当前唯一主任务是：**先把正式 runtime 安装链补齐并跑通验证。**

你必须先读：

1. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_LEGACY_PATH_REMOVAL_PLAN.md`
2. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_LEGACY_PATH_REMOVAL_STATUS.md`
3. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_LEGACY_P0_INSTALLER_GUIDE.md`
4. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PRE_HANDOFF_HARDENING.md`
5. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE4_IMPLEMENTATION_LOG.md`

本轮只做三件事：

## 1. `vrender-kits`

补正式 app-scoped installer surface，至少覆盖：

1. env installer
2. graphic/register installer
3. picker installer

要求：

1. 正式新路径不再默认落到 `getLegacyBindingContext()`
2. repo 内 runtime 正常工作不再依赖 legacy container 才能安装 env/register/picker

## 2. `vrender-components`

补 app/plugin-scoped installer surface，至少覆盖：

1. `poptip`
2. `scrollbar`

要求：

1. runtime 插件装配不再直接 `bind/rebind` legacy context
2. repo 内正式安装链走 app/plugin-scoped 新路径

## 3. `vrender`

让 bootstrap 直接安装默认 pipeline 到 app registry。

要求：

1. 正式 runtime 路径不再依赖 `syncLegacyPipelineToAppRegistry()`
2. `packages/vrender/__tests__/core/stage.test.ts` 当前红灯必须收口

本轮明确不做：

1. 不继续批量替换 repo 内其它 `createStage()` 调用
2. 不继续推进非 baseline browser 页迁移
3. 不清理 `docs/demos/package.json` 的 `inversify`
4. 不清理 lockfile / 文档 / 产物残留

验证门槛：

1. `packages/vrender` 定向：
   - `rushx test -- --runInBand __tests__/core/stage.test.ts --verbose`
2. `packages/vrender rushx test`
3. `packages/react-vrender rushx test`
4. `packages/react-vrender rushx compile`
5. `packages/vrender rushx compile`
6. `packages/vrender-kits rushx compile`
7. `packages/vrender-components rushx compile`
8. baseline browser smoke

通过标准：

1. `stage.test.ts` 当前 red light 变绿
2. `packages/vrender rushx test` 通过
3. baseline browser smoke 仍通过
4. `react-vrender` compile/test 不回退
5. 不再需要 `syncLegacyPipelineToAppRegistry()` 才能让正式 runtime 跑通

何时必须停下来反馈：

1. 如果 `vrender-kits` 无法抽出统一 installer surface
2. 如果 `vrender-components` 的插件安装必须重开 D3 主设计
3. 如果去掉 `syncLegacyPipelineToAppRegistry()` 后 baseline smoke 大面积回退，且无法在 installer 层收口
4. 如果为让 `P0` 过关，必须继续扩大 `P1`
5. 如果 blocker 实际落在 `AppContext/registry` 主模型，而不是 installer surface

留档要求：

继续回填：

`/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE4_IMPLEMENTATION_LOG.md`

每次留档至少写清：

1. 背景/问题
2. 结论
3. 影响文件
4. 所属层级：`P0`
5. 验证结果
6. 是否仍阻塞 handoff

输出格式：

1. `P0 installer status`
2. `Files changed`
3. `Documentation updates`
4. `Verification`
5. `Remaining blockers`
6. `Can legacy removal continue to P1`

要求：

1. 先明确当前 `P0` 还剩哪些红灯
2. 如果 `stage.test.ts` 或 `packages/vrender rushx test` 仍红，直接列 blocker
3. 在 `P0` 没绿之前，不要继续扩大 repo 内 caller replacement
