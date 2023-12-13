import { ContainerModule } from '@visactor/vrender-core';
import { CanvasGlyphPicker, CanvasImagePicker, CanvasPickerContribution } from '../constants';
import { DefaultCanvasGlyphPicker } from './glyph-picker';
import { DefaultCanvasImagePicker } from './image-picker';

let loadImagePick = false;
export const imageCanvasPickModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  if (loadImagePick) {
    return;
  }
  loadImagePick = true;
  // image picker
  bind(CanvasImagePicker).to(DefaultCanvasImagePicker).inSingletonScope();
  bind(CanvasPickerContribution).toService(CanvasImagePicker);
});
