---
category: examples
group: graphic-text
title: basic-text
keywords: text
order: 1-0
cover: http://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/vrender/text-basic.png
---

# text 图元

## 代码演示

```javascript livedemo template=vrender
const graphics = [];
graphics.push(
  VRender.createText({
    x: 100,
    y: 100,
    fill: 'pink',
    stroke: 'red',
    text: 'who is 😈',
    fontSize: 20,
    textBaseline: 'top'
  })
);

graphics.push(
  VRender.createText({
    x: 100,
    y: 200,
    fill: {
      gradient: 'linear',
      x0: 0,
      y0: 0,
      x1: 1,
      y1: 1,
      stops: [
        { offset: 0, color: 'green' },
        { offset: 0.5, color: 'orange' },
        { offset: 1, color: 'red' }
      ]
    },
    text: ['第一行', '第二行'],
    fontSize: 60,
    textBaseline: 'top'
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
