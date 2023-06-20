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
  
  symbolList.slice(0, 1).forEach((st, i) => {
    const symbol = createSymbol({
      "shape": "circle",
      "fillOpacity": 1,
      "visible": true,
      "x": 78.57,
      "y": 78.76363636363637,
      "size": 24.536082474226802,
      "z": null,
      "fill": {
          "gradient": "radial",
          "x0": 0.5,
          "y0": 0,
          "r0": 0,
          "x1": 0.5,
          "y1": 1,
          "r1": 0.7,
          "stops": [
              {
                  "offset": 0,
                  "color": "rgba(255,255,255,0.5)"
              },
              {
                  "offset": 1,
                  "color": "#6690F2"
              }
          ]
      },
      "symbolType": "circle",
      "pickable": true,
      "scaleX": 3,
      "scaleY": 3
  });
    symbol.addEventListener('mouseenter', () => {
      symbol.setAttribute('fill', 'blue');
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
