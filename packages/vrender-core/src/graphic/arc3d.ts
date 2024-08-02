import type { IAABBBounds } from '@visactor/vutils';
import type { GraphicType, IArc3d, IArc3dGraphicAttribute } from '../interface';
import { Arc } from './arc';
import { application } from '../application';
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

  protected updateAABBBounds(
    attribute: IArc3dGraphicAttribute,
    arcTheme: Required<IArc3dGraphicAttribute>,
    aabbBounds: IAABBBounds
  ) {
    const stage = this.stage;
    if (!stage || !stage.camera) {
      return aabbBounds;
    }

    // 当做一个立方体计算
    const { outerRadius = arcTheme.outerRadius, height = 0 } = attribute;
    const r = outerRadius + height;
    aabbBounds.setValue(-r, -r, r, r);
    // const matrix = getExtraModelMatrix(graphic.globalTransMatrix, 1, graphic);
    // const { outerRadius=arcTheme.outerRadius, height=0 } = attribute;
    // const points = [
    //   {x: -outerRadius, y: -outerRadius, z: 0 },
    //   {x: outerRadius, y: -outerRadius, z: 0 },
    //   {x: outerRadius, y: outerRadius, z: 0 },
    //   {x: -outerRadius, y: outerRadius, z: 0 },
    //   {x: -outerRadius, y: -outerRadius, z: height },
    //   {x: outerRadius, y: -outerRadius, z: height },
    //   {x: outerRadius, y: outerRadius, z: height },
    //   {x: -outerRadius, y: outerRadius, z: height },
    // ]
    // const outP: vec3 = [0, 0, 0];
    // points.forEach(item => {
    //   let x = item.x;
    //   let y = item.y;
    //   if (stage.camera) {
    //     transformMat4(outP, [item.x, item.y, item.z], matrix);
    //     const data = stage.camera.vp(outP[0], outP[1], outP[2]);
    //     x = data.x;
    //     y = data.y;
    //   }
    //   aabbBounds.add(x, y);
    // });
    application.graphicService.updateTempAABBBounds(aabbBounds);
    application.graphicService.transformAABBBounds(attribute, aabbBounds, arcTheme, false, this);
    return aabbBounds;
  }

  getNoWorkAnimateAttr(): Record<string, number> {
    return Arc3d.NOWORK_ANIMATE_ATTR;
  }
}

export function createArc3d(attributes: IArc3dGraphicAttribute): IArc3d {
  return new Arc3d(attributes);
}
