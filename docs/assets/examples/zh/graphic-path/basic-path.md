---
category: examples
group: graphic-path
title: basic-path
keywords: path
order: 1-0
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/vrender/path-basic.jpeg
---

# path 图元

`Path`（路径）图元是用于绘制复杂形状和曲线的基本图形元素，广泛应用于计算机图形学、图形设计和数据可视化中。它通过定义一系列的线段和曲线来创建任意形状，具有灵活性和表现力。其语法和`svg`中的`path`标签保持一致

## 代码演示

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
