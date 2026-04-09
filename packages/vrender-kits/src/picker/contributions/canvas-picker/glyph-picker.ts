import type { IGraphicPicker, IGraphicRender } from '@visactor/vrender-core';
import { GlyphPickerBase } from '../common/glyph-picker-base';

export class DefaultCanvasGlyphPicker extends GlyphPickerBase implements IGraphicPicker {
  constructor(public readonly canvasRenderer: IGraphicRender) {
    super();
  }
}
