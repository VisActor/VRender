import { createStage, createCircle, createRect, container, createGroup } from '@visactor/vrender';
import { roughModule } from '@visactor/vrender-kits';
import { addShapesToStage, colorPools } from '../utils';

// container.load(roughModule);

export const page = () => {
  const shapes = [];

  shapes.push(
    createCircle({
      startAngle: 0,
      endAngle: Math.PI * 2,
      radius: 50,
      x: 100,
      y: 100,
      fill: colorPools[10],
      // stroke: 'red',
      lineWidth: 2
    })
  );

  shapes.push(
    createCircle({
      startAngle: 0,
      endAngle: Math.PI,
      radius: 50,
      angle: Math.PI / 4,
      // dx: 200,
      x: 300,
      y: 100,
      fill: colorPools[10],
      // stroke: 'red',
      lineWidth: 2,
      zIndex: 1
    })
  );

  shapes.push(
    createCircle({
      startAngle: 0,
      endAngle: (Math.PI * 3) / 2,
      radius: 50,
      x: 300,
      y: 100,
      scaleX: 2,
      scaleY: 2,
      fill: colorPools[6],
      // stroke: 'red',
      lineWidth: 2
    })
  );

  shapes.push(
    createCircle({
      startAngle: 0,
      endAngle: Math.PI * 2,
      radius: 50,
      x: 100,
      y: 400,
      fill: colorPools[10],
      stroke: colorPools[5],

      lineWidth: 2
    })
  );

  shapes.push(
    createCircle({
      startAngle: 0,
      endAngle: Math.PI,
      radius: 50,
      angle: Math.PI / 4,
      // dx: 200,
      x: 300,
      y: 400,
      fill: colorPools[10],
      stroke: colorPools[5],

      lineWidth: 2
    })
  );

  shapes.push(
    createCircle({
      startAngle: 0,
      endAngle: (Math.PI * 3) / 2,
      radius: 50,
      x: 500,
      y: 400,
      scaleX: 2,
      scaleY: 2,
      fill: colorPools[10],
      stroke: colorPools[5],

      lineWidth: 2
    })
  );

  const shapes2 = [];

  shapes2.push(
    createRect({
      x: 100,
      y: 100,
      width: 100,
      height: 50,
      fill: colorPools[10],
      // stroke: 'red',
      lineWidth: 2
    })
  );

  shapes2.push(
    createRect({
      x: 300,
      y: 100,
      width: 100,
      height: 50,
      cornerRadius: 20,
      fill: colorPools[10],
      // stroke: 'red',
      lineWidth: 2
    })
  );

  shapes2.push(
    createRect({
      x: 500,
      y: 100,
      width: 100,
      height: 50,
      cornerRadius: 20,
      scaleX: 2,
      scaleY: 2,
      fill: colorPools[10],
      // stroke: 'red',
      lineWidth: 2
    })
  );

  shapes2.push(
    createRect({
      x: 800,
      y: 100,
      width: 100,
      height: 50,
      cornerRadius: 20,
      angle: Math.PI / 4,
      fill: colorPools[10],
      // stroke: 'red',
      lineWidth: 2
    })
  );

  shapes2.push(
    createRect({
      x: 100,
      y: 400,
      width: 100,
      height: 50,
      fill: colorPools[10],
      stroke: colorPools[5],

      lineWidth: 2
    })
  );

  shapes2.push(
    createRect({
      x: 300,
      y: 400,
      width: 100,
      height: 50,
      cornerRadius: 20,
      fill: colorPools[10],
      stroke: colorPools[5],

      lineWidth: 2
    })
  );

  shapes2.push(
    createRect({
      x: 500,
      y: 400,
      width: 100,
      height: 50,
      cornerRadius: 20,
      scaleX: 2,
      scaleY: 2,
      fill: colorPools[10],
      stroke: colorPools[5],

      lineWidth: 2
    })
  );

  shapes2.push(
    createRect({
      x: 800,
      y: 400,
      width: 100,
      height: 50,
      cornerRadius: 20,
      angle: Math.PI / 4,
      fill: colorPools[10],
      stroke: colorPools[5],

      lineWidth: 2
    })
  );

  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 600;
  canvas.getContext('2d')!.setTransform(1, 0, 0, 1, 100, 100);
  document.getElementById('container')?.appendChild(canvas);

  const stage1 = createStage({
    canvas,
    width: 1200,
    height: 600,
    autoRender: false,
    canvasControled: false
  });
  const stage2 = createStage({
    container: 'container',
    width: 1200,
    height: 600,
    viewWidth: 1200,
    viewHeight: 600,
    autoRender: true
  });

  console.log(stage1, stage2);
  stage1.background = 'grey';
  (window as any).stage1 = stage1;
  const group = createGroup({
    x: 10,
    y: 10
  });
  stage1.defaultLayer.add(group as any);
  shapes.forEach(item => {
    item.addEventListener('mouseenter', () => {
      console.log(item.globalAABBBounds);
    });
    group.add(item as any);
  });
  (window as any).stage2 = stage2;
  shapes2.forEach(item => {
    stage2.defaultLayer.add(item as any);
  });

  stage1.render(null, {
    keepMatrix: true
  });
  stage2.render();

  // setTimeout(() => {
  //   shapes.forEach(item => {
  //     item.setAttributes({ fill: 'red' });
  //   });
  //   shapes2.forEach(item => {
  //     item.setAttributes({ fill: 'green' });
  //   });
  //   stage.render();
  // }, 2000);
  // setTimeout(() => {
  //   shapes.forEach(item => {
  //     item.setAttributes({ fill: 'blue' });
  //   });
  //   shapes2.forEach(item => {
  //     item.setAttributes({ fill: 'orange' });
  //   });
  //   // stage.renderNextFrame([layer2]);
  // }, 3000);
  // // addShapesToStage(stage, shapes as any, true);
  // stage.render();
};
