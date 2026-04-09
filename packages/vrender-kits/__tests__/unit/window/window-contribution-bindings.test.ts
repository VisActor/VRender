describe('window contribution bindings', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('bindBrowserWindowContribution should bind named window handlers without container.get dynamic lookup', () => {
    jest.isolateModules(() => {
      const whenTargetNamed = jest.fn();
      const toService = jest.fn(() => ({ whenTargetNamed }));
      const toDynamicValue = jest.fn(() => ({ whenTargetNamed }));
      const toSelf = jest.fn();
      const bind = jest.fn((token: any) => {
        if (token === 'WindowHandlerContribution') {
          return { toService, toDynamicValue };
        }
        return { toSelf };
      });

      jest.doMock('@visactor/vrender-core', () => ({
        Generator: { GenAutoIncrementId: jest.fn(() => 1) },
        BaseWindowHandlerContribution: class BaseWindowHandlerContribution {},
        WindowHandlerContribution: 'WindowHandlerContribution',
        application: { global: {} }
      }));
      jest.doMock('@visactor/vutils', () => ({
        Matrix: class Matrix {},
        AABBBounds: class AABBBounds {}
      }));
      jest.doMock('../../../src/canvas/contributions/browser', () => ({
        BrowserCanvas: class BrowserCanvas {}
      }));

      // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
      const mod = require('../../../src/window/contributions/browser-contribution');

      mod.bindBrowserWindowContribution({ bind });

      expect(toSelf).toHaveBeenCalled();
      expect(toService).toHaveBeenCalledWith(mod.BrowserWindowHandlerContribution);
      expect(toDynamicValue).not.toHaveBeenCalled();
      expect(whenTargetNamed).toHaveBeenCalledWith(mod.BrowserWindowHandlerContribution.env);
    });
  });
});
