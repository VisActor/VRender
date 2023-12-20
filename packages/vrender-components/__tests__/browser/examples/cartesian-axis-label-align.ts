import { AABBBounds } from '@visactor/vutils';
import { PointScale } from '@visactor/vscale';
import '@visactor/vrender';
import { LineAxis } from '../../../src';
import { alignAxisLabels } from '../../../src/util/align';
import render from '../../util/render';

const domain = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const pointScale = new PointScale().domain(domain).range([0, 1]);
const xItems = domain.map(value => {
  return {
    id: value,
    label: value,
    value: pointScale.scale(value),
    rawValue: value
  };
});
const axisBottom = new LineAxis({
  start: { x: 150, y: 350 },
  end: { x: 350, y: 350 },
  items: [xItems],
  title: {
    visible: true,
    position: 'middle',
    autoRotate: true,
    padding: 4,
    maxWidth: 100,
    text: 'x 轴 -- bottom',
    space: 0
  },
  tick: {
    visible: true,
    length: 10
  },
  label: {
    visible: true,
    space: 10,
    autoRotate: true,
    autoRotateAngle: [-45],
    autoHide: true,
    autoLimit: true,
    containerAlign: 'bottom'
  },
  orient: 'bottom',
  verticalLimitSize: 120,
  verticalMinSize: 120
});

const axisTop = new LineAxis({
  start: { x: 150, y: 150 },
  end: { x: 350, y: 150 },
  items: [xItems],
  title: {
    visible: true,
    position: 'middle',
    autoRotate: true,
    padding: 4,
    maxWidth: 100,
    text: 'x 轴 -- bottom',
    space: 0
  },
  tick: {
    visible: true,
    length: 10
  },
  label: {
    visible: true,
    space: 10,
    autoRotate: false,
    autoRotateAngle: [45],
    autoHide: true,
    autoLimit: true,
    containerAlign: 'bottom'
    // formatMethod: () => 'AAAAAAAAAAAAAA',
  },
  orient: 'top',
  verticalLimitSize: 100,
  verticalMinSize: 100,
  verticalFactor: -1
});

const axisLeft = new LineAxis({
  start: { x: 150, y: 150 },
  end: { x: 150, y: 350 },
  items: [xItems],
  title: {
    visible: true,
    position: 'middle',
    autoRotate: true,
    padding: 4,
    maxWidth: 100,
    text: 'y 轴 -- left',
    space: 0
  },
  tick: {
    visible: true,
    length: 10
  },
  label: {
    visible: true,
    autoRotate: false,
    autoRotateAngle: [0, 45, 90],
    autoHide: true,
    autoLimit: true,
    containerAlign: 'right',
    space: 20
    // formatMethod: () => 'AAAAAAAAAAAAAA'
  },
  orient: 'left',
  verticalLimitSize: 300,
  verticalMinSize: 150,
  panel: {
    visible: true,
    style: {
      stroke: 'red'
    }
  }
});

const axisRight = new LineAxis({
  start: { x: 350, y: 150 },
  end: { x: 350, y: 350 },
  items: [xItems],
  title: {
    visible: true,
    position: 'middle',
    autoRotate: true,
    padding: 10,
    maxWidth: 100,
    text: 'y 轴 -- Right',
    space: 0
  },
  tick: {
    visible: true,
    length: 10
  },
  label: {
    visible: true,
    autoRotate: false,
    autoRotateAngle: [0, 45, 90],
    autoHide: true,
    autoLimit: true,
    containerAlign: 'left',
    formatMethod: (value, datum, index, data) => {
      if (value === 'Y') {
        return 'AAAAAAAAAAAAAA';
      }
      return value;
    },
    space: 20
  },
  orient: 'right',
  verticalLimitSize: 140,
  // verticalMinSize: 100,
  verticalFactor: -1,
  panel: {
    visible: true,
    style: {
      stroke: 'red'
    }
  }
});

render([axisRight, axisLeft, axisBottom, axisTop], 'main');

console.log(axisRight.getElementsByName('axis-container')[0].AABBBounds.width());
