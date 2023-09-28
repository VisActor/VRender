import { LinearScale, BandScale } from '@visactor/vscale';
import '@visactor/vrender';
import { LineAxis, CircleAxis, GroupTransition, LineAxisGrid, CircleAxisGrid } from '../../../src';
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
    fill: 'blue',
    fontWeight: 500
  },
  hover_reverse: {
    fill: 'yellow',
    fontWeight: 500
  },
  selected: {
    fill: 'red',
    fontSize: 16
  },
  selected_reverse: {
    fill: '#ccc'
  }
};
const radiusAxis = new LineAxis({
  start: { x: 350, y: 250 },
  end: { x: 450, y: 250 },
  items: [items],
  label: {
    visible: true,
    autoHide: true
  }
});
const radiusAxisGrid = new LineAxisGrid({
  start: { x: 350, y: 250 },
  end: { x: 450, y: 250 },
  items,
  type: 'circle',
  center: { x: 250, y: 250 },
  style: {
    lineDash: [0]
  },
  sides: 8,
  closed: true,
  subGrid: {
    visible: false,
    style: {
      stroke: 'red'
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
        fill: 'red'
      }
    },
    background: {
      visible: true,
      style: {
        fill: 'rgba(0, 0, 0, 0.3)'
      }
    },
    state: {
      text: stateStyle,
      shape: stateStyle,
      background: stateStyle
    }
  },
  hover: true,
  select: true,
  label: {
    visible: true,
    state: stateStyle
  }
});

const angleAxisGrid = new CircleAxisGrid({
  center: {
    x: 250,
    y: 250
  },
  radius: 200,
  innerRadius: 100,
  inside: true,
  items: xItems,
  type: 'line',
  visible: true,
  // alternateColor: ['rgba(0, 0, 0, 0.3)', 'rgba(200, 0, 0, 0.3)'],
  smoothLink: true,
  // alignWithLabel: false
  subGrid: {
    visible: true
    // alternateColor: ['rgba(0, 0, 0, 0.3)', 'rgba(200, 0, 0, 0.3)']
  }
});

const stage = render([angleAxis, radiusAxis, angleAxisGrid, radiusAxisGrid], 'main');

setTimeout(() => {
  angleAxis.setAttributes({
    items: [xItems, nextItems]
  });
  angleAxisGrid.setAttributes({
    items: xItems
  });
  angleAxis.animate().play(new GroupTransition(null, null, 1000, 'linear'));

  angleAxisGrid.animate().play(new GroupTransition(null, null, 1000, 'linear'));
}, 1000);
