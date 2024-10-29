import { createStage, createRect, IGraphic } from '@visactor/vrender';
import { roughModule } from '@visactor/vrender-kits';
import { addShapesToStage, colorPools } from '../utils';

// container.load(roughModule);
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
    x: 20,
    y: 20,
    width: 101.55555555555556,
    height: 30,
    cornerRadius: -4,
    background:
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzFfMTUxNjkpIj4KPHBhdGggZD0iTTEwIDIwQzE1LjUyMjggMjAgMjAgMTUuNTIyOCAyMCAxMEMyMCA0LjQ3NzE1IDE1LjUyMjggMCAxMCAwQzQuNDc3MTUgMCAwIDQuNDc3MTUgMCAxMEMwIDE1LjUyMjggNC40NzcxNSAyMCAxMCAyMFoiIGZpbGw9IiNGMEYwRjAiLz4KPHBhdGggZD0iTTIwIDkuOTk5OTZDMjAgNS43MDAzMSAxNy4yODYzIDIuMDM0ODggMTMuNDc4MyAwLjYyMTk0OFYxOS4zNzhDMTcuMjg2MyAxNy45NjUgMjAgMTQuMjk5NiAyMCA5Ljk5OTk2WiIgZmlsbD0iI0Q4MDAyNyIvPgo8cGF0aCBkPSJNMCA5Ljk5OTk2QzAgMTQuMjk5NiAyLjcxMzc1IDE3Ljk2NSA2LjUyMTc2IDE5LjM3OFYwLjYyMTk0OEMyLjcxMzc1IDIuMDM0ODggMCA1LjcwMDMxIDAgOS45OTk5NloiIGZpbGw9IiM2REE1NDQiLz4KPC9nPgo8ZGVmcz4KPGNsaXBQYXRoIGlkPSJjbGlwMF8xXzE1MTY5Ij4KPHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSJ3aGl0ZSIvPgo8L2NsaXBQYXRoPgo8L2RlZnM+Cjwvc3ZnPgo=',
    fill: 'rgba(0,0,0,0.3)',
    backgroundMode: 'repeat-x',
    boundsPadding: [2, 2, 2, 2],
    pickMode: 'imprecise'
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
    cornerRadius: [0, 10, 10, 0],
    stroke: 'red',
    // scaleCenter: ['50%', '50%'],
    // _debug_bounds: true,
    fill: 'conic-gradient(from 90deg, rgba(5,0,255,1) 16%, rgba(0,255,10,1) 41%, rgba(9,9,121,1) 53%, rgba(0,212,255,1) 100%)',
    // cornerRadius: [5, 10, 15, 20],
    lineWidth: 5
  });

  graphics.push(r);
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
};
