import { container, InteractiveSubRenderContribution, AutoEnablePlugins } from '@visactor/vrender';
import { ContainerModule } from 'inversify';
import { merge } from '@visactor/vutils';
import { PopTipRenderContribution } from './contribution';
import { PopTipPlugin, PopTipForClipedTextPlugin } from './poptip-plugin';
import type { PopTipAttributes } from './type';
import { DEFAULT_THEME, theme } from './theme';

export const module = new ContainerModule(bind => {
  bind(PopTipRenderContribution).toSelf().inSingletonScope();
  bind(InteractiveSubRenderContribution).toService(PopTipRenderContribution);

  bind(PopTipPlugin).toSelf().inSingletonScope();
  bind(AutoEnablePlugins).toService(PopTipPlugin);

  bind(PopTipForClipedTextPlugin).toSelf().inSingletonScope();
  bind(AutoEnablePlugins).toService(PopTipForClipedTextPlugin);
});

export function loadPoptip(defaultPoptipTheme: PopTipAttributes) {
  merge(theme.poptip, defaultPoptipTheme);
  container.load(module);
}

export function setPoptipTheme(defaultPoptipTheme: PopTipAttributes) {
  merge(theme.poptip, DEFAULT_THEME, defaultPoptipTheme);
}
