declare const require: any;
export {};

describe('vrender-core index side effects', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('should not preload legacy modules when importing index', () => {
    jest.isolateModules(() => {
      const preLoadAllModule = jest.fn();
      const legacyBindingContext = { id: 'legacy-context' };

      jest.doMock('../../../src/legacy/bootstrap', () => ({
        createLegacySingletonProxy: jest.fn(
          (resolver: () => unknown) =>
            new Proxy(
              {},
              {
                get(_target, key) {
                  return (resolver() as any)[key];
                }
              }
            )
        ),
        getLegacyBindingContext: jest.fn(() => legacyBindingContext),
        preLoadAllModule,
        resolveLegacySingleton: jest.fn(() => ({})),
        resolveLegacyNamed: jest.fn()
      }));

      const mod = require('../../../src/index');

      expect(preLoadAllModule).not.toHaveBeenCalled();
      expect(mod.container).toBe(legacyBindingContext);
    });
  });
});
