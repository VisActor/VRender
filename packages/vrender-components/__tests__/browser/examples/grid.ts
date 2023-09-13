import { pi } from '@visactor/vutils';
import { BandScale, LinearScale, PointScale } from '@visactor/vscale';
import { CircleAxis, LineAxis, LineAxisGrid } from '../../../src';
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

const cartesianLineAxisGrid = new LineAxisGrid({
  start: { x: 100, y: 200 },
  end: { x: 100, y: 10 },
  items: items,
  verticalFactor: -1,
  type: 'line',
  visible: true,
  length: 300,
  alignWithLabel: false,
  style: {
    stroke: 'red'
  },
  zIndex: 1,
  alternateColor: ['#ccc', '#000'],
  subGrid: {
    visible: true,
    style: {
      // zIndex: 2,
      // stroke: 'yellow'
    }
    // alternateColor: ['red', 'yellow']
  }
});

const radiusAxisCircleGrid = new LineAxisGrid({
  type: 'polygon',
  // type: 'circle',
  center: { x: 350, y: 300 },
  items,
  start: { x: 350, y: 300 },
  end: { x: 450, y: 300 },
  style: {
    lineDash: [0],
    stroke: 'red'
  },
  closed: true,
  // startAngle: -0.5 * Math.PI,
  // endAngle: 1.5 * Math.PI
  sides: 10
});

render([cartesianLineAxisGrid, radiusAxisCircleGrid], 'main');
