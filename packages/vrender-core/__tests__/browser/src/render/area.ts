import { Area } from '@visactor/vrender';
import { Polyline } from 'zrender';
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

const curveType = ['basis', 'monotoneX'];

const pointsArr: any = [];
for (let i = 0; i < 10; i++) {
  pointsArr.push([Math.random() * 800, Math.random() * 500]);
}
const points = pointsArr.map((item: any) => ({ x: item[0], y: item[1], y1: 100 }));

export function renderArea(num: number) {
  renderElement(
    num,
    `渲染area - ${num}`,
    () => {
      return new Area({
        points: points.sort(() => Math.random() - 0.5).slice(),
        fill: colorPools[Math.floor(Math.random() * colorPools.length)],
        curveType: curveType[Math.floor(Math.random() * curveType.length)] as any
      });
    },
    () => {
      return new Polyline({
        style: {
          stroke: colorPools[Math.floor(Math.random() * colorPools.length)],
          lineWidth: 3
        },
        shape: {
          points: pointsArr.sort(() => Math.random() - 0.5).slice(),
          smooth: Math.random()
        }
      });
    }
  );
}
