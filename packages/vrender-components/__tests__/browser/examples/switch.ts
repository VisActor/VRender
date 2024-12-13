import '@visactor/vrender';
import { IPointLike } from '@visactor/vutils';
import render from '../../util/render';
import { Switch, SwitchAttributes } from '../../../src';

export function run() {
  const switchs: Switch[] = [];
  switchs.push(
    new Switch({
      x: 100,
      y: 100
    })
  );

  switchs.push(
    new Switch({
      x: 200,
      y: 100,
      checked: true
    })
  );

  switchs.push(
    new Switch({
      x: 300,
      y: 100,
      checked: true,
      box: {
        checkedFill: 'red',
        uncheckedFill: 'blue'
      }
    } as SwitchAttributes)
  );

  switchs.push(
    new Switch({
      x: 100,
      y: 200,
      text: {
        checkedText: '开',
        uncheckedText: '关',
        fill: '#FFF',
        fontSize: 12
      }
    } as SwitchAttributes)
  );

  switchs.push(
    new Switch({
      x: 200,
      y: 200,
      text: {
        checkedText: 'enable',
        uncheckedText: 'disableaaaaa',
        fill: '#FFF',
        fontSize: 12
      }
    } as SwitchAttributes)
  );

  switchs.push(
    new Switch({
      x: 350,
      y: 200,
      text: {
        checkedText: 'enableaaaaa',
        uncheckedText: 'disable',
        fill: '#FFF',
        fontSize: 12
      }
    } as SwitchAttributes)
  );

  const stage = render(switchs, 'main');
}
