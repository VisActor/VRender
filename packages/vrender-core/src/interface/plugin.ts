import type { Releaseable } from './common';
import type { IStage } from './stage';

export interface IPluginService extends Releaseable {
  install?: (plugin: IPlugin) => void;
  uninstall?: (name: string) => void;
  register: (plugin: IPlugin) => void;
  unRegister: (plugin: IPlugin) => void;
  active: (stage: IStage, params: { pluginList?: string[] }) => void;
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
