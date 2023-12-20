import { ContainerModule } from '@visactor/vrender-core';
import { CanvasPickerContribution, CanvasRichTextPicker } from '../constants';
import { DefaultCanvasRichTextPicker } from './richtext-picker';

let loadRichtextPick = false;
export const richtextCanvasPickModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  if (loadRichtextPick) {
    return;
  }
  loadRichtextPick = true;
  // richtext picker
  bind(CanvasRichTextPicker).to(DefaultCanvasRichTextPicker).inSingletonScope();
  bind(CanvasPickerContribution).toService(CanvasRichTextPicker);
});
