/**
 * @description circle 类型 crosshair，用于极坐标系下
 */
import { IGroup } from '@visactor/vrender';
import { merge, PointService } from '@visactor/vutils';
import { PointLocationCfg } from '../core/type';
import { CrosshairBase } from './base';
import { CircleCrosshairAttrs } from './type';

export class CircleCrosshair extends CrosshairBase<CircleCrosshairAttrs> {
  static defaultAttributes = {
    lineStyle: {
      stroke: ['#b2bacf', false, false, false],
      lineWidth: 1,
      lineDash: [2]
    }
  };

  constructor(attributes: CircleCrosshairAttrs) {
    super(merge({}, CircleCrosshair.defaultAttributes, attributes));
  }

  protected renderCrosshair(container: IGroup) {
    const { center, radius, lineStyle } = this.attribute as CircleCrosshairAttrs;

    const circle = container.createOrUpdateChild(
      'crosshair-circle',
      {
        ...center,
        outerRadius: radius,
        ...this.attribute,
        ...lineStyle
      },
      'arc'
    );
    return circle;
  }

  setLocation(point: PointLocationCfg) {
    const { center } = this.attribute as CircleCrosshairAttrs;
    const radius = PointService.distancePP(point, center);

    this.setAttribute('radius', radius);
  }
}
