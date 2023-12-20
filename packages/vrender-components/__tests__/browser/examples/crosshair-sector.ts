import '@visactor/vrender';
import render from '../../util/render';
import { SectorCrosshair } from '../../../src';

export function run() {
  console.log('SectorCrosshair');
  const startAngle = 1.3 * Math.PI;
  const endAngle = 1.7 * Math.PI;
  const crosshair = new SectorCrosshair({
    center: {
      x: 250,
      y: 250
    },
    radius: 100,
    innerRadius: 30,
    startAngle,
    endAngle
  });

  const stage = render([crosshair], 'main');

  stage.addEventListener('pointermove', e => {
    crosshair.setLocation({
      x: e.viewX,
      y: e.viewY
    });
  });
}
