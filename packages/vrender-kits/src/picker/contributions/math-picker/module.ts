import { ContainerModule, bindContributionProvider } from '@visactor/vrender-core';
import { DefaultMathPathPicker } from './path-picker';
import {
  MathArcPicker,
  MathAreaPicker,
  MathCirclePicker,
  MathGlyphPicker,
  MathLinePicker,
  MathPathPicker,
  MathPickerContribution,
  MathPolygonPicker,
  MathRectPicker,
  MathSymbolPicker,
  MathTextPicker
} from '../constants';
import { DefaultMathCirclePicker } from './circle-picker';
import { DefaultMathRectPicker } from './rect-picker';
import { DefaultMathAreaPicker } from './area-picker';
import { DefaultMathLinePicker } from './line-picker';
import { DefaultMathSymbolPicker } from './symbol-picker';
import { DefaultMathTextPicker } from './text-picker';
import { DefaultMathPolygonPicker } from './polygon-picker';
import { DefaultMathGlyphPicker } from './glyph-picker';

export default new ContainerModule(bind => {
  // // image picker
  // bind(DefaultCanvasImagePicker).toSelf().inSingletonScope();
  // bind(ImagePicker).toService(DefaultCanvasImagePicker);
  // bind(PickerContribution).toService(ImagePicker);

  bindContributionProvider(bind, MathPickerContribution);
});
