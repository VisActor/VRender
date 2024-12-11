---
category: examples
group: graphic-circle
title: circle-gradient
keywords: circle
order: 1-0
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/vrender/circle-gradient.png
---

# circle 渐变色

`Circle`图元支持渐变色的效果

## 代码演示

```javascript livedemo template=vrender
const circle = VRender.createCircle({
  radius: 100,
  x: 200,
  y: 200,
  fill: {
    x: 0.5,
    y: 0.5,
    startAngle: 0,
    endAngle: Math.PI * 2,
    stops: [
      { offset: 0, color: '#ffffff' },
      { offset: 1 / 6, color: '#0000ff' },
      { offset: 2 / 6, color: '#00ffff' },
      { offset: 4 / 6, color: '#ffff00' },
      { offset: 5 / 6, color: '#ff0000' },
      { offset: 1, color: '#ffffff' }
    ],
    gradient: 'conical'
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
