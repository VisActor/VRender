import type {
  IGlobal,
  ILayer,
  ILayerHandlerContribution,
  ILayerParams,
  IStage,
  IStageParams,
  IWindow
} from '../../../src/interface';
import type { IGraphic, IGraphicAttribute } from '../../../src/interface/graphic';
import { GraphicFactory, LayerFactory, StageFactory } from '../../../src/factory';

class StageStub {
  readonly params: Partial<IStageParams>;

  constructor(params: Partial<IStageParams>) {
    this.params = params;
  }
}

class LayerStub {
  readonly stage: IStage;
  readonly global: any;
  readonly window: IWindow;
  readonly params: ILayerParams;

  constructor(stage: IStage, global: any, window: IWindow, params: ILayerParams) {
    this.stage = stage;
    this.global = global;
    this.window = window;
    this.params = params;
  }
}

class GraphicStub {
  readonly attribute: Partial<IGraphicAttribute>;

  constructor(attribute: Partial<IGraphicAttribute>) {
    this.attribute = attribute;
  }
}

describe('factory module', () => {
  test('StageFactory should create stage instances with forwarded params', () => {
    const factory = new StageFactory(StageStub as any);
    const params = { width: 320, height: 180 };

    const stage = factory.create(params);

    expect(stage).toBeInstanceOf(StageStub);
    expect((stage as any).params).toEqual(params);
  });

  test('LayerFactory should create layer instances with explicit dependencies', () => {
    const factory = new LayerFactory(LayerStub as any);
    const stage = { id: 'stage-1' } as unknown as IStage;
    const global = { env: 'browser' } as unknown as IGlobal;
    const window = { id: 'window-1' } as unknown as IWindow;
    const layerHandler = { type: 'static' } as ILayerHandlerContribution;
    const params = { main: true, layerMode: 'static', layerHandler } as ILayerParams;

    const layer = factory.create({ stage, global, window, params });

    expect(layer).toBeInstanceOf(LayerStub);
    expect((layer as any).stage).toBe(stage);
    expect((layer as any).global).toBe(global);
    expect((layer as any).window).toBe(window);
    expect((layer as any).params).toBe(params);
  });

  test('GraphicFactory should register creators and create graphics by type', () => {
    const factory = new GraphicFactory();
    const attrs = { x: 10, y: 20 };

    factory.register('stub', GraphicStub as any);

    const graphic = factory.create('stub', attrs);

    expect(graphic).toBeInstanceOf(GraphicStub);
    expect((graphic as any).attribute).toEqual(attrs);
  });

  test('GraphicFactory should keep registry isolated per instance', () => {
    const firstFactory = new GraphicFactory();
    const secondFactory = new GraphicFactory();

    firstFactory.register('stub', GraphicStub as any);

    expect(() => secondFactory.create('stub', {})).toThrow(/stub/);
  });
});
