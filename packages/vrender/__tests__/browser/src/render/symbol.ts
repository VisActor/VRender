import { Symbol, container, SymbolType } from '@visactor/vrender';
import { Star } from 'zrender';
import { renderElement } from './utils';

const symbolPools: SymbolType[] = [
  'circle',
  'wye',
  'cross',
  'diamond',
  'square',
  'triangle',
  'star',
  'arrow',
  'wedge',
  'stroke'
];

const colorPools = [
  'aliceblue',
  'antiquewhite',
  'blue',
  'blueviolet',
  'brown',
  'burlywood',
  'azure',
  'beige',
  'bisque',
  'black',
  'blanchedalmond',
  'hotpink',
  'indianred',
  'indigo',
  'ivory',
  'khaki',
  'lavender',
  'lavenderblush',
  'lawngreen',
  'lemonchiffon',
  'lightblue'
];

export function renderSymbol(num: number) {
  renderElement(
    num,
    `渲染symbol - ${num}`,
    () => {
      return new Symbol({
        symbolType: symbolPools[Math.floor(Math.random() * symbolPools.length)],
        x: 800 * Math.random(),
        y: 800 * Math.random(),
        size: 20,
        fill: colorPools[Math.floor(Math.random() * colorPools.length)]
      });
    },
    () => {
      return new Star({
        shape: {
          cx: 800 * Math.random(),
          cy: 800 * Math.random(),
          n: 5,
          r0: 10,
          r: 20
        },
        style: {
          fill: colorPools[Math.floor(Math.random() * colorPools.length)]
        }
      });
    }
  );
}
