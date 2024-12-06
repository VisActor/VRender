# 事件

VRender将 DOM 事件模型及 API 作为参照标准进行设计，提供了一系列默认基于图元的事件，VRender底层会兼容不同浏览器版本，提供统一的事件。支持的事件类型包括pointer事件、mouse事件、touch事件、wheel事件

* pointer事件
  - pointerdown
  - pointerup
  - pointerupoutside
  - pointertap
  - pointerover
  - pointerenter
  - pointerleave
  - pointerout
* 左键操作
  - mousedown
  - mouseup
  - mouseupoutside  鼠标抬起与按下时图形不同
* 右键操作
  - rightdown
  - rightup
  - rightupoutside 鼠标抬起与按下时图形不同
* 鼠标操作
  - click
  - mousemove
  - mouseover
  - mouseout
  - mouseenter
  - mouseleave
* 滚动
  - wheel
* touch事件
  - touchstart
  - touchend
  - touchendoutside
  - touchmove
  - touchcancel
  - tap
* 通配事件
  - *

## 监听与代理
VRender可以直接针对图元进行事件的监听和处理，支持`addEventListener`和`removeEventListener`方法，，且方法的参数和Dom一致，支持在捕获流程或者冒泡流程中使用：

```ts
interface AddEventListenerOptions extends EventListenerOptions {
    once?: boolean;
    passive?: boolean;
    signal?: AbortSignal;
}

addEventListener(
  type: string,
  listener: EventListenerOrEventListenerObject | LooseFunction,
  options?: AddEventListenerOptions | boolean
): void;

removeEventListener(
  type: string,
  listener: EventListenerOrEventListenerObject | LooseFunction,
  options?: AddEventListenerOptions | boolean
): void;

type on = addEventListener;
type off = removeEventListener;

// 仅监听一次
once(
  type: string,
  listener: EventListenerOrEventListenerObject | LooseFunction,
  options?: AddEventListenerOptions | boolean
): void;

```

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

rect.addEventListener('click', () => {
  rect.setAttribute('fill', 'blue');
})

stage.defaultLayer.add(rect);

window['stage'] = stage;
```

同时，VRender也支持事件的代理，任意节点都可以直接代理到子图元上，可以通过Event里的target来判断真正出发事件的元素是什么，下面是一个事件代理的例子。

```javascript livedemo template=vrender
// 注册所有需要的内容
const stage = new VRender.Stage({
  container: CONTAINER_ID,
  autoRender: true
});

const group = VRender.createGroup({x: 100, y: 100, width: 200, height: 200, fill: 'pink'});
const rect = VRender.createRect({ x: 50, y: 50, fill: 'green', width: 100, height: 100 });
group.add(rect);
group.addEventListener('click', (e) => {
  if (e.target === group) {
    group.setAttribute('fill', 'orange');
  } else {
    rect.setAttribute('fill', 'red');
  }
});

stage.defaultLayer.add(group);

window['stage'] = stage;
```

【注意】：需要注意的是，VRender抛出的事件对象是复用的，所以注意不要保存事件对象在后续使用，因为事件对象会变的。这点在异步流程中需要特别注意
