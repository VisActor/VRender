import type { IRichTextGraphicAttribute, ITextGraphicAttribute } from '../interface';
import { createGraphic } from './graphic-creator';
// import { createRichText, createText } from './graphic-creator';

type ITextBoundsParams = Partial<ITextGraphicAttribute>;
let text: any;
export function getTextBounds(params: ITextBoundsParams) {
  if (!text) {
    text = createGraphic('text', {});
  }
  text.initAttributes(params);
  return text.AABBBounds;
}

type IRichTextBoundsParams = Partial<IRichTextGraphicAttribute>;
let richText: any;
export function getRichTextBounds(params: IRichTextBoundsParams) {
  if (!richText) {
    richText = createGraphic('richtext', {});
  }
  richText.setAttributes(params);
  return richText.AABBBounds;
}
