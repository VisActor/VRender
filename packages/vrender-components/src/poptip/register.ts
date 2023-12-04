import {
  container,
  InteractiveSubRenderContribution,
  AutoEnablePlugins,
  ContainerModule,
  graphicCreator
} from '@visactor/vrender/es/core';
import { merge } from '@visactor/vutils';
import { PopTipRenderContribution } from './contribution';
import { PopTipPlugin, PopTipForClipedTextPlugin } from './poptip-plugin';
import type { PopTipAttributes } from './type';
import { DEFAULT_THEME, theme } from './theme';
import { registerGroup, registerRect, registerSymbol, registerWrapText } from '@visactor/vrender/es/register';

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
  registerGroup();
  registerWrapText();
  registerSymbol();
  registerRect();
}

export function setPoptipTheme(defaultPoptipTheme: PopTipAttributes) {
  merge(theme.poptip, DEFAULT_THEME, defaultPoptipTheme);
}
