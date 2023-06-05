import { ContainerModule } from 'inversify';
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
import { bindContributionProvider } from '../../../common';
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
  bind(DefaultMathCirclePicker).toSelf().inSingletonScope();
  bind(MathCirclePicker).toService(DefaultMathCirclePicker);
  bind(MathPickerContribution).toService(MathCirclePicker);

  // rect picker
  bind(DefaultMathRectPicker).toSelf().inSingletonScope();
  bind(MathRectPicker).toService(DefaultMathRectPicker);
  bind(MathPickerContribution).toService(MathRectPicker);

  // arc picker
  bind(DefaultMathArcPicker).toSelf().inSingletonScope();
  bind(MathArcPicker).toService(DefaultMathArcPicker);
  bind(MathPickerContribution).toService(MathArcPicker);

  // area picker
  bind(DefaultMathAreaPicker).toSelf().inSingletonScope();
  bind(MathAreaPicker).toService(DefaultMathAreaPicker);
  bind(MathPickerContribution).toService(MathAreaPicker);

  // // image picker
  // bind(DefaultCanvasImagePicker).toSelf().inSingletonScope();
  // bind(ImagePicker).toService(DefaultCanvasImagePicker);
  // bind(PickerContribution).toService(ImagePicker);

  // line picker
  bind(DefaultMathLinePicker).toSelf().inSingletonScope();
  bind(MathLinePicker).toService(DefaultMathLinePicker);
  bind(MathPickerContribution).toService(MathLinePicker);

  // path picker
  bind(DefaultMathPathPicker).toSelf().inSingletonScope();
  bind(MathPathPicker).toService(DefaultMathPathPicker);
  bind(MathPickerContribution).toService(MathPathPicker);

  // symbol picker
  bind(DefaultMathSymbolPicker).toSelf().inSingletonScope();
  bind(MathSymbolPicker).toService(DefaultMathSymbolPicker);
  bind(MathPickerContribution).toService(MathSymbolPicker);

  // text picker
  bind(DefaultMathTextPicker).toSelf().inSingletonScope();
  bind(MathTextPicker).toService(DefaultMathTextPicker);
  bind(MathPickerContribution).toService(MathTextPicker);

  // polygon picker
  bind(DefaultMathPolygonPicker).toSelf().inSingletonScope();
  bind(MathPolygonPicker).toService(DefaultMathPolygonPicker);
  bind(MathPickerContribution).toService(MathPolygonPicker);

  // glyph picker
  bind(DefaultMathGlyphPicker).toSelf().inSingletonScope();
  bind(MathGlyphPicker).toService(DefaultMathGlyphPicker);
  bind(DefaultMathGlyphPicker).toService(MathGlyphPicker);

  bindContributionProvider(bind, MathPickerContribution);
});
