import { createRect } from '../../../src/graphic/rect';
import { createGroup } from '../../../src/graphic/group';
import { createSharedStateTestStage } from './shared-state-test-utils';

describe('shared state scope precedence', () => {
  test('should bind root scope to theme defaults when no group ancestor exists', () => {
    const stage = createSharedStateTestStage();
    const rect = createRect({ x: 0, y: 0, width: 10, height: 10, fill: 'black' });

    (stage.theme as any).stateDefinitions = {
      hover: { fill: 'blue' }
    };

    stage.appendChild(rect);
    rect.useStates(['hover'], false);

    expect((stage as any).rootSharedStateScope).toBeDefined();
    expect((rect as any).boundSharedStateScope).toBe((stage as any).rootSharedStateScope);
    expect(rect.attribute.fill).toBe('blue');
  });

  test('should prefer nearest group shared state over outer group defaults', () => {
    const stage = createSharedStateTestStage();
    const outer = createGroup({});
    const inner = createGroup({});
    const rect = createRect({ x: 0, y: 0, width: 10, height: 10, opacity: 1 });

    (stage.theme as any).stateDefinitions = {
      selected: { opacity: 0.25 }
    };
    (outer as any).sharedStateDefinitions = {
      selected: { opacity: 0.5 }
    };
    (inner as any).sharedStateDefinitions = {
      selected: { opacity: 1 }
    };

    stage.appendChild(outer);
    outer.appendChild(inner);
    inner.appendChild(rect);

    rect.useStates(['selected'], false);

    expect((rect as any).boundSharedStateScope).toBe((inner as any).sharedStateScope);
    expect(rect.attribute.opacity).toBe(1);
  });

  test('should inherit outer group state when inner group has no local override', () => {
    const stage = createSharedStateTestStage();
    const outer = createGroup({});
    const inner = createGroup({});
    const rect = createRect({ x: 0, y: 0, width: 10, height: 10, fill: 'black' });

    (outer as any).sharedStateDefinitions = {
      hover: { fill: 'red' }
    };

    stage.appendChild(outer);
    outer.appendChild(inner);
    inner.appendChild(rect);

    rect.useStates(['hover'], false);

    expect(rect.attribute.fill).toBe('red');
  });
});
