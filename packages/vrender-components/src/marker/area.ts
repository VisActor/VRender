import type { IGroup, INode, IPolygon } from '@visactor/vrender-core';
// eslint-disable-next-line no-duplicate-imports
import { graphicCreator } from '@visactor/vrender-core';
import { isValidNumber, merge } from '@visactor/vutils';
import type { TagAttributes } from '../tag';
// eslint-disable-next-line no-duplicate-imports
import { Tag } from '../tag';
import { Marker } from './base';
import { DEFAULT_CARTESIAN_MARK_AREA_TEXT_STYLE_MAP, DEFAULT_MARK_AREA_THEME } from './config';
import type { CommonMarkAreaAnimationType, IMarkAreaLabelPosition, MarkAreaAttrs, MarkerAnimationState } from './type';
import { limitShapeInBounds } from '../util/limit-shape';
import type { ComponentOptions } from '../interface';
import { loadMarkAreaComponent } from './register';
import type { Point } from '../core/type';
import { DEFAULT_STATES } from '../constant';
import { DefaultExitMarkerAnimation, DefaultUpdateMarkAreaAnimation, markAreaAnimate } from './animate/animate';

loadMarkAreaComponent();

export function registerMarkAreaAnimate() {
  MarkArea._animate = markAreaAnimate;
}

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

  protected getPointAttrByPosition(position: IMarkAreaLabelPosition) {
    const { x1, x2, y1, y2 } = this._area.AABBBounds;
    const result = {
      x: (x1 + x2) / 2,
      y: (y1 + y2) / 2
    };

    if (position.includes('left') || position.includes('Left')) {
      result.x = x1;
    }
    if (position.includes('right') || position.includes('Right')) {
      result.x = x2;
    }
    if (position.includes('top') || position.includes('Top')) {
      result.y = y1;
    }
    if (position.includes('bottom') || position.includes('Bottom')) {
      result.y = y2;
    }

    return result;
  }

  protected setLabelPos() {
    if (this._label && this._area) {
      const { label = {} } = this.attribute as MarkAreaAttrs;
      const labelPosition = label.position ?? 'middle';
      const labelPoint = this.getPointAttrByPosition(labelPosition as IMarkAreaLabelPosition);
      this._label.setAttributes({
        ...labelPoint,
        textStyle: {
          ...DEFAULT_CARTESIAN_MARK_AREA_TEXT_STYLE_MAP[labelPosition],
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
    const { points, label, areaStyle, state } = this.attribute as MarkAreaAttrs;
    if (this._area) {
      this._area.setAttributes({
        points: points,
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
