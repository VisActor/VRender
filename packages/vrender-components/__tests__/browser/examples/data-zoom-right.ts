import '@visactor/vrender';
import { IPointLike } from '@visactor/vutils';
import render from '../../util/render';
import { DataZoom } from '../../../src';

export function run() {
  console.log('RectCrosshair');

  const dataZoom = new DataZoom({
    orient: 'right',
    start: 0.2,
    end: 0.5,
    brushSelect: false,
    position: {
      x: 235,
      y: 50
    },
    size: {
      width: 30,
      height: 400
    }
  });

  const stage = render([dataZoom], 'main');

  // stage.addEventListener('pointermove', e => {
  //   dataZoom.setLocation({
  //     start: { x: 30, y: e.viewY - 50 },
  //     end: { x: 330, y: e.viewY + 50 }
  //   });
  // });
}
