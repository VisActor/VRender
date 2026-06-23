/** @deprecated Legacy DI browser fixture retained for major-migration tracking. Prefer app-scoped entries/plugins. */
import { AutoEnablePlugins, getLegacyBindingContext } from '@visactor/vrender';
import { DraggablePlugin } from './draggable-plugin';

let loaded = false;

export function loadEditable() {
  if (loaded) {
    return;
  }
  loaded = true;
  const legacyContext = getLegacyBindingContext();
  legacyContext.bind(DraggablePlugin).toSelf().inSingletonScope();
  legacyContext.bind(AutoEnablePlugins).toService(DraggablePlugin);
}
