import GUI from 'lil-gui';
import { IPointLike, degreeToRadian } from '@visactor/vutils';
import render from '../../util/render';
import { MarkArea } from '../../../src';
import { MarkAreaInteraction } from './mark-interaction';
import { getInsertPoints, getTextOffset } from '../../util/graphic';

export function run() {
  const vmarkArea = new MarkArea({
    label: {
      position: 'top',
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
        visible: false
      },
      text: 'sss',
      shape: {
        visible: false
      }
    },
    areaStyle: {
      fill: '#005DFF',
      visible: true,
      fillOpacity: '0.1'
    },
    zIndex: 100,
    interactive: true,
    points: [
      {
        x: 178.9545454545454,
        y: 420
      },
      {
        x: 178.9545454545454,
        y: 112
      },
      {
        x: 316.2272727272727,
        y: 112
      },
      {
        x: 316.2272727272727,
        y: 420
      }
    ],
    clipInRange: false,
    dx: 0,
    dy: 0
  });
  const hmarkArea = new MarkArea({
    label: {
      position: 'right',
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
        visible: false
      },
      text: 'sss',
      shape: {
        visible: false
      }
    },
    areaStyle: {
      fill: '#005DFF',
      visible: true,
      fillOpacity: '0.1'
    },
    interactive: true,
    points: [
      {
        x: 178.9545454545454,
        y: 420
      },
      {
        x: 178.9545454545454,
        y: 112
      },
      {
        x: 316.2272727272727,
        y: 112
      },
      {
        x: 316.2272727272727,
        y: 420
      }
    ],
    clipInRange: false
  });

  const markLines = [hmarkArea];

  const stage = render(markLines, 'main');

  // new MarkAreaInteraction({
  //   element: vmarkArea,
  //   orient: 'vertical'
  // });

  const interaction = new MarkAreaInteraction({
    element: hmarkArea,
    orient: 'horizontal'
  });
  window.interaction = interaction;
}
