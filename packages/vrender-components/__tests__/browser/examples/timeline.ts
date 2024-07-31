import '@visactor/vrender';
import { IPointLike } from '@visactor/vutils';
import render from '../../util/render';
import { Timeline } from '../../../src';
import { createLine } from '@visactor/vrender-core';

export function run() {
  const timelines: Timeline[] = [];

  timelines.push(
    new Timeline({
      x: 30,
      y: 100,
      times: [
        { label: '2000', desc: '' },
        { label: '2001', desc: '' },
        { label: '2002', desc: '' },
        { label: '2003', desc: '' },
        { label: '2004', desc: '' },
        { label: '2005', desc: '' },
        { label: '2006', desc: '' }
      ],
      width: 380,
      clipRange: 0.3
    })
  );

  setTimeout(() => {
    // timelines[0].forward({ duration: 1000 });
    timelines[0].appearAnimate({ duration: 5000 });
  }, 2000);

  const stage = render(timelines as any, 'main');
}
