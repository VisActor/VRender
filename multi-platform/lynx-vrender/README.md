# lynx-vrender

VRender 在 Lynx / ReactLynx / Rspeedy 环境的本地 smoke 项目。

## 运行

```bash
cd multi-platform/lynx-vrender
pnpm run prepare:local
pnpm run build
pnpm run dev
```

`pnpm run prepare:local` 会安装依赖，并把当前仓库已构建的 `@visactor/vrender*` 包同步到本项目的 `node_modules/@visactor`。如果 VRender 源码有变化，先在仓库根目录执行：

```bash
rush build -t @visactor/vrender
```

然后回到本目录执行：

```bash
pnpm run sync:local
```

工具链版本以 `package.json` 和 `pnpm-lock.yaml` 为准。公开 Lynx 项目的初始化、Explorer 安装和预览方式请参考 [Lynx 官方快速上手](https://lynxjs.org/zh/guide/start/quick-start.html)。

构建产物入口是：

```text
dist/main/template.js
```

启动开发服务器后，使用终端输出的二维码或 bundle URL 在 Lynx Explorer 中打开页面。不要在文档中固化本机地址；Rspeedy 的服务配置统一维护在 `lynx.config.ts` 中。

运行环境需要提供 VRender 所需的原生渲染适配。能力缺失时只能验证构建与页面加载，不能据此判断图形渲染是否正常。

## 页面操作

页面顶部按钮用于切换场景。普通切换会复用同一个 VRender app/stage，清理旧场景的动画、定时器和节点后再重绘；完整 release 只发生在 React unmount 或生命周期测试边界。

底部按钮含义：

- `更新`：执行当前场景的主要属性、资源或批量更新。
- `状态/控制`：执行当前场景的状态或动画控制动作。
- `重绘`：重新创建当前场景。

## 当前覆盖

- `图元`：rect、circle、symbol、line、area、arc、path、polygon，以及常用填充、描边、渐变、阴影和拾取行为。
- `文本`：普通文本、多行文本、自动换行、富文本和文字装饰。
- `资源`：图片资源创建、更新、适配模式、透明度和拾取；能力不可用时显示降级提示。
- `动画`：from/to/wait/loop/bounce，以及 pause/resume 和 stop(end)。
- `状态`：setStates、addState、removeState、toggleState 和同状态 patch 刷新。
- `变换`：嵌套 group、clip、opacity、zIndex、旋转、缩放、位移和变换后拾取。
- `组件`：Tag、Segment、坐标轴、图例、Slider、DataZoom、表单控件、ScrollBar、Title、Indicator 和 Tooltip。
- `事件`：触摸与鼠标事件转发、重叠图元、zIndex、旋转分组和 clip group 内节点拾取。
- `批量`：批量创建、属性更新、样式更新和节点拾取。
- `几何`：line、area、polygon、path、arc、symbol 的几何属性更新、bounds 和重绘。
- `生命周期`：节点清理与重建、场景切换清理，以及 React unmount 时释放 stage/app。

## 人工验收

使用 `pnpm run dev` 输出的 bundle URL 打开页面后，逐项确认：

1. 页面状态从 `waiting/mounting` 变为 `rendered`。
2. 所有场景均可切换，旧动画和定时器不会影响新场景。
3. 每个场景的 `更新`、`状态/控制` 和 `重绘` 行为符合页面说明。
4. 图元、文本、资源、动画、状态、变换和几何更新可见且无明显重叠或残留。
5. 组件可见，基础点击或拖动能更新页面状态；失败项会显示 `failed`，需记录 console 调用链。
6. 事件场景能命中重叠图元、变换分组和裁剪区域内节点。
7. 反复切换场景后无旧节点残留、无动画串场，切换耗时不随次数持续劣化。
8. 生命周期场景完成节点重建，并在页面卸载时释放资源。

## Lynx 接入注意事项

- 使用 `createLynxVRenderApp` 创建 app，避免污染全局 VRender application；同一页面有多个 VRender 使用者时，可通过 `acquireSharedVRenderApp({ env: 'lynx', key })` 共享 app。
- 普通页签、筛选或场景切换应复用 app/stage，只清理并重绘 scenegraph；把 `release()` 留给低频生命周期边界。
- `createLynxVRenderApp({ envParams })` 只承载 app scope 内全局有效的运行时能力；具体渲染目标和尺寸由 Stage/Layer 创建路径传入。
- 相同 `env + key` 会复用首次创建的 app，后续调用不会合并 `envParams`。接入层需要保证同一个 key 下的运行时能力一致。
- Lynx 没有 DOM 的 `document/window` 事件系统，页面需要把触摸和鼠标事件转发到 `stage.window.dispatchEvent()`。
- 触摸坐标可能位于 `changedTouches[0]` 或 `touches[0]`；转发层需将坐标归一为 VRender 事件系统可读取的字段。
- 当前 Lynx env 不支持直接解析 SVG 字符串，`loadSvg()` 会返回 `{ loadState: 'fail', data: null }`。资源测试应使用运行端可加载的图片资源。
- 本项目的 build/typecheck 只验证工程链路；实际渲染、交互和动画仍需在 Lynx Explorer 或目标运行环境中人工确认。
- 不要提交 `dist/`、`dist-*`、`node_modules/` 和 `package-lock.json`；本项目使用 `pnpm-lock.yaml` 锁定工具链。

## app/stage 生命周期

推荐模型：

```text
页面或共享容器挂载：创建或复用 app
单个 VRender 使用者挂载：创建 stage
普通业务切换：停止旧任务，清理并更新 scenegraph，然后重绘
页面彻底卸载：释放 stage；没有其他使用者时再释放 app
```

如果业务确实需要销毁并重建 stage，应把它作为低频生命周期边界，并单独观察耗时和内存，不要绑定到高频 tab、filter、scene switch 或 React state 更新。

## 参考

- [Lynx](https://lynxjs.org/zh/)
- [Lynx 官方快速上手](https://lynxjs.org/zh/guide/start/quick-start.html)
- [ReactLynx](https://lynxjs.org/zh/react/)
