import { vglobal } from '@visactor/vrender-core';
import '@visactor/vrender';
import { IPointLike } from '@visactor/vutils';
import render from '../../util/render';
import { WeatherBox } from '../../../src';

export function run() {
  console.log('RectCrosshair');

  const weatherBox = new WeatherBox({
    width: 100,
    height: 100,
    rainRatio: 1,
    snowRatio: 0.5,
    windRatio: 0.5,
    rainCountThreshold: 15,
    snowCountThreshold: 10
  });

  vglobal.supportsPointerEvents = false;

  const stage = render([weatherBox as any], 'main');
  stage.defaultLayer.scale(1.5, 1.5);
  stage.x = 10;

  // stage.addEventListener('pointermove', e => {
  //   dataZoom.setLocation({
  //     start: { x: 30, y: e.viewY - 50 },
  //     end: { x: 330, y: e.viewY + 50 }
  //   });
  // });
}
