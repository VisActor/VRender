import { InteractiveSubRenderContribution, AutoEnablePlugins, getLegacyBindingContext } from '@visactor/vrender-core';
import { PopTipRenderContribution } from './contribution';
import { PopTipPlugin, PopTipForClipedTextPlugin } from './poptip-plugin';

export function loadPoptip() {
  const legacyContext = getLegacyBindingContext();
  if (!legacyContext.isBound(PopTipRenderContribution)) {
    legacyContext.bind(PopTipRenderContribution).toSelf().inSingletonScope();
    legacyContext.bind(InteractiveSubRenderContribution).toService(PopTipRenderContribution);
  }
  if (!legacyContext.isBound(PopTipPlugin)) {
    legacyContext.bind(PopTipPlugin).toSelf();
    legacyContext.bind(AutoEnablePlugins).toService(PopTipPlugin);
  }
  if (!legacyContext.isBound(PopTipForClipedTextPlugin)) {
    legacyContext.bind(PopTipForClipedTextPlugin).toSelf();
    legacyContext.bind(AutoEnablePlugins).toService(PopTipForClipedTextPlugin);
  }
}
