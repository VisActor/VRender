import { createStage, createText, global, getTextBounds, createLine, createRect, createCircle, IGraphic } from '@visactor/vrender';
import { addShapesToStage, colorPools } from '../utils';

// global.setEnv('browser');

export const page = () => {
  const graphics: IGraphic[] = [];
  graphics.push(createText({
    x: 100,
    y: 200,
    fill: colorPools[5],
    stroke: 'red',
    text: 'Testabcdefg',
    fontSize: 20,
    textBaseline: 'top'
  }));

  graphics.push(createText({
    x: 300,
    y: 200,
    fill: {
      gradient: 'linear',
      x0: 0,
      y0: 0,
      x1: 1,
      y1: 1,
      stops: [
        { offset: 0, color: 'green' },
        { offset: 0.5, color: 'orange' },
        { offset: 1, color: 'red' }
      ]
    },
    text: ['这'],
    fontSize: 180,
    textBaseline: 'top'
  }));

  graphics.push(createText({
    x: 500,
    y: 200,
    fill: colorPools[5],
    text: ['Test', 'test'],
    fontSize: 20,
    lineThrough: 1,
    underline: 1,
    textBaseline: 'top',
    scaleX: 2,
    scaleY: 2
  }));

  const stage = createStage({
    canvas: 'main',
    autoRender: true
  });

  graphics.forEach(g => {
    stage.defaultLayer.add(g);
  })
};
