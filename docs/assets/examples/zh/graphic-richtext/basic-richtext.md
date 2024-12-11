---
category: examples
group: graphic-richtext
title: basic-richtext
keywords: richtext
order: 1-0
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/vrender/richtext-basic1.png
---

# richtext 图元

`RichText`（富文本）图元是一种用于显示和处理多样化文本内容的图形元素，广泛应用于图形用户界面、网页设计和数据可视化中。与普通文本不同，富文本图元支持多种文本格式和样式，使得文本信息更加丰富和生动。

## 代码演示

```javascript livedemo template=vrender
const graphics = [];
graphics.push(
  VRender.createRichText({
    x: 0,
    y: 0,
    width: 300,
    height: 0,
    textConfig: [
      {
        text: '即将发布的',
        fill: '#000',
        fontSize: 16,
        textDecoration: 'line-through'
      },
      {
        text: 'VisActor',
        fontWeight: 'bold',
        fontSize: 30,
        fill: '#0013e6'
      },
      {
        text: '由数据而生，演绎数据之美。致力于成为面向叙事的智能可视化解决方案。截至目前，',
        fill: '#000',
        fontSize: 16,
        lineHeight: 26
      },
      {
        text: 'VisActor',
        fontStyle: 'italic',
        fill: '#000',
        fontSize: 16,
        lineHeight: 26,
        textDecoration: 'underline'
      },
      {
        text: '已经开源了多个可视化模块，它们分别是\n',
        fill: '#000',
        fontSize: 16,
        lineHeight: 26
      },
      {
        text: 'VChart 故事讲述者',
        fill: '#3f51b5',
        fontSize: 16,
        lineHeight: 26,
        fontWeight: 'bold'
      },
      {
        text: '[1]',
        script: 'super',
        fill: '#000',
        fontSize: 16,
        lineHeight: 26,
        fontWeight: 'bold'
      },
      {
        text: '。它不只是开箱即用的多端图表库，更是生动灵活的数据故事讲述者。\n',
        fill: '#000',
        fontSize: 16,
        lineHeight: 26
      },
      {
        text: 'VTable 方格艺术家',
        fill: '#3f51b5',
        fontSize: 16,
        lineHeight: 26,
        fontWeight: 'bold'
      },
      {
        text: '[2]',
        script: 'super',
        fill: '#000',
        fontSize: 16,
        lineHeight: 26,
        fontWeight: 'bold'
      },
      {
        text: '。它不只是一款高性能的多维数据分析表格，更是一个在行列间创作的方格艺术家。\n',
        fill: '#000',
        fontSize: 16,
        lineHeight: 26
      },
      {
        text: 'VGrammar 数据魔法师',
        fill: '#3f51b5',
        fontSize: 16,
        lineHeight: 26,
        fontWeight: 'bold'
      },
      {
        text: '[3]',
        script: 'super',
        fill: '#000',
        fontSize: 16,
        lineHeight: 26,
        fontWeight: 'bold'
      },
      {
        text: '。不只是生成万千图表的可视化语法，更是化枯燥为神奇的数据魔法师。\n',
        fill: '#000',
        fontSize: 16,
        lineHeight: 26
      },
      {
        text: 'VRender 可视化渲染',
        fill: '#3f51b5',
        fontSize: 16,
        lineHeight: 26,
        fontWeight: 'bold'
      },
      {
        text: '[4]',
        script: 'super',
        fill: '#000',
        fontSize: 16,
        lineHeight: 26,
        fontWeight: 'bold'
      },
      {
        text: '。不只是一个功能丰富的可视化渲染擎，更是一支得心应手的生花妙笔。',
        fill: '#000',
        fontSize: 16,
        lineHeight: 26
      }
    ]
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
