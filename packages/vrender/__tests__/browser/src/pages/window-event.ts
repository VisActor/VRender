import { createStage, createCircle, IGraphic, vglobal, createSymbol } from '@visactor/vrender';
import { colorPools } from '../utils';
import { createGroup } from '@visactor/vrender';
import { Matrix } from '@visactor/vutils';

export const page = () => {
  function addSymbol(num: number, type: string, stage: any) {
    for (let i = 0; i < num; i++) {
      const symbol = createSymbol({
        x: Math.random() * 200,
        y: Math.random() * 200,
        size: 16,
        fill: `rgb(${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)},${Math.floor(
          Math.random() * 255
        )})`,
        symbolType: type
      });
      stage.defaultLayer.add(symbol);
      symbol.addEventListener('mouseenter', () => {
        symbol.setAttribute('fill', 'red');
      });
      symbol.addEventListener('mouseleave', () => {
        symbol.setAttribute(
          'fill',
          `rgb(${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)},${Math.floor(
            Math.random() * 255
          )})`
        );
      });
    }
  }

  const stage1 = createStage({
    canvas: 'main',
    viewBox: {
      x1: 100,
      y1: 100,
      x2: 200,
      y2: 200
    },
    background: 'rgba(255, 128, 36, 0.2)',
    autoRender: true
  });

  addSymbol(100, 'circle', stage1);

  const stage2 = createStage({
    canvas: 'main',
    width: 100,
    height: 100,
    canvasControled: false,
    background: 'rgba(36, 128, 36, 0.2)',
    autoRender: true
  });

  addSymbol(100, 'star', stage2);

  const stage3 = createStage({
    canvas: 'main',
    width: 100,
    height: 100,
    canvasControled: false,
    background: 'rgba(36, 128, 36, 0.2)',
    autoRender: true
  });

  const matrix = new Matrix();
  matrix.translate(200, 200);
  matrix.rotate(Math.PI / 3);

  stage3.window.setViewBoxTransform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f);

  stage3.addEventListener('mouseenter', () => {
    console.log('abcdefg');
  });

  addSymbol(100, 'square', stage3);

  const stage = createStage({
    width: 100,
    height: 300
  });
  stage.resize(200, 200);
  console.log();
  // expect(stage.width).toEqual(300);
  // expect(stage.height).toEqual(300);
  // expect(stage.viewWidth).toEqual(60);
  // expect(stage.viewHeight).toEqual(60);
  // stage.resizeView(200, 200);
  console.log(stage.viewWidth);
  // expect(stage.width).toEqual(300);
  // expect(stage.height).toEqual(300);
  // expect(stage.viewWidth).toEqual(200);
  // expect(stage.viewHeight).toEqual(200);
};
