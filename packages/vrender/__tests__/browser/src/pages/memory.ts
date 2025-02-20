import { createStage, createRect, IGraphic } from '@visactor/vrender';
import { roughModule } from '@visactor/vrender-kits';
import { addShapesToStage, colorPools } from '../utils';

// container.load(roughModule);
export const page = () => {
  let stage: any;
  function run() {
    stage && stage.release();
    const graphics: IGraphic[] = [];
    for (let i = 0; i < 10000; i++) {
      graphics.push(createRect({ x: 100, y: 100, width: 100, height: 100, fill: 'red' }));
    }

    stage = createStage({
      canvas: 'main',
      canvasControled: false,
      autoRender: true,
      autoRefresh: true
    });
    graphics.forEach(g => {
      stage.defaultLayer.add(g);
    });
  }
  const button = document.createElement('button');
  button.innerHTML = 'run';
  button.onclick = () => {
    for (let i = 0; i < 300; i++) {
      run();
    }
  };
  document.body.appendChild(button);
};
