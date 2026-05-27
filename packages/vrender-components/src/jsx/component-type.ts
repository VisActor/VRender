import type { IDefaultGraphicParamsType } from '@visactor/vrender-kits/jsx/graphicType';
import { Tag, type TagAttributes } from '../tag';

export function VTag(params: IDefaultGraphicParamsType<TagAttributes>) {
  return new Tag(params ? params.attribute : {});
}
