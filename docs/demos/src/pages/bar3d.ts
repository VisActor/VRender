import { colorPools } from '../utils';

import { Animate, AnimateMode, createStage, Group, Rect3d, Line, Text } from '@visactor/vrender';
Animate.mode |= AnimateMode.SET_ATTR_IMMEDIATELY;

const pi = Math.PI;

const xLabels = [0, 1000, 2000, 3000, 18000, 5000, 20000, 7000, 8000, 9000, 10000];
const yLabels = [0, 1000, 2000, 3000, 18000, 5000, 20000, 7000, 8000, 9000, 10000];
const data: { x: number; y: number }[] = [];
for (let i = 0; i < 10; i++) {
  data.push({ x: (i as number) * 80, y: Math.floor(Math.random() * 8000) });
}

function drawChartCanopus() {
  // 创建stage
  const stage = createStage({ canvas: 'main', autoRender: true });
  stage.set3dOptions({
    alpha: 0.9,
    beta: 0.3,
    center: { x: 800, y: 450 },
    fieldRatio: 0.8,
    light: {
      dir: [1, 1, -1],
      color: 'white',
      ambient: 0.3
    }
  });
  const layer = stage.at(0) as any;

  const axisGroup = new Group({ x: 0, y: 0 });
  const xAxisGroup = new Group({ x: 0, y: 0 });
  const yAxisGroup = new Group({ x: 0, y: 0 });
  const zAxisGroup = new Group({ x: 0, y: 0 });
  axisGroup.setMode('3d');
  // const axisTextGroup = new Group({ x: 0, y: 0 });
  // axisTextGroup.setMode('3d');
  layer.add(axisGroup);
  // layer.add(axisTextGroup);
  // 绘制轴线
  const xLine = new Line({
    points: [
      { x: 200, y: 550 },
      { x: 1200, y: 550 }
    ],
    strokeColor: 'black'
  });
  xAxisGroup.add(xLine);
  // 绘制轴标签
  for (let i = 0; i < xLabels.length; i++) {
    const label = xLabels[i];
    const text = new Text({
      text: label,
      fontSize: 18,
      x: 200 + (i / 10) * 1000,
      keepDirIn3d: false,
      y: 580,
      angle: Math.PI / 3,
      textAlign: 'center',
      fillColor: 'black'
    });
    xAxisGroup.add(text);
    const grid = new Line({
      points: [
        { x: 200 + (i / 10) * 1000, y: 0 },
        { x: 200 + (i / 10) * 1000, y: 550 }
      ],
      strokeColor: 'grey',
      strokeOpacity: 0.6,
      lineDash: [5, 5]
    });
    xAxisGroup.add(grid);

    const tick = new Line({
      points: [
        { x: 200 + (i / 10) * 1000, y: 550 },
        { x: 200 + (i / 10) * 1000, y: 570 }
      ],
      strokeColor: 'grey',
      beta: -Math.PI / 2,
      anchor3d: [200 + (i / 10) * 1000, 550]
    });
    xAxisGroup.add(tick);
  }
  axisGroup.add(xAxisGroup as any);
  const yLine = new Line({
    points: [
      { x: 200, y: 0 },
      { x: 200, y: 550 }
    ],
    strokeColor: 'black'
  });
  yAxisGroup.add(yLine);
  for (let i = 0; i < yLabels.length; i++) {
    const label = yLabels[i];
    const text = new Text({
      text: label,
      fontSize: 18,
      keepDirIn3d: false,
      x: 140,
      y: ((5 - i) / 5) * 550,
      textBaseline: 'middle',
      fillColor: 'black'
      // angle: 0.3
    });
    yAxisGroup.add(text);

    const grid = new Line({
      points: [
        { x: 200, y: ((5 - i) / 5) * 550 },
        { x: 1200, y: ((5 - i) / 5) * 550 }
      ],
      strokeColor: 'grey',
      strokeOpacity: 0.6,
      lineDash: [5, 5]
    });
    yAxisGroup.add(grid);

    const tick = new Line({
      points: [
        { x: 180, y: ((5 - i) / 5) * 550 },
        { x: 200, y: ((5 - i) / 5) * 550 }
      ],
      strokeColor: 'grey',
      alpha: -Math.PI / 2,
      anchor3d: [200, ((5 - i) / 5) * 550]
    });
    yAxisGroup.add(tick);
  }
  axisGroup.add(yAxisGroup as any);

  // 绘制轴线
  const zLine = new Line({
    points: [
      { x: 200, y: 550 },
      { x: 1160, y: 550 }
    ],
    strokeColor: 'red',
    alpha: pi / 2,
    anchor3d: [200, 0]
  });
  zAxisGroup.add(zLine);
  // 绘制轴标签
  for (let i = 0; i < xLabels.length; i++) {
    const label = xLabels[i];
    const text = new Text({
      text: label,
      fontSize: 18,
      x: 200 + (i / 10) * 1000,
      y: 600,
      keepDirIn3d: false,
      textAlign: 'center',
      fillColor: 'red',
      alpha: pi / 2,
      anchor3d: [200 - (200 + (i / 10) * 1000), 0]
    });
    zAxisGroup.add(text);

    // const grid = new Line({
    //   points: [
    //     { x: 200 + (i / 10) * 1000, y: 0 },
    //     { x: 200 + (i / 10) * 1000, y: 550 }
    //   ],
    //   strokeColor: 'red',
    //   strokeOpacity: 0.6,
    //   lineDash: [5, 5],
    //   alpha: pi / 2,
    //   anchor3d: [200, 0]
    // });
    const grid = new Line({
      points: [
        { x: 200, y: ((5 - i) / 5) * 550 },
        { x: 1200, y: ((5 - i) / 5) * 550 }
      ],
      strokeColor: 'red',
      strokeOpacity: 0.6,
      beta: pi / 2,
      anchor3d: [200, 550],
      lineDash: [5, 5]
    });
    zAxisGroup.add(grid);

    // const tick = new Line({
    //   points: [
    //     { x: 200 + (i / 10) * 1000, y: 550 },
    //     { x: 200 + (i / 10) * 1000, y: 570 }
    //   ],
    //   strokeColor: 'red',
    //   alpha: pi / 2,
    //   anchor3d: [200, 0]
    // });
    // zAxisGroup.add(tick);
  }
  axisGroup.add(zAxisGroup as any);

  const barGroup = new Group({ x: 200, y: 0 });
  layer.add(barGroup);
  barGroup.setMode('3d');
  for (let i = 0; i < data.length; i++) {
    const point = data[i];
    // 绘制柱
    const bar = new Rect3d({
      x: (i + 1) * 100 - 20,
      y: ((10000 - point.y) / 10000) * 550,
      z: 0,
      width: 20,
      length: 20,
      borderRadius: 10,
      // length: 20,
      stroke: i === 3,
      lineWidth: 1,
      strokeColor: 'red',
      height: (point.y / 10000) * 550,
      fillColor: '#6690F2',
      anchor3d: [10, 0, -10],
      alpha: 0
    });

    bar.animate().from({ height: 0, y: 550 }, 2000, 'backIn');
    bar
      .animate()
      .to({ alpha: pi * 2 }, 2000, 'linear')
      .loop(Infinity);
    bar.addEventListener('click', () => {
      bar.setAttribute('fillColor', colorPools[Math.floor(Math.random() * colorPools.length)]);
    });
    barGroup.add(bar);
  }

  stage.render();

  const opt = {
    alpha: 0,
    beta: 0,
    center: { x: 800, y: 450 },
    fieldRatio: 0.8,
    light: {
      dir: [1, 1, -1],
      color: 'white',
      ambient: 0.3
    }
  };

  let pageX: number;
  let pageY: number;
  let mousedown = false;
  stage.addEventListener('mousedown', e => {
    mousedown = true;
    pageX = e.page.x;
    pageY = e.page.y;
  });
  stage.addEventListener('mouseup', () => {
    mousedown = false;
  });
  stage.addEventListener('mousemove', e => {
    if (mousedown) {
      if (!pageX || !pageY) {
        pageX = e.page.x;
        pageY = e.page.y;
      } else {
        const deltaX = e.page.x - pageX;
        const deltaY = e.page.y - pageY;
        pageX = e.page.x;
        pageY = e.page.y;

        const angle1 = deltaX / 100;
        const angle2 = deltaY / 100;
        opt.alpha += angle1;
        opt.beta += angle2;
        // opt.light.dir[0] += angle1
        // opt.light.dir[1] += angle2
        stage.set3dOptions(opt);
        stage.render();
      }
    }
  });
}

export const page = () => {
  drawChartCanopus();
  // const count = 10;

  // // 左轴
  // const leftGroup = createGroup({
  //   x: 0, y: 0
  // });
  // leftGroup.add(createLine({
  //   x: 0,
  //   y: 0,
  //   points: [
  //     { x: 99, y: 0 },
  //     { x: 99, y: 1000 }
  //   ],
  //   strokeColor: 'black'
  // }));

  // for (let i = 0; i < count; i++) {
  //   const h = Math.random() * 800;
  //   // grid
  //   leftGroup.add(createLine({
  //     x: i * 100,
  //     y: 1000 - h,
  //     points: [
  //       { x: 99, y: i * 100 },
  //       { x: 1000, y: i * 100 }
  //     ],
  //     lineDash: [5, 5],
  //     strokeColor: 'grey'
  //   }) as any);

  //   leftGroup.add(createLine({
  //     x: i * 100,
  //     y: 1000 - h,
  //     points: [
  //       { x: 90, y: i * 100 },
  //       { x: 99, y: i * 100 }
  //     ],
  //     strokeColor: 'black'
  //   }) as any);
  // }

  // const bottomGroup = createGroup({
  //   x: 100,
  //   y: 1000,
  // })

  // // 矩形
  // const rectGroup = createGroup({
  //   x: 100,
  //   y: 0
  // });
  // for (let i = 0; i < count; i++) {
  //   const h = Math.random() * 800;
  //   rectGroup.add(createRect({
  //     x: i * 100,
  //     y: 1000 - h,
  //     width: 50,
  //     height: h
  //   }) as any);
  // }

  // const c = document.getElementById('main') as HTMLCanvasElement;
  // const ctx = c.getContext('2d') as any;
  // ctx.fillStyle = 'red';
  // ctx.fillRect(-2000, -2000, 8000, 8000);

  // const stage = createStage({
  //   canvas: c as HTMLCanvasElement,
  //   canvasControled: false
  // });
  // stage.render();
};
