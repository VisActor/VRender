import { createStage, container, createRect, IGraphic, createGroup, createSymbol } from '@visactor/vrender';
import { roughModule } from '@visactor/vrender-kits';

container.load(roughModule);
export const page = () => {
  const graphics: IGraphic[] = [];
  // graphics.push(
  //   createRect({
  //     x: 100,
  //     y: 100,
  //     width: 20,
  //     height: 100,
  //     fill: colorPools[10],
  //     stroke: [colorPools[0], colorPools[0], colorPools[0], colorPools[0]],
  //     cornerRadius: 10,
  //     lineWidth: 5
  //   })
  // );

  const rect = createRect({
    visible: true,
    lineWidth: 0,
    fill: '#FF8A00',
    stroke: '#FF8A00',
    x: 207.40897089999999,
    y: 148.53125,
    width: NaN,
    x1: 49.113898,
    height: 381.9375
  });

  rect.states = {
    a: {
      height: 100
    },
    b: {
      cornerRadius: 100
    }
  };

  rect.on('click', () => {
    rect.useStates(['a', 'b']);
  });
  rect.on('dblclick', () => {
    rect.clearStates();
  });
  graphics.push(rect);

  const r = createRect({
    x: 300,
    y: 100,
    scaleX: 2,
    scaleY: 2,
    width: 200,
    height: 200,
    // cornerRadius: [0, 10, 10, 0],
    stroke: 'red',
    // scaleCenter: ['50%', '50%'],
    // _debug_bounds: true,
    fill: 'red',
    // cornerRadius: [5, 10, 15, 20],
    lineWidth: 2,
    anchor: ['50%', '50%'],
    // anchor: [400, 200],
    lineDash: [100, 10],
    lineDashOffset: -100,
    renderStyle: 'rough'
  });
  const star = createSymbol({
    x: 300,
    y: 100,
    scaleX: 2,
    scaleY: 2,
    angle: 30,
    size: 100,
    symbolType: 'star',
    // cornerRadius: [0, 10, 10, 0],
    stroke: 'red',
    // scaleCenter: ['50%', '50%'],
    // _debug_bounds: true,
    fill: 'conic-gradient(from 90deg, rgba(5,0,255,1) 16%, rgba(0,255,10,1) 41%, rgba(9,9,121,1) 53%, rgba(0,212,255,1) 100%)',
    // fill: 'linear-gradient(90deg, #215F97 0%, #FF948F 100%)',
    // cornerRadius: [5, 10, 15, 20],
    lineWidth: 5,
    anchor: ['50%', '50%'],
    // anchor: [400, 200],
    lineDash: [100, 10],
    lineDashOffset: -100,
    renderStyle: 'rough'
  });

  const group = createGroup({
    x: 0,
    y: 0,
    width: 200,
    height: 200
    // angle: 45,
    // anchor: ['50%', '50%']
  });

  group.appendChild(r);
  group.appendChild(star);

  // r.animate().to({ lineDash: [2000, 1000], lineDashOffset: 100 }, 1000, 'linear');

  graphics.push(group);
  // r.animate().to({ scaleX: 2, scaleY: 2 }, 1000, 'linear');

  graphics.push(
    createRect({
      x: 300,
      y: 300,
      width: 100,
      height: 100,
      background:
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAklEQVR4AewaftIAAACiSURBVMXBsQmDUABF0evLrwISy2yQ1g3UzpHcyBXs9HeCE2SJgEhq0waxEBTeOckEK0bCTJgJM2EW2PGoa9Ki4EpLjMxdx1ZgR1oUPJuGq81dx5YwE2bCLHDSMgxs3fOcW5ZxROCkd1Wx9ep70rLkCGEmzISZMBNmwkyYCTNhJsyEmTATZsIssGOJkTM+bct3HPm3xMieZIIVI2EmzISZMPsBPLUeCZWhvyQAAAAASUVORK5CYII=',
      cornerRadius: 100,
      lineWidth: 5
    })
  );

  const stage = createStage({
    canvas: 'main',
    autoRender: true
  });
  rect.addEventListener('pointerenter', () => console.log('abc'));
  graphics.forEach(g => {
    stage.defaultLayer.add(g);
  });

  r.animate()
    .to({ angle: Math.PI * 2 }, 10000, 'linear')
    .loop(Infinity);
};
