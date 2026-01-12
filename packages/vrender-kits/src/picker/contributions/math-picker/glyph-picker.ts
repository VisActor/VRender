import { application, GlyphRender } from '@visactor/vrender-core';
import type { IGraphicPicker, IGraphicRender } from '@visactor/vrender-core';
import { GlyphPickerBase } from '../common/glyph-picker-base';

export class DefaultMathGlyphPicker extends GlyphPickerBase implements IGraphicPicker {
  constructor() {
    super();
    try {
      this.canvasRenderer = application.services.get(GlyphRender) as IGraphicRender;
    } catch (_) {
      this.canvasRenderer = application.contributions.get<IGraphicRender>(GlyphRender)[0];
    }
  }
}
