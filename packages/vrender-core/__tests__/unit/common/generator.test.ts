import type { Generator as GeneratorClass } from '../../../src/common/generator';

function loadGeneratorCopy(): typeof GeneratorClass {
  let copy: typeof GeneratorClass;
  jest.isolateModules(() => {
    copy = jest.requireActual<{ Generator: typeof GeneratorClass }>('../../../src/common/generator').Generator;
  });
  return copy;
}

describe('Generator', () => {
  const Generator = loadGeneratorCopy();

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

  test('keeps IDs unique when independently loaded copies allocate alternately', () => {
    const first = loadGeneratorCopy();
    const second = loadGeneratorCopy();
    expect(first).not.toBe(second);

    const ids = Array.from({ length: 100 }, (_, index) => (index % 2 === 0 ? first : second).GenAutoIncrementId());

    expect(new Set(ids).size).toBe(ids.length);
    ids.slice(1).forEach((id, index) => expect(id).toBe(ids[index] + 1));
  });

  test('continues the sequence when another bundle loads after allocations', () => {
    const first = loadGeneratorCopy();
    const ids = Array.from({ length: 100 }, () => first.GenAutoIncrementId());
    const second = loadGeneratorCopy();
    const next = second.GenAutoIncrementId();

    expect(next).toBe(ids[ids.length - 1] + 1);
    expect(first.GenAutoIncrementId()).toBe(next + 1);
  });

  test('does not restart the sequence when a module is evaluated again', () => {
    const first = loadGeneratorCopy();
    const beforeReload = first.GenAutoIncrementId();
    const reloaded = loadGeneratorCopy();

    expect(reloaded).not.toBe(first);
    expect(reloaded.GenAutoIncrementId()).toBe(beforeReload + 1);
    expect(first.GenAutoIncrementId()).toBe(beforeReload + 2);
  });
});
