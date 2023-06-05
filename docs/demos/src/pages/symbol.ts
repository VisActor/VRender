import { createStage, createSymbol, container, IGraphic } from '@visactor/vrender';
import { roughModule } from '@visactor/vrender-kits';
import { addShapesToStage, colorPools } from '../utils';

// container.load(roughModule);

export const page = () => {

  const symbolList = [
    'circle', 'cross', 'diamond', 'square', 'arrow', 'arrow2Left', 'arrow2Right', 'wedge', 'thinTriangle', 'triangle', 'triangleUp', 'triangleDown', 'triangleRight', 'triangleLeft', 'stroke', 'star', 'wye', 'rect',
    'M -2 2 L 4 -5 L 7 -6 L 6 -3 L -1 3 C 0 4 0 5 1 4 C 1 5 2 6 1 6 A 1.42 1.42 0 0 1 0 7 A 5 5 0 0 0 -2 4 Q -2.5 3.9 -2.5 4.5 T -4 5.8 T -4.8 5 T -3.5 3.5 T -3 3 A 5 5 90 0 0 -6 1 A 1.42 1.42 0 0 1 -5 0 C -5 -1 -4 0 -3 0 C -4 1 -3 1 -2 2 M 4 -5 L 4 -3 L 6 -3 L 5 -4 L 4 -5'
  ]
  const graphics: IGraphic[] = [];
  
  symbolList.forEach((st, i) => {
    const symbol = createSymbol({
      symbolType: st,
      x: (i * 100) % 500 + 100,
      y: (Math.floor(i * 100 / 500) + 1) * 100,
      size: 60,
      fillColor: 'grey',
      texture: 'diamond',
      texturePadding: 0,
      textureSize: 3,
      textureColor: 'red',
    });
    symbol.addEventListener('mouseenter', () => {
      symbol.setAttribute('fillColor', 'blue');
    })
    graphics.push(symbol);
  })

  const stage = createStage({
    canvas: 'main',
    autoRender: true
  });

  graphics.forEach(g => {
    stage.defaultLayer.add(g);
  })
};
