import { Stage, Rect } from '@visactor/vrender';
import type { IGraphic } from '@visactor/vrender';

export const colorPools = [
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

export const addShapesToStage = (stage: Stage, shapes: IGraphic[], includeBBox?: boolean) => {
  shapes.forEach(shape => {
    (stage as any).defaultLayer.add(shape);

    if (includeBBox) {
      const bbox = shape.AABBBounds;

      const bboxRect = new Rect({
        width: bbox.x2 - bbox.x1,
        height: bbox.y2 - bbox.y1,
        x: bbox.x1,
        y: bbox.y1,
        
        stroke: '#ff7300',
        lineWidth: 1,
        fill: false
      });

      console.log(bbox);

      (stage as any).defaultLayer.add(bboxRect);
    }
  });
};
