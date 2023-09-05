import { createStage, createGroup, createArc3d, IArc, IGraphic } from '@visactor/vrender';
import { pi2 } from '@visactor/vrender-common';
import { colorPools } from '../utils';

function drawChartCanopus() {
  // 创建stage
  const stage = createStage({ canvas: 'main', autoRender: true });
  stage.set3dOptions({
    alpha: 0,
    beta: 0,
    center: { x: 800, y: 400 },
    fieldRatio: 1,
    light: {
      dir: [1, 3, -1],
      color: 'white',
      ambient: 0.3
    }
  });
  const layer = stage.at(0) as any;

  const group = createGroup({
    x: 0,
    y: 300
  });

  group.setMode('3d');

  let angle = new Array(6)
    .fill(0)
    .map(() => Math.random() * pi2)
    .sort((a, b) => a - b);
  angle.push(pi2);
  let lastAngle = 0;
  const arcList: IGraphic[] = [];
  // angle.forEach((a, i) => {
  //   arcList.push(
  //     createArc3d({
  //       x: 100,
  //       y: 100,
  //       startAngle: lastAngle,
  //       endAngle: a,
  //       outerRadius: 100,
  //       innerRadius: 60,
  //       fill: colorPools[Math.floor(Math.random() * colorPools.length)],
  //       height: 20,
  //       beta: -Math.PI / 3,
  //       anchor: [100, 100]
  //     })
  //   );
  //   lastAngle = a;
  // });
  [
    {
      visible: true,
      height: 30,
      beta: -1.0471975511965976,
      fillOpacity: 1,
      padAngle: 0,
      x: 876,
      y: 230,
      startAngle: -1.5707963267948966,
      endAngle: -0.7453582570281666,
      outerRadius: 138,
      innerRadius: 0,
      cornerRadius: 0,
      anchor3d: [876, 230],

      fill: '#6690F2',
      pickable: true
    },
    {
      visible: true,
      height: 30,
      beta: -1.0471975511965976,
      fillOpacity: 1,
      padAngle: 0,
      x: 876,
      y: 230,
      startAngle: -0.7453582570281666,
      endAngle: 0.01847995678582226,
      outerRadius: 138,
      innerRadius: 0,
      cornerRadius: 0,
      anchor3d: [876, 230],

      fill: '#70D6A3',
      pickable: true
    },
    {
      visible: true,
      height: 30,
      beta: -1.0471975511965976,
      fillOpacity: 1,
      padAngle: 0,
      x: 876,
      y: 230,
      startAngle: 0.01847995678582226,
      endAngle: 0.6936143780278641,
      outerRadius: 138,
      innerRadius: 0,
      cornerRadius: 0,
      anchor3d: [876, 230],

      fill: '#B4E6E2',
      pickable: true
    },
    {
      visible: true,
      height: 30,
      beta: -1.0471975511965976,
      fillOpacity: 1,
      padAngle: 0,
      x: 876,
      y: 230,
      startAngle: 0.6936143780278641,
      endAngle: 1.1593092890305863,
      outerRadius: 138,
      innerRadius: 0,
      cornerRadius: 0,
      anchor3d: [876, 230],

      fill: '#63B5FC',
      pickable: true
    },
    {
      visible: true,
      height: 30,
      beta: -1.0471975511965976,
      fillOpacity: 1,
      padAngle: 0,
      x: 876,
      y: 230,
      startAngle: 1.1593092890305863,
      endAngle: 1.9280754913207945,
      outerRadius: 138,
      innerRadius: 0,
      cornerRadius: 0,
      anchor3d: [876, 230],

      fill: '#FF8F62',
      pickable: true
    },
    {
      visible: true,
      height: 30,
      beta: -1.0471975511965976,
      fillOpacity: 1,
      padAngle: 0,
      x: 876,
      y: 230,
      startAngle: 1.9280754913207945,
      endAngle: 2.5071141372765604,
      outerRadius: 138,
      innerRadius: 0,
      cornerRadius: 0,
      anchor3d: [876, 230],

      fill: '#FFDC83',
      pickable: true
    },
    {
      visible: true,
      height: 30,
      beta: -1.0471975511965976,
      fillOpacity: 1,
      padAngle: 0,
      x: 876,
      y: 230,
      startAngle: 2.5071141372765604,
      endAngle: 2.893961232659774,
      outerRadius: 138,
      innerRadius: 0,
      cornerRadius: 0,
      anchor3d: [876, 230],

      fill: '#BCC5FD',
      pickable: true
    },
    {
      visible: true,
      height: 30,
      beta: -1.0471975511965976,
      fillOpacity: 1,
      padAngle: 0,
      x: 876,
      y: 230,
      startAngle: 2.893961232659774,
      endAngle: 3.702151342759737,
      outerRadius: 138,
      innerRadius: 0,
      cornerRadius: 0,
      anchor3d: [876, 230],

      fill: '#A29BFE',
      pickable: true
    },
    {
      visible: true,
      height: 30,
      beta: -1.0471975511965976,
      fillOpacity: 1,
      padAngle: 0,
      x: 876,
      y: 230,
      startAngle: 3.702151342759737,
      endAngle: 4.170310248000568,
      outerRadius: 138,
      innerRadius: 0,
      cornerRadius: 0,
      anchor3d: [876, 230],

      fill: '#63C4C7',
      pickable: true
    },
    {
      visible: true,
      height: 30,
      beta: -1.0471975511965976,
      fillOpacity: 1,
      padAngle: 0,
      x: 876,
      y: 230,
      startAngle: 4.170310248000568,
      endAngle: 4.71238898038469,
      outerRadius: 138,
      innerRadius: 0,
      cornerRadius: 0,
      anchor3d: [876, 230],

      fill: '#F68484',
      pickable: true
    }
  ].forEach(attr => {
    const arc = createArc3d(attr as any);
    arcList.push(arc);
    arc.addEventListener('pointerenter', () => {
      arc.setAttribute('fill', 'red');
    });
    arc.addEventListener('pointerleave', () => {
      arc.setAttribute('fill', colorPools[Math.floor(Math.random() * colorPools.length)]);
    });
  });

  arcList.forEach((a: IArc) => {
    a.animate().from({ startAngle: 0, endAngle: 0 }, 3000, 'quadIn');
    group.add(a);
  });

  layer.add(group);
}

export const page = () => {
  drawChartCanopus();
};
