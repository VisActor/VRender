import { InteractiveSubRenderContribution, AutoEnablePlugins, contributionRegistry } from '@visactor/vrender-core';
import { PopTipRenderContribution } from './contribution';
import { PopTipPlugin, PopTipForClipedTextPlugin } from './poptip-plugin';

let _registered = false;
export function loadPoptip() {
  if (_registered) {
    return;
  }
  _registered = true;
  contributionRegistry.register(InteractiveSubRenderContribution, new PopTipRenderContribution());
  contributionRegistry.register(AutoEnablePlugins, new PopTipPlugin());
  contributionRegistry.register(AutoEnablePlugins, new PopTipForClipedTextPlugin());
}
