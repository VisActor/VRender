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

  const markLine1 = new MarkLine({
    points: getInsertPoints(startPoint, endPoint, 'top', 30),
    startSymbol: {
      visible: true
    },
    lineStyle: {
      cornerRadius: 10,
      lineDash: [0]
    },
    dy: -30
  });

  const markLine2 = new MarkLine({
    startSymbol: {
      visible: false,
      symbolType: 'triangle',
      size: 10,
      fill: 'rgba(46, 47, 50)',
      lineWidth: 0,
      style: {
        stroke: null,
        lineWidth: 0,
        fill: 'rgba(46, 47, 50)'
      }
    },
    endSymbol: {
      visible: true,
      symbolType: 'triangle',
      size: 10,
      fill: 'rgba(46, 47, 50)',
      lineWidth: 0,
      style: {
        stroke: null,
        lineWidth: 0,
        fill: 'rgba(46, 47, 50)'
      }
    },
    label: {
      position: 'start',
      refX: 0,
      refY: 0,
      refAngle: 0,
      textStyle: {
        fill: '#000',
        stroke: '#ffffff',
        lineWidth: 0,
        fontSize: 14,
        fontWeight: 'normal',
        fontStyle: 'normal',
        textAlign: 'center',
        textBaseline: 'middle'
      },
      padding: [2, 2, 4, 4],
      panel: {
        visible: true,
        cornerRadius: 0,
        fill: 'rgb(48, 115, 242)',
        fillOpacity: 1
      },
      style: {
        fontSize: 14,
        fontWeight: 'normal',
        fontStyle: 'normal',
        fill: '#000',
        stroke: '#ffffff',
        lineWidth: 0
      },
      labelBackground: {
        padding: {
          top: 2,
          bottom: 2,
          right: 4,
          left: 4
        },
        style: {
          cornerRadius: 0,
          fill: 'rgb(48, 115, 242)',
          fillOpacity: 1
        },
        visible: true
      },
      shape: {
        visible: false
      },
      text: 'sss',
      autoRotate: false,
      dx: 101.63636363636364,
      dy: -83.89999999999998,
      efX: 0
    },
    lineStyle: {
      stroke: 'rgba(46, 47, 50)',
      lineWidth: 2,
      lineDash: [0],
      cornerRadius: 10
    },
    zIndex: 500,
    interactive: false,
    points: [
      {
        x: 115.22727272727272,
        y: 215.39999999999998
      },
      {
        x: 115.22727272727272,
        y: 131.5
      },
      {
        x: 318.5,
        y: 131.5
      },
      {
        x: 318.5,
        y: 181.5
      }
    ],
    clipInRange: false,
    pickable: false,
    childrenPickable: false,
    dx: 0,
    dy: 0
  });

  const markLines = [markLine, markLine1, markLine2];

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
