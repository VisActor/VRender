import { createStage, createGroup, createText, RotateBySphereAnimate, IGraphicAttribute } from '@visactor/vrender';
import { colorPools } from '../utils';

function drawChartCanopus1() {
  // 创建stage
  const stage = createStage({ canvas: 'main', autoRender: true });
  stage.set3dOptions({
    alpha: 0,
    beta: 0,
    center: { x: 350, y: 300 },
    fieldRatio: 0.8,
    light: {
      dir: [1, 1, -1],
      color: 'white',
      ambient: 0.3
    }
  });
  const layer = stage.at(0) as any;

  const group = createGroup({
    x: 300,
    y: 300
  });

  group.setMode('3d');

  const r = 250;
  const n = 10;
  const center = { x: r, y: r, z: r };

  function unProject(attr: IGraphicAttribute, w: number, h: number) {
    let { x, y } = attr;

    const theta = (x / w) * Math.PI * 2;
    let phi = Math.PI - (y / h) * Math.PI;
    // 由于cos函数的特性，调整phi的分布，向内聚
    phi += ((phi < Math.PI / 2 ? 1 : -1) * Math.pow(Math.min(phi - Math.PI / 2, 1), 2)) / 5;
    console.log(attr.text, phi, theta);
    const nx = r * Math.sin(phi) * Math.cos(theta) + center.x;
    const ny = r * Math.cos(phi) + center.y;
    const nz = r * Math.sin(phi) * Math.sin(theta) + center.z;
    attr.x = nx;
    attr.y = ny;
    attr.z = nz;
  }

  for (let i = 0; i < 10; i++) {
    const theta = ((Math.PI * 2) / 9) * i;
    for (let j = 0; j < 7; j++) {
      const phi = (Math.PI / 6) * j;
      const nx = r * Math.sin(phi) * Math.cos(theta) + center.x;
      const ny = r * Math.cos(phi) + center.y;
      const nz = r * Math.sin(phi) * Math.sin(theta) + center.z;
      const t = createText({
        x: nx,
        y: ny,
        keepDirIn3d: true,
        z: nz,
        text: Math.floor(Math.random() * 100),
        fill: colorPools[Math.floor(Math.random() * colorPools.length)]
      });
      group.add(t);
      t.animate().play(new RotateBySphereAnimate(null, null, 10000, 'linear', { center, r })).loop(Infinity);
    }
  }

  layer.add(group);

  stage.render();
}

function drawChartCanopus() {
  // 创建stage
  const stage = createStage({ canvas: 'main', autoRender: true });
  stage.set3dOptions({
    alpha: 0,
    beta: 0,
    center: { x: 150, y: 300 },
    fieldRatio: 0.8,
    light: {
      dir: [1, 1, -1],
      color: 'white',
      ambient: 0.3
    }
  });
  const layer = stage.at(0) as any;

  const group = createGroup({
    x: 300,
    y: 300
  });

  group.setMode('3d');

  const r = 200;
  const n = 10;
  const center = { x: 0, y: 0, z: 0 };
  for (let i = 0; i < n; i++) {
    const th = ((Math.PI * 2) / n) * i;
    const fill = colorPools[Math.floor(Math.random() * colorPools.length)];
    for (let j = 1; j < n; j++) {
      const p = (Math.PI / n) * j;
      const theta = th + (Math.random() * Math.PI) / 100;
      const phi = p + (Math.random() * Math.PI) / 100;
      const x = r * Math.sin(phi) * Math.cos(theta) + center.x;
      const y = r * Math.cos(phi) + center.y;
      const z = r * Math.sin(phi) * Math.sin(theta) + center.z;
      const count = i * n + j;
      const text = `${i}-${j}`;
      const t = createText({
        text: text,
        x,
        y,
        z,
        fill
      });
      group.add(t);
      t.onBeforeAttributeUpdate = (...args) => {
        // console.log(args);
      };
      // t.animate().play(new RotateBySphereAnimate(null, null, 6000, 'linear', { center, r })).loop(Infinity);
    }
  }

  layer.add(group);

  stage.render();
}

export const page = () => {
  drawChartCanopus1();
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
  //   stroke: 'black'
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
  //     stroke: 'grey'
  //   }) as any);

  //   leftGroup.add(createLine({
  //     x: i * 100,
  //     y: 1000 - h,
  //     points: [
  //       { x: 90, y: i * 100 },
  //       { x: 99, y: i * 100 }
  //     ],
  //     stroke: 'black'
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
