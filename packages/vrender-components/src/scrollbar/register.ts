import {
  container,
  InteractiveSubRenderContribution,
  AutoEnablePlugins,
  ContainerModule
} from '@visactor/vrender-core';
import { merge } from '@visactor/vutils';
import { ScrollBarPlugin } from './scrollbar-plugin';

export const scrollbarModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  if (!isBound(ScrollBarPlugin)) {
    bind(ScrollBarPlugin).toSelf();
    bind(AutoEnablePlugins).toService(ScrollBarPlugin);
  }
});

export function loadScrollbar() {
  container.load(scrollbarModule);
}
