# Bug Server PR 来源分流实现计划

**目标：** 消除同一 PR 在 Bug Server CI 与 Bug Server PR Bundle 中的重复构建。

**架构：** 按 PR head 仓库完整名称与当前仓库名称比较，在两个构建 job 上设置互斥条件。仓库内 PR 自动构建和测试，fork PR 构建产物后由维护者通过现有手动入口提交测试。

**技术栈：** GitHub Actions、actionlint、Node.js、Python。

## 约束

- 基于最新 `develop` 创建 `codex/bugserver-pr-routing`，向 `develop` 提交 PR。
- PR 目标分支维持 `main`、`develop`、`dev/**`，保留 `main` push 和手动入口。
- 维持现有构建命令、Node.js 24、Ubuntu runner、权限和产物校验边界。
- 分流采用 job 级条件；另一构建 job 显示 `skipped`，不启动 runner。

## 任务 1：修改 workflow 与说明

文件：`.github/workflows/bug-server.yml`、`.github/workflows/bug-server-pr-bundle.yml`、`tools/bugserver-trigger/README.md`、`docs/superpowers/specs/2026-09-17-bug-server-dispatch-design.md`。

- [x] 将 CI 的 `build.if` 改为 `github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.pull_request.head.repo.full_name == github.repository)`。
- [x] 为 `build-pr-bundle` 增加 `if: github.event.pull_request.head.repo.full_name != github.repository`。
- [x] 说明手动入口依赖 fork PR 的 bundle，仓库内 PR 应重跑 CI；同步输入描述和执行边界。

## 任务 2：验证与提交

- [x] 读取实际 YAML 条件，校验仓库内 PR、外部 fork PR、同组织不同仓库 PR、`main` push、手动触发共 5 种场景。
- [x] 运行 `node --test .github/scripts/bug-server-dispatch.test.cjs`、`python3 -B -m unittest discover -s .github/scripts -p 'test_extract_bug_server_bundle.py'`、两个 workflow 的 actionlint、Prettier 与 `git diff --check`。

提交阶段通过仓库推送钩子，创建面向 `develop` 的 PR，并核对 PR 的分支及线上检查启动状态；发布结果记录在 PR 说明中。

## 本地验证结果

- 5 种事件场景通过，PR 目标分支过滤和手动提交依赖保持正确。
- Node 来源校验测试 36 项、Python ZIP 校验测试 6 项全部通过。
- actionlint 1.7.12、Prettier 和 `git diff --check` 通过。
- 未修改构建命令和测试客户端，本次不重复完整构建。线上回归结果以 PR 检查为准。
