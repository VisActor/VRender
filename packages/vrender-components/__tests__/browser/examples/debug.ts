import { DiscreteLegend, ColorContinuousLegend } from '../../../src';
import render from '../../util/render';

const legend = new ColorContinuousLegend({
  layout: 'horizontal',
  title: {
    align: 'start',
    space: 0,
    textStyle: {
      fontSize: 12,
      fontWeight: 'normal',
      fill: '#6F6F6F',
      lineHeight: 15.600000000000001,
      fontFamily:
        'PingFang SC,Helvetica Neue,Microsoft Yahei,system-ui,-apple-system,segoe ui,Roboto,Helvetica,Arial,sans-serif,apple color emoji,segoe ui emoji,segoe ui symbol'
    },
    visible: true,
    padding: 0,
    text: '销售额'
  },
  handlerSize: 10,
  handlerStyle: {
    lineWidth: 0,
    stroke: '#fff',
    outerBorder: {
      distance: 0.8,
      lineWidth: 2,
      stroke: '#ffffff'
    },
    symbolType: 'circle',
    shadowBlur: 12,
    shadowOffsetX: 0,
    shadowOffsetY: 4,
    shadowColor: 'rgba(33,37,44,0.3)',
    _debug_bounds: true,
    strokeBoundsBuffer: 0
  },
  slidable: true,
  layoutType: 'normal-inline',
  layoutLevel: 70,
  maxHeight: 130,
  showHandler: true,
  railWidth: 200,
  railHeight: 8,
  railStyle: {
    fill: '#f1f3f4'
  },
  startText: {
    style: {
      fontSize: 12,
      lineHeight: 15.600000000000001,
      fontFamily:
        'PingFang SC,Helvetica Neue,Microsoft Yahei,system-ui,-apple-system,segoe ui,Roboto,Helvetica,Arial,sans-serif,apple color emoji,segoe ui emoji,segoe ui symbol',
      fontWeight: 'normal',
      fill: '#606773'
    },
    space: 6
  },
  endText: {
    style: {
      fontSize: 12,
      lineHeight: 15.600000000000001,
      fontFamily:
        'PingFang SC,Helvetica Neue,Microsoft Yahei,system-ui,-apple-system,segoe ui,Roboto,Helvetica,Arial,sans-serif,apple color emoji,segoe ui emoji,segoe ui symbol',
      fontWeight: 'normal',
      fill: '#606773'
    },
    space: 6
  },
  handlerText: {
    style: {
      fontSize: 12,
      lineHeight: 15.600000000000001,
      fontFamily:
        'PingFang SC,Helvetica Neue,Microsoft Yahei,system-ui,-apple-system,segoe ui,Roboto,Helvetica,Arial,sans-serif,apple color emoji,segoe ui emoji,segoe ui symbol',
      fontWeight: 'normal',
      fill: '#6F6F6F',
      maxLineWidth: 50
    },
    space: 6
  },
  align: 'bottom',
  zIndex: 500,
  min: 815039.5979347229,
  max: 4684506.442247391,
  colors: ['#f5222d', '#e6e6e6', '#3772ff'],
  defaultSelected: [815039.5979347229, 4684506.442247391],
  width: 265.2,
  height: 80.80000000000001,
  dx: 132.9,
  dy: 0,
  x: 0,
  y: 300
});

render([legend], 'main');

window.legend = legend;
