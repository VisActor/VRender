import { createStage, createCircle, createRect, createGroup } from '@visactor/vrender';
import { addShapesToStage, colorPools } from '../utils';

// container.load(roughModule);

export const page = () => {
  console.time('create-mark');
  const containerGroup = createGroup({});

  for (let i = 0; i < 50000; i++) {
    // raw rect
    const rect = createRect({
      fill: true,
      width: 100,
      height: 100,

      y: i * 10,
      x: 0
    });
    containerGroup.add(rect);

    // // group rect
    // const childGroup = createGroup({
    //   y: i * 10,
    //   x: 0,
    // });
    // const rect = createRect({
    //   fill: true,
    //   width: 100,
    //   height: 100,

    //   // y: i * 10,
    //   // x: 0,
    // });

    // childGroup.add(rect);
    // containerGroup.add(childGroup);
  }

  console.timeEnd('create-mark');

  const stage = createStage({
    canvas: 'main',
    width: 1200,
    height: 600
  });

  (window as any).stage = stage;
  stage.defaultLayer.add(containerGroup as any);
  // addShapesToStage(stage, shapes as any, true);
  console.time('stage-render');
  stage.render();
  console.timeEnd('stage-render');
};
