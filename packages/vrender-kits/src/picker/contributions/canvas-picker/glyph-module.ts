import { GlyphRender } from '@visactor/vrender-core';
import { resolveContainerBinding } from '../../../common/explicit-binding';
import { CanvasGlyphPicker, CanvasPickerContribution } from '../constants';
import { DefaultCanvasGlyphPicker } from './glyph-picker';

let loadGlyphPick = false;
export function bindGlyphCanvasPickerContribution(container: any) {
  if (loadGlyphPick) {
    return;
  }
  loadGlyphPick = true;
  container
    .bind(CanvasGlyphPicker)
    .toDynamicValue(() => new DefaultCanvasGlyphPicker(resolveContainerBinding(container, GlyphRender)))
    .inSingletonScope();
  container.bind(CanvasPickerContribution).toService(CanvasGlyphPicker);
}
