declare const require: any;
export {};

describe('vrender-core index side effects', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('should not preload legacy modules when importing index', () => {
    jest.isolateModules(() => {
      const preLoadAllModule = jest.fn();

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
        preLoadAllModule,
        resolveLegacySingleton: jest.fn(() => ({})),
        resolveLegacyNamed: jest.fn()
      }));

      const mod = require('../../../src/index');

      expect(preLoadAllModule).not.toHaveBeenCalled();
      expect('container' in mod).toBe(false);
    });
  });
});
