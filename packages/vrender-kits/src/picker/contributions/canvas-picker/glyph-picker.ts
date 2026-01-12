import { serviceRegistry, GlyphRender, contributionRegistry } from '@visactor/vrender-core';
import type { IGraphicPicker, IGraphicRender } from '@visactor/vrender-core';
import { GlyphPickerBase } from '../common/glyph-picker-base';

export class DefaultCanvasGlyphPicker extends GlyphPickerBase implements IGraphicPicker {
  constructor() {
    super();
    try {
      this.canvasRenderer = serviceRegistry.get(GlyphRender) as IGraphicRender;
    } catch (_) {
      this.canvasRenderer = contributionRegistry.get<IGraphicRender>(GlyphRender)[0];
    }
  }
}
