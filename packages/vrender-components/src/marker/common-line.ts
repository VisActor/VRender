import type { IGroup, INode } from '@visactor/vrender-core';
import { merge } from '@visactor/vutils';
import type { ArcSegment, Segment } from '../segment';
import type { TagAttributes } from '../tag';
// eslint-disable-next-line no-duplicate-imports
import { Tag } from '../tag';
import type { MarkCommonLineAnimationType, MarkCommonLineAttrs, MarkerAnimationState } from './type';
import { limitShapeInBounds } from '../util/limit-shape';
import { DEFAULT_STATES } from '../constant';
import { Marker } from './base';
import { DefaultExitMarkerAnimation, DefaultUpdateMarkLineAnimation } from './animate/animate';

export abstract class MarkCommonLine<LineAttr, LabelPosition> extends Marker<
  MarkCommonLineAttrs<LineAttr, LabelPosition, MarkCommonLineAnimationType>,
  MarkCommonLineAnimationType
> {
  name = 'markCommonLine';

  /** animate */
  static _animate?: (line: Segment | ArcSegment, label: Tag, animationConfig: any, state: MarkerAnimationState) => void;
  defaultUpdateAnimation = DefaultUpdateMarkLineAnimation;
  defaultExitAnimation = DefaultExitMarkerAnimation;

  protected _line!: Segment | ArcSegment;
  protected abstract createSegment(): any;
  protected abstract setLineAttributes(): any;
  protected abstract getPointAttrByPosition(position: any): any;
  protected abstract getRotateByAngle(angle: number): number;
  protected abstract getTextStyle(position: any, labelAngle: number, autoRotate: boolean): any;
  protected abstract markerAnimate(state: MarkerAnimationState): void;

  getLine() {
    return this._line;
  }
  getLabel() {
    return this._label;
  }

  protected setLabelPos(): void {
    const { label = {}, limitRect } = this.attribute;
    const { position, confine, autoRotate } = label;
    const labelPoint = this.getPointAttrByPosition(position);
    const labelAngle = position.toString().toLocaleLowerCase().includes('start')
      ? this._line.getStartAngle() || 0
      : this._line.getEndAngle() || 0;
    this._label.setAttributes({
      ...labelPoint.position,
      angle: autoRotate ? this.getRotateByAngle(labelPoint.angle) : 0,
      textStyle: {
        ...this.getTextStyle(position, labelAngle, autoRotate),
        ...label.textStyle
      }
    });
    if (limitRect && confine) {
      const { x, y, width, height } = limitRect;
      limitShapeInBounds(this._label, {
        x1: x,
        y1: y,
        x2: x + width,
        y2: y + height
      });
    }
  }

  protected initMarker(container: IGroup) {
    const { label, state } = this.attribute as MarkCommonLineAttrs<
      LineAttr,
      LabelPosition,
      MarkCommonLineAnimationType
    >;
    const line = this.createSegment();
    line.name = 'mark-common-line-line';
    this._line = line;
    container.add(line as unknown as INode);

    const markLabel = new Tag({
      ...(label as TagAttributes),
      state: {
        panel: merge({}, DEFAULT_STATES, state?.labelBackground),
        text: merge({}, DEFAULT_STATES, state?.label)
      }
    });
    markLabel.name = 'mark-common-line-label';
    this._label = markLabel;
    container.add(markLabel as unknown as INode);
    this.setLabelPos();
  }

  protected updateMarker() {
    const { label, state } = this.attribute as MarkCommonLineAttrs<
      LineAttr,
      LabelPosition,
      MarkCommonLineAnimationType
    >;

    this.setLineAttributes();

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
}
