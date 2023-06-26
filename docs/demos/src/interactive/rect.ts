import { createRect } from '@visactor/vrender';
import { renderElement } from './utils';
import { colorPools } from '../utils';

// container.load(roughModule);

export function renderRect(num: number) {
  renderElement(num, '渲染rect', () => {
    return createRect({
      width: 100,
      height: 60,
      x: 800 * Math.random(),
      y: 800 * Math.random(),
      cornerRadius: 50,
      // scaleX: 2,
      // scaleY: 2,
      // angle: Math.PI / 4,
      fill: colorPools[Math.ceil(Math.random() * colorPools.length)]
    });
  });
}
