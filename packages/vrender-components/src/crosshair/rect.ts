/**
 * @description 矩形类型 crosshair
 */
import { IGroup } from '@visactor/vrender';
import { merge } from '@visactor/vutils';
import { RegionLocationCfg } from '../core/type';
import { Tag } from '../tag';
import { CrosshairBase } from './base';
import { RectCrosshairAttrs } from './type';

export class RectCrosshair extends CrosshairBase<RectCrosshairAttrs> {
  static defaultAttributes = {
    rectStyle: {
      fillColor: '#b2bacf',
      opacity: 0.2
    }
  };

  protected topLabelShape?: Tag;
  protected bottomLabelShape?: Tag;
  protected leftLabelShape?: Tag;
  protected rightLabelShape?: Tag;

  constructor(attributes: RectCrosshairAttrs) {
    super(merge({}, RectCrosshair.defaultAttributes, attributes));
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
