import { SegContext, ReflectSegContext } from '../../../src/common/seg-context';
import { Direction } from '../../../src/common/enums';

describe('SegContext', () => {
  test('moveTo + lineTo appends curve and updates endX/endY', () => {
    const ctx = new SegContext('linear' as any, 'forward' as any);
    ctx.init('linear' as any, 'forward' as any);

    const p0 = { x: 0, y: 0 };
    const p1 = { x: 10, y: 5 };

    ctx.moveTo(0, 0, p0 as any);
    ctx.lineTo(10, 5, true, p1 as any);

    expect(ctx.curves).toHaveLength(1);
    expect(ctx.endX).toBe(10);
    expect(ctx.endY).toBe(5);

    const c: any = ctx.curves[0];
    expect(c.defined).toBe(true);
    expect(c.originP1).toBe(p0);
    expect(c.originP2).toBe(p1);
  });

  test('bezierCurveTo creates cubic curve and updates end point', () => {
    const ctx = new SegContext('linear' as any, 'forward' as any);
    ctx.init('cubic' as any, 'forward' as any);

    const p0 = { x: 0, y: 0 };
    const p1 = { x: 10, y: 20 };

    ctx.moveTo(0, 0, p0 as any);
    ctx.bezierCurveTo(1, 2, 3, 4, 10, 20, true, p1 as any);

    expect(ctx.curves).toHaveLength(1);

    const c: any = ctx.curves[0];
    expect(c.p3?.x ?? c.p1?.x).toBe(10);
    expect(c.p3?.y ?? c.p1?.y).toBe(20);
    expect(c.originP1).toBe(p0);
    expect(c.originP2).toBe(p1);
  });

  test('closePath is no-op when curves length < 2', () => {
    const ctx = new SegContext('linear' as any, 'forward' as any);
    ctx.init('linear' as any, 'forward' as any);

    const p0 = { x: 0, y: 0 };
    ctx.moveTo(0, 0, p0 as any);
    ctx.lineTo(10, 0, true, { x: 1, y: 1 } as any);

    ctx.closePath();
    expect(ctx.curves).toHaveLength(1);
  });

  test('closePath appends closing line when curves length >= 2', () => {
    const ctx = new SegContext('linear' as any, 'forward' as any);
    ctx.init('linear' as any, 'forward' as any);

    const startP = { x: 0, y: 0 };
    const p1 = { x: 1, y: 1 };
    const p2 = { x: 2, y: 2 };

    ctx.moveTo(0, 0, startP as any);
    ctx.lineTo(10, 0, false, p1 as any);
    ctx.lineTo(10, 10, true, p2 as any);

    expect(ctx.curves).toHaveLength(2);

    ctx.closePath();

    expect(ctx.curves).toHaveLength(3);

    const last: any = ctx.curves[2];
    expect(last.p1?.x ?? last.p3?.x).toBe(0);
    expect(last.p1?.y ?? last.p3?.y).toBe(0);
    expect(last.defined).toBe(true);
    expect(last.originP2).toBe(startP);
  });

  test('getLength projection for ROW/COLUMN uses last curve end (p3 ?? p1)', () => {
    const ctx = new SegContext('linear' as any, 'forward' as any);
    ctx.init('cubic' as any, 'forward' as any);

    ctx.moveTo(0, 0, { x: 0, y: 0 } as any);
    ctx.bezierCurveTo(1, 2, 3, 4, 10, 20, true, { x: 10, y: 20 } as any);

    expect(ctx.getLength(Direction.ROW)).toBe(10);
    expect(ctx.getLength(Direction.COLUMN)).toBe(20);
  });

  test('getLength caches result for default direction', () => {
    const ctx = new SegContext('linear' as any, 'forward' as any);
    ctx.init('mix' as any, 'forward' as any);

    ctx.moveTo(0, 0, { x: 0, y: 0 } as any);
    ctx.lineTo(10, 0, true, { x: 10, y: 0 } as any);
    ctx.bezierCurveTo(10, 0, 10, 10, 0, 10, true, { x: 0, y: 10 } as any);

    const c0: any = ctx.curves[0];
    const c1: any = ctx.curves[1];

    const spy0 = jest.spyOn(c0, 'getLength');
    const spy1 = jest.spyOn(c1, 'getLength');

    const len1 = ctx.getLength();
    const callsAfterFirst = spy0.mock.calls.length + spy1.mock.calls.length;

    const len2 = ctx.getLength();
    const callsAfterSecond = spy0.mock.calls.length + spy1.mock.calls.length;

    expect(len2).toBe(len1);
    expect(callsAfterSecond).toBe(callsAfterFirst);
  });

  test('ellipse and quadraticCurveTo throw', () => {
    const ctx = new SegContext('linear' as any, 'forward' as any);
    ctx.init('linear' as any, 'forward' as any);

    expect(() => (ctx as any).ellipse()).toThrow('SegContext不支持调用ellipse');
    expect(() => (ctx as any).quadraticCurveTo()).toThrow('SegContext不支持调用quadraticCurveTo');
  });
});

describe('ReflectSegContext', () => {
  test('moveTo/lineTo swap x/y', () => {
    const ctx = new ReflectSegContext('linear' as any, 'forward' as any);
    ctx.init('linear' as any, 'forward' as any);

    ctx.moveTo(1, 2, { x: 1, y: 2 } as any);
    ctx.lineTo(3, 4, true, { x: 3, y: 4 } as any);

    expect(ctx.curves).toHaveLength(1);
    const c: any = ctx.curves[0];

    expect(c.p0.x).toBe(2);
    expect(c.p0.y).toBe(1);
    expect((c.p1 ?? c.p3).x).toBe(4);
    expect((c.p1 ?? c.p3).y).toBe(3);
  });
});
