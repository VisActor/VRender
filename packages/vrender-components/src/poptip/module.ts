import {
  AutoEnablePlugins,
  InteractiveSubRenderContribution,
  configureRuntimeApplicationForApp,
  getLegacyBindingContext,
  getRuntimeInstallerBindingContext,
  installRuntimeGraphicRenderersToApp,
  refreshRuntimeInstallerContributions,
  type IApp
} from '@visactor/vrender-core';
import { PopTipRenderContribution } from './contribution';
import { PopTipPlugin, PopTipForClipedTextPlugin } from './poptip-plugin';

function bindPoptip(container: Pick<ReturnType<typeof getRuntimeInstallerBindingContext>, 'bind' | 'isBound'>) {
  if (!container.isBound(PopTipRenderContribution)) {
    container.bind(PopTipRenderContribution).toSelf().inSingletonScope();
    container.bind(InteractiveSubRenderContribution).toService(PopTipRenderContribution);
  }
  if (!container.isBound(PopTipPlugin)) {
    container.bind(PopTipPlugin).toSelf();
    container.bind(AutoEnablePlugins).toService(PopTipPlugin);
  }
  if (!container.isBound(PopTipForClipedTextPlugin)) {
    container.bind(PopTipForClipedTextPlugin).toSelf();
    container.bind(AutoEnablePlugins).toService(PopTipForClipedTextPlugin);
  }
}

export function installPoptipToApp(app: IApp): void {
  configureRuntimeApplicationForApp(app);
  bindPoptip(getRuntimeInstallerBindingContext());
  refreshRuntimeInstallerContributions();
  installRuntimeGraphicRenderersToApp(app);
}

export function loadPoptip() {
  bindPoptip(getLegacyBindingContext());
}
