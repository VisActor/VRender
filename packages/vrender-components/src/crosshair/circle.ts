/**
 * @description circle 类型 crosshair，用于极坐标系下
 */
import type { IGroup } from '@visactor/vrender/es/core';
import { merge, PointService } from '@visactor/vutils';
import type { PointLocationCfg } from '../core/type';
import { CrosshairBase } from './base';
import type { CircleCrosshairAttrs } from './type';
import type { ComponentOptions } from '../interface';
import { loadCircleCrosshair } from './register';

loadCircleCrosshair();
export class CircleCrosshair extends CrosshairBase<CircleCrosshairAttrs> {
  static defaultAttributes = {
    lineStyle: {
      stroke: ['#b2bacf', false, false, false],
      lineWidth: 1,
      lineDash: [2]
    }
  };

  constructor(attributes: CircleCrosshairAttrs, options?: ComponentOptions) {
    super(options?.skipDefault ? attributes : merge({}, CircleCrosshair.defaultAttributes, attributes));
  }

  protected renderCrosshair(container: IGroup) {
    const { center, radius, lineStyle } = this.attribute as CircleCrosshairAttrs;

    const circle = container.createOrUpdateChild(
      'crosshair-circle',
      {
        ...center,
        outerRadius: radius,
        // TODO: group的cornerRadius支持数组，arc的不支持数组，此处会有类型转换问题
        ...(this.attribute as any),
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
