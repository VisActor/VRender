import { Stage } from '../../../src/core/stage';
import type {
  IGraphicService,
  ILayer,
  ILayerService,
  IPluginService,
  IRenderService,
  IWindow
} from '../../../src/interface';
import type { IGlobal } from '../../../src/interface/global';

function createGlobalStub(): IGlobal {
  return {
    env: 'browser',
    devicePixelRatio: 2,
    hooks: {
      onSetEnv: {
        tap: jest.fn(),
        unTap: jest.fn()
      }
    },
    setEnv: jest.fn(),
    getStaticCanvasCount: jest.fn(() => 1),
    getDynamicCanvasCount: jest.fn(() => 0)
  } as unknown as IGlobal;
}

function createWindowStub(): IWindow {
  return {
    create: jest.fn(),
    setViewBox: jest.fn(),
    getViewBox: jest.fn(() => ({ width: () => 0, height: () => 0, x1: 0, y1: 0, translate: jest.fn() })),
    getContext: jest.fn(),
    release: jest.fn(),
    width: 0,
    height: 0,
    dpr: 2
  } as unknown as IWindow;
}

function createLayerStub(): ILayer {
  return {
    setStage: jest.fn(),
    combineSubLayer: jest.fn(),
    incrementalClear: jest.fn(),
    render: jest.fn(),
    release: jest.fn(),
    appendChild: jest.fn(),
    removeAllChild: jest.fn(),
    forEachChildren: jest.fn()
  } as unknown as ILayer;
}

function createLayerServiceStub(layer: ILayer): ILayerService {
  return {
    createLayer: jest.fn(() => layer),
    prepareStageLayer: jest.fn(),
    releaseLayer: jest.fn(),
    restLayerCount: jest.fn(),
    getStageLayer: jest.fn(),
    layerCount: jest.fn(),
    releaseStage: jest.fn()
  } as unknown as ILayerService;
}

describe('stage external canvas defaults', () => {
  test('should default external canvas stages to canvasControled=false', () => {
    const global = createGlobalStub();
    const window = createWindowStub();
    const layer = createLayerStub();

    new Stage(
      {
        canvas: {} as HTMLCanvasElement,
        width: 300,
        height: 150
      },
      {
        global,
        window,
        renderService: { renderTreeRoots: [], reInit: jest.fn() } as unknown as IRenderService,
        pluginService: { active: jest.fn(), release: jest.fn() } as unknown as IPluginService,
        layerService: createLayerServiceStub(layer),
        graphicService: {} as IGraphicService
      } as any
    );

    expect(window.create).toHaveBeenCalledWith(
      expect.objectContaining({
        canvasControled: false
      })
    );
  });

  test('should keep generated canvas stages controlled by default', () => {
    const global = createGlobalStub();
    const window = createWindowStub();
    const layer = createLayerStub();

    new Stage(
      {
        width: 300,
        height: 150
      },
      {
        global,
        window,
        renderService: { renderTreeRoots: [], reInit: jest.fn() } as unknown as IRenderService,
        pluginService: { active: jest.fn(), release: jest.fn() } as unknown as IPluginService,
        layerService: createLayerServiceStub(layer),
        graphicService: {} as IGraphicService
      } as any
    );

    expect(window.create).toHaveBeenCalledWith(
      expect.objectContaining({
        canvasControled: true
      })
    );
  });
});
