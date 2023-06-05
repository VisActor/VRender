import { createStage, createCircle, FederatedEvent, DefaultTicker, defaultTimeline, defaultTicker } from '@visactor/vrender';
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
      fillColor: colorPools[0],
      // strokeColor: 'red',
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
      fillColor: colorPools[1],
      // strokeColor: 'red',
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
      fillColor: colorPools[2],
      // strokeColor: 'red',
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
      fillColor: colorPools[3],
      strokeColor: colorPools[5],
      stroke: true,
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
      fillColor: colorPools[4],
      strokeColor: colorPools[5],
      stroke: true,
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
      fillColor: colorPools[5],
      strokeColor: colorPools[5],
      stroke: true,
      lineWidth: 2
    })
  );

  shapes.forEach(shape => {
    shape.stateProxy = (stateName: string) => {
      if (stateName === 'hover') {
        return {
          radius: 100
        };
      }

      return {
        fillColor: 'red'
      };
    };

    // shape.animate().to({ fillOpacity: 0.5, fillColor: 'red' }, 5000, 'quadIn');

    shape.addEventListener('mouseenter', (e: FederatedEvent) => {
      shape.addState('hover', true, true);

      console.log(e.type, shape.currentStates);
      stage.renderNextFrame();
    });

    shape.addEventListener('mouseleave', (e: FederatedEvent) => {
      console.log(e.type, shape.AABBBounds);

      shape.removeState('hover', true);

      console.log(e.type, shape.currentStates);

      stage.renderNextFrame();
    });

    shape.addEventListener('click', (e: FederatedEvent) => {
      console.log(e.type);

      shape.toggleState('click', true);

      console.log(e.type, shape.currentStates);

      stage.renderNextFrame();
    });
  });

  const stage = createStage({
    canvas: 'main',
    width: 1200,
    height: 600,
    viewWidth: 1200,
    viewHeight: 600
  });

  setTimeout(() => {
    defaultTicker.pause();
    setTimeout(() => {
      defaultTicker.resume();
    }, 2000);
  }, 2000);

  (window as any).stage = stage;
  addShapesToStage(stage, shapes as any, true);
  stage.render();
};
