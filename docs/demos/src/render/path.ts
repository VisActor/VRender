import { Path, drawArc } from '@visactor/vrender';
import { Path as ZPath } from 'zrender';
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

var ZPathCircle = ZPath.extend({
  type: 'pin',
  shape: {
    // x, y on the cusp
    x: 0,
    y: 0
  },
  buildPath: function (path, shape) {
    var x = shape.x;
    var y = shape.y;

    // circle
    path.moveTo(50 + x, 0 + y);
    x += 50;
    drawArc(path as any, x, y, [50, 50, 0, 1, 1, -50 + x, 0 + y]);
    x -= 50;
    drawArc(path as any, x, y, [50, 50, 0, 1, 1, 50 + x, 0 + y]);

    // // diamond
    // path.moveTo(-50 + x, 0 + y);
    // path.lineTo(0 + x, -50 + y);
    // path.lineTo(50 + x, 0 + y);
    // path.lineTo(0 + x, 50 + y);

    path.closePath();
  }
});

export function renderPath(num: number) {
  renderElement(
    num,
    `渲染path - ${num}`,
    () => {
      return new Path({
        x: 600 * Math.random(),
        y: 600 * Math.random(),
        // path: 'M50,0A50,50,0,1,1,-50,0A50,50,0,1,1,50,0', // circle
        // path: 'M-50,0L0,-50L50,0L0,50Z', // diamond
        customPath: (path, mark) => {
          var x = 0;
          var y = 0;
          // var x = mark.x;
          // var y = mark.y;

          // circle
          path.moveTo(50 + x, 0 + y);
          x += 50;
          drawArc(path as any, x, y, [50, 50, 0, 1, 1, -50 + x, 0 + y]);
          x -= 50;
          drawArc(path as any, x, y, [50, 50, 0, 1, 1, 50 + x, 0 + y]);

          // // diamond
          // path.moveTo(-50 + x, 0 + y);
          // path.lineTo(0 + x, -50 + y);
          // path.lineTo(50 + x, 0 + y);
          // path.lineTo(0 + x, 50 + y);

          path.closePath();
        },
        fill: colorPools[Math.floor(Math.random() * colorPools.length)]
      });
    },
    () => {
      return new ZPathCircle({
        shape: {
          x: 600 * Math.random(),
          y: 600 * Math.random()
        },
        style: {
          fill: colorPools[Math.floor(Math.random() * colorPools.length)]
          // stroke: 'black',
        }
      });
    }
  );
}
