import { application, PickerService } from '@visactor/vrender-core';
import { DefaultMathPickerService } from './math-picker-service';

export function registerMathPickerService() {
  if ((registerMathPickerService as any).__loaded) {
    return;
  }
  (registerMathPickerService as any).__loaded = true;
  // Override PickerService to use math-based service (no canvas)
  application.services.registerSingletonFactory(PickerService, () => new DefaultMathPickerService());
}
