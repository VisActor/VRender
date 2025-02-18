import { createStage, createRect, IGraphic, createPath, vglobal, loadHarmonyEnv, container } from '@visactor/vrender';
import { roughModule } from '@visactor/vrender-kits';
import { addShapesToStage, colorPools } from '../utils';

// container.load(roughModule);
export const page = () => {
  const graphics: IGraphic[] = [];
  graphics.push(
    createPath({
      x: 100,
      y: 100,
      scaleX: 0.5,
      scaleY: 0.5,
      path: 'M430.08 832s89.28-176.224 191.904-328.672C701.216 385.664 800 282.656 800 282.656L779.392 224s-117.184 83.328-212.064 185.6c-96.32 103.776-170.336 226.688-170.336 226.688L251.52 496.832 192 561.632 430.08 832z',
      fill: '#ccc',
      stroke: 'grey'
    })
  );
  console.log(graphics[0]);

  const stage = createStage({
    canvas: 'main',
    autoRender: true
  });

  graphics.forEach(g => {
    stage.defaultLayer.add(g);
  });
};
