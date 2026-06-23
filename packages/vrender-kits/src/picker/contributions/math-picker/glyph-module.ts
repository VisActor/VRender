import { GlyphRender } from '@visactor/vrender-core';
import { resolveContainerBinding } from '../../../common/explicit-binding';
import { MathGlyphPicker, MathPickerContribution } from '../constants';
import { DefaultMathGlyphPicker } from './glyph-picker';

let loadGlyphPick = false;
export function bindGlyphMathPickerContribution(container: any) {
  if (loadGlyphPick) {
    return;
  }
  loadGlyphPick = true;
  container
    .bind(MathGlyphPicker)
    .toDynamicValue(() => new DefaultMathGlyphPicker(resolveContainerBinding(container, GlyphRender)))
    .inSingletonScope();
  container.bind(MathPickerContribution).toService(MathGlyphPicker);
}
