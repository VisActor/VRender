# Bug Server 手动触发设计

## 目标与已确认方案

维护者无需创建临时 PR，即可通过 `Bug Server CI` 的 `workflow_dispatch` 验证外部 PR。用户已确认输入 PR 编号与完整 head SHA，并要求构建和持有 token 的上传过程分离。本次从 `develop` 创建 `codex/bugserver-workflow-dispatch` 实现。

## 取舍

- 采用独立的手动验证、构建、上传 jobs，保留已有 push / pull_request 自动流程。
- 不改用 `pull_request_target` 执行外部 PR 代码。
- 不在单个 job 中先构建再注入 token：构建期间启动的进程可能继续存在。

## 数据流与边界

1. 只允许从默认分支运行手动入口。验证 job 从 workflow 的固定 SHA 检出可信校验脚本。
2. 校验 PR 编号、40 位十六进制 SHA，并通过 GitHub API 确认 SHA 等于该 PR 当前 head。错误在构建前终止。
3. 构建 job 使用 `cache-mode: none` 显式禁止缓存读写，并在检出 PR 代码前通过 JavaScript action 确认 runner 报告的模式为 `none`，否则终止。随后在独立 runner 中检出已验证的固定 SHA，不持有 Bug Server secret、不保留 checkout 凭据。只上传 `tools/bugserver-trigger/dist/index.js`。GitHub API 权限和缓存权限分别控制；不配置缓存步骤并不等于没有缓存权限。
4. 上传 job 在新的 runner 中检出 workflow SHA 对应的可信触发脚本。独立安装该脚本所需的固定版本依赖，不执行 PR 的安装脚本或产物。产物仅作为文件上传。
5. 仅调用触发脚本的 step 注入 `BUG_SERVER_TOKEN`。传给现有脚本的提交、PR ref、源分支信息来自验证 job，避免记录成 develop 的提交。
6. Actions summary 记录 PR 与测试 SHA；现有脚本继续输出 `scmVersion`、`bundleId` 和用例结果。
7. workflow 顶层显式设置 `contents: read`，使原有自动构建也不再继承仓库默认写权限；仅 PR 校验 job 额外需要 `pull-requests: read`。

## 验证

使用 Node 内置测试覆盖输入校验、默认分支限制、SHA 不匹配以及 fork PR 成功解析；actionlint 校验 workflow。以本地 mock HTTP 模拟上传、SCM 构建和图片测试，验证可信脚本的独立运行及元数据传递。线上触发需要入口合入默认分支后执行。

安全修复另行验证 GitHub 原生 `cache-mode` 配置、runner 实际模式和 token 权限。2026-09-17 的 actionlint 1.7.12 与 CodeQL 缓存污染规则尚未完整识别该字段，工具诊断与平台验证结果分别记录，详见 [安全修复计划](../plans/2026-09-17-bug-server-security-fix.md)。
