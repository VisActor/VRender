# Bug Server 手动触发设计

## 目标

维护者输入 PR 编号和已 review 的完整 head SHA，即可测试外部 PR。PR 构建在 `pull_request` 上下文中完成，默认分支的手动入口只校验和上传产物。

## 数据流与权限边界

1. `bug-server-pr-bundle.yml` 仅由 `pull_request` 触发。在只读仓库权限、无持久化 checkout 凭据、无 Bug Server token 的 runner 上检出准确 head SHA，执行 Rush 构建。缓存写入作用域属于该 PR，不属于默认分支。产物名为 `bug-server-pr-<number>-<sha>`，保留 7 天。
2. `bug-server.yml` 的手动入口只允许默认分支，保留 `pr_number`、`head_sha`。可信脚本校验输入、base 仓库及 PR 当前 head，再从指定 PR bundle workflow 查找成功运行。
3. 来源校验绑定 workflow ID/路径、事件、运行状态、base/head 仓库 ID、源分支及 run head SHA。fork 的运行记录可能没有 PR 列表，不能因此拒绝所有外部 PR；如列表存在则还需匹配 PR 编号。
4. 选择最新匹配运行中唯一且未过期的命名产物，复核 artifact API 的 run ID、仓库 ID 与 SHA。失败时要求先成功运行 PR bundle 工作流，不回退到其他提交或较旧运行。
5. 提交 job 只检出 `github.workflow_sha` 对应的可信脚本。通过 artifact ID 下载 ZIP，只接受一个名为 `index.js` 的普通文件，最大 64 MiB。可信 Python 脚本只把文件字节写入固定位置，不按 ZIP 路径解压，不执行产物。
6. 可信 TypeScript 客户端的依赖独立安装且禁用 lifecycle scripts。仅最后的 API 调用 step 注入 `BUG_SERVER_TOKEN`；PR 元数据与产物来源由可信校验 job 提供。summary 记录 PR、SHA 和来源构建。
7. 两个 workflow 默认 `contents: read`；查询 PR 需要 `pull-requests: read`，查询/下载 artifact 需要 `actions: read`。原有 push / pull_request 自动 Bug Server 步骤保持原来的构建和测试行为。

## 维护者操作变化

先等 `Bug Server PR Bundle` 对该 SHA 构建成功，再运行手动入口。产物缺失或过期时重跑 bundle 工作流。新增工作流之前的旧 PR 需要更新或重新打开以触发新 PR 事件；重跑旧定义不能生成新工作流。fork Actions 首次运行可能需要维护者批准。

## 验证

Node 测试覆盖输入与产物来源校验。Python 测试覆盖正常字节、可执行文本仅作为数据、路径穿越、额外文件、重复文件、链接/特殊文件、体积限制和禁止覆盖目标文件。actionlint 与 CodeQL 必须通过，不以关闭告警作为修复。真实 PR bundle 的查找、下载、读取及 mock 客户端上传在合并前验证；默认分支完整手动测试在合并后验收。

此前的 `cache-mode: none` 已在平台验证，但未完成扫描验收；最终方案移除默认分支内的 PR 构建，不再依赖该配置。
