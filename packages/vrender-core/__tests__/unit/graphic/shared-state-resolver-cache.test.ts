import { createRect } from '../../../src/graphic/rect';
import { createGroup } from '../../../src/graphic/group';
import { createSharedStateTestStage } from './shared-state-test-utils';

describe('shared state resolver cache', () => {
  test('should keep resolver cache per-graphic instead of sharing across graphics', () => {
    const stage = createSharedStateTestStage();
    const group = createGroup({});
    const resolver = jest.fn(({ graphic }) => ({
      fill: `${graphic.attribute.x}-resolved`
    }));
    const rectA = createRect({ x: 1, y: 0, width: 10, height: 10, fill: 'base' });
    const rectB = createRect({ x: 2, y: 0, width: 10, height: 10, fill: 'base' });

    (group as any).sharedStateDefinitions = {
      active: {
        resolver,
        declaredAffectedKeys: ['fill']
      }
    };

    stage.appendChild(group);
    group.appendChild(rectA);
    group.appendChild(rectB);

    rectA.useStates(['active'], false);
    rectB.useStates(['active'], false);

    expect(resolver).toHaveBeenCalledTimes(2);
    expect(rectA.attribute.fill).toBe('1-resolved');
    expect(rectB.attribute.fill).toBe('2-resolved');
  });

  test('should not let stateProxy override shared-state definitions with the same name', () => {
    const stage = createSharedStateTestStage();
    const group = createGroup({});
    const rect = createRect({ x: 0, y: 0, width: 10, height: 10, fill: 'base' });

    (group as any).sharedStateDefinitions = {
      hover: { fill: 'shared-hover' }
    };
    rect.stateProxy = jest.fn(() => ({ fill: 'proxy-hover' })) as any;

    stage.appendChild(group);
    group.appendChild(rect);

    rect.useStates(['hover'], false);

    expect(rect.resolvedStatePatch).toEqual({ fill: 'shared-hover' });
    expect(rect.attribute.fill).toBe('shared-hover');
    expect(rect.stateProxy).not.toHaveBeenCalled();
  });

  test('should allow stateProxy fallback for state names missing from a bound shared scope', () => {
    const stage = createSharedStateTestStage();
    const group = createGroup({});
    const rect = createRect({ x: 0, y: 0, width: 10, height: 10, fill: 'base', stroke: 'black' });

    (group as any).sharedStateDefinitions = {
      unrelated: { opacity: 0.5 }
    };
    rect.stateProxy = jest.fn((stateName: string) => {
      if (stateName === 'hover') {
        return { fill: 'proxy-hover' };
      }
      if (stateName === 'selected') {
        return { stroke: 'proxy-selected' };
      }
      return undefined;
    }) as any;

    stage.appendChild(group);
    group.appendChild(rect);

    rect.useStates(['hover'], false);

    expect(rect.currentStates).toEqual(['hover']);
    expect(rect.effectiveStates).toEqual(['hover']);
    expect(rect.resolvedStatePatch).toEqual({ fill: 'proxy-hover' });
    expect(rect.attribute.fill).toBe('proxy-hover');

    rect.addState('selected', true, false);

    expect(rect.currentStates).toEqual(['hover', 'selected']);
    expect(rect.effectiveStates).toEqual(['hover', 'selected']);
    expect(rect.resolvedStatePatch).toEqual({
      fill: 'proxy-hover',
      stroke: 'proxy-selected'
    });
    expect(rect.attribute.fill).toBe('proxy-hover');
    expect(rect.attribute.stroke).toBe('proxy-selected');
  });
});
