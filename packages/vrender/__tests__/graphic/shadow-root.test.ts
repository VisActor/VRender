/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { Rect } from '../../src/index';

describe('shadowRoot', () => {
  it('AABBBounds', () => {
    const rect = new Rect({
      width: 100,
      height: 100,
      x: 100,
      y: 100,
      fill: 'red'
    });

    const root = rect.attachShadow();
    const r1 = new Rect({
      width: 100,
      height: 100,
      x: 100,
      y: 100,
      fill: 'red'
    });
    root?.add(r1);

    expect(rect.AABBBounds).toEqual({ x1: 100, y1: 100, x2: 300, y2: 300 });
    expect(r1.AABBBounds).toEqual({ x1: 100, y1: 100, x2: 200, y2: 200 });
    expect(r1.globalAABBBounds).toEqual({ x1: 200, y1: 200, x2: 300, y2: 300 });

    const root2 = rect.attachShadow();
    const r2 = new Rect({
      width: 100,
      height: 100,
      x: 600,
      y: 600,
      fill: 'red'
    });
    root2?.add(r2);
    expect(rect.AABBBounds).toEqual({ x1: 100, y1: 100, x2: 800, y2: 800 });
    expect(r2.AABBBounds).toEqual({ x1: 600, y1: 600, x2: 700, y2: 700 });
    expect(r2.globalAABBBounds).toEqual({ x1: 700, y1: 700, x2: 800, y2: 800 });
    const r3 = new Rect({
      width: 100,
      height: 100,
      x: -600,
      y: -600,
      fill: 'red'
    });
    root2?.add(r3);
    expect(rect.AABBBounds).toEqual({ x1: -500, y1: -500, x2: 800, y2: 800 });
    expect(r3.AABBBounds).toEqual({ x1: -600, y1: -600, x2: -500, y2: -500 });
    expect(r3.globalAABBBounds).toEqual({ x1: -500, y1: -500, x2: -400, y2: -400 });
  });
});
