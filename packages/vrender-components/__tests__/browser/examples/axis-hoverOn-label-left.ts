import { LinearScale, PointScale } from '@visactor/vscale';
import '@visactor/vrender';
import { GroupFadeIn, GroupFadeOut } from '@visactor/vrender';
import { LineAxis, GroupTransition } from '../../../src';
import render from '../../util/render';

const axis = new LineAxis({
  title: {
    space: -30,
    padding: 0,
    textStyle: {
      fontSize: 12,
      fill: '#363839',
      fontWeight: 'normal',
      fillOpacity: 1,
      textAlign: 'center',
      textBaseline: 'bottom'
    },
    visible: true,
    autoRotate: false,
    // angle: 1.7,
    shape: {},
    background: {
      visible: true,
      style: {
        fill: 'red'
      }
    },
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
    space: 0,
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
  labelHoverOnAxis: {
    visible: true,
    // position: 50,
    // autoRotate: false,
    // space: 10,
    // padding: 2,
    // textStyle: {
    //   fontSize: 12,
    //   fill: '#363839',
    //   fontWeight: 'normal',
    //   fillOpacity: 1,
    //   textAlign: 'right',
    //   textBaseline: 'middle'
    // },
    // background: {
    //   visible: true,
    //   style: {
    //     fill: 'red'
    //   }
    // },
    text: '细分'
    // maxWidth: 100
  },
  tick: {
    visible: true,
    inside: false,
    alignWithLabel: true,
    length: 2,
    style: {
      lineWidth: 1,
      stroke: '#D9DDE4',
      strokeOpacity: 1
    },
    state: null
  },
  subTick: {
    visible: true,
    inside: false,
    count: 4,
    length: 2,
    style: {
      lineWidth: 10,
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
  select: true,
  panel: {
    visible: true,
    state: {
      // hover: {
      //   fillOpacity: 0.08,
      //   fill: 'red'
      // },
      selected: {
        fillOpacity: 0.08,
        fill: 'blue'
      },
      selected_reverse: {
        fillOpacity: 0.08,
        fill: 'red'
      }
      // hover_reverse: {
      //   fillOpacity: 0.08,
      //   fill: '#141414'
      // }
    }
  },
  verticalFactor: 1,
  verticalLimitSize: 150,
  verticalMinSize: 150
});
window.axis = axis;
// axis.showLabelHoverOnAxis(130);
render([axis], 'main');
