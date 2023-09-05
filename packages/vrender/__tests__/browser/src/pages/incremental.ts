import {
  createStage,
  createSymbol,
  builtinSymbols,
  IGroup,
  createRect,
  createGroup,
  createArc,
  createLine,
  layerService,
  ILayer,
  waitForAllSubLayers
} from '@visactor/vrender';
import { addShapesToStage, colorPools } from '../utils';

const symbolList = builtinSymbols.map(item => item.type);

function addSymbol(group: IGroup, count: number) {}

export const page = () => {
  const background = createRect({
    x: 0,
    y: 0,
    width: 1000,
    height: 1000,
    fill: 'pink'
  });

  const root = createGroup({
    width: 700,
    height: 700,
    x: 100,
    y: 100,
    clip: true
  });
  const bg = createGroup({ pickable: false });
  const ig = createGroup({ pickable: false });
  const ig2 = createGroup({ pickable: false });
  const ig3 = createGroup({ pickable: false });
  const fg = createGroup({ pickable: false });

  for (let i = 0; i < 10; i++) {
    bg.add(
      createRect({
        x: Math.random() * 1000,
        y: Math.random() * 1000,
        width: Math.random() * 200,
        height: Math.random() * 200,
        fill: 'green'
      })
    );
  }

  fg.add(
    createLine({
      points: new Array(100).fill(0).map((_, i) => ({ x: i * 10, y: Math.random() * 800 })),
      stroke: 'red',
      lineWidth: 3
    })
  );

  ig.incremental = 200;
  ig2.incremental = 200;
  ig3.incremental = 200;

  function addSymbol(count: number = 2000) {
    for (let i = 0; i < count; i++) {
      const symbol = createSymbol({
        x: Math.random() * 1000,
        y: Math.random() * 1000,
        symbolType: symbolList[Math.floor(symbolList.length * Math.random())],
        fill: 'blue'
      });
      symbol.addEventListener('mouseenter', () => {
        symbol.setAttribute('fill', 'red');
      });
      ig.add(symbol);
    }
  }

  function addSymbol2(count: number = 2000) {
    for (let i = 0; i < count; i++) {
      const symbol = createSymbol({
        x: Math.random() * 1000,
        y: Math.random() * 1000,
        symbolType: symbolList[Math.floor(symbolList.length * Math.random())],
        fill: 'green'
      });
      symbol.addEventListener('mouseenter', () => {
        symbol.setAttribute('fill', 'red');
      });
      ig2.add(symbol);
    }
  }
  const line = createLine({
    segments: [{ points: new Array(10).fill(0).map((_, i) => ({ x: i * 0.01, y: Math.random() * 500 })) }],
    stroke: 'orange',
    lineWidth: 1
  });
  line.incremental = 1;
  ig3.add(line);
  function addLine(count: number = 2000) {
    for (let i = 0; i < count; i++) {
      const seg = line.attribute.segments as any[];
      const points = seg[seg.length - 1].points;
      const nextX = points[points.length - 1].x;
      line.setAttribute('segments', [
        ...(line.attribute.segments as any),
        { points: new Array(20).fill(0).map((_, i) => ({ x: nextX + i * 0.03, y: Math.random() * 500 })) }
      ]);
    }
  }
  function incrementalAddSymbol(count: number = 200) {
    for (let i = 0; i < count; i++) {
      const symbol = createSymbol({
        x: Math.random() * 1000,
        y: Math.random() * 1000,
        symbolType: symbolList[Math.floor(symbolList.length * Math.random())],
        fill: 'blue'
      });
      symbol.addEventListener('mouseenter', () => {
        symbol.setAttribute('fill', 'red');
      });
      ig.incrementalAppendChild(symbol);
    }
  }
  addSymbol(200);
  addSymbol2(200);
  addLine(600);

  const stage = createStage({ canvas: 'main', autoRender: true, disableDirtyBounds: false });
  stage.enableIncrementalAutoRender();

  root.add(background as any);
  root.add(bg as any);
  root.add(ig as any);
  root.add(ig2 as any);
  root.add(ig3 as any);
  root.add(fg as any);

  stage.defaultLayer.add(root as any);

  setTimeout(() => {
    incrementalAddSymbol(80000);
    waitForAllSubLayers(stage as any).then(() => {
      stage.defaultLayer.combineSubLayer();
    });
  }, 6000);

  // setTimeout(() => {
  //   stage.defaultLayer.combineSubLayer();
  //   console.log('afjdfjdslf');
  //   line.setAttributes({ stroke: 'blue' });
  // }, 6000);
  // for (let i = 0; i < 1000; i++) {
  //   setTimeout(() => {
  //     // incrementalAddSymbol(2000);
  //   }, i * 100);
  // }

  // setTimeout(() => {
  //   incrementalAddSymbol(2000);
  //   setTimeout(() => {
  //     for (let i = 0; i < 1; i++) {
  //       incrementalAddSymbol(12);
  //     }

  //     setTimeout(() => {
  //       incrementalAddSymbol(2000);
  //     }, 1000);

  //     // setTimeout(() => {
  //     //   addSymbol(2000);
  //     // }, 10000)
  //     // setTimeout(() => {
  //     //   ig.incrementalClearChild();
  //     //   incrementalAddSymbol(2000);
  //     //   console.log('adkfjasfjklds');
  //     // }, 12000);
  //   }, 20);
  //   // stage.renderNextFrame();
  // }, 3000);

  // stage.render();
};
