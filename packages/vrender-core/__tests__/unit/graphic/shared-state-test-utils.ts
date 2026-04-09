import { Group } from '../../../src/graphic/group';
import { Stage } from '../../../src/core/stage';
import type {
  IGlobal,
  ILayer,
  IPickerService,
  IPluginService,
  IRenderService,
  IStage,
  IStageParams,
  IWindow
} from '../../../src/interface';
import type { IGraphicService } from '../../../src/interface/graphic-service';

type SharedStateTestStageOptions = {
  immediateRaf?: boolean;
};

type SharedStateTestStage = Stage & {
  flushScheduledFrames: () => void;
  flushAllScheduledFrames: (limit?: number) => void;
  flushScheduledFramesAsync: () => Promise<void>;
  flushAllScheduledFramesAsync: (limit?: number) => Promise<void>;
  getScheduledFrameCount: () => number;
};

class LayerNodeStub extends Group implements ILayer {
  main = true;
  renderCount = 0;
  offscreen = false;
  subLayers = new Map();
  background = 'transparent';
  dpr = 1;
  opacity = 1;
  pickable = true;
  layer = this as unknown as ILayer;
  blendMode = 'normal';
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
  afterDraw = jest.fn();
  resize = jest.fn();
  resizeView = jest.fn();
  setDpr = jest.fn();
  combineSubLayer = jest.fn();
  startAnimate = jest.fn();
  setToFrame = jest.fn();
  prepare = jest.fn();
  drawTo = jest.fn();
  release = jest.fn();
  getNativeHandler = jest.fn(
    () =>
      ({
        type: 'static',
        init: jest.fn(),
        resize: jest.fn(),
        resizeView: jest.fn(),
        setDpr: jest.fn(),
        mergeDirtyRegions: jest.fn(),
        prepare: jest.fn(),
        drawTo: jest.fn(),
        getContext: jest.fn(),
        release: jest.fn(),
        getCanvas: jest.fn(),
        renderGroup: jest.fn()
      } as any)
  );
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

function createGlobalStub(options: SharedStateTestStageOptions = {}) {
  const scheduledFrames = new Map<number, FrameRequestCallback>();
  const performanceRafById = new Map<number, any>();
  let rafHandle = 1;
  const scheduleFrame = (callback: FrameRequestCallback) => {
    const nextHandle = rafHandle++;
    if (options.immediateRaf) {
      callback(0);
    } else {
      scheduledFrames.set(nextHandle, callback);
    }
    return nextHandle;
  };
  const cancelFrame = (handle: number) => {
    scheduledFrames.delete(handle);
  };

  return {
    env: 'browser',
    devicePixelRatio: 1,
    supportEvent: false,
    supportsTouchEvents: false,
    supportsPointerEvents: false,
    supportsMouseEvents: true,
    measureTextMethod: 'native',
    hooks: {
      onSetEnv: {
        tap: jest.fn(),
        unTap: jest.fn()
      }
    },
    getRequestAnimationFrame: jest.fn(() => scheduleFrame),
    getCancelAnimationFrame: jest.fn(() => cancelFrame),
    getSpecifiedRequestAnimationFrame: jest.fn(() => scheduleFrame),
    getSpecifiedCancelAnimationFrame: jest.fn(() => cancelFrame),
    getSpecifiedPerformanceRAF: jest.fn((id: number) => {
      if (!performanceRafById.has(id)) {
        performanceRafById.set(id, {
          addAnimationFrameCb: (callback: FrameRequestCallback) => scheduleFrame(callback),
          removeAnimationFrameCb: (handle: number) => {
            cancelFrame(handle);
            return true;
          },
          wait: () =>
            new Promise<void>(resolve => {
              scheduleFrame(() => resolve());
            })
        });
      }
      return performanceRafById.get(id);
    }),
    __flushScheduledFrames: () => {
      const callbacks = Array.from(scheduledFrames.values());
      scheduledFrames.clear();
      callbacks.forEach(callback => callback(0));
    },
    __getScheduledFrameCount: () => scheduledFrames.size
  } as unknown as IGlobal & {
    __flushScheduledFrames: () => void;
    __getScheduledFrameCount: () => number;
  };
}

function createGraphicServiceStub(): IGraphicService {
  return {
    onAttributeUpdate: jest.fn(),
    onSetStage: jest.fn(),
    onRemove: jest.fn(),
    onRelease: jest.fn(),
    onAddIncremental: jest.fn(),
    onClearIncremental: jest.fn(),
    beforeUpdateAABBBounds: jest.fn(),
    afterUpdateAABBBounds: jest.fn(),
    clearAABBBounds: jest.fn()
  } as unknown as IGraphicService;
}

export function createSharedStateTestStage(options: SharedStateTestStageOptions = {}): SharedStateTestStage {
  const global = createGlobalStub(options);
  const window = createWindowStub();
  const layer = new LayerNodeStub({});
  const renderService = { renderTreeRoots: [], reInit: jest.fn() } as unknown as IRenderService;
  const pluginService = { active: jest.fn(), release: jest.fn() } as unknown as IPluginService;
  const graphicService = createGraphicServiceStub();
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

  const stage = new Stage(
    {
      width: 300,
      height: 150,
      viewBox: { x1: 0, y1: 0, x2: 300, y2: 150 },
      autoRender: false,
      autoRefresh: false,
      disableDirtyBounds: true
    } as Partial<IStageParams>,
    {
      global,
      window,
      renderService,
      pluginService,
      layerService: layerService as any,
      graphicService,
      pickerService
    } as any
  ) as SharedStateTestStage;

  (stage.defaultLayer as any).setStage(stage, stage.defaultLayer);
  stage.flushScheduledFrames = () => (global as any).__flushScheduledFrames();
  stage.flushAllScheduledFrames = (limit: number = 20) => {
    let remaining = limit;
    while (stage.getScheduledFrameCount() > 0 && remaining > 0) {
      stage.flushScheduledFrames();
      remaining -= 1;
    }
  };
  stage.flushScheduledFramesAsync = async () => {
    stage.flushScheduledFrames();
    await Promise.resolve();
  };
  stage.flushAllScheduledFramesAsync = async (limit: number = 20) => {
    let remaining = limit;
    while (stage.getScheduledFrameCount() > 0 && remaining > 0) {
      await stage.flushScheduledFramesAsync();
      remaining -= 1;
    }
  };
  stage.getScheduledFrameCount = () => (global as any).__getScheduledFrameCount();

  return stage;
}
