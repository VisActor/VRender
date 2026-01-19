import type { IPoint } from '@visactor/vutils';
import { serviceRegistry, contributionRegistry, RICHTEXT_NUMBER_TYPE, RichTextRender } from '@visactor/vrender-core';
import type { IGraphicPicker, IGraphicRender, IPickParams, IRichText } from '@visactor/vrender-core';
export class DefaultCanvasRichTextPicker implements IGraphicPicker {
  type: string = 'richtext';
  numberType: number = RICHTEXT_NUMBER_TYPE;

  constructor() {
    try {
      (this as any).canvasRenderer = serviceRegistry.get(RichTextRender) as IGraphicRender;
    } catch (_) {
      (this as any).canvasRenderer = contributionRegistry.get<IGraphicRender>(RichTextRender)[0];
    }
  }

  contains(richtext: IRichText, point: IPoint, params?: IPickParams): boolean {
    if (richtext.AABBBounds.containsPoint(point)) {
      return true;
    }
    return false;
  }
}
