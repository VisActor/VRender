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

export default new ContainerModule((bind, unbind, isBound, rebind) => {
  // group picker
  bind(CanvasGroupPicker).to(DefaultCanvasGroupPicker).inSingletonScope();
  bind(CanvasPickerContribution).toService(CanvasGroupPicker);

  bindContributionProvider(bind, CanvasPickerContribution);
});
