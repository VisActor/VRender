import GUI from 'lil-gui';
import { IPointLike, degreeToRadian } from '@visactor/vutils';
import render from '../../util/render';
import { MarkLine } from '../../../src';
import { getInsertPoints, getTextOffset } from '../../util/graphic';

export function run() {
  const markLine = new MarkLine({
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
      symbolType: 'triangleLeft',
      size: 12,
      fill: 'rgba(46, 47, 50)',
      lineWidth: 0,
      style: {
        stroke: null,
        lineWidth: 0,
        fill: 'rgba(46, 47, 50)'
      },
      refX: 6,
      autoRotate: false
    },
    label: {
      position: 'end',
      refX: 12,
      refY: 0,
      refAngle: 0,
      textStyle: {
        fill: '#000',
        stroke: '#ffffff',
        lineWidth: 0,
        fontSize: 14,
        fontWeight: 'normal',
        fontStyle: 'normal'
      },
      padding: [2, 2, 4, 4],
      panel: {
        visible: false,
        cornerRadius: 0,
        fill: 'rgb(48, 115, 242)',
        fillOpacity: 0.8
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
          fill: 'rgb(48, 115, 242)'
        },
        visible: false
      },
      visible: true,
      autoRotate: false,
      shape: {
        visible: false
      },
      text: 34155
    },
    lineStyle: {
      stroke: '#000',
      lineWidth: 1,
      lineDash: [3, 3]
    },
    zIndex: 500,
    interactive: true,
    points: [
      {
        x: 50,
        y: 367.40109466666667
      },
      {
        x: 300,
        y: 367.40109466666667
      }
    ],
    clipInRange: false,
    dx: 0,
    dy: 0
  });

  const markLines = [markLine];

  const stage = render(markLines, 'main');
}
