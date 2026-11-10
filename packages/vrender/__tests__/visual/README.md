# VRender 本地视觉回归

在 Chromium 中对当前工作区和官方 `VisActor/VRender develop` 的构建逐例比较。两侧使用冻结的同一套用例和断言，仅替换 SDK。协议沿用 VChart/VTable 串行运行器：完整 SHA、逐侧依赖校验、两侧构建、原生 Playwright 比较和可搬迁报告。首期 6 项代表用例，不代表 VRender 全功能、多浏览器或多端通过；不替代单测和 BugServer Photo。

运行器与报告基础复用 VChart `0b14ff87f9cc3970248c26f4ce9ecd50d9d82262` 的串行实现，仅适配 VRender 构建和页面。后续协议修复应对照两仓同步，不另建共享运行时服务。

## 准备与运行

使用 Node.js 22 或 24（产品 CI 使用 24），安装锁文件依赖和 Playwright 1.63.0 对应 Chromium；Linux 还需要浏览器系统库。

```sh
node common/scripts/install-run-rush.js install --ignore-hooks
PLAYWRIGHT_SKIP_BROWSER_GC=1 node packages/vrender/node_modules/@playwright/test/cli.js install chromium
node packages/vrender/scripts/visual-test.mjs --check
node packages/vrender/scripts/visual-test.mjs --list
node packages/vrender/scripts/visual-test.mjs --self-compare
node packages/vrender/scripts/visual-test.mjs --case picking-events
node packages/vrender/scripts/visual-test.mjs --baseline <完整40位SHA>
node packages/vrender/scripts/visual-test.mjs
node --test packages/vrender/scripts/visual-test.test.mjs
# 使用已经通过的真实报告执行负对照（不改源码/标准图）
VRENDER_VISUAL_FIXTURE=<报告绝对目录> node --test packages/vrender/scripts/visual-negative.test.mjs
```

不传筛选参数运行清单全部用例；`--case` 和 `--dir` 互斥，`--dir` 按用例子目录选择（首批用例位于根目录）。默认从固定官方地址获取 develop，fork origin 不参与解析。`--self-compare` 使用同一构建、两个浏览器上下文，仅用于确定性检查，不是正式 head/base 验证。SDK 使用既有 bundler，依次构建 core、kits、animate、components 的 ES 及主包 UMD；不会修改产品运行时代码。

隔离执行：`--baseline <完整SHA> --offline`。宿主预先准备两侧 Git 提交、依赖和浏览器，分别通过 `VISUAL_HEAD_DEPENDENCIES` / `VISUAL_BASELINE_DEPENDENCIES` 指定快照。每侧完整工程清单和配置须与其 SHA 一致，缺失或错配即失败；执行时不联网 fetch/install。新增运行器无需基线提交已经包含运行器，两侧均使用候选冻结套件。正式 Bot 准入只消费全量范围，单例和自比较不用于判定全量通过。

## 首批覆盖

| ID | 场景与断言 |
| --- | --- |
| primitives-text | 矩形、圆、中文/数字文本；有效边界及非空白绘制 |
| transform-clip | 分组平移、缩放、裁剪；裁剪内外真实像素 |
| picking-events | 真实鼠标悬停/点击；顶层命中、事件计数及未穿透下层 |
| tag-component | Tag 背景、文本及更新后的内容/尺寸 |
| attribute-update | 属性更新后几何与拾取位置同步 |
| stage-lifecycle | 独立 Stage 销毁后画布移除，主 Stage 继续正常绘制 |

固定画布、视口、DPR、UTC、字体与输入；无外部资源和随机数据。必须等待两张连续截图一致。比较沿用 `threshold=0.1 / maxDiffPixels=0`，不以放宽阈值解决不稳定。动画时序、多端环境、复杂组件及性能不在首批范围。

## 报告与失败处理

产物位于 Git 忽略的 `.vrender-visual/runs/<run-id>/`：

- `index.html`：基线/当前/差异图；整体复制目录以保留相对链接。
- `agent-summary.md` 与 `summary.json`：问题摘要及 schemaVersion=1 结构化证据，含 head/base、源码摘要、用例集合、SDK 摘要、阶段结果和真实错误。
- `build.log`、两侧 Playwright 报告、PNG 和失败 trace：排查构建、资源、交互及截图问题。

退出码 `0` 为所选用例通过，`1` 为视觉差异，`2` 为执行/构建/资源/清理错误。缺图、漏项、未执行、超时不得算通过。基线显式业务断言失败而当前通过时保留 `new_baseline` 证据供人工调查，不自动接受或更新标准图。先看报告错误分类，再按记录 SHA 和命令复现；禁止用跳过断言或接受差异代替修复。

正常、异常和 Ctrl+C 都回收本轮子进程、浏览器、HTTP 服务和基线 worktree。SIGKILL/断电后检查 `git worktree list` 及 `.vrender-visual/running.lock/owner.json`，确认所属进程结束后才处理残留，勿清理其他任务资源。

## 添加用例

在 `cases/` 新增模块并在 `cases/index.mjs` 显式登记稳定 ID、中文目的和文件路径。模块必须可被 Node/浏览器导入：`createSpec(VRender, stage)` 创建图形并返回供断言使用的对象；可选 `exercise(page)` 执行交互；`verify(page)` 核对真实业务结果。仅明确的业务不符使用 `assertionError`，不得把资源/浏览器异常包装成业务失败。新增后运行自检、自比较和冻结基线比较，并证明可见变化/错误行为能被检测。

本入口合入不代表 AI PR 工作流已上线。旧 Photo CI 已准备独立的 `gray-scope` 判断，`VISACTOR_WORKFLOW_INTERNAL_SINCE` 未配置时保持原有触发。启用后仅交接仓库 ID 649514587、同仓、目标 develop 且创建时间晚于起点的新 PR；新 Draft 同样交接并由 Bot 等待 ready。存量、fork、其他目标、main push 和维护者手动入口保持原职责。起点或仓库身份非法时停止旧构建，避免重复派发。该变量必须与 Bot discovery.createdAfter、BugServer 服务身份 internalSince 一致，并在起点前完成存量快照；本提交不设置变量或变更生产调度，正式切流另行验收与授权。
