# D3 Legacy Removal P2 Hygiene Cleanup 实施任务文档

> **文档类型**：legacy removal 子任务实施文档
> **用途**：只聚焦 `P2 hygiene cleanup`，完成 live package / live lockfile stale entries / `docs/demos` 最小 live 验证 / active docs 的收尾清理
> **当前状态**：执行中，存在 blocker
> **重要说明**：本文件不是新的架构设计文档；边界以 `D3_LEGACY_PATH_REMOVAL_PLAN.md`、`D3_LEGACY_PATH_REMOVAL_STATUS.md` 和 `D3_PRE_HANDOFF_HARDENING.md` 为准

---

## 1. 任务定位

这轮只做一件事：

> **完成 `legacy removal` 的 `P2 hygiene cleanup`，让仓库在 live manifest / live lockfile / `docs/demos` 最小 live 目录 / active docs 层面不再保留当前时态的 legacy 残留。**

这不是：

1. `P0` runtime installer surface
2. `P1` internal caller cleanup
3. D3 Phase 1-4 主设计修订
4. 新的架构阶段

它只负责把当前 `legacy removal` 最后剩余的 hygiene blocker 清掉。

---

## 2. 当前 blocker

在 `P0 completed`、`P1 formally closed to boundary` 之后，当前 `legacy removal` 仍未完成，只剩：

1. `docs/demos/package.json` 的 live manifest 清理
2. `common/config/rush/pnpm-lock.yaml` 中本轮已确认 stale 的 live 条目清理
3. `docs/demos` 的最小 live 验证缺口
4. active 文档当前状态与最终完成态之间的同步

当前已确认的具体红灯包括：

1. [docs/demos/package.json](/Users/bytedance/Documents/GitHub/VRender2/docs/demos/package.json) 曾保留 `inversify`
2. `common/config/rush/pnpm-lock.yaml` 中仍保留本轮已确认 stale 的条目：
   - `inversify@6.0.1`
   - 旧 `@visactor/vrender@0.14.x`
   - 旧 `@visactor/vrender-components@0.14.x` package snapshot
3. `docs/demos` 当前最小 live 验证可能失败，例如：
   - `@visactor/vrender` 的类型面未导出 `createBrowserVRenderApp`
   - `docs/demos/src/pages/rect.ts` 依赖的 `../utils` 缺失

因此当前 handoff 仍被 `P2` 阻塞。

---

## 3. 本轮边界

### 3.1 P2 必做

1. 清理 `docs/demos/package.json` 中无用的 `inversify`
2. 清理 lockfile 中本轮已确认 stale 的 live 条目：
   - `inversify@6.0.1`
   - 旧 `@visactor/vrender@0.14.x`
   - 旧 `@visactor/vrender-components@0.14.x` package snapshot
3. **必要时**修复 `docs/demos` 的最小 live 目录验证缺口
   - 仅限修到最小编译/启动验证通过
   - 不扩成 demo 体系重构
4. **只有当** manifest / lockfile / `docs/demos` 最小 live 验证全部通过后，才同步 active docs 到最终完成态

### 3.2 本轮明确不做

1. 不修改 `P0` / `P1` 的代码边界
2. 不继续批量替换 repo 内 caller
3. 不重开 D3 Phase 1-4 主设计
4. 不把历史 changelog / archive / 已归档旧文档里的历史引用当作本轮必须清零的对象
5. 不把 `docs/demos` 扩成新的 demo 体系重构项目

### 3.3 什么必须清，什么可以保留

#### 必须清理

1. live package manifest
   - `docs/demos/package.json`
2. live lockfile stale entries
   - `common/config/rush/pnpm-lock.yaml`
3. `docs/demos` 最小 live 目录验证缺口
4. active docs / active index / active handoff 文档中的当前时态表述

#### 可以保留

以下内容可以继续保留，因为它们是历史记录，不是当前正式路径说明：

1. changelog 中对 `inversify` 的历史描述
2. `docs/refactor/archive/*` 中的旧任务、旧方案、旧迁移记录
3. 已明确标注为 archive / history / deprecated context 的文本资产

判断标准：

1. 如果某个文件当前承担“live 文档 / live 入口 / live 依赖图”职责，就必须清
2. 如果某个文件只是历史记录，并且不会误导当前接入，就可以保留

---

## 4. 目标交付

### 4.1 依赖卫生

1. `docs/demos/package.json` 不再保留 `inversify`
2. 经过正常依赖更新路径后，`common/config/rush/pnpm-lock.yaml` 中不再保留本轮已确认 stale 的条目：
   - `inversify@6.0.1`
   - 旧 `@visactor/vrender@0.14.x`
   - 旧 `@visactor/vrender-components@0.14.x` package snapshot

### 4.2 `docs/demos` 最小 live 验证

本轮**允许**修复 `docs/demos` 的最小 live 目录缺口，但边界必须严格收紧：

允许的修复：

1. 导出/类型面适配
2. 缺失的最小 helper / util 补齐
3. 让当前 live 目录最小编译/启动验证通过所需的最小修复

不允许的修复：

1. 大范围重写 demo 页面体系
2. 借机清理与当前 live 目录验证无关的历史 demo
3. 反向改动 `P0` / `P1`

### 4.3 文档卫生

1. active docs 对 `legacy removal` 当前状态的说明与最新结论一致
2. 不再出现“当前已 handoff ready”或“legacy removal 已完成”的陈旧现在时表述
3. `README.md`、`D3_ARCHIVE_INDEX.md`、`D3_PRE_HANDOFF_HARDENING.md`、`D3_PRE_HANDOFF_HARDENING_SUMMARY.md`、`D3_LEGACY_PATH_REMOVAL_STATUS.md` 等 active 文档的状态链一致
4. 在 manifest / lockfile / `docs/demos` 最小 live 验证未全部通过前，active docs 必须继续保持：
   - `P2 blocked`
   - 不恢复 `legacy removal completed`
   - 不恢复 `handoff ready`

### 4.4 最终状态

本轮完成后，应该能正式写成：

1. `P0 completed`
2. `P1 formally closed to boundary`
3. `P2 completed`
4. `legacy removal completed`
5. 在其它 handoff gate 已保持为绿的前提下，`handoff ready` 可恢复

---

## 5. 停机条件

出现以下任一情况，必须停下来反馈，不要继续扩大范围：

1. 发现 `docs/demos/package.json` 中的 `inversify` 仍有真实运行时用途，而不是卫生残留
2. 发现 lockfile 中本轮已确认 stale 的条目仍被 live package graph 真正依赖
3. `rush update` 与 `rush update --full` 后 stale lock entry 仍不收敛，且无法证明它仍被 live package graph 依赖
4. `docs/demos` 最小 live 验证仍失败，且要修复它必须扩大成 demo 体系重构
5. 为让 `P2` 过关，必须反向修改 `P0` / `P1` 已关闭结论
6. 发现 active 文档存在新的 runtime / caller blocker，而不是单纯状态不同步

---

## 6. 最低验证矩阵

### 6.1 必跑

1. 依赖扫描
   - `docs/demos/package.json` 不再含 `inversify`
   - `common/config/rush/pnpm-lock.yaml` 不再保留本轮已确认 stale 的条目：
     - `inversify@6.0.1`
     - 旧 `@visactor/vrender@0.14.x`
     - 旧 `@visactor/vrender-components@0.14.x` package snapshot
2. 若修改 package manifest / lockfile：
   - `rush update`
   - 如未收敛，再跑 `rush update --full`
3. `docs/demos` 最小启动/编译验证
   - 必要时允许先做最小 live 目录修复后再验证
4. active docs 自检
   - active index / status / hardening 文档口径一致

### 6.2 通过标准

必须同时满足：

1. live package manifest 已清干净
2. lockfile 已与实际依赖图一致
3. `docs/demos` 最小 live 验证已通过
4. active docs 当前状态一致
5. 没有把历史 changelog/archive 错当作本轮必须清零对象
6. 不引入新的 runtime regression

---

## 7. 完成定义

只有满足以下全部条件，才可以把本轮 `P2 hygiene cleanup` 标记为完成：

1. `docs/demos/package.json` 中的 `inversify` 已删除
2. lockfile 中不再保留本轮已确认 stale 的条目
3. `docs/demos` 最小 live 验证已通过
4. 只有在 1-3 全部满足后，active docs 才已同步到最终 legacy removal 结论
5. 本轮没有继续扩大到 `P0` / `P1`
6. implementation log 已补齐本轮背景、结论、影响文件、验证结果、是否恢复 handoff

---

## 8. 留档要求

继续把过程回填到：

- [D3_PHASE4_IMPLEMENTATION_LOG.md](/Users/bytedance/Documents/GitHub/VRender2/docs/refactor/state-engine/D3_PHASE4_IMPLEMENTATION_LOG.md)

每次留档至少写清：

1. 背景/问题
2. 结论
3. 影响文件
4. 所属层级：`P2`
5. 验证结果
6. 是否已解除 handoff 阻塞
