# Bug Server 手动入口安全修复 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> 当前环境未安装上述执行技能。用户已授权执行本计划，使用当前任务和仓库工具顺序完成；实际进度与证据记录在文末。

**Goal:** 修复 PR #2134 的默认分支缓存污染风险和自动构建 token 权限过大问题。

**Architecture:** 保留现有校验、构建、提交三个手动 jobs。通过 workflow 顶层 `permissions` 限制 GitHub API 权限，通过构建 job 的 `cache-mode` 独立限制缓存权限；这两类权限需要分别控制。

**Tech Stack:** GitHub Actions、Node.js 24、GitHub CodeQL、actionlint、GitHub CLI。

## Global Constraints

- 审查基线：PR #2134，head `95514c67ed0c2bee3b1a45641596c168b48a05b2`。
- 在现有 `codex/bugserver-workflow-dispatch` 分支追加修复，不重建功能或重写已有提交。
- 保留输入 `pr_number`、`head_sha`、默认分支限制和固定 SHA 构建。
- 保留独立 runner 和可信提交脚本；`BUG_SERVER_TOKEN` 仍只注入提交 step。
- 只收紧本 workflow 权限；不修改仓库全局权限设置、发布流程和 Bug Server API。
- 不用关闭扫描规则、隐藏告警或移除权限限制来让检查变绿。
- 这是权限配置修复，不添加仅断言 YAML 文本的单测，也不重跑渲染库全量测试。

## 已核实的事实与方案选择

1. 仓库当前 `default_workflow_permissions` 为 `write`。旧 `build` job 没有显式权限，三个手动 jobs 已有只读权限。
2. `workflow_dispatch` 在默认分支运行时默认拥有该分支的缓存写权限；不配置 cache action 不会撤销该权限。
3. GitHub 官方文档支持 job 级别 `cache-mode: none`，由缓存 token 的作用域实施限制；只设置同名环境变量不等价。
4. 当前最新版 actionlint 1.7.12 对该字段报 `unexpected key "cache-mode"`。已检查 CodeQL 主线的 `CachePoisoningQuery.qll`：其缓存写权限判断仍只看触发事件，没有考虑 `cache-mode`。

首选原生权限配置：改动集中，维护者使用方式不变。把 PR 构建搬到 `pull_request` 工作流、手动入口只消费其 artifact 也能隔离缓存，但需要新增运行记录和产物身份校验，不作为本次首选。仅增加 `permissions: contents: read` 无法修复缓存问题。

**兼容性处理原则：** GitHub 服务端与 runner 的实际支持需要先验证；不能承诺添加字段后现有 CodeQL 告警必然自动消失。扫描工具的兼容性问题与安全机制是否生效分别记录。

## Task 1：收紧两类权限

**Files:**
- Modify: `.github/workflows/bug-server.yml`

**Interfaces:**
- Consumes: 原有事件、输入、job outputs、artifact 名称和提交脚本。
- Produces: 所有 job 默认只有 `contents: read`；外部 PR 构建 job 没有缓存读写权限。

- [x] **1. 复核执行时的 PR head 和工作区，防止覆盖后续改动。**

```sh
git status --short
gh pr view 2134 --repo VisActor/VRender --json headRefOid,headRefName,baseRefName
```

- [x] **2. 在 `on` 与 `jobs` 之间增加顶层权限。**

```yaml
permissions:
  contents: read
```

保留 `resolve-manual-target` 的 `contents: read`、`pull-requests: read`，以及另外两个手动 jobs 现有的 `contents: read`。旧 `build` 自动继承顶层只读权限；未声明的其他 API 权限不授予。

- [x] **3. 在 `build-manual-bundle` 中增加 job 级缓存限制。**

```yaml
    cache-mode: none
```

将原来的缓存注释替换为：

```yaml
      # PR code runs without Bug Server secrets or cache access.
      # cache-mode controls cache tokens independently of GITHUB_TOKEN permissions.
```

- [x] **4. 在该 job 的 checkout 之前增加运行时检查。**

```yaml
      - name: Verify cache isolation
        uses: actions/github-script@v8
        with:
          script: |
            if (process.env.ACTIONS_CACHE_MODE !== 'none') {
              core.setFailed('PR builds require cache-mode: none.');
            } else {
              core.info('Cache access is disabled for this job.');
            }
```

如果 runner 没有报告 `none`，立即停止，不能继续执行 PR 代码。该检查用于确认平台应用配置，实际权限边界仍是 job 级 `cache-mode`，不是环境变量本身。

执行中修正了检查载体：runner 的 `NodeScriptActionHandler` 会注入 `ACTIONS_CACHE_MODE`，普通 shell step 不会。不能用原计划的 shell 检查把变量未注入误判为平台不支持。

## Task 2：验证平台支持、扫描结果和功能

**Files:**
- Test: `.github/scripts/bug-server-dispatch.test.cjs`（已有测试，不修改）
- Temporary: `.github/workflows/bug-server-cache-policy-check.yml`（验收后删除）
- Modify: 本计划的验收记录

**Interfaces:**
- Consumes: Task 1 的 workflow 配置。
- Produces: GitHub 原生解析与运行证据、权限日志、两条扫描告警的处理结果。

- [x] **1. 运行现有校验，记录 actionlint 版本及完整诊断。**

```sh
node --test .github/scripts/bug-server-dispatch.test.cjs
actionlint -version
actionlint .github/workflows/bug-server.yml
git diff --check
```

预期已有 15 项输入校验测试通过。若 actionlint 仍是 1.7.12，明确记录其对新字段的语法误报；不能把这次检查写成通过，也不能泛化忽略所有语法错误。其余诊断均需解决。

- [x] **2. 在 PR 分支运行不包含 PR 代码和 secret 的平台探针。**

临时文件的完整内容：

```yaml
name: Bug Server cache policy check
on:
  push:
    branches: [codex/bugserver-workflow-dispatch]
permissions: {}
jobs:
  verify:
    runs-on: ubuntu-latest
    cache-mode: none
    steps:
      - name: Verify effective cache mode
        uses: actions/github-script@v8
        with:
          script: |
            core.info(`Cache mode: ${process.env.ACTIONS_CACHE_MODE ?? 'unset'}`);
            if (process.env.ACTIONS_CACHE_MODE !== 'none') {
              core.setFailed('Expected cache-mode: none.');
            }
```

在修复实现进入正常提交、推送阶段时运行该探针。它不 checkout、不安装依赖、不调用 Bug Server、不读写缓存。验收要求 GitHub 接受 YAML，且日志输出 `cache mode: none`。保留 run URL，再删除临时 workflow。

如果 GitHub 拒绝字段或 runner 不报告 `none`，该方案不具备落地条件，应停止合并；不要删除隔离配置继续执行外部 PR。后续改用 `pull_request` 构建 artifact、手动入口校验其来源后上传的方案，并单独完成该架构的实现计划。

- [x] **3. 复查真实自动构建的权限和两条 CodeQL 告警。**

```sh
gh pr checks 2134 --repo VisActor/VRender
gh api repos/VisActor/VRender/code-scanning/alerts/45
gh api repos/VisActor/VRender/code-scanning/alerts/46
```

在最新提交的 `build` job 的 Set up job 日志中，确认 `GITHUB_TOKEN Permissions` 没有写权限。确认缺失权限告警已修复；缓存告警若仍存在，核对该次分析使用的规则及提交 SHA。

对于尚未识别 `cache-mode` 的 CodeQL，记录官方权限语义、探针 run URL、实际 workflow 配置和规则源码证据。扫描仍失败时，不将 PR 描述成“全部检查通过”，不自动关闭告警；将残留扫描问题明确交付给维护者评审。若仓库合并规则要求该检查通过，解决工具识别问题或改用上述 PR artifact 方案后再合并，不绕过合并规则。

- [ ] **4. 合入默认分支后，用已完整审查的可信 PR head 做首次手动验收。**

通过原有 Run workflow 表单输入该 PR 编号与完整 SHA。检查：校验通过、缓存隔离检查通过、固定 SHA 构建成功、artifact 上传/下载成功、可信脚本成功触发 Bug Server，summary 中 PR/SHA 正确。

这一步验证此前自动 PR CI 不会执行的三个手动 jobs。图片差异按 Bug Server 业务结果记录，与权限配置是否生效分别判断。验收失败时暂停手动入口的使用，修复后再为外部 PR 运行；不放宽权限作为回退。

## Task 3：同步维护说明并交付

**Files:**
- Modify: `tools/bugserver-trigger/README.md`
- Modify: `docs/superpowers/specs/2026-09-17-bug-server-dispatch-design.md`
- Append correction: `docs/superpowers/plans/2026-09-17-bug-server-dispatch.md`
- Update after verification: [VRender 日常维护文档](https://bytedance.larkoffice.com/wiki/RNbpwz9HZizi1WkQYcZcqnj6n92)

**Interfaces:**
- Consumes: Task 2 的真实验证结果。
- Produces: 与实现一致的权限说明和未完成项记录。

- [x] **1. 用具体权限说明替换含糊的“无共享缓存”。**

README 的构建边界使用以下说明：

> Build the reviewed PR with read-only repository access and `cache-mode: none`, which denies cache reads and writes independently of `GITHUB_TOKEN`. Verify the runner reports this mode before checking out PR code. Keep checkout credentials disabled and the Bug Server token on the separate submission runner.

设计文档和飞书文档说明：

> 手动构建 job 显式禁止缓存读写，执行 PR 代码前确认该设置生效。GitHub API 权限和缓存权限分别控制；不配置缓存步骤并不等于没有缓存权限。

在原实现计划的验证结果后补记：此前单测、mock 和 actionlint 通过仅覆盖功能及旧语法检查，未验证缓存权限隔离；此次修复补齐这项边界。

- [x] **2. 交付时列出改动和真实状态。**

至少记录最新 commit、两条告警结果、自动构建权限日志、缓存模式探针 URL、首次真实手动运行结果。区分“合并前已验证”和“合并后待验证”，不把计划写成已完成结果。

## 参考依据

- [GitHub job 级 cache-mode](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#jobsjob_idcache-mode)
- [GitHub 缓存权限与事件默认值](https://docs.github.com/en/actions/reference/workflows-and-actions/dependency-caching#controlling-cache-access-with-cache-mode)
- [CodeQL 缓存写权限判断源码](https://github.com/github/codeql/blob/main/actions/ql/lib/codeql/actions/security/CachePoisoningQuery.qll)
- [缓存污染告警](https://github.com/VisActor/VRender/pull/2134#discussion_r4032878435)
- [缺失权限告警](https://github.com/VisActor/VRender/pull/2134#discussion_r4032878451)

## 执行记录（2026-09-17）

- 权限修复提交：`a1d30899c`；JavaScript action 检查修正：`f8fe1a07a`。
- [首轮探针](https://github.com/VisActor/VRender/actions/runs/35179960262)：GitHub 接受配置，初始化日志为 `Cache mode: none`，但 shell 没有该变量。通过官方 [NodeScriptActionHandler 源码](https://github.com/actions/runner/blob/main/src/Runner.Worker/Handlers/NodeScriptActionHandler.cs) 确认注入边界，改用 JavaScript action 检查。
- [修正后的平台探针](https://github.com/VisActor/VRender/actions/runs/35180071512)：**通过**。runner `2.337.0`；初始化日志及 JavaScript action 均报告 `Cache mode: none`。探针没有执行 PR 代码、接触 Bug Server secret 或读写缓存；验证后删除临时 workflow。
- Node 输入校验：15/15 通过。直接运行 workflow 中的隔离检查脚本，确认 `none` 放行，`read`、`write`、未注入变量均拒绝，共 4 个场景通过。
- 推送钩子要求的 `rush test --only tag:package` 已通过；没有以跳过钩子的方式推送。
- actionlint 1.7.12：仅有 `cache-mode` 未识别诊断，**不记为通过**。GitHub 原生解析和 runner 验证通过。
- CodeQL 权限告警 #46：实例状态为 **fixed**。缓存告警 #45 在 `a3d5f2e6e` 上仍为 **open**；其规则未考虑 `cache-mode`。没有忽略规则或关闭告警。
- [自动构建启动日志](https://github.com/VisActor/VRender/actions/runs/35179962932/job/105069769361)：`GITHUB_TOKEN Permissions` 仅有 `Contents: read`、`Metadata: read`，没有写权限。该 run 的构建步骤通过；后因新提交替代而取消，与另一旧提交的重复 CI 一同清理，最新提交的 CI 继续运行。
- 已查询 develop 的传统 required status checks 和适用 rulesets：前者未启用，后者为空。未修改合并规则，也未合并 PR。
- 首次真实手动链路仍需在修复合入默认分支后执行；平台探针不等于端到端 Bug Server 验收。
- README、设计文档、原实现验证记录和飞书维护文档均已同步；飞书文档 revision 17 已回读确认。
