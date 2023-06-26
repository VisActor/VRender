import { createStage, createText, global, getTextBounds, createLine, createRect, createCircle, IGraphic, createWrapText } from '@visactor/vrender';
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
      y1: 0,
      stops: [
        { offset: 0, color: 'green' },
        { offset: 0.5, color: 'orange' },
        { offset: 1, color: 'red' }
      ]
    },
    text: ['Test', 'test'],
    fontSize: 20,
    textBaseline: 'top'
  }));

  const text = createText({
    x: 500,
    y: 200,
    fill: colorPools[5],
    // text: ['Tffg'],
    text: 'Tffgggaaaa',
    fontSize: 15,
    lineHeight: 30,
    // lineThrough: 1,
    // underline: 1,
    textBaseline: 'alphabetic',
    // scaleX: 2,
    // scaleY: 2
  })
  graphics.push(text);
  const circle = createCircle({
    x: 500,
    y: 200,
    fill: 'black',
    radius: 2
  })
  graphics.push(circle);
  
  const rect = createRect({
    x: text.AABBBounds.x1,
    y: text.AABBBounds.y1,
    width: text.AABBBounds.width(),
    height: text.AABBBounds.height(),
    stroke: 'red',
    lineWidth: 1,
  })
  graphics.push(rect);

  const stage = createStage({
    canvas: 'main',
    autoRender: true
  });

  graphics.forEach(g => {
    stage.defaultLayer.add(g);
  })
};
