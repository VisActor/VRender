import { merge } from '@visactor/vutils';
import { ArcSegment } from '../../segment';
import { DEFAULT_COMMON_MARK_LINE_THEME } from '../config';
import type { PolarMarkArcLineAttrs } from '../type';
import { loadPolarMarkArcLineComponent } from '../register';
import { DEFAULT_STATES } from '../../constant';
import { BaseMarkLine } from '../base-line';

loadPolarMarkArcLineComponent();
export class PolarMarkArcLine extends BaseMarkLine {
  name = 'polarMarkArcLine';
  static defaultAttributes: Partial<PolarMarkArcLineAttrs> = DEFAULT_COMMON_MARK_LINE_THEME;
  protected _line!: ArcSegment;

  protected isValidPoints() {
    return true;
  }

  protected createSegment() {
    const { center, radius, startAngle, endAngle, startSymbol, endSymbol, lineStyle, state } = this
      .attribute as PolarMarkArcLineAttrs;
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
      .attribute as PolarMarkArcLineAttrs;
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
}
