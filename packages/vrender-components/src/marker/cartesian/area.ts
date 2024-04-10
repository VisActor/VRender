import type { IGroup, INode, IPolygon } from '@visactor/vrender-core';
// eslint-disable-next-line no-duplicate-imports
import { graphicCreator } from '@visactor/vrender-core';
import { isValidNumber, merge } from '@visactor/vutils';
import type { TagAttributes } from '../../tag';
// eslint-disable-next-line no-duplicate-imports
import { Tag } from '../../tag';
import { Marker } from '../base';
import { DEFAULT_CARTESIAN_MARK_AREA_TEXT_STYLE_MAP, DEFAULT_CARTESIAN_MARK_AREA_THEME } from '../config';
import type { CartesianMarkAreaAttrs } from '../type';
import { limitShapeInBounds } from '../../util/limit-shape';
import type { ComponentOptions } from '../../interface';
import { loadCartesianMarkAreaComponent } from '../register';
import type { Point } from '../../core/type';
import { DEFAULT_STATES } from '../../constant';

loadCartesianMarkAreaComponent();
export class CartesianMarkArea extends Marker<CartesianMarkAreaAttrs> {
  name = 'cartesianMarkArea';
  static defaultAttributes = DEFAULT_CARTESIAN_MARK_AREA_THEME;
  private _area!: IPolygon;
  getArea() {
    return this._area;
  }

  getLabel() {
    return this._label;
  }

  constructor(attributes: CartesianMarkAreaAttrs, options?: ComponentOptions) {
    super(options?.skipDefault ? attributes : merge({}, CartesianMarkArea.defaultAttributes, attributes));
  }

  protected getPositionByDirection(direction: string) {
    const { x1, x2, y1, y2 } = this._area.AABBBounds;
    // labelHeight
    // eslint-disable-next-line max-len
    const labelRectHeight = Math.abs(
      (this._label.getTextShape().AABBBounds?.y2 ?? 0) - (this._label.getTextShape()?.AABBBounds.y1 ?? 0)
    );
    // eslint-disable-next-line max-len
    const labelTextHeight = Math.abs(
      (this._label.getBgRect().AABBBounds?.y2 ?? 0) - (this._label.getBgRect()?.AABBBounds.y1 ?? 0)
    );
    const labelHeight = Math.max(labelRectHeight, labelTextHeight);

    // labelWidth
    // eslint-disable-next-line max-len
    const labelRectWidth = Math.abs(
      (this._label.getTextShape().AABBBounds?.x2 ?? 0) - (this._label.getTextShape()?.AABBBounds.x1 ?? 0)
    );
    // eslint-disable-next-line max-len
    const labelTextWidth = Math.abs(
      (this._label.getBgRect().AABBBounds?.x2 ?? 0) - (this._label.getBgRect()?.AABBBounds.x1 ?? 0)
    );
    const labelWidth = Math.max(labelRectWidth, labelTextWidth);

    if (direction.includes('left') || direction.includes('Left')) {
      return {
        x: x1 + (direction.includes('inside') ? 0.5 : -0.5) * labelWidth,
        y: (y1 + y2) / 2
      };
    }
    if (direction.includes('right') || direction.includes('Right')) {
      return {
        x: x2 + (direction.includes('inside') ? -0.5 : 0.5) * labelWidth,
        y: (y1 + y2) / 2
      };
    }
    if (direction.includes('top') || direction.includes('Top')) {
      return {
        x: (x1 + x2) / 2,
        y: y1 + (direction.includes('inside') ? 0.5 : -0.5) * labelHeight
      };
    }
    if (direction.includes('bottom') || direction.includes('Bottom')) {
      return {
        x: (x1 + x2) / 2,
        y: y2 + (direction.includes('inside') ? -0.5 : 0.5) * labelHeight
      };
    }

    return {
      x: (x1 + x2) / 2,
      y: (y1 + y2) / 2
    };
  }

  protected setLabelPos() {
    if (this._label && this._area) {
      const { label = {} } = this.attribute as CartesianMarkAreaAttrs;
      const labelPosition = label.position ?? 'middle';
      const labelPoint = this.getPositionByDirection(labelPosition);
      this._label.setAttributes({
        ...labelPoint
      });

      if (this.attribute.limitRect && label.confine) {
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
    const { points, label, areaStyle, state } = this.attribute as CartesianMarkAreaAttrs;
    const area = graphicCreator.polygon({
      points: points,
      ...areaStyle
    });
    area.states = merge({}, DEFAULT_STATES, state?.area);
    area.name = 'mark-polygon-polygon';
    this._area = area;
    container.add(area);

    const markLabel = new Tag({
      ...(label as TagAttributes),
      state: {
        panel: merge({}, DEFAULT_STATES, state?.labelBackground),
        text: merge({}, DEFAULT_STATES, state?.label)
      }
    });
    markLabel.name = 'mark-polygon-label';
    this._label = markLabel;
    container.add(markLabel as unknown as INode);
    this.setLabelPos();
  }

  protected updateMarker() {
    const { points, label, areaStyle } = this.attribute as CartesianMarkAreaAttrs;
    if (this._area) {
      this._area.setAttributes({
        points: points,
        ...areaStyle
      });
    }
    if (this._area) {
      this._label.setAttributes({
        dx: 0,
        dy: 0, // 需要进行复位
        ...(label as TagAttributes)
      });
    }
    this.setLabelPos();
  }

  protected isValidPoints() {
    const { points } = this.attribute as CartesianMarkAreaAttrs;
    if (!points || points.length < 3) {
      return false;
    }
    let validFlag = true;
    points.forEach((point: Point) => {
      if (!isValidNumber((point as Point).x) || !isValidNumber((point as Point).y)) {
        validFlag = false;
        return;
      }
    });
    return validFlag;
  }
}
