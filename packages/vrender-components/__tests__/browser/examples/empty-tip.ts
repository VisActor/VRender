import '@visactor/vrender';
import { IPointLike } from '@visactor/vutils';
import render from '../../util/render';
import { EmptyTip } from '../../../src';

export function run() {
  const emptyTip: EmptyTip = new EmptyTip({
    x: 0,
    y: 0,
    width: 500,
    height: 500,
    verticalAlign: 'middle',
    text: {
      text: '暂无数据记录',
      fontSize: 14,
      fill: 'red'
    },
    icon: {
      width: 80,
      height: 80
    },
    padding: 40,
    spaceBetweenTextAndIcon: 10
  });
  debugger;
  const stage = render(emptyTip, 'main');
}
