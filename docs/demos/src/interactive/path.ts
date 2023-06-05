import { createPath } from '@visactor/vrender';
import { renderElement } from './utils';
import { colorPools } from '../utils';

// container.load(roughModule);

export function renderPath(num: number) {
  renderElement(num, '渲染path', () => {
    return createPath({
      x: 600 * Math.random(),
      y: 600 * Math.random(),
      path: 'M50,0A50,50,0,1,1,-50,0A50,50,0,1,1,50,0',
      fillColor: colorPools[Math.ceil(Math.random() * colorPools.length)],
      stroke: true,
      lineWidth: 20,
      strokeColor: colorPools[Math.floor(Math.random() * colorPools.length)]
    });
  });
}
