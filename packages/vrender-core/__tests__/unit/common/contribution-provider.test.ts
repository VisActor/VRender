import {
  bindContributionProvider,
  bindContributionProviderNoSingletonScope,
  ContributionStore
} from '../../../src/common/contribution-provider';

type DynamicValueFactory = (ctx: { container: any }) => any;

function createProviderCache(container: any, serviceId: any) {
  let factory: DynamicValueFactory | undefined;

  const chain: any = {
    toDynamicValue: (fn: DynamicValueFactory) => {
      factory = fn;
      return chain;
    },
    inSingletonScope: () => chain,
    whenTargetNamed: () => chain
  };

  const bind = jest.fn(() => chain);

  bindContributionProvider(bind as any, serviceId);
  expect(factory).toBeDefined();

  return factory!({ container });
}

describe('contribution-provider', () => {
  afterEach(() => {
    ContributionStore.store.clear();
  });

  test('getContributions caches results and only calls container.getAll once', () => {
    const container = {
      isBound: jest.fn(() => true),
      getAll: jest.fn(() => [1, 2])
    };

    const id = Symbol('svc');
    const cache = createProviderCache(container, id);

    expect(cache.getContributions()).toEqual([1, 2]);
    expect(cache.getContributions()).toEqual([1, 2]);
    expect(container.getAll).toHaveBeenCalledTimes(1);
  });

  test('getContributions returns empty array when service is not bound', () => {
    const container = {
      isBound: jest.fn(() => false),
      getAll: jest.fn(() => [1, 2])
    };

    const id = Symbol('svc');
    const cache = createProviderCache(container, id);

    expect(cache.getContributions()).toEqual([]);
    expect(container.getAll).not.toHaveBeenCalled();
  });

  test('refresh does nothing if contributions have not been requested yet', () => {
    const container = {
      isBound: jest.fn(() => true),
      getAll: jest.fn(() => [1])
    };

    const cache = createProviderCache(container, Symbol('svc'));
    cache.refresh();

    expect(container.getAll).not.toHaveBeenCalled();
  });

  test('refresh reloads contributions if cache is initialized', () => {
    const container = {
      isBound: jest.fn(() => true),
      getAll: jest.fn(() => [1, 2])
    };

    const cache = createProviderCache(container, Symbol('svc'));

    expect(cache.getContributions()).toEqual([1, 2]);

    container.getAll.mockReturnValueOnce([3]);
    cache.refresh();

    expect(cache.getContributions()).toEqual([3]);
  });

  test('ContributionStore.refreshAllContributions refreshes all caches', () => {
    const c1 = { isBound: jest.fn(() => true), getAll: jest.fn(() => [1]) };
    const c2 = { isBound: jest.fn(() => true), getAll: jest.fn(() => [2]) };

    const cache1 = createProviderCache(c1, Symbol('svc1'));
    const cache2 = createProviderCache(c2, Symbol('svc2'));

    cache1.getContributions();

    const spy1 = jest.spyOn(cache1, 'refresh');
    const spy2 = jest.spyOn(cache2, 'refresh');

    ContributionStore.refreshAllContributions();

    expect(spy1).toHaveBeenCalledTimes(1);
    expect(spy2).toHaveBeenCalledTimes(1);
  });

  test('bindContributionProviderNoSingletonScope does not call inSingletonScope', () => {
    let factory: DynamicValueFactory | undefined;

    const chain: any = {
      toDynamicValue: (fn: DynamicValueFactory) => {
        factory = fn;
        return chain;
      },
      inSingletonScope: jest.fn(() => chain),
      whenTargetNamed: jest.fn(() => chain)
    };

    const bind = jest.fn(() => chain);
    const serviceId = Symbol('svc');

    bindContributionProviderNoSingletonScope(bind as any, serviceId);

    expect(chain.inSingletonScope).not.toHaveBeenCalled();
    expect(chain.whenTargetNamed).toHaveBeenCalledTimes(1);

    // sanity: factory works
    const container = { isBound: jest.fn(() => false), getAll: jest.fn(() => []) };
    const cache = factory!({ container });
    expect(cache.getContributions()).toEqual([]);
  });
});
