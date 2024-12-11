---
category: examples
group: graphic-text
title: text-blend
keywords: text
order: 1-0
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/vrender/text-blend.png
---

# text graphic

`text`支持canvas原生的`globalCompositeOperation`系列配置的效果

## code demo

```javascript livedemo template=vrender
const g = createGroup({});
const x = 20;
const y = 200;
const delta = 7;
const t1 = createText({
  text: 'VisActor',
  textAlign: 'left',
  textBaseline: 'middle',
  fontSize: 120,
  fontFamily: 'Lato',
  fontWeight: 'bolder',
  fill: '#08fff9',
  globalCompositeOperation: 'lighten',
  x: x,
  y: y
});
g.add(t1);
const t2 = createText({
  text: 'VisActor',
  textAlign: 'left',
  textBaseline: 'middle',
  fontSize: 120,
  fontFamily: 'Lato',
  fontWeight: 'bolder',
  globalCompositeOperation: 'lighten',
  fill: '#f00044',
  x: x + delta,
  y: y + delta
});
g.add(t2);

t1.animate()
  .to({ dx: delta, dy: delta }, 70, 'backOut')
  .to({ dx: -delta / 2, dy: -delta / 2 }, 100, 'backOut')
  .to({ dx: 0, dy: 0 }, 30, 'backOut')
  .wait(2000)
  .loop(Infinity);
t2.animate()
  .to({ dx: -delta, dy: -delta }, 70, 'backOut')
  .to({ dx: delta / 2, dy: delta / 2 }, 100, 'backOut')
  .to({ dx: 0, dy: 0 }, 30, 'backOut')
  .wait(2000)
  .loop(Infinity);

const stage = new Stage({
  container: CONTAINER_ID,
  autoRender: true
});

stage.background = 'black';
stage.defaultLayer.add(g);
```
