import { createRect } from '../../../src/graphic/rect';
import { createGroup } from '../../../src/graphic/group';
import { createSharedStateTestStage } from './shared-state-test-utils';

describe('shared state scope contract', () => {
  test('should ignore local graphic states when a shared state scope is bound', () => {
    const stage = createSharedStateTestStage();
    const group = createGroup({});
    const rect = createRect({ x: 0, y: 0, width: 10, height: 10, fill: 'base', stroke: 'black' });

    (group as any).sharedStateDefinitions = {
      hover: { fill: 'red' }
    };
    rect.states = {
      hover: { fill: 'local-hover' },
      selected: {
        name: 'selected',
        priority: 10,
        suppress: ['hover'],
        patch: { stroke: 'blue' }
      }
    };

    stage.appendChild(group);
    group.appendChild(rect);

    rect.useStates(['hover', 'selected'], false);

    expect(rect.currentStates).toEqual(['hover', 'selected']);
    expect(rect.effectiveStates).toEqual(['hover', 'selected']);
    expect(rect.resolvedStatePatch).toEqual({ fill: 'red' });
    expect(rect.attribute.fill).toBe('red');
    expect(rect.attribute.stroke).toBe('black');
  });

  test('should keep local graphic states working outside shared scopes', () => {
    const stage = createSharedStateTestStage();
    const rect = createRect({ x: 20, y: 0, width: 10, height: 10, fill: 'base', stroke: 'black' });

    rect.states = {
      pressed: { stroke: 'blue' },
      selected: {
        name: 'selected',
        priority: 10,
        suppress: ['pressed'],
        patch: { fill: 'green' }
      }
    };

    stage.appendChild(rect);

    rect.useStates(['pressed', 'selected'], false);

    expect(rect.currentStates).toEqual(['pressed', 'selected']);
    expect(rect.effectiveStates).toEqual(['selected']);
    expect(rect.resolvedStatePatch).toEqual({ fill: 'green' });
    expect(rect.attribute.fill).toBe('green');
    expect(rect.attribute.stroke).toBe('black');
  });

  test('should apply shared definitions while ignoring same-name local definitions', () => {
    const stage = createSharedStateTestStage();
    const group = createGroup({});
    const rect = createRect({ x: 0, y: 0, width: 10, height: 10, fill: 'base' });

    (group as any).sharedStateDefinitions = {
      hover: { fill: 'red' }
    };
    rect.states = {
      hover: { fill: 'local-hover' }
    };

    stage.appendChild(group);
    group.appendChild(rect);

    rect.useStates(['hover'], false);

    expect(rect.resolvedStatePatch).toEqual({ fill: 'red' });
    expect(rect.attribute.fill).toBe('red');
  });
});
