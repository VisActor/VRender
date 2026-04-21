declare const require: any;
export {};

describe('browser window contribution canvas lookup', () => {
  beforeEach(() => {
    jest.resetModules();
    document.body.innerHTML = '';
  });

  test('should fall back to document lookup for canvas id strings', () => {
    document.body.innerHTML = '<canvas id="canvas-by-id" width="100" height="50"></canvas>';
    const nativeCanvas = document.getElementById('canvas-by-id');
    const browserCanvasInstances: any[] = [];

    jest.isolateModules(() => {
      jest.doMock('@visactor/vrender-core', () => ({
        Generator: { GenAutoIncrementId: jest.fn(() => 1) },
        BaseWindowHandlerContribution: class BaseWindowHandlerContribution {
          configure(window: any) {
            window.setWindowHandler(this);
          }
        },
        WindowHandlerContribution: 'WindowHandlerContribution',
        application: {
          global: {
            optimizeVisible: false,
            getElementById: jest.fn(() => null),
            getRootElement: jest.fn(() => document.body),
            createCanvas: jest.fn()
          }
        }
      }));
      jest.doMock('@visactor/vutils', () => ({
        Matrix: class Matrix {},
        AABBBounds: class AABBBounds {}
      }));
      jest.doMock('../../../src/canvas/contributions/browser', () => ({
        BrowserCanvas: class BrowserCanvas {
          nativeCanvas: any;
          width: number;
          height: number;
          dpr: number;
          canvasControled: boolean;

          constructor(options: any) {
            this.nativeCanvas = options.nativeCanvas;
            this.width = options.width;
            this.height = options.height;
            this.dpr = options.dpr;
            this.canvasControled = options.canvasControled;
            browserCanvasInstances.push(this);
          }

          getContext() {
            return {};
          }
        }
      }));

      const { BrowserWindowHandlerContribution } = require('../../../src/window/contributions/browser-contribution');
      const contribution = new BrowserWindowHandlerContribution();

      expect(() =>
        contribution.createWindow({
          canvas: 'canvas-by-id',
          width: 100,
          height: 50,
          dpr: 1
        })
      ).not.toThrow();

      expect(browserCanvasInstances).toHaveLength(1);
      expect(browserCanvasInstances[0].nativeCanvas).toBe(nativeCanvas);
      expect(browserCanvasInstances[0].canvasControled).toBe(false);
    });
  });
});
