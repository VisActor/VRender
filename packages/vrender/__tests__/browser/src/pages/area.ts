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
      curveType: 'basis',
      points: [
        {
          x: 256,
          x1: 156,
          y: 134
        },
        {
          x: 256,
          y: 177.33333333333331,
          x1: 156
        },
        {
          x: 257.3830317870584,
          y: 288.44444444444446,
          x1: 156
        },
        {
          x: 258.67537296512944,
          y: 399.55555555555554,
          x1: 156
        },
        {
          x: 262.37282909354735,
          y: 510.6666666666667,
          x1: 156
        },
        {
          x: 263.6615426472589,
          y: 621.7777777777778,
          x1: 156
        },
        {
          x: 266.6688432412824,
          y: 732.8888888888889,
          x1: 156
        },
        {
          x: 269.53103886092595,
          y: 844,
          x1: 156
        },
        {
          x: 273.36543780891486,
          y: 955.1111111111113,
          x1: 156
        },
        {
          x: 276,
          y: 1066.2222222222224,
          x1: 156
        },
        {
          x: 256,
          x1: 156,
          y: 500,
          y1: 500
        }
      ],
      pickable: false,
      visible: true,
      stroke: false,
      lineWidth: 1,
      connectedType: 'none',
      fill: '#fbb934'
    })
  );
  graphics.push(
    createArea({
      visible: true,
      lineWidth: 2,
      lineCap: 'round',
      lineJoin: 'round',
      fillOpacity: 0.2,
      fill: '#1664FF',
      stroke: ['#1664FF', false, false, false],
      connectedType: 'none',
      zIndex: -4229,
      points: [
        {
          x: 12.77158,
          y: 584.3733007102189,
          x1: 0,
          y1: 584.3733007102189
        },
        {
          x: 11.87464,
          y: 517.587780629051,
          x1: 0,
          y1: 517.587780629051
        },
        {
          x: 15.76742,
          y: 450.8022605478832,
          x1: 0,
          y1: 450.8022605478832,
          context: 'Rouge_Africa'
        },
        {
          x: 27.953120000000002,
          y: 384.0167404667153,
          x1: 0,
          y1: 384.0167404667153,
          context: 'Lipstick_Africa'
        },
        {
          x: 9.99016,
          y: 317.23122038554743,
          x1: 0,
          y1: 317.23122038554743,
          context: 'Eyeshadows_Africa'
        },
        {
          x: 16.40464,
          y: 250.44570030437953,
          x1: 0,
          y1: 250.44570030437953,
          context: 'Eyeliner_Africa'
        },
        {
          x: 41.377019999999995,
          y: 183.66018022321165,
          x1: 0,
          y1: 183.66018022321165,
          context: 'Foundation_Africa'
        },
        {
          x: 12.104159999999998,
          y: 116.8746601420438,
          x1: 0,
          y1: 116.8746601420438,
          context: 'Lip gloss_Africa'
        },
        {
          x: 56.51024,
          y: 50.08914006087592,
          x1: 0,
          y1: 50.08914006087592,
          context: 'Mascara_Africa'
        }
      ],
      segments: null,
      pickable: true,
      clipRange: 1,
      clipRangeByDimension: 'y'
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
