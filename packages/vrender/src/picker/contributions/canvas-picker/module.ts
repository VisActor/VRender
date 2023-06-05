import { ContainerModule } from 'inversify';
import { DefaultCanvasCirclePicker } from './circle-picker';
import { DefaultCanvasRectPicker } from './rect-picker';
import { DefaultCanvasArcPicker } from './arc-picker';
import { DefaultCanvasAreaPicker } from './area-picker';
import { DefaultCanvasImagePicker } from './image-picker';
import { DefaultCanvasLinePicker } from './line-picker';
import { DefaultCanvasPathPicker } from './path-picker';
import { DefaultCanvasSymbolPicker } from './symbol-picker';
import { DefaultCanvasTextPicker } from './text-picker';
import {
  CanvasArc3dPicker,
  CanvasArcPicker,
  CanvasAreaPicker,
  CanvasCirclePicker,
  CanvasGlyphPicker,
  CanvasImagePicker,
  CanvasLinePicker,
  CanvasPathPicker,
  CanvasPickerContribution,
  CanvasPolygonPicker,
  CanvasPyramid3dPicker,
  CanvasRect3dPicker,
  CanvasRectPicker,
  CanvasRichTextPicker,
  CanvasSymbolPicker,
  CanvasTextPicker
} from '../constants';
import { bindContributionProvider } from '../../../common';
import { DefaultCanvasPolygonPicker } from './polygon-picker';
import { DefaultCanvasRichTextPicker } from './richtext-picker';
import { DefaultCanvasGlyphPicker } from './glyph-picker';
import { DefaultCanvasRect3dPicker } from './rect3d-picker';
import { DefaultCanvasPyramid3dPicker } from './pyramid3d-picker';
import { DefaultCanvasArc3dPicker } from './arc3d-picker';

export default new ContainerModule((bind, unbind, isBound, rebind) => {
  // circle picker
  bind(DefaultCanvasCirclePicker).toSelf().inSingletonScope();
  bind(CanvasCirclePicker).toService(DefaultCanvasCirclePicker);
  bind(CanvasPickerContribution).toService(CanvasCirclePicker);

  // reat picker
  bind(DefaultCanvasRectPicker).toSelf().inSingletonScope();
  bind(CanvasRectPicker).toService(DefaultCanvasRectPicker);
  bind(CanvasPickerContribution).toService(CanvasRectPicker);

  // reat3d picker
  bind(DefaultCanvasRect3dPicker).toSelf().inSingletonScope();
  bind(CanvasRect3dPicker).toService(DefaultCanvasRect3dPicker);
  bind(CanvasPickerContribution).toService(CanvasRect3dPicker);

  // arc picker
  bind(DefaultCanvasArcPicker).toSelf().inSingletonScope();
  bind(CanvasArcPicker).toService(DefaultCanvasArcPicker);
  bind(CanvasPickerContribution).toService(CanvasArcPicker);

  // area picker
  bind(DefaultCanvasAreaPicker).toSelf().inSingletonScope();
  bind(CanvasAreaPicker).toService(DefaultCanvasAreaPicker);
  bind(CanvasPickerContribution).toService(CanvasAreaPicker);

  // image picker
  bind(DefaultCanvasImagePicker).toSelf().inSingletonScope();
  bind(CanvasImagePicker).toService(DefaultCanvasImagePicker);
  bind(CanvasPickerContribution).toService(CanvasImagePicker);

  // line picker
  bind(DefaultCanvasLinePicker).toSelf().inSingletonScope();
  bind(CanvasLinePicker).toService(DefaultCanvasLinePicker);
  bind(CanvasPickerContribution).toService(CanvasLinePicker);

  // path picker
  bind(DefaultCanvasPathPicker).toSelf().inSingletonScope();
  bind(CanvasPathPicker).toService(DefaultCanvasPathPicker);
  bind(CanvasPickerContribution).toService(CanvasPathPicker);

  // symbol picker
  bind(DefaultCanvasSymbolPicker).toSelf().inSingletonScope();
  bind(CanvasSymbolPicker).toService(DefaultCanvasSymbolPicker);
  bind(CanvasPickerContribution).toService(CanvasSymbolPicker);

  // text picker
  bind(DefaultCanvasTextPicker).toSelf().inSingletonScope();
  bind(CanvasTextPicker).toService(DefaultCanvasTextPicker);
  bind(CanvasPickerContribution).toService(CanvasTextPicker);

  // polygon picker
  bind(DefaultCanvasPolygonPicker).toSelf().inSingletonScope();
  bind(CanvasPolygonPicker).toService(DefaultCanvasPolygonPicker);
  bind(CanvasPickerContribution).toService(CanvasPolygonPicker);

  // pyramid3d picker
  bind(DefaultCanvasPyramid3dPicker).toSelf().inSingletonScope();
  bind(CanvasPyramid3dPicker).toService(DefaultCanvasPyramid3dPicker);
  bind(CanvasPickerContribution).toService(CanvasPyramid3dPicker);

  // arc3d picker
  bind(DefaultCanvasArc3dPicker).toSelf().inSingletonScope();
  bind(CanvasArc3dPicker).toService(DefaultCanvasArc3dPicker);
  bind(CanvasPickerContribution).toService(CanvasArc3dPicker);

  // richtext picker
  bind(DefaultCanvasRichTextPicker).toSelf().inSingletonScope();
  bind(CanvasRichTextPicker).toService(DefaultCanvasRichTextPicker);
  bind(CanvasPickerContribution).toService(CanvasRichTextPicker);
  // glyph picker
  bind(DefaultCanvasGlyphPicker).toSelf().inSingletonScope();
  bind(CanvasGlyphPicker).toService(DefaultCanvasGlyphPicker);
  bind(CanvasPickerContribution).toService(CanvasGlyphPicker);

  bindContributionProvider(bind, CanvasPickerContribution);
});
