import { createStage, createRect, IGraphic, IContext2d } from '@visactor/vrender';
import {
  randomOpacity,
  columnLeftToRight,
  columnRightToLeft,
  rowTopToBottom,
  rowBottomToTop,
  diagonalCenterToEdge,
  diagonalTopLeftToBottomRight,
  rotationScan,
  rippleEffect,
  snakeWave,
  alternatingWave,
  spiralEffect,
  columnEdgeToCenter,
  columnCenterToEdge,
  rowEdgeToCenter,
  rowCenterToEdge,
  cornerToCenter,
  centerToCorner,
  pulseWave,
  particleEffect
} from '@visactor/vrender-kits';
import { addShapesToStage, colorPools } from '../utils';

// container.load(roughModule);
export const page = () => {
  const graphics: IGraphic[] = [];
  const effects = [
    randomOpacity,
    columnLeftToRight,
    columnRightToLeft,
    rowTopToBottom,
    rowBottomToTop,
    diagonalCenterToEdge,
    diagonalTopLeftToBottomRight,
    rotationScan,
    rippleEffect,
    snakeWave,
    alternatingWave,
    spiralEffect,
    columnEdgeToCenter,
    columnCenterToEdge,
    rowEdgeToCenter,
    rowCenterToEdge,
    cornerToCenter,
    centerToCorner,
    pulseWave,
    particleEffect
  ];
  const symbolTypeList = [
    'circle',
    'cross',
    'diamond',
    'square',
    'arrow',
    'arrow2Left',
    'arrow2Right',
    'arrow2Up',
    'arrow2Down',
    'wedge',
    'thinTriangle',
    'triangle',
    'triangleUp',
    'triangleDown',
    'triangleRight',
    'triangleLeft',
    'star',
    'wye',
    'rect',
    'arrowLeft',
    'arrowRight',
    'rectRound'
  ];
  effects.forEach((item, index) => {
    // 4行5列
    graphics.push(
      createRect({
        width: 200,
        height: 200,
        x: 200 * (index % 5),
        y: 200 * Math.floor(index / 5),
        fill: colorPools[index % colorPools.length],
        texture: symbolTypeList[index % symbolTypeList.length],
        textureSize: 20,
        texturePadding: 2,
        textureRatio: 0,
        textureColor: 'orange',
        textureOptions: {
          dynamicTexture: (
            ctx: IContext2d,
            row: number,
            column: number,
            rowCount: number,
            columnCount: number,
            ratio: number,
            graphic: IGraphic
          ) => {
            const _r = effects[index](ctx, row, column, rowCount, columnCount, ratio, graphic);
            ctx.globalAlpha = _r;
            ctx.fill();
          }
        }
      })
    );
  });

  const stage = createStage({
    canvas: 'main',
    autoRender: true
  });
  stage.render();
  graphics.forEach(g => {
    stage.defaultLayer.add(g);
    g.animate().to({ textureRatio: 1 }, 2000, 'linear').loop(Infinity);
  });
};
