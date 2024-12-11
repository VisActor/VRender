---
category: examples
group: graphic-area
title: basic-area
keywords: area
order: 1-0
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/vrender/area.jpeg
---

# area 图元

`area`图元是用于表示数据变化的图形元素，通常在面积图中使用。面积图通过填充线下方的区域来展示数值的大小和变化趋势，强调数据的总体量而不仅仅是单一数值。

该图元主要通过`points`数组定义形状，其中每项是个对象，有x1、x2、y1、y2几个属性用来表示上下的两个点

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
].map(item => ({ x: item[0], y: item[1], y1: 120, defined: item[0] !== 70 }));

const subP2 = [
  [80, 80],
  [120, 60],
  [160, 40],
  [200, 20],
  [240, 50]
].map(item => ({ x: item[0], y1: 120, y: item[1] }));

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
].map(item => ({ x: item[0], y: item[1], y1: 120, defined: item[0] !== 70 }));

const graphics = [];
['linear', 'step', 'stepBefore', 'stepAfter', 'basis', 'monotoneX', 'monotoneY'].forEach((type, i) => {
  graphics.push(
    VRender.createArea({
      points,
      curveType: type,
      x: ((i * 300) % 900) + 100,
      y: Math.floor((i * 300) / 900) * 200,
      fill: {
        gradient: 'linear',
        x0: 0,
        y0: 0,
        x1: 1,
        y1: 0,
        stops: [
          { offset: 0, color: 'green' },
          { offset: 0.5, color: 'orange' },
          { offset: 1, color: 'red' }
        ]
      }
    })
  );
});

['linear', 'step', 'stepBefore', 'stepAfter', 'basis', 'monotoneX', 'monotoneY'].forEach((type, i) => {
  i += 7;
  graphics.push(
    VRender.createArea({
      points,
      curveType: type,
      x: ((i * 300) % 900) + 100,
      y: Math.floor((i * 300) / 900) * 200,
      segments: [
        { points: subP1, fill: colorPools[3] },
        {
          points: subP2,
          fill: colorPools[2],
          texture: 'bias-rl',
          textureColor: 'grey'
        }
      ],
      fill: true
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
