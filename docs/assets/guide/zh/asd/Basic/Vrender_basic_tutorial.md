# VRender 基础指引

VRender 是一个比较底层的渲染库，我们将以使用场景作为区分，来介绍 VRender 的使用方式。

1. 作为一个渲染库，VRender 的核心是使用提供的**图元系统**，去构建一个场景树，并将其绘制到画布上。
2. 为了支持交互，可以使用 VRender 提供的**事件系统**，去处理用户的交互事件。
3. 基于图元的**状态系统**，可以方便的定义图元各种状态，以及进行不同状态的切换。
4. 如果有动画需求，可以使用 VRender 提供的**动画系统**，去定义动画，并进行动画的播放。
5. 如果需要组件，可以使用 VRender 提供的**组件**，比如 Tag 组件，poptip 组件等。
6. 作为一个底层库，VRender 提供了一套**跨端接口**，获取 requestAnimationFrame, devicePixelRatio, 创建 canvas 等，避免您在不同环境（比如小程序）中自己去处理平台兼容问题。
7. 同时 VRender 还提供了灵活的**扩展**能力，以及生命周期钩子，可以方便的进行扩展，注入。

# 快速入门

## 图元系统

此章节会快速介绍图元系统，如需详细了解，请参考[图元系统](./Basic_Tutorial/Graphic)

### 创建图元

VRender 提供了一套图元系统，可以方便的创建各种图元，并进行绘制。图元的创建方式有如下几种：

```ts
// Rect可以换成其他图元，格式是类似的
import { createRect, Rect, application } from '@visactor/vrender';

const rectAttr = { x: 0, y: 0, width: 100, height: 100, fill: 'red' };

const rect1 = createRect(rectAttr);
const rect2 = new Rect(rectAttr);
const rect3 = application.graphicService.creator.rect(rectAttr);
```

所有的图元创建时均接收一个 attribute 参数，该参数是一个对象，包含了图元的属性，通用属性比如 x, y, fill, stroke 等，以及图元相关的属性比如 width, height 等。具体的配置可以参考[配置文档](/vrender/option/Arc)

### 图元介绍

支持的图元包括

- Rect
  矩形图元，支持圆角配置，圆角配置大一点可以作为圆形的平替。具体的配置可以参考[Rect](/vrender/option/Rect)
- Arc
  扇形图元，用于饼图的底层图元支持，可以配置内外半径，也可以配置圆角。具体的配置可以参考[Arc](/vrender/option/Arc)
- Area
  面积图元，用于面积图的底层图元支持，通过配置 point 数组来实现面积的定义，通过 curveType 来配置不同的插值形式，可以通过 clipRange 来实现面积的裁剪，便于执行生长动画。具体的配置可以参考[Area](/vrender/option/Area)
- Circle
  圆形图元，用于圆形的底层图元支持，可以配置半径。具体的配置可以参考[Circle](/vrender/option/Circle)
- Glyph
  组合图元，通过`setSubGraphic`方法来设置子图元，对其配置的 attribute 可以直接被子图元继承，子图元的坐标系也是继承自 glyph
- Group
  图元的容器，可以通过`add`/`appendChild`方法添加子图元，通过`removeChild`方法移除子图元，通过`removeAllChild`方法清空子图元，通过`children`方法获取子图元数组，Group 可以配置裁切。具体的配置可以参考[Group](/vrender/option/Group)

```ts
const group = createGroup({
  x: 0,
  y: 0,
  width: 100,
  height: 100,
  clip: true // 将自身以及子元素的绘制范围限制在[0, 0] - [100, 100]范围内，超出范围的将被裁切
});
const rect = createRect({});
group.add(rect);
```

- Image
  图片图元，支持图片的加载，也可以传入 svg 参数。具体的配置可以参考[Image](/vrender/option/Image)
- Line
  线段图元，支持线段的绘制，传入 point 数组来定义线段的形状，通过 curveType 来配置不同的插值形式，可以通过 clipRange 来实现面积的裁剪，便于执行生长动画。。具体的配置可以参考[Line](/vrender/option/Line)
- Path
  路径图元，支持路径的绘制，传入 path 数组来定义路径的形状。具体的配置可以参考[Path](/vrender/option/Path)
- Polygon
  多边形图元，支持多边形的绘制，传入 point 数组来定义多边形的形状。具体的配置可以参考[Polygon](/vrender/option/Polygon)
- RichText
  富文本图元，支持富文本的绘制，富文本会在给定的容器中进行排版。传入 textConfig 数组来定义富文本中不同字符的具体配置。具体的配置可以参考[RichText](/vrender/option/RichText)

```ts
createRichText({
  x: 100,
  y: 100,
  // 宽高为300的形状内排版
  width: 300,
  height: 300,
  wordBreak: 'break-word', // 换行方式
  textConfig: [
    {
      text: '第一块文字',
      fontWeight: 'bold',
      direction: 'vertical',
      fontSize: 30,
      fill: '#3f51b5'
    },
    {
      text: '第二块文字\n',
      fill: '#000'
    },
    {
      text: '手动换行后的文字',
      fill: '#red'
    }
  ]
});
```

- Text
  文本图元，支持文本的绘制，传入 text 来设置具体的文字。具体的配置可以参考[Text](/vrender/option/Text)
- Symbol
  符号图元，支持符号的绘制，传入 symbolType 来设置符号类型，支持的 symbol 类型有| `circle` | `cross` | `diamond` | `square` | `arrow` | `arrowLeft` | `arrowRight` | `arrow2Left` | `arrow2Right` | `wedge` | `thinTriangle` | `triangle` | `triangleUp` | `triangleDown` | `triangleRight` | `triangleLeft` | `stroke` | `star` | `wye` | `rect` | `rectRound` | `roundLine`。具体的配置可以参考[Symbol](/vrender/option/Symbol)

## 事件系统

此章节会快速介绍事件系统，如需详细了解，请参考[事件系统（等待编写文档）](./event)

### 事件监听

所有的图元都可以监听事件，通过`on`方法来监听事件，通过`off`方法来取消监听事件，通过`once`方法来监听一次事件。
stage 可以监听整个场景树的事件，stage.window 会直接监听画布的原生事件，vglobal 会监听 document 的原生事件。
示例代码：

```ts
import { createRect, createStage, vglobal } from '@visactor/vrender';
const rect = createRect({});
// 监听rect的点击事件
rect.on('click', () => {
  // do something
});

const stage = createStage({});
// 监听场景树的点击事件，场景树的事件会经过冒泡和捕获
stage.on('click', () => {
  // do something
});

// 监听画布的原生事件
stage.window.addEventListener('click', () => {});

// 监听document的原生事件
vglobal.addEventListener('click', () => {});
```

### 支持的事件

VRender 支持的事件包括：
`pointerdown` | `pointerup` | `pointerover` | `pointerout` | `touchstart` | `touchend` | `rightdown` | `rightup` | `mousedown` | `mouseup` | `mouseover` | `mouseout` | `click` | `dblclick` | `dbltap` | `pointertap` | `wheel` | `*`

## 状态系统

我们传给图元的属性可以认为是一个默认状态，如果我们希望图元在不同状态下有不同的表现，可以通过状态系统来实现。
可以给图元定义一个 states 的属性，该属性是一个对象，里面保存了不同状态时的配置。也可以通过`stateProxy`回调来动态的设置不同状态的配置。
然后通过`useStates`方法来切换图元状态，通过`clearStates`方法来清空图元状态。
接下来通过一段代码示例演示

```ts
const rect = createRect({
  x: 20,
  y: 20,
  width: 10,
  height: 30,
  fill: 'red'
});

// 定义两个状态，a状态高度是100，b状态有圆角
rect.states = {
  a: {
    height: 100
  },
  b: {
    cornerRadius: 100
  }
};

// 也可以定义一个回调，根据状态名称返回不同的状态配置，效果和states属性一直
// rect.stateProxy = (stateName: string, targetStates?: string[]) => {
//   if (stateName === 'a') {
//     return {
//       width: 300
//     };
//   }
//   if (stateName === 'b') {
//     return {
//       cornerRadius: 100
//     };
//   }
// };

// 被点击的时候，激活状态a
rect.on('click', () => {
  rect.useStates(['a']);
});
// 双击的时候，清空状态，恢复默认状态
rect.on('dblclick', () => {
  rect.clearStates();
});
```

## 动画系统

给图元配置一个动画很简单，调用 graphic.animate()即可返回一个 Animate 实例。Animate 实例的具体使用可以参考[动画](../Basic_Tutorial/Animate)

## 组件

此章节会快速介绍组件，如需详细了解，请参考[组件（等待编写文档）](./graphic)

所有的组件均放在`@visactor/vrender-component`包里，组件和图元的使用上区别不大，都是将 attribute 对象传入，组件中的 attribute 定义会更加的丰富和抽象，用来实现组件的复杂功能。接下来以 Tag 组件为例，演示如何使用组件

```ts
const tag = new Tag({
  x: 100,
  y: 50,
  text: 'aaa',
  minWidth: 90,
  textAlwaysCenter: true,
  // 文字样式
  textStyle: {
    fontSize: 12,
    fill: '#08979c'
  },
  // 背板样式
  panel: {
    fill: '#e6fffb',
    stroke: '#87e8de',
    lineWidth: 1,
    cornerRadius: 4
  },
  // 文字对应的形状样式
  shape: {
    symbolType: 'star',
    fill: '#08979c',
    fillOpacity: 0.3
  },
  // 标签的内边距
  padding: 10
});

stage.defaultLayer.add(tag);
```

## 跨端接口

VRender 支持在浏览器、小程序和 Node.js 环境下运行，同时也支持在不同环境下的接口调用

### 注册&使用环境

```ts
import { vglobal, loadTTEnv, initTaroEnv, initWxEnv, initNodeEnv, initHarmonyEnv, container } from '@visactor/vrender';
const CanvasPkg = require('canvas');

// 根据自己产品的环境，注册相关环境的逻辑
initTTEnv();
initTaroEnv();
initWxEnv();
initNodeEnv();
initHarmonyEnv();
initFeishuEnv();

// 注册后，就可以调用setEnv，使用对应的环境了
vglobal.setEnv('node', CanvasPkg);
// 小程序需要传递的内容会多一些
vglobal.setEnv('feishu', {
  domref, // 容器节点的引用，用于获取宽高
  force: true,
  canvasIdLists, // 可用的canvas id列表，小程序无法动态创建canvas，需要传递一个可用的canvas id列表
  freeCanvasIdx: 0 // 有时候除了绘图的canvas，会额外需要多份canvas，这里传入可以额外使用的canvas，对应canvasIdLists的下标
});
```

## 扩展

VRender 支持通过扩展来增强功能，扩展的具体用法可以参考[扩展和插件](../Basic_Tutorial/Extensions_and_Plugins)。
这里介绍一个内置的扩展（react-attribute-plugin），用于实现基于 React 的渲染，代码在`packages/vrender-core/src/plugins/builtin-plugin/react-attribute-plugin.ts`（如果不需要自己写插件，则不用看这个文件）。

```tsx
const rect = createRect({
  x: 20,
  y: 20,
  width: 10,
  height: 30,
  fill: 'red',
  // 这里配置React插件所需要的配置，element为React的dom，这个dom会被放入一个内置容器中
  // 通过width和height可以配置容器的宽高
  // 通过style配置容器的样式
  // container配置容器的父节点，默认为渲染的canvas所在的容器
  // anchorType配置容器的锚点，可以选择'position'（xy位置决定） | 'boundsLeftTop'（图元包围盒的左上角为锚点）
  react: {
    element: <button>abc</button>, // 这里传入React的dom
    width: 60,
    height: 60,
    style: {}
    // container: document.body
    // anchorType: 'boundsLeftTop'
  }
});
```
