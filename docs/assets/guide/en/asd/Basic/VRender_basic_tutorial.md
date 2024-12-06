# VRender Basic Guide

VRender is a relatively low-level rendering library. We will introduce the usage of VRender based on different usage scenarios.

1. As a rendering library, the core of VRender is to use the provided **graphic system** to build a scene tree and draw it on the canvas.
2. To support interaction, you can use the **event system** provided by VRender to handle user interaction events.
3. The **state system** based on graphics can conveniently define various states of graphics and switch between different states.
4. If you need animation, you can use the **animation system** provided by VRender to define animations and play animations.
5. If you need components, you can use the **components** provided by VRender, such as Tag components, poptip components, etc.
6. As a low-level library, VRender provides a set of **cross-platform interfaces** to get requestAnimationFrame, devicePixelRatio, create canvas, etc., to avoid you having to handle platform compatibility issues in different environments (such as mini-programs).
7. At the same time, VRender also provides flexible **extension** capabilities and lifecycle hooks, which can be conveniently extended and injected.

# Quick Start

## Graphic System

This section will quickly introduce the graphic system. For more detailed understanding, please refer to [Graphic System](./Basic_Tutorial/Graphic)

### Create Graphics

VRender provides a set of graphic systems, which can conveniently create various graphics and perform drawing. There are several ways to create graphics:

```ts
// Rect can be replaced with other graphics, the format is similar
import { createRect, Rect, application } from '@visactor/vrender';

const rectAttr = { x: 0, y: 0, width: 100, height: 100, fill: 'red' };

const rect1 = createRect(rectAttr);
const rect2 = new Rect(rectAttr);
const rect3 = application.graphicService.creator.rect(rectAttr);
```

All graphics accept an attribute parameter when created. This parameter is an object that contains the attributes of the graphics, common attributes such as x, y, fill, stroke, etc., as well as graphics-related attributes such as width, height, etc. The specific configuration can refer to [Configuration Document](/vrender/option/Arc)

### Introduction to Graphics

The supported graphics include

- Rect
  Rectangle graphics, support rounded corner configuration, rounded corner configuration can be used as a substitute for circles. The specific configuration can refer to [Rect](/vrender/option/Rect)
- Arc
  Fan-shaped graphics, used to support the underlying graphics of pie charts, can configure the inner and outer radius, and can also configure rounded corners. The specific configuration can refer to [Arc](/vrender/option/Arc)
- Area
  Area graphics, used to support the underlying graphics of area charts, define the area by configuring the point array, configure different interpolation forms through curveType, and can implement area clipping through clipRange, which is convenient for executing growth animations. The specific configuration can refer to [Area](/vrender/option/Area)
- Circle
  Circular graphics, used to support the underlying graphics of circles, can configure the radius. The specific configuration can refer to [Circle](/vrender/option/Circle)
- Glyph
  Combination graphics, set sub-graphics through the `setSubGraphic` method, the attribute configured for it can be directly inherited by the sub-graphics, and the coordinate system of the sub-graphics is also inherited from the glyph
- Group
  The container of the graphics, you can add sub-graphics through the `add`/`appendChild` method, remove sub-graphics through the `removeChild` method, clear sub-graphics through the `removeAllChild` method, and get the sub-graphics array through the `children` method. Group can configure clipping. The specific configuration can refer to [Group](/vrender/option/Group)

```ts
const group = createGroup({
  x: 0,
  y: 0,
  width: 100,
  height: 100,
  clip: true // Limit the drawing range of itself and its sub-elements to the range of [0, 0] - [100, 100], and those beyond the range will be clipped
});
const rect = createRect({});
group.add(rect);
```

- Image
  Image graphics, support image loading, can also pass in svg parameters. The specific configuration can refer to [Image](/vrender/option/Image)
- Line
  Line segment graphics, support line segment drawing, pass in point array to define the shape of the line segment, configure different interpolation forms through curveType, can implement area clipping through clipRange, which is convenient for executing growth animations. The specific configuration can refer to [Line](/vrender/option/Line)
- Path
  Path graphics, support path drawing, pass in path array to define the shape of the path. The specific configuration can refer to [Path](/vrender/option/Path)
- Polygon
  Polygon graphics, support polygon drawing, pass in point array to define the shape of the polygon. The specific configuration can refer to [Polygon](/vrender/option/Polygon)
- RichText
  Rich text graphics, support rich text drawing, rich text will be typeset in the given container. Pass in the textConfig array to define the specific configuration of different characters in the rich text. The specific configuration can refer to [RichText](/vrender/option/RichText)

```ts
createRichText({
  x: 100,
  y: 100,
  // Typesetting within a shape with a width and height of 300
  width: 300,
  height: 300,
  wordBreak: 'break-word', // Line break method
  textConfig: [
    {
      text: 'The first piece of text',
      fontWeight: 'bold',
      direction: 'vertical',
      fontSize: 30,
      fill: '#3f51b5'
    },
    {
      text: 'The second piece of text\n',
      fill: '#000'
    },
    {
      text: 'Text after manual line break',
      fill: '#red'
    }
  ]
});
```

- Text
  Text graphics, support text drawing, pass in text to set specific text. The specific configuration can refer to [Text](/vrender/option/Text)
- Symbol
  Symbol graphics, support symbol drawing, pass in symbolType to set symbol type, supported symbol types are | `circle` | `cross` | `diamond` | `square` | `arrow` | `arrowLeft` | `arrowRight` | `arrow2Left` | `arrow2Right` | `wedge` | `thinTriangle` | `triangle` | `triangleUp` | `triangleDown` | `triangleRight` | `triangleLeft` | `stroke` | `star` | `wye` | `rect` | `rectRound` | `roundLine`. The specific configuration can refer to [Symbol](/vrender/option/Symbol)

## Event System

This section will quickly introduce the event system. For more detailed understanding, please refer to [Event System (waiting for document writing)](./event)

### Event Listening

All graphics can listen to events, listen to events through the `on` method, cancel event listening through the `off` method, and listen to an event once through the `once` method.
stage can listen to the events of the entire scene tree, stage.window will directly listen to the native events of the canvas, and vglobal will listen to the native events of the document.
Example code:

```ts
import { createRect, createStage, vglobal } from '@visactor/vrender';
const rect = createRect({});
// Listen to the click event of rect
rect.on('click', () => {
  // do something
});

const stage = createStage({});
// Listen to the click event of the scene tree, the events of the scene tree will go through bubbling and capturing
stage.on('click', () => {
  // do something
});

// Listen to the native events of the canvas
stage.window.addEventListener('click', () => {});

// Listen to the native events of the document
vglobal.addEventListener('click', () => {});
```

### Supported Events

The events supported by VRender include:
`pointerdown` | `pointerup` | `pointerover` | `pointerout` | `touchstart` | `touchend` | `rightdown` | `rightup` | `mousedown` | `mouseup` | `mouseover` | `mouseout` | `click` | `dblclick` | `dbltap` | `pointertap` | `wheel` | `*`

## State System

The attributes we pass to the graphics can be considered as a default state. If we want the graphics to have different performances in different states, we can implement it through the state system.
You can define a states attribute for the graphics. This attribute is an object, which contains the configuration when in different states. You can also set different state configurations dynamically through the `stateProxy` callback.
Then use the `useStates` method to switch the graphic state, and use the `clearStates` method to clear the graphic state.
Next, demonstrate through a piece of code

```ts
const rect = createRect({
  x: 20,
  y: 20,
  width: 10,
  height: 30,
  fill: 'red'
});

// Define two states, state a height is 100, state b has rounded corners
rect.states = {
  a: {
    height: 100
  },
  b: {
    cornerRadius: 100
  }
};

// You can also define a callback, return different state configurations according to the state name, the effect is the same as the states attribute
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

// When clicked, activate state a
rect.on('click', () => {
  rect.useStates(['a']);
});
// When double-clicked, clear the state and restore the default state
rect.on('dblclick', () => {
  rect.clearStates();
});
```

## Animation System

It is very simple to configure an animation for a graphic, call graphic.animate() to return an Animate instance. The specific use of the Animate instance can refer to [Animation](../Basic_Tutorial/Animate)

## Components

This section will quickly introduce components. For more detailed understanding, please refer to [Components (waiting for document writing)](./graphic)

All components are placed in the `@visactor/vrender-component` package. The use of components and graphics is not much different. Both pass in the attribute object. The attribute definition in the component will be more rich and abstract, used to implement the complex functions of the component. Next, take the Tag component as an example to demonstrate how to use the component

```ts
const tag = new Tag({
  x: 100,
  y: 50,
  text: 'aaa',
  minWidth: 90,
  textAlwaysCenter: true,
  // Text style
  textStyle: {
    fontSize: 12,
    fill: '#08979c'
  },
  // Backboard style
  panel: {
    fill: '#e6fffb',
    stroke: '#87e8de',
    lineWidth: 1,
    cornerRadius: 4
  },
  // Style of the shape corresponding to the text
  shape: {
    symbolType: 'star',
    fill: '#08979c',
    fillOpacity: 0.3
  },
  // Padding of the label
  padding: 10
});

stage.defaultLayer.add(tag);
```

## Cross-platform Interface

VRender supports running in browsers, mini-programs and Node.js environments, and also supports interface calls in different environments

### Registration & Use Environment

```ts
import { vglobal, loadTTEnv, initTaroEnv, initWxEnv, initNodeEnv, initHarmonyEnv, container } from '@visactor/vrender';
const CanvasPkg = require('canvas');

// Register the logic of the relevant environment according to your own product environment
initTTEnv();
initTaroEnv();
initWxEnv();
initNodeEnv();
initHarmonyEnv();
initFeishuEnv();

// After registration, you can call setEnv to use the corresponding environment
vglobal.setEnv('node', CanvasPkg);
// The content required by the mini program will be more
vglobal.setEnv('feishu', {
  domref, // The reference of the container node, used to get the width and height
  force: true,
  canvasIdLists, // The list of available canvas ids, the mini program cannot create canvas dynamically, you need to pass a list of available canvas ids
  freeCanvasIdx: 0 // Sometimes in addition to the drawing canvas, additional canvases are needed, here pass in the canvas that can be used additionally, corresponding to the subscript of canvasIdLists
});
```

## Extension

VRender supports enhancing functions through extensions. The specific usage of extensions can refer to [Extensions and Plugins](../Basic_Tutorial/Extensions_and_Plugins).
Here introduces a built-in extension (react-attribute-plugin), used to implement rendering based on React, the code is in `packages/vrender-core/src/plugins/builtin-plugin/react-attribute-plugin.ts` (if you don't need to write plugins, you don't need to look at this file).

```tsx
const rect = createRect({
  x: 20,
  y: 20,
  width: 10,
  height: 30,
  fill: 'red',
  // Here configure the configuration required by the React plugin, element is the dom of React, this dom will be placed in a built-in container
  // The width and height can be used to configure the width and height of the container
  // Use style to configure the style of the container
  // container configures the parent node of the container, the default is the container where the rendering canvas is located
  // anchorType configures the anchor point of the container, you can choose 'position' (xy position decision) | 'boundsLeftTop' (the upper left corner of the graphic bounding box is the anchor point)
  react: {
    element: <button>abc</button>, // Here pass in the dom of React
    width: 60,
    height: 60,
    style: {}
    // container: document.body
    // anchorType: 'boundsLeftTop'
  }
});
```
