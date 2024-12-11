---
category: examples
group: graphic-rect
title: basic-rect
keywords: rect
order: 1-0
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/vrender/rect-basic.png
---

# rect graphic

The `Rect` (rectangle) primitive is a basic graphic element used to represent rectangular or square shapes. It is widely used in computer graphics, graphic design, and data visualization due to its simplicity and ease of use.

Key features:
- Position: Rectangles are typically defined by the coordinates of their top-left corner, determining their position in the coordinate system.
- Width and Height: The size of a rectangle is determined by its width and height, which can be any positive value, creating rectangles of different sizes.
- Border and Fill: Rectangles can have border colors, styles, and thickness set, and can also have a fill color to enhance visual effects.

## code demo

```javascript livedemo template=vrender
const graphics = [];
graphics.push(
  VRender.createRect({
    x: 100,
    y: 100,
    width: 160,
    height: 120,
    fillOpacity: 0.3,
    texture: 'bias-rl',
    textureColor: 'grey',
    stroke: '#93b5cf',
    cornerRadius: 20,
    lineWidth: 20
  })
);

for (let i = 0; i < 3; i++) {
  const height = Math.random() * 80;
  const dy = 100 - height;
  graphics.push(
    VRender.createRect({
      x: 100,
      y: 100,
      dx: 40 * i + 30,
      dy,
      width: 20,
      height,
      fill: '#144a74'
    })
  );
}

const stage = new Stage({
  container: CONTAINER_ID,
  autoRender: true
});

graphics.forEach(g => {
  stage.defaultLayer.add(g);
});
```
