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
<<<<<<< Updated upstream
<<<<<<< HEAD
    text: ['这是垂aaa直textabc这是什么', '这是阿萨姆abcaaaaa'],
    wordBreak: 'break-word',
    maxLineWidth: 200,
    // ellipsis: '',
    direction: 'vertical',
    fontSize: 20,
    stroke: 'green',
=======
    text: 'Tffgggaaaa',
    fontSize: 26,
=======
    text: 'talfjdgkfsv',
    // wordBreak: 'break-word',
    // maxLineWidth: 200,
    // ellipsis: '',
    // direction: 'vertical',
    fontSize: 120,
>>>>>>> Stashed changes
    // stroke: 'green',
>>>>>>> develop
    // lineWidth: 100,
    // lineHeight: 30,
    // lineThrough: 1,
    // underline: 1,
<<<<<<< Updated upstream
<<<<<<< HEAD
    textBaseline: 'middle',
    textAlign: 'center'
=======
    textBaseline: 'bottom'
>>>>>>> develop
=======
    textBaseline: 'top'
>>>>>>> Stashed changes
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
