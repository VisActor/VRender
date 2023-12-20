import type { container } from '@visactor/vrender-core';
import { ContainerModule, PickerService } from '@visactor/vrender-core';
import { DefaultMathPickerService } from './math-picker-service';
import mathModule from './contributions/math-picker/module';

// math
export const mathPickerModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  if (!isBound(DefaultMathPickerService)) {
    bind(DefaultMathPickerService).toSelf().inSingletonScope();
  }
  if (isBound(PickerService)) {
    rebind(PickerService).toService(DefaultMathPickerService);
  } else {
    bind(PickerService).toService(DefaultMathPickerService);
  }
});

export function loadMathPicker(c: typeof container) {
  c.load(mathModule);
  c.load(mathPickerModule);
}
