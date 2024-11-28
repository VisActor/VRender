# Creating Instances

Similar to the DOM tree and React virtual node tree, VRender also draws based on a scene tree. VRender mounts this scene tree through layers, which are managed by the Stage. The Stage manages the lifecycle of the entire application, the position and size of views, and the logic for scene drawing and picking.

As shown in the diagram below, a VRender application generally includes a `Stage`, which can have multiple layers (`Layer`) attached to it, and each layer can have multiple graphic elements attached to it.

![](https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/vrender/stage-tree.png)

## Creating a Stage

There are two ways to create a Stage: one is by using the `new` keyword, and the other is by using the `createStage` method. When creating a Stage, an object is passed as a parameter, and there are many configurable properties within the object. The most commonly used properties are as follows:

- `container`: the mounting container, which needs to be a DOM element and is only available in the browser environment
- `canvas`: the mounting canvas, which needs to be a Canvas element and is mutually exclusive with the container, can be used in different environments
- `width`: the width of the canvas
- `height`: the height of the canvas
- `autoRender`: whether to automatically render; if set to true, there is no need to manually call the `stage.render()` method as it will render automatically
- `background`: the background color of the canvas, defaulting to white

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

All the parameters that the stage supports are as follows:

```ts
interface IStageParams {
  // Viewport width and height
  viewBox: IBoundsLike;
  // Total width and height
  width: number;
  height: number;
  dpr: number;
  // Stage background
  background: string | IColor;
  // External canvas
  canvas: string | HTMLCanvasElement;
  // Canvas container, if canvas is not passed, a canvas will be created in the container
  container: string | HTMLElement;
  // Whether it is a controlled canvas; if not, it will not perform resize operations or modify the canvas style
  canvasControled: boolean;
  title: string;
  // Whether to enable automatic rendering
  autoRender: boolean;
  // Whether to enable layout support
  enableLayout: boolean;
  // Whether to disable dirty bounds detection
  disableDirtyBounds: boolean;
  // Whether to support interactiveLayer, default is true
  interactiveLayer: boolean;
  // Whether to support HTML attributes
  enableHtmlAttribute: string | boolean | HTMLElement;
  // Whether to support react-dom (pass in ReactDOM)
  ReactDOM: any;
  // Whether to support scrollbars
  enableScroll: boolean;
  // Whether to support poptip
  poptip: boolean;
  // Hook function before rendering
  beforeRender: (stage: IStage) => void;
  // Hook function after rendering
  afterRender: (stage: IStage) => void;
  // Render style
  renderStyle?: string;
  // Custom ticker
  ticker?: ITicker;
  // List of enabled plugins
  pluginList?: string[];
  // Optimization configuration
  optimize?: IOptimizeType;
  /**
   * Event system related configuration
   */
  event?: EventConfig;

  /**
   * @since 0.17.15
   * Whether to support touch events; if not supported, touch events will not be listened to
   */
  supportsTouchEvents?: boolean;

  /**
   * @since 0.17.15
   * Whether to support pointer events; if not supported, mouse events will be listened to
   */
  supportsPointerEvents?: boolean;

  context?: IStageCreateContext;
}
```

## Creating a Layer

By default, Stage will create a layer `stage.defaultLayer`, which is a container used to mount graphic elements. A Stage can contain any number of layers. In VChart, we often use one layer as the main layer and create another layer to store tooltip elements and components.

To create a layer, you can use the `stage.createLayer()` method.

```ts
createLayer(canvasId?: string, layerMode?: LayerMode): ILayer;
```

## Adding Graphic Elements

VRender provides many graphic elements. For details on graphic elements, you can refer to the [Graphic](./Graphic) section. The creation of graphic elements is similar to Stage, providing two ways to create them. Taking a rectangle element as an example:

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

By adding the rectangle to `stage.defaultLayer`, it will be displayed.

```javascript livedemo template=vrender
// Register all necessary content
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
