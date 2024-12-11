---
category: examples
group: graphic-glyph
title: basic-glyph
keywords: glyph
order: 1-0
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/vrender/glyph-basic.png
---

# glyph graphic
The `glyph` primitive refers to complex graphic elements composed of multiple basic primitives (such as lines, circles, rectangles, etc.). This design approach allows for the creation of richer visual effects and functionality, widely used in graphic design, data visualization, and user interface design.

## code demo

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
