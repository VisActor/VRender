import { IPointLike } from '@visactor/vutils';
import '@visactor/vrender';
import render from '../../util/render';
import { DataZoom } from '../../../src';

export function run() {
  console.log('DataZoom');

  const dataZoom = new DataZoom({
    orient: 'left',
    start: 0.2,
    end: 0.5,
    position: {
      x: 235,
      y: 50
    },
    size: {
      width: 30,
      height: 400
    },
    brushSelect: false
  });

  const stage = render([dataZoom], 'main');
}
