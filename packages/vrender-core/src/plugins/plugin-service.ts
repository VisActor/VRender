import type { IContributionProvider, IPlugin, IPluginService, IStage } from '../interface';
import { AutoEnablePlugins } from './constants';
import { contributionRegistry } from '../common/registry';

export class DefaultPluginService implements IPluginService {
  declare onStartupFinishedPlugin: IPlugin[];
  declare onRegisterPlugin: IPlugin[];
  declare stage: IStage;
  declare actived: boolean;

  protected readonly autoEnablePlugins: IContributionProvider<IPlugin>;

  constructor(autoEnablePlugins?: IContributionProvider<IPlugin>) {
    // 如果没有传入，则使用 registry 获取
    this.autoEnablePlugins =
      autoEnablePlugins ||
      ({
        getContributions: () => contributionRegistry.get<IPlugin>(AutoEnablePlugins)
      } as IContributionProvider<IPlugin>);
    this.onStartupFinishedPlugin = [];
    this.onRegisterPlugin = [];
    this.actived = false;
  }

  active(stage: IStage, params: { pluginList?: string[] }) {
    this.stage = stage;
    this.actived = true;

    // 启动插件
    const { pluginList } = params;
    if (pluginList && contributionRegistry.has(AutoEnablePlugins)) {
      this.autoEnablePlugins.getContributions().forEach(p => {
        if (pluginList.includes(p.name)) {
          this.register(p);
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

  register(plugin: IPlugin) {
    if (plugin.activeEvent === 'onStartupFinished') {
      this.onStartupFinishedPlugin.push(plugin);
    } else if (plugin.activeEvent === 'onRegister') {
      this.onRegisterPlugin.push(plugin);
      plugin.activate(this);
    }
  }
  unRegister(plugin: IPlugin) {
    if (plugin.activeEvent === 'onStartupFinished') {
      this.onStartupFinishedPlugin.splice(this.onStartupFinishedPlugin.indexOf(plugin), 1);
    } else if (plugin.activeEvent === 'onRegister') {
      this.onRegisterPlugin.splice(this.onStartupFinishedPlugin.indexOf(plugin), 1);
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
  }
}
