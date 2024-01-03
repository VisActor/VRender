import { createStage, createArea, container, IGraphic, global, createLine } from '@visactor/vrender';
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
].map(item => ({ x: item[0], y: item[1], y1: 120, defined: true }));

export const page = () => {
  const graphics: IGraphic[] = [];
  // ['linear'].forEach((type, i) => {
  //   graphics.push(
  //     createArea({
  //       defined: true,
  //       enableSegments: true,
  //       segments: null,
  //       _debug_bounds: true,
  //       points: [
  //         {
  //           x: 230.5,
  //           y: 151.1037915390441,
  //           x1: 230.5,
  //           y1: 250,
  //           context: 0
  //         },
  //         {
  //           x: 308.6643884293173,
  //           y: 204.8717692992912,
  //           x1: 230.5,
  //           y1: 250,
  //           context: 1
  //         },
  //         {
  //           x: 230.5,
  //           y: 250,
  //           x1: 230.5,
  //           y1: 250,
  //           context: 2
  //           // defined: false
  //         },
  //         {
  //           x: 230.5,
  //           y: 280.05866037183256,
  //           x1: 230.5,
  //           y1: 250,
  //           context: 3
  //         },
  //         {
  //           x: 188.87948429636262,
  //           y: 274.0296159453061,
  //           x1: 230.5,
  //           y1: 250,
  //           context: 4
  //         },
  //         {
  //           x: 98.35502938981602,
  //           y: 173.70606564615522,
  //           x1: 230.5,
  //           y1: 250,
  //           context: 5
  //         }
  //       ],
  //       fill: 'red',
  //       visible: true,
  //       lineWidth: 6,
  //       lineCap: 'round',
  //       lineJoin: 'round',
  //       curveType: 'linear',
  //       lineDash: [4, 2],
  //       stroke: ['orange', false, false, false],
  //       connectedType: 'connect',
  //       // closePath: true,
  //       x: 0,
  //       y: 0
  //       // "pickable": true
  //     })
  //   );
  //   // graphics.push(
  //   //   createLine({
  //   //     defined: true,
  //   //     enableSegments: true,
  //   //     segments: null,
  //   //     points: [
  //   //       {
  //   //         x: 230.5,
  //   //         y: 151.1037915390441,
  //   //         x1: 230.5,
  //   //         y1: 250,
  //   //         context: 0
  //   //       },
  //   //       {
  //   //         x: 308.6643884293173,
  //   //         y: 204.8717692992912,
  //   //         x1: 230.5,
  //   //         y1: 250,
  //   //         context: 1
  //   //       },
  //   //       {
  //   //         x: 230.5,
  //   //         y: 250,
  //   //         x1: 230.5,
  //   //         y1: 250,
  //   //         context: 2,
  //   //         defined: false
  //   //       },
  //   //       {
  //   //         x: 230.5,
  //   //         y: 280.05866037183256,
  //   //         x1: 230.5,
  //   //         y1: 250,
  //   //         context: 3
  //   //       },
  //   //       {
  //   //         x: 188.87948429636262,
  //   //         y: 274.0296159453061,
  //   //         x1: 230.5,
  //   //         y1: 250,
  //   //         context: 4
  //   //       },
  //   //       {
  //   //         x: 98.35502938981602,
  //   //         y: 173.70606564615522,
  //   //         x1: 230.5,
  //   //         y1: 250,
  //   //         context: 5
  //   //       }
  //   //     ],
  //   //     // fill: 'red',
  //   //     visible: true,
  //   //     lineWidth: 1,
  //   //     lineCap: 'round',
  //   //     lineJoin: 'round',
  //   //     curveType: 'linearClosed',
  //   //     lineDash: [4, 2],
  //   //     stroke: '#2E62F1',
  //   //     connectedType: 'connect',
  //   //     closePath: true,
  //   //     x: 0,
  //   //     y: 0
  //   //     // "pickable": true
  //   //   })
  //   // );
  // });

  ['linear', 'step', 'stepBefore', 'stepAfter', 'basis', 'monotoneX', 'monotoneY'].forEach((type, i) => {
    i += 7;
    const area = createArea({
      points,
      curveType: type as any,
      x: (((i * 300) % 900) + 100) / 2,
      y: (Math.floor((i * 300) / 900) * 200) / 2,
      scaleX: 0.5,
      scaleY: 0.5,
      // segments: [
      //   {
      //     points: subP1,
      //     fill: colorPools[3],
      //     stroke: ['red', false],
      //     lineWidth: 10,
      //     connectedType: 'connect',
      //     connectedStyle: {
      //       fill: 'grey'
      //     }
      //   },
      //   {
      //     points: subP2,
      //     stroke: ['red', false],
      //     fill: colorPools[2],
      //     texture: 'bias-rl',
      //     textureColor: 'grey'
      //   }
      // ],
      connectedType: 'connect',
      fill: 'red',
      texture: 'bias-rl',
      textureColor: 'grey',
      stroke: [true, false, false, false],
      fillPickable: false,
      lineWidth: 5
    });
    area.addEventListener('mouseenter', e => {
      console.log(e);
    });
    graphics.push(area);
  });

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
    // dpr: 2,
    // canvas: viewOptions.renderCanvas,
    canvasControled: true,
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
