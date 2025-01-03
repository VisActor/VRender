import '@visactor/vrender';
import render from '../../util/render';
import { ScrollBar } from '../../../src';
import { createGroup, createRect } from '@visactor/vrender';

export function run() {
  console.log('SCROLLBAR');

  const hScrollBar = new ScrollBar({
    x: 0,
    y: 500 - 12,
    width: 500,
    height: 12,
    padding: [2, 0],
    realTime: false,
    railStyle: {
      fill: 'rgba(0, 0, 0, .1)'
    },
    range: [0, 0.05],
    delayTime: 0
    // scrollRange: [0.4, 0.8]
  });

  const vScrollBar = new ScrollBar({
    direction: 'vertical',
    realTime: false,
    x: 0,
    y: 0,
    width: 12,
    height: 500,
    padding: [0, 2],
    delayTime: 0,
    railStyle: {
      fill: 'rgba(0, 0, 0, .1)'
      //
      // stroke: 'red'
    },
    range: [0.1, 0.3]
  });

  const group = createGroup({
    width: 200,
    height: 200,
    x: 100,
    y: 100,
    fill: 'red',
    clip: false,
    overflow: 'scroll'
  });

  for (let j = 0; j < 10; j++) {
    for (let i = 0; i < 10; i++) {
      let fill = 'green';
      if (i > 6) {
        fill = 'orange';
      }
      if (j > 6) {
        fill = 'orange';
      }
      if (i > 6 && j > 6) {
        fill = 'pink';
      }
      group.add(
        createRect({
          x: j * 40,
          y: i * 60,
          width: 30,
          height: 30,
          fill,
          text: `abc${i}`
        })
      );
    }
  }

  const stage = render([group], 'main');
  window.stage = stage;
  hScrollBar.addEventListener('mouseenter', e => {
    console.log('abc');
    hScrollBar.setAttributes({ visible: true });
    hScrollBar.showAll();
  });
  hScrollBar.addEventListener('mouseleave', e => {
    console.log('def');
    hScrollBar.setAttributes({ visibleAll: false });
    hScrollBar.hideAll();
  });

  hScrollBar.addEventListener('scrollDown', e => {
    console.log('hScrollBar', e.detail);
  });

  vScrollBar.addEventListener('scrollDown', e => {
    console.log('vScrollBar', e.detail);
  });

  hScrollBar.addEventListener('scroll', e => {
    console.log('hScrollBar', e.detail.value);
  });

  vScrollBar.addEventListener('scroll', e => {
    console.log('vScrollBar', e.detail.value);
  });
}
