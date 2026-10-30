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

## 宿主输入与多 Stage 合成

默认 DOM 输入与宿主输入共用 EventSystem 的归一化、拾取和分发路径。宿主接入时关闭 Stage 的默认 DOM 监听：

```ts
const stage = createStage({
  event: { useNativeEvents: false },
  interactiveLayerMode: 'virtual',
  requestRender: () => scheduleHostFrame()
});
// 先由宿主确定归属；canvasPoint 已去掉宿主合成矩阵，单位为逻辑像素，不乘 DPR。
stage.eventSystem.handleNativeEvent(nativeEvent, {
  canvasPoint: { x, y },
  inViewport: true
});
// 忽略某一次输入不等于取消。切换所有权、宿主 blur 或开始其他手势时显式取消。
stage.eventSystem.cancelPointer(pointerId);
stage.eventSystem.cancelAllPointers();
```

坐标链为 client → 宿主 canvas 逻辑坐标 → 去掉宿主合成变换 → canvasPoint → Stage window.pointTransform → view。Stage.eventPointTransform 对 Federated 事件直接返回 viewX/viewY，不会重复解释 client 坐标。未传 options 的 handleNativeEvent 沿用 DOM 坐标与视口判断。

获准输入的两个订阅范围位于 `stage.eventSystem.input.canvas/window`，只暴露 on/off。window 是该 Stage 获准处理的输入，不是浏览器全窗口广播；canvas 只接收逻辑视口内输入。图元事件仍走 scenegraph，随后分发 window、canvas 输入源。图元间移动不会产生 canvas out/leave；跨逻辑视口才会。视口外的抬起在 window 发布一次 pointerup，在图元路径派生 pointerupoutside，不向 canvas 发布普通 up。

支持表：pointerdown/move/up/cancel、wheel；mouse 的 mousedown/move/up（右键 down/up 为 rightdown/rightup）；touch 的 touchstart/move/end/cancel；有效按下/抬起产生 click/dblclick（mouse/pen）、tap/dbltap（支持 touch 时）、pointertap；canvas 边界产生 pointerover/enter/out/leave 及 mouse 对应别名。宿主不要再次转发浏览器 click。事件对象池化，只允许同步消费；异步处理保存所需标量，不能保存事件对象。stopPropagation 不改变宿主输入授权，cancel/release 会中止当前失效输入的后续正常分发。

取消先清 press/hover/click 状态，再通知消费者；重复取消不重复结束。取消回调里重新送入的输入在当前事务结束后同步按 FIFO 处理。DataZoom/Slider 每个组件只管理一个活动指针；取消保留最后已应用值并结束拖拽。DataZoom 正常 up 应用最后一次已接受的延迟 move，cancel 丢弃尚未应用的 move；realTime=false 仍发送终态。默认 DOM adapter 保持同步触摸 preventDefault；宿主接入自行决定 touch-action 与滚动策略。

virtual 交互 Layer 在第一次绘制准备前创建，保持位于业务 Layer 之后，复用主层 Canvas。默认 Layer 模式不变，interactiveLayer:false 优先禁用交互层。renderTo(window, rectangle?, options?) 保留第二参旧矩形契约，新合成选项在第三参。仅显式设置 requestRender 的宿主调度模式会在 renderTo 调用 beforeRender/afterRender；默认 renderTo 不新增 hook 调用。try/finally 只负责绘制异常时恢复 Stage 状态，不吞掉异常。
