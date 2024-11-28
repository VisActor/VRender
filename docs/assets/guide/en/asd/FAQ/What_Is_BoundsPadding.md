# What is BoundsPadding

【Note】By default, `VRender` does not have a layout similar to `DOM`. In `DOM`, you can write two `div` elements, and the second `div` will be placed below the first `div`. However, in `VRender`, if you write two rectangles, the second rectangle will overlay the first one. This is because all positioning in `VRender` is relative positioning, with the coordinate system having the origin at the top left corner, with the positive `x` axis to the right and the positive `y` axis downwards. This difference in layout behavior between `VRender` and `DOM` is due to their different positioning systems.

All graphics elements have their own `AABBBounds`. If you find the `AABBBounds` too small and need to enlarge it, you can configure `BoundsPadding`.

```ts
// Padding for the bounding box
// If it is a number, then padding on all four sides is this value
// If it is a [number, number], then it is padding for top/bottom and left/right respectively
// If it is a [number, number, number, number], then it is padding for top, right, bottom, and left respectively
boundsPadding: number | number[];
```

![](https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/vrender/vrender-faq-boundsPadding1.png)

## Special Cases

As mentioned earlier, BoundsPadding affects the elements' AABBBounds, which normally does not affect the position because the position is fixed through configurations like `x` and `y`, not based on the position relationship between elements.

However!! When you enable the `flex` layout plugin and set `display: flex` in an element, that element will apply flex layout. Its child elements will then be laid out based on its AABBBounds. In this case, BoundsPadding will affect the position of the child elements.

For more details on Flex layout, please refer to the [Flex Layout](./Flex_Layout) section.

## Examples

Next, we will show two examples, one without using flex layout where BoundsPadding does not affect the element position, and one using flex layout where BoundsPadding affects the element position.

### Without using flex layout, BoundsPadding does not affect element position

```javascript livedemo template=vrender
const rect = VRender.createRect({ x: 100, y: 100, width: 100, height: 100, fill: 'red' });

const stage = new VRender.Stage({
  container: CONTAINER_ID,
  autoRender: true
});

const textLimit = cVRender.reateText({
  x: 0,
  y: 0,
  fill: 'pink',
  text: '这是没有BoundsPadding的文字包围盒',
  wordBreak: 'keep-all',
  maxLineWidth: 120,
  textAlign: 'left',
  textBaseline: 'middle',
  whiteSpace: 'normal',
  _debug_bounds: true,
  background: 'green'
});
const textLimit2 = VRender.createText({
  x: 0,
  y: 60,
  fill: 'pink',
  text: '这是有BoundsPadding的文字包围盒',
  wordBreak: 'keep-all',
  maxLineWidth: 120,
  textAlign: 'left',
  textBaseline: 'middle',
  whiteSpace: 'normal',
  boundsPadding: [20, 10],
  _debug_bounds: true,
  background: 'green'
});

const group = VRender.createGroup({x: 100, y: 100, width: 200, height: 200});
group.add(textLimit);
group.add(textLimit2);

stage.defaultLayer.add(group);
```


### Using flex layout, BoundsPadding affects element position

```javascript livedemo template=vrender
const rect = VRender.createRect({ x: 100, y: 100, width: 100, height: 100, fill: 'red' });

const stage = new VRender.Stage({
  container: CONTAINER_ID,
  autoRender: true,
  enableLayout: true
});

const textLimit = VRender.createText({
  x: 0,
  y: 0,
  fill: 'pink',
  text: '这是没有BoundsPadding的文字包围盒',
  wordBreak: 'keep-all',
  maxLineWidth: 120,
  textAlign: 'left',
  textBaseline: 'middle',
  whiteSpace: 'normal',
  _debug_bounds: true,
  background: 'green'
});
const textLimit2 = VRender.createText({
  x: 0,
  y: 60,
  fill: 'pink',
  text: '这是有BoundsPadding的文字包围盒',
  wordBreak: 'keep-all',
  maxLineWidth: 120,
  textAlign: 'left',
  textBaseline: 'middle',
  whiteSpace: 'normal',
  boundsPadding: [20, 10],
  _debug_bounds: true,
  background: 'green'
});

const group = VRender.createGroup({x: 100, y: 100, width: 200, height: 200, display: 'flex'});
group.add(textLimit);
group.add(textLimit2);

stage.defaultLayer.add(group);
```
