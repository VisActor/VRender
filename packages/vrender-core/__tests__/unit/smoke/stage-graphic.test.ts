declare let require: any;

type MockCanvasBundle = {
  nativeCanvas: any;
  canvas: any;
  context: any;
};

function createMockCanvas(width: number, height: number, nativeCanvas?: any): MockCanvasBundle {
  const canvasEl: any =
    nativeCanvas ??
    ({
      width,
      height,
      style: {},
      offsetLeft: 0,
      offsetTop: 0,
      getBoundingClientRect: () => ({ left: 0, top: 0, width, height })
    } as any);

  canvasEl.width = width;
  canvasEl.height = height;

  const gradientMock = { addColorStop: jest.fn() };

  const rawContext: any = new Proxy(
    {
      canvas: canvasEl,
      isPointInPath: jest.fn(() => false),
      isPointInStroke: jest.fn(() => false),
      getImageData: jest.fn(() => ({ data: new Uint8ClampedArray(width * height * 4) })),
      measureText: jest.fn((text: string) => ({ width: String(text).length * 10 })),
      createLinearGradient: jest.fn(() => gradientMock),
      createRadialGradient: jest.fn(() => gradientMock),
      createConicGradient: jest.fn(() => gradientMock),
      createPattern: jest.fn(() => ({}))
    },
    {
      get(target, prop) {
        if (prop in target) {
          return (target as any)[prop];
        }
        if (typeof prop === 'string') {
          const fn = jest.fn();
          (target as any)[prop] = fn;
          return fn;
        }
        return undefined;
      },
      set(target, prop, value) {
        (target as any)[prop as any] = value;
        return true;
      }
    }
  );

  canvasEl.getContext = canvasEl.getContext ?? jest.fn(() => rawContext);

  const wrapperCanvas: any = {
    nativeCanvas: canvasEl,
    dpr: 1,
    x: 0,
    y: 0,
    applyPosition: jest.fn(),
    resize: (w: number, h: number) => {
      canvasEl.width = w;
      canvasEl.height = h;
    },
    release: jest.fn()
  };

  const wrapperContext: any = new Proxy(
    {
      canvas: wrapperCanvas,
      getCanvas: () => wrapperCanvas
    },
    {
      get(target, prop) {
        if (prop in target) {
          return (target as any)[prop];
        }
        if (prop in rawContext) {
          return (rawContext as any)[prop];
        }
        if (typeof prop === 'string') {
          const fn = jest.fn();
          (rawContext as any)[prop] = fn;
          return fn;
        }
        return undefined;
      },
      set(_target, prop, value) {
        (rawContext as any)[prop as any] = value;
        return true;
      }
    }
  );

  wrapperCanvas.getContext = () => wrapperContext;

  return {
    nativeCanvas: canvasEl,
    canvas: wrapperCanvas,
    context: wrapperContext
  };
}

describe('smoke: stage & graphic (node stubs)', () => {
  test('createStage + add rect + render does not throw', () => {
    jest.isolateModules(() => {
      const { getLegacyBindingContext } = require('../../../src/legacy/bootstrap');
      const { vglobal } = require('../../../src/modules');
      const { application } = require('../../../src/application');
      const { EnvContribution } = require('../../../src/constants');
      const { WindowHandlerContribution } = require('../../../src/core/window');
      const { CanvasFactory, Context2dFactory } = require('../../../src/canvas/constants');
      const { createStage } = require('../../../src/create');
      const { createRect } = require('../../../src/graphic/rect');

      const envName = 'node';

      class StubEnvContribution {
        type = envName;
        supportEvent = false;
        supportsTouchEvents = false;
        supportsPointerEvents = false;
        supportsMouseEvents = false;
        applyStyles = false;

        configure(service: any) {
          if (service.env === this.type) {
            service.setActiveEnvContribution(this);
          }
        }

        getDevicePixelRatio() {
          return 1;
        }

        getDynamicCanvasCount() {
          return 0;
        }

        getStaticCanvasCount() {
          return 0;
        }

        createCanvas(params: any) {
          return createMockCanvas(params.width, params.height).nativeCanvas;
        }

        createOffscreenCanvas(params: any) {
          return this.createCanvas(params);
        }

        releaseCanvas() {
          return;
        }

        getRequestAnimationFrame() {
          return (cb: any) => setTimeout(() => cb(Date.now()), 16) as any;
        }

        getCancelAnimationFrame() {
          return (h: any) => clearTimeout(h);
        }

        addEventListener() {
          return;
        }

        removeEventListener() {
          return;
        }

        dispatchEvent() {
          return false;
        }

        release() {
          return;
        }

        loadImage() {
          return Promise.resolve({ loadState: 'fail', data: null });
        }

        loadSvg() {
          return Promise.resolve({ loadState: 'fail', data: null });
        }

        loadJson() {
          return Promise.resolve({ loadState: 'fail', data: null });
        }

        loadArrayBuffer() {
          return Promise.resolve({ loadState: 'fail', data: null });
        }

        loadBlob() {
          return Promise.resolve({ loadState: 'fail', data: null });
        }

        loadFont() {
          return Promise.resolve();
        }

        isMacOS() {
          return false;
        }

        copyToClipBoard() {
          return;
        }
      }

      class StubWindowHandlerContribution {
        type = envName;
        private _canvas: any;
        private _context: any;
        private _w = 0;
        private _h = 0;
        private _dpr = 1;

        configure(window: any, global: any) {
          if (global.env === this.type) {
            window.setWindowHandler(this);
          }
        }

        getTitle() {
          return '';
        }

        getWH() {
          return { width: this._w, height: this._h };
        }

        getXY() {
          return { x: 0, y: 0 };
        }

        createWindow(params: any) {
          this._w = params.width;
          this._h = params.height;
          this._dpr = params.dpr ?? 1;

          const bundle = createMockCanvas(this._w, this._h, params.canvas);
          this._canvas = bundle.canvas;
          this._context = bundle.context;
        }

        releaseWindow() {
          return;
        }

        resizeWindow(width: number, height: number) {
          this._w = width;
          this._h = height;
          this._canvas?.resize?.(width, height);
        }

        setDpr(dpr: number) {
          this._dpr = dpr;
          if (this._canvas) {
            this._canvas.dpr = dpr;
          }
        }

        getContext() {
          return this._context;
        }

        getNativeHandler() {
          return this._canvas;
        }

        getDpr() {
          return this._dpr;
        }

        getImageBuffer() {
          return new Uint8Array(0);
        }

        addEventListener() {
          return;
        }

        removeEventListener() {
          return;
        }

        dispatchEvent() {
          return false;
        }

        getStyle() {
          return {};
        }

        setStyle() {
          return;
        }

        getBoundingClientRect() {
          return (
            this._canvas?.nativeCanvas?.getBoundingClientRect?.() ?? {
              left: 0,
              top: 0,
              width: this._w,
              height: this._h
            }
          );
        }

        clearViewBox() {
          return;
        }

        setViewBox() {
          return;
        }

        setViewBoxTransform() {
          return;
        }

        getViewBox() {
          const box: any = {
            x1: 0,
            y1: 0,
            x2: this._w,
            y2: this._h,
            width: () => box.x2 - box.x1,
            height: () => box.y2 - box.y1,
            setValue: (x1: number, y1: number, x2: number, y2: number) => {
              box.x1 = x1;
              box.y1 = y1;
              box.x2 = x2;
              box.y2 = y2;
              return box;
            }
          };
          return box;
        }

        getViewBoxTransform() {
          return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
        }

        hasSubView() {
          return false;
        }

        getContainer(): any {
          return null;
        }

        resize() {
          return;
        }

        getViewBoxBounds() {
          return this.getViewBox();
        }
      }

      // Bind stub contributions & factories
      const legacyContext = getLegacyBindingContext();
      legacyContext.bind(EnvContribution).toConstantValue(new StubEnvContribution());
      legacyContext
        .bind(WindowHandlerContribution)
        .toConstantValue(new StubWindowHandlerContribution())
        .whenTargetNamed(envName);

      legacyContext
        .bind(CanvasFactory)
        .toDynamicValue(() => {
          return (params: any) => createMockCanvas(params.width, params.height, params.nativeCanvas).canvas;
        })
        .whenTargetNamed(envName);

      legacyContext
        .bind(Context2dFactory)
        .toDynamicValue(() => {
          return (canvas: any) => canvas.getContext();
        })
        .whenTargetNamed(envName);

      // Activate env before creating stage (DefaultWindow.active depends on global.env)
      vglobal.setEnv(envName as any);

      const stage = createStage({
        width: 200,
        height: 100,
        autoRender: false,
        autoRefresh: false,
        disableDirtyBounds: true,
        background: 'transparent'
      });

      const rect = createRect({ x: 10, y: 20, width: 30, height: 40, fill: 'red' });
      stage.defaultLayer.add(rect);

      expect(() => stage.render()).not.toThrow();
      expect(() => stage.resize(300, 150)).not.toThrow();
      expect(() => stage.release()).not.toThrow();

      // Basic sanity: env is applied and renderService is lazy-resolvable
      expect(application.global.env).toBe(envName);
      expect(application.renderService).toBeTruthy();
    });
  });
});
