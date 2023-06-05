import { createStage, createText, global, getTextBounds, createLine, createRect, createCircle, IGraphic } from '@visactor/vrender';
import { addShapesToStage, colorPools } from '../utils';

// global.setEnv('browser');

export const page = () => {
  const graphics: IGraphic[] = [];
  graphics.push(createText({
    x: 100,
    y: 200,
    fillColor: colorPools[5],
    strokeColor: 'red',
    text: 'Testabcdefg',
    fontSize: 20,
    textBaseline: 'top'
  }));

  graphics.push(createText({
    x: 300,
    y: 200,
    fillColor: colorPools[5],
    text: ['Test', 'test'],
    fontSize: 20,
    textBaseline: 'top'
  }));

  graphics.push(createText({
    x: 500,
    y: 200,
    fillColor: colorPools[5],
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
