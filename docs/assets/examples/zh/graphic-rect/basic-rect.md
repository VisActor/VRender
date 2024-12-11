---
category: examples
group: graphic-rect
title: basic-rect
keywords: rect
order: 1-0
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/vrender/rect-basic.png
---

# rect 图元

`Rect`（矩形）图元是一种基本的图形元素，用于表示矩形或正方形形状。它在计算机图形学、图形设计以及数据可视化中广泛应用，因其简单易用而受到喜爱。

主要特征：
- 位置：矩形通常通过其左上角的坐标来定义，确定矩形在坐标系中的位置。
- 宽度与高度：矩形的尺寸由其宽度和高度决定，可以是任意正值，从而形成不同大小的矩形。
- 边框与填充：矩形可以设置边框的颜色、样式和厚度，同时也可以选择填充颜色，以增强视觉效果。

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
