import { Circle, container } from '@visactor/vrender';
import { roughModule } from '@visactor/vrender-kits';
import { Circle as ZCircle } from 'zrender';
import { renderElement } from './utils';

// container.load(roughModule);

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

export function renderCircle(num: number) {
  renderElement(
    num,
    `渲染circle - ${num}`,
    () => {
      return new Circle({
        radius: 60,
        startAngle: 0,
        endAngle: Math.PI * 2,
        x: 800 * Math.random(),
        y: 800 * Math.random(),
        fillColor: colorPools[Math.floor(Math.random() * colorPools.length)]
      });
    },
    () => {
      return new ZCircle({
        shape: {
          r: 60,
          cx: 800 * Math.random(),
          cy: 800 * Math.random()
        },
        style: {
          fill: colorPools[Math.floor(Math.random() * colorPools.length)]
        }
      });
    }
  );
}
