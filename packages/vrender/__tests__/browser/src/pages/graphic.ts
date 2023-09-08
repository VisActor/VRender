import { createStage, createCircle, createRect, createGroup } from '@visactor/vrender';
import { addShapesToStage, colorPools } from '../utils';

// container.load(roughModule);

export const page = () => {
  const shapes = [];

  shapes.push(
    createCircle({
      startAngle: 0,
      endAngle: Math.PI * 2,
      radius: 50,
      x: 350,
      y: 150,
      fill: colorPools[10],
      // stroke: 'red',
      lineWidth: 2
    })
  );

  shapes.push(
    createRect({
      x: 250,
      y: 200,
      width: 200,
      height: 300,
      fill: colorPools[8]
    })
  );

  shapes.push(
    createRect({
      x: 150,
      y: 250,
      width: 100,
      height: 50,
      fill: colorPools[7]
    })
  );

  shapes.push(
    createRect({
      x: 450,
      y: 250,
      width: 100,
      height: 50,
      fill: colorPools[7]
    })
  );

  shapes.push(
    createRect({
      x: 270,
      y: 500,
      width: 50,
      height: 50,
      fill: colorPools[7]
    })
  );

  shapes.push(
    createRect({
      x: 380,
      y: 500,
      width: 50,
      height: 50,
      fill: colorPools[7]
    })
  );

  const rotateCenter = [350, 350];

  shapes.push(
    createRect({
      x: rotateCenter[0],
      y: rotateCenter[1],
      width: 5,
      height: 5,
      fill: 'green'
    })
  );

  const group = createGroup({
    anchor: [350, 350],
    // anchor: ["50%", "50%"],
    angle: 0
  });

  group.animate().to({ angle: Math.PI * 6 }, 6000, 'backIn');

  shapes.forEach(g => {
    group.add(g);
  });

  const stage = createStage({
    canvas: 'main',
    width: 1200,
    height: 600
  });

  console.log(stage);
  stage.background = 'red';
  (window as any).stage = stage;
  stage.defaultLayer.add(group as any);
  // addShapesToStage(stage, shapes as any, true);
  stage.render();
};
