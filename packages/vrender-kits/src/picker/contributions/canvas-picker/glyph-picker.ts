import { inject, injectable, GlyphRender } from '@visactor/vrender-core';
import type { IGraphicPicker, IGraphicRender } from '@visactor/vrender-core';
import { GlyphPickerBase } from '../common/glyph-picker-base';

@injectable()
export class DefaultCanvasGlyphPicker extends GlyphPickerBase implements IGraphicPicker {
  constructor(@inject(GlyphRender) public readonly canvasRenderer: IGraphicRender) {
    super();
  }
}
