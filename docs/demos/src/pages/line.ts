import { createStage, createLine, container, IGraphic, createSymbol } from '@visactor/vrender';
import { roughModule } from '@visactor/vrender-kits';
import { addShapesToStage, colorPools } from '../utils';

// container.load(roughModule);

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

export const page = () => {
  const graphics: IGraphic[] = [];
  // ['linear', 'step', 'stepBefore', 'stepAfter', 'basis', 'monotoneX', 'monotoneY'].forEach((type, i) => {
  //   graphics.push(createLine({
  //     points,
  //     curveType: type as any,
  //     x: (i * 300) % 900 + 100,
  //     y: (Math.floor(i * 300 / 900)) * 200,
  //     stroke: 'red'
  //   }));
  //   // points.forEach(item => {
  //   //   graphics.push(createSymbol({
  //   //     x: (i * 300) % 900 + 100 + item.x,
  //   //     y: (Math.floor(i * 300 / 900)) * 200 + item.y,
  //   //     size: 10,
  //   //     symbolType: 'circle',
  //   //     fill: 'green'
  //   //   }))
  //   // })
  // });
  const p = [
    {
        "x": 0,
        "y": 17.142857142857142,
        "defined": true,
    },
    {
        "x": 31.142857142857142,
        "y": 8.571428571428573,
        "defined": true
    },
    {
        "x": 62.285714285714285,
        "y": 20,
        "defined": false
    },
    {
        "x": 93.42857142857143,
        "y": 7.428571428571429,
        "defined": true
    },
    {
        "x": 124.57142857142857,
        "y": 11.428571428571429,
        "defined": true
    },
    {
        "x": 155.71428571428572,
        "y": 14.285714285714286,
        "defined": true
    },
    {
        "x": 186.85714285714286,
        "y": 5.7142857142857135,
        "defined": true
    },
    {
        "x": 218,
        "y": 0,
        "defined": true
    }
];
  graphics.push(createLine({
    "x": 100,
    "y": 100,
    "curveType": "basis",
    stroke: {
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
    },
    "lineWidth": 2,
    "points": p 
}));
p.forEach(item => {
  graphics.push(createSymbol({
    x: item.x + 100,
    y: item.y + 100,
    fill: 'red',
    symbolType: 'circle',
    size: 10
  }))
});

  // ['linear', 'step', 'stepBefore', 'stepAfter', 'basis', 'monotoneX', 'monotoneY'].forEach((type, i) => {
  //   i += 7;
  //   graphics.push(createLine({
  //     points,
  //     curveType: type as any,
  //     x: (i * 300) % 900 + 100,
  //     y: (Math.floor(i * 300 / 900)) * 200,
  //     segments: [
  //       { points: subP1, stroke: colorPools[3], lineWidth: 6 },
  //       { points: subP2, stroke: colorPools[2], lineWidth: 2, lineDash: [3, 3] }
  //     ],
  //     stroke: 'red'
  //   }));
  // });


  const stage = createStage({
    canvas: 'main',
    autoRender: true
  });

  graphics.forEach(g => {
    stage.defaultLayer.add(g);
  })
};
