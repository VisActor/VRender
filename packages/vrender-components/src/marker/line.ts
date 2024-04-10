import { isValidNumber, merge } from '@visactor/vutils';
import { IMarkLineLabelPosition } from './type';
import type { MarkLineAttrs } from './type';
import type { ComponentOptions } from '../interface';
import { loadMarkLineComponent } from './register';
import type { Point } from '../core/type';
import { BaseMarkLine } from './base-line';
import type { ArcSegment } from '../segment';
// eslint-disable-next-line no-duplicate-imports
import { Segment } from '../segment';
import { DEFAULT_STATES } from '../constant';
import { DEFAULT_MARK_LINE_THEME } from './config';
import type { ILineGraphicAttribute } from '@visactor/vrender-core';

loadMarkLineComponent();
export class MarkLine extends BaseMarkLine<ILineGraphicAttribute, IMarkLineLabelPosition> {
  name = 'MarkLine';
  // eslint-disable-next-line max-len
  static defaultAttributes: Partial<MarkLineAttrs> = DEFAULT_MARK_LINE_THEME as unknown as MarkLineAttrs;
  protected _line!: Segment | ArcSegment;

  constructor(attributes: MarkLineAttrs, options?: ComponentOptions) {
    super(options?.skipDefault ? attributes : merge({}, MarkLine.defaultAttributes, attributes));
  }

  protected isValidPoints() {
    const { points } = this.attribute as MarkLineAttrs;
    if (!points || points.length < 2) {
      return false;
    }
    let validFlag = true;
    points.forEach((point: Point | Point[]) => {
      if ((point as any).length) {
        (point as Point[]).forEach((p: Point) => {
          if (!isValidNumber((p as Point).x) || !isValidNumber((p as Point).y)) {
            validFlag = false;
            return;
          }
        });
      } else if (!isValidNumber((point as Point).x) || !isValidNumber((point as Point).y)) {
        validFlag = false;
        return;
      }
    });
    return validFlag;
  }

  protected getLabelOffsetByDirection(direction: IMarkLineLabelPosition) {
    // labelHeight
    // eslint-disable-next-line max-len
    const labelRectHeight = Math.abs(
      (this._label.getTextShape().AABBBounds?.y2 ?? 0) - (this._label.getTextShape()?.AABBBounds.y1 ?? 0)
    );
    // eslint-disable-next-line max-len
    const labelTextHeight = Math.abs(
      (this._label.getBgRect().AABBBounds?.y2 ?? 0) - (this._label.getBgRect()?.AABBBounds.y1 ?? 0)
    );
    const labelHeight = Math.max(labelRectHeight, labelTextHeight);

    // labelWidth
    // eslint-disable-next-line max-len
    const labelRectWidth = Math.abs(
      (this._label.getTextShape().AABBBounds?.x2 ?? 0) - (this._label.getTextShape()?.AABBBounds.x1 ?? 0)
    );
    // eslint-disable-next-line max-len
    const labelTextWidth = Math.abs(
      (this._label.getBgRect().AABBBounds?.x2 ?? 0) - (this._label.getBgRect()?.AABBBounds.x1 ?? 0)
    );
    const labelWidth = Math.max(labelRectWidth, labelTextWidth);

    switch (direction) {
      case IMarkLineLabelPosition.start:
        return {
          offsetX: -labelWidth / 2,
          offsetY: 0
        };
      case IMarkLineLabelPosition.insideStartTop:
        return {
          offsetX: labelWidth / 2,
          offsetY: labelHeight / 2
        };
      case IMarkLineLabelPosition.insideStartBottom:
        return {
          offsetX: labelWidth / 2,
          offsetY: -labelHeight / 2
        };
      case IMarkLineLabelPosition.middle:
        return {
          offsetX: 0,
          offsetY: 0
        };
      case IMarkLineLabelPosition.insideMiddleTop:
        return {
          offsetX: 0,
          offsetY: labelHeight / 2
        };
      case IMarkLineLabelPosition.insideMiddleBottom:
        return {
          offsetX: 0,
          offsetY: -labelHeight / 2
        };
      case IMarkLineLabelPosition.end:
        return {
          offsetX: labelWidth / 2,
          offsetY: 0
        };
      case IMarkLineLabelPosition.insideEndTop:
        return {
          offsetX: -labelWidth / 2,
          offsetY: labelHeight / 2
        };
      case IMarkLineLabelPosition.insideEndBottom:
        return {
          offsetX: -labelWidth / 2,
          offsetY: -labelHeight / 2
        };
      default: // default end
        return {
          offsetX: labelWidth / 2,
          offsetY: 0
        };
    }
  }

  protected getPositionByDirection(direction: IMarkLineLabelPosition) {
    const { label = {} } = this.attribute;
    const { refX = 0, refY = 0 } = label;
    const points = this._line.getMainSegmentPoints();
    const labelAngle = this._line.getEndAngle() ?? 0;

    const totalRefX = refX + this.getLabelOffsetByDirection(direction).offsetX;
    const totalRefY = refY + this.getLabelOffsetByDirection(direction).offsetY;

    const labelOffsetX = totalRefX * Math.cos(labelAngle) + totalRefY * Math.cos(labelAngle - Math.PI / 2);
    const labelOffsetY = totalRefX * Math.sin(labelAngle) + totalRefY * Math.sin(labelAngle - Math.PI / 2);

    if (direction.includes('start') || direction.includes('Start')) {
      return {
        position: {
          x: points[0].x + labelOffsetX,
          y: points[0].y + labelOffsetY
        },
        angle: labelAngle
      };
    } else if (direction.includes('middle') || direction.includes('Middle')) {
      return {
        position: {
          x: (points[0].x + points[points.length - 1].x) / 2 + labelOffsetX,
          y: (points[0].y + points[points.length - 1].y) / 2 + labelOffsetY
        },
        angle: labelAngle
      };
    }
    return {
      position: {
        x: points[points.length - 1].x + labelOffsetX,
        y: points[points.length - 1].y + labelOffsetY
      },
      angle: labelAngle
    };
  }

  protected setLabelPos(): void {
    super.setLabelPos();
    const { label = {} } = this.attribute as MarkLineAttrs;
    const { position = 'end', autoRotate = true } = label;
    const labelAttr = this.getPositionByDirection(position as any);
    this._label.setAttributes({
      ...labelAttr.position,
      angle: autoRotate ? labelAttr.angle + (label.refAngle ?? 0) : 0
    });
  }

  protected createSegment() {
    const { points, startSymbol, endSymbol, lineStyle, mainSegmentIndex, multiSegment, state } = this
      .attribute as MarkLineAttrs;
    return new Segment({
      points,
      startSymbol,
      endSymbol,
      lineStyle,
      mainSegmentIndex,
      multiSegment,
      pickable: false, // 组件容器本身不参与拾取
      state: {
        line: merge({}, DEFAULT_STATES, state?.line),
        startSymbol: merge({}, DEFAULT_STATES, state?.lineStartSymbol),
        endSymbol: merge({}, DEFAULT_STATES, state?.lineEndSymbol)
      }
    });
  }

  protected setLineAttributes() {
    const { points, startSymbol, endSymbol, lineStyle, mainSegmentIndex, multiSegment } = this
      .attribute as MarkLineAttrs;
    if (this._line) {
      this._line.setAttributes({
        points,
        startSymbol,
        endSymbol,
        lineStyle,
        mainSegmentIndex,
        multiSegment
      });
    }
  }
}
