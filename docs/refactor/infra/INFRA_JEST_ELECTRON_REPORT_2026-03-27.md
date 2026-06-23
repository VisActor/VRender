# jest-electron 稳定性修复报告

日期：2026-03-27
负责人：资深一线开发者

## 根因结论

- 历史旧版本 `jest-electron@0.1.12` 实际启动 `Electron 11.5.0`，在 `macOS 26.3.1` 上启动阶段直接崩溃。
- 升级到 `@pixi/jest-electron@26.1.0` 后，Electron 已提升到 `32.3.3`，但偶发崩溃仍存在，最新崩溃日志为 `Electron-2026-03-27-173514.ips`。
- 崩溃堆栈稳定落在 AppKit 初始化阶段：
  - `___RegisterApplication_block_invoke`
  - `_RegisterApplication`
  - `GetCurrentProcess`
  - `-[NSApplication sharedApplication]`
  - `_NSInitializeAppContext`
- 结论：问题位于 Electron 主进程启动窗口期，而不是具体测试用例逻辑。

## 方案评估

| 方案 | 工作量 | 稳定性 | 兼容性 | 速度 | 建议 |
|------|--------|--------|--------|------|------|
| 修复当前 `jest-electron` | 低 | 高 | 高 | 中 | 推荐 |
| 迁移到 `jsdom` | 高 | 中 | 中低 | 高 | 不推荐立即执行 |
| 迁移到 `@vitest/browser` | 高 | 高 | 中 | 高 | 不推荐立即执行 |
| Node 原生 Test Runner | 高 | 中 | 低 | 高 | 不推荐立即执行 |

推荐方案：修复当前 `jest-electron`

理由：
- 现有测试已经大量依赖 Electron 环境，迁移成本高。
- 崩溃发生在启动窗口期，适合通过更稳健的启动管理修复。
- 通过仓库内自定义 runner 可以最小侵入落地，并逐包复用。

## 实施内容

- 新增共享稳定 runner：
  - `tools/jest-electron-stable/runner.js`
  - `tools/jest-electron-stable/proc.js`
  - `tools/jest-electron-stable/main/index.js`
  - `tools/jest-electron-stable/main/window-pool.js`
- 关键修复点：
  - 为 Electron 启动增加超时、失败判定和重试。
  - 在启动失败时采集 stderr，避免无信息挂死。
  - 将 Electron 主进程入口切到仓库内可控版本。
  - 修复 `window-pool` 中 `removeWin` 的窗口匹配错误。
- 已将以下包的 Jest 配置切到新的稳定 runner：
  - `vrender-core`
  - `vrender`
  - `vrender-kits`
  - `vrender-components`
  - `vrender-animate`
  - `react-vrender`
  - `react-vrender-utils`

## 验证结果

- `packages/vrender-core/__tests__/unit/common/generator.test.ts`：通过
- `packages/vrender-core/__tests__/unit/graphic/graphic-state.test.ts`：通过
- `packages/vrender-animate/__tests__/unit/timeline.test.ts`：通过
- 连续 10 次运行 `graphic-state.test.ts`：
  - 崩溃次数：0
  - 通过率：100%
- 验证期间没有生成新的 `Electron-2026-03-27-*.ips` 崩溃日志。

## 结论

当前修复已满足本轮 P0 验收标准：`vrender-core` 在 Electron 环境下连续 10 次运行无崩溃。
