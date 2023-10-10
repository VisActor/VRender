import { container, AutoEnablePlugins, ContainerModule } from '@visactor/vrender';
import { DraggablePlugin } from './draggable-plugin';

export const editableModule = new ContainerModule(bind => {
  bind(DraggablePlugin).toSelf().inSingletonScope();
  bind(AutoEnablePlugins).toService(DraggablePlugin);
});

export function loadEditable() {
  container.load(editableModule);
}
