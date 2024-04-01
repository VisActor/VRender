# JSX Support

VRender supports creating scene tree using JSX syntax. If you want to use this mode, please follow the steps below to check your environment:

## Environment Configuration

If you are using JSX syntax to describe scene tree nodes in a react project, you need to wrap VRender's jsx with a conversion function to convert react's virtual nodes into VRender's scene tree nodes.

```ts
const group = decodeReactDom(
  <VGroup attribute={{ x: 100, y: 100 }}>
    <VRect attribute={{ x: 10, y: 10 }} />
  </VGroup>
);
```

If your project is not a react project, you need to configure babel's jsx parsing to support jsx syntax:

```ts
plugins: [
    react({
      babel: {
        parserOpts: {
          plugins: ['decorators-legacy', 'classProperties']
        },
        plugins: [
          [
            '@babel/plugin-transform-react-jsx',
            {
              pragma: 'jsx',
              pragmaFrag: 'Fragment'
            }
          ]
        ]
      }
    })
],
```

Then import jsx in the code:

```ts
import { jsx, VGroup, VRect } from '@visactor/vrender';

const group = (
  <VGroup attribute={{ x: 100, y: 100 }}>
    <VRect attribute={{ x: 10, y: 10 }} />
  </VGroup>
);
```

## API Support

The graphic elements using jsx syntax all start with V, and accept an attribute property. The parameters of this attribute property refer to the configuration document, supporting name, id, and stateProxy configurations, which will be set to the graphic element in the end. The event naming is different, and the event map is as follows:

```ts
{
  onPointerDown: 'pointerdown',
  onPointerUp: 'pointerup',
  onPointerUpOutside: 'pointerupoutside',
  onPointerTap: 'pointertap',
  onPointerOver: 'pointerover',
  onPointerMove: 'pointermove',
  onPointerEnter: 'pointerenter',
  onPointerLeave: 'pointerleave',
  onPointerOut: 'pointerout',
  onMouseDown: 'mousedown',
  onMouseUp: 'mouseup',
  onMouseUpOutside: 'mouseupoutside',
  onMouseMove: 'mousemove',
  onMouseOver: 'mouseover',
  onMouseOut: 'mouseout',
  onMouseEnter: 'mouseenter',
  onMouseLeave: 'mouseleave',
  onPinch: 'pinch',
  onPinchStart: 'pinchstart',
  onPinchEnd: 'pinchend',
  onPan: 'pan',
  onPanStart: 'panstart',
  onPanEnd: 'panend',
  onDrag: 'drag',
  onDragStart: 'dragstart',
  onDragEnter: 'dragenter',
  onDragLeave: 'dragleave',
  onDragOver: 'dragover',
  onDragEnd: 'dragend',
  onRightDown: 'rightdown',
  onRightUp: 'rightup',
  onRightUpOutside: 'rightupoutside',
  onTouchStart: 'touchstart',
  onTouchEnd: 'touchend',
  onTouchEndOutside: 'touchendoutside',
  onTouchMove: 'touchmove',
  onTouchCancel: 'touchcancel',
  onPress: 'press',
  onPressUp: 'pressup',
  onPressEnd: 'pressend',
  onSwipe: 'swipe',
  onDrop: 'drop',
  onWeel: 'wheel',
  onClick: 'click',
  onDblClick: 'dblclick'
}
```
