import { LinearScale, PointScale } from '@visactor/vscale';
import '@visactor/vrender';
import { GroupFadeIn, GroupFadeOut } from '@visactor/vrender';
import { LineAxis, GroupTransition } from '../../../src';
import render from '../../util/render';

const axis = new LineAxis({
  orient: 'left',
  hover: true,
  line: {
    visible: false,
    style: {
      lineWidth: 1,
      stroke: '#D9DDE4',
      strokeOpacity: 1
    }
  },
  label: {
    style: {
      fontSize: 12,
      fill: '#BCC1CB',
      fontWeight: 400,
      fillOpacity: 1,
      maxLineWidth: 80,
      angle: 0
    },
    formatMethod: null,
    state: null,
    visible: true,
    space: 0,
    autoLimit: false,
    flush: true,
    containerAlign: 'right',
    minGap: 1,
    autoHide: false,
    autoHideMethod: 'greedy',
    autoHideSeparation: 1,
    autoRotate: false,
    autoRotateAngle: [0, -45, -90],
    lastVisible: true
  },
  tick: {
    visible: false,
    length: 4,
    inside: false,
    style: {
      lineWidth: 1,
      stroke: '#21252C',
      strokeOpacity: 1
    },
    state: null
  },
  subTick: {
    visible: false,
    length: 2,
    style: {
      lineWidth: 1,
      stroke: '#D9DDE4',
      strokeOpacity: 1
    },
    state: null
  },
  grid: {
    type: 'line',
    visible: false,
    style: {
      lineWidth: 1,
      stroke: '#E3E5EB',
      strokeOpacity: 1,
      lineDash: [4, 2]
    }
  },
  subGrid: {
    type: 'line',
    visible: false,
    style: {
      lineWidth: 1,
      stroke: '#EBEDF2',
      strokeOpacity: 1,
      lineDash: [4, 4]
    }
  },
  title: {
    visible: false,
    space: 10,
    autoRotate: false,
    angle: -1.5707963267948966,
    textStyle: {
      textAlign: 'center',
      textBaseline: 'bottom',
      fontSize: 12,
      fill: '#606773',
      fontWeight: 400,
      fillOpacity: 1
    },
    shape: {},
    background: {},
    state: {
      text: null,
      shape: null,
      background: null
    },
    text: 'order_date',
    maxWidth: null
  },
  panel: {
    state: null
  },
  labelHoverOnAxis: {
    visible: true
  },
  x: 140,
  y: 0,
  start: {
    x: 0,
    y: 0
  },
  end: {
    x: 0,
    y: 427
  },
  items: [
    [
      {
        id: '2016-01-01',
        label: '2016-01-01',
        value: 0.1308139534883721,
        rawValue: '2016-01-01'
      },
      {
        id: '2017-01-01',
        label: '2017-01-01',
        value: 0.37693798449612403,
        rawValue: '2017-01-01'
      },
      {
        id: '2018-01-01',
        label: '2018-01-01',
        value: 0.623062015503876,
        rawValue: '2018-01-01'
      },
      {
        id: '2019-01-01',
        label: '2019-',
        value: 0.8691860465116279,
        rawValue: '2019-01-01'
      }
    ]
  ],
  verticalLimitSize: 66,
  verticalMinSize: 66,
  verticalFactor: 1
});
window.axis = axis;
debugger;
setTimeout(() => {
  axis.showLabelHoverOnAxis(390, '2016-01-01');
}, 100);
render([axis], 'main');
