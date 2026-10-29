# Events

VRender designs the DOM event model and API as a reference standard, providing a series of default element-based events. The underlying VRender is compatible with different browser versions, providing unified events. Supported event types include pointer events, mouse events, touch events, and wheel events.

* Pointer Events
  - pointerdown
  - pointerup
  - pointerupoutside
  - pointertap
  - pointerover
  - pointerenter
  - pointerleave
  - pointerout
* Left Mouse Button Operations
  - mousedown
  - mouseup
  - mouseupoutside (the shape is different when the mouse is up and down)
* Right Mouse Button Operations
  - rightdown
  - rightup
  - rightupoutside (the shape is different when the mouse is up and down)
* Mouse Operations
  - click
  - mousemove
  - mouseover
  - mouseout
  - mouseenter
  - mouseleave
* Scrolling
  - wheel
* Touch Events
  - touchstart
  - touchend
  - touchendoutside
  - touchmove
  - touchcancel
  - tap
* Wildcard Event
  - *

## Listening and Delegating
VRender can directly listen to and handle events for elements, supporting the `addEventListener` and `removeEventListener` methods, with parameters consistent with the DOM. It supports using in the capturing phase or bubbling phase:

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

// Listen only once
once(
  type: string,
  listener: EventListenerOrEventListenerObject | LooseFunction,
  options?: AddEventListenerOptions | boolean
): void;

```

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

rect.addEventListener('click', () => {
  rect.setAttribute('fill', 'blue');
})

stage.defaultLayer.add(rect);

window['stage'] = stage;
```

Additionally, VRender also supports event delegation, where any node can directly delegate to child elements. You can determine the element that actually triggers the event through the `target` in the Event. Below is an example of event delegation.

```javascript livedemo template=vrender
// Register all necessary content
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

【Note】: It is important to note that the event objects thrown by VRender are reusable, so be careful not to save event objects for later use, as the event object will change. This is particularly important to note in asynchronous processes.

## Host-owned input and Stage composition

Set `event: { useNativeEvents: false }` when the host owns DOM listeners. Route only accepted inputs through `stage.eventSystem.handleNativeEvent(nativeEvent, { canvasPoint: { x, y }, inViewport })`. The point uses logical canvas units after removing the host composition transform; do not scale it by DPR. EventSystem then applies the Stage window transform. Federated events already carry viewX/viewY, which Stage.eventPointTransform returns directly. Omitting options uses the default DOM mapping and viewport rules.

Ignoring an input does not cancel a gesture. Call cancelPointer(pointerId), or cancelAllPointers(), when ownership changes. Cancellation clears pointer state before callbacks; reentrant new input is processed synchronously in FIFO order after the terminal transaction. Repeated cancellation is idempotent.

`eventSystem.input.canvas` and `.window` expose on/off only. Both carry accepted Stage input, not unfiltered browser-window events. Dispatch order is scenegraph, window, canvas. Canvas out/leave describes logical viewport transitions, never sibling-mark transitions. An outside release emits one window pointerup and no canvas pointerup; the scenegraph retains pointerupoutside. Events are pooled: consume synchronously and save scalars for delayed work.

Supported input types: pointerdown/move/up/cancel and wheel; mousedown/move/up (rightdown/rightup for the right button); touchstart/move/end/cancel; valid presses generate click/dblclick for mouse/pen, tap/dbltap when touch is supported, and pointertap. Canvas boundaries emit pointerover/enter/out/leave and corresponding mouse aliases. Do not forward native DOM click separately. stopPropagation does not control host authorization; cancel/release invalidate remaining normal dispatch.

DataZoom and Slider subscribe to the accepted window scope and own one active pointer each. Cancellation keeps applied values and ends the gesture. DataZoom flushes the last accepted delayed move on normal up, discards pending moves on cancel, and commits its final value even with realTime=false. The DOM adapter preserves synchronous touch preventDefault; hosts own touch-action and scrolling policy.

Use interactiveLayerMode:'virtual' to reuse the primary canvas. The interactive layer is prepared before the first draw and remains after business layers. Default layer selection and boolean interactiveLayer are preserved; false disables the layer. renderTo(window, rectangle?, options?) keeps its legacy second argument. Only explicit requestRender scheduling enables beforeRender/afterRender hooks in renderTo; default calls do not invoke new hooks. Its try/finally restores Stage state on failure without swallowing errors.
