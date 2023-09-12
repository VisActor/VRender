import type { IGroup, INode } from '@visactor/vrender';
import { flattenArray, isValidNumber, merge } from '@visactor/vutils';
import { Segment } from '../segment';
import { Tag } from '../tag';
import { Marker } from './base';
import { DEFAULT_MARK_LINE_THEME, DEFAULT_MARK_LINE_TEXT_STYLE_MAP } from './config';
import type { MarkLineAttrs } from './type';
import { limitShapeInBounds } from '../util/limit-shape';
import type { Point } from '../core/type';

export class MarkLine extends Marker<MarkLineAttrs> {
  static defaultAttributes: Partial<MarkLineAttrs> = DEFAULT_MARK_LINE_THEME;

  private _line!: Segment;

  constructor(attributes: MarkLineAttrs) {
    super(merge({}, MarkLine.defaultAttributes, attributes));
  }

  protected setLabelPos() {
    const { label = {}, limitRect } = this.attribute as MarkLineAttrs;
    const { position = 'end', refX = 0, refY = 0, confine } = label;
    const points = this._line.getMainSegmentPoints();
    const labelAngle = this._line.getEndAngle() ?? 0;
    const labelOffsetX = refX * Math.cos(labelAngle) + refY * Math.cos(labelAngle - Math.PI / 2);
    const labelOffsetY = refX * Math.sin(labelAngle) + refY * Math.sin(labelAngle - Math.PI / 2);
    let labelPoint: Point;
    if (position.includes('start') || position.includes('Start')) {
      labelPoint = {
        x: points[0].x + labelOffsetX,
        y: points[0].y + labelOffsetY
      };
    } else if (position.includes('middle') || position.includes('Middle')) {
      labelPoint = {
        x: (points[0].x + points[points.length - 1].x) / 2 + labelOffsetX,
        y: (points[0].y + points[points.length - 1].y) / 2 + labelOffsetY
      };
    } else {
      labelPoint = {
        x: points[points.length - 1].x + labelOffsetX,
        y: points[points.length - 1].y + labelOffsetY
      };
    }
    this._label.setAttributes({
      ...labelPoint,
      angle: label.autoRotate ? labelAngle + (label?.refAngle ?? 0) : 0,
      textStyle: {
        ...DEFAULT_MARK_LINE_TEXT_STYLE_MAP[position],
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
    const { points, startSymbol, endSymbol, label, lineStyle, mainSegmentIndex, multiSegment } = this
      .attribute as MarkLineAttrs;
    const line = new Segment({
      points,
      startSymbol,
      endSymbol,
      lineStyle,
      mainSegmentIndex,
      multiSegment
    });
    line.name = 'mark-line-line';
    this._line = line;
    container.add(line as unknown as INode);

    const markLabel = new Tag({
      ...label
    });
    markLabel.name = 'mark-line-label';
    this._label = markLabel;
    container.add(markLabel as unknown as INode);
    this.setLabelPos();
  }

  protected updateMarker() {
    const { points, startSymbol, endSymbol, label, lineStyle, mainSegmentIndex, multiSegment } = this
      .attribute as MarkLineAttrs;
    this._line?.setAttributes({
      points,
      startSymbol,
      endSymbol,
      lineStyle,
      mainSegmentIndex,
      multiSegment
    });

    this._label?.setAttributes({
      dx: 0,
      dy: 0, // 需要进行复位
      ...label
    });

    this.setLabelPos();
  }
}
