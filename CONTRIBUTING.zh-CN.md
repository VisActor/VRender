# 贡献指南

[English](./CONTRIBUTING.md)

首先非常感谢你能抽出时间为我们的开源项目做贡献。希望这份指南能够清晰地阐明贡献过程并回答你可能有的一些问题，所以请你在提 issue 或者 pull request 之前花几分钟时间阅读。

## 行为准则

我们有一份[行为准则](CODE_OF_CONDUCT.md)，希望所有的贡献者都能遵守，请花时间阅读一遍全文以确保你能明白哪些是可以做的，哪些是不可以做的。

## 透明的开发

我们所有的工作都会放在 [GitHub](https://github.com/VisActor/) 上。不管是核心团队的成员还是外部贡献者的 pull request 都需要经过同样流程的 review。

## 版本管理

VRender 遵循[语义化版本控制](https://semver.org/lang/zh-CN/)。我们发布 patch 补丁版本以修复重要的错误，发布 minor 次要版本以提供新功能或非必要的更改，发布 major 主要版本以适应任何重大更改。当我们进行重大更改时，在次要版本中还会引入弃用警告，以便用户了解即将到来的更改并提前迁移代码。

每个重要的更改我们都会记录在对应项目 CHANGELOG 更新日志中。

## 分支管理

从 `develop` 创建开发分支，并将常规修复和功能 PR 提交到 `develop`。发布分支或其他目标由维护者协调；不要直接推送主线。保持公开 API 兼容，记录用户可见变更；发布安排由维护者决定。

## Bugs 管理

我们使用 [GitHub Issues](https://github.com/VisActor/VRender/issues) 来追踪所有的缺陷。无论内外部的缺陷，我们都会在 issues 上进行管理，尽量让一切公开、清晰明了。在你报告一个 bug 之前，请先确保已经搜索
过已有的 issues。

如果你想要你发现的 bug 被快速解决，最好的办法就是根据我们提供的 issue 模板进行提问，只需要进入 [New issue](https://github.com/VisActor/VRender/issues/new/choose) 页面，然后选择其中任意一个开始即可，最好能使用这个[模板](https://github.com/VisActor/VRender/issues/new/choose) 来提供复现的示例代码。

## 提交变更建议

如果你有改进我们的配置项、接口或者新增功能的想法，我们同样推荐你通过 issue 进行提问，或者进入我们的 [New issue](https://github.com/VisActor/VRender/issues/new/choose) 页面，选择相应的 issue 模板进行提交，

如果你准备帮助我们修复一个 bug，那么你可以立即提交一个 pull request 请求，但我们仍然建议你先创建一个 issue 并在 issue 中详细说明将要修复的内容，这样可以帮助我们更好得追踪问题。

## 你的第一个 Pull Request

如果你还不清楚怎么在 GitHub 上提 Pull Request ，可以阅读下面这篇文章来学习：[如何优雅地在 GitHub 上贡献代码](https://segmentfault.com/a/1190000000736629)

为了能帮助你开始你的第一次尝试，我们用[good first issues](https://github.com/VisActor/VRender/issues?q=is%3Aopen+label%3A%22good+first+issue%22)标记了一些比较容易修复的 bug 和小功能。这些 issue 可以很好地作为你的首次尝试。

如果你打算开始处理一个 issue，请先检查一下 issue 下面的留言以确保没有别人正在处理这个 issue。如果当前没有人在处理的话你可以留言告知其他人你将会处理这个 issue，以免别人重复劳动。

如果之前有人留言说会处理这个 issue 但是一两个星期都没有动静，那么你也可以接手处理这个 issue，当然还是需要留言告知其他人。

### 如何发送 Pull Request

VisActor 团队会关注所有的 pull request，我们会 review 以及合并你的代码，也有可能要求你做一些修改或者告诉你我们为什么不能接受这样的修改。我们将尽最大努力在整个过程中提供及时的更新和反馈。

## 本地开发与验证

推荐 Node.js 24，与当前产品 CI 一致；视觉运行包支持已验证的 Node22/24。安装 `canvas` 所需系统库；切换 Node 主版本后重新安装相应原生依赖，勿复用错误 ABI。普通安装保留锁文件，只有明确修改依赖时才使用 Rush update 并检查锁文件差异。

从仓库根目录执行：

```sh
node common/scripts/install-run-rush.js install --ignore-hooks
node common/scripts/install-run-rush.js test --only tag:package
node common/scripts/install-run-rush.js build --only tag:package
node common/scripts/install-run-rush.js test:artifacts --only tag:package
node common/scripts/install-run-rush.js compile --only tag:package
node common/scripts/install-run-rush.js eslint --only tag:package
```

这是与产品 CI 对齐的源码、构建产物检查及类型/风格入口，不保证当前环境全部通过。`eslint` 可能自动修复文件，检查实际 diff；开发时可按受影响包缩小范围，跨包改动同时检查调用方。调试主包浏览器示例：`node common/scripts/install-run-rush.js start`。涉及视觉变化时继续执行下述全量视觉比较，单测不能替代它。提交使用 Conventional Commits，并按仓库现有发布流程提供所需 changelog。

## PR 检查与合入流程

**正式启用快照（2026-11-06）**：本仓独立 PR 工作流已于北京时间 **2026-11-06 17:05** 启用。接入代码见 [#2154](https://github.com/VisActor/VRender/pull/2154)。启用和指定 PR 验证不等于长期稳定性验收，首条自然 PR 及至少24小时/3次执行观察仍待完成。

### 适用范围

仅接管完成初始化后、创建时间严格晚于起点、源分支和目标分支均属于 `VisActor/VRender`、目标为 `develop`的非 Draft PR。“内部”指同仓分支，不以作者是否为员工判断。符合条件的新 Draft 转为 Ready for review 后进入流程；初始化前的存量 PR、fork 和范围外 PR 不因更新、重开或转 Ready 而自动补跑。不要重新创建相同 PR 来绕过存量边界。

稳定 CR 与 GitHub Actions 有独立范围：稳定 CR 已启用全仓非 Draft PR 的新建及后续版本自动审查，首次建立存量基线；它不受独立工作流的目标分支范围限制。没有工作流摘要不代表不需要测试或人工评审。旧 Photo CI 仅按自己的触发条件处理未交接 PR 和 push；同一版本的截图所有权由维护者协调，不手动重复派发。

### 提交前检查

- 完成改动相关的单测、构建/类型及代码风格检查。新增功能、修复缺陷或发现覆盖空缺时，补充确定性回归用例或加强已有用例；交互必须验证真实动作和目标状态。
- 涉及产品代码、渲染、交互、依赖或视觉用例时，提交 PR 前运行[视觉指南](packages/vrender/__tests__/visual/README.md)中的默认全量双侧比较。开发过程中可运行单例/相关目录；`--self-compare` 只检查稳定性，不能替代官方基线比较。全量仅指当前用例清单，不代表全产品覆盖。
- 纯文档改动核对链接、命令、版本和实际行为即可；在 PR 中说明未运行产品测试及原因，无需手动启动模型或派发 Photo；提交后仍按仓库既有 CI 和自动工作流执行。
- 写清实际命令、结果、报告范围、head/base（如已生成报告）、预期视觉变化、未运行项及阻断。执行错误不能算通过，不跳过断言、放宽阈值或替换基准来消除失败。
- 新增本地用例见[用例指南](packages/vrender/__tests__/visual/cases/README.md)。新增平台 Photo 用例仅限对应项目管理员；无权限者提供复现材料，不能编造 ID，流程见[BugServer 用例协作](packages/vrender/__tests__/visual/BUGSERVER_CASE_WORKFLOW.md)。

### 提交后检查结果

先核对当前 head、比较基线和报告版本，再检查 Bot Review、GitHub Actions 和 PR 工作流摘要。三项自动建议分别为 CR、单测和 Playwright；CI 仍可能有其他必须满足的仓库检查。

| 检查项 | 开发者和维护者的动作 |
| --- | --- |
| CR Review | 阅读对应源码位置，修复或补充证据；关闭讨论不等于已验证修复 |
| 单测 | 核对 `unit-test.yml` 的 `build` job，包括 `Source tests (without build artifacts)` 和 `Published artifact tests`；缺失、跳过、运行中或失败不能算通过 |
| Playwright | 查看全量比较及图像、业务断言和差异调查；执行错误不能归为可接受视觉变化 |
| BugServer Photo | 自动执行、人工核查，保留差异、缺基准、错误和未完成状态；当前 report-only，不阻断三项自动建议 |

三项检查通过或流程 completed 都不表示 Photo 全部通过。无平台权限的贡献者由维护者协助核查，不公开内部报告、业务数据、日志或凭据。

### PR 状态与下一步

| 摘要状态 | 应采取的行动 |
| --- | --- |
| 等待执行／执行中 | 等待当前阶段，不把暂无结果当通过 |
| 存在待修复或待调查项 | 阅读问题，修复代码、补用例或提供可验证证据 |
| 流程受阻 | 查看具体待办；权限、服务或任务恢复问题交由维护者处理 |
| 等待人工批准 | 维护者核对当前版本的三项结果，并人工核查 Photo |
| 等待人工合入 | 当前提交的有效批准已识别，由维护者人工 Merge |
| 已合入／核对基准阶段 | 等待收尾；report-only 下跳过自动基准更新是预期行为 |
| 流程已完成 | 表示流程收尾，不改写原 Photo 差异或错误 |
| 被新版本替代／未合入关闭 | 前者查看新版本结果，后者不表示已合入或基准已更新 |

推送新提交或 base 变化后重新核对版本并执行必要检查；旧结果不能证明新版本通过，新提交需要对应的有效批准。缺少摘要时先检查同仓、目标、创建时间、Draft范围，再联系维护者。

### 批准、合入和异常恢复

工作流识别具有仓库 Maintain/Admin 权限的维护者对**当前提交**作出的有效 GitHub Approve，该批准同时表示已人工核查 Photo。Bot 不自动 Approve/Merge；GitHub 分支保护和其他检查仍适用，工作流不新增强制 Checks 或修改仓库规则。

Photo 自动差异评估及标准图自动更新暂停。Approve/Merge 不授权自动采用测试图；提前合入不会使未完成或失败的检查变为通过。新增/修改共享基准需管理员另行获得明确授权、人工核查并安排复验，原报告保留。

请求帮助时提供 PR、当前 SHA、Review/CI 链接和可公开的错误说明。不要编辑 Bot 受管摘要或隐藏标记，不通过反复开关 PR、删除状态、换请求 ID 或另派批次绕过去重；由维护者回读和恢复原任务。结束时停止本次启动的测试服务、浏览器和子进程。
