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

  graphics.length = 0;
  graphics.push(
    createArea({
      visible: true,
      lineWidth: 2,
      lineCap: 'round',
      lineJoin: 'round',
      fillOpacity: 0.2,
      curveType: 'monotoneX',
      enableSegments: true,
      stroke: false,
      connectedType: 'none',
      fill: '#F5222D',
      y1: 0,
      defined: true,
      segments: [
        {
          visible: true,
          lineWidth: 2,
          lineCap: 'round',
          lineJoin: 'round',
          fillOpacity: 0.2,
          curveType: 'monotoneX',
          x: 0,
          y: 0,
          stroke: false,
          connectedType: 'none',
          fill: '#F5222D',
          y1: 136.8,
          points: [
            {
              x: 0,
              y: 296.40000000000003,
              context: '1700_0',
              y1: 136.8
            },
            {
              x: 94.1875,
              y: 186.96,
              context: '1710_0',
              y1: 86.63999999999997
            },
            {
              x: 188.375,
              y: 109.44,
              context: '1720_0',
              y1: 18.240000000000016
            },
            {
              x: 282.5625,
              y: 159.6,
              context: '1730_0',
              y1: 13.680000000000012
            },
            {
              x: 376.75,
              y: 150.48,
              context: '1740_0',
              y1: 31.919999999999977
            },
            {
              x: 470.9375,
              y: 95.75999999999999,
              context: '1750_0',
              y1: 45.59999999999999
            },
            {
              x: 499.19374999999997,
              y: 59.28,
              context: '1753_0',
              y1: 59.28
            }
          ]
        },
        {
          visible: true,
          lineWidth: 2,
          lineCap: 'round',
          lineJoin: 'round',
          fillOpacity: 0.2,
          curveType: 'monotoneX',
          x: 0,
          y: 0,
          stroke: false,
          connectedType: 'none',
          fill: '#FAAD14',
          y1: 95.75999999999999,
          points: [
            {
              x: 565.125,
              context: '1760_0',
              y1: 95.75999999999999,
              defined: false
            },
            {
              x: 659.3125,
              context: '1770_0',
              y1: 68.4,
              defined: false
            },
            {
              x: 753.5,
              context: '1780_0',
              y1: 31.919999999999977,
              defined: false
            }
          ]
        }
      ],
      points: null,
      x: 0,
      y: 0,
      x1: 0,
      pickable: true,
      clipRange: 0.8
    })
  );

  graphics.forEach(item => {
    item.animate().to({ clipRange: 0 }, 0, 'linear').to({ clipRange: 1 }, 10000, 'linear');
  });

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
