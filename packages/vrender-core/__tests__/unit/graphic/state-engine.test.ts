import { StateDefinitionCompiler } from '../../../src/graphic/state/state-definition-compiler';
import { StateEngine } from '../../../src/graphic/state/state-engine';

describe('StateEngine', () => {
  test('should sort by priority and resolve exclude and suppress', () => {
    const compiledDefinitions = new StateDefinitionCompiler<any>().compile({
      hover: { patch: { fill: 'red' } },
      active: { priority: 5, patch: { opacity: 0.5 } },
      selected: { priority: 10, patch: { stroke: 'blue' }, exclude: ['active'], suppress: ['hover'] }
    });
    const engine = new StateEngine<any>({ compiledDefinitions });

    const transition = engine.applyStates(['hover', 'selected', 'active']);

    expect(transition.changed).toBe(true);
    expect(transition.activeStates).toEqual(['hover', 'selected']);
    expect(transition.effectiveStates).toEqual(['selected']);
    expect(transition.suppressed).toEqual(['hover']);
    expect(engine.activeStates).toEqual(['hover', 'selected']);
    expect(engine.effectiveStates).toEqual(['selected']);
    expect(engine.resolvedPatch).toEqual({
      stroke: 'blue'
    });
  });

  test('should not restore excluded states after removing the winner state', () => {
    const compiledDefinitions = new StateDefinitionCompiler<any>().compile({
      hover: { patch: { fill: 'red' } },
      selected: { priority: 10, patch: { stroke: 'blue' }, exclude: ['hover'] }
    });
    const engine = new StateEngine<any>({ compiledDefinitions });

    engine.applyStates(['hover', 'selected']);
    const transition = engine.removeState('selected');

    expect(transition.activeStates).toEqual([]);
    expect(transition.effectiveStates).toEqual([]);
    expect(engine.resolvedPatch).toEqual({});
  });

  test('should support add, toggle and clear state flows', () => {
    const compiledDefinitions = new StateDefinitionCompiler<any>().compile({
      hover: { patch: { fill: 'red' } },
      active: { patch: { opacity: 0.5 } }
    });
    const engine = new StateEngine<any>({ compiledDefinitions });

    expect(engine.addState('hover', false)).toMatchObject({
      activeStates: ['hover'],
      effectiveStates: ['hover']
    });
    expect(engine.addState('active', true)).toMatchObject({
      activeStates: ['active', 'hover'],
      effectiveStates: ['active', 'hover']
    });
    expect(engine.toggleState('hover')).toMatchObject({
      activeStates: ['active'],
      effectiveStates: ['active']
    });
    expect(engine.clearStates()).toMatchObject({
      activeStates: [],
      effectiveStates: []
    });
    expect(engine.resolvedPatch).toEqual({});
  });

  test('should cache resolver patches and invalidate on demand', () => {
    const resolver = jest.fn(() => ({
      opacity: 0.5
    }));
    const compiledDefinitions = new StateDefinitionCompiler<any>().compile({
      active: {
        resolver,
        declaredAffectedKeys: ['opacity']
      }
    });
    const engine = new StateEngine<any>({ compiledDefinitions });

    engine.applyStates(['active']);
    engine.applyStates(['active']);

    expect(resolver).toHaveBeenCalledTimes(1);
    expect(engine.resolvedPatch).toEqual({
      opacity: 0.5
    });

    engine.invalidateResolverCache();
    engine.applyStates(['active']);

    expect(resolver).toHaveBeenCalledTimes(2);
  });

  test('should let stateProxy fully decide per-state style contribution when it is present', () => {
    const stateProxy = jest.fn((stateName: string) => ({ fill: `${stateName}-fill` }));
    const engine = new StateEngine<any>({
      compiledDefinitions: new StateDefinitionCompiler<any>().compile({
        selected: { priority: 5, patch: { stroke: 'blue' } }
      }),
      stateProxy
    });

    const transition = engine.applyStates(['hover', 'selected']);

    expect(transition.activeStates).toEqual(['selected', 'hover']);
    expect(transition.effectiveStates).toEqual(['selected', 'hover']);
    expect(stateProxy).toHaveBeenCalledWith('selected', ['selected', 'hover']);
    expect(stateProxy).toHaveBeenCalledWith('hover', ['selected', 'hover']);
    expect(engine.resolvedPatch).toEqual({
      fill: 'hover-fill'
    });
  });
});
