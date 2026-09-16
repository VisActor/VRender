import type { IAreaSegment, IDrawContext } from '../../src/interface';
import { Area } from '../../src/graphic/area';
import { DefaultIncrementalCanvasAreaRender } from '../../src/render/contributions/render/incremental-area-render';
import { basisPoints, createAreaContext, renderArea } from './area-test-utils';

const renderer = new DefaultIncrementalCanvasAreaRender({ getContributions: () => [] });

function drawBatch(area: Area, record: ReturnType<typeof createAreaContext>, startAtIdx: number, length: number) {
  area.incremental = 1;
  renderer.drawShape(area, record.context, 0, 0, {
    context: record.context,
    multiGraphicOptions: { startAtIdx, length }
  } as IDrawContext);
}

function pixels(record: ReturnType<typeof createAreaContext>) {
  return Array.from(record.nativeContext.getImageData(0, 0, 120, 30).data);
}

describe('incremental area missing-data continuity', () => {
  test.each(['none', 'connect'] as const)(
    '%s matches ordinary linear area across missing segments and batches',
    connectedType => {
      const segments: IAreaSegment[] = [
        { points: [basisPoints[2]] },
        { points: basisPoints.slice(0, 2) },
        { points: [] },
        { points: [basisPoints[2]] },
        { points: [basisPoints[2]] },
        { points: basisPoints.slice(3) }
      ];
      const area = new Area({ fill: 'red', connectedType, segments });
      const record = createAreaContext();
      for (let i = 0; i < segments.length; i++) {
        drawBatch(area, record, i, 1);
      }
      expect(pixels(record)).toEqual(pixels(renderArea({ segments, connectedType })));
    }
  );

  test.each(['none', 'connect'] as const)(
    '%s selects the same upper and lower points within a segment',
    connectedType => {
      const segments = [{ points: basisPoints }];
      const area = new Area({ fill: 'red', connectedType, segments });
      const record = createAreaContext();
      drawBatch(area, record, 0, 1);
      expect(pixels(record)).toEqual(pixels(renderArea({ segments, connectedType })));
    }
  );

  test('interleaved graphics and replaced segments use their current data', () => {
    const segments = [
      { points: basisPoints.slice(0, 2) },
      { points: [basisPoints[2]] },
      { points: basisPoints.slice(3) }
    ];
    const first = new Area({ fill: 'red', connectedType: 'connect', segments });
    const other = new Area({ fill: 'red', connectedType: 'none', segments });
    const a = createAreaContext();
    const b = createAreaContext();
    for (let i = 0; i < segments.length; i++) {
      drawBatch(first, a, i, 1);
      drawBatch(other, b, i, 1);
    }
    expect(pixels(a)).toEqual(pixels(renderArea({ segments, connectedType: 'connect' })));
    expect(pixels(b)).toEqual(pixels(renderArea({ segments, connectedType: 'none' })));

    const replacement = [{ points: basisPoints.slice(3) }];
    first.setAttributes({ segments: replacement, connectedType: 'none' });
    const restarted = createAreaContext();
    drawBatch(first, restarted, 0, 1);
    expect(pixels(restarted)).toEqual(pixels(renderArea({ segments: replacement })));
  });

  test('missing-only append batches do not repeatedly scan the prefix', () => {
    let reads = 0;
    const firstPoints = basisPoints.slice(0, 2);
    Object.defineProperty(firstPoints, 1, {
      get: () => {
        reads++;
        return basisPoints[1];
      }
    });
    const segments = [{ points: firstPoints }];
    const area = new Area({ fill: 'red', connectedType: 'connect', segments });
    const record = createAreaContext();
    drawBatch(area, record, 0, 1);
    const initialReads = reads;
    for (let i = 0; i < 30; i++) {
      segments.push({ points: [basisPoints[2]] });
      drawBatch(area, record, segments.length - 1, 1);
    }
    expect(reads).toBe(initialReads);
    segments.push({ points: basisPoints.slice(3) });
    drawBatch(area, record, segments.length - 1, 1);
    expect(reads).toBe(initialReads + 1);
    expect(record.nativeContext.isPointInPath(15, 2)).toBe(true);

    area.setAttribute('connectedType', 'none');
    const changed = createAreaContext();
    drawBatch(area, changed, segments.length - 1, 1);
    expect(changed.nativeContext.isPointInPath(15, 2)).toBe(false);
  });
});
