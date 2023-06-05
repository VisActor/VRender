/**
 * @description sector 类型 crosshair，用于极坐标系下
 */
import { IGroup } from '@visactor/vrender';
import { merge, getAngleByPoint, radianToDegree } from '@visactor/vutils';
import { PointLocationCfg } from '../core/type';
import { POLAR_END_ANGLE, POLAR_START_ANGLE } from '../constant';
import { CrosshairBase } from './base';
import { SectorCrosshairAttrs } from './type';

export class SectorCrosshair extends CrosshairBase<SectorCrosshairAttrs> {
  static defaultAttributes = {
    sectorStyle: {
      fillColor: '#b2bacf',
      opacity: 0.2
    }
  };

  constructor(attributes: SectorCrosshairAttrs) {
    super(merge({}, SectorCrosshair.defaultAttributes, attributes));
  }

  protected renderCrosshair(container: IGroup) {
    const { center, radius, innerRadius = 0, sectorStyle } = this.attribute as SectorCrosshairAttrs;
    const { startAngle, endAngle } = this.attribute;
    const circle = container.createOrUpdateChild(
      'crosshair-sector',
      {
        ...center,
        outerRadius: radius,
        innerRadius,
        startAngle,
        endAngle,
        ...sectorStyle
      },
      'arc'
    );
    return circle;
  }

  setLocation(point: PointLocationCfg) {
    const {
      center,
      startAngle = POLAR_START_ANGLE,
      endAngle = POLAR_END_ANGLE
    } = this.attribute as SectorCrosshairAttrs;
    const sectorAngle = endAngle - startAngle;
    const pointAngle = radianToDegree(getAngleByPoint(center, point));
    this.setAttributes({
      startAngle: pointAngle - sectorAngle / 2,
      endAngle: pointAngle + sectorAngle / 2
    });
  }
}
