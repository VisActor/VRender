import { getTextAlignAttrOfVerticalDir, isVisible, removeRepeatPoint, traverseGroup } from '../../../src/util/common';

describe('util/common', () => {
  test('isVisible', () => {
    expect(isVisible()).toBe(false);
    expect(isVisible(null as any)).toBe(false);
    expect(isVisible({} as any)).toBe(true);
    expect(isVisible({ visible: false } as any)).toBe(false);
  });

  test('removeRepeatPoint only removes consecutive duplicates', () => {
    const points: any[] = [
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 0 }
    ];

    expect(removeRepeatPoint(points as any)).toEqual([{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 0 }]);
  });

  test('traverseGroup traverses recursively and allows stopping', () => {
    const leaf1: any = { id: 'leaf1', isContainer: false, forEachChildren: (_cb: any): void => undefined };
    const leaf2: any = { id: 'leaf2', isContainer: false, forEachChildren: (_cb: any): void => undefined };
    const container: any = {
      id: 'container',
      isContainer: true,
      forEachChildren: (cb: any): void => {
        cb(leaf2);
      }
    };

    const root: any = {
      forEachChildren: (cb: any): void => {
        cb(leaf1);
        cb(container);
      }
    };

    const visited: string[] = [];
    traverseGroup(root, node => {
      visited.push(String((node as any).id));
      if ((node as any).id === 'container') {
        return true;
      }
      return false;
    });

    expect(visited).toEqual(['leaf1', 'container']);

    visited.length = 0;
    traverseGroup(root, node => {
      visited.push(String((node as any).id));
      return false;
    });

    expect(visited).toEqual(['leaf1', 'container', 'leaf2']);
  });

  test('getTextAlignAttrOfVerticalDir branches', () => {
    expect(getTextAlignAttrOfVerticalDir(true, 0, 'top' as any)).toEqual({ textAlign: 'right', textBaseline: 'middle' });

    expect(getTextAlignAttrOfVerticalDir(false, Math.PI / 2, 'top' as any).textAlign).toBe('left');
    expect(getTextAlignAttrOfVerticalDir(false, Math.PI / 2, 'bottom' as any).textAlign).toBe('right');
    expect(getTextAlignAttrOfVerticalDir(false, Math.PI / 2, 'center' as any).textAlign).toBe('center');

    expect(getTextAlignAttrOfVerticalDir(false, Math.PI / 2, 'inside' as any).textBaseline).toBe('bottom');
    expect(getTextAlignAttrOfVerticalDir(false, (Math.PI * 3) / 2, 'inside' as any).textBaseline).toBe('top');
  });
});
