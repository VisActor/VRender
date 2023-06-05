import { createCircle } from '@visactor/vrender';
import { renderElement } from './utils';
import { colorPools } from '../utils';

// container.load(roughModule);

export function renderCircle(num: number) {
  renderElement(num, '渲染circle', () => {
    return createCircle({
      radius: 60,
      startAngle: 0,
      // angle: Math.PI / 4,
      scaleX: 2,
      scaleY: 2,
      endAngle: Math.PI,
      x: 600 * Math.random(),
      y: 600 * Math.random(),
      fillColor: colorPools[Math.ceil(Math.random() * colorPools.length)]
    });
  });
}
