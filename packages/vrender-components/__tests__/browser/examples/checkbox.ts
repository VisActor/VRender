import '@visactor/vrender';
import { IPointLike } from '@visactor/vutils';
import render from '../../util/render';
import { CheckBox } from '../../../src';
import { createLine } from '@visactor/vrender-core';

export function run() {
  // const checkbox = new CheckBox({
  //   x: 100,
  //   y: 100,
  //   text: {
  //     text: 'checkbox'
  //   },
  //   checked: false,
  //   disabled: true
  // });

  const l = createLine({
    segments: [
      {
        visible: true,
        lineWidth: 1,
        lineDash: [1, 0],
        stroke: '#468DFF',
        points: [
          { x: 5.776942533605235, y: 239.21, context: 0 },
          { x: 13.47953257841222, y: 377.70000000000005, context: 1 },
          { x: 21.182122623219207, y: 283.27500000000003, context: 2 },
          { x: 28.884712668026193, y: 270.68500000000006, context: 3 },
          { x: 36.58730271283318, y: 251.8, context: 4 },
          { x: 44.28989275764016, y: 207.73499999999999, context: 5 },
          { x: 51.99248280244715, y: 176.25999999999993, context: 6 },
          { x: 59.69507284725414, y: 107.01500000000003, context: 7 }
        ]
      },
      {
        visible: true,
        lineWidth: 1,
        lineDash: [4, 4],
        stroke: '#468DFF',
        points: [{ x: 59.69507284725414, y: 107.01500000000003, context: 7 }]
      }
    ],
    stroke: true,
    points: null,
    pickable: true
  });

  const stage = render([l], 'main');
}
