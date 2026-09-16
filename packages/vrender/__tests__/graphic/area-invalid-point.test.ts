import { createArea, createStage, CustomPath2D, type IAreaGraphicAttribute } from '../../src/index';
import { RoughCanvasAreaRender } from '../../../vrender-kits/src/render/contributions/rough/rough-area';

const points = [
  { x: 0, y: 0, y1: 0 },
  { x: 10, y: 10, y1: 0 },
  { x: 500, y: 500, y1: -500, defined: false },
  { x: 20, y: 10, y1: 0 },
  { x: 30, y: 0, y1: 0 }
];

function fixture(attrs: IAreaGraphicAttribute, dirty = false) {
  const canvas = document.createElement('canvas');
  const stage = createStage({ canvas, width: 140, height: 80, dpr: 1, disableDirtyBounds: !dirty });
  const area = createArea({ x: 10, y: 20, fill: 'red', ...attrs });
  stage.defaultLayer.add(area);
  stage.render();
  return { stage, area, context: canvas.getContext('2d') };
}

describe('area invalid points through public rendering and picking', () => {
  test('basis gaps remain empty while valid translated regions can be picked', () => {
    const { stage, area } = fixture({ points, curveType: 'basis', connectedType: 'none' });
    try {
      const first = stage.pick(15, 22);
      const second = stage.pick(35, 22);
      const gap = stage.pick(25, 22);
      const outside = stage.pick(105, 40);
      expect(first && first.graphic).toBe(area);
      expect(second && second.graphic).toBe(area);
      expect(gap && gap.graphic).not.toBe(area);
      expect(outside && outside.graphic).not.toBe(area);
      area.setAttribute('connectedType', 'connect');
      stage.render();
      const connected = stage.pick(25, 22);
      expect(connected && connected.graphic).toBe(area);
    } finally {
      stage.release();
    }
  });

  test('an invalid singleton segment cannot create an unpickable filled region', () => {
    const { stage, area, context } = fixture({
      connectedType: 'connect',
      segments: [{ points: [points[2]] }, { points: points.slice(0, 2) }]
    });
    try {
      const hit = stage.pick(15, 22);
      expect(hit && hit.graphic).toBe(area);
      const background = context.getImageData(130, 70, 1, 1).data;
      expect(Array.from(context.getImageData(105, 40, 1, 1).data)).toEqual(Array.from(background));
    } finally {
      stage.release();
    }
  });

  test('dirty rendering matches full rendering after valid and undefined coordinates change', () => {
    const dirty = fixture({ points, curveType: 'basis' }, true);
    const full = fixture({ points, curveType: 'basis' });
    try {
      const updated = points.map(p => (p.defined === false ? { ...p, x: -800, y: -800 } : { ...p, x: p.x + 15 }));
      dirty.area.setAttribute('points', updated);
      full.area.setAttribute('points', updated);
      dirty.stage.render();
      full.stage.render();
      const actual = dirty.context.getImageData(0, 0, 140, 80).data;
      const expected = full.context.getImageData(0, 0, 140, 80).data;
      expect(actual.every((value, i) => value === expected[i])).toBe(true);
    } finally {
      dirty.stage.release();
      full.stage.release();
    }
  });

  test('rough renderer receives disconnected valid subpaths through the existing cache contract', () => {
    const renderer = new RoughCanvasAreaRender({ getContributions: () => [] });
    const { stage, area } = fixture({ points, curveType: 'basis' });
    const spy = jest.spyOn(CustomPath2D.prototype, 'toString');
    try {
      const context = stage.window.getContext();
      renderer.drawShape(area, context, 0, 0, { context } as any);
      const paths = spy.mock.results.map(result => result.value as string);
      expect(paths).toHaveLength(1);
      expect(paths[0].match(/M/g)).toHaveLength(2);
      expect(paths[0]).not.toMatch(/500|NaN/);
    } finally {
      spy.mockRestore();
      stage.release();
    }
  });
});
