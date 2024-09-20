import {
  createStage,
  createRect,
  createLine,
  createCircle,
  MorphingPath,
  morphPath,
  pathToBezierCurves,
  createSymbol,
  oneToMultiMorph,
  multiToOneMorph,
  createPolygon,
  splitPolygon,
  createText,
  createArea,
  createArc,
  splitGraphic,
  defaultTicker
} from '@visactor/vrender';
import { colorPools } from '../utils';

// container.load(roughModule);

export const page = () => {
  const rect = createRect({
    x: 100,
    y: 100,
    width: 100,
    height: 50,
    fill: colorPools[10],
    stroke: 'red',
    lineWidth: 2
    // shadowBlur: 10,
    // shadowOffsetX: 10,
    // shadowOffsetY: 10,
    // shadowColor: colorPools[2]
  });

  const rect2 = createRect({
    x: 100,
    y: 300,
    width: 50,
    height: 150,
    fill: colorPools[10],
    stroke: 'red',
    lineWidth: 2
    // shadowBlur: 10,
    // shadowOffsetX: 10,
    // shadowOffsetY: 10,
    // shadowColor: colorPools[2]
  });

  const rect3 = createRect({
    x: 200,
    y: 100,
    width: 200,
    height: 100,
    fill: colorPools[10],
    stroke: 'red',
    lineWidth: 2
    // shadowBlur: 10,
    // shadowOffsetX: 10,
    // shadowOffsetY: 10,
    // shadowColor: colorPools[2]
  });

  const rect4 = createRect({
    x: 400,
    y: 100,
    width: 100,
    height: 300,
    fill: colorPools[5],
    stroke: 'red',
    lineWidth: 2
    // shadowBlur: 10,
    // shadowOffsetX: 10,
    // shadowOffsetY: 10,
    // shadowColor: colorPools[2]
  });

  const circle = createCircle({
    x: 150,
    y: 150,
    radius: 100,
    fill: colorPools[0]
  });

  const polygon = createPolygon({
    x: 200,
    y: 100,
    points: [
      { x: 0, y: 100 - 200 * Math.cos(Math.PI / 6) },
      { x: 200, y: 100 - 200 * Math.cos(Math.PI / 6) },
      { x: 200 + 200 * Math.sin(Math.PI / 6), y: 100 },
      { x: 200, y: 100 + 200 * Math.cos(Math.PI / 6) },
      { x: 0, y: 100 + 200 * Math.cos(Math.PI / 6) },
      { x: 0 - 200 * Math.sin(Math.PI / 6), y: 100 }
      // { x: 0, y: 0 },
      // { x: 200, y: 0 },
      // { x: 200, y: 200 },
      // { x: 0, y: 200 }
    ],
    fill: colorPools[10],
    stroke: 'green',
    lineWidth: 2,
    shadowBlur: 10,
    shadowOffsetX: 10,
    shadowOffsetY: 10,
    shadowColor: colorPools[2]
    // scaleX: 0.5,
    // scaleY: 0.5
    // cornerRadius: 30
  });

  const area = createArea({
    curveType: 'basis',
    x: 400,
    y: 200,
    points: [
      { x: 0, y: 100, y1: 50 },
      { x: 50, y: 80, y1: 60 },
      { x: 80, y: 150, y1: 20 }
    ],
    fill: colorPools[10],
    stroke: 'green'
  });

  const arc = createArc({
    x: 400,
    y: 200,
    startAngle: 0,
    endAngle: Math.PI,
    innerRadius: 50,
    outerRadius: 200,
    fill: colorPools[10],
    stroke: 'green'
  });

  // const tuoyuanProxy = new CustomPath2D();
  // tuoyuanProxy.moveTo(200, 50);
  // tuoyuanProxy.arcTo(250, 50, 300, 100, 500);
  // rect2.pathProxy = tuoyuanProxy;

  // const res = pathToBezierCurves(tuoyuanProxy);
  // const path = res[0];
  // console.log(res);
  // const pathProxy = rect.createPathProxy();
  // pathProxy.moveTo(path[0], path[1]);

  // for (let i = 2, len = path.length; i < len; i += 6) {
  //   pathProxy.bezierCurveTo(path[i], path[i + 1], path[i + 2], path[i + 3], path[i + 4], path[i + 5]);
  // }

  // rect.pathProxy = pathToBezierCurves(circle.toCustomPath());
  const line = createLine({
    x: 800,
    y: 100,
    points: [
      { x: 0, y: 0 },
      { x: 50, y: 50 },
      { x: 80, y: 20 },
      { x: 100, y: 70 }
    ],
    lineWidth: 6,
    stroke: colorPools[7]
  });

  const stage = createStage({
    canvas: 'main',
    width: 1200,
    height: 600,
    background: 'rgba(155, 0, 0, 0.2)'
  });

  // stage.defaultLayer.appendChild(rect);
  //stage.defaultLayer.appendChild(circle);
  // stage.defaultLayer.appendChild(rect2);

  // morphPath(circle, rect, { duration: 2000, easing: 'quadIn' });
  // morphPath(line, rect, { duration: 2000, ease: 'cubicIn' });

  const symbolList = [];
  for (let i = 0; i < 21; i++) {
    const symbols = createSymbol({
      x: Math.random() * 500,
      y: Math.random() * 500,
      symbolType: 'arrow',
      size: 10,
      fill: colorPools[2],
      // angle: Math.PI / 4,
      lineWidth: 6
    });
    symbolList.push(symbols);
    stage.defaultLayer.appendChild(symbols);
  }

  // stage.defaultLayer.appendChild(arc);

  // oneToMultiMorph(arc, symbolList, { duration: 2000, easing: 'quadIn' });

  const fromSymbolList = [];
  for (let i = 0; i < 23; i++) {
    const symbols = createSymbol({
      x: Math.random() * 500,
      y: Math.random() * 500,
      symbolType: 'triangleLeft',
      size: 5 + Math.floor(Math.random() * 10),
      fill: 'green',
      // stroke: 'red',
      // angle: Math.PI / 4,
      lineWidth: 6
    });
    fromSymbolList.push(symbols);
  }
  stage.defaultLayer.appendChild(rect);

  multiToOneMorph(fromSymbolList, rect, {
    duration: 2000,
    easing: 'quadIn',
    // splitPath: 'clone',
    individualDelay: (index, count, fromGraphic, toGraphic) => {
      return index * 100;
    }
  });
  // morphPath(fromSymbolList[0], polygon, { duration: 2000, easing: 'quadIn' });

  const fromSymbolList2 = [];
  for (let i = 0; i < 20; i++) {
    const symbols = createSymbol({
      x: 300 + i * 20,
      y: 300,
      symbolType: 'triangleLeft',
      size: 5 + Math.floor(Math.random() * 10),
      fill: 'green',
      // angle: Math.PI / 4,
      lineWidth: 6
    });
    fromSymbolList2.push(symbols);
    // stage.defaultLayer.appendChild(symbols);
  }
  // stage.defaultLayer.appendChild(rect4);
  // multiToOneMorph(fromSymbolList2, rect4, {
  //   duration: 2000,
  //   easing: 'quadIn',
  //   individualDelay: (index, count, fromGraphic, toGraphic) => {
  //     return index * 100;
  //   }
  // });
  stage.enableAutoRender();
  stage.render();

  let isPause = false;

  stage.on('click', () => {
    if (isPause) {
      isPause = false;
      defaultTicker.resume();
    } else {
      isPause = true;
      defaultTicker.pause();
    }
  });

  window.stage = stage;
};
