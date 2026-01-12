import { AutoEnablePlugins, contributionRegistry } from '@visactor/vrender-core';
import { ScrollBarPlugin } from './scrollbar-plugin';

let _registered = false;
export function loadScrollbar() {
  if (_registered) {
    return;
  }
  _registered = true;
  contributionRegistry.register(AutoEnablePlugins, new ScrollBarPlugin());
}
