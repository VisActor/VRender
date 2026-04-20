import type { IGraphicRender } from '../../../src/interface/render';
import type { IStageParams } from '../../../src/interface/stage';
import { AppContext } from '../../../src/entries';
import { GraphicFactory, LayerFactory, StageFactory } from '../../../src/factory';
import { BasePlugin, type IPluginContext } from '../../../src/plugins';
import { ContributionRegistry, PickerRegistry, PluginRegistry, RendererRegistry } from '../../../src/registry';

class StageStub {
  released = false;
  releaseCount = 0;

  constructor(public readonly params: Partial<IStageParams>) {}

  release(): void {
    this.released = true;
    this.releaseCount += 1;
  }
}

class TrackingPlugin extends BasePlugin {
  installedWith?: IPluginContext;
  uninstallCount = 0;

  constructor(name = 'tracking-plugin') {
    super(name, '0.0.1');
  }

  install(context: IPluginContext): void {
    this.installedWith = context;
  }

  uninstall(): void {
    this.uninstallCount += 1;
  }
}

function createRenderer(type: string): IGraphicRender {
  return {
    type,
    numberType: 1,
    draw: jest.fn(),
    reInit: jest.fn()
  };
}

function createAppContext() {
  return new AppContext({
    registry: {
      renderer: new RendererRegistry(),
      picker: new PickerRegistry(),
      contribution: new ContributionRegistry(),
      plugin: new PluginRegistry()
    },
    factory: {
      stage: new StageFactory(StageStub as any),
      layer: new LayerFactory(),
      graphic: new GraphicFactory()
    }
  });
}

describe('app context', () => {
  test('should expose app-scoped factory and registry accessors', () => {
    const context = createAppContext();

    expect(context.getRegistry('renderer')).toBe(context.registry.renderer);
    expect(context.getRegistry('plugin')).toBe(context.registry.plugin);
    expect(context.getFactory('stage')).toBe(context.factory.stage);
    expect(context.getFactory('graphic')).toBe(context.factory.graphic);
  });

  test('should install and uninstall plugins within the same app instance', () => {
    const context = createAppContext();
    const plugin = new TrackingPlugin();

    context.installPlugin(plugin);

    expect(context.registry.plugin.get(plugin.name)).toBe(plugin);
    expect(plugin.installedWith).toBe(context);

    context.uninstallPlugin(plugin.name);

    expect(plugin.uninstallCount).toBe(1);
    expect(context.registry.plugin.get(plugin.name)).toBeUndefined();
  });

  test('should release created stages and clear app-scoped resources', () => {
    const context = createAppContext();
    const plugin = new TrackingPlugin();
    const rendererKey = Symbol('renderer');

    context.installPlugin(plugin);
    context.registry.renderer.register(rendererKey, createRenderer('rect'));
    const stage = context.createStage({ width: 320, height: 200 }) as unknown as StageStub;

    context.release();

    expect(stage.released).toBe(true);
    expect(stage.releaseCount).toBe(1);
    expect(plugin.uninstallCount).toBe(1);
    expect(context.registry.plugin.getAll()).toEqual([]);
    expect(context.registry.renderer.getAll()).toEqual([]);
    expect(context.released).toBe(true);
  });

  test('should unregister a released stage from app-scoped tracking', () => {
    const context = createAppContext();
    const stage1 = context.createStage({ width: 100, height: 100 }) as unknown as StageStub;
    const stage2 = context.createStage({ width: 200, height: 200 }) as unknown as StageStub;

    stage1.release();
    context.release();

    expect(stage1.released).toBe(true);
    expect(stage1.releaseCount).toBe(1);
    expect(stage2.released).toBe(true);
    expect(stage2.releaseCount).toBe(1);
  });

  test('should reject app operations after release', () => {
    const context = createAppContext();

    context.release();

    expect(() => context.createStage({ width: 10 })).toThrow('AppContext has been released');
    expect(() => context.installPlugin(new TrackingPlugin('late-plugin'))).toThrow('AppContext has been released');
    expect(() => context.getRegistry('renderer')).toThrow('AppContext has been released');
  });
});
