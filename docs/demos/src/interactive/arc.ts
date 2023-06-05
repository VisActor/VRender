import { createArc } from '@visactor/vrender';
import { colorPools } from '../utils';
import { renderElement } from './utils';

// container.load(roughModule);

export function renderArc(num: number) {
  renderElement(num, '渲染arc', () => {
    return createArc({
      innerRadius: 0,
      outerRadius: 100,
      startAngle: 0,
      endAngle: 2 * Math.PI * Math.random(),
      x: 600 * Math.random(),
      y: 600 * Math.random(),
      fillColor: colorPools[Math.ceil(Math.random() * colorPools.length)],
      cursor: 'pointer'
    });
  });
}
