import type { IRichTextAttribute, ITextAttribute } from '../interface';
import { createRichText, createText } from './graphic-creator';

type ITextBoundsParams = Partial<ITextAttribute>;
const text = createText({
  text: ''
});
export function getTextBounds(params: ITextBoundsParams) {
  text.setAttributes(params);
  return text.AABBBounds;
}

type IRichTextBoundsParams = Partial<IRichTextAttribute>;
const richText = createRichText({});
export function getRichTextBounds(params: IRichTextBoundsParams) {
  richText.setAttributes(params);
  return richText.AABBBounds;
}
