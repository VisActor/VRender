import { assertRef } from '../../../src/util';

describe('react-vrender util/assertRef', () => {
  test('callback ref is rejected', () => {
    expect(() => {
      assertRef(((): void => undefined) as any);
    }).toThrow('Callback ref not support!');
  });

  test('object ref is accepted', () => {
    expect(() => {
      assertRef<{ a: number }>({ current: null });
    }).not.toThrow();
  });
});
