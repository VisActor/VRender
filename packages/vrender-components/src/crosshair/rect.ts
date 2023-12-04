/**
 * @description 矩形类型 crosshair
 */
import type { IGroup } from '@visactor/vrender/es/core';
import { merge } from '@visactor/vutils';
import type { RegionLocationCfg } from '../core/type';
import type { Tag } from '../tag';
import { CrosshairBase } from './base';
import type { RectCrosshairAttrs } from './type';
import type { ComponentOptions } from '../interface';
import { loadRectCrosshairComponent } from './register';

loadRectCrosshairComponent();
export class RectCrosshair extends CrosshairBase<RectCrosshairAttrs> {
  static defaultAttributes = {
    rectStyle: {
      fill: '#b2bacf',
      opacity: 0.2
    }
  };

  protected topLabelShape?: Tag;
  protected bottomLabelShape?: Tag;
  protected leftLabelShape?: Tag;
  protected rightLabelShape?: Tag;

  constructor(attributes: RectCrosshairAttrs, options?: ComponentOptions) {
    super(options?.skipDefault ? attributes : merge({}, RectCrosshair.defaultAttributes, attributes));
  }

  protected renderCrosshair(container: IGroup) {
    const { start, end, rectStyle } = this.attribute as RectCrosshairAttrs;

    const rect = container.createOrUpdateChild(
      'crosshair-rect',
      {
        x: start.x,
        y: start.y,
        width: end.x - start.x,
        height: end.y - start.y,
        ...rectStyle
      },
      'rect'
    );
    return rect;
  }

  setLocation(region: RegionLocationCfg) {
    const { start, end } = region;
    this.setAttributes({
      start,
      end
    });
  }
}
