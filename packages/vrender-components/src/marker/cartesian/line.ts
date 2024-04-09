import { isValidNumber, merge } from '@visactor/vutils';
import { DEFAULT_COMMON_MARK_LINE_THEME } from '../config';
import type { CartesianMarkLineAttrs } from '../type';
import type { ComponentOptions } from '../../interface';
import { loadCartesianMarkLineComponent } from '../register';
import type { Point } from '../../core/type';
import { BaseMarkLine } from '../base-line';
import type { ArcSegment } from '../../segment';
// eslint-disable-next-line no-duplicate-imports
import { Segment } from '../../segment';
import { DEFAULT_STATES } from '../../constant';

loadCartesianMarkLineComponent();
export class CartesianMarkLine extends BaseMarkLine {
  name = 'cartesianMarkLine';
  static defaultAttributes: Partial<CartesianMarkLineAttrs> = DEFAULT_COMMON_MARK_LINE_THEME;
  protected _line!: Segment | ArcSegment;

  constructor(attributes: CartesianMarkLineAttrs, options?: ComponentOptions) {
    super(options?.skipDefault ? attributes : merge({}, CartesianMarkLine.defaultAttributes, attributes));
  }

  protected isValidPoints() {
    const { points } = this.attribute as CartesianMarkLineAttrs;
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

  protected createSegment() {
    const { points, startSymbol, endSymbol, lineStyle, mainSegmentIndex, multiSegment, state } = this
      .attribute as CartesianMarkLineAttrs;
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
      .attribute as CartesianMarkLineAttrs;
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
