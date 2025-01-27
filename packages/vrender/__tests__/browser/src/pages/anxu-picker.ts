import { createStage, createRect, IGraphic, container } from '@visactor/vrender-core';
import { loadBrowserEnv, loadMathPicker, registerRect } from '@visactor/vrender-kits';

registerRect();
loadBrowserEnv(container);
loadMathPicker(container);

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

  rect.addEventListener('click', () => {
    console.log('click');
  });

  const stage = createStage({
    canvas: 'main',
    autoRender: true
  });
  stage.defaultLayer.add(rect);
};
