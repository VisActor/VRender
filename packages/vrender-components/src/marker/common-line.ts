import type { IGroup, INode } from '@visactor/vrender-core';
import { mixin } from '@visactor/vutils';
import type { ArcSegment, Segment } from '../segment';
// eslint-disable-next-line no-duplicate-imports
import type { Tag } from '../tag';
import type {
  MarkCommonLineAnimationType,
  MarkCommonLineAttrs,
  MarkerAnimationState,
  MarkerLineLabelAttrs
} from './type';
import { limitShapeInBounds } from '../util/limit-shape';
import { Marker } from './base';
import { DefaultExitMarkerAnimation, DefaultUpdateMarkLineAnimation } from './animate/animate';
import { MarkLabelMixin } from './mixin/label';

export interface MarkCommonLine<LineAttr, LabelPosition>
  extends Pick<
      MarkLabelMixin<MarkCommonLineAttrs<LineAttr, LabelPosition, MarkCommonLineAnimationType>>,
      '_addMarkLabels' | '_updateMarkLabels' | 'getLabel' | '_label'
    >,
    Marker<MarkCommonLineAttrs<LineAttr, LabelPosition, MarkCommonLineAnimationType>, MarkCommonLineAnimationType> {}

export abstract class MarkCommonLine<LineAttr, LabelPosition> extends Marker<
  MarkCommonLineAttrs<LineAttr, LabelPosition, MarkCommonLineAnimationType>,
  MarkCommonLineAnimationType
> {
  name = 'markCommonLine';

  /** animate */
  static _animate?: (
    line: Segment | ArcSegment,
    label: Tag | Tag[],
    animationConfig: any,
    state: MarkerAnimationState
  ) => void;
  defaultUpdateAnimation = DefaultUpdateMarkLineAnimation;
  defaultExitAnimation = DefaultExitMarkerAnimation;

  protected _line!: Segment | ArcSegment;
  protected abstract createSegment(): any;
  protected abstract setLineAttributes(): any;
  protected abstract getPointAttrByPosition(position: any, labelAttrs: MarkerLineLabelAttrs<LabelPosition>): any;
  protected abstract getRotateByAngle(angle: number, labelAttrs: MarkerLineLabelAttrs<LabelPosition>): number;
  protected abstract getTextStyle(position: any, labelAngle: number, autoRotate: boolean): any;
  protected abstract markerAnimate(state: MarkerAnimationState): void;
  protected abstract addMarkLineLabels(container: IGroup): any;
  protected abstract updateMarkLineLabels(): any;

  getLine() {
    return this._line;
  }

  protected setLabelPos(labelNode: IGroup, labelAttrs: MarkerLineLabelAttrs<LabelPosition>): void {
    const { limitRect } = this.attribute;
    const { position, confine, autoRotate } = labelAttrs;
    const labelPoint = this.getPointAttrByPosition(position, labelAttrs);
    const labelAngle = position.toString().toLocaleLowerCase().includes('start')
      ? this._line.getStartAngle() || 0
      : this._line.getEndAngle() || 0;
    labelNode.setAttributes({
      ...labelPoint.position,
      angle: autoRotate ? this.getRotateByAngle(labelPoint.angle, labelAttrs) : 0,
      textStyle: {
        ...this.getTextStyle(position, labelAngle, autoRotate),
        ...labelAttrs.textStyle
      }
    });
    if (limitRect && confine) {
      const { x, y, width, height } = limitRect;
      limitShapeInBounds(labelNode, {
        x1: x,
        y1: y,
        x2: x + width,
        y2: y + height
      });
    }
  }

  protected initMarker(container: IGroup) {
    const line = this.createSegment();
    line.name = 'mark-common-line-line';
    this._line = line;
    container.add(line as unknown as INode);
    this.addMarkLineLabels(container);
  }

  protected updateMarker() {
    this.setLineAttributes();

    // update label
    this.updateMarkLineLabels();
    // this._updateMarkLabels();
  }
}

mixin(MarkCommonLine, MarkLabelMixin);
