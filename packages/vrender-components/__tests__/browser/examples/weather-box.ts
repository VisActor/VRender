import { DefaultTicker, DefaultTimeline, vglobal } from '@visactor/vrender-core';
import '@visactor/vrender';
import { IPointLike } from '@visactor/vutils';
import render from '../../util/render';
import { WeatherBox } from '../../../src';

export function run() {
  console.log('RectCrosshair');

  const timeline = new DefaultTimeline();
  const ticker = new DefaultTicker([timeline]);
  // ticker.init();
  ticker.autoStop = false;

  const TICKER_FPS = 60;
  ticker.setFPS(TICKER_FPS);
  setTimeout(() => {
    ticker.start(true);
  });

  const obj = {
    rainStyle: {
      background: 'rgb(135, 160, 225)'
    },
    snowStyle: {
      background: 'rgb(64, 68, 144)'
    },
    rainSnowStyle: {
      background: 'rgb(130, 190, 210)'
    },
    defaultStyle: {
      background: 'rgb(184, 206, 239)'
    }
  };

  const weatherBox = new WeatherBox(
    {
      width: 100,
      height: 100,
      rainRatio: 1,
      snowRatio: 0.5,
      windRatio: 0.5,
      rainCountThreshold: 15,
      snowCountThreshold: 10,
      windSpeed: 3,
      background: obj.rainSnowStyle.background,
      windStyle: {
        stroke: 'rgba(255, 255, 255, 0.8)'
      },
      snowRainBottomPadding: 30,
      windAnimateEffect: 'clipRange'
    },
    { timeline }
  );

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
