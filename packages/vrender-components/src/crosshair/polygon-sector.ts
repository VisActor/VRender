/**
 * @description sector 类型 crosshair，用于极坐标系下
 */
import type { IGroup } from '@visactor/vrender-core';
import { merge, getAngleByPoint, radianToDegree, polarToCartesian } from '@visactor/vutils';
import type { PointLocationCfg } from '../core/type';
import { POLAR_END_ANGLE, POLAR_START_ANGLE } from '../constant';
import { CrosshairBase } from './base';
import type { PolygonSectorCrosshairAttrs } from './type';
import type { ComponentOptions } from '../interface';
import { loadPolygonSectorCrosshairComponent } from './register';
import { getPolygonPath } from '../axis';

loadPolygonSectorCrosshairComponent();
export class PolygonSectorCrosshair extends CrosshairBase<PolygonSectorCrosshairAttrs> {
  static defaultAttributes = {
    polygonSectorStyle: {
      fill: '#b2bacf',
      opacity: 0.2
    }
  };

  constructor(attributes: PolygonSectorCrosshairAttrs, options?: ComponentOptions) {
    super(options?.skipDefault ? attributes : merge({}, PolygonSectorCrosshair.defaultAttributes, attributes));
  }

  protected renderCrosshair(container: IGroup) {
    const { center, radius, innerRadius = 0, polygonSectorStyle } = this.attribute as PolygonSectorCrosshairAttrs;
    const { startAngle, endAngle } = this.attribute;
    const points = [];
    points.push(polarToCartesian(center, innerRadius, startAngle));
    points.push(polarToCartesian(center, radius * Math.cos((endAngle - startAngle) / 2), startAngle));
    points.push(polarToCartesian(center, radius, (startAngle + endAngle) / 2));
    points.push(polarToCartesian(center, radius * Math.cos((endAngle - startAngle) / 2), endAngle));
    points.push(polarToCartesian(center, innerRadius, endAngle));

    const polygon = container.createOrUpdateChild(
      'crosshair-polygon-sector',
      {
        path: getPolygonPath(points, true),
        ...polygonSectorStyle
      },
      'path'
    );
    return polygon;
  }

  setLocation(point: PointLocationCfg) {
    const {
      center,
      startAngle = POLAR_START_ANGLE,
      endAngle = POLAR_END_ANGLE
    } = this.attribute as PolygonSectorCrosshairAttrs;
    const sectorAngle = endAngle - startAngle;
    const pointAngle = radianToDegree(getAngleByPoint(center, point));
    this.setAttributes({
      startAngle: pointAngle - sectorAngle / 2,
      endAngle: pointAngle + sectorAngle / 2
    });
  }
}
