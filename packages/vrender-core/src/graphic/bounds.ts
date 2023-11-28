import type { IRichTextAttribute, ITextAttribute } from '../interface';
import { graphicCreator } from './graphic-creator';
// import { createRichText, createText } from './graphic-creator';

type ITextBoundsParams = Partial<ITextAttribute>;
let text: any;
export function getTextBounds(params: ITextBoundsParams) {
  if (!text) {
    text = graphicCreator.CreateGraphic('text', {});
  }
  text.setAttributes(params);
  return text.AABBBounds;
}

type IRichTextBoundsParams = Partial<IRichTextAttribute>;
let richText: any;
export function getRichTextBounds(params: IRichTextBoundsParams) {
  if (!richText) {
    richText = graphicCreator.CreateGraphic('text', {});
  }
  richText.setAttributes(params);
  return richText.AABBBounds;
}
