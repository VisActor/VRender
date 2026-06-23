import type { IPoint } from '@visactor/vutils';
import {
  RICHTEXT_NUMBER_TYPE,
  type IGraphicPicker,
  type IGraphicRender,
  type IPickParams,
  type IRichText
} from '@visactor/vrender-core';
export class DefaultCanvasRichTextPicker implements IGraphicPicker {
  type: string = 'richtext';
  numberType: number = RICHTEXT_NUMBER_TYPE;

  constructor(public readonly canvasRenderer: IGraphicRender) {}

  contains(richtext: IRichText, point: IPoint, params?: IPickParams): boolean {
    if (richtext.AABBBounds.containsPoint(point)) {
      return true;
    }
    return false;
  }
}
