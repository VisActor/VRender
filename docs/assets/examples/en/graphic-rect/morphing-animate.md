---
category: examples
group: graphic-rect
title: morphing-animate
keywords: morphing-rect
order: 1-0
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/vrender/morphing.gif
---

# rect graphic

## code demo

```javascript livedemo template=vrender
const graphics = [];
const fromSymbolList = [];
for (let i = 0; i < 23; i++) {
  const angle = ((Math.PI * 2) / 23) * i;
  const symbols = VRender.createSymbol({
    x: Math.cos(angle) * 100 + 100,
    y: Math.sin(angle) * 100 + 100,
    symbolType: 'arrow',
    size: 5 + Math.floor(Math.random() * 10),
    angle: angle + Math.PI / 2,
    fill: '#74787a',
    lineWidth: 6
  });
  fromSymbolList.push(symbols);
}

const rect = VRender.createRect({
  x: 100,
  y: 100,
  width: 100,
  height: 100,
  fill: '#1781b5'
});
const symbolList = ['rect', 'triangle', 'arrow', 'cross', 'circle'];
const x1 = VRender.createSymbol({
  x: 100,
  y: 100,
  dx: 50,
  dy: 50,
  symbolType: 'arrow',
  size: 100
});
const x2 = VRender.createSymbol({
  x: 100,
  y: 100,
  symbolType: 'rect',
  dx: 50,
  dy: 50,
  size: 100,
  fill: '#1781b5',
  opacity: 0
});
graphics.push(x2);
graphics.push(rect);
VRender.multiToOneMorph(fromSymbolList, rect, {
  duration: 1000,
  easing: 'quadIn',
  // splitPath: 'clone',
  individualDelay: (index, count, fromGraphic, toGraphic) => {
    return index * 100;
  }
});
rect
  .animate()
  .startAt(fromSymbolList.length * 100 + 1000)
  .to({ opacity: 0 }, 200, 'linear')
  .onEnd(() => {
    x2.animate()
      .to({ opacity: 1 }, 200, 'linear')
      .onEnd(() => {
        animate(x1, x2, 1);
      });
  });

function animate(x1, x2, i) {
  i %= symbolList.length;
  const last = i - 1 < 0 ? symbolList.length - 1 : i - 1;
  const next = i;
  x1.setAttribute('symbolType', symbolList[last]);
  x2.setAttribute('symbolType', symbolList[next]);
  VRender.morphPath(x1, x2, { duration: 1000, easing: 'quadIn' }).onEnd(() => {
    animate(x1, x2, i + 1);
  });
}

const stage = new Stage({
  container: CONTAINER_ID,
  autoRender: true
});

graphics.forEach(g => {
  stage.defaultLayer.add(g);
});
```
