---
category: examples
group: graphic-text
title: basic-text
keywords: text
order: 1-0
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/vrender/text-basic.png
---

# text graphic

The `Text` element is a basic graphic element used to display simple text information, widely used in computer graphics, user interface design, and data visualization. It is mainly used to render characters and textual content, providing information and identification.

Main features:
- Font and style: The Text element can be styled with different fonts, sizes, colors, and styles (such as bold, italic) to meet design requirements.
- Positioning: Text is usually positioned relative to anchor points through its align and baseline, allowing for flexible placement.
- Line height: The line height can be adjusted to improve the readability and visual effect of the text.

## code demo

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
