import type { IGlobal, ILayer, IStage, IWindow } from '../../../src/interface';
import type { IGraphic, IGraphicAttribute } from '../../../src/interface/graphic';
import { BasePlugin, BrowserEnvPlugin, type IPluginContext, PickerPlugin, RendererPlugin } from '../../../src/plugins';
import { GraphicFactory, LayerFactory, StageFactory } from '../../../src/factory';
import { ContributionRegistry, PickerRegistry, PluginRegistry, RendererRegistry } from '../../../src/registry';

class StageStub {
  constructor(public readonly params: any) {}
}

class LayerStub {
  constructor(
    public readonly stage: IStage,
    public readonly global: IGlobal,
    public readonly window: IWindow,
    public readonly params: any
  ) {}
}

class GraphicStub {
  constructor(public readonly attribute: Partial<IGraphicAttribute>) {}
}

class TestPlugin extends BasePlugin {
  installedWith?: IPluginContext;

  constructor() {
    super('test-plugin', '0.0.1');
  }

  install(context: IPluginContext): void {
    this.installedWith = context;
  }
}

function createPluginContext(): IPluginContext {
  return {
    registry: {
      renderer: new RendererRegistry(),
      picker: new PickerRegistry(),
      contribution: new ContributionRegistry(),
      plugin: new PluginRegistry()
    },
    factory: {
      stage: new StageFactory(StageStub as any),
      layer: new LayerFactory(LayerStub as any),
      graphic: new GraphicFactory()
    }
  };
}

describe('plugin module', () => {
  test('BasePlugin subclasses should expose name and version and receive install context', () => {
    const plugin = new TestPlugin();
    const context = createPluginContext();

    plugin.install(context);

    expect(plugin.name).toBe('test-plugin');
    expect(plugin.version).toBe('0.0.1');
    expect(plugin.installedWith).toBe(context);
  });

  test('RendererPlugin should register renderer entries into the provided context', () => {
    const renderer = {
      type: 'rect',
      numberType: 1,
      draw: jest.fn(),
      reInit: jest.fn()
    };
    const plugin = new RendererPlugin('renderer-plugin', [[Symbol('rect'), renderer]]);
    const context = createPluginContext();

    plugin.install(context);

    expect(context.registry.renderer.getAll()).toEqual([renderer]);
  });

  test('PickerPlugin should register picker entries into the provided context', () => {
    const picker = {
      type: 'rect',
      numberType: 1,
      contains: jest.fn()
    };
    const plugin = new PickerPlugin('picker-plugin', [[Symbol('rect'), picker]]);
    const context = createPluginContext();

    plugin.install(context);

    expect(context.registry.picker.getAll()).toEqual([picker]);
  });

  test('BrowserEnvPlugin should invoke install and uninstall hooks explicitly', () => {
    const install = jest.fn();
    const uninstall = jest.fn();
    const plugin = new BrowserEnvPlugin('browser-env', { install, uninstall });
    const context = createPluginContext();

    plugin.install(context);
    plugin.uninstall();

    expect(install).toHaveBeenCalledWith(context);
    expect(uninstall).toHaveBeenCalledTimes(1);
  });
});
