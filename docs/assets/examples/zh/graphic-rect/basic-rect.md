---
category: examples
group: graphic-rect
title: basic-rect
keywords: rect
order: 1-0
cover: http://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/vrender/rect-basic.png
---

# rect 图元

## 代码演示

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
