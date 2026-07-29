import { AABBBounds } from '@visactor/vutils';
import { application } from '../../../src/application';
import { offsetPolygonPoints } from '../../../src/common/polygon';
import { Group } from '../../../src/graphic/group';
import { Polygon } from '../../../src/graphic/polygon';
import { DefaultGraphicService } from '../../../src/graphic/graphic-service/graphic-service';
import { updateBoundsOfPolygonOuterBorder } from '../../../src/graphic/graphic-service/polygon-outer-border-bounds';

describe('polygon outer border bounds', () => {
  test('contains the actual offset outline for non-right-angle vertices', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 120, y: 0 },
      { x: 90, y: 60 },
      { x: 30, y: 60 }
    ];
    const bounds = new AABBBounds();
    points.forEach(point => bounds.add(point.x, point.y));

    updateBoundsOfPolygonOuterBorder(
      {
        points,
        outerBorder: { stroke: '#f00', distance: 3, lineWidth: 1 }
      },
      {
        points: [],
        closePath: true,
        shadowBlur: 0,
        scaleX: 1,
        scaleY: 1,
        keepStrokeScale: false,
        outerBorder: {
          distance: 0,
          lineWidth: 1,
          lineJoin: 'miter',
          strokeBoundsBuffer: 0
        }
      } as any,
      bounds,
      {
        globalTransMatrix: { a: 1, b: 0, c: 0, d: 1 }
      } as any
    );

    offsetPolygonPoints(points, 3).forEach(point => {
      expect(point.x).toBeGreaterThanOrEqual(bounds.x1);
      expect(point.x).toBeLessThanOrEqual(bounds.x2);
      expect(point.y).toBeGreaterThanOrEqual(bounds.y1);
      expect(point.y).toBeLessThanOrEqual(bounds.y2);
    });
    expect(bounds.x1).toBeLessThan(-4.8);
    expect(bounds.x2).toBeGreaterThan(124.8);
  });

  test('contains a non-scaling outer border after a shrinking transform', () => {
    const previousGraphicService = application.graphicService;
    application.graphicService = new DefaultGraphicService();

    try {
      const polygon = new Polygon({
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
          { x: 0, y: 100 }
        ],
        scaleX: 0.5,
        scaleY: 0.5,
        keepStrokeScale: false,
        outerBorder: {
          stroke: '#f00',
          distance: 10,
          lineWidth: 0,
          strokeBoundsBuffer: 0
        }
      });

      expect(polygon.AABBBounds.x1).toBeLessThanOrEqual(-10);
      expect(polygon.AABBBounds.y1).toBeLessThanOrEqual(-10);
      expect(polygon.AABBBounds.x2).toBeGreaterThanOrEqual(60);
      expect(polygon.AABBBounds.y2).toBeGreaterThanOrEqual(60);
    } finally {
      application.graphicService = previousGraphicService;
    }
  });

  test('contains a non-scaling border width and distance under a shrinking parent', () => {
    const previousGraphicService = application.graphicService;
    application.graphicService = new DefaultGraphicService();

    try {
      const group = new Group({ scaleX: 0.5, scaleY: 0.5 });
      const polygon = new Polygon({
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
          { x: 0, y: 100 }
        ],
        keepStrokeScale: false,
        outerBorder: {
          stroke: '#f00',
          distance: 10,
          lineWidth: 2,
          lineJoin: 'round',
          strokeBoundsBuffer: 0
        }
      });
      group.appendChild(polygon);

      expect(polygon.globalAABBBounds.x1).toBeLessThanOrEqual(-11);
      expect(polygon.globalAABBBounds.y1).toBeLessThanOrEqual(-11);
      expect(polygon.globalAABBBounds.x2).toBeGreaterThanOrEqual(61);
      expect(polygon.globalAABBBounds.y2).toBeGreaterThanOrEqual(61);

      group.setAttributes({ scaleX: 0.25, scaleY: 0.25 });
      expect(polygon.globalAABBBounds.x1).toBeLessThanOrEqual(-11);
      expect(polygon.globalAABBBounds.y1).toBeLessThanOrEqual(-11);
      expect(polygon.globalAABBBounds.x2).toBeGreaterThanOrEqual(36);
      expect(polygon.globalAABBBounds.y2).toBeGreaterThanOrEqual(36);
    } finally {
      application.graphicService = previousGraphicService;
    }
  });

  test('updates bounds when a state changes the outer border distance', () => {
    const previousGraphicService = application.graphicService;
    application.graphicService = new DefaultGraphicService();

    try {
      const polygon = new Polygon({
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
          { x: 0, y: 100 }
        ],
        outerBorder: {
          stroke: '#f00',
          distance: 10,
          lineWidth: 0,
          strokeBoundsBuffer: 0
        }
      });

      expect(polygon.AABBBounds.x1).toBeLessThanOrEqual(-10);

      polygon.states = {
        hover: {
          outerBorder: {
            stroke: '#f00',
            distance: 20,
            lineWidth: 0,
            strokeBoundsBuffer: 0
          }
        }
      } as any;
      polygon.useStates(['hover'], false);

      expect(polygon.AABBBounds.x1).toBeLessThanOrEqual(-20);
    } finally {
      application.graphicService = previousGraphicService;
    }
  });

  test('scales the outer border width when keepStrokeScale is true', () => {
    const previousGraphicService = application.graphicService;
    application.graphicService = new DefaultGraphicService();

    try {
      const polygon = new Polygon({
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
          { x: 0, y: 100 }
        ],
        scaleX: 0.5,
        scaleY: 0.5,
        keepStrokeScale: true,
        outerBorder: {
          stroke: '#f00',
          distance: 0,
          lineWidth: 10,
          lineJoin: 'round',
          strokeBoundsBuffer: 0
        }
      });

      expect(polygon.AABBBounds.x1).toBeCloseTo(-2.5);
      expect(polygon.AABBBounds.y1).toBeCloseTo(-2.5);
      expect(polygon.AABBBounds.x2).toBeCloseTo(52.5);
      expect(polygon.AABBBounds.y2).toBeCloseTo(52.5);
    } finally {
      application.graphicService = previousGraphicService;
    }
  });
});
