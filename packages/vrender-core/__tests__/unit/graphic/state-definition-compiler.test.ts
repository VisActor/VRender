import { StateDefinitionCompiler } from '../../../src/graphic/state/state-definition-compiler';

function expectDefinition(compiled: Map<string, any>, name: string): any {
  const definition = compiled.get(name);
  expect(definition).toBeDefined();
  return definition;
}

describe('StateDefinitionCompiler', () => {
  test('should normalize mixed shorthand and full state definitions', () => {
    const compiler = new StateDefinitionCompiler<any>();

    const compiled = compiler.compile({
      hover: { fill: 'red' },
      selected: {
        name: 'selected',
        priority: 5,
        patch: {
          stroke: 'blue'
        },
        exclude: ['hover']
      }
    });

    expect(Array.from(compiled.keys())).toEqual(['hover', 'selected']);
    expect(expectDefinition(compiled, 'hover')).toMatchObject({
      name: 'hover',
      priority: 0,
      rank: 0,
      patch: {
        fill: 'red'
      },
      hasResolver: false
    });
    expect(expectDefinition(compiled, 'selected')).toMatchObject({
      name: 'selected',
      priority: 5,
      patch: {
        stroke: 'blue'
      },
      hasResolver: false
    });
    expect(Array.from(expectDefinition(compiled, 'hover').affectedKeys)).toEqual(['fill']);
    expect(Array.from(expectDefinition(compiled, 'selected').exclude)).toEqual(['hover']);
  });

  test('should allocate stable rank by priority then lexical name order', () => {
    const compiler = new StateDefinitionCompiler<any>();

    const compiled = compiler.compile({
      gamma: { priority: 0, patch: { opacity: 0.3 } },
      alpha: { priority: 0, patch: { fill: 'red' } },
      beta: { priority: 1, patch: { stroke: 'blue' } }
    });

    expect(expectDefinition(compiled, 'alpha').rank).toBe(0);
    expect(expectDefinition(compiled, 'gamma').rank).toBe(1);
    expect(expectDefinition(compiled, 'beta').rank).toBe(2);
  });

  test('should compute exclude and suppress transitive closures and warn on cycles', () => {
    const compiler = new StateDefinitionCompiler<any>();
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    const compiled = compiler.compile({
      hover: { patch: { fill: 'red' }, exclude: ['active'] },
      active: { patch: { opacity: 0.5 }, exclude: ['hover'], suppress: ['selected'] },
      selected: { patch: { stroke: 'blue' }, suppress: ['pressed'] },
      pressed: { patch: { lineWidth: 2 } }
    });

    expect(Array.from(expectDefinition(compiled, 'selected').suppress)).toEqual(['pressed']);
    expect(Array.from(expectDefinition(compiled, 'active').suppress)).toEqual(['selected', 'pressed']);
    expect(Array.from(expectDefinition(compiled, 'hover').exclude)).toEqual(['active']);
    expect(Array.from(expectDefinition(compiled, 'active').exclude)).toEqual(['hover']);
    expect(warnSpy).toHaveBeenCalled();

    warnSpy.mockRestore();
  });

  test('should derive affected keys from static patch and declared resolver keys', () => {
    const compiler = new StateDefinitionCompiler<any>();

    const compiled = compiler.compile({
      hover: {
        patch: {
          fill: 'red',
          lineWidth: 2
        }
      },
      active: {
        resolver: () => ({
          opacity: 0.5
        }),
        declaredAffectedKeys: ['opacity', 'shadowBlur']
      },
      selected: {
        resolver: () => ({
          stroke: 'blue'
        })
      }
    });

    expect(Array.from(expectDefinition(compiled, 'hover').affectedKeys)).toEqual(['fill', 'lineWidth']);
    expect(Array.from(expectDefinition(compiled, 'active').affectedKeys)).toEqual(['opacity', 'shadowBlur']);
    expect(Array.from(expectDefinition(compiled, 'selected').affectedKeys)).toEqual([]);
  });

  test('should treat nullish values as empty patches and allow empty inputs', () => {
    const compiler = new StateDefinitionCompiler<any>();

    const empty = compiler.compile({});
    const compiled = compiler.compile({
      hover: null as any,
      active: undefined as any
    });

    expect(empty.size).toBe(0);
    expect(expectDefinition(compiled, 'hover')).toMatchObject({
      name: 'hover',
      patch: undefined
    });
    expect(expectDefinition(compiled, 'active')).toMatchObject({
      name: 'active',
      patch: undefined
    });
  });
});
