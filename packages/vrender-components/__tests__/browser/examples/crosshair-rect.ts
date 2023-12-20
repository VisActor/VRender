import '@visactor/vrender';
import render from '../../util/render';
import { RectCrosshair } from '../../../src';

export function run() {
  console.log('RectCrosshair');

  const crosshair = new RectCrosshair({
    start: {
      x: 30,
      y: 30
    },
    end: {
      x: 330,
      y: 130
    }
  });

  const stage = render([crosshair], 'main');

  stage.addEventListener('pointermove', e => {
    crosshair.setLocation({
      start: { x: 30, y: e.viewY - 50 },
      end: { x: 330, y: e.viewY + 50 }
    });
  });
}
