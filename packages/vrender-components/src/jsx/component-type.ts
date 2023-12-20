import type { IDefaultGraphicParamsType } from '@visactor/vrender-kits';
import type { TagAttributes } from '../tag';
import { Tag } from '../tag';

export function VTag(params: IDefaultGraphicParamsType<TagAttributes>) {
  return new Tag(params ? params.attribute : {});
}
