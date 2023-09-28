import { createLine } from '@visactor/vrender';
import { renderElement } from './utils';
import { colorPools } from '../utils';

// container.load(roughModule);

const points = [
  [0, 100],
  [20, 40],
  [40, 60],
  [60, 20],
  // [70, NaN],
  [80, 80],
  [120, 60],
  [160, 40],
  [200, 20],
  [240, 50]
].map(item => ({ x: item[0], y: item[1] }));

export function renderLine(num: number) {
  renderElement(num, '渲染line', () => {
    return createLine({
      points,
      x: 600 * Math.random(),
      y: 600 * Math.random(),
      lineWidth: 6,
      fill: colorPools[Math.ceil(Math.random() * colorPools.length)]
    });
  });
}
