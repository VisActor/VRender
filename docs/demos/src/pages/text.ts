import {
  createStage,
  createText,
  global,
  getTextBounds,
  createLine,
  createRect,
  createCircle,
  IGraphic,
  createWrapText
} from '@visactor/vrender';
import { addShapesToStage, colorPools } from '../utils';

// global.setEnv('browser');

export const page = () => {
  const graphics: IGraphic[] = [];
  const t = createText({
    x: 100,
    y: 200,
    fill: colorPools[5],
    fontWeight: 'bolder',
    // stroke: 'red',
    text: 'this is a text',
    wordBreak: 'break-word',
    maxLineWidth: 110,
    fontSize: 20,
    textBaseline: 'top'
  });
  console.log(t.AABBBounds);
  graphics.push(t);

  graphics.push(
    createText({
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
    })
  );

  const text = createText({
    x: 500,
    y: 200,
    fill: colorPools[5],
    // text: ['Tffg'],
    text: 'talfjdgkfsv',
    // wordBreak: 'break-word',
    maxLineWidth: 200,
    // ellipsis: '',
    // direction: 'vertical',
    fontSize: 28,
    // stroke: 'green',
    // lineWidth: 100,
    // lineHeight: 30,
    // lineThrough: 1,
    // underline: 1,
    textBaseline: 'bottom'
    // scaleX: 2,
    // scaleY: 2
  });
  graphics.push(text);
  const circle = createCircle({
    x: 500,
    y: 200,
    fill: 'black',
    radius: 2
  });
  graphics.push(circle);

  const rect = createRect({
    x: text.AABBBounds.x1,
    y: text.AABBBounds.y1,
    width: text.AABBBounds.width(),
    height: text.AABBBounds.height(),
    stroke: 'red',
    lineWidth: 1
  });
  graphics.push(rect);

  const stage = createStage({
    canvas: 'main',
    autoRender: true
  });

  graphics.forEach(g => {
    stage.defaultLayer.add(g);
  });
};
