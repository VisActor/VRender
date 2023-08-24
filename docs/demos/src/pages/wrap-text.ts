import { createGroup, createStage, createWrapText, vglobal } from '@visactor/vrender';
import { addShapesToStage, colorPools } from '../utils';

vglobal.setEnv('browser');

export const page = () => {
  const shapes: any = [];

  const group = createGroup({
    x: 100,
    y: 100
  });
  group.createOrUpdateChild(
    'wrap-text',
    {
      fontFamily: 'sans-serif',
      fontSize: 14,
      fontWeight: null,
      wordBreak: 'break-word',
      fill: '#000',
      textAlign: 'left',
      textBaseline: 'top',
      lineHeight: 14,
      ellipsis: '...',
      text: ['back-end engineer'],
      maxLineWidth: 93,
      // autoWrapText: true,
      heightLimit: -1,
      pickable: false,
      dx: 0,
      x: 16,
      y: 10
    },
    'wrapText'
  );

  group.createOrUpdateChild(
    'text',
    {
      text: '这是abc',
      x: 200,
      y: 100,
      textAlign: 'left',
      textBaseline: 'alphabetic',
      fill: 'red',
      maxLineWidth: 600,
      background: 'yellow'
    },
    'wrapText'
  );

  group.createOrUpdateChild(
    'text-error',
    {
      text: ['饼图'],
      ellipsis: '...',
      fill: '#333',
      fontSize: 14,
      fontWeight: 'bold',
      textAlign: 'left',
      textBaseline: 'top',
      // "width": 12,
      // "fontColor": "#333",
      maxLineWidth: 12,
      x: 200,
      y: 200
    },
    'wrapText'
  );

  shapes.push(group.children[0]);
  shapes.push(group.children[1]);
  shapes.push(group.children[2]);
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
  //
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
