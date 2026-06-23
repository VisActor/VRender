import { createRect, IGraphic } from '@visactor/vrender';
import { roughModule } from '@visactor/vrender-kits';
import { addShapesToStage, colorPools } from '../utils';
import { createBrowserPageApp } from '../page-stage';
import { setHarnessStage } from '../harness';

// container.load(roughModule);
export const page = () => {
  const container = document.querySelector<HTMLDivElement>('#container');
  const app = createBrowserPageApp();
  let stage: any;
  function run() {
    stage && stage.release();
    const graphics: IGraphic[] = [];
    for (let i = 0; i < 10000; i++) {
      graphics.push(createRect({ x: 100, y: 100, width: 100, height: 100, fill: 'red' }));
    }

    stage = app.createStage({
      canvas: 'main',
      canvasControled: false,
      autoRender: true,
      autoRefresh: true
    });
    setHarnessStage(stage);
    graphics.forEach(g => {
      stage.defaultLayer.add(g);
    });
  }

  const controls = document.createElement('div');
  controls.style.display = 'flex';
  controls.style.gap = '12px';
  controls.style.alignItems = 'center';
  controls.style.padding = '16px';

  const createRunButton = (count: number) => {
    const button = document.createElement('button');
    button.innerHTML = `run ${count}`;
    button.style.display = 'inline-flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    button.style.padding = '8px 14px';
    button.style.fontSize = '14px';
    button.style.fontWeight = '600';
    button.style.border = '1px solid #d0d7de';
    button.style.borderRadius = '6px';
    button.style.background = '#ffffff';
    button.style.color = '#24292f';
    button.style.cursor = 'pointer';
    button.onclick = () => {
      for (let i = 0; i < count; i++) {
        run();
      }
    };
    return button;
  };

  controls.appendChild(createRunButton(100));
  controls.appendChild(createRunButton(1000));
  controls.appendChild(createRunButton(10000));

  if (container) {
    container.prepend(controls);
  } else {
    document.body.appendChild(controls);
  }
};
