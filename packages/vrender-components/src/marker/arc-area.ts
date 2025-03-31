import type { IArc, IGroup } from '@visactor/vrender-core';
// eslint-disable-next-line no-duplicate-imports
import { graphicCreator } from '@visactor/vrender-core';
import { merge, mixin } from '@visactor/vutils';
import type { TagAttributes } from '../tag';
// eslint-disable-next-line no-duplicate-imports
import type { Tag } from '../tag';
import { Marker } from './base';
import { DEFAULT_MARK_ARC_AREA_THEME, DEFAULT_POLAR_MARKER_TEXT_STYLE_MAP } from './config';
import type { CommonMarkAreaAnimationType, MarkerAnimationState, MarkerArcAreaLabelAttrs } from './type';
// eslint-disable-next-line no-duplicate-imports
import { IMarkCommonArcLabelPosition, type MarkArcAreaAttrs } from './type';
import { limitShapeInBounds } from '../util/limit-shape';
import type { ComponentOptions } from '../interface';
import { loadMarkArcAreaComponent } from './register';
import { DEFAULT_STATES } from '../constant';
import { DefaultExitMarkerAnimation, DefaultUpdateMarkAreaAnimation, markArcAreaAnimate } from './animate/animate';
import { MarkLabelMixin } from './mixin/label';

loadMarkArcAreaComponent();

export function registerMarkArcAreaAnimate() {
  MarkArcArea._animate = markArcAreaAnimate;
}

export interface MarkArcArea
  extends Pick<MarkLabelMixin<MarkArcAreaAttrs>, '_addMarkLabels' | '_updateMarkLabels' | 'getLabel' | '_label'>,
    Marker<MarkArcAreaAttrs, CommonMarkAreaAnimationType> {}

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

  constructor(attributes: MarkArcAreaAttrs, options?: ComponentOptions) {
    // eslint-disable-next-line max-len
    super(options?.skipDefault ? attributes : merge({}, MarkArcArea.defaultAttributes, attributes));
  }

  protected getPointAttrByPosition(position: IMarkCommonArcLabelPosition, labelAttrs: MarkerArcAreaLabelAttrs) {
    const { center, innerRadius, outerRadius, startAngle, endAngle } = this.attribute as MarkArcAreaAttrs;
    const { refX = 0, refY = 0 } = labelAttrs;

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

  protected setLabelPos(labelNode: Tag, labelAttrs: MarkerArcAreaLabelAttrs) {
    if (this._area) {
      const { position: labelPosition = 'arcInnerMiddle', autoRotate } = labelAttrs;
      const labelAttr = this.getPointAttrByPosition(labelPosition as IMarkCommonArcLabelPosition, labelAttrs);

      labelNode.setAttributes({
        ...labelAttr.position,
        angle: autoRotate ? labelAttr.angle - Math.PI / 2 + (labelAttrs.refAngle ?? 0) : 0,
        textStyle: {
          ...DEFAULT_POLAR_MARKER_TEXT_STYLE_MAP[labelPosition],
          ...labelAttrs.textStyle
        }
      });

      if (this.attribute.limitRect && labelAttrs.confine) {
        const { x, y, width, height } = this.attribute.limitRect;
        limitShapeInBounds(labelNode, {
          x1: x,
          y1: y,
          x2: x + width,
          y2: y + height
        });
      }
    }
  }

  protected initMarker(container: IGroup) {
    const { center, innerRadius, outerRadius, startAngle, endAngle, areaStyle, state } = this
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

    // add label
    this._addMarkLabels(container, 'mark-area-label', MarkArcArea.defaultAttributes.label as TagAttributes);
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

    // update label
    this._updateMarkLabels(MarkArcArea.defaultAttributes.label as TagAttributes);
  }

  protected isValidPoints() {
    return true;
  }
}

mixin(MarkArcArea, MarkLabelMixin);
