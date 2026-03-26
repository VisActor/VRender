import { createRectPath } from '../../../../src/common/shape/rect';

describe('common/shape/rect', () => {
  function createPath() {
    const calls: Array<{ name: string; args: any[] }> = [];
    const record = (name: string) => (...args: any[]) => calls.push({ name, args });
    return {
      calls,
      moveTo: record('moveTo'),
      lineTo: record('lineTo'),
      arc: record('arc'),
      rect: record('rect'),
      closePath: record('closePath')
    };
  }

  function getArcRadii(path: ReturnType<typeof createPath>): number[] {
    return path.calls.filter(c => c.name === 'arc').map(c => c.args[2]);
  }

  test('cornerRadius=0 triggers direct rect call', () => {
    const path = createPath();

    createRectPath(path as any, 1, 2, 3, 4, 0);

    expect(path.calls).toHaveLength(1);
    expect(path.calls[0].name).toBe('rect');
    expect(path.calls[0].args).toEqual([1, 2, 3, 4]);
  });

  test('cornerRadius=[] triggers direct rect call', () => {
    const path = createPath();

    createRectPath(path as any, 1, 2, 3, 4, []);

    expect(path.calls).toHaveLength(1);
    expect(path.calls[0].name).toBe('rect');
  });

  test('roundCorner=false draws with lineTo and closes', () => {
    const path = createPath();

    createRectPath(path as any, 0, 0, 10, 10, 2, false);

    expect(path.calls.some(c => c.name === 'arc')).toBe(false);
    expect(path.calls.some(c => c.name === 'lineTo')).toBe(true);
    expect(path.calls.some(c => c.name === 'closePath')).toBe(true);
  });

  test('roundCorner=true calls arc for rounded corners', () => {
    const path = createPath();

    createRectPath(path as any, 0, 0, 100, 50, 10, true);

    expect(path.calls.filter(c => c.name === 'arc').length).toBe(4);
    expect(path.calls.some(c => c.name === 'closePath')).toBe(true);
  });

  test('edgeCb array compatibility disables closePath', () => {
    const path = createPath();
    const edgeCb = [jest.fn(), jest.fn(), jest.fn(), jest.fn()];

    // compat: if roundCorner is array, it means edgeCb
    createRectPath(path as any, 0, 0, 100, 50, 10, edgeCb as any);

    expect(path.calls.some(c => c.name === 'closePath')).toBe(false);
  });

  test('numeric cornerRadius uses abs', () => {
    const path = createPath();

    createRectPath(path as any, 0, 0, 100, 50, -10, true);

    expect(getArcRadii(path)).toEqual([10, 10, 10, 10]);
  });

  test('array cornerRadius length=1 expands to 4 corners', () => {
    const path = createPath();

    createRectPath(path as any, 0, 0, 100, 50, [5], true);

    expect(getArcRadii(path)).toEqual([5, 5, 5, 5]);
  });

  test('array cornerRadius length=2 expands to [a,b,a,b]', () => {
    const path = createPath();

    createRectPath(path as any, 0, 0, 100, 50, [5, 10], true);

    expect(getArcRadii(path)).toEqual([10, 5, 10, 5]);
  });

  test('array cornerRadius length=4 uses per-corner abs values', () => {
    const path = createPath();

    createRectPath(path as any, 0, 0, 100, 50, [-1, 2, -3, 4], true);

    expect(getArcRadii(path)).toEqual([2, 3, 4, 1]);
  });

  test('cornerRadius can be zero on some corners', () => {
    const path = createPath();

    createRectPath(path as any, 0, 0, 100, 50, [5, 0, 5, 5], true);

    // rightTop has radius=0 => skip its arc
    expect(getArcRadii(path)).toEqual([5, 5, 5]);
  });

  test('negative width/height are normalized', () => {
    const path = createPath();

    createRectPath(path as any, 10, 10, -10, -20, 0);

    // rect(x+width,y+height,abs(width),abs(height))
    expect(path.calls[0].name).toBe('rect');
    expect(path.calls[0].args).toEqual([0, -10, 10, 20]);
  });
});
