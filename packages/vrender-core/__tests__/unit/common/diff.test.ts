import { diff } from '../../../src/common/diff';

describe('common/diff', () => {
  test('collects new and changed keys (deep compare)', () => {
    const oldAttrs = {
      a: 1,
      b: { c: 1 },
      keep: 'x'
    };
    const newAttrs = {
      a: 1,
      b: { c: 2 },
      d: 4,
      keep: 'x'
    };

    expect(diff(oldAttrs as any, newAttrs as any)).toEqual({
      b: { c: 2 },
      d: 4
    });
  });

  test('collects removed keys using getAttr', () => {
    const oldAttrs = { a: 1, removed: 2 };
    const newAttrs = { a: 1 };

    const getAttr = jest.fn((key: keyof typeof oldAttrs) => {
      if (key === 'removed') {
        return null;
      }
      return undefined;
    });

    expect(diff(oldAttrs as any, newAttrs as any, getAttr as any)).toEqual({ removed: null });
    expect(getAttr).toHaveBeenCalledWith('removed');
  });

  test('skips removed keys when getAttr returns undefined', () => {
    const oldAttrs = { a: 1, removed: 2 };
    const newAttrs = { a: 1 };

    const getAttr = jest.fn(() => undefined);

    expect(diff(oldAttrs as any, newAttrs as any, getAttr as any)).toEqual({});
  });
});
