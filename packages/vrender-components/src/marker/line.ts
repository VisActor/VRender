import type { IGroup, INode } from '@visactor/vrender';
import { merge } from '@visactor/vutils';
import { Segment } from '../segment';
import { Tag } from '../tag';
import { Marker } from './base';
import { DEFAULT_MARK_LINE_THEME, DEFAULT_MARK_LINE_TEXT_STYLE_MAP } from './config';
import type { MarkLineAttrs } from './type';

export class MarkLine extends Marker<MarkLineAttrs> {
  static defaultAttributes: Partial<MarkLineAttrs> = DEFAULT_MARK_LINE_THEME;

  private _line!: Segment;

  constructor(attributes: MarkLineAttrs) {
    super(merge({}, MarkLine.defaultAttributes, attributes));
  }

  protected setLabelPos() {
    const { points, label } = this.attribute as MarkLineAttrs;
    const labelPosition = label?.position ?? 'end';
    const labelAngle = this._line.getEndAngle();
    const labelOffsetX = label?.refX * Math.cos(labelAngle) + label.refY * Math.cos(labelAngle - Math.PI / 2);
    const labelOffsetY = label?.refX * Math.sin(labelAngle) + label.refY * Math.sin(labelAngle - Math.PI / 2);
    if (labelPosition.includes('start') || labelPosition.includes('Start')) {
      this._label.setAttributes({
        x: points[0].x + labelOffsetX,
        y: points[0].y + labelOffsetY
      });
    } else if (labelPosition.includes('middle') || labelPosition.includes('Middle')) {
      this._label.setAttributes({
        x: (points[0].x + points[points.length - 1].x) / 2 + labelOffsetX,
        y: (points[0].y + points[points.length - 1].y) / 2 + labelOffsetY
      });
    } else {
      this._label.setAttributes({
        x: points[points.length - 1].x + labelOffsetX,
        y: points[points.length - 1].y + labelOffsetY
      });
    }
    this._label.setAttributes({
      angle: label.autoRotate && labelAngle + (label?.refAngle ?? 0),
      textStyle: {
        ...DEFAULT_MARK_LINE_TEXT_STYLE_MAP[labelPosition],
        ...label.textStyle
      }
    });
  }

  protected initMarker(container: IGroup) {
    const { points, startSymbol, endSymbol, label, lineStyle } = this.attribute as MarkLineAttrs;
    const line = new Segment({
      points,
      startSymbol,
      endSymbol,
      lineStyle
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
    const { points, startSymbol, endSymbol, label, lineStyle } = this.attribute as MarkLineAttrs;
    this._line.setAttributes({
      points,
      startSymbol,
      endSymbol,
      lineStyle
    });

    this._label.setAttributes({
      ...label
    });

    this.setLabelPos();
  }
}
