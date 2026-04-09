import { createRect } from '../../../src/graphic/rect';
import { createGroup } from '../../../src/graphic/group';
import { createSharedStateTestStage } from './shared-state-test-utils';

describe('shared state fallback', () => {
  test('should compile missing local states into the same adjudication pipeline', () => {
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
    expect(rect.effectiveStates).toEqual(['selected']);
    expect(rect.attribute.fill).toBe('base');
    expect(rect.attribute.stroke).toBe('blue');
  });
});
