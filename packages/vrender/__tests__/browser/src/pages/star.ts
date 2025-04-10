import { createStage, createStar, IGraphic } from '@visactor/vrender';
import { addShapesToStage, colorPools } from '../utils';

export const page = () => {
  const graphics: IGraphic[] = [];

  // Basic star with default settings
  const basicStar = createStar({
    x: 100,
    y: 100,
    width: 100,
    height: 100,
    spikes: 5,
    thickness: 0.5,
    fill: colorPools[10],
    stroke: colorPools[0],
    lineWidth: 2
  });

  // Add mouse interactions
  basicStar.addEventListener('pointerenter', () => {
    basicStar.setAttribute('fill', colorPools[2]);
  });
  basicStar.addEventListener('pointerleave', () => {
    basicStar.setAttribute('fill', colorPools[10]);
  });

  // Add to graphics array
  graphics.push(basicStar);

  // Star with states for interactivity
  const stateStar = createStar({
    x: 250,
    y: 100,
    width: 100,
    height: 100,
    spikes: 5,
    thickness: 0.4,
    fill: colorPools[8],
    stroke: colorPools[6],
    lineWidth: 2
  });

  // Define states for the star
  stateStar.states = {
    hover: {
      thickness: 0.8,
      lineWidth: 3
    },
    clicked: {
      width: 120,
      height: 120,
      spikes: 8
    }
  };

  // Add event listeners to toggle states
  basicStar.on('click', () => {
    stateStar.toggleState('clicked');
  });
  basicStar.on('pointerenter', () => {
    stateStar.addState('hover', true, false);
  });
  basicStar.on('pointerleave', () => {
    stateStar.removeState('hover', true);
  });

  graphics.push(stateStar);

  // Star with many points for complex shape
  const complexStar = createStar({
    x: 100,
    y: 250,
    width: 100,
    height: 100,
    spikes: 10,
    thickness: 0.7,
    fill: 'conic-gradient(from 90deg, rgba(5,0,255,1) 16%, rgba(0,255,10,1) 41%, rgba(9,9,121,1) 53%, rgba(0,212,255,1) 100%)',
    stroke: 'black',
    lineWidth: 1,
    _debug_bounds: true
  });

  graphics.length = 0;

  // Add animation on hover
  complexStar.on('pointerenter', () => {
    complexStar.animate().to({ angle: Math.PI * 2 }, 10000, 'linear');
  });

  graphics.push(complexStar);

  // // Star with different width and height for oval effect
  // const ovalStar = createStar({
  //   x: 250,
  //   y: 250,
  //   width: 150,
  //   height: 80,
  //   spikes: 6,
  //   thickness: 0.6,
  //   fill: colorPools[5],
  //   stroke: colorPools[1],
  //   lineWidth: 2
  // });

  // graphics.push(ovalStar);

  // // Animated star with background image
  // const bgStar = createStar({
  //   x: 200,
  //   y: 175,
  //   width: 100,
  //   height: 100,
  //   spikes: 5,
  //   thickness: 0.4,
  //   background:
  //     'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzFfMTUxNjkpIj4KPHBhdGggZD0iTTEwIDIwQzE1LjUyMjggMjAgMjAgMTUuNTIyOCAyMCAxMEMyMCA0LjQ3NzE1IDE1LjUyMjggMCAxMCAwQzQuNDc3MTUgMCAwIDQuNDc3MTUgMCAxMEMwIDE1LjUyMjggNC40NzcxNSAyMCAxMCAyMFoiIGZpbGw9IiNGMEYwRjAiLz4KPHBhdGggZD0iTTIwIDkuOTk5OTZDMjAgNS43MDAzMSAxNy4yODYzIDIuMDM0ODggMTMuNDc4MyAwLjYyMTk0OFYxOS4zNzhDMTcuMjg2MyAxNy45NjUgMjAgMTQuMjk5NiAyMCA5Ljk5OTk2WiIgZmlsbD0iI0Q4MDAyNyIvPgo8cGF0aCBkPSJNMCA5Ljk5OTk2QzAgMTQuMjk5NiAyLjcxMzc1IDE3Ljk2NSA2LjUyMTc2IDE5LjM3OFYwLjYyMTk0OEMyLjcxMzc1IDIuMDM0ODggMCA1LjcwMDMxIDAgOS45OTk5NloiIGZpbGw9IiM2REE1NDQiLz4KPC9nPgo8ZGVmcz4KPGNsaXBQYXRoIGlkPSJjbGlwMF8xXzE1MTY5Ij4KPHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSJ3aGl0ZSIvPgo8L2NsaXBQYXRoPgo8L2RlZnM+Cjwvc3ZnPgo=',
  //   backgroundMode: 'repeat',
  //   stroke: 'rgba(0,0,0,0.7)',
  //   lineWidth: 1
  // });

  // console.log(bgStar);

  // // Auto rotate animation
  // // bgStar.animate().to({ angle: 360 }, 5000, 'linear').loop(Infinity);

  // graphics.push(bgStar);

  // Create the stage and add all graphics
  const stage = createStage({
    canvas: 'main',
    autoRender: true
  });

  // Add all graphics to the stage
  graphics.forEach(g => {
    stage.defaultLayer.add(g);
  });
};
