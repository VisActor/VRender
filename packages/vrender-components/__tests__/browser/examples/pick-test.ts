import { createGroup, createRect, createCircle, createStage, createText, createSymbol } from '@visactor/vrender';
import render from '../../util/render';
export function run() {
  console.log('Pick test');

  const group = createGroup({
    x: 30,
    y: 30
  });
  group.setTheme({
    common: {
      strokeBoundsBuffer: 0
    }
  });

  const symbol = createSymbol({
    x: 0,
    y: 0,
    size: 30,
    symbolType: 'circle',
    fillColor: 'red',
    lineWidth: 2,
    strokeColor: 'black'
  });

  group.add(symbol);

  render([group], 'main');

  console.log(group.AABBBounds, group.AABBBounds.height(), group.AABBBounds.width());
  console.log(symbol.AABBBounds, symbol.AABBBounds.height(), symbol.AABBBounds.width());
}
