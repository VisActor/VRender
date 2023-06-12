import render from '../../util/render';
import { LinkPath } from '../../../src';

export function run() {
  const hLink = new LinkPath({
    x0: 100,
    x1: 300,
    y0: 60,
    y1: 90,
    thickness: 40,
    align: 'center',
    fill: 'red',
    backgroudStyle: {
      fill: '#ccc'
    },
    endArrow: true,
    startArrow: true
  });

  const vLink = new LinkPath({
    direction: 'vertical',
    x0: 50,
    x1: 178,
    y0: 100,
    y1: 400,
    thickness: 40,
    align: 'center',
    fill: 'red',
    backgroudStyle: {
      fill: '#ccc'
    },
    endArrow: true,
    startArrow: true
  });

  const stage = render([hLink, vLink], 'main');

  stage.on('click', e => {
    if (e.target) {
      if (!e.target.states) {
        e.target.states = { selected: { ratio: 0.4 } };
      }

      e.target.toggleState('selected');
    }
  });

  let isExit = false;

  stage.on('dblclick', e => {
    if (isExit) {
      hLink.animate().to({ x1: 300, y1: 90 }, 2000, 'quadIn');
      vLink.animate().to({ y1: 400, x1: 178 }, 2000, 'quadIn');
    } else {
      hLink.animate().to({ x1: 100, y1: 60 }, 2000, 'quadIn');
      vLink.animate().to({ y1: 100, x1: 50 }, 2000, 'quadIn');
    }

    isExit = !isExit;
  });
}
