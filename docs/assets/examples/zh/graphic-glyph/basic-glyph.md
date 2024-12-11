---
category: examples
group: graphic-glyph
title: basic-glyph
keywords: glyph
order: 1-0
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/vrender/glyph-basic.png
---

# glyph 图元

`glyph`图元是指由多个基本图元（如线、圆、矩形等）组合而成的复杂图形元素。这种设计方法允许创建更丰富的视觉效果和功能性，广泛应用于图形设计、数据可视化和用户界面设计中。

## 代码演示

```javascript livedemo template=vrender
const group = VRender.createGroup({});

group.setTheme({
  common: {
    stroke: 'blue',
    lineWidth: 3
  },
  symbol: {
    size: 60
  }
});

const g = VRender.createGlyph({
  x: 100,
  y: 100,
  stroke: 'green',

  lineWidth: 10
});

const subGraphic = [];

subGraphic.push(
  VRender.createRect({
    // x: 10,
    // y: 10,
    width: 100,
    height: 100,
    fill: 'pink'
  })
);

const symbol = VRender.createSymbol({
  // x: 60,
  // y: 60,
  dx: 50,
  dy: 50,
  symbolType: 'star',
  fill: 'green',
  stroke: true
});
subGraphic.push(symbol);

g.addEventListener('click', () => {
  console.log('abc');
});

g.setSubGraphic(subGraphic);

g.glyphStateProxy = stateName => {
  if (stateName === 'hover') {
    return {
      attributes: {
        scaleX: 2,
        scaleY: 2
      }
    };
  }

  return {
    attributes: {
      stroke: 'red'
    }
  };
};

g.addEventListener('click', e => {
  console.log(e.type, e.target);

  g.toggleState('click', true);

  stage.renderNextFrame();
});

group.add(g);

const stage = new Stage({
  container: CONTAINER_ID,
  autoRender: true
});

stage.defaultLayer.add(group);
```
