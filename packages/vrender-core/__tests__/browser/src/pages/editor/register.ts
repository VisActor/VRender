import { container, AutoEnablePlugins } from '@visactor/vrender';
import { ContainerModule } from 'inversify';
import { DraggablePlugin } from './draggable-plugin';

export const editableModule = new ContainerModule(bind => {
  bind(DraggablePlugin).toSelf().inSingletonScope();
  bind(AutoEnablePlugins).toService(DraggablePlugin);
});

export function loadEditable() {
  container.load(editableModule);
}
