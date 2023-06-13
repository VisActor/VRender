import { Arc } from '@visactor/vrender';
import { Sector as ZSector } from 'zrender';
import { renderElement } from './utils';

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

export function renderArc(num: number) {
  renderElement(
    num,
    `渲染arc - ${num}`,
    () => {
      return new Arc({
        innerRadius: 0,
        outerRadius: 100,
        startAngle: 0,
        endAngle: 2 * Math.PI * Math.random(),
        x: 600 * Math.random(),
        y: 600 * Math.random(),
        fill: colorPools[Math.floor(Math.random() * colorPools.length)]
      });
    },
    () => {
      return new ZSector({
        shape: {
          cx: 600 * Math.random(),
          cy: 600 * Math.random(),
          r0: 0,
          r: 100,
          startAngle: 0,
          endAngle: 2 * Math.PI * Math.random()
        },
        style: {
          fill: colorPools[Math.floor(Math.random() * colorPools.length)]
        }
      });
    }
  );
}
