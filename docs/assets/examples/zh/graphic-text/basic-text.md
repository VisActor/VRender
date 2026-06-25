---
category: examples
group: graphic-text
title: basic-text
keywords: text
order: 1-0
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/vrender/text-basic.png
---

# text 图元

`Text`（文本）图元是用于显示简单文本信息的基本图形元素，在计算机图形学、用户界面设计和数据可视化中广泛应用。它主要用于呈现字符和文字内容，提供信息和标识。

主要特征：
- 字体和样式：文本图元可以设置不同的字体、大小、颜色和样式（如粗体、斜体），以满足设计需求。
- 定位：文本通常通过其align和baseline相对锚点进行定位，允许灵活放置。
- 行高：可以调整行高，以改善文本的可读性和视觉效果。

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

const app = VRender.createBrowserVRenderApp();
const stage = app.createStage({
  container: CONTAINER_ID,
  autoRender: true
});

graphics.forEach(g => {
  stage.defaultLayer.add(g);
});
```
