import type { container } from '@visactor/vrender-core';
import { ContainerModule, PickerService } from '@visactor/vrender-core';
import { DefaultCanvasPickerService } from './canvas-picker-service';
import canvasModule from './contributions/canvas-picker/module';

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
