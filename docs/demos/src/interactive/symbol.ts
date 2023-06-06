import { createSymbol } from '@visactor/vrender';
import { renderElement } from './utils';
import { colorPools } from '../utils';

// container.load(roughModule);

export function renderSymbol(num: number) {
  renderElement(num, '渲染symbol', () => {
    return createSymbol({
      x: 600 * Math.random(),
      y: 600 * Math.random(),
      symbolType: 'circle',
      size: 200,
      fill: colorPools[Math.ceil(Math.random() * colorPools.length)],
      
      stroke: colorPools[Math.floor(Math.random() * colorPools.length)],
      lineWidth: 10
    });
  });
}
