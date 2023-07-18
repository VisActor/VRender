import { createStage, createArea, container, IGraphic, global } from '@visactor/vrender';
import { addShapesToStage, colorPools } from '../utils';

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

export const page = () => {
  const graphics: IGraphic[] = [];
  ['linear', 'step', 'stepBefore', 'stepAfter', 'basis', 'monotoneX', 'monotoneY'].forEach((type, i) => {
    graphics.push(createArea({
      points,
      curveType: type as any,
      x: (i * 300) % 900 + 100,
      y: (Math.floor(i * 300 / 900)) * 200,
      stroke: ['black', false],
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
      },
    }));
  });

  ['linear', 'step', 'stepBefore', 'stepAfter', 'basis', 'monotoneX', 'monotoneY'].forEach((type, i) => {
    i += 7;
    graphics.push(createArea({
      points,
      curveType: type as any,
      x: (i * 300) % 900 + 100,
      y: (Math.floor(i * 300 / 900)) * 200,
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
    }));
  });


  const stage = createStage({
    canvas: document.getElementById('main'),
    autoRender: true
  });

  graphics.forEach(g => {
    stage.defaultLayer.add(g);
  })
};