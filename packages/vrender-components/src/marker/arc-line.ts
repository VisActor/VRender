import { merge } from '@visactor/vutils';
import { ArcSegment } from '../segment';
import { loadMarkArcLineComponent } from './register';
import { DEFAULT_STATES } from '../constant';
import { MarkCommonLine } from './common-line';
import type { ComponentOptions } from '../interface';
import type { IArcGraphicAttribute } from '@visactor/vrender-core';
import type { IMarkCommonArcLabelPosition } from './type';
// eslint-disable-next-line no-duplicate-imports
import type { MarkArcLineAttrs, MarkerAnimationState } from './type';
import { DEFAULT_MARK_ARC_LINE_THEME } from './config';
import { getPointAttrByArcPosition } from './util';

loadMarkArcLineComponent();

export class MarkArcLine extends MarkCommonLine<IArcGraphicAttribute, IMarkCommonArcLabelPosition> {
  name = 'markArcLine';
  // eslint-disable-next-line max-len
  static defaultAttributes: Partial<MarkArcLineAttrs> = DEFAULT_MARK_ARC_LINE_THEME as unknown as MarkArcLineAttrs;
  protected _line!: ArcSegment;

  protected markerAnimate(state: MarkerAnimationState) {
    if (MarkArcLine._animate && this._animationConfig) {
      MarkArcLine._animate(this._line, this._label, this._animationConfig, state);
    }
  }

  constructor(attributes: MarkArcLineAttrs, options?: ComponentOptions) {
    super(options?.skipDefault ? attributes : merge({}, MarkArcLine.defaultAttributes, attributes));
  }

  protected getPointAttrByPosition(position: IMarkCommonArcLabelPosition) {
    const { center, radius: arcRadius, startAngle, endAngle, label } = this.attribute as MarkArcLineAttrs;
    const { refX = 0, refY = 0 } = label;
    const labelHeight = this._label.getTagHeight();

    return getPointAttrByArcPosition(position, labelHeight, {
      center,
      innerRadius: arcRadius,
      outerRadius: arcRadius,
      startAngle,
      endAngle,
      refX,
      refY
    });
  }

  protected getRotateByAngle(angle: number): number {
    return angle - Math.PI / 2 + (this.attribute.label.refAngle ?? 0);
  }

  protected createSegment() {
    const { center, radius, startAngle, endAngle, startSymbol, endSymbol, lineStyle, state } = this
      .attribute as MarkArcLineAttrs;
    return new ArcSegment({
      center,
      radius,
      startAngle,
      endAngle,
      startSymbol,
      endSymbol,
      lineStyle,
      state: {
        line: merge({}, DEFAULT_STATES, state?.line),
        startSymbol: merge({}, DEFAULT_STATES, state?.lineStartSymbol),
        endSymbol: merge({}, DEFAULT_STATES, state?.lineEndSymbol)
      }
    });
  }

  protected setLineAttributes() {
    const { center, radius, startAngle, endAngle, startSymbol, endSymbol, lineStyle } = this
      .attribute as MarkArcLineAttrs;
    if (this._line) {
      (this._line as any).setAttributes({
        center,
        radius,
        startAngle,
        endAngle,
        startSymbol,
        endSymbol,
        lineStyle
      });
    }
  }

  protected isValidPoints() {
    return true;
  }
}
