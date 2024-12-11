---
category: examples
group: graphic-circle
title: basic-circle
keywords: circle
order: 1-0
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/vrender/circle-base.png
---

# circle 图元

`Circle`图元是一种基本的图形元素，用于表示圆形或圆形相关的图形。在计算机图形学、图形设计和数据可视化中，Circle图元是构建各种图形和图表的基础。

主要特征：
- 中心点：圆形的中心位置，通常用一个坐标点表示。
- 半径：从中心点到圆周上任意点的距离，决定圆的大小。
- 边界：圆形的外边界是一个平滑的曲线，所有边界上的点到中心点的距离相等。

## 代码演示

```javascript livedemo template=vrender
const circle = VRender.createCircle({
  radius: 100,
  x: 200,
  y: 200,
  fill: {
    gradient: 'linear',
    x0: 0,
    y0: 0,
    x1: 1,
    y1: 0,
    stops: [
      { offset: 0, color: '#63bbd0' },
      { offset: 0.5, color: '#b0d5df' },
      { offset: 1, color: '#0f95b0' }
    ]
  },
  innerBorder: {
    distance: 10,
    lineWidth: 10,
    stroke: '#b0d5df'
  },
  stroke: '#0f95b0',
  lineWidth: 10,
  outerBorder: {
    distance: 10,
    lineWidth: 10,
    stroke: '#63bbd0'
  }
});
const graphics = [];
graphics.push(circle);

const stage = new Stage({
  container: CONTAINER_ID,
  autoRender: true
});

graphics.forEach(g => {
  stage.defaultLayer.add(g);
});
```
