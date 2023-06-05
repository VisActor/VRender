import { ITextAttribute } from '../interface';
import { createText } from './graphic-creator';

type ITextBoundsParams = Partial<ITextAttribute>;
const text = createText({
  text: ''
});
export function getTextBounds(params: ITextBoundsParams) {
  text.setAttributes(params);
  return text.AABBBounds;
}
