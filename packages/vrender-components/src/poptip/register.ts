import {
  container,
  InteractiveSubRenderContribution,
  AutoEnablePlugins,
  ContainerModule
} from '@visactor/vrender-core';
import { merge } from '@visactor/vutils';
import { PopTipRenderContribution } from './contribution';
import { PopTipPlugin, PopTipForClipedTextPlugin } from './poptip-plugin';
import type { PopTipAttributes } from './type';
import { DEFAULT_THEME, theme } from './theme';

export const popTipModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  if (!isBound(PopTipRenderContribution)) {
    bind(PopTipRenderContribution).toSelf().inSingletonScope();
    bind(InteractiveSubRenderContribution).toService(PopTipRenderContribution);
  }
  if (!isBound(PopTipPlugin)) {
    bind(PopTipPlugin).toSelf();
    bind(AutoEnablePlugins).toService(PopTipPlugin);
  }
  if (!isBound(PopTipForClipedTextPlugin)) {
    bind(PopTipForClipedTextPlugin).toSelf();
    bind(AutoEnablePlugins).toService(PopTipForClipedTextPlugin);
  }
});

export function loadPoptip() {
  container.load(popTipModule);
}

export function setPoptipTheme(defaultPoptipTheme: PopTipAttributes) {
  merge(theme.poptip, DEFAULT_THEME, defaultPoptipTheme);
}
