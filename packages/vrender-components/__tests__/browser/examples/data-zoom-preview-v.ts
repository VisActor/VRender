import '@visactor/vrender';
import { IPointLike } from '@visactor/vutils';
import render from '../../util/render';
import { DataZoom } from '../../../src';

const data: any[] = [];
for (let i = 0; i < 6; i++) {
  data.push({
    x: 50 + 50 + i * 50,
    y: 235 + Math.random() * 30
  });
}

export function run() {
  console.log('DataZoom');

  const dataZoom = new DataZoom({
    start: 0.2,
    end: 0.5,
    position: {
      x: 50,
      y: 235
    },
    startHandlerStyle: {
      size: 100
    },
    size: {
      width: 400,
      height: 30
    },
    brushSelect: false,
    minSpan: 0.3,
    maxSpan: 0.6,
    delayTime: 0,
    zoomLock: false
  });
  dataZoom.setPreviewData(data);
  dataZoom.setPreviewPointsX(d => d.x);
  dataZoom.setPreviewPointsY(d => d.y);
  dataZoom.setPreviewPointsX1(d => d.x);
  dataZoom.setPreviewPointsY1(d => 265);

  const dataZoomdisableTriggerEvent = new DataZoom({
    start: 0.2,
    end: 0.5,
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
    },
    disableTriggerEvent: true
  });

  const stage = render([dataZoom, dataZoomdisableTriggerEvent], 'main');
}
