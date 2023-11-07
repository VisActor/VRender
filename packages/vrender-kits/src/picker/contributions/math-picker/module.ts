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
import { DefaultMathArcPicker } from './arc-picker';
import { DefaultMathAreaPicker } from './area-picker';
import { DefaultMathLinePicker } from './line-picker';
import { DefaultMathSymbolPicker } from './symbol-picker';
import { DefaultMathTextPicker } from './text-picker';
import { DefaultMathPolygonPicker } from './polygon-picker';
import { DefaultMathGlyphPicker } from './glyph-picker';

export default new ContainerModule(bind => {
  // circle picker
  bind(MathCirclePicker).to(DefaultMathCirclePicker).inSingletonScope();
  bind(MathPickerContribution).toService(MathCirclePicker);

  // rect picker
  bind(MathRectPicker).to(DefaultMathRectPicker).inSingletonScope();
  bind(MathPickerContribution).toService(MathRectPicker);

  // arc picker
  bind(MathArcPicker).to(DefaultMathArcPicker).inSingletonScope();
  bind(MathPickerContribution).toService(MathArcPicker);

  // area picker
  bind(MathAreaPicker).to(DefaultMathAreaPicker).inSingletonScope();
  bind(MathPickerContribution).toService(MathAreaPicker);

  // // image picker
  // bind(DefaultCanvasImagePicker).toSelf().inSingletonScope();
  // bind(ImagePicker).toService(DefaultCanvasImagePicker);
  // bind(PickerContribution).toService(ImagePicker);

  // line picker
  bind(MathLinePicker).to(DefaultMathLinePicker).inSingletonScope();
  bind(MathPickerContribution).toService(MathLinePicker);

  // path picker
  bind(MathPathPicker).to(DefaultMathPathPicker).inSingletonScope();
  bind(MathPickerContribution).toService(MathPathPicker);

  // symbol picker
  bind(MathSymbolPicker).to(DefaultMathSymbolPicker).inSingletonScope();
  bind(MathPickerContribution).toService(MathSymbolPicker);

  // text picker
  bind(MathTextPicker).to(DefaultMathTextPicker).inSingletonScope();
  bind(MathPickerContribution).toService(MathTextPicker);

  // polygon picker
  bind(MathPolygonPicker).to(DefaultMathPolygonPicker).inSingletonScope();
  bind(MathPickerContribution).toService(MathPolygonPicker);

  // glyph picker
  bind(MathGlyphPicker).to(DefaultMathGlyphPicker).inSingletonScope();
  bind(DefaultMathGlyphPicker).toService(MathGlyphPicker);

  bindContributionProvider(bind, MathPickerContribution);
});
