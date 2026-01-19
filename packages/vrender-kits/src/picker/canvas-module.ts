import { serviceRegistry, PickerService } from '@visactor/vrender-core';
import { DefaultCanvasPickerService } from './canvas-picker-service';
import { registerCanvasGroupPicker } from './contributions/canvas-picker/module';

export function registerCanvasPickerService() {
  if ((registerCanvasPickerService as any).__loaded) {
    return;
  }
  (registerCanvasPickerService as any).__loaded = true;
  // Override PickerService to use canvas-based service
  serviceRegistry.registerSingletonFactory(PickerService, () => new DefaultCanvasPickerService());
  // Ensure group picker is registered
  registerCanvasGroupPicker();
}
