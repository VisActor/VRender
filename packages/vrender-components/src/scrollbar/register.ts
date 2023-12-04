import { container, AutoEnablePlugins, ContainerModule } from '@visactor/vrender/es/core';
import { ScrollBarPlugin } from './scrollbar-plugin';
import { registerGroup, registerRect } from '@visactor/vrender/es/register';

export const scrollbarModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  if (!isBound(ScrollBarPlugin)) {
    bind(ScrollBarPlugin).toSelf();
    bind(AutoEnablePlugins).toService(ScrollBarPlugin);
  }
});

export function loadScrollbar() {
  container.load(scrollbarModule);
  registerGroup();
  registerRect();
}
