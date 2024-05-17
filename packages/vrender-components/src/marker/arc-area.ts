import type { IArc, IGroup, INode } from '@visactor/vrender-core';
// eslint-disable-next-line no-duplicate-imports
import { graphicCreator } from '@visactor/vrender-core';
import { merge } from '@visactor/vutils';
import type { TagAttributes } from '../tag';
// eslint-disable-next-line no-duplicate-imports
import { Tag } from '../tag';
import { Marker } from './base';
import { DEFAULT_MARK_ARC_AREA_THEME, DEFAULT_POLAR_MARKER_TEXT_STYLE_MAP } from './config';
import type { CommonMarkAreaAnimationType, MarkerAnimationState } from './type';
// eslint-disable-next-line no-duplicate-imports
import { IMarkCommonArcLabelPosition, type MarkArcAreaAttrs } from './type';
import { limitShapeInBounds } from '../util/limit-shape';
import type { ComponentOptions } from '../interface';
import { loadMarkArcAreaComponent } from './register';
import { DEFAULT_STATES } from '../constant';
import { DefaultExitMarkerAnimation, DefaultUpdateMarkAreaAnimation, markArcAreaAnimate } from './animate/animate';

loadMarkArcAreaComponent();

export function registerMarkArcAreaAnimate() {
  MarkArcArea._animate = markArcAreaAnimate;
}

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
    // eslint-disable-next-line max-len
    super(
      options?.skipDefault
        ? attributes
        : merge({}, MarkArcArea.defaultAttributes, attributes, { label: { autoRotate: true } })
    );
  }

  protected getPointAttrByPosition(position: IMarkCommonArcLabelPosition) {
    const { center, innerRadius, outerRadius, startAngle, endAngle, label } = this.attribute as MarkArcAreaAttrs;
    const { refX = 0, refY = 0 } = label;

    let radius;
    let angle;

    switch (position) {
      case IMarkCommonArcLabelPosition.center:
        radius = (innerRadius + outerRadius) / 2;
        angle = (startAngle + endAngle) / 2;
        break;
      case IMarkCommonArcLabelPosition.arcInnerStart:
        radius = innerRadius;
        angle = startAngle;
        break;
      case IMarkCommonArcLabelPosition.arcOuterStart:
        radius = outerRadius;
        angle = startAngle;
        break;
      case IMarkCommonArcLabelPosition.arcInnerEnd:
        radius = innerRadius;
        angle = endAngle;
        break;
      case IMarkCommonArcLabelPosition.arcOuterEnd:
        radius = outerRadius;
        angle = endAngle;
        break;
      case IMarkCommonArcLabelPosition.arcInnerMiddle:
        radius = innerRadius;
        angle = (startAngle + endAngle) / 2;
        break;
      case IMarkCommonArcLabelPosition.arcOuterMiddle:
        radius = outerRadius;
        angle = (startAngle + endAngle) / 2;
        break;
      default: // default arcInnerMiddle
        radius = innerRadius;
        angle = (startAngle + endAngle) / 2;
    }

    return {
      position: {
        x: center.x + (radius + refY) * Math.cos(angle) + refX * Math.cos(angle - Math.PI / 2),
        y: center.y + (radius + refY) * Math.sin(angle) + refX * Math.sin(angle - Math.PI / 2)
      },
      angle
    };
  }

  protected setLabelPos() {
    if (this._label && this._area) {
      const { label = {} } = this.attribute as MarkArcAreaAttrs;
      const { position: labelPosition = 'arcInnerMiddle', autoRotate } = label;
      const labelAttr = this.getPointAttrByPosition(labelPosition as IMarkCommonArcLabelPosition);

      this._label.setAttributes({
        ...labelAttr.position,
        angle: autoRotate ? labelAttr.angle - Math.PI / 2 + (label.refAngle ?? 0) : 0,
        textStyle: {
          ...DEFAULT_POLAR_MARKER_TEXT_STYLE_MAP[labelPosition],
          ...label.textStyle
        }
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
    const { center, innerRadius, outerRadius, startAngle, endAngle, areaStyle, label, state } = this
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
      this._area.states = merge({}, DEFAULT_STATES, state?.area);
    }
    if (this._label) {
      this._label.setAttributes({
        dx: 0,
        dy: 0, // 需要进行复位
        ...(label as TagAttributes),
        state: {
          panel: merge({}, DEFAULT_STATES, state?.labelBackground),
          text: merge({}, DEFAULT_STATES, state?.label)
        }
      });
      this.setLabelPos();
    }
  }

  protected isValidPoints() {
    return true;
  }
}
