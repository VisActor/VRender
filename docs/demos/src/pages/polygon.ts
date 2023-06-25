import { createStage, createPolygon } from '@visactor/vrender';
import { addShapesToStage, colorPools } from '../utils';

// container.load(roughModule);

export const page = () => {
  const shapes = [];

  // 正方形
  const square = createPolygon({
    x: 0,
    y: 0,
    points: [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 }
    ],
    fill: colorPools[10],
    stroke: colorPools[5],
    lineJoin: 'bevel',
    lineWidth: 20
    // cornerRadius: 10
  });
  shapes.push(square);

  // 梯形
  shapes.push(
    createPolygon({
      x: 200,
      y: 100,
      points: [
        { x: 0, y: 0 },
        { x: 300, y: 0 },
        { x: 160, y: 100 },
        { x: 0, y: 100 }
      ],
      fill: colorPools[10],
      stroke: 'green',
      
      lineJoin: 'round',
      lineWidth: 1,
      // lineDash: [10, 10],
      cornerRadius: 10
    })
  );

  // 正六边形
  shapes.push(
    createPolygon({
      x: 100,
      y: 500,
      points: [
        { x: -100, y: -200 * Math.cos(Math.PI / 6) },
        { x: 100, y: -200 * Math.cos(Math.PI / 6) },
        { x: 100 + 200 * Math.sin(Math.PI / 6), y: 0 },
        { x: 100, y: 200 * Math.cos(Math.PI / 6) },
        { x: -100, y: 200 * Math.cos(Math.PI / 6) },
        { x: -100 - 200 * Math.sin(Math.PI / 6), y: 0 }
      ],
      fill: colorPools[10],
      stroke: 'green',
      lineWidth: 2,
      shadowBlur: 10,
      shadowOffsetX: 10,
      shadowOffsetY: 10,
      shadowColor: colorPools[2],
      scaleX: 0.5,
      scaleY: 0.5
      // cornerRadius: 30
    })
  );

  shapes.forEach((shape, index) => {
    shape.addEventListener('pointerdown', (...params) => {
      console.log(index, params);
    });
  });

  const stage = createStage({
    canvas: 'main',
    width: 1200,
    height: 600,
    viewWidth: 1200,
    viewHeight: 600
  });

  addShapesToStage(stage, shapes as any, true);

  // 正方形动画
  const squareAnimation = square
    .animate()
    .to(
      {
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
          { x: 0, y: 100 }
        ].map(p => {
          return { x: p.x + Math.random() * 100, y: p.y + 100 };
        })
      },
      300,
      'quadIn'
    )
    .loop(0)
    .to(
      {
        fill: () => colorPools[~~(Math.random() * 10)]
      },
      1000,
      'quadIn'
    );
  stage.render();
};
