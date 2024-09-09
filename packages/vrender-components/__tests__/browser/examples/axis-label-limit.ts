import { createStage } from '@visactor/vrender-core';
import { initBrowserEnv } from '@visactor/vrender-kits';
initBrowserEnv();
import { PointScale } from '@visactor/vscale';
import { LineAxis } from '../../../src';

const stage = createStage({
  canvas: 'main',
  width: 2000,
  height: 1200,
  autoRender: true,
  disableDirtyBounds: true,
  enableHtmlAttribute: true
});

(window as any).stage = stage;

const deltaAngle = Math.PI / 4;
const count = (Math.PI * 2) / deltaAngle;

{
  let curX = 78;
  for (let i = 0; i < count; i++) {
    const axis = new LineAxis({
      x: curX,
      y: 27,
      start: {
        x: 0,
        y: 0
      },
      end: {
        x: 162,
        y: 0
      },
      visible: true,
      pickable: true,
      orient: 'bottom',
      line: {
        visible: true,
        style: {
          lineWidth: 1,
          stroke: '#d9dde4',
          strokeOpacity: 1
        }
      },
      label: {
        visible: true,
        inside: false,
        space: 8,
        autoLimit: true,
        autoRotate: false,
        overflowLimitLength: {
          left: 78,
          right: 20
        },
        style: {
          fontSize: 12,
          fill: '#89909d',
          fontWeight: 'normal',
          fillOpacity: 1,
          angle: i * deltaAngle
        }
      },
      tick: {
        visible: true,
        length: 4,
        inside: false,
        alignWithLabel: true,
        style: {
          lineWidth: 1,
          stroke: '#d9dde4',
          strokeOpacity: 1
        }
      },
      subTick: {
        visible: false
      },
      title: {
        visible: false,
        text: 'month',
        maxWidth: null
      },
      panel: {
        visible: false
      },
      verticalFactor: 1,
      items: [
        [
          {
            id: 'MondayMondayMondayMondayMondayMondayMondayMondayMondayMondayMondayMondayMondayMondayMondayMonday',
            label: 'MondayMondayMondayMondayMondayMondayMondayMondayMondayMondayMondayMondayMondayMondayMondayMonday',
            value: 0.13636363636363633,
            rawValue: 'MondayMondayMondayMondayMondayMondayMondayMondayMondayMondayMondayMondayMondayMondayMondayMonday'
          },
          {
            id: 'TuesdayTuesdayTuesdayTuesdayTuesdayTuesdayTuesdayTuesdayTuesdayTuesdayTuesdayTuesday',
            label: 'TuesdayTuesdayTuesdayTuesdayTuesdayTuesdayTuesdayTuesdayTuesdayTuesdayTuesdayTuesday',
            value: 0.3181818181818181,
            rawValue: 'TuesdayTuesdayTuesdayTuesdayTuesdayTuesdayTuesdayTuesdayTuesdayTuesdayTuesdayTuesday'
          },
          {
            id: 'WednesdayWednesdayWednesday',
            label: 'WednesdayWednesdayWednesday',
            value: 0.4999999999999999,
            rawValue: 'WednesdayWednesdayWednesday'
          },
          {
            id: 'ThursdayThursdayThursday',
            label: 'ThursdayThursdayThursday',
            value: 0.6818181818181818,
            rawValue: 'ThursdayThursdayThursday'
          },
          {
            id: 'FridayFridayFridayFriday',
            label: 'FridayFridayFridayFriday',
            value: 0.8636363636363636,
            rawValue: 'FridayFridayFridayFriday'
          }
        ]
      ],
      verticalLimitSize: 267.6,
      verticalMinSize: null,
      _debug_bounds: true
    });
    stage.defaultLayer.add(axis);
    if ((axis as any).AABBBounds.x1 < curX) {
      axis.setAttributes({ dx: curX - (axis as any).AABBBounds.x1 });
    }
    curX = (axis as any).AABBBounds.x2 + 10;
  }
}

stage.render();
