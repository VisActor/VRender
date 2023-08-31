import { container, InteractiveSubRenderContribution, AutoEnablePlugins } from '@visactor/vrender';
import { ContainerModule } from 'inversify';
import { merge } from '@visactor/vutils';
import { PopTipRenderContribution } from './contribution';
import { PopTipPlugin, PopTipForClipedTextPlugin } from './poptip-plugin';
import type { PopTipAttributes } from './type';
import { DEFAULT_THEME, theme } from './theme';

export const popTipModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  if (!isBound(PopTipRenderContribution) || !isBound(PopTipPlugin) || !isBound(PopTipForClipedTextPlugin)) {
    bind(PopTipRenderContribution).toSelf().inSingletonScope();
    bind(InteractiveSubRenderContribution).toService(PopTipRenderContribution);

    bind(PopTipPlugin).toSelf();
    bind(AutoEnablePlugins).toService(PopTipPlugin);

    bind(PopTipForClipedTextPlugin).toSelf();
    bind(AutoEnablePlugins).toService(PopTipForClipedTextPlugin);
  } else {
    rebind(PopTipRenderContribution).toSelf().inSingletonScope();
    rebind(PopTipPlugin).toSelf();
    rebind(PopTipForClipedTextPlugin).toSelf();
  }
});

export function loadPoptip(defaultPoptipTheme: PopTipAttributes) {
  merge(theme.poptip, defaultPoptipTheme);
  container.load(popTipModule);
}

export function setPoptipTheme(defaultPoptipTheme: PopTipAttributes) {
  merge(theme.poptip, DEFAULT_THEME, defaultPoptipTheme);
}
