import { createStage, createLine, container, IGraphic, flatten_simplify } from '@visactor/vrender';
import { roughModule } from '@visactor/vrender-kits';
import { addShapesToStage, colorPools } from '../utils';
import { createSymbol } from '@visactor/vrender';

// container.load(roughModule);

const subP1 = [
  [0, 100],
  [20, 40],
  [40, 60],
  [60, 20],
  [70, 30],
  [75, 60]
].map(item => ({ x: item[0], y: item[1], defined: item[0] !== 60 }));

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
  // graphics.push(
  //   createLine({
  //     visible: true,
  //     lineWidth: 2,
  //     lineCap: 'round',
  //     connectedType: 'connect',
  //     stroke: '#1664FF',
  //     defined: true,
  //     z: null,
  //     points: [
  //       {
  //         x: 41.368421052631575,
  //         y: 112,
  //         context: 0
  //       },
  //       {
  //         x: 96.52631578947368,
  //         y: 224,
  //         context: 1,
  //         defined: false
  //       },
  //       {
  //         x: 151.68421052631578,
  //         y: 89.59999999999998,
  //         context: 2
  //       },
  //       {
  //         x: 206.84210526315786,
  //         y: 78.40000000000002,
  //         context: 3
  //       },
  //       {
  //         x: 262,
  //         y: 67.20000000000002,
  //         context: 4
  //       },
  //       {
  //         x: 317.1578947368421,
  //         y: 224,
  //         context: 5,
  //         defined: false
  //       },
  //       {
  //         x: 372.31578947368416,
  //         y: 44.79999999999999,
  //         context: 6
  //       },
  //       {
  //         x: 427.4736842105263,
  //         y: 224,
  //         context: 7,
  //         defined: false
  //       },
  //       {
  //         x: 482.6315789473684,
  //         y: 425.59999999999997,
  //         context: 8
  //       }
  //     ],
  //     curveType: 'step',
  //     segments: null,
  //     x: 0,
  //     y: 0,
  //     pickable: true
  //   })
  // );

  // [
  //   {
  //     x: 41.368421052631575,
  //     y: 112,
  //     context: 0
  //   },
  //   {
  //     x: 96.52631578947368,
  //     y: 224,
  //     context: 1,
  //     defined: false
  //   },
  //   {
  //     x: 151.68421052631578,
  //     y: 89.59999999999998,
  //     context: 2
  //   },
  //   {
  //     x: 206.84210526315786,
  //     y: 78.40000000000002,
  //     context: 3
  //   },
  //   {
  //     x: 262,
  //     y: 67.20000000000002,
  //     context: 4
  //   },
  //   {
  //     x: 317.1578947368421,
  //     y: 224,
  //     context: 5,
  //     defined: false
  //   },
  //   {
  //     x: 372.31578947368416,
  //     y: 44.79999999999999,
  //     context: 6
  //   },
  //   {
  //     x: 427.4736842105263,
  //     y: 284,
  //     context: 7,
  //     defined: false
  //   },
  //   {
  //     x: 482.6315789473684,
  //     y: 425.59999999999997,
  //     context: 8
  //   }
  // ].forEach(item => {
  //   graphics.push(
  //     createSymbol({
  //       x: item.x,
  //       y: item.y,
  //       fill: 'red'
  //     })
  //   );
  // });
  // });

  ['linear', 'step', 'stepBefore', 'stepAfter', 'basis', 'monotoneX', 'monotoneY'].forEach((type, i) => {
    i += 7;
    graphics.push(
      createLine({
        points,
        curveType: type as any,
        x: ((i * 300) % 900) + 100,
        y: Math.floor((i * 300) / 900) * 200,
        closePath: true,
        // segments: [
        //   {
        //     points: subP1,
        //     stroke: colorPools[3],
        //     lineWidth: 6,
        //     connectedType: 'connect',
        //     connectedStyle: {
        //       stroke: 'green'
        //     }
        //   },
        //   { points: subP2, stroke: colorPools[2], lineWidth: 2, lineDash: [3, 3] }
        // ],
        stroke: 'red'
      })
    );
  });

  graphics.forEach(item => {
    item.animate().to({ clipRange: 0 }, 0, 'linear').to({ clipRange: 1 }, 1000, 'linear');
  });

  const stage = createStage({
    canvas: 'main',
    autoRender: true
  });

  graphics.forEach(g => {
    stage.defaultLayer.add(g);
  });
};
