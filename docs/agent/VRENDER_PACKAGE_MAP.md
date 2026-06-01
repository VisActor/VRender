# VRender Package Map

本文件按 package 梳理职责、入口、边界和验证方式。以 `package.json` 的 `exports`、`sideEffects`、scripts 和当前 `src` 结构为事实来源。

## `@visactor/vrender`

- 路径：`packages/vrender`
- 分层：上层整合包。
- root entry：`packages/vrender/src/index.ts`
- 主要职责：聚合导出 `@visactor/vrender-core`、`@visactor/vrender-kits`、`@visactor/vrender-animate`、`@visactor/vrender-components`，提供 app-scoped entries，并保留 legacy `createStage`。
- 重要 exports：`.`、`./entries`、`./entries/browser`、`./entries/node`、`./entries/miniapp`、`./entries/shared`、`./entries/shared-browser`、`./entries/shared-browser-lite`。
- 运行时注册副作用：`sideEffects: true`。入口 bootstrap 会安装 env、graphics、pickers、plugins、animate，并同步 legacy render/picker binding。
- 常见调用方：VChart、VTable、普通 VRender 用户、React 绑定层。
- 改动风险：入口默认装配、shared app 引用计数、legacy 兼容、browser condition、Node canvas envParams。
- 常用验证：`rush compile -t @visactor/vrender`、`cd packages/vrender && rushx test`、入口相关 targeted tests。
- 不应在这里做：core 图元语义、状态引擎、动画执行器、组件内部布局的真实修复。

## `@visactor/vrender-core`

- 路径：`packages/vrender-core`
- 分层：核心渲染底座。
- root entry：`packages/vrender-core/src/index.ts`
- 主要职责：Graphic、Stage、Layer、render/picker service、event、state/shared-state、registry、factory、application、entries/app context。
- 重要 exports：`.`、`./application`、`./container`、`./entries/browser`、`./entries/runtime-installer`、`./graphic/creator`、`./graphic/base`、`./graphic/group`、`./register/graphic`、`./render/*`、`./picker/constants`、`./path`、`./svg`、`./text`。
- 运行时注册副作用：`sideEffects` 只列 `src/modules.ts` 及构建产物，顶层导出本身不应承担完整 env 装配。
- 常见调用方：`vrender-kits`、`vrender-animate`、`vrender-components`、`vrender`。
- 改动风险：高。图元属性、bounds、状态、render/picker 绑定和 legacy/app-scoped 双路径都可能跨包回归。
- 常用验证：`rush compile -t @visactor/vrender-core`、`cd packages/vrender-core && rushx test`、状态/registry/entries targeted tests。
- 不应在这里做：特定上层组件布局策略、React reconciler 策略、多端业务 smoke 逻辑。

## `@visactor/vrender-kits`

- 路径：`packages/vrender-kits`
- 分层：运行时装配与环境适配层。
- root entry：`packages/vrender-kits/src/index.ts`，Node require 入口为构建后的 `index-node`。
- 主要职责：env、canvas/window contribution、register/register-*、installers、browser/math picker、event extension、JSX/react-tree、gif/lottie/dynamicTexture。
- 重要 exports：`.`、`./env/*`、`./event/extension/*`、`./installers/app`、`./installers/browser`、`./installers/browser-lite`、`./installers/graphics`、`./installers/graphics-lite`、`./register/register-*`、`./jsx/graphicType`、`./tools/dynamicTexture/effect`。
- 运行时注册副作用：`sideEffects: false`。注册函数/installer 显式调用后才装配。
- 常见调用方：`@visactor/vrender` entries、按需装配调用方、测试 harness。
- 改动风险：env 互相污染、picker/render binding 缺失、browser-lite 与 full 装配不一致、多端 canvas/window 参数边界。
- 常用验证：`rush compile -t @visactor/vrender-kits`、`cd packages/vrender-kits && rushx test`、picker/env/register targeted tests。
- 不应在这里做：core 图元静态真值、动画调度、组件布局。

## `@visactor/vrender-animate`

- 路径：`packages/vrender-animate`
- 分层：动画运行时扩展。
- root entry：`packages/vrender-animate/src/index.ts`
- 主要职责：`registerAnimate` 混入 Graphic、`Animate`/`Step`/`Timeline`/`Ticker`/`Executor`、custom animation、state animation、component animation。
- 重要 exports：`.`、`./animate`、`./register`、`./custom/*`、`./executor/animate-executor`、`./state`、`./ticker/default-ticker`、`./ticker/manual-ticker`、`./timeline`。
- 运行时注册副作用：`sideEffects: false`，但 root entry 会创建 `defaultTicker` 并把 `defaultTimeline` 加入 ticker。
- 常见调用方：`@visactor/vrender` bootstrap、components、VChart/VGrammar 等上层动画配置。
- 改动风险：动画帧污染静态真值、state animation 与 `graphic.setStates` 边界、ticker/timeline 推进、custom target 兼容。
- 常用验证：`rush compile -t @visactor/vrender-animate`、`cd packages/vrender-animate && rushx test`、`animation-runtime-attribute.test.ts`。
- 不应在这里做：图元状态解析主语义、组件布局 owner、env/register 装配。

## `@visactor/vrender-components`

- 路径：`packages/vrender-components`
- 分层：组件层。
- root entry：`packages/vrender-components/src/index.ts`
- 主要职责：axis、label/data-label、legend、tooltip、crosshair、poptip、data-zoom、marker、player、slider、scrollbar、title、brush、timeline、radio/checkbox、table-series-number 等组件。
- 重要 exports：`.`、`./axis*`、`./crosshair*`、`./label*`、`./legend*`、`./poptip*`、`./tag*`、`./tooltip*`、`./util*`。
- 运行时注册副作用：`sideEffects: false`。组件 register 和入口导出分离。
- 常见调用方：VChart、示例页、`@visactor/vrender` root 聚合导出。
- 改动风险：组件内部图元注册、label/final bounds、组件动画静态真值、stage detach/release、browser examples。
- 常用验证：`rush compile -t @visactor/vrender-components`、`cd packages/vrender-components && rushx test`、必要时 browser examples。
- 不应在这里做：core 状态引擎修补、kits env 适配、React reconciler 行为。

## `@visactor/react-vrender`

- 路径：`packages/react-vrender`
- 分层：React 绑定层。
- root entry：`packages/react-vrender/src/index.ts`
- 主要职责：`Stage` React 组件、host elements、React reconciler host config、props/event 到 VRender graphic 的映射。
- 重要 exports：`.`。
- 运行时注册副作用：`sideEffects: false`。
- 常见调用方：React 应用、`react-vrender-utils`。
- 改动风险：mount/update/unmount 生命周期、stage/app release、事件解绑重绑、Glyph/ShadowRoot 特殊插入逻辑。
- 常用验证：`rush compile -t @visactor/react-vrender`、`cd packages/react-vrender && rushx test`。
- 不应在这里做：core 状态语义、动画执行器、kits env 安装。

## `@visactor/react-vrender-utils`

- 路径：`packages/react-vrender-utils`
- 分层：React 辅助层。
- root entry：`packages/react-vrender-utils/src/index.ts`
- 主要职责：当前主要导出 `Html`，通过 `ShadowRoot` 和 DOM portal 在 VRender stage 容器中挂载 HTML overlay。
- 重要 exports：`.`。
- 运行时注册副作用：`sideEffects: false`。
- 常见调用方：React 上层应用。
- 改动风险：DOM 生命周期、stage `beforeRender` hook 注册/解绑、transform 与容器定位。
- 常用验证：`rush compile -t @visactor/react-vrender-utils`、`cd packages/react-vrender-utils && rushx test`。
- 不应在这里做：React host config 主逻辑、core 图元逻辑、组件布局。
