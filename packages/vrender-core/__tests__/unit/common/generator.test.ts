import { Generator } from '../../../src/common/generator';

describe('Generator', () => {
  test('GenAutoIncrementId returns a finite number', () => {
    const id = Generator.GenAutoIncrementId();
    expect(typeof id).toBe('number');
    expect(Number.isFinite(id)).toBe(true);
  });

  test('GenAutoIncrementId increments by 1 each call (relative assertion)', () => {
    const a = Generator.GenAutoIncrementId();
    const b = Generator.GenAutoIncrementId();

    expect(b).toBe(a + 1);
  });

  test('GenAutoIncrementId keeps monotonically increasing sequence', () => {
    const ids = Array.from({ length: 5 }, () => Generator.GenAutoIncrementId());
    for (let i = 0; i < ids.length - 1; i++) {
      expect(ids[i + 1]).toBe(ids[i] + 1);
    }
  });
});
