import { StateStyleResolver } from '../../../src/graphic/state/state-style-resolver';

describe('StateStyleResolver', () => {
  test('should keep current shallow merge semantics by default', () => {
    const resolver = new StateStyleResolver<any>();

    const resolved = resolver.resolve(
      { shadowBlur: { value: 1, color: 'black' } },
      {
        hover: { fill: 'red', shadowBlur: { value: 2 } },
        active: { stroke: 'orange', shadowBlur: { color: 'red' } }
      },
      undefined,
      ['hover', 'active']
    );

    expect(resolved).toEqual({
      fill: 'red',
      stroke: 'orange',
      shadowBlur: { color: 'red' }
    });
  });

  test('should prefer stateProxy over static states and ignore nullish proxy results', () => {
    const resolver = new StateStyleResolver<any>();
    const stateProxy = jest
      .fn()
      .mockImplementationOnce(() => null)
      .mockImplementationOnce(() => ({ fill: 'proxy-fill', opacity: 0.4 }));

    const resolved = resolver.resolve(
      { fill: 'blue' },
      {
        hover: { fill: 'red' },
        active: { fill: 'green' }
      },
      stateProxy,
      ['hover', 'active']
    );

    expect(stateProxy).toHaveBeenNthCalledWith(1, 'hover', ['hover', 'active']);
    expect(stateProxy).toHaveBeenNthCalledWith(2, 'active', ['hover', 'active']);
    expect(resolved).toEqual({
      fill: 'proxy-fill',
      opacity: 0.4
    });
  });

  test('should sort states before resolving when stateSort is provided', () => {
    const resolver = new StateStyleResolver<any>();
    const stateProxy = jest.fn((stateName: string) => ({ fill: stateName }));

    const resolved = resolver.resolve({}, undefined, stateProxy, ['hover', 'active'], (left: string, right: string) =>
      left.localeCompare(right)
    );

    expect(stateProxy).toHaveBeenNthCalledWith(1, 'active', ['active', 'hover']);
    expect(stateProxy).toHaveBeenNthCalledWith(2, 'hover', ['active', 'hover']);
    expect(resolved).toEqual({ fill: 'hover' });
  });

  test('should support deep merge when explicitly enabled', () => {
    const resolver = new StateStyleResolver<any>({ mergeMode: 'deep' });

    const resolved = resolver.resolve(
      { shadowBlur: { value: 1, color: 'black' } },
      {
        hover: { shadowBlur: { value: 2 } },
        active: { shadowBlur: { color: 'red' } }
      },
      undefined,
      ['hover', 'active']
    );

    expect(resolved).toEqual({
      shadowBlur: { value: 2, color: 'red' }
    });
  });
});
