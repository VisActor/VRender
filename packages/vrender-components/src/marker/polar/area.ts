import type { IArc, IGroup, INode } from '@visactor/vrender-core';
// eslint-disable-next-line no-duplicate-imports
import { graphicCreator } from '@visactor/vrender-core';
import { merge } from '@visactor/vutils';
import type { TagAttributes } from '../../tag';
// eslint-disable-next-line no-duplicate-imports
import { Tag } from '../../tag';
import { Marker } from '../base';
import { DEFAULT_POLAR_MARK_AREA_THEME } from '../config';
import { IPolarMarkLabelPosition, type PolarMarkAreaAttrs } from '../type';
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

  protected getPositionByDirection(direction: string) {
    const { center, innerRadius, outerRadius, startAngle, endAngle, label } = this.attribute as PolarMarkAreaAttrs;
    const { refX = 0, refY = 0 } = label;
    // eslint-disable-next-line max-len
    const labelRectHeight = Math.abs(
      (this._label.getTextShape().AABBBounds?.y2 ?? 0) - (this._label.getTextShape()?.AABBBounds.y1 ?? 0)
    );
    // eslint-disable-next-line max-len
    const labelTextHeight = Math.abs(
      (this._label.getBgRect().AABBBounds?.y2 ?? 0) - (this._label.getBgRect()?.AABBBounds.y1 ?? 0)
    );
    const labelHeight = Math.max(labelRectHeight, labelTextHeight);

    let radius;
    let angle;
    // tag在正交方向是向内偏移，还是向外偏移
    // 不偏移: 0, 内: -1, 外: 1
    let orthogonalOffsetDirection;

    switch (direction) {
      case IPolarMarkLabelPosition.center:
        radius = (innerRadius + outerRadius) / 2;
        angle = (startAngle + endAngle) / 2;
        orthogonalOffsetDirection = 0;
        break;
      case IPolarMarkLabelPosition.arcInnerStart:
        radius = innerRadius;
        angle = startAngle;
        orthogonalOffsetDirection = -1;
        break;
      case IPolarMarkLabelPosition.arcOuterStart:
        radius = outerRadius;
        angle = startAngle;
        orthogonalOffsetDirection = 1;
        break;
      case IPolarMarkLabelPosition.arcInnerEnd:
        radius = innerRadius;
        angle = endAngle;
        orthogonalOffsetDirection = -1;
        break;
      case IPolarMarkLabelPosition.arcOuterEnd:
        radius = outerRadius;
        angle = endAngle;
        orthogonalOffsetDirection = 1;
        break;
      case IPolarMarkLabelPosition.arcInnerMiddle:
        radius = innerRadius;
        angle = (startAngle + endAngle) / 2;
        orthogonalOffsetDirection = -1;
        break;
      case IPolarMarkLabelPosition.arcOuterMiddle:
        radius = outerRadius;
        angle = (startAngle + endAngle) / 2;
        orthogonalOffsetDirection = 1;
        break;
      default: // default arcInnerMiddle
        radius = innerRadius;
        angle = (startAngle + endAngle) / 2;
        orthogonalOffsetDirection = -1;
    }

    return {
      position: {
        x:
          center.x +
          (radius + (orthogonalOffsetDirection * labelHeight) / 2 + refY) * Math.cos(angle) +
          refX * Math.cos(angle - Math.PI / 2),
        y:
          center.y +
          (radius + (orthogonalOffsetDirection * labelHeight) / 2 + refY) * Math.sin(angle) +
          refX * Math.sin(angle - Math.PI / 2)
      },
      angle
    };
  }

  protected setLabelPos() {
    if (this._label && this._area) {
      const { label = {} } = this.attribute as PolarMarkAreaAttrs;
      const { position: labelPosition = 'arcInnerMiddle', autoRotate = true } = label;
      const labelAttr = this.getPositionByDirection(labelPosition);

      this._label.setAttributes({
        ...labelAttr.position,
        angle: autoRotate ? labelAttr.angle - Math.PI / 2 + (label.refAngle ?? 0) : 0
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
