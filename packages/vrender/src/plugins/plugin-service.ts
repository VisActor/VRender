import { injectable } from 'inversify';
import { Releaseable, IStage } from '../interface';

export interface IPluginService extends Releaseable {
  register: (plugin: IPlugin) => void;
  active: (stage: IStage) => void;
  actived: boolean;
  stage: IStage;
  findPluginsByName: (name: string) => IPlugin[];
}

export interface IPlugin {
  name: string;
  activeEvent: 'onStartupFinished' | 'onRegister';
  activate: (context: IPluginService) => void;
  deactivate: (context: IPluginService) => void;
}

export const PluginService = Symbol.for('PluginService');

@injectable()
export class DefaultPluginService implements IPluginService {
  declare onStartupFinishedPlugin: IPlugin[];
  declare onRegisterPlugin: IPlugin[];
  declare stage: IStage;
  declare actived: boolean;

  constructor() {
    this.onStartupFinishedPlugin = [];
    this.onRegisterPlugin = [];
    this.actived = false;
  }

  active(stage: IStage) {
    this.stage = stage;
    this.actived = true;
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
