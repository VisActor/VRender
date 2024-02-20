import { vglobal } from '@visactor/vrender-core';
import '@visactor/vrender';
import { IPointLike } from '@visactor/vutils';
import render from '../../util/render';
import { DataZoom } from '../../../src';

export function run() {
  console.log('RectCrosshair');

  const dataZoom = new DataZoom({
    start: 0.2,
    end: 0.5,
    minSpan: 0.25,
    // maxSpan: 0.5,
    position: {
      x: 50,
      y: 235
    },
    size: {
      width: 400,
      height: 30
    },
    showDetail: true,
    // delayTime: 100,
    realTime: false,
    // brushSelect: false,
    backgroundChartStyle: {
      line: {
        visible: false
      },
      area: {
        visible: false
      }
    },
    middleHandlerStyle: {
      visible: true
    }
  });

  const dataZoomdisableTriggerEvent = new DataZoom({
    start: 0.2,
    end: 0.5,
    maxSpan: 0.4,
    position: {
      x: 50,
      y: 75
    },
    size: {
      width: 400,
      height: 30
    },
    // brushSelect: false,
    backgroundChartStyle: {
      line: {
        visible: false
      },
      area: {
        visible: false
      }
    },
    middleHandlerStyle: {
      visible: true
    }
    // disableTriggerEvent: true
  });

  vglobal.supportsPointerEvents = false;

  const stage = render([dataZoom], 'main');

  // stage.addEventListener('pointermove', e => {
  //   dataZoom.setLocation({
  //     start: { x: 30, y: e.viewY - 50 },
  //     end: { x: 330, y: e.viewY + 50 }
  //   });
  // });
}
