import {
  InteractiveSubRenderContribution,
  AutoEnablePlugins,
  ContainerModule,
  container
} from '@visactor/vrender-core';
import { PopTipRenderContribution } from './contribution';
import { PopTipPlugin, PopTipForClipedTextPlugin } from './poptip-plugin';

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
