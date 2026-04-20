# D3 Legacy Removal P2 Hygiene Cleanup 执行 Prompt

> **文档类型**：开发者执行 Prompt
> **用途**：指导实现 agent 只做 `P2 hygiene cleanup`
> **当前状态**：执行中，存在 blocker
> **重要说明**：本文件不是新的架构设计文档；执行边界以 `D3_LEGACY_P2_HYGIENE_GUIDE.md`、`D3_LEGACY_PATH_REMOVAL_PLAN.md` 和 `D3_LEGACY_PATH_REMOVAL_STATUS.md` 为准

---

你现在负责执行 D3 `legacy removal` 的下一轮任务，但这轮**只做 `P2 hygiene cleanup`**。

注意：

1. 不重开 D3 Phase 1-4 主设计。
2. 不调整 `legacy removal` 的验收边界。
3. 不继续推进 `P0` runtime installer surface。
4. 不继续扩大 `P1` caller cleanup。
5. 当前唯一主任务是：**完成 live package / live lockfile stale entries / `docs/demos` 最小 live 验证 / active docs 的 hygiene 清理。**

你必须先读：

1. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_LEGACY_PATH_REMOVAL_PLAN.md`
2. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_LEGACY_PATH_REMOVAL_STATUS.md`
3. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_LEGACY_P2_HYGIENE_GUIDE.md`
4. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PRE_HANDOFF_HARDENING.md`
5. `/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE4_IMPLEMENTATION_LOG.md`

本轮只做四件事：

## 1. 清理 live package manifest

要求：

1. 删除 `docs/demos/package.json` 中无用的 `inversify`
2. 不能只删 manifest，不同步 lockfile
3. 若发现它仍有真实运行时用途，必须停下来反馈

## 2. 清理 live lockfile stale entries

要求：

1. 让 `common/config/rush/pnpm-lock.yaml` 与实际依赖图一致
2. 不再保留本轮已确认 stale 的条目：
   - `inversify@6.0.1`
   - 旧 `@visactor/vrender@0.14.x`
   - 旧 `@visactor/vrender-components@0.14.x` package snapshot
3. 不允许通过手改 lockfile 伪装完成；应以正常依赖更新路径收口

## 3. 必要时修复 `docs/demos` 的最小 live 目录验证缺口

要求：

1. 本轮**允许**做 `docs/demos` 的最小 live 目录修复
2. 仅限修到最小编译/启动验证通过
3. 不扩成 demo 体系重构
4. 当前这类修复至少包括：
   - `createBrowserVRenderApp` 的导出/类型面适配
   - `docs/demos/src/pages/rect.ts` 依赖的最小 `../utils` 补齐
   - 其它阻止当前 live 目录最小验证通过的最小缺口
5. 如果要把问题扩大成大范围 demo 体系修复，必须先停下来反馈

## 4. 同步 active docs 最终状态

要求：

1. **只有当** manifest / lockfile / `docs/demos` 最小 live 验证全部通过后，active docs 才允许统一到：
   - `P0 completed`
   - `P1 formally closed to boundary`
   - `P2 completed`
   - `legacy removal completed`
2. 若其它 handoff gate 仍保持绿态，再恢复 `handoff ready`
3. 在上述条件未全部满足前，active docs 必须继续保持：
   - `P2 blocked`
   - 不恢复 `legacy removal completed`
   - 不恢复 `handoff ready`
4. 不修改历史 changelog / archive / 已归档旧文档里的历史记录

本轮明确不做：

1. 不继续批量替换 repo 内 `createStage()` caller
2. 不修改 `P0` / `P1` 已关闭边界
3. 不处理 archive/changelog 中的历史 `inversify` 引用
4. 不重开 runtime / installer / smoke harness 问题
5. 不把 `docs/demos` 扩成新的 demo 体系重构项目

验证门槛：

1. `docs/demos/package.json` 中不再含 `inversify`
2. `common/config/rush/pnpm-lock.yaml` 中不再保留本轮已确认 stale 的条目：
   - `inversify@6.0.1`
   - 旧 `@visactor/vrender@0.14.x`
   - 旧 `@visactor/vrender-components@0.14.x` package snapshot
3. 如果修改 manifest / lockfile：
   - 跑 `rush update`
   - 如未收敛，再跑 `rush update --full`
4. `docs/demos` 最小启动/编译验证
   - 必要时允许先做最小 live 目录修复
5. active docs 自检：
   - `README.md`
   - `D3_ARCHIVE_INDEX.md`
   - `D3_PRE_HANDOFF_HARDENING.md`
   - `D3_PRE_HANDOFF_HARDENING_SUMMARY.md`
   - `D3_LEGACY_PATH_REMOVAL_STATUS.md`

通过标准：

1. live package manifest 已清干净
2. lockfile 已与实际依赖图一致
3. `docs/demos` 最小 live 验证已通过
4. active docs 当前状态一致
5. 本轮没有继续扩大到 `P0` / `P1`
6. 不引入新的 runtime regression

何时必须停下来反馈：

1. 如果 `docs/demos/package.json` 的 `inversify` 仍有真实运行时用途
2. 如果 lockfile 中本轮已确认 stale 的条目仍被 live package graph 真正依赖
3. 如果 `rush update` 与 `rush update --full` 后 stale lock entry 仍不收敛，且无法证明它仍被 live package graph 依赖
4. 如果 `docs/demos` 最小 live 验证仍失败，且要修复它必须扩大成 demo 体系重构
5. 如果为完成 `P2` 必须回头修改 `P0` / `P1`
6. 如果 active docs 暴露出新的 runtime / caller blocker，而不是单纯状态不同步

留档要求：

继续回填：

`/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE4_IMPLEMENTATION_LOG.md`

每次留档至少写清：

1. 背景/问题
2. 结论
3. 影响文件
4. 所属层级：`P2`
5. 验证结果
6. 是否已解除 handoff 阻塞

输出格式：

1. `P2 hygiene status`
2. `Files changed`
3. `Documentation updates`
4. `Verification`
5. `Remaining blockers`
6. `Can legacy removal be marked completed`

要求：

1. 先明确当前 `P2` 还剩哪些红灯
2. 如果 `docs/demos/package.json`、lockfile、`docs/demos` 最小 live 验证 或 active docs 任一未清，直接列 blocker
3. 在 `P2` 没绿之前，不要恢复宣称 `legacy removal completed` / `handoff ready`

---

## 提交给架构师复核时，必须附带的内容

当你完成本轮实现或得出阶段性结论后，不要只回复“已完成”。  
你必须同时给出一段可直接转发给架构师的 review 请求，至少覆盖以下事实：

1. 当前 `P2` 状态：
   - 是否已完成
   - 是否仍有 blocker
   - `legacy removal completed` / `handoff ready` 是否已满足恢复条件
2. 关键清理结果：
   - `docs/demos/package.json` 是否已移除 `inversify`
   - lockfile 是否已不再保留本轮已确认 stale 的条目
   - `docs/demos` 最小 live 验证是否已通过
   - active docs 是否已同步到最终状态
3. 影响文件：
   - package manifest
   - lockfile
   - `docs/demos` 最小 live 修复文件
   - active docs / status docs / index docs
4. 验证结果：
   - `rush update`（如有）
   - `rush update --full`（如有）
   - `docs/demos` 最小启动/编译验证
   - active docs 自检
5. 边界判断：
   - 这次工作是否仍严格限定在 `P2 hygiene cleanup`
   - `docs/demos` 的修改是否仍严格限制在最小 live 目录修复，没有扩成 demo 体系重构
   - 是否没有反向修改 `P0` / `P1`

你返回给协调者的消息里，必须直接附上一段可复制的 review prompt。建议使用下面这个模板：

```md
请对 D3 legacy removal 的 `P2 hygiene cleanup` 结果做架构复核，并确认：
1. `P2` 是否已完成
2. 当前是否可以把 `legacy removal` 正式标记为 completed
3. 在其它 handoff gate 保持为绿的前提下，是否可以恢复 `handoff ready`

必读文档：
1. /Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_LEGACY_P2_HYGIENE_GUIDE.md
2. /Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_LEGACY_P2_HYGIENE_PROMPT.md
3. /Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_LEGACY_PATH_REMOVAL_STATUS.md
4. /Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE4_IMPLEMENTATION_LOG.md
5. /Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PRE_HANDOFF_HARDENING.md

请重点核对：

1. 当前专项边界是否被严格遵守
- 没有继续推进 `P0` / `P1`
- 没有重开 D3 Phase 1-4 主设计
- 没有把 archive/changelog 的历史引用误当作本轮必须清零对象
- `docs/demos` 的修改是否仍严格限制在最小 live 目录修复，没有扩成 demo 体系重构

2. `P2` 的 live hygiene 是否已完成
- `docs/demos/package.json` 是否已移除 `inversify`
- lockfile 是否已不再保留本轮已确认 stale 的条目
- `docs/demos` 最小 live 验证是否已通过
- 只有在上述都通过后，active docs 是否才同步到最终状态

3. 验证是否足够
- `rush update`（如有）
- `rush update --full`（如有）
- `docs/demos` 最小启动/编译验证
- active docs 自检

4. 结论判断
- 当前 `P2` 是否已完成
- `legacy removal` 是否可以正式 completed
- 在你确认前，是否仍需继续维持“handoff ready 不恢复”

请按以下结构回复：
1. 是否通过 `P2 hygiene cleanup` 复核
2. 是否仍存在 blocker 或 request changes
3. 是否可以将 `legacy removal` 正式标记为 completed
4. 是否可以恢复 `handoff ready`
```
