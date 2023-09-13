import {
  createStage,
  createCircle,
  FederatedEvent,
  DefaultTicker,
  defaultTimeline,
  defaultTicker
} from '@visactor/vrender';
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
      fill: colorPools[0],
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
      fill: colorPools[1],
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
      fill: colorPools[2],
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
      fill: colorPools[3],
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
      fill: colorPools[4],
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
      fill: colorPools[5],
      stroke: colorPools[5],

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
        fill: 'red'
      };
    };

    // shape.animate().to({ fillOpacity: 0.5, fill: 'red' }, 5000, 'quadIn');

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
