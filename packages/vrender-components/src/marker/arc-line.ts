import { merge } from '@visactor/vutils';
import { ArcSegment } from '../segment';
import { loadMarkArcLineComponent } from './register';
import { DEFAULT_STATES } from '../constant';
import { MarkCommonLine } from './common-line';
import type { ComponentOptions } from '../interface';
import type { IArcGraphicAttribute } from '@visactor/vrender-core';
import { IMarkCommonArcLabelPosition } from './type';
// eslint-disable-next-line no-duplicate-imports
import type { MarkArcLineAttrs, MarkerAnimationState } from './type';
import { DEFAULT_MARK_ARC_LINE_THEME, DEFAULT_POLAR_MARKER_TEXT_STYLE_MAP } from './config';
import { markCommonLineAnimate } from './animate/animate';

loadMarkArcLineComponent();

export function registerMarkArcLineAnimate() {
  MarkArcLine._animate = markCommonLineAnimate;
}
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
    // eslint-disable-next-line max-len
    super(
      options?.skipDefault
        ? attributes
        : merge({}, MarkArcLine.defaultAttributes, attributes, { label: { autoRotate: true } })
    );
  }

  protected getPointAttrByPosition(direction: IMarkCommonArcLabelPosition) {
    const { center, radius, startAngle, endAngle, label } = this.attribute as MarkArcLineAttrs;
    const { refX = 0, refY = 0 } = label;
    let angle;

    switch (direction) {
      case IMarkCommonArcLabelPosition.arcInnerStart:
        angle = startAngle;
      case IMarkCommonArcLabelPosition.arcOuterStart:
        angle = startAngle;
        break;
      case IMarkCommonArcLabelPosition.arcInnerEnd:
        angle = endAngle;
      case IMarkCommonArcLabelPosition.arcOuterEnd:
        angle = endAngle;
        break;
      case IMarkCommonArcLabelPosition.center:
      case IMarkCommonArcLabelPosition.arcInnerMiddle:
      case IMarkCommonArcLabelPosition.arcOuterMiddle:
        angle = (startAngle + endAngle) / 2;
        break;
      default: // default arcInnerMiddle
        angle = (startAngle + endAngle) / 2;
    }

    return {
      position: {
        x: center.x + (radius + refY) * Math.cos(angle) + refX * Math.cos(angle - Math.PI / 2),
        y: center.y + (radius + refY) * Math.sin(angle) + refX * Math.sin(angle - Math.PI / 2)
      },
      angle
    };
  }

  protected getTextStyle(position: IMarkCommonArcLabelPosition) {
    return DEFAULT_POLAR_MARKER_TEXT_STYLE_MAP[position];
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
    const { center, radius, startAngle, endAngle, startSymbol, endSymbol, lineStyle, state } = this
      .attribute as MarkArcLineAttrs;
    if (this._line) {
      (this._line as any).setAttributes({
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
  }

  protected isValidPoints() {
    return true;
  }
}
