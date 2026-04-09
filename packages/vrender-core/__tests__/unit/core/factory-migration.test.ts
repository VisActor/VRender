import { Group } from '../../../src/graphic/group';
import { application } from '../../../src/application';
import { Stage } from '../../../src/core/stage';
import { DefaultLayerService } from '../../../src/core/layer-service';
import { DefaultWindow } from '../../../src/core/window';
import type {
  IGlobal,
  ILayer,
  ILayerHandlerContribution,
  IPickerService,
  IPluginService,
  IRenderService,
  IStage,
  IStageParams,
  IWindow,
  IWindowHandlerContribution
} from '../../../src/interface';
import type { IGraphicService } from '../../../src/interface/graphic-service';
import { StageFactory } from '../../../src/factory';

class StageCtorStub {
  constructor(public readonly params: Partial<IStageParams>, public readonly deps: unknown) {}
}

class LayerNodeStub extends Group implements ILayer {
  main = true;
  renderCount = 0;
  offscreen = false;
  subLayers = new Map();
  background = 'transparent';
  dpr = 1;
  opacity = 1;
  pickable = true;
  layer = this;
  blendMode = 'normal';
  afterDrawCbs: ((l: this) => void)[] = [];
  layerMode = 'static' as const;
  stage?: IStage;
  canvasId?: string;
  imageData?: ImageData;

  get width(): number {
    return 0;
  }

  get height(): number {
    return 0;
  }

  get viewWidth(): number {
    return 0;
  }

  get viewHeight(): number {
    return 0;
  }

  get dirtyBound(): any {
    return null;
  }

  pick(): false {
    return false;
  }

  render = jest.fn();
  afterDraw = jest.fn((cb: (l: this) => void) => {
    this.afterDrawCbs.push(cb);
  });
  resize = jest.fn();
  resizeView = jest.fn();
  setDpr = jest.fn();
  combineSubLayer = jest.fn();
  startAnimate = jest.fn();
  setToFrame = jest.fn();
  prepare = jest.fn();
  drawTo = jest.fn();
  release = jest.fn();
  getNativeHandler = jest.fn(() => ({ type: 'static' } as unknown as ILayerHandlerContribution));
}

function createBounds(x1: number, y1: number, x2: number, y2: number) {
  return {
    x1,
    y1,
    x2,
    y2,
    width() {
      return this.x2 - this.x1;
    },
    height() {
      return this.y2 - this.y1;
    },
    translate(dx: number, dy: number) {
      this.x1 += dx;
      this.x2 += dx;
      this.y1 += dy;
      this.y2 += dy;
    }
  };
}

function createWindowStub(): IWindow {
  let viewBox = createBounds(0, 0, 0, 0);

  return {
    width: 0,
    height: 0,
    dpr: 1,
    title: '',
    resizable: true,
    minHeight: 0,
    minWidth: 0,
    maxHeight: Infinity,
    maxWidth: Infinity,
    hooks: {
      onChange: { tap: jest.fn(), unTap: jest.fn() } as any
    },
    style: {},
    create: jest.fn(function (this: IWindow, params) {
      this.width = params.width ?? 0;
      this.height = params.height ?? 0;
      this.dpr = params.dpr;
      viewBox = params.viewBox
        ? createBounds(params.viewBox.x1, params.viewBox.y1, params.viewBox.x2, params.viewBox.y2)
        : createBounds(0, 0, this.width, this.height);
    }),
    setWindowHandler: jest.fn(),
    setDpr: jest.fn(),
    resize: jest.fn(),
    configure: jest.fn(),
    getContext: jest.fn(),
    getNativeHandler: jest.fn(() => ({} as any)),
    getContainer: jest.fn(),
    getImageBuffer: jest.fn(),
    clearViewBox: jest.fn(),
    setViewBox: jest.fn((nextViewBox: any) => {
      viewBox = createBounds(nextViewBox.x1, nextViewBox.y1, nextViewBox.x2, nextViewBox.y2);
    }),
    getViewBox: jest.fn(() => viewBox as any),
    setViewBoxTransform: jest.fn(),
    getViewBoxTransform: jest.fn(() => ({
      transformPoint: (source: { x: number; y: number }, target: { x: number; y: number }) => {
        target.x = source.x;
        target.y = source.y;
      }
    })),
    hasSubView: jest.fn(() => false),
    pointTransform: jest.fn((x: number, y: number) => ({ x, y })),
    getBoundingClientRect: jest.fn(),
    isVisible: jest.fn(() => true),
    onVisibleChange: jest.fn(),
    getTopLeft: jest.fn(() => ({ top: 0, left: 0 })),
    setEventListenerTransformer: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
    release: jest.fn()
  } as unknown as IWindow;
}

function createGlobalStub(): IGlobal {
  return {
    env: 'browser',
    devicePixelRatio: 2,
    supportEvent: false,
    hooks: {
      onSetEnv: {
        tap: jest.fn(),
        unTap: jest.fn()
      }
    }
  } as unknown as IGlobal;
}

describe('factory migration', () => {
  test('StageFactory should forward explicit stage dependencies to stage constructors', () => {
    const deps = { windowFactory: jest.fn() };
    const factory = new StageFactory(StageCtorStub as any, () => deps);

    const stage = factory.create({ width: 320, height: 180 });

    expect((stage as any).params).toEqual({ width: 320, height: 180 });
    expect((stage as any).deps).toBe(deps);
  });

  test('Stage should use explicit assembly dependencies before container-backed services', () => {
    const global = createGlobalStub();
    const primaryWindow = createWindowStub();
    const exportWindow = createWindowStub();
    const windowFactory = jest.fn().mockReturnValueOnce(primaryWindow).mockReturnValueOnce(exportWindow);
    const layer = new LayerNodeStub({});
    const renderService = { renderTreeRoots: [], reInit: jest.fn() } as unknown as IRenderService;
    const pluginService = { active: jest.fn(), release: jest.fn() } as unknown as IPluginService;
    const graphicService = {} as IGraphicService;
    const pickerService = { reInit: jest.fn(), pick: jest.fn() } as unknown as IPickerService;
    const layerService = {
      createLayer: jest.fn(() => layer),
      prepareStageLayer: jest.fn(),
      releaseLayer: jest.fn(),
      restLayerCount: jest.fn(),
      getStageLayer: jest.fn(),
      layerCount: jest.fn(),
      releaseStage: jest.fn()
    };

    const stage = new Stage({ width: 300, height: 150 }, {
      global,
      windowFactory,
      renderService,
      pluginService,
      layerService: layerService as any,
      graphicService,
      pickerService
    } as any);

    expect(windowFactory).toHaveBeenCalledTimes(1);
    expect(primaryWindow.create as jest.Mock).toHaveBeenCalledWith(
      expect.objectContaining({ width: 300, height: 150, dpr: 2 })
    );
    expect(pluginService.active as jest.Mock).toHaveBeenCalledWith(stage, stage.params);
    expect(layerService.createLayer).toHaveBeenCalledWith(stage, { main: true });
    expect(stage.getPickerService()).toBe(pickerService);

    stage.renderToNewWindow();

    expect(windowFactory).toHaveBeenCalledTimes(2);
    expect(exportWindow.create as jest.Mock).toHaveBeenCalled();
    expect(layer.drawTo).toHaveBeenCalled();
  });

  test('Stage should prefer application assembly services without legacy container fallbacks', () => {
    const global = createGlobalStub();
    const primaryWindow = createWindowStub();
    const layer = new LayerNodeStub({});
    const windowFactory = jest.fn(() => primaryWindow);
    const renderService = { renderTreeRoots: [], reInit: jest.fn() } as unknown as IRenderService;
    const pluginService = { active: jest.fn(), release: jest.fn() } as unknown as IPluginService;
    const graphicService = {} as IGraphicService;
    const pickerService = { reInit: jest.fn(), pick: jest.fn() } as unknown as IPickerService;
    const pickerServiceFactory = jest.fn(() => pickerService);
    const layerService = {
      createLayer: jest.fn(() => layer),
      prepareStageLayer: jest.fn(),
      releaseLayer: jest.fn(),
      restLayerCount: jest.fn(),
      getStageLayer: jest.fn(),
      layerCount: jest.fn(),
      releaseStage: jest.fn()
    };
    const originalApplicationState = {
      global: application.global,
      renderService: (application as any).renderService,
      pluginService: (application as any).pluginService,
      layerService: application.layerService,
      graphicService: application.graphicService,
      windowFactory: (application as any).windowFactory,
      pickerServiceFactory: (application as any).pickerServiceFactory
    };
    application.global = global;
    (application as any).renderService = renderService;
    (application as any).pluginService = pluginService;
    application.layerService = layerService as any;
    application.graphicService = graphicService;
    (application as any).windowFactory = windowFactory;
    (application as any).pickerServiceFactory = pickerServiceFactory;

    try {
      const stage = new Stage({ width: 300, height: 150 });

      expect(windowFactory).toHaveBeenCalledTimes(1);
      expect(primaryWindow.create as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({ width: 300, height: 150, dpr: 2 })
      );
      expect(pluginService.active as jest.Mock).toHaveBeenCalledWith(stage, stage.params);
      expect(layerService.createLayer).toHaveBeenCalledWith(stage, { main: true });
      expect(stage.getPickerService()).toBe(pickerService);
      expect(pickerServiceFactory).toHaveBeenCalledTimes(1);
    } finally {
      application.global = originalApplicationState.global;
      (application as any).renderService = originalApplicationState.renderService;
      (application as any).pluginService = originalApplicationState.pluginService;
      application.layerService = originalApplicationState.layerService;
      application.graphicService = originalApplicationState.graphicService;
      (application as any).windowFactory = originalApplicationState.windowFactory;
      (application as any).pickerServiceFactory = originalApplicationState.pickerServiceFactory;
    }
  });

  test('DefaultLayerService should create layers through the injected layer factory', () => {
    const global = {
      env: 'browser',
      getStaticCanvasCount: jest.fn(() => 1),
      getDynamicCanvasCount: jest.fn(() => 0)
    } as unknown as IGlobal;
    const createdLayer = { id: 'layer-1' } as unknown as ILayer;
    const layerFactory = {
      create: jest.fn(() => createdLayer)
    };
    const layerHandler = { type: 'static' } as unknown as ILayerHandlerContribution;
    const layerHandlerFactory = jest.fn(() => layerHandler);
    const stage = { window: { id: 'window-1' } } as unknown as IStage;
    const service = new DefaultLayerService(global, layerFactory as any, layerHandlerFactory);

    const layer = service.createLayer(stage, { main: true });

    expect(layer).toBe(createdLayer);
    expect(layerHandlerFactory).toHaveBeenCalledWith('static');
    expect(layerFactory.create).toHaveBeenCalledWith({
      stage,
      global,
      window: stage.window,
      params: expect.objectContaining({
        main: true,
        layerMode: 'static',
        layerHandler
      })
    });
  });

  test('DefaultLayerService should prefer application handler resolver without legacy container fallbacks', () => {
    const global = {
      env: 'browser',
      getStaticCanvasCount: jest.fn(() => 1),
      getDynamicCanvasCount: jest.fn(() => 0)
    } as unknown as IGlobal;
    const createdLayer = { id: 'layer-1' } as unknown as ILayer;
    const layerFactory = {
      create: jest.fn(() => createdLayer)
    };
    const layerHandler = { type: 'static' } as unknown as ILayerHandlerContribution;
    const stage = { window: { id: 'window-1' } } as unknown as IStage;
    const originalLayerHandlerFactory = (application as any).layerHandlerFactory;
    const applicationLayerHandlerFactory = jest.fn(() => layerHandler);
    (application as any).layerHandlerFactory = applicationLayerHandlerFactory;

    try {
      const service = new DefaultLayerService(global, layerFactory as any);

      const layer = service.createLayer(stage, { main: true });

      expect(layer).toBe(createdLayer);
      expect(applicationLayerHandlerFactory).toHaveBeenCalledWith('static');
      expect(layerFactory.create).toHaveBeenCalledWith({
        stage,
        global,
        window: stage.window,
        params: expect.objectContaining({
          main: true,
          layerMode: 'static',
          layerHandler
        })
      });
    } finally {
      (application as any).layerHandlerFactory = originalLayerHandlerFactory;
    }
  });

  test('DefaultWindow should resolve handlers from an explicit handler factory', () => {
    const global = createGlobalStub();
    const handler = {
      configure: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn()
    } as unknown as IWindowHandlerContribution;
    const handlerFactory = jest.fn(() => handler);

    const window = new DefaultWindow(global, handlerFactory);

    expect(handlerFactory).toHaveBeenCalledWith('browser');
    expect(handler.configure as jest.Mock).toHaveBeenCalledWith(window, global);
  });
});
