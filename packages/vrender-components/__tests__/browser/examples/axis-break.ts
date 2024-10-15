import '@visactor/vrender';
import { LineAxis } from '../../../src';
import render from '../../util/render';

const lineAxis = new LineAxis({
  x: 68,
  y: 30,
  start: {
    x: 0,
    y: 0
  },
  end: {
    x: 0,
    y: 400
  },
  pickable: true,
  visible: true,
  orient: 'left',
  line: {
    visible: false
  },
  label: {
    visible: true,
    inside: false,
    space: 12,
    autoLimit: true,
    style: {
      fontSize: 12,
      fill: '#89909d',
      fontWeight: 'normal',
      fillOpacity: 1
    },
    formatMethod: null
  },
  tick: {
    visible: false
  },
  subTick: {
    visible: false
  },
  title: {
    visible: false,
    text: 'visits',
    maxWidth: null
  },
  panel: {
    visible: false
  },
  verticalFactor: 1,
  items: [
    [
      {
        id: 0,
        label: 0,
        value: 1,
        rawValue: 0
      },
      {
        id: 500,
        label: 500,
        value: 0.780952380952381,
        rawValue: 500
      },
      {
        id: 1000,
        label: 1000,
        value: 0.5619047619047619,
        rawValue: 1000
      },
      {
        id: 1500,
        label: 1500,
        value: 0.3428571428571428,
        rawValue: 1500
      },
      {
        id: 2000,
        label: 2000,
        value: 0.12380952380952383,
        rawValue: 2000
      },
      {
        id: 24000,
        label: 24000,
        value: -0.0042307692307692315,
        rawValue: 24000
      }
    ]
  ],
  verticalLimitSize: 233.4,
  breaks: [
    {
      range: [0.1, 0.12],
      breakSymbol: {
        visible: true,
        style: {
          stroke: 'red',
          size: 20
        },
        angle: (15 * Math.PI) / 180
      }
    }
  ]
});

render([lineAxis], 'main');
