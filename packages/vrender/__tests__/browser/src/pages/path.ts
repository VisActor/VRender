import { createStage, createRect, IGraphic, createPath, vglobal, loadHarmonyEnv, container } from '@visactor/vrender';
import { roughModule } from '@visactor/vrender-kits';
import { addShapesToStage, colorPools } from '../utils';

loadHarmonyEnv(container);

vglobal.setEnv('harmony');

// container.load(roughModule);
export const page = () => {
  const graphics: IGraphic[] = [];
  graphics.push(
    createPath({
      x: 100,
      y: 100,
      path: 'M -2 2 L 4 -5 L 7 -6 L 6 -3 L -1 3 C 0 4 0 5 1 4 C 1 5 2 6 1 6 A 1.42 1.42 0 0 1 0 7 A 5 5 0 0 0 -2 4 Q -2.5 3.9 -2.5 4.5 T -4 5.8 T -4.8 5 T -3.5 3.5 T -3 3 A 5 5 90 0 0 -6 1 A 1.42 1.42 0 0 1 -5 0 C -5 -1 -4 0 -3 0 C -4 1 -3 1 -2 2 M 4 -5 L 4 -3 L 6 -3 L 5 -4 L 4 -5',
      fill: '#ccc',
      stroke: 'grey',
      scaleX: 10,
      scaleY: 10
    })
  );

  const stage = createStage({
    canvas: 'main',
    autoRender: true
  });

  graphics.forEach(g => {
    stage.defaultLayer.add(g);
  });
};
