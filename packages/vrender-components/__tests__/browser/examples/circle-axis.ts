import { LinearScale, BandScale } from '@visactor/vscale';
import { LineAxis, CircleAxis, GroupTransition } from '../../../src';
import render from '../../util/render';

const scale = new LinearScale().domain([0, 100]).range([0, 1]).nice();
const items = scale.ticks(10).map(tick => {
  return {
    id: tick,
    label: tick,
    value: scale.scale(tick),
    rawValue: tick
  };
});

const scale1 = new LinearScale().domain([0, 200]).range([0, 1]).nice();
const items1 = scale.ticks(10).map(tick => {
  return {
    id: tick,
    label: tick,
    value: scale1.scale(tick),
    rawValue: tick
  };
});

const domain = 'ABCDEFGH'.split('');
const bandScale = new BandScale().domain(domain).range([0, 1]);
const xItems = domain.map(value => {
  return {
    id: value,
    label: value,
    value: bandScale.scale(value),
    rawValue: value
  };
});
const nextItems = 'BDFH'.split('').map(value => {
  return {
    id: value,
    label: value,
    value: bandScale.scale(value),
    rawValue: value
  };
});

const stateStyle = {
  hover: {
    fillColor: 'blue',
    fontWeight: 500
  },
  hover_reverse: {
    fillColor: 'yellow',
    fontWeight: 500
  },
  selected: {
    fillColor: 'red',
    fontSize: 16
  },
  selected_reverse: {
    fillColor: '#ccc'
  }
};
const radiusAxis = new LineAxis({
  start: { x: 350, y: 250 },
  end: { x: 450, y: 250 },
  items: [items],
  label: {
    visible: true
  },
  grid: {
    visible: true,
    type: 'circle',
    center: { x: 250, y: 250 },
    style: {
      lineDash: [0]
    },
    sides: 8,
    closed: true
  },
  subGrid: {
    visible: false,
    style: {
      strokeColor: 'red'
    }
  }
});

const angleAxis = new CircleAxis({
  center: {
    x: 250,
    y: 250
  },
  radius: 200,
  innerRadius: 100,
  inside: true,
  items: [xItems],
  subTick: {
    visible: true,
    length: 5
  },
  title: {
    visible: true,
    text: '我是标题',
    shape: {
      visible: true,
      space: 10,
      style: {
        symbolType: 'circle',
        fillColor: 'red'
      }
    },
    background: {
      visible: true,
      style: {
        fillColor: 'rgba(0, 0, 0, 0.3)'
      }
    },
    state: {
      text: stateStyle,
      shape: stateStyle,
      background: stateStyle
    }
  },
  grid: {
    type: 'line',
    visible: true,
    // alternateColor: ['rgba(0, 0, 0, 0.3)', 'rgba(200, 0, 0, 0.3)'],
    smoothLink: true
    // alignWithLabel: false
  },
  subGrid: {
    visible: true
    // alternateColor: ['rgba(0, 0, 0, 0.3)', 'rgba(200, 0, 0, 0.3)']
  },
  hover: true,
  select: true,
  label: {
    visible: true,
    state: stateStyle
  }
});

const stage = render([angleAxis], 'main');

setTimeout(() => {
  angleAxis.setAttributes({
    items: [xItems, nextItems]
  });
  angleAxis.animate().play(new GroupTransition(null, null, 1000, 'linear'));
}, 1000);

console.log(angleAxis);
