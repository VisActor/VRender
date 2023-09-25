import { createRect } from '@visactor/vrender-core';
import { SizeContinuousLegend, Segment } from '../../../src';
import render from '../../util/render';

const segment = new Segment({
  points: [
    { x: 100, y: 100 },
    { x: 200, y: 330 }
  ],
  startSymbol: {
    visible: true,
    clip: true,
    symbolType: 'square',
    style: {
      fillOpacity: 0.4
    }
  },
  endSymbol: {
    visible: true,
    clip: true,
    symbolType: 'square',
    style: {
      fillOpacity: 0.4
    }
  }
});

console.log(segment);

const hbLegend = new SizeContinuousLegend({
  x: 20,
  y: 20,
  title: {
    visible: true,
    text: '颜色图例 bottom'
  },
  sizeRange: [10, 20],
  layout: 'horizontal',
  align: 'bottom',
  railWidth: 200,
  railHeight: 6,
  min: 0,
  max: 100,
  value: [0, 100]
});

const htLegend = new SizeContinuousLegend({
  x: 20,
  y: 150,
  title: {
    // space: 0,
    visible: true,
    text: '颜色图例 top'
  },
  sizeRange: [10, 20],
  layout: 'horizontal',
  align: 'top',
  railWidth: 200,
  railHeight: 6,
  min: 0,
  max: 100,
  value: [0, 100]
});

const vlLegend = new SizeContinuousLegend({
  x: 300,
  y: 20,
  title: {
    visible: true,
    text: '颜色图例 left'
  },
  sizeRange: [10, 20],
  layout: 'vertical',
  align: 'left',
  railWidth: 6,
  railHeight: 200,
  min: 20,
  max: 200,
  value: [50, 100]
});

const vrLegend = new SizeContinuousLegend({
  x: 400,
  y: 20,
  title: {
    visible: true,
    text: '颜色图例 right'
  },
  sizeRange: [10, 20],
  layout: 'vertical',
  align: 'right',
  railWidth: 6,
  railHeight: 200,
  min: 20,
  max: 200,
  value: [50, 100]
});
const stage = render([hbLegend, htLegend, vlLegend, vrLegend], 'main');

stage.defaultLayer.add(segment as any);
stage.render();
