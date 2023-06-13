import type { IGraphic } from '../src';
import { createGlyph, createRect, createSymbol } from '../src';

export const crateDemoGlyph = () => {
  const g = createGlyph({
    x: 300,
    y: 100,
    stroke: 'green',
    lineWidth: 10
  });

  const subGraphic: IGraphic[] = [];

  subGraphic.push(
    createRect({
      width: 100,
      height: 100,
      fill: 'pink'
    })
  );

  const symbol = createSymbol({
    // x: 60,
    // y: 60,
    dx: 50,
    dy: 50,
    symbolType: 'star',
    fill: 'green',
    stroke: true
  });
  subGraphic.push(symbol);

  g.setSubGraphic(subGraphic);

  return g;
};
