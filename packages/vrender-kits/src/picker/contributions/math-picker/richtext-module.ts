import { ContainerModule } from '@visactor/vrender-core';
import { MathImagePicker } from '../constants';
import { DefaultMathImagePicker } from './image-picker';

let loadRichTextPick = false;
export const richTextMathPickModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  if (loadRichTextPick) {
    return;
  }
  loadRichTextPick = true;
  // glyph picker
  bind(MathImagePicker).to(DefaultMathImagePicker).inSingletonScope();
  bind(DefaultMathImagePicker).toService(MathImagePicker);
});
