# VRender 视觉用例编写

## 何时补用例

新增功能、修复缺陷或发现覆盖空缺时，先找相近用例，优先补强目标场景。影响公共渲染、布局、数据、更新或生命周期时检查相关调用方；每例有明确目的，首批六例不是全功能覆盖。运行与报告见[视觉指南](../README.md)，提交要求见[贡献指南](../../../../../CONTRIBUTING.zh-CN.md#pr-检查与合入流程)。

## 模块和登记

1. 在 `cases/` 新增 `.mjs` 模块，或扩充已有近邻。核心方法使用中文功能说明，输入固定、可公开、无外网和随机依赖。
2. 导出 `createSpec(VRender, stage)` 创建待测图形，按场景返回供验证使用的对象。参考 [primitives-text.mjs](./primitives-text.mjs)、[picking-events.mjs](./picking-events.mjs) 和 [stage-lifecycle.mjs](./stage-lifecycle.mjs)。不要直接复用其他产品的 mount/createSpec 契约。
3. 必须导出 `verify(page)`，需要交互时另导出 `exercise(page)`。执行真实鼠标/键盘动作或公开API更新，并验证实际状态、数值、事件或生命周期结果；仅等待截图、检查 canvas 存在不够。
4. 在 [index.mjs](./index.mjs) 显式登记唯一稳定的 `id`、中文 `purpose` 和模块 `file`。未登记文件不会执行。用 `--list` 确认清单及范围；不要为绕过失败删除已有登记。
5. 仅明确的业务状态不符调用 [assertionError](../assertions.mjs)。资源、浏览器、加载、脚本或超时错误原样失败，不捕获整段逻辑统一改成业务差异。基线不支持新API也必须如实报告。

## 验证新增或修改用例

从仓库根目录运行，`--case` 使用已登记的真实ID：

```sh
node packages/vrender/scripts/visual-test.mjs --list
node packages/vrender/scripts/visual-test.mjs --self-compare --case picking-events
node packages/vrender/scripts/visual-test.mjs --case picking-events
node packages/vrender/scripts/visual-test.mjs
```

单例确认稳定后检查受影响范围，提交产品/用例变更前执行默认全量官方 `develop` 比较；有子目录时可用 `--dir <cases相对目录>`，不能与 `--case` 合用。自比较仅验证确定性，不是双侧通过。核对基线、当前、差异三图及业务断言；稳定性问题应修复等待/资源/动画，不提高像素容差。

新增场景还需证明错误确实能被检测：在临时副本中做最小可见变化或破坏目标状态，确认差异或业务断言失败，再恢复副本。运行器已有负对照见视觉指南；通用负对照不替代新场景本身的业务断言。不得将故意失败代码或产物提交到仓库，不写标准图。

## 与 BugServer 的关系

独立新增的本地用例省略 `BugServer case IDs` 行，不写空值、占位或虚构ID。仅已确认的真实平台来源可添加追溯注释；改写保留来源，合并保留全部真实ID。本地Playwright和平台Photo不会自动同步，新增平台用例见[管理员协作流程](../BUGSERVER_CASE_WORKFLOW.md)。不把内部业务代码、数据、截图、地址或凭据复制到公开用例。
