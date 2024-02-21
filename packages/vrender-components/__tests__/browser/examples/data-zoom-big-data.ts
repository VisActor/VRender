import { vglobal } from '@visactor/vrender-core';
import '@visactor/vrender';
import { IPointLike, getScaleY } from '@visactor/vutils';
import render from '../../util/render';
import { DataZoom } from '../../../src';
import data from '../data-zoom-big-data.json';
import { BandScale, LinearScale } from '@visactor/vscale';

export function run() {
  console.log('RectCrosshair');

  const scaleX = new BandScale().domain(data.map(d => d.x)).range([50, 450] as any);
  const scaleY = new LinearScale().domain([0, 500]).range([265, 235]);

  const dataZoom = new DataZoom({
    start: 0.2,
    end: 0.5,
    position: {
      x: 50,
      y: 235
    },
    size: {
      width: 400,
      height: 30
    },
    showDetail: false,
    // delayTime: 100,
    // brushSelect: false,
    selectedBackgroundChartStyle: {
      line: {
        visible: false
      },
      area: {
        visible: false
      }
    },
    backgroundChartStyle: {
      line: {
        stroke: 'red',
        visible: false
      },
      area: {
        fill: 'red'
      }
    },
    middleHandlerStyle: {
      visible: true
    },
    previewData: data,
    previewPointsX: d => scaleX.scale(d.x),
    previewPointsY: d => scaleY.scale(d.y),
    previewPointsX1: d => scaleX.scale(d.x),
    previewPointsY1: d => scaleY.scale(265),
    tolerance: 4
  });

  console.log('datazoom', dataZoom);

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

  const stage = render([dataZoom, dataZoomdisableTriggerEvent], 'main');

  // stage.addEventListener('pointermove', e => {
  //   dataZoom.setLocation({
  //     start: { x: 30, y: e.viewY - 50 },
  //     end: { x: 330, y: e.viewY + 50 }
  //   });
  // });
}
