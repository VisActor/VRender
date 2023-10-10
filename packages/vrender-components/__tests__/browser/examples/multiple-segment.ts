import { degreeToRadian } from '@visactor/vutils';
import '@visactor/vrender';
import render from '../../util/render';
import { Segment } from '../../../src';
import { getInsertPoints } from '../../util/graphic';

export function run() {
  const startPoint = { x: 50, y: 150 };
  const endPoint = { x: 250, y: 350 };
  const direction = 'right';
  const offset = 30;

  const insertPoints = getInsertPoints(startPoint, endPoint, direction, offset);

  const segment = new Segment({
    points: [
      [insertPoints[0], insertPoints[1]],
      [insertPoints[1], insertPoints[2]],
      [insertPoints[2], insertPoints[3]]
    ],
    lineStyle: [
      {
        lineWidth: 2,
        lineDash: [2, 2],
        stroke: '#999'
      },
      {
        lineWidth: 2,
        stroke: '#08979c'
      },
      {
        lineWidth: 2,
        lineDash: [2, 2],
        stroke: '#999'
      }
    ],
    multiSegment: true,
    mainSegmentIndex: 1,
    startSymbol: {
      visible: true,
      size: 12,
      refX: -6
    },
    endSymbol: {
      visible: true,
      size: 12,
      refX: -6
    }
  });

  render([segment], 'main');
  window.segment = segment;
}
