import { createStage, createGroup, createPyramid3d, createSymbol } from '@visactor/vrender';
import { colorPools } from '../utils';

function drawChartCanopus() {
  // 创建stage
  const stage = createStage({ canvas: 'main', autoRender: true });
  stage.set3dOptions({
    alpha: 0,
    beta: 0,
    center: { x: 930, y: -300 },
    fieldRatio: 1,
    light: {
      dir: [1, 1, -10],
      color: 'white',
      ambition: 0.3
    }
  });
  const layer = stage.at(0) as any;

  const group = createGroup({
    x: 0,
    y: 300
  });

  group.setMode('3d');

  for (let i = 5; i >= 0; i--) {
    if (i === 4) {
      break;
    }
    const p3d = createPyramid3d({
      points: [
        { x: i * 30, y: i * 60 },
        { x: 600 - i * 30, y: i * 60 },
        { x: 600 - (i + 1) * 30, y: (i + 1) * 60 },
        { x: (i + 1) * 30, y: (i + 1) * 60 }
      ],
      x: 0,
      y: 0,
      z: 30 * i,
      fill: colorPools[Math.floor(Math.random() * colorPools.length)],
      // anchor3d: [300, 0, -(300 - 30 * i)],
      fillOpacity: 0.2,
      alpha: 0
      // face: [true, true, true, true, true, true]
    });
    // p3d.animate().to({alpha: Math.PI * 2}, 2000, 'linear').loop(Infinity);
    group.add(p3d);
    group.add(
      createSymbol({
        x: 300,
        y: i * 60,
        z: 300,
        fill: 'red',
        symbolType: 'circle',
        size: 10
      })
    );
    p3d.addEventListener('pointerenter', () => {
      p3d.setAttribute('fill', 'red');
    });
    p3d.addEventListener('pointerleave', () => {
      p3d.setAttribute('fill', colorPools[Math.floor(Math.random() * colorPools.length)]);
    });
  }
  console.log(group);
  const opt = {
    alpha: 0,
    beta: 0,
    center: { x: 530, y: 300 },
    fieldRatio: 1,
    light: {
      dir: [1, 1, -2],
      color: 'white',
      ambition: 0.3
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

  layer.add(group);
}

export const page = () => {
  drawChartCanopus();
};
