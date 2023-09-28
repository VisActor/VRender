/**
 * @description 直线类型 crosshair
 */
import type { IGroup } from '@visactor/vrender-core';
import { merge } from '@visactor/vutils';
import type { RegionLocationCfg } from '../core/type';
import { CrosshairBase } from './base';
import type { LineCrosshairAttrs } from './type';

export class LineCrosshair extends CrosshairBase<LineCrosshairAttrs> {
  static defaultAttributes = {
    lineStyle: {
      stroke: '#b2bacf',
      lineWidth: 1,
      lineDash: [2]
    }
  };

  constructor(attributes: LineCrosshairAttrs) {
    super(merge({}, LineCrosshair.defaultAttributes, attributes));
  }

  protected renderCrosshair(container: IGroup) {
    const { start, end, lineStyle } = this.attribute as LineCrosshairAttrs;

    const line = container.createOrUpdateChild(
      'crosshair-line',
      {
        points: [start, end],
        ...lineStyle
      },
      'line'
    );
    return line;
  }

  setLocation(region: RegionLocationCfg) {
    const { start, end } = region;
    this.setAttributes({
      start,
      end
    });
  }
}
