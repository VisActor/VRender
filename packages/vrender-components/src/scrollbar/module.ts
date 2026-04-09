import { AutoEnablePlugins, getLegacyBindingContext } from '@visactor/vrender-core';
import { ScrollBarPlugin } from './scrollbar-plugin';

export function loadScrollbar() {
  const legacyContext = getLegacyBindingContext();
  if (!legacyContext.isBound(ScrollBarPlugin)) {
    legacyContext.bind(ScrollBarPlugin).toSelf();
    legacyContext.bind(AutoEnablePlugins).toService(ScrollBarPlugin);
  }
}
