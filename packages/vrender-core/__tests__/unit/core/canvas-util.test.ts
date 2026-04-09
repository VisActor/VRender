export {};
declare const require: any;

describe('canvas util', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('wrapCanvas and wrapContext should resolve factories from application instead of container', () => {
    jest.isolateModules(() => {
      const canvasFactory = jest.fn(() => {
        return (params: unknown) => ({ kind: 'canvas', params });
      });
      const context2dFactory = jest.fn(() => {
        return (canvas: unknown, dpr: number) => ({ kind: 'context', canvas, dpr });
      });

      jest.doMock('../../../src/application', () => ({
        application: {
          global: { env: 'browser' },
          canvasFactory,
          context2dFactory
        }
      }));

      const { wrapCanvas, wrapContext } = require('../../../src/canvas/util');

      expect(wrapCanvas({ width: 10, height: 20 })).toEqual({
        kind: 'canvas',
        params: { width: 10, height: 20 }
      });
      expect(wrapContext({ id: 'canvas' }, 2)).toEqual({
        kind: 'context',
        canvas: { id: 'canvas' },
        dpr: 2
      });
      expect(canvasFactory).toHaveBeenCalledWith('browser');
      expect(context2dFactory).toHaveBeenCalledWith('browser');
    });
  });
});
