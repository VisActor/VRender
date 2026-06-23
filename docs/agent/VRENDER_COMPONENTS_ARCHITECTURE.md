# VRender Components Architecture

`@visactor/vrender-components` 是 VRender 的组件层，位于 `packages/vrender-components/src`。它依赖 core 图元能力、kits 注册能力和 animate 运行时，但不应承载 core 状态/动画主语义。

## 包职责

- 提供可复用可视化组件：axis、label、legend、tooltip、crosshair、marker、data-zoom 等。
- 组件多数继承或组合 `src/core/base.ts` 的基础组件能力。
- 组件内部创建 VRender graphics，并通过各模块 `register.ts` 注册依赖图元。
- 组件动画通过 `src/animation/*` 与 `@visactor/vrender-animate` 协作。

入口：

- 总入口：`packages/vrender-components/src/index.ts`
- 基础类型：`src/core/base.ts`、`src/core/type.ts`、`src/interface.ts`

## 组件模块地图

axis：
- 路径：`src/axis/*`
- 入口：`axis/index.ts`
- 注册：`axis/register.ts`
- 主要实现：`axis/base.ts`、`axis/line.ts`、`axis/circle.ts`、`axis/grid/*`、`axis/tick-data/*`、`axis/overlap/*`
- 风险：tick 计算、overlap、grid、动画、极坐标/笛卡尔分支。

label / data-label：
- 路径：`src/label/*`
- 入口：`label/index.ts`
- 注册：`label/register.ts`、`label/data-label-register.ts`
- 主要实现：`label/base.ts`、`label/dataLabel.ts`、`label/rect.ts`、`label/symbol.ts`、`label/line.ts`、`label/arc.ts`、`label/polygon.ts`
- 风险：final attrs/final bounds、overlap、动画期间静态真值读取、VChart 标注场景。

legend：
- 路径：`src/legend/*`
- 入口：`legend/index.ts`
- 注册：`legend/register.ts`
- 主要实现：`legend/base.ts`、`legend/discrete/discrete.ts`、`legend/color/color.ts`、`legend/size/size.ts`
- 风险：布局、focus/hover、scrollbar/pager 组合。

tooltip：
- 路径：`src/tooltip/*`
- 入口：`tooltip/index.ts`
- 注册：`tooltip/register.ts`
- 风险：DOM/HTML attribute、position、文本测量。

crosshair：
- 路径：`src/crosshair/*`
- 入口/注册：`crosshair/index.ts`、`crosshair/register.ts`
- 形态：line、rect、circle、sector、polygon、polygon-sector。
- 风险：picker/event 联动、极坐标几何。

poptip：
- 路径：`src/poptip/*`
- 入口/注册：`poptip/index.ts`、`poptip/register.ts`
- 包含 plugin/module/contribution。
- 风险：插件生命周期、tooltip 类布局。

data-zoom：
- 路径：`src/data-zoom/*`
- 入口/注册：`data-zoom/index.ts`、`data-zoom/register.ts`
- 风险：交互、preview、大数据示例、handler bounds。

marker：
- 路径：`src/marker/*`
- 入口/注册：`marker/index.ts`、`marker/register.ts`
- 类型：line、area、arc-line、arc-area、point。
- 动画：`marker/animate/*`
- 风险：clip/fade/call-in 动画与 label 子图元。

player：
- 路径：`src/player/*`
- 入口/注册：`player/index.ts`、`player/register.ts`
- 类型：continuous/discrete player、controller。
- 风险：controller layout、toggle、event。

slider：
- 路径：`src/slider/*`
- 入口/注册：`slider/index.ts`、`slider/register.ts`
- 风险：交互、handler、组件 update。

scrollbar：
- 路径：`src/scrollbar/*`
- 入口/注册：`scrollbar/index.ts`、`scrollbar/register.ts`
- 包含 plugin/module。
- 风险：legend/pager 组合、滚动事件。

title：
- 路径：`src/title/*`
- 入口/注册：`title/index.ts`、`title/register.ts`
- 风险：文本布局、动画示例。

brush：
- 路径：`src/brush/*`
- 入口/注册：`brush/index.ts`、`brush/register.ts`
- 风险：stage detach、pointer event。

timeline：
- 路径：`src/timeline/*`
- 入口/注册：`timeline/index.ts`、`timeline/register.ts`
- 风险：player/slider 类交互、动画状态。

radio / checkbox：
- 路径：`src/radio/*`、`src/checkbox/*`
- 入口/注册：`radio/index.ts`、`checkbox/index.ts`
- 风险：状态样式、事件、选中态同步。

table-series-number：
- 路径：`src/table-series-number/*`
- 入口/注册：`table-series-number/index.ts`、`table-series-number/register.ts`
- 风险：表格场景、event manager、序号布局。

其他组件：
- `tag`、`segment`、`pager`、`indicator`、`link-path`、`empty-tip`、`weather`、`switch`、`label-item` 也从总入口导出。

## Register 入口和组件入口

组件包通常同时有：

- `index.ts`：导出组件类、类型和工具。
- `register.ts`：注册组件运行依赖的图元、插件或子组件。

不要假设 import 组件类会自动完成所有图元注册。上层或 root package 需要通过 register/bootstrap 确认依赖图元已存在。

## 与 Core / Kits / Animate 的关系

- core：组件实例最终由 VRender graphics 表达；属性、bounds、状态和树生命周期归 core。
- kits：组件 register 依赖 kits 或 core register 图元能力。
- animate：组件动画走 `@visactor/vrender-animate`，组件包的 `src/animation/static-truth.ts` 负责某些 update animation target 的静态目标提交。

组件层不应绕开 core 状态模型自行维护另一套长期静态真值。

## VChart 典型使用方式

VChart 通常通过组件类和注册函数接入 components：

- 图表 spec 解析后创建 axis、label、legend、tooltip 等组件实例。
- 组件内部创建 VRender graphics，挂到 VRender scenegraph。
- 动画配置由 VChart/组件转换成 VRender animate config。

如果 VChart 侧出现组件问题，先判断：

- 组件布局/子图元创建问题：components owner。
- 状态静态真值或 shared-state 问题：core/animate owner。
- 环境或 picker/register 缺失：kits/root entry owner。

## 测试与 Smoke

常见位置：

- unit：`packages/vrender-components/__tests__/unit/*`
- electron：`packages/vrender-components/__tests__/electron/*`
- browser examples：`packages/vrender-components/__tests__/browser/examples/*`
- browser dev：`packages/vrender-components/__tests__/browser`

重点 tests：

- `unit/component-update-animation-static-truth.test.ts`
- `unit/label-update-animation.test.ts`
- `unit/component-exit-release.test.ts`
- `unit/abstract-component-stage-detach.test.ts`
- `unit/brush-stage-detach.test.ts`
- `unit/module-explicit-bindings.test.ts`
- `unit/legacy-removal-browser-examples.test.ts`
- marker/axis/player/data-zoom/util 各自 targeted tests

## 改组件时的风险与验证

- 修改布局：跑对应组件 unit + browser example。
- 修改 register：跑 `unit/module-explicit-bindings.test.ts` 和对应组件 register test。
- 修改动画：跑组件动画 tests + `vrender-animate` targeted runtime tests。
- 修改 detach/release：跑 stage detach / exit release tests。
- 修改 label：额外关注 final attrs/final bounds，不要把临时 `mark.initAttributes(...)` 类路径当成长期方案。

待验证：

- 某些组件 register 与 index 是否一一覆盖所有子图元，当前文档只记录主要路径，未逐项证明完整性。
