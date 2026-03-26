import { Lookup } from '../../../../src/common/inversify-lite/container/lookup';
import * as ERROR_MSGS from '../../../../src/common/inversify-lite/constants/error_msgs';

describe('inversify-lite Lookup', () => {
  test('add validates inputs and supports multiple values for same key', () => {
    const lookup = new Lookup<any>();

    expect(() => lookup.add(null as any, 1)).toThrow(ERROR_MSGS.NULL_ARGUMENT);
    expect(() => lookup.add(Symbol('k') as any, null as any)).toThrow(ERROR_MSGS.NULL_ARGUMENT);

    const key = Symbol('key');
    lookup.add(key, 1);
    lookup.add(key, 2);

    expect(lookup.get(key)).toEqual([1, 2]);
  });

  test('get/remove/hasKey throw for null and missing keys', () => {
    const lookup = new Lookup<any>();

    expect(() => lookup.get(undefined as any)).toThrow(ERROR_MSGS.NULL_ARGUMENT);
    expect(() => lookup.remove(undefined as any)).toThrow(ERROR_MSGS.NULL_ARGUMENT);
    expect(() => lookup.hasKey(undefined as any)).toThrow(ERROR_MSGS.NULL_ARGUMENT);

    const key = 'missing';
    expect(() => lookup.get(key)).toThrow(ERROR_MSGS.KEY_NOT_FOUND);
    expect(() => lookup.remove(key)).toThrow(ERROR_MSGS.KEY_NOT_FOUND);
  });

  test('remove deletes entry and hasKey reflects changes', () => {
    const lookup = new Lookup<any>();
    const key = Symbol('key');

    lookup.add(key, 1);
    expect(lookup.hasKey(key)).toBe(true);

    lookup.remove(key);
    expect(lookup.hasKey(key)).toBe(false);
  });

  test('removeIntersection removes shared values', () => {
    const l1 = new Lookup<any>();
    const l2 = new Lookup<any>();

    const key1 = 'k1';
    const key2 = 'k2';

    const shared = { v: 1 };
    const only1 = { v: 2 };

    l1.add(key1, shared);
    l1.add(key1, only1);
    l1.add(key2, shared);

    l2.add(key1, shared);
    l2.add(key2, shared);

    l1.removeIntersection(l2);

    expect(l1.get(key1)).toEqual([only1]);
    expect(() => l1.get(key2)).toThrow(ERROR_MSGS.KEY_NOT_FOUND);
  });

  test('removeIntersection is no-op when lookup does not have the key', () => {
    const l1 = new Lookup<any>();
    const l2 = new Lookup<any>();

    l1.add('k1', 1);
    l1.add('k2', 2);
    l2.add('k1', 1);

    l1.removeIntersection(l2);

    expect(l1.get('k2')).toEqual([2]);
  });

  test('removeIntersection keeps values when intersection is empty', () => {
    const l1 = new Lookup<any>();
    const l2 = new Lookup<any>();

    const a = { v: 'a' };
    const b = { v: 'b' };
    const c = { v: 'c' };

    l1.add('k', a);
    l1.add('k', b);

    l2.add('k', c);

    l1.removeIntersection(l2);

    expect(l1.get('k')).toEqual([a, b]);
  });

  test('removeByCondition removes entries and returns removals', () => {
    const lookup = new Lookup<number>();
    const key = 'k';

    lookup.add(key, 1);
    lookup.add(key, 2);
    lookup.add(key, 3);

    const removed = lookup.removeByCondition((v: number) => v % 2 === 1);

    expect(removed.sort()).toEqual([1, 3]);
    expect(lookup.get(key)).toEqual([2]);
  });

  test('removeByCondition returns empty array when nothing removed', () => {
    const lookup = new Lookup<number>();
    const key = 'k';

    lookup.add(key, 2);
    lookup.add(key, 4);

    expect(lookup.removeByCondition((v: number) => v % 2 === 1)).toEqual([]);
    expect(lookup.get(key)).toEqual([2, 4]);
  });

  test('removeByCondition deletes keys whose all entries removed', () => {
    const lookup = new Lookup<number>();

    lookup.add('k1', 1);
    lookup.add('k2', 2);

    const removed = lookup.removeByCondition(() => true);
    expect(removed.sort()).toEqual([1, 2]);
    expect(lookup.hasKey('k1')).toBe(false);
    expect(lookup.hasKey('k2')).toBe(false);
  });

  test('clone clones clonable values and keeps non-clonable values by reference', () => {
    const lookup = new Lookup<any>();
    const key = Symbol('k');

    const cloned = { id: 'cloned' };
    const clonable = {
      clone: jest.fn(() => cloned)
    };

    const nonClonable = { x: 1 };

    lookup.add(key, clonable);
    lookup.add(key, nonClonable);

    const copy = lookup.clone() as Lookup<any>;

    const values = copy.get(key);
    expect(values[0]).toBe(cloned);
    expect(values[1]).toBe(nonClonable);
    expect(clonable.clone).toHaveBeenCalledTimes(1);
  });

  test('clone keeps primitive/function values as-is', () => {
    const lookup = new Lookup<any>();
    const key = 'k';

    const fn = () => 1;
    lookup.add(key, 1);
    lookup.add(key, 's');
    lookup.add(key, fn);

    const copy = lookup.clone() as Lookup<any>;
    expect(copy.get(key)).toEqual([1, 's', fn]);
    expect(copy.get(key)[2]).toBe(fn);
  });

  test('getMap and traverse expose internal mapping', () => {
    const lookup = new Lookup<number>();
    lookup.add('a', 1);
    lookup.add('b', 2);

    const keys: any[] = [];
    lookup.traverse((key, _value) => {
      keys.push(key);
    });

    expect(keys.sort()).toEqual(['a', 'b']);
    expect(lookup.getMap() instanceof Map).toBe(true);
  });
});
