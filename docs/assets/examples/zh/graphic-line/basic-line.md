---
category: examples
group: graphic-line
title: basic-line
keywords: line
order: 1-0
cover: http://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/vrender/line-basic.png
---

# line 图元

## 代码演示

```javascript livedemo template=vrender
const colorPools = [
  'aliceblue',
  'antiquewhite',
  'blue',
  'blueviolet',
  'brown',
  'burlywood',
  'azure',
  'beige',
  'bisque',
  'black',
  'blanchedalmond',
  'hotpink',
  'indianred',
  'indigo',
  'ivory',
  'khaki',
  'lavender',
  'lavenderblush',
  'lawngreen',
  'lemonchiffon',
  'lightblue'
];

const subP1 = [
  [0, 100],
  [20, 40],
  [40, 60],
  [60, 20],
  [70, 30]
].map(item => ({ x: item[0], y: item[1], defined: item[0] !== 70 }));

const subP2 = [
  [80, 80],
  [120, 60],
  [160, 40],
  [200, 20],
  [240, 50]
].map(item => ({ x: item[0], y: item[1] }));

const points = [
  [0, 100],
  [20, 40],
  [40, 60],
  [60, 20],
  [70, 30],
  [80, 80],
  [120, 60],
  [160, 40],
  [200, 20],
  [240, 50]
].map(item => ({ x: item[0], y: item[1], defined: item[0] !== 70 }));

const graphics = [];
['linear', 'step', 'stepBefore', 'stepAfter', 'basis', 'monotoneX', 'monotoneY'].forEach((type, i) => {
  graphics.push(
    VRender.createLine({
      points,
      curveType: type,
      x: ((i * 300) % 900) + 100,
      y: Math.floor((i * 300) / 900) * 200,
      stroke: 'red'
    })
  );
});

['linear', 'step', 'stepBefore', 'stepAfter', 'basis', 'monotoneX', 'monotoneY'].forEach((type, i) => {
  i += 7;
  graphics.push(
    VRender.createLine({
      points,
      curveType: type,
      x: ((i * 300) % 900) + 100,
      y: Math.floor((i * 300) / 900) * 200,
      segments: [
        { points: subP1, stroke: colorPools[3], lineWidth: 6 },
        { points: subP2, stroke: colorPools[2], lineWidth: 2, lineDash: [3, 3] }
      ],
      stroke: 'red'
    })
  );
});

const group = VRender.createGroup({
  scaleX: 0.3,
  scaleY: 0.3
});
graphics.forEach(g => {
  group.add(g);
});

const stage = new Stage({
  container: CONTAINER_ID,
  autoRender: true
});

stage.defaultLayer.add(group);
```
