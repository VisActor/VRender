import { pi } from '@visactor/vutils';
import { BandScale, LinearScale, PointScale } from '@visactor/vscale';
import { CircleAxis, LineAxis } from '../../../src';
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
const nextYItems = scale.ticks(5).map(tick => {
  return {
    id: tick,
    label: tick,
    value: scale.scale(tick),
    rawValue: tick
  };
});

const domain = 'ABCDEFGH'.split('');
const pointScale = new PointScale().domain(domain).range([0, 1]);
const xItems = domain.map(value => {
  return {
    id: value,
    label: value,
    value: pointScale.scale(value),
    rawValue: value
  };
});
const nextXItems = 'BDFH'.split('').map(value => {
  return {
    id: value,
    label: value,
    value: pointScale.scale(value),
    rawValue: value
  };
});

const bandScale = new BandScale().domain(domain).range([0, 1]);
const angleItems = domain.map(value => {
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
    stroke: 'blue',
    fontWeight: 500
  },
  hover_reverse: {
    fill: 'yellow',
    stroke: 'yellow',
    fontWeight: 500
  },
  selected: {
    fill: 'red',
    stroke: 'red',
    fontSize: 16
  },
  selected_reverse: {
    fill: '#ccc',
    stroke: '#ccc'
  }
};

const xAxisBottom = new LineAxis({
  start: { x: 100, y: 400 },
  end: { x: 400, y: 400 },
  items: [xItems],
  line: {
    startSymbol: {
      visible: true,
      symbolType: 'triangle'
    },
    endSymbol: {
      visible: true,
      symbolType: 'triangle'
    },
    state: stateStyle
  },
  title: {
    visible: true,
    position: 'middle',
    autoRotate: true,
    // background: {
    //   visible: true,
    //   style: {
    //     fill: 'rgba(0, 0, 0, 0.3)'
    //   }
    // },
    padding: 4,
    maxWidth: 100,
    text: 'x 轴 -- bottom',
    space: 0,
    state: {
      text: stateStyle,
      shape: stateStyle,
      background: stateStyle
    }
  },
  tick: {
    visible: true,
    state: stateStyle,
    dataFilter: data => {
      return data.filter((d, i) => i % 2 === 0);
    }
  },
  // subTick: {
  //   visible: true,
  //   count:2
  // },
  label: {
    visible: true,
    space: 0,
    state: stateStyle,
    dataFilter: data => {
      return data.filter((d, i) => i % 2 === 0);
    }
  },
  subGrid: {
    visible: true,
    style: {
      stroke: 'red'
    }
  },
  hover: true,
  select: true,
  panel: {
    visible: true,
    style: {
      fill: 'rgba(23, 133, 45, 1)'
    },
    state: stateStyle
  }
});

render([xAxisBottom], 'main');
