import { AABBBounds } from '@visactor/vutils';
import { Area } from '../../src/graphic/area';
import { Line } from '../../src/graphic/line';

function expectBounds(bounds: AABBBounds) {
  expect(bounds.x1).toBe(0);
  expect(bounds.y1).toBe(0);
  expect(bounds.x2).toBe(10);
  expect(bounds.y2).toBe(10);
}

describe('invalid defined points', () => {
  test('line bounds exclude invalid points when connecting the remaining points', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 500, y: 500, defined: false },
      { x: 10, y: 10 }
    ];
    const line = new Line({ points, connectedType: 'connect' });

    const pointBounds = new AABBBounds();
    (line as any).updateLineAABBBoundsByPoints(line.attribute, { points }, pointBounds);
    expectBounds(pointBounds);

    const segmentBounds = new AABBBounds();
    (line as any).updateLineAABBBoundsBySegments(
      { segments: [{ points }], connectedType: 'connect' },
      { segments: [{ points }] },
      segmentBounds
    );
    expectBounds(segmentBounds);
  });

  test('area bounds exclude both coordinates of invalid points', () => {
    const points = [
      { x: 0, y: 0, y1: 2 },
      { x: 500, y: 500, y1: -500, defined: false },
      { x: 10, y: 10, y1: 4 }
    ];
    const area = new Area({ points, connectedType: 'connect' });

    const pointBounds = new AABBBounds();
    (area as any).updateAreaAABBBoundsByPoints(area.attribute, { points }, pointBounds);
    expectBounds(pointBounds);

    const segmentBounds = new AABBBounds();
    (area as any).updateAreaAABBBoundsBySegments(
      { segments: [{ points }], connectedType: 'connect' },
      { segments: [{ points }] },
      segmentBounds
    );
    expectBounds(segmentBounds);
  });
});
