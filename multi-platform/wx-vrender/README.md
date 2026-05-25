# wx-vrender-local-smoke

微信小程序端 VRender smoke 项目。

## 运行

1. 在 VRender 仓库根目录构建本地包：`rush build -t @visactor/vrender`。
2. 在本目录执行 `npm run prepare:local`，安装依赖并将 `../../packages/vrender*` 的构建产物同步到本项目 `node_modules/@visactor`。
3. 打开微信开发者工具，导入本目录。
4. 在开发者工具中执行“工具 -> 构建 npm”。
5. 如果刚改过 `project.config.json`，先关闭并重新打开项目，再执行“工具 -> 构建 npm”。
6. 执行 `npm run patch:npm`，补齐微信 npm packer 遗漏的 `gifuct-js` 深层依赖，以及当前发布包尚未包含的 wx 端临时补丁。
7. 编译并打开首页，使用顶部场景按钮切换测试内容；点击底部按钮验证当前场景中的颜色、状态和重绘行为。

## VRender wx 小程序接入说明

### 环境初始化

- 使用 `createWxVRenderApp` 初始化 wx 端 VRender app，再通过该 app 创建 stage。
- 微信 Canvas 2D 节点必须提前写在 WXML 中，并声明 `type="2d"`。当前项目预置 `vrender-main` 作为主渲染 canvas。
- app 级 `envParams` 只放 `pixelRatio`、宿主 runtime、全局有效的 `canvasFactory` 等环境能力；不要再传 `domref`、`canvasIdLists`、`freeCanvasIdx` 或页面私有 canvas 列表。
- 当前 smoke 通过 selector query 拿到原生 Canvas 节点后，直接传给 `app.createStage({ canvas, width, height, dpr })`；同时用 `wx.createOffscreenCanvas` 提供 app-scope `canvasFactory`，供 VRender 内部共享 canvas / 测量 canvas 使用。如果接入层只能传字符串 id，也需要提供对当前共享 app 全局有效的 `canvasFactory({ id, width, height, dpr, offscreen })` 或等价宿主 runtime。
- `createStage` 建议传 `canvasControled: true`，并使用 selector query 得到的 canvas 尺寸。微信 Canvas 2D 节点没有 DOM `getBoundingClientRect()`。

### npm 构建与本地包验证

- `package.json` 中的 `@visactor/vrender` 版本只负责拉取第三方依赖图谱。本地验证 VRender2 改动时，必须先执行 `rush build -t @visactor/vrender`，再执行 `npm run sync:local` 或 `npm run prepare:local`。
- 微信开发者工具的“构建 npm”会生成 `miniprogram/miniprogram_npm`。该目录是端构建产物，已从 git 跟踪中移除并写入 `.gitignore`。
- 每次重新“构建 npm”后都需要再执行 `npm run patch:npm`。当前脚本做两件事：
  - 补齐 `gifuct-js` 依赖链里微信 npm packer 未发现的 `js-binary-schema-parser` 深层 CommonJS 文件。
  - 在使用尚未包含本轮修复的发布包时，给 wx npm 产物补入 wx event target 归一化和 svg fail fallback。升级到包含这些修复的 VRender 版本后，应删除这部分产物补丁。

### 事件与交互

- wx 端 touch 事件从 WXML 转发到 VRender 时，`event.target/currentTarget` 需要指向 native canvas，否则事件系统可能把 `touchmove` 误判为 canvas 外事件。VRender wx window contribution 已在标准路径中归一化这个 target。
- DataZoom、Slider、Brush 等组件依赖 stage 级 `pointermove/pointerup` 监听。组件从 stage 移除或场景切换时必须释放 stage 级监听，避免旧组件回调在 `stage === null` 后继续被触发。
- `tap Group` 时，如果点中的是 Group 内部更高层级的子标签，事件会优先命中子图元；是否同步改变父矩形状态取决于测试页是否在子图元事件里显式转发或更新父状态。

### 资源与图像

- wx env 不支持 DOMParser / URL.createObjectURL 解析 inline svg。VRender wx `loadSvg` 会返回 fail result，ResourceLoader 会走失败态而不是抛未捕获 Promise。
- 当前根入口会静态拉入 gif 依赖，导致微信 npm packer 需要 `patch:npm` 补齐 `js-binary-schema-parser` 文件。后续更合理的 VRender 方向是提供小程序友好的按需入口，基础 smoke 不应静态拉入 gif 相关依赖。
- 微信端内置 `texture: 'grid'` 和 image repeat 暂未放入 smoke：当前 `WxContext2d.createPattern()` 返回 `null`，texture/pattern 能力需要在 VRender wx 渲染链路修复后再恢复覆盖。
- 微信 OffscreenCanvas object image 当前只做静态资源和替换重绘 smoke，不参与 animate/state smoke。object image 与 resource key 的 ownership 后续仍需收敛。

### 组件注意事项

- 当前项目覆盖 `@visactor/vrender` public root 导出的可实例化 VRender components。
- `AbstractComponent`、`AnimateComponent`、`AxisBase`、`LegendBase`、`BaseGrid`、`BasePlayer`、`Marker`、`CrosshairBase` 等基类，以及 plugin / renderer / interaction / event-manager 类不作为独立渲染组件 smoke。
- `PolygonLabel` 当前不从 public root 导出，暂以 Polygon 图元 + DataLabel/RectLabel 路径覆盖多边形标签相关渲染能力。
- Player 和 TableSeriesNumber 的交互仍有 wx 端生命周期/全局事件适配风险。当前 smoke 优先覆盖静态渲染和 public method 触发，后续应继续收敛到组件内部标准事件路径。

### 仓库文件约定

- 应提交：小程序源码、脚本、`package.json`、`package-lock.json`、README、项目级 lint/ignore 配置。
- 不提交：`node_modules/`、`miniprogram/miniprogram_npm/`、`project.private.config.json`、日志文件。
- `miniprogram/pages/index/index.ts` 是端侧全量 smoke 页，刻意排除在 ESLint/Prettier 默认扫描之外，避免编辑器插件和 lint-staged 因长文件/大量场景代码阻塞常规 VRender 开发；新增可复用逻辑应优先抽到后续 `multi-platform/shared`。

## Smoke 场景覆盖

- `基础图元`：rect、circle、symbol、line、area、arc、path、polygon、渐变、阴影、事件、`setStates`。
- `文本排版`：普通文本、多行文本、wrap text、富文本、underline、lineThrough。
- `动画`：属性动画、颜色动画、loop、wait、bounce 类交互节奏和 `onFrame` 渲染。
- `动画控制`：`pause`/`resume`、`stop('end')`、`after`/`parallel` 编排和动画结束属性提交。
- `图片资源`：image 图元、微信 OffscreenCanvas 本地资源、`imageMode`、圆角裁剪、资源替换和拾取。
- `组件`：Tag、Segment、ArcSegment、clip group、group transform、opacity 和组件状态切换。
- `轴图例`：LineAxis、CircleAxis、LineAxisGrid、CircleAxisGrid、DiscreteLegend、ColorContinuousLegend、SizeContinuousLegend、ScrollBar，并监听 legend、slider 和 scrollbar 事件反馈。
- `标注准星`：MarkLine、MarkArea、MarkPoint、MarkArcLine、MarkArcArea、Line/Rect/Circle/Sector/Polygon/PolygonSector Crosshair、Rect/Symbol/Line/Arc Label、DataLabel。
- `控件组件`：Slider、DataZoom、Pager、Brush、Timeline、DiscretePlayer、ContinuousPlayer、CheckBox、Radio、Switch，并监听 change/dataZoomChange/toPrev/toNext/brush/player/input state 事件反馈。
- `杂项组件`：Title、Indicator、Tooltip、PopTip、EmptyTip、LinkPath、StoryLabelItem、WeatherBox、TableSeriesNumber。
- `批量`：批量图元创建、透明度、描边样式、批量 `setAttribute` 和节点拾取。
- `事件拾取`：重叠图元、zIndex、旋转分组、clip 内节点、事件转发和 transform pick。
- `几何更新`：line/area/polygon/path/arc/symbol 的几何属性更新、bounds 和重绘。
- `生命周期`：`removeAllChild(true)`、节点重建、属性更新后重绘和场景切换清理。

## 参考文档

- https://developers.weixin.qq.com/miniprogram/dev/framework/
- https://developers.weixin.qq.com/miniprogram/dev/api/canvas/wx.createOffscreenCanvas.html
