import { isTransformKey, transformKeys } from '../../../src/utils/transform';

describe('vrender-animate transform utils', () => {
  test('isTransformKey matches known keys', () => {
    for (const k of transformKeys) {
      expect(isTransformKey(k)).toBe(true);
    }
    expect(isTransformKey('unknown')).toBe(false);
  });
});
