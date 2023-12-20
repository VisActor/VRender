---
category: examples
group: graphic-circle
title: basic-circle
keywords: circle
order: 1-0
cover: http://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/vrender/circle-base.png
---

# circle graphic

## code demo

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
