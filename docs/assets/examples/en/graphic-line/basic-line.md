---
category: examples
group: graphic-line
title: basic-line
keywords: line
order: 1-0
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/vrender/line-basic.png
---

# line graphic

The `Line` primitive is a basic graphical element used to represent the trend of data changes, commonly used in line charts and other types of charts. It forms a line by connecting data points, visually displaying the changes in data over time or other variables.

Key features:
- Data Points: The Line primitive represents numerical values through a series of coordinate points, typically plotted in a two-dimensional coordinate system.
- Line Segments: Data points are connected by straight lines or curves to form a continuous line, making it easy to observe the trend of data changes.
- Visual Effects: The color, thickness, and style of the line can be adjusted as needed to highlight different data series or degrees of change.

## code demo

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
