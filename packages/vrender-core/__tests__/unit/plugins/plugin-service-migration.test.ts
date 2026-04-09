import type { IPlugin, IStage } from '../../../src/interface';
import { PluginRegistry } from '../../../src/registry';
import { DefaultPluginService } from '../../../src/plugins/plugin-service';

class TestPlugin implements IPlugin {
  activate = jest.fn();
  deactivate = jest.fn();

  constructor(
    public readonly name: string,
    public readonly activeEvent: 'onStartupFinished' | 'onRegister' = 'onRegister'
  ) {}
}

const EMPTY_AUTO_ENABLE_PROVIDER = {
  getContributions: (): IPlugin[] => []
};

describe('plugin service migration', () => {
  test('should support install and uninstall by plugin name with explicit PluginRegistry', () => {
    const registry = new PluginRegistry();
    const plugin = new TestPlugin('auto-render');
    const service = new DefaultPluginService(undefined as any, {
      pluginRegistry: registry as any,
      autoEnablePlugins: EMPTY_AUTO_ENABLE_PROVIDER as any
    });

    service.active({ id: 'stage-1' } as unknown as IStage, {});
    service.install(plugin);

    expect(registry.get(plugin.name)).toBe(plugin as any);
    expect(service.findPluginsByName(plugin.name)).toEqual([plugin]);
    expect(plugin.activate).toHaveBeenCalledWith(service);

    service.uninstall(plugin.name);

    expect(registry.get(plugin.name)).toBeUndefined();
    expect(service.findPluginsByName(plugin.name)).toEqual([]);
    expect(plugin.deactivate).toHaveBeenCalledWith(service);
  });

  test('should install auto-enable plugins by requested names during active', () => {
    const registry = new PluginRegistry();
    const startup = new TestPlugin('startup-plugin', 'onStartupFinished');
    const register = new TestPlugin('register-plugin', 'onRegister');
    const service = new DefaultPluginService(undefined as any, {
      pluginRegistry: registry as any,
      autoEnablePlugins: {
        getContributions: () => [startup, register]
      } as any
    });

    service.active({ id: 'stage-2' } as unknown as IStage, {
      pluginList: ['startup-plugin', 'register-plugin']
    });

    expect(registry.get('startup-plugin')).toBe(startup as any);
    expect(registry.get('register-plugin')).toBe(register as any);
    expect(service.findPluginsByName('startup-plugin')).toEqual([startup]);
    expect(service.findPluginsByName('register-plugin')).toEqual([register]);
    expect(register.activate).toHaveBeenCalledWith(service);
    expect(startup.activate).not.toHaveBeenCalled();
  });

  test('should keep legacy register and unRegister behavior compatible', () => {
    const plugin = new TestPlugin('legacy-plugin');
    const service = new DefaultPluginService(undefined as any, {
      pluginRegistry: new PluginRegistry() as any,
      autoEnablePlugins: EMPTY_AUTO_ENABLE_PROVIDER as any
    });
    service.active({ id: 'stage-3' } as unknown as IStage, {});

    service.register(plugin);
    expect(service.findPluginsByName('legacy-plugin')).toEqual([plugin]);

    service.unRegister(plugin);
    expect(service.findPluginsByName('legacy-plugin')).toEqual([]);
    expect(plugin.deactivate).toHaveBeenCalledWith(service);
  });
});
