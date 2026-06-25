# VRender 项目地图

VRender 是 VisActor 生态的底层可视化渲染库。当前仓库是 Rush 管理的 monorepo，不是单一 npm 包。仓库同时包含核心渲染底座、动画系统、环境/注册 kits、组件层、React 绑定、多端 smoke 工程、文档站和内部工具。

## Rush Monorepo

Rush 配置入口是 `rush.json`：

- Rush 版本：`5.148.0`。
- pnpm 版本：`10.7.0`。
- Node 支持范围：`>=18.18.0 <19.0.0 || >=20.0.0 <25.0.0`。
- 发布包位于 `packages/*`，内部工具位于 `tools/*`，共享配置位于 `share/*`，文档站位于 `docs`。

常见命令由 `common/config/rush/command-line.json` 注册，例如 `rush compile`、`rush test`、`rush eslint`、`rush start`、`rush components`、`rush lint-staged`。

## 主要发布包

| 包 | 路径 | 分层 | 主要职责 |
| --- | --- | --- | --- |
| `@visactor/vrender-core` | `packages/vrender-core` | 底层 | 图元模型、Stage/Layer、render/picker 接口、状态系统、registry、app context、legacy/runtime installer 基础设施 |
| `@visactor/vrender-kits` | `packages/vrender-kits` | 装配层 | env、canvas/window contribution、graphic/register、picker、installers、JSX、drag/gesture、gif/lottie/dynamicTexture |
| `@visactor/vrender-animate` | `packages/vrender-animate` | 运行时扩展 | `registerAnimate`、Graphic 动画扩展、Animate/Step/Timeline/Ticker/Executor、custom animation、state animation、component animation |
| `@visactor/vrender-components` | `packages/vrender-components` | 组件层 | axis、label、legend、tooltip、crosshair、marker、data-zoom、player、slider 等可视化组件 |
| `@visactor/vrender` | `packages/vrender` | 整合层 | 面向上层使用者的主包，聚合 core/kits/animate/components，并提供 app-scoped entries 与 legacy `createStage` 兼容入口 |
| `@visactor/react-vrender` | `packages/react-vrender` | 绑定层 | React reconciler host config、Stage 组件、JSX element 到 VRender graphic 的映射 |
| `@visactor/react-vrender-utils` | `packages/react-vrender-utils` | 绑定辅助 | React HTML overlay 等辅助组件，依赖 `react-vrender` 和 `vrender` |

## 其他顶层目录

- `multi-platform/`：多端真实工程或 smoke 工程，包含 `wx-vrender`、`lynx-vrender`、`harmony-vrender`、`feishu-vrender`、`tt-vrender`。这些目录用于端侧接入验证，不是 core 规范源。
- `docs/`：文档站和专项设计文档。状态/动画重构专项在 `docs/refactor/state-engine/`。
- `tools/`：内部工具，例如 `tools/bundler`、`tools/bugserver-trigger`、`tools/jest-electron-stable`。
- `share/`：共享 ts/jest/eslint 配置。
- `common/`：Rush autoinstaller、hooks、pnpm lock、临时目录和脚本。
- `__tests__/`：根级测试资源，主要测试仍在各 package 的 `__tests__`。

## 典型依赖方向

当前 package 依赖由 `packages/*/package.json` 体现：

```text
vrender-core
  <- vrender-kits
  <- vrender-animate
  <- vrender-components
  <- vrender

vrender-kits + vrender-animate + vrender-components
  <- vrender

vrender
  <- react-vrender
  <- react-vrender-utils
```

职责判断：

- 底层：`vrender-core`。
- 装配层：`vrender-kits`。
- 运行时扩展：`vrender-animate`。
- 组件层：`vrender-components`。
- 上层整合：`vrender`。
- 绑定层：`react-vrender`、`react-vrender-utils`。

## Owner 判断

修改前先判断问题 owner：

- 图元属性、bounds、状态、shared-state、Stage/Layer、render service、picker service：优先 owner 是 `packages/vrender-core`。
- 环境初始化、canvas/window 适配、register、installers、browser/math picker 装配：优先 owner 是 `packages/vrender-kits`。
- 动画调度、custom animation、state animation、ticker/timeline：优先 owner 是 `packages/vrender-animate`。
- axis/label/legend/tooltip/marker 等组件布局或交互：优先 owner 是 `packages/vrender-components`。
- public root entry、shared app、browser/node/miniapp app creator、legacy root `createStage` 兼容：优先 owner 是 `packages/vrender`。
- React mount/update/unmount、host config、props/event 映射：优先 owner 是 `packages/react-vrender`。
- React HTML overlay：优先 owner 是 `packages/react-vrender-utils`。

跨包问题先找最底层 owner。不要在 React、components 或 `vrender` 整合层修补 core 状态语义；除非问题确实是绑定层或入口层调用顺序。

## 当前基础文档不覆盖

- 不做包体积结论。
- 不承诺多端真实设备通过情况。`taro` / `feishu` / `tt` 等端的稳定性需要结合真实端 smoke。
- 不替代 package exports、类型定义和用户文档。
