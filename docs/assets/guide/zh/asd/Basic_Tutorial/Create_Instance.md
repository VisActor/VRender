# 创建实例

和 Dom 树、React 虚拟节点树类似，VRender 也是基于一颗场景树进行绘制的，，VRender 通过图层来挂载这颗场景树，图层则由 Stage 进行管理，Stage 管理整个应用的生命周期，视图的位置和大小，场景的绘制、拾取等逻辑。

如下图所示，一个 VRender 应用一般包括一个`Stage`，`Stage`下可挂载多个图层(`Layer`)，图层下可以挂载多个图形元素。

![](https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/vrender/stage-tree.png)

## 创建 Stage

Stage 有两种方式创建，一种是通过`new`关键字创建，另一种是通过`createStage`方法创建。Stage 接受的一个对象为参数，对象中可配置的属性有很多，其中最常用的属性如下：

- `container`：挂载的容器，需要是 Dom 元素，仅在浏览器环境可用
- `canvas`：挂载的画布，需要是 Canvas 元素，和 container 互斥，可以在不同环境中使用
- `width`：画布的宽度
- `height`：画布的高度
- `autoRender`：是否自动渲染，如果配置为 true，那么无需手动调用`stage.render()`方法，会自动渲染
- `background`：画布的背景色，默认为白色

```ts
import { Stage, createStage } from '@visactor/vrender';
// import { Stage, createStage } from '@visactor/vrender-core';

const stage1 = new Stage({
  container: document.getElementById('container'),
  width: 600,
  height: 600,
  autoRender: true,
  background: 'pink'
});

const stage2 = createStage({
  container: document.getElementById('container'),
  width: 600,
  height: 600,
  autoRender: true,
  background: 'pink'
});
```

### App 与 Stage 生命周期建议

在 browser、node、小程序、Lynx 等多端接入中，推荐使用 `createBrowserVRenderApp()`、`createLynxVRenderApp()` 等 app-scoped 入口创建 VRender app，再通过 `app.createStage()` 创建 Stage。app 负责管理 renderer、picker、plugin、env contribution 等应用级资源，应按页面、容器或宿主 Canvas view 的生命周期复用，而不是在普通业务切换中频繁创建和释放。

app 级 `envParams` 只应放环境级能力，例如 node 下的 `node-canvas` 包、Lynx 下对整个 app scope 都有效的 `lynx` runtime 或 `canvasFactory`。具体 Canvas view 的 `canvas` name/id、宽高和 dpr 属于 Stage 或 Layer 创建参数，应由 `app.createStage({ canvas, width, height, dpr })` 或图层创建路径传入。接入层如果把 `canvasFactory` 这类能力放到 app 上，需要保证它对同一 app 下的所有 VRender 使用者都是全局有效的。

当同一页面里有多个上层库需要使用 VRender（例如一个 VChart 图表和一个 VTable 表格），可以使用 `acquireSharedVRenderApp()` 按 `env + key` 获取共享 app。第一个获取者的 app 级参数会用于创建 app，后续相同 `env + key` 的获取者复用同一个 app；VRender 不会合并或校验后续 `envParams`，因此接入层需要保证同一个 key 表示同一个全局环境能力集合。每个使用者仍应创建和释放自己的 Stage：

```ts
import { acquireSharedVRenderApp } from '@visactor/vrender';

const sharedApp = acquireSharedVRenderApp({
  env: 'lynx',
  key: 'page-main',
  envParams: {
    pixelRatio,
    lynx
  }
});

const stage = sharedApp.app.createStage({
  canvas: 'chart-canvas',
  width: 360,
  height: 240,
  dpr: pixelRatio
});

// dispose this VRender user
stage.release();
sharedApp.release();
```

普通页签切换、筛选条件切换、场景切换或组件页切换时，优先复用已有 app/stage，只清理旧图元、停止旧动画/定时器并重建或更新 scenegraph：

```ts
stage.defaultLayer.removeAllChild(true);
// rebuild or update scenegraph
stage.render();
```

如果确实需要更换 Stage，可复用同一个 app，低频执行 `stage.release()` 后重新 `app.createStage()`。只有当页面、容器或 Canvas view 彻底卸载时，再执行完整释放：

```ts
stage.release();
app.release();
```

在 Lynx smoke 排查中，旧测试路径曾把 app 重建、Canvas view 绑定、scenegraph 清理和重绘耦合在一起，连续切换后出现过明显卡顿；将具体 Canvas 参数从 app `envParams` 拆到 Stage 创建参数后，单独重建 app 未再观察到持续劣化。这说明此前卡顿更可能来自测试路径中的 Canvas/native view 操作组合，而不是 VRender app core 的必然泄漏。Lynx 和其他多端宿主接入时仍应尽量把 app 作为单例或页面级实例复用，避免把 `app.release()` 绑定到高频 UI 切换路径上。

### Harmony 接入与离线验证

Harmony 接入同样推荐使用 `createHarmonyVRenderApp()` 或 `acquireSharedVRenderApp({ env: 'harmony' })` 创建 app。app 级 `envParams` 只放对整个 app scope 都有效的环境能力，例如 `pixelRatio`、可为任意 Stage canvas name/id 创建宿主 Canvas 的 `canvasFactory`，或等价的宿主 runtime。具体 Canvas name/id、宽高和 dpr 仍由 Stage 传入：

```ts
import { createHarmonyVRenderApp } from '@visactor/vrender';

const app = createHarmonyVRenderApp({
  envParams: {
    pixelRatio,
    canvasFactory: ({ id, width, height, dpr, offscreen }) => {
      // 返回宿主侧可绘制的 Canvas-like 对象：
      // 需要支持 getContext('2d')，并允许设置 width/height。
      return createHostHarmonyCanvas({ id, width, height, dpr, offscreen });
    }
  }
});

const stage = app.createStage({
  canvas: 'chart-canvas',
  width: 360,
  height: 240,
  dpr: pixelRatio,
  autoRender: true
});
```

如果没有 Harmony 真机，仍然可以做以下验证：

- 在 VRender 仓库内跑 Harmony env/window 单测、相关包 compile 和类型检查，确认 app-scoped 入口、Stage 级 Canvas 创建、事件归一化、SVG fallback 等运行时契约。
- 在 DevEco Studio / HarmonyOS SDK 提供的模拟器或预览环境中验证宿主 Canvas adapter 是否能返回可用的 `CanvasRenderingContext2D`，以及 touch/click 事件是否能转发到 `stage.window.dispatchEvent()`。
- 使用 mock `canvasFactory` 验证 VChart、VTable 等上层库是否按 Stage 参数创建各自的 Canvas，而不是把具体 canvas id/尺寸塞进共享 app 的 `envParams`。

没有真机时不能完整证明以下内容：真实设备 GPU/Canvas bridge 性能、字体与图片资源加载差异、长时间触摸交互稳定性、多层 Canvas 合成效果以及低端设备内存行为。这些需要后续用 Harmony 真机或至少官方模拟器逐项 smoke。

Harmony 宿主需要把触摸事件转换为 VRender 可识别的事件对象，并转发给当前 Stage：

```ts
stage.window.dispatchEvent({
  type: 'touchstart',
  changedTouches: [{ x, y, clientX: x, clientY: y }]
});
```

VRender Harmony window contribution 会把 `target/currentTarget` 归一到 native canvas，并补齐顶层 `x/y/offsetX/offsetY/clientX/clientY`，但宿主仍需要保证事件坐标已经是当前 Canvas 坐标系下的值。

stage 支持的所有参数配置如下：

```ts
interface IStageParams {
  // 视口的宽高
  viewBox: IBoundsLike;
  // 总的宽高
  width: number;
  height: number;
  dpr: number;
  // stage的背景
  background: string | IColor;
  // 外部的canvas
  canvas: string | HTMLCanvasElement;
  // canvas的container容器，如果不传入canvas，那就会在容器中创建canvas
  container: string | HTMLElement;
  // 是否是受控制的canvas，如果不是的话，不会进行resize等操作，也不会修改canvas的样式
  canvasControled: boolean;
  title: string;
  // 是否开启自动渲染
  autoRender: boolean;
  // 是否开启布局支持
  enableLayout: boolean;
  // 是否关闭脏矩形检测
  disableDirtyBounds: boolean;
  // 是否支持interactiveLayer，默认为true
  interactiveLayer: boolean;
  // 是否支持HTML属性
  enableHtmlAttribute: string | boolean | HTMLElement;
  // 是否支持react-dom(传入ReactDOM)
  ReactDOM: any;
  // 是否支持滚动条
  enableScroll: boolean;
  // 是否支持poptip
  poptip: boolean;
  // 绘制之前的钩子函数
  beforeRender: (stage: IStage) => void;
  // 绘制之后的钩子函数
  afterRender: (stage: IStage) => void;
  // 渲染风格
  renderStyle?: string;
  // 自定义ticker
  ticker?: ITicker;
  // 开启的插件列表
  pluginList?: string[];
  // 优化配置
  optimize?: IOptimizeType;
  /**
   * 事件系统相关配置
   */
  event?: EventConfig;

  /**
   * @since 0.17.15
   * 是否支持touch事件，不支持就不监听touch事件
   */
  supportsTouchEvents?: boolean;

  /**
   * @since 0.17.15
   * 是否支持pointer事件，不支持就监听mouse事件
   */
  supportsPointerEvents?: boolean;

  context?: IStageCreateContext;
}
```

## 创建图层

Stage 默认会创建一个图层`stage.defaultLayer`，图层是一个容器，用于挂载图形元素，一个`Stage`中可以包含任意多个图层，在`VChart`中我们常常使用一个图层作为主图层，再创建一个图层用于存放`tooltip`等图元和组件。

创建图层的方法为`stage.createLayer()`。

```ts
createLayer(canvasId?: string, layerMode?: LayerMode): ILayer;
```

## 添加图元

VRender 提供了很多图元，图元的具体介绍可以查看[图元](./Graphic)章节。图元的创建和 Stage 类似，也是提供了两种创建方式，我们以矩形图元为例：

```ts
import { Rect, createRect } from '@visactor/vrender';

const rect1 = new Rect({
  x: 100,
  y: 100,
  width: 100,
  height: 100,
  fill: 'red'
});

const rect2 = createRect({
  x: 100,
  y: 100,
  width: 100,
  height: 100,
  fill: 'red'
});
```

我们将矩形添加到`stage.defaultLayer`上，就可以展示了

```javascript livedemo template=vrender
// 注册所有需要的内容
const stage = new VRender.Stage({
  container: CONTAINER_ID,
  autoRender: true
});

const rect = VRender.createRect({
  x: 100,
  y: 100,
  width: 100,
  height: 100,
  fill: 'red'
});

stage.defaultLayer.add(rect);

window['stage'] = stage;
```
