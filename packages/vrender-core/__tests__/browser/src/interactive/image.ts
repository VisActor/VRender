import { createImage } from '@visactor/vrender';
import { renderElement } from './utils';

// container.load(roughModule);

export function renderImage(num: number) {
  renderElement(num, '渲染image', () => {
    return createImage({
      x: 600 * Math.random(),
      y: 600 * Math.random(),
      image: ''
    });
  });
}
