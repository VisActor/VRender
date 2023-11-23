import type { IGroup, INode, IPolygon } from '@visactor/vrender-core';
import { createPolygon } from '@visactor/vrender-core';
import { merge } from '@visactor/vutils';
import { Tag } from '../tag';
import { Marker } from './base';
import { DEFAULT_MARK_AREA_TEXT_STYLE_MAP, DEFAULT_MARK_AREA_THEME } from './config';
import type { MarkAreaAttrs } from './type';
import { limitShapeInBounds } from '../util/limit-shape';
import type { ComponentOptions } from '../interface';

export class MarkArea extends Marker<MarkAreaAttrs> {
  name = 'markArea';
  static defaultAttributes = DEFAULT_MARK_AREA_THEME;
  private _area!: IPolygon;
  getArea() {
    return this._area;
  }

  getLabel() {
    return this._label;
  }

  constructor(attributes: MarkAreaAttrs, options?: ComponentOptions) {
    super(options?.skipDefault ? attributes : merge({}, MarkArea.defaultAttributes, attributes));
  }

  private _getPositionByDirection(area: IPolygon, direction: string) {
    const { x1, x2, y1, y2 } = this._area.AABBBounds;

    if (direction.includes('left') || direction.includes('Left')) {
      return {
        x: x1,
        y: (y1 + y2) / 2
      };
    }
    if (direction.includes('right') || direction.includes('Right')) {
      return {
        x: x2,
        y: (y1 + y2) / 2
      };
    }
    if (direction.includes('top') || direction.includes('Top')) {
      return {
        x: (x1 + x2) / 2,
        y: y1
      };
    }
    if (direction.includes('bottom') || direction.includes('Bottom')) {
      return {
        x: (x1 + x2) / 2,
        y: y2
      };
    }

    return {
      x: (x1 + x2) / 2,
      y: (y1 + y2) / 2
    };
  }

  protected setLabelPos() {
    if (this._label && this._area) {
      const { label } = this.attribute as MarkAreaAttrs;
      const labelPosition = label?.position ?? 'middle';
      const labelPoint = this._getPositionByDirection(this._area, labelPosition);
      this._label.setAttributes({
        ...labelPoint,
        textStyle: {
          ...DEFAULT_MARK_AREA_TEXT_STYLE_MAP[labelPosition],
          ...label.textStyle
        }
      });

      if (this.attribute.limitRect && label?.confine) {
        const { x, y, width, height } = this.attribute.limitRect;
        limitShapeInBounds(this._label, {
          x1: x,
          y1: y,
          x2: x + width,
          y2: y + height
        });
      }
    }
  }

  protected initMarker(container: IGroup) {
    const { points, label, areaStyle } = this.attribute as MarkAreaAttrs;
    const area = createPolygon({
      points: points,
      ...areaStyle
    });
    area.name = 'mark-area-area';
    this._area = area;
    container.add(area);

    const markLabel = new Tag({
      ...label
    });
    markLabel.name = 'mark-area-label';
    this._label = markLabel;
    container.add(markLabel as unknown as INode);
    this.setLabelPos();
  }

  protected updateMarker() {
    const { points, label, areaStyle } = this.attribute as MarkAreaAttrs;
    this._area?.setAttributes({
      points: points,
      ...areaStyle
    });
    this._label?.setAttributes({
      dx: 0,
      dy: 0, // 需要进行复位
      ...label
    });
    this.setLabelPos();
  }

  protected isValidPoints() {
    const { points } = this.attribute as MarkAreaAttrs;
    if (!points || points.length < 3) {
      return false;
    }
    return true;
  }
}
