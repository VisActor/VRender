import {
  createStage,
  createRect,
  createText,
  createGlyph,
  createSymbol,
  createGroup,
  FederatedEvent,
  initBrowserEnv,
  initAllEnv,
  initFeishuEnv
} from '@visactor/vrender';
import { addShapesToStage, colorPools } from '../utils';

// container.load(roughModule);
initBrowserEnv();
initFeishuEnv();
initAllEnv();

export const page = () => {
  const shapes = [];

  const group = createGroup({
    pickable: false
    // childrenPickable: false,
  });

  group.setTheme({
    common: {
      stroke: 'blue',
      lineWidth: 3
    },
    symbol: {
      size: 60
    }
  });

  const g = createGlyph({
    x: 300,
    y: 100,
    stroke: 'green',
    lineWidth: 10
  });

  const subGraphic = [];

  subGraphic.push(
    createRect({
      // x: 10,
      // y: 10,
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

  // setTimeout(() => {
  //   symbol.setAttribute('size', 200);
  //   console.log(g);
  // }, 2000);

  g.addEventListener('click', () => {
    console.log('abc');
  });

  g.setSubGraphic(subGraphic);

  g.glyphStateProxy = (stateName: string) => {
    if (stateName === 'hover') {
      return {
        attributes: {
          scaleX: 2,
          scaleY: 2
        }
      };
    }

    return {
      attributes: {
        stroke: 'red'
      }
    };
  };

  // g.addEventListener('mouseenter', (e: FederatedEvent) => {
  //   g.addState('hover', true, true);

  //   stage.renderNextFrame();
  // });

  // g.addEventListener('mouseleave', (e: FederatedEvent) => {
  //   g.removeState('hover', true);

  //   stage.renderNextFrame();
  // });

  g.addEventListener('click', (e: FederatedEvent) => {
    console.log(e.type, e.target);

    g.toggleState('click', true);

    stage.renderNextFrame();
  });

  group.add(g);

  // group.setAttribute('visibleAll', false);

  shapes.push(group);

  console.log(group, g);

  const stage = createStage({
    canvas: 'main',
    width: 1200,
    height: 600,
    viewWidth: 1200,
    viewHeight: 600
  });

  console.log(
    createText({
      x: 100,
      y: 100,
      fontFamily: 'sans-serif',
      text: ['aaa这是aaa', 'aa这是aa'],
      fontSize: 16,
      fill: 'red'
    })
  );

  addShapesToStage(stage, shapes as any, true);
  stage.render();
};
