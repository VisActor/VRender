import { AABBBounds } from '@visactor/vutils';
import { GraphicType, IArc3d, IArc3dGraphicAttribute } from '../interface';
import { genNumberType } from './graphic';
import { Arc } from './arc';
import { getTheme } from './theme';
import { graphicService } from '../modules';
import { parsePadding } from '../common/utils';

export const ARC3D_NUMBER_TYPE = genNumberType();

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
    const bounds = graphicService.updateArc3dAABBBounds(
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
