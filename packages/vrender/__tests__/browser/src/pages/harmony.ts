// import { createStage, createRect, IGraphic, createPath, vglobal, loadHarmonyEnv, container } from '@visactor/vrender';
// import { roughModule } from '@visactor/vrender-kits';
// import { addShapesToStage, colorPools } from '../utils';

// loadHarmonyEnv(container);

// vglobal.setEnv('harmony');

// // container.load(roughModule);
// export const page = () => {
//   const graphics: IGraphic[] = [];
//   graphics.push(
//     createPath({
//       x: 100,
//       y: 100,
//       path: 'M -2 2 L 4 -5 L 7 -6 L 6 -3 L -1 3 C 0 4 0 5 1 4 C 1 5 2 6 1 6 A 1.42 1.42 0 0 1 0 7 A 5 5 0 0 0 -2 4 Q -2.5 3.9 -2.5 4.5 T -4 5.8 T -4.8 5 T -3.5 3.5 T -3 3 A 5 5 90 0 0 -6 1 A 1.42 1.42 0 0 1 -5 0 C -5 -1 -4 0 -3 0 C -4 1 -3 1 -2 2 M 4 -5 L 4 -3 L 6 -3 L 5 -4 L 4 -5',
//       fill: '#ccc',
//       stroke: 'grey',
//       scaleX: 10,
//       scaleY: 10
//     })
//   );

//   const canvas = document.createElement('canvas');
//   canvas.width = 300;
//   canvas.height = 300;
//   document.body.appendChild(canvas);
//   canvas.style.position = 'absolute';
//   canvas.style.left = '100px';
//   canvas.style.top = '0';

//   const stage = createStage({
//     canvas,
//     autoRender: true
//   });

//   graphics.forEach(g => {
//     stage.defaultLayer.add(g);
//   });
// };

import * as VRender from '@visactor/vrender';
import * as VRenderCore from '@visactor/vrender-core';
import * as VRenderKits from '@visactor/vrender-kits';
import * as VRenderComponents from '@visactor/vrender-components';
import { addShapesToStage, colorPools } from '../utils';
import { pi, pi2 } from '@visactor/vutils';

export const page = () => {
  // @ts-ignore
  window.VRender = VRender;
  // @ts-ignore
  window.VRenderComponents = VRenderComponents;
  // @ts-ignore
  window.VRenderCore = VRenderCore;
  // @ts-ignore
  window.VRenderKits = VRenderKits;
  import('https://tosv.byted.org/obj/dpvis/vchart-used-in-vrender-bugserver.js').then(async () => {
    window.ChartSpace = window.VChart;
    const data = [['430(9%)'], ['1,428(23%)'], ['1,386(29%)'], ['1,676(27%)'], ['860(18%)']];
    let i = 0;

    const spec = {
      type: 'treemap',
      color: ['#F2F6FF', '#D9E3FF', '#BFD0FF', '#A6BDFF', '#8CAAFF', '#7397FF', '#5984FF', '#4071FF', '#2E5DE5'],
      tooltip: {
        renderMode: 'canvas'
      },
      categoryField: 'name',
      valueField: 'value',
      data: [
        {
          id: 'data0',
          values: [
            {
              name: 'A',
              value: 1
            },
            {
              name: 'B',
              value: 2
            },
            {
              name: 'C',
              value: 6
            },
            {
              name: 'D',
              value: 12
            },
            {
              name: 'E',
              value: 22
            }
          ]
        }
      ]
    };

    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    document.body.appendChild(canvas);
    canvas.style.position = 'absolute';
    canvas.style.left = '100px';
    canvas.style.top = '0';

    const chartSpace = new window.ChartSpace.default(spec, {
      renderCanvas: canvas,
      enableHtmlAttribute: true,
      animation: true
    });

    chartSpace.renderSync();
    console.log(chartSpace);

    VRender.loadHarmonyEnv(VRender.container);
    VRender.vglobal.setEnv('harmony');
    window.vchart = chartSpace;
  });
  return;
};
