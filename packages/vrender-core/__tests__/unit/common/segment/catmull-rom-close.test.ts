import { CatmullRomClosed } from '../../../../src/common/segment/catmull-rom-close';

describe('segment/catmull-rom-close', () => {
  function createMockContext() {
    const calls: Array<{ name: string; args: any[] }> = [];
    return {
      calls,
      moveTo: (...args: any[]) => calls.push({ name: 'moveTo', args }),
      lineTo: (...args: any[]) => calls.push({ name: 'lineTo', args }),
      bezierCurveTo: (...args: any[]) => calls.push({ name: 'bezierCurveTo', args }),
      closePath: (...args: any[]) => calls.push({ name: 'closePath', args }),
      tryUpdateLength: () => 0
    };
  }

  test('lineEnd case 1: point once then closes', () => {
    const ctx = createMockContext();
    const c = new CatmullRomClosed(ctx as any, 0.5);

    c.lineStart();
    c.point({ x: 0, y: 0 } as any);
    c.lineEnd();

    expect(ctx.calls.some(c => c.name === 'closePath')).toBe(true);
  });

  test('lineEnd case 2: two points lineTo then closes', () => {
    const ctx = createMockContext();
    const c = new CatmullRomClosed(ctx as any, 0.5);

    c.lineStart();
    c.point({ x: 0, y: 0 } as any);
    c.point({ x: 6, y: 0 } as any);
    c.lineEnd();

    expect(ctx.calls.some(c => c.name === 'lineTo')).toBe(true);
    expect(ctx.calls.some(c => c.name === 'closePath')).toBe(true);
  });

  test('lineEnd case 3: three points triggers extra point calls and bezier output', () => {
    const ctx = createMockContext();
    const c = new CatmullRomClosed(ctx as any, 0.5);

    c.lineStart();
    c.point({ x: 0, y: 0 } as any);
    c.point({ x: 6, y: 0 } as any);
    c.point({ x: 12, y: 0 } as any);
    c.lineEnd();

    expect(ctx.calls.filter(c => c.name === 'bezierCurveTo').length).toBeGreaterThan(0);
  });

  test('defined=false is passed through to bezierCurveTo defined argument', () => {
    const ctx = createMockContext();
    const c = new CatmullRomClosed(ctx as any, 0.5);

    c.lineStart();
    c.point({ x: 0, y: 0 } as any);
    c.point({ x: 6, y: 0, defined: false } as any);
    c.point({ x: 12, y: 0 } as any);
    c.lineEnd();

    const bezier = ctx.calls.find(c => c.name === 'bezierCurveTo');
    expect(bezier).toBeTruthy();
    // signature: cp1x,cp1y,cp2x,cp2y,x,y,defined,p
    expect(bezier!.args[6]).toBe(false);
  });
});
