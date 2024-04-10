import type { IGroup, INode } from '@visactor/vrender-core';
import { merge } from '@visactor/vutils';
import type { ArcSegment, Segment } from '../segment';
import type { TagAttributes } from '../tag';
// eslint-disable-next-line no-duplicate-imports
import { Tag } from '../tag';
import type { CommonMarkLineAttrs } from './type';
import { limitShapeInBounds } from '../util/limit-shape';
import { DEFAULT_STATES } from '../constant';
import { Marker } from './base';

export abstract class BaseMarkLine<T> extends Marker<CommonMarkLineAttrs<T>> {
  name = 'baseMarkLine';

  protected _line!: Segment | ArcSegment;

  protected abstract createSegment(): any;
  protected abstract setLineAttributes(): any;
  protected abstract getPositionByDirection(direction: any): any;

  getLine() {
    return this._line;
  }
  getLabel() {
    return this._label;
  }

  protected setLabelPos() {
    const { label = {}, limitRect } = this.attribute;
    const { position = 'end', refX = 0, refY = 0, confine } = label;
    const labelPoint = this.getPositionByDirection(position);
    this._label.setAttributes({
      ...labelPoint
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
    const { label, state } = this.attribute as CommonMarkLineAttrs<T>;
    const line = this.createSegment();
    line.name = 'cartesian-mark-line-line';
    this._line = line;
    container.add(line as unknown as INode);

    const markLabel = new Tag({
      ...(label as TagAttributes),
      state: {
        panel: merge({}, DEFAULT_STATES, state?.labelBackground),
        text: merge({}, DEFAULT_STATES, state?.label)
      }
    });
    markLabel.name = 'cartesian-mark-line-label';
    this._label = markLabel;
    container.add(markLabel as unknown as INode);
    this.setLabelPos();
  }

  protected updateMarker() {
    const { label } = this.attribute as CommonMarkLineAttrs<T>;

    this.setLineAttributes();

    if (this._label) {
      this._label.setAttributes({
        dx: 0,
        dy: 0, // 需要进行复位
        ...(label as TagAttributes)
      });
    }

    this.setLabelPos();
  }
}
