import '@visactor/vrender';
import { IPointLike } from '@visactor/vutils';
import render from '../../util/render';
import { CheckBox } from '../../../src';

export function run() {
  const checkbox = new CheckBox({
    x: 100,
    y: 100,
    text: {
      text: 'checkbox'
    },
    checked: false,
    disabled: true
  });

  const stage = render([checkbox], 'main');
}
