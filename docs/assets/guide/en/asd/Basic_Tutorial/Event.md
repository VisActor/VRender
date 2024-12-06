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
