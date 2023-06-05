import { createGroup, createStage, createWrapText, global } from '@visactor/vrender';
import { addShapesToStage, colorPools } from '../utils';

global.setEnv('browser');

export const page = () => {
  const shapes: any = [];

  const group = createGroup({
    x: 100,
    y: 100
  });
  group.createOrUpdateChild(
    'wrap-text',
    {
      text: ['这是abc'],
      x: 100,
      y: 100,
      fillColor: 'green',
      textAlign: 'left',
      textBaseline: 'alphabetic',
      maxLineWidth: 600
    },
    'wrapText'
  );

  group.createOrUpdateChild(
    'text',
    {
      text: '这是abc',
      x: 100,
      y: 100,
      textAlign: 'left',
      textBaseline: 'alphabetic',
      fillColor: 'red',
      maxLineWidth: 600
    },
    'wrapText'
  );
  shapes.push(group.children[0]);
  shapes.push(group.children[1]);
  // console.log(createWrapText({
  //   x: 100,
  //   y: 200,
  //   text: [''],
  //   fill: true
  // }).AABBBounds.height())

  // shapes.push(
  //   createWrapText({
  //     x: 100,
  //     y: 200,
  //     text: '单行',
  //     fill: true
  //   })
  // );

  // shapes.push(
  //   createWrapText({
  //     x: 100,
  //     y: 300,
  //     text: ['多行非换行'],
  //     fill: true
  //   })
  // );

  // shapes.push(
  //   createWrapText({
  //     x: 100,
  //     y: 400,
  //     text: ['多行自动换行'],
  //     maxLineWidth: 60,
  //     fill: true
  //   })
  // );

  // shapes.push(
  //   createWrapText({
  //     x: 100,
  //     y: 500,
  //     text: ['多行自动换行高度限制多行多行'],
  //     maxLineWidth: 60,
  //     heightLimit: 50,
  //     fill: true,
  //     ellipsis: ''
  //   })
  // );

  // shapes.push(
  //   createWrapText({
  //     x: 200,
  //     y: 100,
  //     text: ['多行自动换行行数限制'],
  //     maxLineWidth: 60,
  //     lineClamp: 3,
  //     fill: true
  //   })
  // );

  // shapes.push(
  //   createWrapText({
  //     x: 200,
  //     y: 200,
  //     text: ['多行自动换行省略号多行多行'],
  //     maxLineWidth: 60,
  //     heightLimit: 50,
  //     fill: true
  //   })
  // );

  const stage = createStage({
    canvas: 'main',
    width: 1200,
    height: 600,
    autoRender: true
  });

  addShapesToStage(stage, shapes as any, true);

  console.log(stage.defaultLayer, stage.defaultLayer.getChildAt(0), stage.defaultLayer.getChildAt(1));
  stage.render();
};
