/**
 * @description polygon 类型 crosshair，用于极坐标系下
 */
import type { IGroup } from '@visactor/vrender-core';
import { merge, polarToCartesian, PointService } from '@visactor/vutils';
import type { PointLocationCfg } from '../core/type';
import { CrosshairBase } from './base';
import type { PolygonCrosshairAttrs } from './type';
import type { ComponentOptions } from '../interface';
import { loadPolygonCrosshairComponent } from './register';

loadPolygonCrosshairComponent();
export class PolygonCrosshair extends CrosshairBase<PolygonCrosshairAttrs> {
  static defaultAttributes = {
    lineStyle: {
      stroke: '#b2bacf',
      lineWidth: 1,
      lineDash: [2]
    }
  };

  constructor(attributes: PolygonCrosshairAttrs, options?: ComponentOptions) {
    super(options?.skipDefault ? attributes : merge({}, PolygonCrosshair.defaultAttributes, attributes));
  }

  protected renderCrosshair(container: IGroup) {
    const { center, radius, sides = 6, lineStyle } = this.attribute as PolygonCrosshairAttrs;
    const { startAngle, endAngle } = this.attribute;

    const isClose = (endAngle - startAngle) % (Math.PI * 2) === 0;
    const eachAngle = (endAngle - startAngle) / sides;
    let path;
    for (let index = 0; index <= sides; index++) {
      const angle = startAngle + eachAngle * index;
      const point = polarToCartesian(center, radius, angle);
      if (index === 0) {
        path = `M${point.x},${point.y}`;
      } else {
        path += `L${point.x},${point.y}`;
      }
      if (index === sides && isClose) {
        path += 'Z';
      }
    }

    const polygon = container.createOrUpdateChild(
      'crosshair-polygon',
      {
        path,
        ...lineStyle
      },
      'path'
    );
    return polygon;
  }

  setLocation(point: PointLocationCfg) {
    const { center } = this.attribute as PolygonCrosshairAttrs;
    const radius = PointService.distancePP(point, center);

    this.setAttribute('radius', radius);
  }
}
