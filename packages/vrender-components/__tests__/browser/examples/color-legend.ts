import { ColorContinuousLegend } from '../../../src';
import render from '../../util/render';

const hbLegend = new ColorContinuousLegend({
  x: 20,
  y: 20,
  title: {
    visible: true,
    text: '颜色图例'
  },
  colors: ['#ffffb2', ' #fecc5c', '#fd8d3c', '#f03b20', '#bd0026'],
  layout: 'horizontal',
  railWidth: 200,
  railHeight: 8,
  min: 0,
  max: 100,
  value: [0, 100],
  railStyle: {
    cornerRadius: 5
  }
});

const htLegend = new ColorContinuousLegend({
  x: 20,
  y: 200,
  title: {
    visible: true,
    text: '颜色图例'
    // space: 0
  },
  colors: ['#AEE2FF', '#00328E'],
  layout: 'horizontal',
  align: 'top',
  railWidth: 200,
  railHeight: 8,
  min: 0,
  max: 100,
  value: [0, 100],
  railStyle: {
    cornerRadius: 5
  }
});

const vlLegend = new ColorContinuousLegend({
  x: 300,
  y: 20,
  title: {
    visible: true,
    text: '颜色图例'
  },
  colors: ['#ffffb2', ' #fecc5c', '#fd8d3c', '#f03b20', '#bd0026'],
  layout: 'vertical',
  align: 'left',
  railWidth: 8,
  railHeight: 200,
  min: 10,
  max: 100,
  value: [10, 100],
  railStyle: {
    cornerRadius: 5
  }
});
const vrLegend = new ColorContinuousLegend({
  x: 350,
  y: 20,
  title: {
    visible: true,
    text: '颜色图例'
  },
  colors: ['#ffffb2', ' #fecc5c', '#fd8d3c', '#f03b20', '#bd0026'],
  layout: 'vertical',
  align: 'right',
  railWidth: 8,
  railHeight: 200,
  min: 10,
  max: 100,
  value: [10, 100],
  railStyle: {
    cornerRadius: 5
  }
});
const stage = render([hbLegend, htLegend, vlLegend, vrLegend], 'main');
// const stage = render([htLegend], 'main');

console.log(htLegend);
