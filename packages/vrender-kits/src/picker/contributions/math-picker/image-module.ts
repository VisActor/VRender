import { ContainerModule } from '@visactor/vrender-core';
import { MathImagePicker } from '../constants';
import { DefaultMathImagePicker } from './image-picker';

let loadImagePick = false;
export const imageMathPickModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  if (loadImagePick) {
    return;
  }
  loadImagePick = true;
  // glyph picker
  bind(MathImagePicker).to(DefaultMathImagePicker).inSingletonScope();
  bind(DefaultMathImagePicker).toService(MathImagePicker);
});
