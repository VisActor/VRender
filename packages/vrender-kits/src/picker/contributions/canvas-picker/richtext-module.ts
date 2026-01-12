import { contributionRegistry } from '@visactor/vrender-core';
import { CanvasPickerContribution, CanvasRichTextPicker } from '../constants';
import { DefaultCanvasRichTextPicker } from './richtext-picker';

let loadRichtextPick = false;
export function registerCanvasRichtextPicker() {
  if (loadRichtextPick) {
    return;
  }
  loadRichtextPick = true;
  contributionRegistry.register(CanvasPickerContribution, new DefaultCanvasRichTextPicker());
}
