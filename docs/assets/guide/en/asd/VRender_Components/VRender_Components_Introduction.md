# Components

Components are special primitives and also special Groups. VRender provides a series of built-in components, such as `datazoom`, `axes`, `label`, `legend`, `poptip`, etc., which can help us quickly achieve some common interactive effects. Externally, custom components can be implemented by inheriting `AbstractComponent` from `@visactor/vrender-components`.

![](https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/vrender/vrender-component-intro-component.png)

## Introduction

Components are implemented based on the `Group` primitive, so the component itself is a special Group primitive. All configurations that can be supported by Group primitives can be configured to components, but of course, in general, components will abstract a set of special configurations for defining the special configurations of the component. Components internally contain other primitives and the logic of the component. For example, the `axes` component contains `line` primitives, `text` primitives, `path` primitives, etc. Different types of `axes` components have different styles, and the labels in the `axes` component implement anti-overlapping logic based on various strategies.

## Using Components

Since components are implemented based on the `Group` primitive, when using them, simply use them as a Group, but this Group will internally manage its own child elements and have its own state.

Below is an example of using an `axes` component:
```ts
const lineAxis = new LineAxis({
  x: 68,
  y: 30,
  start: {
    x: 0,
    y: 0
  },
  end: {
    x: 0,
    y: 400
  },
  pickable: true,
  visible: true,
  orient: 'left',
  line: {
    visible: false
  },
  label: {
    visible: true,
    inside: false,
    space: 12,
    autoLimit: true,
    style: {
      fontSize: 12,
      fill: '#89909d',
      fontWeight: 'normal',
      fillOpacity: 1
    },
    formatMethod: null
  },
  tick: {
    visible: false
  },
  subTick: {
    visible: false
  },
  title: {
    visible: false,
    text: 'visits',
    maxWidth: null
  },
  panel: {
    visible: false
  },
  verticalFactor: 1,
  items: [
    [
      {
        id: 0,
        label: 0,
        value: 1,
        rawValue: 0
      },
      {
        id: 500,
        label: 500,
        value: 0.780952380952381,
        rawValue: 500
      },
      {
        id: 1000,
        label: 1000,
        value: 0.5619047619047619,
        rawValue: 1000
      },
      {
        id: 1500,
        label: 1500,
        value: 0.3428571428571428,
        rawValue: 1500
      },
      {
        id: 2000,
        label: 2000,
        value: 0.12380952380952383,
        rawValue: 2000
      },
      {
        id: 24000,
        label: 24000,
        value: -0.0042307692307692315,
        rawValue: 24000
      }
    ]
  ],
});

const stage = createStage({
  canvas: 'main',
  autoRender: true
});

stage.defaultLayer.add(lineAxis);
window['stage'] = stage;
```

## Custom Components

Custom components are simpler than custom primitives, as they do not need to customize render and pick, because the primitives they use are already existing primitives. We only need to implement our own logic inside the component, similar to `react`.

1. Inherit `AbstractComponent`
2. Define your own `attribute`, because components often contain different child element modules, such as axis labels, axis ticks, axis lines, etc., so you can define an attribute interface to define the properties of the component.
3. Override the `render` function, which will be called every time valid attributes are updated. In the `render` function, create and manage child elements.

Here is a simple example. For example, if we want to implement a component that is a box containing circles, and when the number of circles is passed in, it can draw that number of circles:
```ts
import { AbstractComponent } from '@visactor/vrender-components';
class CircleBox extends AbstractComponent<Required<CircleBoxAttributes>> {
  name = 'circleBox';

  static defaultAttributes: Partial<CircleBoxAttributes> = {
    circleStyle: {
      fill: 'red',
    },
    circleCount: 10,
    width: 300,
    height: 300
  };

  constructor(attributes: PopTipAttributes, options?: ComponentOptions) {
    super(options?.skipDefault ? attributes : merge({}, CircleBox.defaultAttributes, attributes));
  }

  // Called every time valid attributes are updated
  protected render() {
    const { circleCount, circleStyle, width, height } = this.attribute;

    const minWH = Math.min(width, height);
    const count = Math.ceil(Math.sqrt(circleCount));
    const radius = Math.floor(minWH) / count / 2;
    for (let i = 0; i < circleCount; i++) {
      // Calculate the position of the child element
      const x = (i % count) * radius * 2 + radius;
      const y = Math.floor(i / count) * radius * 2 + radius;
      // Add or create child elements
      const circle = this.createOrUpdateChild(`circle-${i}`, { ...circleStyle, radius, x, y }, 'circle');
    }
  }
}
```

After customizing, you can use it just like other components.

```javascript livedemo template=vrender
VRenderComponent.loadPoptip();

class CircleBox extends VRenderComponent.AbstractComponent {
  name = 'circleBox';

  static defaultAttributes = {
    circleStyle: {
      fill: 'red',
    },
    stroke: 'blue',
    circleCount: 10,
    width: 300,
    height: 300
  };

  constructor(attributes, options) {
    super(options?.skipDefault ? attributes : ({...CircleBox.defaultAttributes, ...attributes}));
  }

  // 每次合法属性更新都会调用
  render() {
    const { circleCount, circleStyle, width, height } = this.attribute;

    const minWH = Math.min(width, height);
    const count = Math.ceil(Math.sqrt(circleCount));
    const radius = Math.floor(minWH) / count / 2;
    for (let i = 0; i < circleCount; i++) {
      // 计算子元素的位置
      const x = (i % count) * radius * 2 + radius;
      const y = Math.floor(i / count) * radius * 2 + radius;
      // 添加或创建子元素
      const circle = this.createOrUpdateChild(`circle-${i}`, { ...circleStyle, radius, x, y }, 'circle');
    }
  }
}

const textLimit = new CircleBox({x: 10, y: 10, circleCount: 100});
const stage = VRender.createStage({
  container: CONTAINER_ID,
  autoRender: true,
  pluginList: ['poptipForText'] // 启用poptipForText插件
});

stage.defaultLayer.add(textLimit);

window['stage'] = stage;
```
