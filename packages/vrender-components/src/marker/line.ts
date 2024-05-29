import { isValidNumber, merge } from '@visactor/vutils';
import type { IMarkLineLabelPosition } from './type';
// eslint-disable-next-line no-duplicate-imports
import type { MarkLineAttrs, MarkerAnimationState } from './type';
import type { ComponentOptions } from '../interface';
import { loadMarkLineComponent } from './register';
import type { Point } from '../core/type';
import { MarkCommonLine } from './common-line';
import type { ArcSegment } from '../segment';
// eslint-disable-next-line no-duplicate-imports
import { Segment } from '../segment';
import { DEFAULT_STATES } from '../constant';
import { DEFAULT_CARTESIAN_MARK_LINE_TEXT_STYLE_MAP, DEFAULT_MARK_LINE_THEME, FUZZY_EQUAL_DELTA } from './config';
import type { ILineGraphicAttribute } from '@visactor/vrender-core';
import { markCommonLineAnimate } from './animate/animate';
import { fuzzyEqualNumber, getTextAlignAttrOfVerticalDir, isPostiveXAxis } from '../util';

loadMarkLineComponent();

export function registerMarkLineAnimate() {
  MarkLine._animate = markCommonLineAnimate;
}

export class MarkLine extends MarkCommonLine<ILineGraphicAttribute, IMarkLineLabelPosition> {
  name = 'markLine';
  // eslint-disable-next-line max-len
  static defaultAttributes: Partial<MarkLineAttrs> = DEFAULT_MARK_LINE_THEME as unknown as MarkLineAttrs;
  protected _line!: Segment | ArcSegment;

  /** animate */
  protected markerAnimate(state: MarkerAnimationState) {
    if (MarkLine._animate && this._animationConfig) {
      MarkLine._animate(this._line, this._label, this._animationConfig, state);
    }
  }

  constructor(attributes: MarkLineAttrs, options?: ComponentOptions) {
    super(options?.skipDefault ? attributes : merge({}, MarkLine.defaultAttributes, attributes));
  }

  protected getPointAttrByPosition(position: IMarkLineLabelPosition) {
    const { label = {} } = this.attribute;
    const { refX = 0, refY = 0 } = label;
    const points = this._line.getMainSegmentPoints();
    const lineEndAngle = this._line.getEndAngle() ?? 0;
    const labelAngle = isPostiveXAxis(lineEndAngle) ? lineEndAngle : lineEndAngle;

    const labelOffsetX = refX * Math.cos(labelAngle) + refY * Math.cos(labelAngle - Math.PI / 2);
    const labelOffsetY = refX * Math.sin(labelAngle) + refY * Math.sin(labelAngle - Math.PI / 2);

    if (position.includes('start') || position.includes('Start')) {
      return {
        position: {
          x: points[0].x + labelOffsetX,
          y: points[0].y + labelOffsetY
        },
        angle: labelAngle
      };
    } else if (position.includes('middle') || position.includes('Middle')) {
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

  protected getRotateByAngle(angle: number): number {
    const itemAngle = isPostiveXAxis(angle) ? angle : angle - Math.PI;
    return itemAngle + (this.attribute.label.refAngle ?? 0);
  }

  protected getTextStyle(position: IMarkLineLabelPosition, labelAngle: number, autoRotate: boolean) {
    // 垂直方向例外
    if (
      fuzzyEqualNumber(Math.abs(labelAngle), Math.PI / 2, FUZZY_EQUAL_DELTA) ||
      fuzzyEqualNumber(Math.abs(labelAngle), (Math.PI * 3) / 2, FUZZY_EQUAL_DELTA)
    ) {
      return getTextAlignAttrOfVerticalDir(autoRotate, labelAngle, position);
    }

    if (isPostiveXAxis(labelAngle)) {
      return DEFAULT_CARTESIAN_MARK_LINE_TEXT_STYLE_MAP.postiveXAxis[position];
    }
    return DEFAULT_CARTESIAN_MARK_LINE_TEXT_STYLE_MAP.negativeXAxis[position];
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
    const { points, startSymbol, endSymbol, lineStyle, mainSegmentIndex, multiSegment, state } = this
      .attribute as MarkLineAttrs;
    if (this._line) {
      this._line.setAttributes({
        points,
        startSymbol,
        endSymbol,
        lineStyle,
        mainSegmentIndex,
        multiSegment,
        state: {
          line: merge({}, DEFAULT_STATES, state?.line),
          startSymbol: merge({}, DEFAULT_STATES, state?.lineStartSymbol),
          endSymbol: merge({}, DEFAULT_STATES, state?.lineEndSymbol)
        }
      });
    }
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
}
