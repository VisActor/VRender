import type { AABBBounds } from '@visactor/vutils';
import type { GraphicType, IArc3d, IArc3dGraphicAttribute } from '../interface';
import { Arc } from './arc';
import { getTheme } from './theme';
import { application } from '../application';
import { parsePadding } from '../common/utils';
import { ARC3D_NUMBER_TYPE } from './constants';

export class Arc3d extends Arc implements IArc3d {
  type: GraphicType = 'arc3d';
  declare attribute: IArc3dGraphicAttribute;

  constructor(params: IArc3dGraphicAttribute) {
    super(params);
    this.numberType = ARC3D_NUMBER_TYPE;
  }

  protected doUpdateAABBBounds(): AABBBounds {
    const polygonTheme = getTheme(this).arc;
    this._AABBBounds.setValue(Infinity, Infinity, -Infinity, -Infinity);

    const attribute = this.attribute;
    const bounds = application.graphicService.updateArc3dAABBBounds(
      attribute,
      getTheme(this).polygon as any,
      this._AABBBounds,
      this
    ) as AABBBounds;

    const { boundsPadding = polygonTheme.boundsPadding } = attribute;
    const paddingArray = parsePadding(boundsPadding);
    if (paddingArray) {
      bounds.expand(paddingArray);
    }

    this.clearUpdateBoundTag();

    return this._AABBBounds;
  }
}
