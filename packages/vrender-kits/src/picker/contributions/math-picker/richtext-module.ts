import { RichTextRender } from '@visactor/vrender-core';
import { resolveContainerBinding } from '../../../common/explicit-binding';
import { MathPickerContribution, MathRichTextPicker } from '../constants';
import { DefaultMathRichTextPicker } from './richtext-picker';

let loadRichTextPick = false;
export function bindRichTextMathPickerContribution(container: any) {
  if (loadRichTextPick) {
    return;
  }
  loadRichTextPick = true;
  container
    .bind(MathRichTextPicker)
    .toDynamicValue(() => new DefaultMathRichTextPicker(resolveContainerBinding(container, RichTextRender)))
    .inSingletonScope();
  container.bind(MathPickerContribution).toService(MathRichTextPicker);
}
