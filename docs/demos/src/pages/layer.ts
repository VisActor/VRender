import { createStage, createCircle, createRect, container } from '@visactor/vrender';
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

  const stage = createStage({
    canvas: 'main',
    width: 1200,
    height: 600,
    viewBox: {
      x1: 100,
      y1: 100,
      x2: 800,
      y2: 500
    },
    afterRender(sg) {
      const c = sg.toCanvas(false);
      c && document.body.appendChild(c);
    },
    autoRender: false
  });

  console.log(stage);
  stage.background = 'grey';
  const ctx = stage.window.getNativeHandler().getContext();
  ctx.fillStyle = 'orange';
  ctx.fillRect(-2000, -2000, 4000, 4000);
  (window as any).stage = stage;
  shapes.forEach(item => {
    stage.defaultLayer.add(item as any);
  });
  const layer2 = stage.createLayer();
  shapes2.forEach(item => {
    layer2.add(item as any);
  });

  shapes.forEach(item => {
    item.onSetStage(() => {
      console.log('abc');
    });
  });

  setTimeout(() => {
    shapes.forEach(item => {
      item.setAttributes({ fill: 'red' });
    });
    shapes2.forEach(item => {
      item.setAttributes({ fill: 'green' });
    });
    stage.render();
  }, 2000);
  setTimeout(() => {
    shapes.forEach(item => {
      item.setAttributes({ fill: 'blue' });
    });
    shapes2.forEach(item => {
      item.setAttributes({ fill: 'orange' });
    });
    stage.clearViewBox();
    stage.setViewBox(20, 200, 900, 500);
    // setTimeout(() => {
    //   stage.release();
    // }, 1000)
    // stage.renderNextFrame([layer2]);
  }, 3000);
  // addShapesToStage(stage, shapes as any, true);
  stage.render();
};
