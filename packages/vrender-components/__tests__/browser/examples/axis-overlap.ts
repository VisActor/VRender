import { PointScale } from '@visactor/vscale';
import { LineAxis } from '../../../src';
import render from '../../util/render';

const domain = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789abcdefghijk'.split('');
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
  start: { x: 100, y: 400 },
  end: { x: 500, y: 400 },
  items: [xItems],
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
    space: 0
  },
  tick: {
    visible: true,
    length: 10
    // dataFilter: data => {
    //   return data.filter((d, i) => i % 2 === 0);
    // }
  },
  // subTick: {
  //   visible: true,
  //   count:2
  // },
  label: {
    visible: true,
    space: 10,
    autoRotate: true,
    autoRotateAngle: [0, 30, 60],
    autoHide: true,
    autoLimit: true,
    // dataFilter: data => {
    //   return data.filter((d, i) => i % 2 === 0);
    // }
    formatMethod: () => 'AAAAAAAAAAAAAA'
    // style: {
    //   angle: Math.PI * 0.5
    // }
  },
  orient: 'bottom',
  verticalLimitSize: 100
});

const axisLeft = new LineAxis({
  start: { x: 250, y: 50 },
  end: { x: 250, y: 350 },
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
    formatMethod: () => 'AAAAAAAAAAAAAA'
  },
  orient: 'left',
  verticalLimitSize: 100
});

render([axisBottom, axisLeft], 'main');
