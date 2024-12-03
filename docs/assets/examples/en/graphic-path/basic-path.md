---
category: examples
group: graphic-path
title: basic-path
keywords: path
order: 1-0
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/vrender/path-basic.jpeg
---

# path graphic

The `Path` element is a basic graphic element used to draw complex shapes and curves, widely used in computer graphics, graphic design, and data visualization. It creates arbitrary shapes by defining a series of line segments and curves, providing flexibility and expressiveness. Its syntax is consistent with the `path` tag in SVG.

## code demo

```javascript livedemo template=vrender
const graphics = [];
graphics.push(
  VRender.createPath({
    x: 100,
    y: 100,
    path: 'M -2 2 L 4 -5 L 7 -6 L 6 -3 L -1 3 C 0 4 0 5 1 4 C 1 5 2 6 1 6 A 1.42 1.42 0 0 1 0 7 A 5 5 0 0 0 -2 4 Q -2.5 3.9 -2.5 4.5 T -4 5.8 T -4.8 5 T -3.5 3.5 T -3 3 A 5 5 90 0 0 -6 1 A 1.42 1.42 0 0 1 -5 0 C -5 -1 -4 0 -3 0 C -4 1 -3 1 -2 2 M 4 -5 L 4 -3 L 6 -3 L 5 -4 L 4 -5',
    fill: '#ccc',
    stroke: 'grey',
    scaleX: 10,
    scaleY: 10
  })
);

const stage = new Stage({
  container: CONTAINER_ID,
  autoRender: true
});

graphics.forEach(g => {
  stage.defaultLayer.add(g);
});
```
