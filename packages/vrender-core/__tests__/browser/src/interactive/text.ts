import { createText } from '@visactor/vrender';
import { colorPools } from '../utils';
import { renderElement } from './utils';

// container.load(roughModule);

export function renderText(num: number) {
  renderElement(num, '渲染text', () => {
    return createText({
      x: 600 * Math.random(),
      y: 600 * Math.random(),
      text: 'test',
      fontSize: 20,
      fill: colorPools[Math.ceil(Math.random() * colorPools.length)]
    });
  });
}
