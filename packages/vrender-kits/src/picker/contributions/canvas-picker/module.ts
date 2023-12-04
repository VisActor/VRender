import { ContainerModule, bindContributionProvider } from '@visactor/vrender-core';
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
  CanvasGroupPicker,
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
import { DefaultCanvasPolygonPicker } from './polygon-picker';
import { DefaultCanvasRichTextPicker } from './richtext-picker';
import { DefaultCanvasGlyphPicker } from './glyph-picker';
import { DefaultCanvasRect3dPicker } from './rect3d-picker';
import { DefaultCanvasPyramid3dPicker } from './pyramid3d-picker';
import { DefaultCanvasArc3dPicker } from './arc3d-picker';
import { DefaultCanvasGroupPicker } from './group-picker';

let loaded = false;
export default new ContainerModule((bind, unbind, isBound, rebind) => {
  if (loaded) {
    return;
  }
  loaded = true;
  // circle picker
  bind(CanvasCirclePicker).to(DefaultCanvasCirclePicker).inSingletonScope();
  bind(CanvasPickerContribution).toService(CanvasCirclePicker);

  // reat picker
  bind(CanvasRectPicker).to(DefaultCanvasRectPicker).inSingletonScope();
  bind(CanvasPickerContribution).toService(CanvasRectPicker);

  // reat3d picker
  bind(CanvasRect3dPicker).to(DefaultCanvasRect3dPicker).inSingletonScope();
  bind(CanvasPickerContribution).toService(CanvasRect3dPicker);

  // arc picker
  bind(CanvasArcPicker).to(DefaultCanvasArcPicker).inSingletonScope();
  bind(CanvasPickerContribution).toService(CanvasArcPicker);

  // area picker
  bind(CanvasAreaPicker).to(DefaultCanvasAreaPicker).inSingletonScope();
  bind(CanvasPickerContribution).toService(CanvasAreaPicker);

  // image picker
  bind(CanvasImagePicker).to(DefaultCanvasImagePicker).inSingletonScope();
  bind(CanvasPickerContribution).toService(CanvasImagePicker);

  // line picker
  bind(CanvasLinePicker).to(DefaultCanvasLinePicker).inSingletonScope();
  bind(CanvasPickerContribution).toService(CanvasLinePicker);

  // path picker
  bind(CanvasPathPicker).to(DefaultCanvasPathPicker).inSingletonScope();
  bind(CanvasPickerContribution).toService(CanvasPathPicker);

  // symbol picker
  bind(CanvasSymbolPicker).to(DefaultCanvasSymbolPicker).inSingletonScope();
  bind(CanvasPickerContribution).toService(CanvasSymbolPicker);

  // text picker
  bind(CanvasTextPicker).to(DefaultCanvasTextPicker).inSingletonScope();
  bind(CanvasPickerContribution).toService(CanvasTextPicker);

  // polygon picker
  bind(CanvasPolygonPicker).to(DefaultCanvasPolygonPicker).inSingletonScope();
  bind(CanvasPickerContribution).toService(CanvasPolygonPicker);

  // pyramid3d picker
  bind(CanvasPyramid3dPicker).to(DefaultCanvasPyramid3dPicker).inSingletonScope();
  bind(CanvasPickerContribution).toService(CanvasPyramid3dPicker);

  // arc3d picker
  bind(CanvasArc3dPicker).to(DefaultCanvasArc3dPicker).inSingletonScope();
  bind(CanvasPickerContribution).toService(CanvasArc3dPicker);

  // richtext picker
  bind(CanvasRichTextPicker).to(DefaultCanvasRichTextPicker).inSingletonScope();
  bind(CanvasPickerContribution).toService(CanvasRichTextPicker);
  // glyph picker
  bind(CanvasGlyphPicker).to(DefaultCanvasGlyphPicker).inSingletonScope();
  bind(CanvasPickerContribution).toService(CanvasGlyphPicker);
  // group picker
  bind(CanvasGroupPicker).to(DefaultCanvasGroupPicker).inSingletonScope();
  bind(CanvasPickerContribution).toService(CanvasGroupPicker);

  bindContributionProvider(bind, CanvasPickerContribution);
});
