import {
  AutoEnablePlugins,
  configureRuntimeApplicationForApp,
  getLegacyBindingContext,
  getRuntimeInstallerBindingContext,
  refreshRuntimeInstallerContributions,
  type IApp
} from '@visactor/vrender-core';
import { ScrollBarPlugin } from './scrollbar-plugin';

function bindScrollbar(container: Pick<ReturnType<typeof getRuntimeInstallerBindingContext>, 'bind' | 'isBound'>) {
  if (!container.isBound(ScrollBarPlugin)) {
    container.bind(ScrollBarPlugin).toSelf();
    container.bind(AutoEnablePlugins).toService(ScrollBarPlugin);
  }
}

export function installScrollbarToApp(app: IApp): void {
  configureRuntimeApplicationForApp(app);
  bindScrollbar(getRuntimeInstallerBindingContext());
  refreshRuntimeInstallerContributions();
}

export function loadScrollbar() {
  bindScrollbar(getLegacyBindingContext());
}
