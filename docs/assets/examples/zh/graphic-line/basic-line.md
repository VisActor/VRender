---
category: examples
group: graphic-line
title: basic-line
keywords: line
order: 1-0
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/vrender/line-basic.png
---

# line 图元

`Line`图元是用于表示数据变化趋势的基本图形元素，通常在折线图和其他图表中使用。它通过连接数据点形成线段，直观地展示数据随时间或其他变量的变化。

主要特征：
- 数据点：Line图元通过一系列坐标点来表示数值，这些点通常在二维坐标系中绘制。
- 线段：数据点之间通过直线或曲线连接，形成连续的线，便于观察数据的变化趋势。
- 可视化效果：线条的颜色、粗细和样式可以根据需要进行调整，以突出不同的数据系列或变化程度。

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
