import type { IArc, IGroup, INode } from '@visactor/vrender-core';
// eslint-disable-next-line no-duplicate-imports
import { graphicCreator } from '@visactor/vrender-core';
import { merge } from '@visactor/vutils';
import type { TagAttributes } from '../tag';
// eslint-disable-next-line no-duplicate-imports
import { Tag } from '../tag';
import { Marker } from './base';
import { DEFAULT_MARK_ARC_AREA_THEME } from './config';
import type { CommonMarkAreaAnimationType, MarkerAnimationState } from './type';
import type { IMarkCommonArcLabelPosition } from './type';
// eslint-disable-next-line no-duplicate-imports
import { type MarkArcAreaAttrs } from './type';
import { limitShapeInBounds } from '../util/limit-shape';
import type { ComponentOptions } from '../interface';
import { loadMarkArcAreaComponent } from './register/component';
import { DEFAULT_STATES } from '../constant';
import { DefaultExitMarkerAnimation, DefaultUpdateMarkAreaAnimation } from './animate/animate';
import { getPointAttrByArcPosition } from './util';

loadMarkArcAreaComponent();

export class MarkArcArea extends Marker<MarkArcAreaAttrs, CommonMarkAreaAnimationType> {
  name = 'markArcArea';
  static defaultAttributes = DEFAULT_MARK_ARC_AREA_THEME;
  private _area!: IArc;

  /** animate */
  defaultUpdateAnimation = DefaultUpdateMarkAreaAnimation;
  defaultExitAnimation = DefaultExitMarkerAnimation;
  protected markerAnimate(state: MarkerAnimationState) {
    if (MarkArcArea._animate && this._animationConfig) {
      MarkArcArea._animate(this._area, this._label, this._animationConfig, state);
    }
  }

  getArea() {
    return this._area;
  }

  getLabel() {
    return this._label;
  }

  constructor(attributes: MarkArcAreaAttrs, options?: ComponentOptions) {
    super(options?.skipDefault ? attributes : merge({}, MarkArcArea.defaultAttributes, attributes));
  }

  protected getPointAttrByPosition(position: IMarkCommonArcLabelPosition) {
    const { center, innerRadius, outerRadius, startAngle, endAngle, label } = this.attribute as MarkArcAreaAttrs;
    const { refX = 0, refY = 0 } = label;
    const labelHeight = this._label.getTagHeight();

    return getPointAttrByArcPosition(position, labelHeight, {
      center,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      refX,
      refY
    });
  }

  protected setLabelPos() {
    if (this._label && this._area) {
      const { label = {} } = this.attribute as MarkArcAreaAttrs;
      const { position: labelPosition = 'arcInnerMiddle', autoRotate = true } = label;
      const labelAttr = this.getPointAttrByPosition(labelPosition as IMarkCommonArcLabelPosition);

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
      .attribute as MarkArcAreaAttrs;
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
      .attribute as MarkArcAreaAttrs;
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
