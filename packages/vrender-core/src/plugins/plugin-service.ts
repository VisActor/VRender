import { injectable, inject, named } from '../common/inversify-lite';
import type { IContributionProvider, IPlugin, IPluginService, IStage } from '../interface';
import { ContributionProvider } from '../common/contribution-provider';
import { AutoEnablePlugins } from './constants';
import { container } from '../container';

@injectable()
export class DefaultPluginService implements IPluginService {
  declare onStartupFinishedPlugin: IPlugin[];
  declare onRegisterPlugin: IPlugin[];
  declare stage: IStage;
  declare actived: boolean;

  constructor(
    @inject(ContributionProvider)
    @named(AutoEnablePlugins)
    protected readonly autoEnablePlugins: IContributionProvider<IPlugin>
  ) {
    this.onStartupFinishedPlugin = [];
    this.onRegisterPlugin = [];
    this.actived = false;
  }

  active(stage: IStage, params: { pluginList?: string[] }) {
    this.stage = stage;
    this.actived = true;

    // 启动插件
    const { pluginList } = params;
    if (pluginList && container.isBound(AutoEnablePlugins)) {
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
