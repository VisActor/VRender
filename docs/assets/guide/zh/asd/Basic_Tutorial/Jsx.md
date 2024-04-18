# JSX 支持

VRender 支持 JSX 形式的创建场景树，如果您需要使用这种模式，请按以下步骤检查环境：

## 环境配置

如果您是在 react 项目中使用 jsx 语法来描述场景树节点，那么您需要给 VRender 的 jsx 外层包裹一个转换函数，以便于将 react 的虚拟节点转换成 VRender 的场景树节点

```ts
const group = decodeReactDom(
  <VGroup attribute={{ x: 100, y: 100 }}>
    <VRect attribute={{ x: 10, y: 10 }} />
  </VGroup>
);
```

如果您的项目不是 react 项目，那么需要配置 babel 的 jsx 解析以便于支持 jsx 语法：

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

然后在代码中 import jsx 即可

```ts
import { jsx, VGroup, VRect } from '@visactor/vrender';

const group = (
  <VGroup attribute={{ x: 100, y: 100 }}>
    <VRect attribute={{ x: 10, y: 10 }} />
  </VGroup>
);
```

## API 支持

使用 jsx 语法的图元都以`V`开头，接受一个 attribute 属性，这个 attribute 属性的参数具体参考配置文档，支持 name、id、stateProxy 配置，最终都会被设置到图元上
事件命名有所不同，事件的 Map 如下所示：

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
