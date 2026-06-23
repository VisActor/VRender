export {};
declare const require: any;

describe('global module', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('should expose vglobal from a dedicated module and sync application.global', () => {
    jest.isolateModules(() => {
      const globalInstance = { id: 'global' };
      const resolveLegacySingleton = jest.fn(() => globalInstance);
      const application = {} as Record<string, unknown>;

      jest.doMock('../../../src/legacy/bootstrap', () => ({
        createLegacySingletonProxy: jest.fn(
          (resolver: () => unknown) =>
            new Proxy({} as Record<string, unknown>, {
              get(_target, key: PropertyKey) {
                return (resolver() as any)[key];
              }
            })
        ),
        resolveLegacySingleton
      }));
      jest.doMock('../../../src/constants', () => ({
        VGlobal: 'VGlobal'
      }));
      jest.doMock('../../../src/application', () => ({
        application
      }));

      const mod = require('../../../src/global');

      expect(resolveLegacySingleton).not.toHaveBeenCalled();
      expect((mod.vglobal as { id: string }).id).toBe('global');
      expect((application.global as { id: string }).id).toBe('global');
      expect(resolveLegacySingleton).toHaveBeenCalledWith('VGlobal');
    });
  });
});
