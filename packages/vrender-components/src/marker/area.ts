import type { IGroup, INode, IPolygon } from '@visactor/vrender-core';
// eslint-disable-next-line no-duplicate-imports
import { graphicCreator } from '@visactor/vrender-core';
import { isValidNumber, merge } from '@visactor/vutils';
import type { TagAttributes } from '../tag';
// eslint-disable-next-line no-duplicate-imports
import { Tag } from '../tag';
import { Marker } from './base';
import { DEFAULT_MARK_AREA_THEME } from './config';
import type { CommonMarkAreaAnimationType, MarkAreaAttrs, MarkerAnimationState } from './type';
import { IMarkAreaLabelPosition } from './type';
import { limitShapeInBounds } from '../util/limit-shape';
import type { ComponentOptions } from '../interface';
import { loadMarkAreaComponent } from './register';
import type { Point } from '../core/type';
import { DEFAULT_STATES } from '../constant';
import { DefaultExitMarkerAnimation, DefaultUpdateMarkAreaAnimation } from './animate/animate';
import { calculateAnchorOfBounds } from '@visactor/vutils';

loadMarkAreaComponent();

export class MarkArea extends Marker<MarkAreaAttrs, CommonMarkAreaAnimationType> {
  name = 'markArea';
  static defaultAttributes = DEFAULT_MARK_AREA_THEME;

  /** animate */
  defaultUpdateAnimation = DefaultUpdateMarkAreaAnimation;
  defaultExitAnimation = DefaultExitMarkerAnimation;
  protected markerAnimate(state: MarkerAnimationState) {
    if (MarkArea._animate && this._animationConfig) {
      MarkArea._animate(this._area, this._label, this._animationConfig, state);
    }
  }

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

  private _transformPosToAnchorType = (position: IMarkAreaLabelPosition) => {
    switch (position) {
      case IMarkAreaLabelPosition.left:
      case IMarkAreaLabelPosition.insideLeft:
        return 'left';
      case IMarkAreaLabelPosition.right:
      case IMarkAreaLabelPosition.insideRight:
        return 'right';
      case IMarkAreaLabelPosition.top:
      case IMarkAreaLabelPosition.insideTop:
        return 'top';
      case IMarkAreaLabelPosition.bottom:
      case IMarkAreaLabelPosition.insideBottom:
        return 'bottom';
      default:
        return 'center';
    }
  };

  private _calculateLabelOffset = (position: IMarkAreaLabelPosition) => {
    let dx = 0;
    let dy = 0;
    switch (position) {
      case IMarkAreaLabelPosition.left:
      case IMarkAreaLabelPosition.insideRight:
        dx = -0.5;
        break;
      case IMarkAreaLabelPosition.right:
      case IMarkAreaLabelPosition.insideLeft:
        dx = 0.5;
        break;
      case IMarkAreaLabelPosition.top:
      case IMarkAreaLabelPosition.insideBottom:
        dy = -0.5;
        break;
      case IMarkAreaLabelPosition.bottom:
      case IMarkAreaLabelPosition.insideTop:
        dy = 0.5;
    }
    return { dx, dy };
  };

  protected getPointAttrByPosition(position: IMarkAreaLabelPosition) {
    const labelHeight = this._label.getTagHeight();
    const labelWidth = this._label.getTagWidth();

    const { x, y } = calculateAnchorOfBounds(this._area.AABBBounds, this._transformPosToAnchorType(position));
    const { dx: labelDx, dy: labelDy } = this._calculateLabelOffset(position);

    return {
      x: x + labelDx * labelWidth,
      y: y + labelDy * labelHeight
    };
  }

  protected setLabelPos() {
    if (this._label && this._area) {
      const { label = {} } = this.attribute as MarkAreaAttrs;
      const labelPosition = label.position ?? 'middle';
      const labelPoint = this.getPointAttrByPosition(labelPosition as IMarkAreaLabelPosition);
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
    const { points, label, areaStyle, state } = this.attribute as MarkAreaAttrs;
    const area = graphicCreator.polygon({
      points: points,
      ...areaStyle
    });
    area.states = merge({}, DEFAULT_STATES, state?.area);
    area.name = 'mark-area-polygon';
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
    const { points, label, areaStyle } = this.attribute as MarkAreaAttrs;
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
    const { points } = this.attribute as MarkAreaAttrs;
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
