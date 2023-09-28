import render from '../../util/render';
import '@visactor/vrender';
import { CircleCrosshair } from '../../../src';

export function run() {
  console.log('CircleCrosshair');
  const crosshair = new CircleCrosshair({
    center: {
      x: 250,
      y: 250
    },
    radius: 100,
    startAngle: Math.PI,
    endAngle: Math.PI * 2
  });
  const stage = render([crosshair], 'main');

  stage.addEventListener('pointermove', e => {
    crosshair.setLocation({
      x: e.viewX,
      y: e.viewY
    });
  });
}
