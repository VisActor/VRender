import { container, AutoEnablePlugins, ContainerModule } from '@visactor/vrender-core';
import { ScrollBarPlugin } from './scrollbar-plugin';
import { registerGroup, registerRect } from '@visactor/vrender-kits';

export const scrollbarModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  if (!isBound(ScrollBarPlugin)) {
    bind(ScrollBarPlugin).toSelf();
    bind(AutoEnablePlugins).toService(ScrollBarPlugin);
  }
});

export function loadScrollbar() {
  container.load(scrollbarModule);
}

export function loadScrollbarComponent() {
  registerGroup();
  registerRect();
}
