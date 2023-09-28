import type { IPoint } from '@visactor/vutils';
import { inject, injectable, RICHTEXT_NUMBER_TYPE, RichTextRender } from '@visactor/vrender-core';
import type { IGraphicPicker, IGraphicRender, IPickParams, IRichText } from '@visactor/vrender-core';
@injectable()
export class DefaultCanvasRichTextPicker implements IGraphicPicker {
  type: string = 'richtext';
  numberType: number = RICHTEXT_NUMBER_TYPE;

  constructor(@inject(RichTextRender) public readonly canvasRenderer: IGraphicRender) {}

  contains(richtext: IRichText, point: IPoint, params?: IPickParams): boolean {
    if (richtext.AABBBounds.containsPoint(point)) {
      return true;
    }
    return false;
  }
}
