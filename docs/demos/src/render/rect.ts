import { Rect } from '@visactor/vrender';
import { Rect as ZRect } from 'zrender';
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

export function renderRect(num: number) {
  renderElement(
    num,
    `渲染rect - ${num}`,
    () => {
      return new Rect({
        x: 600 * Math.random(),
        y: 600 * Math.random(),
        width: 80,
        height: 50,
        cornerRadius: 10,
        fill: colorPools[Math.floor(Math.random() * colorPools.length)]
      });
    },
    () => {
      return new ZRect({
        // scaleX: 2,
        // scaleY: 2,
        // rotation: 90 ,
        shape: {
          x: 600 * Math.random(),
          y: 600 * Math.random(),
          width: 80,
          height: 50,
          r: 10
        },
        style: {
          fill: colorPools[Math.floor(Math.random() * colorPools.length)]
        }
      });
    }
  );
}
