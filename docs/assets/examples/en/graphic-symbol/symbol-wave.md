---
category: examples
group: graphic-symbol
title: symbol-wave
keywords: symbol
order: 1-0
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/vrender/wave01.gif
---

# symbol wave

3D effect of waves

## code demo

```javascript livedemo template=vrender
const group = VRender.createGroup({});
for (let j = 0; j < 20; j++) {
  const dx = j * 60;
  const y = 500;
  const x = 100;
  for (let i = 0; i < 60; i++) {
    const z = i * 60;
    const side = j < 3 || 20 - j <= 3;
    const circle = VRender.createSymbol({
      x: x + dx,
      y,
      z,
      keepDirIn3d: false,
      symbolType: 'circle',
      size: 10,
      fill: side ? '#1781b5' : '#66a9c9'
    });
    group.add(circle);
    if (side) {
      circle
        .animate()
        .startAt(100 * i)
        .to({ y: y - 100 - 10 * i }, 600, 'quadOut')
        .to({ y }, 600, 'quadIn')
        .loop(Infinity);
    } else {
      circle
        .animate()
        .startAt(100 * i)
        .to({ y: y - 100 }, 600, 'quadOut')
        .to({ y }, 600, 'quadIn')
        .wait(100 * 60)
        .loop(Infinity);
    }
  }
}

const stage = new Stage({
  container: CONTAINER_ID,
  autoRender: true
});
stage.set3dOptions({
  fieldRatio: 1
});

stage.defaultLayer.add(group);
```
