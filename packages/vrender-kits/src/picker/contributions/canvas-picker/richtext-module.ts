import { RichTextRender } from '@visactor/vrender-core';
import { resolveContainerBinding } from '../../../common/explicit-binding';
import { CanvasPickerContribution, CanvasRichTextPicker } from '../constants';
import { DefaultCanvasRichTextPicker } from './richtext-picker';

let loadRichtextPick = false;
export function bindRichtextCanvasPickerContribution(container: any) {
  if (loadRichtextPick) {
    return;
  }
  loadRichtextPick = true;
  container
    .bind(CanvasRichTextPicker)
    .toDynamicValue(() => new DefaultCanvasRichTextPicker(resolveContainerBinding(container, RichTextRender)))
    .inSingletonScope();
  container.bind(CanvasPickerContribution).toService(CanvasRichTextPicker);
}
