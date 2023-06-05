/**
 * @description 直线类型 crosshair
 */
import { IGroup } from '@visactor/vrender';
import { merge } from '@visactor/vutils';
import { RegionLocationCfg } from '../core/type';
import { CrosshairBase } from './base';
import { LineCrosshairAttrs } from './type';

export class LineCrosshair extends CrosshairBase<LineCrosshairAttrs> {
  static defaultAttributes = {
    lineStyle: {
      stroke: true,
      strokeColor: '#b2bacf',
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
