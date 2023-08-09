import { LinearScale, PointScale } from '@visactor/vscale';
import { GroupFadeIn, GroupFadeOut } from '@visactor/vrender';
import { LineAxis, GroupTransition } from '../../../src';
import render from '../../util/render';

const axis = new LineAxis({
  title: {
    space: 20,
    padding: 0,
    textStyle: {
      fontSize: 12,
      fill: '#363839',
      fontWeight: 'normal',
      fillOpacity: 1,
      textAlign: 'center',
      textBaseline: 'bottom'
    },
    visible: false,
    autoRotate: false,
    angle: -1.5707963267948966,
    shape: {},
    background: {},
    state: {
      text: null,
      shape: null,
      background: null
    },
    text: '细分',
    maxWidth: null
  },
  label: {
    visible: true,
    inside: false,
    space: 20,
    padding: 0,
    style: {
      fontSize: 12,
      fill: '#6F6F6F',
      fontWeight: 'normal',
      fillOpacity: 1,
      angle: 0,
      textAlign: 'center'
    },
    formatMethod: null,
    state: null,
    autoRotate: false,
    autoHide: false,
    autoLimit: false,
    containerAlign: 'center'
  },
  tick: {
    visible: false,
    inside: false,
    alignWithLabel: true,
    length: 4,
    style: {
      lineWidth: 1,
      stroke: '#D9DDE4',
      strokeOpacity: 1
    },
    state: null
  },
  subTick: {
    visible: false,
    inside: false,
    count: 4,
    length: 2,
    style: {
      lineWidth: 1,
      stroke: '#D9DDE4',
      strokeOpacity: 1
    },
    state: null
  },
  line: {
    visible: true,
    style: {
      lineWidth: 1,
      stroke: '#989999',
      strokeOpacity: 1
    },
    startSymbol: {},
    endSymbol: {}
  },
  grid: {
    style: {
      lineWidth: 1,
      stroke: '#DADCDD',
      strokeOpacity: 1,
      lineDash: [4, 2]
    },
    visible: false,
    length: 461,
    type: 'line',
    depth: 0
  },
  subGrid: {
    visible: false,
    style: {
      lineWidth: 1,
      stroke: '#EBEDF2',
      strokeOpacity: 1,
      lineDash: [4, 4]
    },
    type: 'line'
  },
  x: 397,
  y: 12,
  start: {
    x: 0,
    y: 0
  },
  end: {
    x: 0,
    y: 327
  },
  items: [
    [
      {
        id: '消费者',
        label: '消费者',
        value: 0.8333333333333334,
        rawValue: '消费者'
      },
      {
        id: '公司',
        label: '公司',
        value: 0.4999999999999999,
        rawValue: '公司'
      },
      {
        id: '小型企业',
        label: '小型企业',
        value: 0.1666666666666666,
        rawValue: '小型企业'
      }
    ]
  ],
  visible: true,
  pickable: true,
  orient: 'left',
  hover: true,
  panel: {
    visible: true,
    state: {
      hover: {
        fillOpacity: 0.08,
        fill: '#141414'
      },
      hover_reverse: {
        fillOpacity: 0.08,
        fill: '#141414'
      }
    }
  },
  verticalFactor: 1,
  verticalLimitSize: 150,
  verticalMinSize: 150
});

render([axis], 'main');
