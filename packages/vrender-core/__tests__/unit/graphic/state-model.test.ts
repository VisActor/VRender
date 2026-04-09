import { StateDefinitionCompiler } from '../../../src/graphic/state/state-definition-compiler';
import { StateEngine } from '../../../src/graphic/state/state-engine';
import { StateModel } from '../../../src/graphic/state/state-model';

describe('StateModel', () => {
  test('should expose static states and current state checks', () => {
    const model = new StateModel({
      states: {
        hover: { fill: 'red' },
        active: { lineWidth: 2 }
      },
      currentStates: ['hover']
    } as any);

    expect(model.hasState()).toBe(true);
    expect(model.hasState('hover')).toBe(true);
    expect(model.hasState('active')).toBe(false);
    expect(model.getState('hover')).toEqual({ fill: 'red' });
    expect(model.getCurrentStates()).toEqual(['hover']);
  });

  test('should sort next states after change detection and keep current semantics', () => {
    const model = new StateModel({
      currentStates: ['active', 'hover'],
      stateSort: (left: string, right: string) => left.localeCompare(right)
    });

    const unchanged = model.useStates(['active', 'hover']);

    expect(unchanged.changed).toBe(false);
    expect(unchanged.states).toEqual(['active', 'hover']);

    const reordered = model.useStates(['hover', 'active']);

    expect(reordered.changed).toBe(true);
    expect(reordered.states).toEqual(['active', 'hover']);
    expect(model.getCurrentStates()).toEqual(['active', 'hover']);
  });

  test('should append or replace current states following graphic addState semantics', () => {
    const model = new StateModel({
      currentStates: ['hover']
    });

    const duplicateSingle = model.addState('hover', false);
    expect(duplicateSingle.changed).toBe(false);
    expect(model.getCurrentStates()).toEqual(['hover']);

    const appended = model.addState('active', true);
    expect(appended.changed).toBe(true);
    expect(appended.states).toEqual(['hover', 'active']);

    const replaceWithExisting = model.addState('hover', false);
    expect(replaceWithExisting.changed).toBe(true);
    expect(replaceWithExisting.states).toEqual(['hover']);
  });

  test('should remove and toggle states following graphic semantics', () => {
    const model = new StateModel({
      currentStates: ['hover', 'active', 'selected']
    });

    const removed = model.removeState(['hover', 'active']);
    expect(removed.changed).toBe(true);
    expect(removed.states).toEqual(['selected']);

    const ignored = model.removeState('missing');
    expect(ignored.changed).toBe(false);
    expect(ignored.states).toEqual(['selected']);

    const toggledOn = model.toggleState('hover');
    expect(toggledOn.changed).toBe(true);
    expect(toggledOn.states).toEqual(['selected', 'hover']);

    const toggledOff = model.toggleState('hover');
    expect(toggledOff.changed).toBe(true);
    expect(toggledOff.states).toEqual(['selected']);
  });

  test('should clear current states and preserve optional stateProxy reference', () => {
    const stateProxy = jest.fn();
    const model = new StateModel({
      currentStates: ['hover'],
      stateProxy
    });

    const cleared = model.clearStates();

    expect(cleared.changed).toBe(true);
    expect(cleared.states).toEqual([]);
    expect(model.getCurrentStates()).toEqual([]);
    expect(model.stateProxy).toBe(stateProxy);
  });

  test('should expose exclusive group queries without mutating current states', () => {
    const model = new StateModel({
      currentStates: ['hover'],
      exclusiveGroups: {
        interaction: ['hover', 'active', 'pressed'],
        selection: ['selected']
      }
    });

    expect(model.getExclusiveGroup('hover')).toBe('interaction');
    expect(model.getMutuallyExclusiveStates('hover')).toEqual(['active', 'pressed']);
    expect(model.isMutuallyExclusive('hover', 'active')).toBe(true);
    expect(model.isMutuallyExclusive('hover', 'selected')).toBe(false);
    expect(model.getCurrentStates()).toEqual(['hover']);
  });

  test('should delegate transitions to stateEngine and expose effective states and resolved patch', () => {
    const engine = new StateEngine<any>({
      compiledDefinitions: new StateDefinitionCompiler<any>().compile({
        hover: { patch: { fill: 'red' } },
        selected: { priority: 10, patch: { stroke: 'blue' }, suppress: ['hover'] }
      })
    });
    const model = new StateModel<any>({
      currentStates: ['hover'],
      stateEngine: engine
    });

    const transition = model.addState('selected', true);

    expect(transition.changed).toBe(true);
    expect(transition.states).toEqual(['hover', 'selected']);
    expect(transition.effectiveStates).toEqual(['selected']);
    expect(model.getCurrentStates()).toEqual(['hover', 'selected']);
    expect(model.effectiveStates).toEqual(['selected']);
    expect(model.resolvedPatch).toEqual({
      stroke: 'blue'
    });
  });
});
