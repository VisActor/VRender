import type { AABBBounds } from '@visactor/vutils';
import type { GraphicType, IArc3d, IArc3dGraphicAttribute } from '../interface';
import { Arc } from './arc';
import { getTheme } from './theme';
import { application } from '../application';
import { parsePadding } from '../common/utils';
import { ARC3D_NUMBER_TYPE } from './constants';
import { NOWORK_ANIMATE_ATTR } from './graphic';

export class Arc3d extends Arc implements IArc3d {
  type: GraphicType = 'arc3d';
  declare attribute: IArc3dGraphicAttribute;

  static NOWORK_ANIMATE_ATTR = {
    cap: 1,
    ...NOWORK_ANIMATE_ATTR
  };

  constructor(params: IArc3dGraphicAttribute) {
    super(params);
    this.numberType = ARC3D_NUMBER_TYPE;
  }

  protected doUpdateAABBBounds(): AABBBounds {
    const polygonTheme = getTheme(this).arc;
    this._AABBBounds.clear();

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

  getNoWorkAnimateAttr(): Record<string, number> {
    return Arc3d.NOWORK_ANIMATE_ATTR;
  }
}

export function createArc3d(attributes: IArc3dGraphicAttribute): IArc3d {
  return new Arc3d(attributes);
}
