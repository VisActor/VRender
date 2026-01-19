import { application, AutoEnablePlugins } from '@visactor/vrender';
import { DraggablePlugin } from './draggable-plugin';

let _registered = false;
export function loadEditable() {
  if (_registered) return;
  _registered = true;
  application.contributions.register(AutoEnablePlugins, new DraggablePlugin());
}
