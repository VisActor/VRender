import { createStage, createArea, container, IGraphic, global } from '@visactor/vrender';
import { addShapesToStage, colorPools } from '../utils';

const subP1 = [
  [0, 100],
  [20, 40],
  [40, 60],
  [60, 20],
  [70, 30]
].map(item => ({ x: item[0], y: item[1], y1: 120, defined: item[0] !== 20 }));

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
].map(item => ({ x: item[0], y: item[1], y1: 120, defined: item[0] !== 40 && item[0] !== 70 }));

export const page = () => {
  const graphics: IGraphic[] = [];
  ['linear'].forEach((type, i) => {
    graphics.push(
      createArea({
        lineDash: [0],
        texture: null,
        y1: 0,
        enableSegments: true,
        segments: [
          {
            x: 0,
            y: 0,
            lineDash: [0],
            texture: null,
            y1: 370,
            points: [
              {
                x: 143.52631578947364,
                y: 338.7054,
                context: 0,
                y1: 370
              },
              {
                x: 334.8947368421052,
                y: 340.90319999999997,
                context: 4,
                y1: 370
              },
              {
                x: 526.2631578947368,
                y: 331.3646,
                context: 8,
                y1: 370
              },
              {
                x: 717.6315789473684,
                y: 301.5056,
                context: 12,
                y1: 370
              },
              {
                x: 909,
                y: 345.5208,
                context: 16,
                y1: 370
              },
              {
                x: 1100.3684210526314,
                y: 329.8032,
                context: 20,
                y1: 370
              },
              {
                x: 1291.7368421052631,
                y: 268.61260000000004,
                context: 24,
                y1: 370
              }
            ]
          },
          {
            x: 0,
            y: 0,
            lineDash: [5, 5],
            texture: 'bias-rl',
            y1: 370,
            points: [
              {
                x: 1483.1052631578946,
                y: 340.3408,
                context: 28,
                y1: 370
              },
              {
                x: 1674.4736842105262,
                y: 231.53119999999998,
                context: 32,
                y1: 370
              }
            ]
          }
        ],
        points: null,
        visible: true,
        lineWidth: 2,
        lineCap: 'round',
        fillOpacity: 0.5,
        textureColor: '#fff',
        textureSize: 14,
        fill: '#1664FF',
        stroke: ['#1664FF', false, false, false],
        defined: true,
        connectedType: 'none',
        x: 0,
        y: 0,
        x1: 0,
        pickable: true
      })
    );
  });

  // ['linear', 'step', 'stepBefore', 'stepAfter', 'basis', 'monotoneX', 'monotoneY'].forEach((type, i) => {
  //   i += 7;
  //   graphics.push(
  //     createArea({
  //       points,
  //       curveType: type as any,
  //       x: ((i * 300) % 900) + 100,
  //       y: Math.floor((i * 300) / 900) * 200,
  //       segments: [
  //         {
  //           points: subP1,
  //           fill: colorPools[3],
  //           stroke: ['red', false],
  //           lineWidth: 10,
  //           connectedType: 'connect',
  //           connectedStyle: {
  //             fill: 'grey'
  //           }
  //         },
  //         {
  //           points: subP2,
  //           stroke: ['red', false],
  //           fill: colorPools[2],
  //           texture: 'bias-rl',
  //           textureColor: 'grey'
  //         }
  //       ],
  //       connectedType: 'connect',
  //       fill: true,
  //       stroke: true
  //     })
  //   );
  // });

  // graphics.forEach(item => {
  //   item.animate().to({ clipRange: 0 }, 0, 'linear').to({ clipRange: 1 }, 10000, 'linear');
  // });

  console.time();
  const stage = createStage({
    canvas: document.getElementById('main'),
    width: 500,
    height: 500,
    renderStyle: 'default',
    // viewBox: viewOptions.viewBox,
    dpr: 2,
    // canvas: viewOptions.renderCanvas,
    canvasControled: false,
    // container: viewOptions.container,
    // title: viewOptions.rendererTitle,
    beforeRender: () => {},
    afterRender: () => {},
    disableDirtyBounds: false,
    autoRender: true,
    pluginList: ['poptip']
  });
  console.timeEnd();

  graphics.forEach(g => {
    stage.defaultLayer.add(g);
  });
};
