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

  test('should refresh dirty shared definitions through setStates even when target state names are unchanged', () => {
    const stage = createSharedStateTestStage();
    const group = createGroup({});
    const rect = createRect({ x: 0, y: 0, width: 10, height: 10, fill: 'base' });

    (group as any).sharedStateDefinitions = {
      hover: { fill: 'red' }
    };

    stage.appendChild(group);
    group.appendChild(rect);

    rect.setStates(['hover'], false);

    expect(rect.attribute.fill).toBe('red');

    (group as any).sharedStateDefinitions = {
      hover: { fill: 'green' }
    };

    rect.setStates(['hover'], false);

    expect(rect.currentStates).toEqual(['hover']);
    expect(rect.resolvedStatePatch).toEqual({ fill: 'green' });
    expect(rect.attribute.fill).toBe('green');
  });
});
