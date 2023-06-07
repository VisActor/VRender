import render from '../../util/render';
import { PolygonCrosshair } from '../../../src';

export function run() {
  console.log('PolygonCrosshair');
  const crosshair = new PolygonCrosshair({
    center: {
      x: 250,
      y: 250
    },
    radius: 100,
    startAngle: 0,
    endAngle: Math.PI * 2,
    sides: 10
  });

  const stage = render([crosshair], 'main');

  stage.addEventListener('pointermove', e => {
    crosshair.setLocation({
      x: e.viewX,
      y: e.viewY
    });
  });
}
