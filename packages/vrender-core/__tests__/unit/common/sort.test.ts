import { findNextGraphic, foreach, foreachAsync } from '../../../src/common/sort';

type Child = { _uid: number; attribute: { zIndex?: number; z?: number } };

class FakeGraphic {
  constructor(public children: Child[]) {}

  forEachChildren(cb: (item: any, i: number) => boolean | void, reverse = false) {
    const list = reverse ? [...this.children].reverse() : this.children;
    for (let i = 0; i < list.length; i++) {
      const stopped = cb(list[i], i);
      if (stopped) {
        break;
      }
    }
  }

  async forEachChildrenAsync(cb: (item: any, i: number) => Promise<void> | void, reverse = false) {
    const list = reverse ? [...this.children].reverse() : this.children;
    for (let i = 0; i < list.length; i++) {
      // eslint-disable-next-line no-await-in-loop
      await cb(list[i], i);
    }
  }
}

describe('common/sort', () => {
  test('foreach does not sort when zIndex identical and sort3d=false', () => {
    const g = new FakeGraphic([
      { _uid: 1, attribute: { zIndex: 0 } },
      { _uid: 2, attribute: { zIndex: 0 } }
    ]);

    const order: number[] = [];
    foreach(g as any, 0, (child: any) => {
      order.push(child._uid);
      return false;
    });

    expect(order).toEqual([1, 2]);
  });

  test('foreach sorts by zIndex (reverse=false)', () => {
    const g = new FakeGraphic([
      { _uid: 1, attribute: { zIndex: 1 } },
      { _uid: 2, attribute: { zIndex: 0 } },
      { _uid: 3, attribute: { zIndex: 1 } }
    ]);

    const order: number[] = [];
    foreach(g as any, 0, (child: any) => {
      order.push(child._uid);
      return false;
    });

    expect(order).toEqual([2, 1, 3]);
  });

  test('foreach sorts by zIndex (reverse=true)', () => {
    const g = new FakeGraphic([
      { _uid: 1, attribute: { zIndex: 1 } },
      { _uid: 2, attribute: { zIndex: 0 } },
      { _uid: 3, attribute: { zIndex: 1 } }
    ]);

    const order: number[] = [];
    foreach(g as any, 0, (child: any) => {
      order.push(child._uid);
      return false;
    }, true);

    expect(order).toEqual([3, 1, 2]);
  });

  test('foreach sort3d sorts within same zIndex by z', () => {
    const g = new FakeGraphic([
      { _uid: 1, attribute: { zIndex: 0, z: 5 } },
      { _uid: 2, attribute: { zIndex: 0, z: 1 } }
    ]);

    const order1: number[] = [];
    foreach(g as any, 0, (child: any) => {
      order1.push(child._uid);
      return false;
    }, false, true);
    expect(order1).toEqual([1, 2]);

    const order2: number[] = [];
    foreach(g as any, 0, (child: any) => {
      order2.push(child._uid);
      return false;
    }, true, true);
    expect(order2).toEqual([2, 1]);
  });

  test('foreach stops when cb returns true', () => {
    const g = new FakeGraphic([
      { _uid: 1, attribute: { zIndex: 0 } },
      { _uid: 2, attribute: { zIndex: 1 } }
    ]);

    const cb = jest.fn(() => true);
    foreach(g as any, 0, cb);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  test('foreachAsync forwards to forEachChildrenAsync', async () => {
    const g = new FakeGraphic([{ _uid: 1, attribute: { zIndex: 0 } }]);
    const spy = jest.spyOn(g as any, 'forEachChildrenAsync');
    await foreachAsync(g as any, 0, async () => undefined, true);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][1]).toBe(true);
  });

  test('findNextGraphic returns next in sorted order', () => {
    const g = new FakeGraphic([
      { _uid: 1, attribute: { zIndex: 0 } },
      { _uid: 2, attribute: { zIndex: 1 } }
    ]);

    expect(findNextGraphic(g as any, 1, 0, false)?._uid).toBe(2);
    expect(findNextGraphic(g as any, 2, 0, false)).toBeNull();

    expect(findNextGraphic(g as any, 2, 0, true)?._uid).toBe(1);
    expect(findNextGraphic(g as any, 999, 0, false)).toBeNull();

    const g2 = new FakeGraphic([
      { _uid: 1, attribute: { zIndex: 0 } },
      { _uid: 2, attribute: { zIndex: 0 } },
      { _uid: 3, attribute: { zIndex: 1 } }
    ]);
    expect(findNextGraphic(g2 as any, 1, 0, false)?._uid).toBe(2);
    expect(findNextGraphic(g2 as any, 2, 0, false)?._uid).toBe(3);
  });
});
