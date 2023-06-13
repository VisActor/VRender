import { Text, container } from '@visactor/vrender';
import { Text as ZText } from 'zrender';
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

export function renderText(num: number) {
  renderElement(
    num,
    `渲染text - ${num}`,
    () => {
      return new Text({
        text: '这是文本',
        fontSize: 26,
        x: 800 * Math.random(),
        y: 800 * Math.random(),
        fill: colorPools[Math.floor(Math.random() * colorPools.length)]
      });
    },
    () => {
      return new ZText({
        style: {
          text: '这是文本',
          fontSize: 26,
          x: 800 * Math.random(),
          y: 800 * Math.random(),
          fill: colorPools[Math.floor(Math.random() * colorPools.length)]
        }
      });
    }
  );
}
