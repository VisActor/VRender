import { createStage, createLine, container, IGraphic } from '@visactor/vrender';
import { roughModule } from '@visactor/vrender-kits';
import { addShapesToStage, colorPools } from '../utils';

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
  ['linear', 'step', 'stepBefore', 'stepAfter', 'basis', 'monotoneX', 'monotoneY'].forEach((type, i) => {
    graphics.push(
      createLine({
        points,
        curveType: type as any,
        x: ((i * 300) % 900) + 100,
        y: Math.floor((i * 300) / 900) * 200,
        stroke: 'red',
        connectedType: 'connected',
        connectedStyle: {
          stroke: 'green'
        },
        connectedX: null,
        connectedY: 100
      })
    );
  });

  ['linear', 'step', 'stepBefore', 'stepAfter', 'basis', 'monotoneX', 'monotoneY'].forEach((type, i) => {
    i += 7;
    graphics.push(
      createLine({
        points,
        curveType: type as any,
        x: ((i * 300) % 900) + 100,
        y: Math.floor((i * 300) / 900) * 200,
        segments: [
          {
            points: subP1,
            stroke: colorPools[3],
            lineWidth: 6,
            connectedType: 'connect',
            connectedStyle: {
              stroke: 'green'
            }
          },
          { points: subP2, stroke: colorPools[2], lineWidth: 2, lineDash: [3, 3] }
        ],
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
