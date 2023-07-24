import { pi } from '@visactor/vutils';
import { BandScale, LinearScale, PointScale } from '@visactor/vscale';
import { CircleAxis, LineAxis } from '../../../src';
import render from '../../util/render';

const axis = new LineAxis({
  title: {
    space: 10,
    padding: 0,
    textStyle: {
      fontSize: 14,
      fill: '#333333',
      fontWeight: 'normal',
      fillOpacity: 1
    },
    autoRotate: false,
    shape: {},
    background: {},
    text: 'x'
  },
  label: {
    visible: true,
    inside: false,
    space: 10,
    style: {
      fontSize: 14,
      fill: '#89909D',
      fontWeight: 'normal',
      fillOpacity: 1
    },
    state: {
      hover_reverse: {
        fill: '#444'
      },
      selected_reverse: {
        fill: '#444'
      },
      selected: datum => {
        if (datum.label === '2000') {
          return {
            fill: 'red'
          };
        }
        return {
          fill: 'yellow'
        };
      }
    },
    autoRotate: false,
    autoHide: false,
    autoLimit: false
  },
  tick: {
    visible: true,
    inside: false,
    alignWithLabel: true,
    length: 4,
    style: {
      lineWidth: 1,
      stroke: '#D9DDE4',
      strokeOpacity: 1
    }
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
    }
  },
  line: {
    visible: true,
    style: {
      lineWidth: 1,
      stroke: '#D9DDE4',
      strokeOpacity: 1
    }
  },
  grid: {
    style: {
      lineWidth: 1,
      stroke: '#EBEDF2',
      strokeOpacity: 1,
      lineDash: []
    },
    visible: false,
    length: 448,
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
    }
  },
  x: 58,
  y: 460,
  start: {
    x: 0,
    y: 0
  },
  end: {
    x: 430,
    y: 0
  },
  items: [
    [
      {
        id: '1990',
        label: '1990',
        value: 0.11538461538461531,
        rawValue: '1990'
      },
      {
        id: '1995',
        label: '1995',
        value: 0.26923076923076916,
        rawValue: '1995'
      },
      {
        id: '2000',
        label: '2000',
        value: 0.423076923076923,
        rawValue: '2000'
      },
      {
        id: '2005',
        label: '2005',
        value: 0.5769230769230769,
        rawValue: '2005'
      },
      {
        id: '2010',
        label: '2010',
        value: 0.7307692307692307,
        rawValue: '2010'
      },
      {
        id: '2015',
        label: '2015',
        value: 0.8846153846153847,
        rawValue: '2015'
      }
    ]
  ],
  visible: true,
  pickable: true,
  orient: 'bottom',
  select: true,
  hover: true,
  panel: {
    visible: true,
    style: {
      fillOpacity: 0
    },
    state: {
      hover: {
        fillOpacity: 0.65,
        fill: '#DDE3E9',
        cursor: 'pointer'
      },
      selected: {
        fillOpacity: 0.65,
        fill: '#9CCBDB',
        cursor: 'pointer'
      }
    }
  },
  verticalFactor: 1,
  verticalLimitSize: 150
});

render([axis], 'main');
