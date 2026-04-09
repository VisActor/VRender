import type { IStageParams } from '../../../src/interface/stage';
import type { IPlugin, IPluginContext } from '../../../src/plugins';
import { BasePlugin } from '../../../src/plugins';
import { BrowserEntry, MiniappEntry, NodeEntry, createApp } from '../../../src/entries';
import { GraphicFactory, LayerFactory, StageFactory } from '../../../src/factory';
import { ContributionRegistry, PickerRegistry, PluginRegistry, RendererRegistry } from '../../../src/registry';

class TestPlugin extends BasePlugin {
  installedWith?: IPluginContext;

  constructor(name = 'test-plugin') {
    super(name, '0.0.1');
  }

  install(context: IPluginContext): void {
    this.installedWith = context;
  }
}

class StageStub {
  constructor(public readonly params: Partial<IStageParams>) {}
}

function createEntryOptions() {
  return {
    context: {
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
    }
  };
}

describe('entry module', () => {
  test('createApp should create isolated app instances with independent registries', () => {
    const first = createApp();
    const second = createApp();

    const renderer = {
      type: 'rect',
      numberType: 1,
      draw: jest.fn(),
      reInit: jest.fn()
    };

    first.registry.renderer.register(Symbol('rect'), renderer);

    expect(first.registry.renderer.getAll()).toEqual([renderer]);
    expect(second.registry.renderer.getAll()).toEqual([]);
    expect(first.factory.graphic).not.toBe(second.factory.graphic);
  });

  test('BrowserEntry should install plugins into app-scoped context', () => {
    const entry = new BrowserEntry(createEntryOptions());
    const plugin = new TestPlugin();

    entry.installPlugins([plugin]);

    expect(entry.registry.plugin.get(plugin.name)).toBe(plugin);
    expect(plugin.installedWith).toBeDefined();
    expect(plugin.installedWith).toBe(entry.context);
  });

  test('BrowserEntry should create stage through its stage factory', () => {
    const entry = new BrowserEntry(createEntryOptions());
    const params: Partial<IStageParams> = { width: 100, height: 50 };

    const stage = entry.createStage(params);

    expect(stage).toBeDefined();
    expect((stage as any).params).toEqual(params);
  });

  test('NodeEntry and MiniappEntry should expose the same app contract', () => {
    const nodeEntry = new NodeEntry(createEntryOptions());
    const miniappEntry = new MiniappEntry(createEntryOptions());
    const plugin = new TestPlugin('shared-plugin');

    nodeEntry.installPlugins([plugin]);
    miniappEntry.installPlugins([new TestPlugin('mini-plugin')]);

    expect(nodeEntry.registry.plugin.get('shared-plugin')).toBe(plugin);
    expect(typeof miniappEntry.createStage).toBe('function');
  });
});
