import { ContainerModule } from '@visactor/vrender-core';
import { CanvasCharacterPicker, CanvasPickerContribution } from '../constants';
import { DefaultCanvasCharacterPicker } from './character-picker';

let loadCharacterPick = false;
export const characterCanvasPickModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  if (loadCharacterPick) {
    return;
  }
  loadCharacterPick = true;
  bind(CanvasCharacterPicker).to(DefaultCanvasCharacterPicker).inSingletonScope();
  bind(CanvasPickerContribution).toService(CanvasCharacterPicker);
});
