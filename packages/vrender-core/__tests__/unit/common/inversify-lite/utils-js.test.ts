import { getFirstArrayDuplicate } from '../../../../src/common/inversify-lite/utils/js';

describe('inversify-lite utils/js', () => {
  test('returns undefined when no duplicates', () => {
    expect(getFirstArrayDuplicate([1, 2, 3])).toBeUndefined();
  });

  test('returns the first duplicate encountered', () => {
    expect(getFirstArrayDuplicate([1, 2, 1, 2])).toBe(1);
  });

  test('treats NaN values as duplicates (SameValueZero)', () => {
    const res = getFirstArrayDuplicate([NaN, NaN]);
    expect(Number.isNaN(res as any)).toBe(true);
  });
});
