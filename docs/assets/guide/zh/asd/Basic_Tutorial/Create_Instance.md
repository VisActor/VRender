# 创建实例

和Dom树、React虚拟节点树类似，VRender也是基于一颗场景树进行绘制的，，VRender通过图层来挂载这颗场景树，图层则由Stage进行管理，Stage管理整个应用的生命周期，视图的位置和大小，场景的绘制、拾取等逻辑。

如下图所示，一个VRender应用一般包括一个`Stage`，`Stage`下可挂载多个图层(`Layer`)，图层下可以挂载多个图形元素。

![](https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/vrender/stage-tree.png)

## 创建Stage

Stage有两种方式创建，一种是通过`new`关键字创建，另一种是通过`createStage`方法创建。Stage接受的一个对象为参数，对象中可配置的属性有很多，其中最常用的属性如下：

- `container`：挂载的容器，需要是Dom元素，仅在浏览器环境可用
- `canvas`：挂载的画布，需要是Canvas元素，和container互斥，可以在不同环境中使用
- `width`：画布的宽度
- `height`：画布的高度
- `autoRender`：是否自动渲染，如果配置为true，那么无需手动调用`stage.render()`方法，会自动渲染
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
})

const stage2 = createStage({
  container: document.getElementById('container'),
  width: 600,
  height: 600,
  autoRender: true,
  background: 'pink'
})
```

stage支持的所有参数配置如下：

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

Stage默认会创建一个图层`stage.defaultLayer`，图层是一个容器，用于挂载图形元素，一个`Stage`中可以包含任意多个图层，在`VChart`中我们常常使用一个图层作为主图层，再创建一个图层用于存放`tooltip`等图元和组件。

创建图层的方法为`stage.createLayer()`。

```ts
createLayer(canvasId?: string, layerMode?: LayerMode): ILayer;
```

## 添加图元

VRender提供了很多图元，图元的具体介绍可以查看[图元](./Graphic)章节。图元的创建和Stage类似，也是提供了两种创建方式，我们以矩形图元为例：

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
  fill:'red'
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
  fill:'red'
});

stage.defaultLayer.add(rect);

window['stage'] = stage;
```
