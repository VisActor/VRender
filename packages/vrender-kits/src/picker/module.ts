import type { container } from '@visactor/vrender-core';
import { ContainerModule, PickerService } from '@visactor/vrender-core';
import { DefaultCanvasPickerService } from './canvas-picker-service';
import canvasModule from './contributions/canvas-picker/module';
import mathModule from './contributions/math-picker/module';
import { DefaultMathPickerService } from './math-picker-service';

// canvas
export const canvasPickerModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  if (!isBound(DefaultCanvasPickerService)) {
    bind(DefaultCanvasPickerService).toSelf().inSingletonScope();
  }
  if (isBound(PickerService)) {
    rebind(PickerService).toService(DefaultCanvasPickerService);
  } else {
    bind(PickerService).toService(DefaultCanvasPickerService);
  }
});

export function loadCanvasPicker(c: typeof container) {
  c.load(canvasModule);
  c.load(canvasPickerModule);
}

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
