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

当前 Lynx smoke 已切到内部标准 `create-rspeedy` 模板同形态工具链：

- `@byted-lynx/react@0.109.3`
- `@byted-lynx/rspeedy@0.9.9`
- `@byted-lynx/hdt-rsbuild-plugin@0.3.6`
- `@byted-lynx/type-lynx@3.3.0`

如果需要调整 Lynx 工具链版本，应整体升级或降级这些 `@byted-lynx/*` 包，避免只升级其中一个导致 ReactLynx transform / runtime / template encoder 不匹配。

标准构建入口是：

```text
dist/main/template.js
```

本地静态服务示例：

```text
http://10.3.134.196:3002/main/template.js
```

不要再使用旧的 `dist/main.lynx.bundle` / `http://.../main.lynx.bundle` 入口；标准内部模板和 HDT 预览都使用 `main/template.js`。

启动 dev server 后，使用 HDT/宿主扫描终端二维码，或在模拟器中输入 template URL。Rspeedy 的 host 配置在 `lynx.config.ts` 的 `server.host` 中维护，不使用 `rspeedy dev --host` CLI 参数。

Canvas 不是 Lynx 默认内置 UI 能力。当前已验证的宿主会默认暴露 Canvas/Krypton bridge，因此优先直接打开 template URL：

```text
http://10.3.134.196:3002/main/template.js
```

部分宿主仍需要在 schema 中显式开启 Canvas。Polaris/sslocal 入口建议使用未转义的 `surl`，与 oncall 给出的格式保持一致：

```text
sslocal://polaris/lynx?surl={template_url}&enable_canvas=1&enable_canvas_optimize=1
```

示例：

```text
sslocal://polaris/lynx?surl=http://10.3.134.196:3002/main/template.js&enable_canvas=1&enable_canvas_optimize=1
```

其中 `enable_canvas=1` 打开 Canvas UI，`enable_canvas_optimize=1` 使用 Krypton Canvas。Lynx 2.9+ 理论上只保留 Krypton 实现。是否需要这两个参数取决于宿主入口；当前测试宿主直接打开 template URL 即可。

如果使用 Lynx Explorer/Rspeedy 的普通预览入口，不要输入 `sslocal://...`，而是直接输入 template URL：

```text
http://10.3.134.196:3002/main/template.js
```

这只能验证 template 加载链路；Canvas 是否可用仍取决于 Explorer/宿主是否默认开启 Canvas，或是否提供等价的开关入口。如果 raw `sslocal://...` 仍不能进入页面，需要确认宿主是否允许加载局域网 HTTP template；必要时把 `dist/main/template.js` 放到宿主可访问的 HTTPS 地址后再作为 `surl`。

### iOS 模拟器 URL-only 入口

如果 iOS 模拟器只能填写 template URL，无法使用 `sslocal://...` schema，优先直接输入：

```text
http://10.3.134.196:3002/main/template.js
```

当前宿主已验证不需要把 `enable_canvas=1&enable_canvas_optimize=1` 作为 template URL query 追加。如果页面仍显示 `Canvas disabled`，并且 diagnostics 中 `lynx.krypton keys` / `lynx keys` 仍没有 `createCanvasNG`、`CanvasElement` 或 `createCanvas`，则说明该宿主入口没有暴露 Canvas/Krypton。这种情况下已经不属于 VRender 创建 canvas 的问题，需要换成支持 schema 参数的入口，或使用默认接入 Krypton Canvas 的宿主/模拟器包。

### iPhone 真机入口

真机更适合确认宿主 Canvas 能力，因为它能排除 iOS 模拟器 URL-only 入口的限制。前提是 iPhone 与本机在同一网络，且手机能访问 dev server：

```text
http://10.3.134.196:3002/main/template.js
```

如果真机宿主支持打开完整 schema，优先使用：

```text
sslocal://polaris/lynx?surl=http://10.3.134.196:3002/main/template.js&enable_canvas=1&enable_canvas_optimize=1
```

如果真机入口也只能填写 template URL，当前已验证直接使用 template URL 即可：

```text
http://10.3.134.196:3002/main/template.js
```

判定标准与模拟器一致：只要页面 diagnostics 中能看到 `lynx.krypton.createCanvasNG`、`lynx.krypton.CanvasElement`、`lynx.createCanvasNG` 或 `lynx.createCanvas`，就可以继续验证 VRender 渲染、动画和事件；如果仍然没有这些 key，说明该真机宿主入口没有开启 Canvas/Krypton，需要换宿主包或让宿主侧打开 Canvas 开关。

### 可用宿主 App 候选

按优先级尝试：

1. 内部 Polaris / Lynx 宿主
   - oncall 给出的 `sslocal://polaris/lynx?...&enable_canvas=1&enable_canvas_optimize=1` schema 明确对应这一类宿主。
   - 这是最可能验证 Krypton Canvas 的入口，但需要内部 iOS 真机包，并确认宿主已接入 Krypton。
2. App Store 社区版 Lynx Go - Dev Explorer
   - App Store 地址：https://apps.apple.com/us/app/lynx-go-dev-explorer/id6743227790
   - 官方 Lynx Quick Start 提到 App Store 上有社区贡献版本，但也说明它不是 Lynx 团队审查和维护的版本。
   - 可用于快速验证 bundle 加载；是否支持 Canvas/Krypton 需要以本 smoke 页面 diagnostics 为准。
3. 官方 Lynx Explorer 源码构建
   - 官方文档说明 iOS 真机没有官方预构建包，需要从源码构建。
   - 源码入口：https://github.com/lynx-family/lynx/tree/develop/explorer/darwin/ios
   - 构建要求较重，文档要求 Xcode 15+、Python/Ruby 等环境，并提示需要较大磁盘空间。适合作为长期稳定的真机宿主方案。

### LynxDesktop 注意事项

如果用 LynxDesktop 打开 `main.lynx.bundle` 出现：

```text
code: 10204
message: Decode error: unknown Decode Error
```

优先按入口问题处理，而不是按 VRender 渲染问题处理：

- 当前 smoke 默认产物是标准 Rspeedy template，路径是 `dist/main/template.js`，不是旧的 `main.lynx.bundle`。
- 如果旧的 `main.lynx.bundle` 在 LynxDesktop 里报 `10204`，优先确认入口是否应改成 `main/template.js`。只有标准模板仍报 `10204` 时，才继续排查 LynxDesktop 对当前 Rspeedy template 协议的支持。
- 这类情况需要向 LynxDesktop owner 确认它要求的 app bundle 生成方式、URL 协议或项目打包入口。继续调整 VRender smoke 的 Lynx 版本无法证明 VRender 端能力。
- 当前 VRender Lynx smoke 依赖 `lynx.krypton` / `createCanvasNG` 这类宿主 Canvas bridge。即使 LynxDesktop 能成功打开页面，也仍需看 diagnostics 是否暴露 Canvas bridge，才能继续验证 VRender Canvas 渲染。

页面显示 `Canvas disabled` 时，说明当前 JS runtime 没有暴露 VRender 可用的 Canvas bridge。页面会同时输出 runtime diagnostics；重点看：

- `scope lynx` 是否为 `present`。ReactLynx/Rspeedy 的 background runtime 可能把 `lynx` 作为模块作用域变量注入，而不是挂在 `globalThis.lynx` 上。
- `lynx.krypton keys` 是否包含 `createCanvas`
- `lynx.krypton keys` 是否包含 `createCanvasNG` 或 `CanvasElement`
- `lynx keys` 是否包含 `createCanvasNG` 或 `createCanvas`
- 如果这些 key 都是 `none`，则当前打开入口没有真正启用 Canvas/Krypton，或宿主没有接入 Krypton。

## 当前覆盖

Lynx smoke 已从单页 demo 整理为多场景测试页。页面顶部场景按钮会切换场景；普通切页会复用同一个 VRender app/stage，在 controller 内执行 `clearScene()`、停止动画/定时器并重绘目标场景，避免频繁创建和释放 Lynx Canvas/native 资源导致模拟器卡顿。完整 stage/app release 只发生在 React unmount 或测试生命周期边界。底部按钮含义：

- `更新`：执行当前场景的主要属性/资源/批量更新。
- `状态/控制`：执行当前场景的状态或动画控制动作。
- `重绘`：重新创建当前场景。

已覆盖场景：

- `图元`：rect、circle、symbol、line、area、arc、path、polygon；覆盖 fill/stroke/lineWidth/cornerRadius/opacity/lineDash/linear gradient/radial gradient/shadow，点击 rect 验证状态与拾取。
- `文本`：普通 text、多行文本、wrap text、rich text、underline、lineThrough。
- `资源`：探测 `lynx.createImage` 与 `lynx.createOffscreenCanvas`；有 offscreen canvas 时用 canvas object 作为 image 资源，覆盖 contain/cover/fill、圆角、透明度、资源替换和拾取；无能力时页面内明确 fallback。
- `动画`：from/to/wait/loop/bounce，覆盖颜色、位置、尺寸、透明度动画；按钮覆盖 pause/resume 与 stop(end)。
- `状态`：setStates、addState、removeState、toggleState、同状态 patch 刷新。
- `变换`：嵌套 group、clip、opacity、zIndex、旋转/缩放/位移和 transform 后拾取。
- `组件`：首屏挂载 Tag、Segment、ArcSegment、LineAxis、CircleAxis、DiscreteLegend、Slider、DataZoom、CheckBox、Radio、Switch、ScrollBar、Title、Indicator、Tooltip。Tag 点击会切换 selected 状态。DataZoom 会在底部状态文案和 console 记录内部 hit target 的 `pointerdown`，再通过 `dataZoomChange` 验证组件原生拖拽更新链路；同时提供 Lynx smoke adapter 路径和透明 fallback hit area，用 VRender public API `setStartAndEnd()` 驱动区域变化，避免宿主 touch drag 差异导致无法继续人工验收其他组件能力。组件创建失败时在画布内显示失败标签，不阻断其他场景。
- `事件`：touchstart/touchmove/touchend/touchcancel 转发到 `stage.window.dispatchEvent()`，覆盖重叠图元、zIndex、旋转分组、clip group 内节点拾取。
- `批量`：48 个批量节点，覆盖批量创建、批量 setAttribute、透明度/描边样式和节点拾取。
- `几何`：line/area/polygon/path/arc/symbol 的几何属性更新、bounds 和重绘。
- `生命周期`：removeAllChild(true)、节点重建、场景切换清理旧节点/动画/定时器、React unmount 时 release stage/app。

### 人工验收清单

打开当前可用 URL：

```text
http://10.3.134.196:3002/main/template.js
```

逐项验收：

1. 页面状态从 `waiting/mounting` 变为 `rendered`，画布内能看到当前场景标题。
2. 顶部每个场景按钮都能切换，切换后旧动画不继续影响新场景。
3. `图元`：点击左上矩形，状态在 selected/normal 间切换；点 `更新` 后渐变、阴影、圆角和 symbol 类型变化。
4. `文本`：普通文本、多行、wrap、rich text 和文字装饰均可见，无明显重叠。
5. `资源`：先看桥接能力文案。若 offscreen 可用，应显示 3 个 image 图元，点击图片可变透明，点 `更新` 可替换资源；若不可用，应显示红色 fallback 文案。
6. `动画`：pulse、mover、star、bar 动画持续推进；点 `更新` 暂停/恢复 mover；点 `状态/控制` 让 stop rect 到达终态。
7. `状态`：点 `更新` 刷新 rect 同状态 patch；点 `状态/控制` 切换 circle active；点击 diamond 走 toggleState。
8. `变换`：裁剪区域正常裁剪；点 group 能命中；点 `更新` 后旋转、缩放、透明度和 zIndex 变化。
9. `组件`：首屏组件可见且切换耗时会显示在底部状态文案；点击 Tag 后蓝色背景应切到绿色 selected，再次点击恢复；Slider/Legend/输入控件能尝试点击或拖动。DataZoom 首屏应可见；点击或拖动 DataZoom 背景、选中区域、左右手柄或中间手柄时，底部状态和 console 应先出现 `DataZoom ... pointerdown`。拖动时如果出现 `touch/global-touch/mouse/global-mouse touchmove ... dispatch=true`，说明 Lynx 入口 move 已送进 VRender；如果随后出现 `DataZoom dataZoomChange (start=... end=...)`，说明组件原生拖拽链路生效；如果出现 `DataZoom lynx drag (...) start=... end=...` 且区域可见变化，说明 Lynx smoke adapter 已用 `setStartAndEnd()` 驱动区域变化，组件内部原生拖拽链路仍需继续排查；如果只出现 `DataZoom smoke-hit-area pointerdown`，说明透明 fallback hit area 接住了事件，DataZoom 内部图元拾取仍异常；如果连该日志都没有，说明事件没有到达组件区域或 canvas 坐标映射仍异常。失败组件会显示 `failed`，需要记录 console 调用链。
10. `事件`：点击重叠区域、旋转 group、clip 内圆点，底部状态文案应显示对应命中目标。
11. `批量`：点击任意节点能命中，点 `更新` 后 48 个节点批量变色/变透明。
12. `几何`：点 `更新` 后 line/area/polygon/arc/path/symbol 几何变化并正确重绘。
13. `生命周期`：点 `更新` 后组内节点重建；反复切换场景后无旧节点残留、无旧动画串场，底部/console 的切换耗时不应随着点击次数持续劣化。

## Lynx 接入注意事项

- 使用 `createLynxVRenderApp` 创建 app，避免污染全局 VRender application；同一页面存在多个 VRender 使用者时，推荐上层通过 `acquireSharedVRenderApp({ env: 'lynx', key })` 共享同一个 app。
- smoke 页应区分普通 scene switch 和完整生命周期测试：普通场景按钮复用同一个 app/stage，只清理并重绘 scenegraph；不要把每次切页都实现成 `createLynxVRenderApp()` / `createStage()` / `release()` 循环，否则 Lynx 模拟器容易因为 native Canvas 资源反复创建释放而快速卡顿。
- 宿主客户端需要接入 Krypton。部分宿主的页面 schema 需要带 `enable_canvas=1&enable_canvas_optimize=1`；当前测试宿主直接打开 template URL 已可用。如果宿主缺少 Canvas 配置，Lynx 会在创建 `<canvas>` UI 节点时抛出 `canvas ui not found when create UI`，此时还没有进入 VRender 渲染路径。
- 页面中应预置 `<canvas name="...">` 或 `<canvas-ng name="...">` 节点。Krypton Canvas 场景优先使用 `<canvas-ng>`；Lynx Canvas element 和 Canvas view 通过 `name` 绑定，Stage 通过 `app.createStage({ canvas: name, width, height, dpr })` 声明自己使用的具体 Canvas view，不使用 DOM `getElementById`。
- 测试页的 canvas 覆盖层同时转发普通 `bindtouch*`、`global-bindtouchmove/end/cancel`、`bindmouse*` 与 `global-bindmousemove/up`。Lynx PC/模拟器鼠标事件会合成为 VRender touch 事件，避免鼠标拖动只触发 `tap` 而没有 `touchmove`。
- `createLynxVRenderApp({ envParams })` 只应承载 app scope 内全局有效的能力，例如模块作用域 `lynx` runtime、`pixelRatio` 或可为该 app 下任意 Canvas name 创建 native canvas 的 `canvasFactory`。具体 Canvas name/id 和尺寸由 Stage 或 Layer 创建时传入。
- `acquireSharedVRenderApp()` 的相同 `env + key` 会复用第一个创建出来的 app，后续调用不会合并或校验 `envParams`。接入层需要保证同一个 key 下的 `lynx` runtime / `canvasFactory` 确实是全局能力；VChart、VTable 等上层库各自创建自己的 Stage 即可。
- 旧的 `envParams.domref` / `canvasIdLists` / `freeCanvasIdx` 仍保留兼容，但新接入不应把主 Canvas view 绑定放在 app 初始化里。
- VRender Lynx env 会在 Stage/Layer 需要 Canvas 时按以下顺序创建 Canvas element：
  - `envParams.canvasFactory({ id, width, height, dpr, offscreen })`，该 factory 必须对同一个 app scope 下的所有使用者全局有效
  - `lynx.krypton.createCanvas(name)`，该路径对应当前 Krypton `<canvas-ng name="...">` 绑定方式
  - `lynx.createCanvasNG(name)`
  - `lynx.krypton.createCanvasNG()` + `attachToCanvasView(name)`
  - `new lynx.krypton.CanvasElement(name)`
  - `lynx.createCanvas(name)`，该 API 在文档中标记为不推荐且可能返回 `null`
- 本 smoke 会探测当前运行时。如果没有 view-bound Canvas 2D bridge，页面会显示 `missing canvas bridge`，这说明当前 Lynx Explorer/宿主还不能验证 VRender canvas 渲染，需要接入宿主 canvas adapter 后再继续图形能力测试。
- 为了便于临时验证，宿主也可以在运行时注入 `globalThis.__VRENDER_LYNX_CANVAS_FACTORY__`，smoke 会把它转交给 `createLynxVRenderApp({ envParams: { canvasFactory } })`。
- Lynx 没有 DOM 的 `document/window` 事件系统，页面需要把 `bindtouchstart`、`bindtouchmove`、`bindtouchend`、`bindtouchcancel` 转发到 `stage.window.dispatchEvent()`。
- ReactLynx/Rspeedy 下 touch 坐标可能只在 `changedTouches[0]` / `touches[0]` 上，也可能出现只有 `changedTouches`、没有 `touches` 的宿主事件形态。smoke 转发层和 VRender Lynx window/env contribution 都会补齐 `touches` 并把坐标归一成顶层 `x/y/offsetX/offsetY/clientX/clientY`，否则 VRender 事件系统拿不到 canvas point 或会在 touch 归一化时失败。
- `<canvas-ng>` 事件能力在不同宿主中可能不一致。smoke 会在 canvas 上方放置一个透明 Lynx `view` 作为事件层，并把事件转发到 `stage.window.dispatchEvent()`。如果点击画布后底部状态只显示 `touchstart x=... y=...`，说明 ReactLynx 事件已进入转发层但未命中图元；如果显示 `dispatch=false`，说明当前 stage/window 没有注册对应原生事件；如果状态完全不变，说明宿主没有把事件交给测试页事件层。
- VRender Lynx window contribution 会把转发事件的 `target/currentTarget` 归一到 native canvas，使事件拾取逻辑不依赖外部 view 事件目标。
- 当前 Lynx env 不支持直接解析 SVG 字符串，`loadSvg()` 会返回 `{ loadState: 'fail', data: null }`，资源测试应优先使用端可加载的图片 URL、宿主 image 资源或 offscreen canvas object。
- 当前 smoke 只能通过 Rspeedy build/typecheck 验证工程链路；Lynx Explorer 或模拟器中的实际渲染、点击和动画仍需人工打开页面确认。
- 不要提交 `dist/`、`dist-*`、`node_modules/` 和 `package-lock.json`，它们由本项目 `.gitignore` 排除。本项目使用 `pnpm-lock.yaml` 锁定测试工具链。

### app/stage 生命周期建议

Lynx 下接入 VRender 时，不建议把普通业务页签、场景切换或组件页切换实现成反复创建和销毁 VRender app/stage。当前 smoke 曾经在每次顶部场景切换时执行：

```text
createLynxVRenderApp() -> createStage() -> render scene -> release stage/app
```

在 Lynx 模拟器中，旧路径连续点击几次后曾出现明显卡顿，且与切到哪个测试场景无关。后续排查发现旧路径把 app 重建、Canvas view 绑定、scenegraph 清理和重绘耦合在一起，不能直接证明 VRender app core 存在持续劣化。将具体 Canvas name/width/height/dpr 从 app `envParams` 拆到 Stage 创建参数后，重建 app 的耗时未再观察到明显持续增加。这个结果说明：此前现象更可能来自测试路径里的 Canvas/native view 操作组合，不能直接当作 VRender 图形渲染或 app core 泄漏来判断。

推荐模型：

```text
Lynx 页面或共享容器挂载:
  app = createLynxVRenderApp({ envParams: app-scope runtime/canvasFactory })
  // 或 acquireSharedVRenderApp({ env: 'lynx', key, envParams })

单个 VRender 使用者挂载:
  stage = app.createStage({ canvas: canvasName, width, height, dpr })

普通业务切换:
  stop old animations/timers/listeners
  stage.defaultLayer.removeAllChild(true)
  rebuild or update scenegraph
  stage.render() / stage.renderNextFrame()

页面彻底卸载:
  stage.release()
  app.release() // only when no VRender user in this app scope remains
```

如果业务确实需要销毁并重建 stage，应把它当成低频生命周期边界处理，并在 Lynx 真机/模拟器中单独观察耗时和内存，而不是绑定到高频 tab、filter、scene switch 或 React state 更新上。当前宿主实测已经确认：复用 app 只重建 stage 没有明显延迟感；拆分 app 全局能力和 Stage Canvas 绑定后，重建 app 也没有再出现明显持续劣化。

当前 smoke 页面提供 3 个切页诊断模式，用于区分卡顿来源：

- `复用Stage`：默认模式，只清理 scenegraph 并重绘场景。这是 Lynx 接入推荐路径。
- `重建Stage`：复用同一个 VRender app，但每次点击场景按钮都会 `stage.release()` 后重新 `app.createStage()`。当前宿主实测没有明显延迟感。
- `重建App`：每次点击场景按钮都完整 `stage.release()` / `app.release()`，再重新 `createLynxVRenderApp()` / `createStage()`。该模式用于对比 app 生命周期成本；在拆出 Stage Canvas 绑定后，当前宿主未再观察到随点击次数持续增加的延迟。

排查时建议固定两三个轻量场景反复点击，并观察底部状态或 console 中的：

```text
[lynx-vrender] scene switch [mode] from -> to in Nms
```

如果 `复用Stage` 稳定、`重建Stage` 也稳定但 `重建App` 劣化，优先检查测试路径是否又把 app 重建和 Canvas/native view 创建、内容清理、额外离屏画布绑定混在一起；如果拆分后仍然劣化，再按 app 级 registry/plugin/env bootstrap 或宿主资源生命周期问题跟进。普通业务接入仍应复用 app 单例或页面级 app，并把 `app.release()` 留给页面彻底卸载。

### ReactLynx 3.0 warning 后续项

当前 `pnpm run build` 仍会输出 ReactLynx 3.0 兼容 warning，但不会导致构建失败。主要来源：

- `@visactor/vrender-components` 中 Brush、Player、ScrollBar 等组件调用 `stopPropagation()`。
- `@visactor/vrender-core` 的 federated event 和 richtext edit plugin 中调用 `stopPropagation()`。
- `@visactor/vrender-core` / `@visactor/vrender-kits` 中存在 `getElementById()` 相关静态检查 warning。

这些 warning 属于 VRender runtime/components 的 Lynx 兼容后续项，本 smoke 只记录并暴露组件行为，不在测试项目里写长期特例。

## 后续扩展

wx 端已完成较完整的第一轮端能力覆盖。Lynx 后续应按同样维度分批补齐：

- 将组件覆盖继续扩展到 wx 端的轴图例、标注准星、控件组件和杂项组件全集。
- 对组件交互建立更细粒度的 Lynx 事件调用链记录，区分测试页事件转发、VRender window contribution 和组件内部事件处理问题。
- 如果宿主提供稳定 image URL 或 asset 机制，补充 `createImage` string URL 路径、失败态和资源替换回归。
- 对批量图元、动画和场景切换增加端内可读的帧率/耗时采样，避免只靠视觉判断稳定性。
- 针对 ReactLynx 3.0 warning，在 VRender runtime/components 中补最小单测后逐项迁移。

## 参考

- Lynx: https://lynxjs.org/zh/
- ReactLynx: https://lynxjs.org/react/
- Lynx Canvas 用户手册: https://lynx.bytedance.net/3.6/zh/guide/canvas/canvas-guide
- Lynx Canvas 初始化: https://lynx.bytedance.net/3.6/zh/guide/canvas/create-canvas
