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
import { DEFAULT_MARK_ARC_LINE_THEME } from './config';
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
    super(options?.skipDefault ? attributes : merge({}, MarkArcLine.defaultAttributes, attributes));
  }

  protected getPointAttrByPosition(direction: IMarkCommonArcLabelPosition) {
    const { center, radius, startAngle, endAngle, label } = this.attribute as MarkArcLineAttrs;
    const { refX = 0, refY = 0 } = label;
    const labelTextHeight = this._label.getTextShape().attribute.visible
      ? Math.abs((this._label.getTextShape()?.AABBBounds?.y2 ?? 0) - (this._label.getTextShape()?.AABBBounds.y1 ?? 0))
      : 0;
    const labelRectHeight = this._label.getBgRect().attribute.visible
      ? Math.abs((this._label.getBgRect()?.AABBBounds?.y2 ?? 0) - (this._label.getBgRect()?.AABBBounds.y1 ?? 0))
      : 0;
    const labelHeight = Math.max(labelRectHeight, labelTextHeight);

    let angle;
    // tag在正交方向是向内偏移，还是向外偏移
    // 不偏移: 0, 内: -1, 外: 1
    let orthogonalOffsetDirection;

    switch (direction) {
      case IMarkCommonArcLabelPosition.center:
        angle = (startAngle + endAngle) / 2;
        orthogonalOffsetDirection = 0;
        break;
      case IMarkCommonArcLabelPosition.arcInnerStart:
        angle = startAngle;
        orthogonalOffsetDirection = -1;
        break;
      case IMarkCommonArcLabelPosition.arcOuterStart:
        angle = startAngle;
        orthogonalOffsetDirection = 1;
        break;
      case IMarkCommonArcLabelPosition.arcInnerEnd:
        angle = endAngle;
        orthogonalOffsetDirection = -1;
        break;
      case IMarkCommonArcLabelPosition.arcOuterEnd:
        angle = endAngle;
        orthogonalOffsetDirection = 1;
        break;
      case IMarkCommonArcLabelPosition.arcInnerMiddle:
        angle = (startAngle + endAngle) / 2;
        orthogonalOffsetDirection = -1;
        break;
      case IMarkCommonArcLabelPosition.arcOuterMiddle:
        angle = (startAngle + endAngle) / 2;
        orthogonalOffsetDirection = 1;
        break;
      default: // default arcInnerMiddle
        angle = (startAngle + endAngle) / 2;
        orthogonalOffsetDirection = -1;
    }

    return {
      position: {
        x:
          center.x +
          (radius + (orthogonalOffsetDirection * labelHeight) / 2 + refY) * Math.cos(angle) +
          refX * Math.cos(angle - Math.PI / 2),
        y:
          center.y +
          (radius + (orthogonalOffsetDirection * labelHeight) / 2 + refY) * Math.sin(angle) +
          refX * Math.sin(angle - Math.PI / 2)
      },
      angle
    };
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
