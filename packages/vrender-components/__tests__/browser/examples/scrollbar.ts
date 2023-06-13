import render from '../../util/render';
import { ScrollBar } from '../../../src';

export function run() {
  console.log('SCROLLBAR');

  const hScrollBar = new ScrollBar({
    x: 0,
    y: 500 - 12,
    width: 500,
    height: 12,
    padding: [2, 0],
    railStyle: {
      fill: 'rgba(0, 0, 0, .1)'
    },
    range: [0, 0.05]
    // scrollRange: [0.4, 0.8]
  });

  const vScrollBar = new ScrollBar({
    direction: 'vertical',
    x: 0,
    y: 0,
    width: 12,
    height: 500,
    padding: [0, 2],
    railStyle: {
      fill: 'rgba(0, 0, 0, .1)'
      //
      // stroke: 'red'
    },
    range: [0.1, 0.3]
  });

  const stage = render([hScrollBar, vScrollBar], 'main');

  hScrollBar.addEventListener('scroll', e => {
    console.log('hScrollBar', e.detail.value);
  });

  vScrollBar.addEventListener('scroll', e => {
    console.log('vScrollBar', e.detail.value);
  });
}
