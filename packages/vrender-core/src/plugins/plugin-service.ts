import type { IContributionProvider, IPlugin, IPluginService, IStage } from '../interface';
import { PluginRegistry } from '../registry';

interface ILegacyPluginRegistry {
  install: (plugin: IPlugin) => void;
  uninstall: (name: string) => void;
  get: (name: string) => IPlugin | undefined;
  clear: () => void;
}

interface IPluginServiceDeps {
  pluginRegistry?: ILegacyPluginRegistry;
  autoEnablePlugins?: IContributionProvider<IPlugin>;
}

const EMPTY_AUTO_ENABLE_PROVIDER: IContributionProvider<IPlugin> = {
  getContributions: () => []
};

export class DefaultPluginService implements IPluginService {
  declare onStartupFinishedPlugin: IPlugin[];
  declare onRegisterPlugin: IPlugin[];
  declare stage: IStage;
  declare actived: boolean;
  readonly pluginRegistry: ILegacyPluginRegistry;

  constructor(
    protected autoEnablePlugins: IContributionProvider<IPlugin> = EMPTY_AUTO_ENABLE_PROVIDER,
    deps: IPluginServiceDeps = {}
  ) {
    this.onStartupFinishedPlugin = [];
    this.onRegisterPlugin = [];
    this.actived = false;
    this.pluginRegistry = deps.pluginRegistry ?? (new PluginRegistry() as unknown as ILegacyPluginRegistry);
    this.autoEnablePlugins = deps.autoEnablePlugins ?? this.autoEnablePlugins ?? EMPTY_AUTO_ENABLE_PROVIDER;
  }

  active(stage: IStage, params: { pluginList?: string[] }) {
    this.stage = stage;
    this.actived = true;

    // 启动插件
    const { pluginList } = params;
    if (pluginList?.length) {
      this.autoEnablePlugins.getContributions().forEach(p => {
        if (pluginList.includes(p.name)) {
          this.install(p);
        }
      });
    }
  }

  findPluginsByName(name: string): IPlugin[] {
    const arr: IPlugin[] = [];
    this.onStartupFinishedPlugin.forEach(plugin => {
      if (plugin.name === name) {
        arr.push(plugin);
      }
    });
    this.onRegisterPlugin.forEach(plugin => {
      if (plugin.name === name) {
        arr.push(plugin);
      }
    });
    return arr;
  }

  install(plugin: IPlugin) {
    this.register(plugin);
  }

  uninstall(name: string) {
    const plugins = this.findPluginsByName(name);
    plugins.forEach(plugin => {
      this.unRegister(plugin);
    });
    this.pluginRegistry.uninstall(name);
  }

  register(plugin: IPlugin) {
    this.pluginRegistry.install(plugin);
    if (plugin.activeEvent === 'onStartupFinished') {
      if (!this.onStartupFinishedPlugin.includes(plugin)) {
        this.onStartupFinishedPlugin.push(plugin);
      }
    } else if (plugin.activeEvent === 'onRegister') {
      if (!this.onRegisterPlugin.includes(plugin)) {
        this.onRegisterPlugin.push(plugin);
        plugin.activate(this);
      }
    }
  }
  unRegister(plugin: IPlugin) {
    if (plugin.activeEvent === 'onStartupFinished') {
      this.onStartupFinishedPlugin = this.onStartupFinishedPlugin.filter(item => item !== plugin);
    } else if (plugin.activeEvent === 'onRegister') {
      this.onRegisterPlugin = this.onRegisterPlugin.filter(item => item !== plugin);
    }
    if (this.pluginRegistry.get(plugin.name) === plugin) {
      this.pluginRegistry.uninstall(plugin.name);
    }
    plugin.deactivate(this);
  }

  release(...params: any): void {
    this.onStartupFinishedPlugin.forEach(plugin => {
      plugin.deactivate(this);
    });
    this.onStartupFinishedPlugin = [];
    this.onRegisterPlugin.forEach(plugin => {
      plugin.deactivate(this);
    });
    this.onRegisterPlugin = [];
    this.pluginRegistry.clear();
  }
}
