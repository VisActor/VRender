# What is BoundsPadding

*Note:* By default, `VRender` does not have a layout similar to the `DOM`. For example, in the `DOM`, you can have two `div` elements, and the second `div` will be placed below the first `div`. However, in `VRender`, if you have two rectangles, the second rectangle will overlay the first one. This is because all positioning in `VRender` is relative positioning, *it relies on the x, y parameters you configure for positioning*, with the coordinate system having the origin at the top left corner, the positive direction of the x-axis to the right, and the positive direction of the y-axis downwards. This difference in layout between `VRender` and the `DOM` is due to this positioning system.

However, we also provide the ability to use `flex` layout in `VRender`. By enabling this feature, we can achieve similar layout capabilities to the `DOM` Flex layout in `VRender`.

## Usage

The layout capabilities in VRender are achieved through plugins. To enable the layout plugin, you need to set it in the stage parameters:

```ts
const stage = VRender.createStage({
  container: CONTAINER_ID,
  autoRender: true,
  enableLayout: true, // Enable layout capabilities
});
```

Once enabled, the layout of the scene tree still defaults to relative positioning, based on the configured `x` and `y` values as well as the relative position of the parent element to determine the position of the current element. However, you can enable `flex` layout by setting the `flex` property on elements. When enabled, the child elements will be laid out according to the rules of `flex` layout.

The configurable properties interface is as follows, following the same rules as the Flex layout rules in browsers:

```ts
display?: 'relative' | 'inner-block' | 'flex';
flexDirection?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
flexWrap?: 'nowrap' | 'wrap';
justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around';
alignItems?: 'flex-start' | 'flex-end' | 'center';
alignContent?: 'flex-start' | 'center' | 'space-between' | 'space-around';
```

The layout will be based on the size of the AABBBounds of the child elements. You can dynamically adjust the AABBBounds of elements using BoundsPadding to achieve the desired layout effect. For more information, you can refer to [BoundsPadding](../FAQ/What_Is_BoundsPadding).

Here is an example demonstration:

```javascript livedemo template=vrender
const group = VRender.createGroup({ x: 100, y: 100, width: 260, height: 80, background: '#cecece', display: 'flex' });

const g1 = VRender.createGroup({
  display: 'flex',
  background: 'green',
  width: 60,
  height: 80,
  direction: 'column',
  alignItems: 'center',
  justifyContent: 'space-around'
});

const img = VRender.createImage({
  image: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VTable/custom-render/flower.jpg',
  width: 50,
  height: 50
})
g1.add(img);

const g2 = VRender.createGroup({
  display: 'flex',
  background: 'red',
  width: 200,
  height: 80,
  direction: 'column'
});

const g21 = VRender.createGroup({
  display: 'flex',
  background: 'orange',
  width: 200,
  height: 40,
  direction: 'column',
  alignItems: 'center',
  justifyContent: 'center'
});

const text1 = VRender.createText({ text: 'Virtual Anchor Xiao Hua', fontSize: 13, fontFamily: 'sans-serif', fill: 'black' });
const icon = VRender.createImage({
  image: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VTable/location.svg',
  width: 15,
  height: 15,
  boundsPadding: [0, 0, 0, 10]
});
const text2 = VRender.createText({ text: 'Dream City', fontSize: 11, fontFamily: 'sans-serif', fill: '#6f7070' });

g21.add(text1);
g21.add(icon);
g21.add(text2);

const g22 = VRender.createGroup({
  display: 'flex',
  background: 'pink',
  width: 200,
  height: 40,
  direction: 'column',
  alignItems: 'center'
});

['Game', 'Anime', 'Food'].forEach(text => {
  const tag = new VRenderComponent.Tag({
    visible: true,
    textStyle: {
      fontSize: 10,
      fill: 'rgb(51, 101, 238)',
      textAlign: 'left',
      textBaseline: 'top',
      fontFamily: 'sans-serif'
    },
    space: 4,
    padding: 5,
    shape: {
      fill: '#000'
    },
    text,
    panel: {
      visible: true,
      fill: '#f4f4f2',
      cornerRadius: 5
    },
    marginLeft: 10,
    boundsPadding: [0, 0, 0, 10],
    x: 20,
    y: 10
  });

  g22.add(tag);
});

group.add(g1);
group.add(g2);

g2.add(g21);
g2.add(g22);

const stage = new VRender.Stage({
  container: CONTAINER_ID,
  autoRender: true,
  enableLayout: true
});

stage.defaultLayer.add(group);

window['stage'] = stage;
```
