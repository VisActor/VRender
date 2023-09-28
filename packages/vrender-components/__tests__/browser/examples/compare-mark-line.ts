import GUI from 'lil-gui';
import '@visactor/vrender';
import { IPointLike, degreeToRadian } from '@visactor/vutils';
import render from '../../util/render';
import { MarkLine } from '../../../src';
import { getInsertPoints, getTextOffset } from '../../util/graphic';

export function run() {
  const startPoint = { x: 10, y: 150 };
  const endPoint = { x: 250, y: 350 };
  const direction = 'left';
  const offset = 15;

  const insertPoints = getInsertPoints(startPoint, endPoint, direction, offset);
  console.log([
    [insertPoints[0], insertPoints[1]],
    [insertPoints[1], insertPoints[2]],
    [insertPoints[2], insertPoints[3]]
  ]);
  const markLine = new MarkLine({
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
      // symbolType: 'circle',
      refX: -5,
      size: 10,
      style: {
        fill: 'red'
      }
    },
    endSymbol: {
      visible: true,
      // symbolType: 'circle',
      size: 10,
      refX: -5,

      style: {
        fill: 'blue'
      }
    },
    label: {
      text: '平均值: 17.7',
      position: 'middle',
      autoRotate: false,
      textStyle: {
        textAlign: 'center'
      },
      confine: true
      // ...getTextOffset(startPoint, endPoint, direction, offset)
    },
    limitRect: {
      x: 0,
      y: 50,
      width: 200,
      height: 200
    }
  });

  const markLines = [markLine];

  const stage = render(markLines, 'main');

  markLine.setAttributes({
    points: [
      [
        {
          x: 50,
          y: 150
        },
        {
          x: 35,
          y: 150
        }
      ],
      [
        {
          x: 35,
          y: 150
        },
        {
          x: 35,
          y: 350
        }
      ],
      [
        {
          x: 35,
          y: 350
        },
        {
          x: 250,
          y: 350
        }
      ]
    ]
  });
}
