/**
 * @description sector 类型 crosshair，用于极坐标系下
 */
import type { IGroup } from '@visactor/vrender-core';
import { merge, getAngleByPoint, radianToDegree } from '@visactor/vutils';
import type { PointLocationCfg } from '../core/type';
import { POLAR_END_ANGLE, POLAR_START_ANGLE } from '../constant';
import { CrosshairBase } from './base';
import type { SectorCrosshairAttrs } from './type';
import type { ComponentOptions } from '../interface';

export class SectorCrosshair extends CrosshairBase<SectorCrosshairAttrs> {
  static defaultAttributes = {
    sectorStyle: {
      fill: '#b2bacf',
      opacity: 0.2
    }
  };

  constructor(attributes: SectorCrosshairAttrs, options?: ComponentOptions) {
    super(options?.skipDefault ? attributes : merge({}, SectorCrosshair.defaultAttributes, attributes));
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
