import { createRect } from '../../../src/graphic/rect';
import { createGroup } from '../../../src/graphic/group';
import { createSharedStateTestStage } from './shared-state-test-utils';

describe('group shared-state registration lifecycle', () => {
  test('should update scope registrations and resolved style after reparent', () => {
    const stage = createSharedStateTestStage();
    const left = createGroup({});
    const right = createGroup({});
    const rect = createRect({ x: 0, y: 0, width: 10, height: 10, fill: 'base' });

    (stage.theme as any).stateDefinitions = {
      hover: { fill: 'theme-hover' }
    };
    (left as any).sharedStateDefinitions = {
      hover: { fill: 'left-hover' }
    };
    (right as any).sharedStateDefinitions = {
      hover: { fill: 'right-hover' }
    };

    stage.appendChild(left);
    stage.appendChild(right);
    left.appendChild(rect);

    rect.useStates(['hover'], false);
    expect(rect.attribute.fill).toBe('left-hover');
    expect(((left as any).sharedStateScope?.subtreeActiveDescendants as Set<any>)?.has(rect)).toBe(true);

    right.appendChild(rect);
    stage.hooks.beforeRender.call(stage);

    expect(((left as any).sharedStateScope?.subtreeActiveDescendants as Set<any>)?.has(rect)).toBe(false);
    expect(((right as any).sharedStateScope?.subtreeActiveDescendants as Set<any>)?.has(rect)).toBe(true);
    expect(rect.attribute.fill).toBe('right-hover');
  });

  test('should unregister active graphics on detach to stage root and on release', () => {
    const stage = createSharedStateTestStage();
    const group = createGroup({});
    const rect = createRect({ x: 0, y: 0, width: 10, height: 10, fill: 'base' });

    (stage.theme as any).stateDefinitions = {
      hover: { fill: 'theme-hover' }
    };
    (group as any).sharedStateDefinitions = {
      hover: { fill: 'group-hover' }
    };

    stage.appendChild(group);
    group.appendChild(rect);

    rect.useStates(['hover'], false);
    expect(((group as any).sharedStateScope?.subtreeActiveDescendants as Set<any>)?.has(rect)).toBe(true);

    stage.appendChild(rect);
    stage.hooks.beforeRender.call(stage);

    expect(((group as any).sharedStateScope?.subtreeActiveDescendants as Set<any>)?.has(rect)).toBe(false);
    expect(((stage as any).rootSharedStateScope?.subtreeActiveDescendants as Set<any>)?.has(rect)).toBe(true);
    expect(rect.attribute.fill).toBe('theme-hover');

    rect.release();

    expect(((stage as any).rootSharedStateScope?.subtreeActiveDescendants as Set<any>)?.has(rect)).toBe(false);
  });

  test('should not crash when removing animated graphics from the tree', () => {
    const stage = createSharedStateTestStage();
    const group = createGroup({});
    const rect = createRect({ x: 0, y: 0, width: 10, height: 10, fill: 'base' });
    const rect2 = createRect({ x: 0, y: 0, width: 10, height: 10, fill: 'base' });

    stage.appendChild(group);
    group.appendChild(rect);
    group.appendChild(rect2);

    const trackedTimeline = {
      isGlobal: true,
      addAnimate: jest.fn(),
      removeAnimate: jest.fn()
    };
    (rect as any).animates = new Map([[1, { timeline: trackedTimeline, setTimeline: jest.fn() }]]);
    (rect2 as any).animates = new Map([[2, { timeline: trackedTimeline, setTimeline: jest.fn() }]]);

    expect(() => group.removeChild(rect)).not.toThrow();
    expect(() => group.removeAllChild()).not.toThrow();
  });

  test('should rebind active shared-state graphics on incremental append', () => {
    const stage = createSharedStateTestStage();
    const group = createGroup({});
    const rect = createRect({ x: 0, y: 0, width: 10, height: 10, fill: 'base' });

    stage.appendChild(group);
    stage.appendChild(rect);
    (group as any).sharedStateDefinitions = {
      hover: { fill: 'group-hover' }
    };

    rect.useStates(['hover'], false);
    group.incrementalAppendChild(rect);
    stage.hooks.beforeRender.call(stage);

    expect((rect as any).boundSharedStateScope).toBe((group as any).sharedStateScope);
    expect(((group as any).sharedStateScope?.subtreeActiveDescendants as Set<any>)?.has(rect)).toBe(true);
    expect(rect.attribute.fill).toBe('group-hover');
  });
});
