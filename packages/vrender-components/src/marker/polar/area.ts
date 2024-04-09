import type { IArc, IGroup, INode } from '@visactor/vrender-core';
// eslint-disable-next-line no-duplicate-imports
import { graphicCreator } from '@visactor/vrender-core';
import { merge } from '@visactor/vutils';
import type { TagAttributes } from '../../tag';
// eslint-disable-next-line no-duplicate-imports
import { Tag } from '../../tag';
import { Marker } from '../base';
import { DEFAULT_POLAR_MARK_AREA_THEME } from '../config';
import { IPolarMarkAreaLabelPosition, type PolarMarkAreaAttrs } from '../type';
import { limitShapeInBounds } from '../../util/limit-shape';
import type { ComponentOptions } from '../../interface';
import { loadPolarMarkAreaComponent } from '../register';
import { DEFAULT_STATES } from '../../constant';

loadPolarMarkAreaComponent();
export class PolarMarkArea extends Marker<PolarMarkAreaAttrs> {
  name = 'polarMarkArea';
  static defaultAttributes = DEFAULT_POLAR_MARK_AREA_THEME;
  private _area!: IArc;

  getArea() {
    return this._area;
  }

  getLabel() {
    return this._label;
  }

  constructor(attributes: PolarMarkAreaAttrs, options?: ComponentOptions) {
    super(options?.skipDefault ? attributes : merge({}, PolarMarkArea.defaultAttributes, attributes));
  }

  private _getPositionByDirection(area: IArc, direction: string) {
    const { center, innerRadius, outerRadius, startAngle, endAngle } = this.attribute as PolarMarkAreaAttrs;

    switch (direction) {
      case IPolarMarkAreaLabelPosition.center:
        return {
          x: center.x + ((innerRadius + outerRadius) / 2) * Math.cos((startAngle + endAngle) / 2),
          y: center.y + ((innerRadius + outerRadius) / 2) * Math.sin((startAngle + endAngle) / 2)
        };
      case IPolarMarkAreaLabelPosition.arcStart:
        return {
          x: center.x + ((innerRadius + outerRadius) / 2) * Math.cos(startAngle),
          y: center.y + ((innerRadius + outerRadius) / 2) * Math.sin(startAngle)
        };
      case IPolarMarkAreaLabelPosition.arcEnd:
        return {
          x: center.x + ((innerRadius + outerRadius) / 2) * Math.cos(endAngle),
          y: center.y + ((innerRadius + outerRadius) / 2) * Math.sin(endAngle)
        };
      case IPolarMarkAreaLabelPosition.arcInner:
        return {
          x: center.x + innerRadius * Math.cos((startAngle + endAngle) / 2),
          y: center.y + innerRadius * Math.sin((startAngle + endAngle) / 2)
        };
      case IPolarMarkAreaLabelPosition.arcOuter:
        return {
          x: center.x + outerRadius * Math.cos((startAngle + endAngle) / 2),
          y: center.y + outerRadius * Math.sin((startAngle + endAngle) / 2)
        };
      default: // default arcOuter
        return {
          x: center.x + innerRadius * Math.cos((startAngle + endAngle) / 2),
          y: center.y + innerRadius * Math.sin((startAngle + endAngle) / 2)
        };
    }
  }

  protected setLabelPos() {
    if (this._label && this._area) {
      const { label = {} } = this.attribute as PolarMarkAreaAttrs;
      const labelPosition = label.position ?? 'middle';
      const labelPoint = this._getPositionByDirection(this._area, labelPosition);
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
    const { center, innerRadius, outerRadius, startAngle, endAngle, areaStyle, label, state } = this
      .attribute as PolarMarkAreaAttrs;
    const area = graphicCreator.arc({
      x: center.x,
      y: center.y,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      ...areaStyle
    });
    area.states = merge({}, DEFAULT_STATES, state?.area);
    area.name = 'polar-mark-area-area';
    this._area = area;
    container.add(area);

    const markLabel = new Tag({
      ...(label as TagAttributes),
      state: {
        panel: merge({}, DEFAULT_STATES, state?.labelBackground),
        text: merge({}, DEFAULT_STATES, state?.label)
      }
    });
    markLabel.name = 'mark-area-label';
    this._label = markLabel;
    container.add(markLabel as unknown as INode);
    this.setLabelPos();
  }

  protected updateMarker() {
    const { center, innerRadius, outerRadius, startAngle, endAngle, areaStyle, label } = this
      .attribute as PolarMarkAreaAttrs;
    if (this._area) {
      this._area.setAttributes({
        x: center.x,
        y: center.y,
        innerRadius,
        outerRadius,
        startAngle,
        endAngle,
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
    return true;
  }
}
