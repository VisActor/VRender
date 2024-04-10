import { merge } from '@visactor/vutils';
import { ArcSegment } from '../../segment';
import { loadPolarMarkArcLineComponent } from '../register';
import { DEFAULT_STATES } from '../../constant';
import { BaseMarkLine } from '../base-line';
import { IPolarMarkLabelPosition } from '../type';
// eslint-disable-next-line no-duplicate-imports
import type { PolarMarkArcLineAttrs } from '../type';
import { DEFAULT_POLAR_MARK_LINE_THEME } from '../config';
import type { ComponentOptions } from '../../interface';

loadPolarMarkArcLineComponent();
export class PolarMarkArcLine extends BaseMarkLine<IPolarMarkLabelPosition> {
  name = 'polarMarkArcLine';
  // eslint-disable-next-line max-len
  static defaultAttributes: Partial<PolarMarkArcLineAttrs> =
    DEFAULT_POLAR_MARK_LINE_THEME as unknown as PolarMarkArcLineAttrs;
  protected _line!: ArcSegment;

  constructor(attributes: PolarMarkArcLineAttrs, options?: ComponentOptions) {
    super(options?.skipDefault ? attributes : merge({}, PolarMarkArcLine.defaultAttributes, attributes));
  }

  protected isValidPoints() {
    return true;
  }

  protected getPositionByDirection(direction: IPolarMarkLabelPosition) {
    const { center, radius, startAngle, endAngle, label } = this.attribute as PolarMarkArcLineAttrs;
    const { refX = 0, refY = 0 } = label;
    // eslint-disable-next-line max-len
    const labelRectHeight = Math.abs(
      (this._label.getTextShape().AABBBounds?.y2 ?? 0) - (this._label.getTextShape()?.AABBBounds.y1 ?? 0)
    );
    // eslint-disable-next-line max-len
    const labelTextHeight = Math.abs(
      (this._label.getBgRect().AABBBounds?.y2 ?? 0) - (this._label.getBgRect()?.AABBBounds.y1 ?? 0)
    );
    const labelHeight = Math.max(labelRectHeight, labelTextHeight);

    let angle;
    // tag在正交方向是向内偏移，还是向外偏移
    // 不偏移: 0, 内: -1, 外: 1
    let orthogonalOffsetDirection;

    switch (direction) {
      case IPolarMarkLabelPosition.center:
        angle = (startAngle + endAngle) / 2;
        orthogonalOffsetDirection = 0;
        break;
      case IPolarMarkLabelPosition.arcInnerStart:
        angle = startAngle;
        orthogonalOffsetDirection = -1;
        break;
      case IPolarMarkLabelPosition.arcOuterStart:
        angle = startAngle;
        orthogonalOffsetDirection = 1;
        break;
      case IPolarMarkLabelPosition.arcInnerEnd:
        angle = endAngle;
        orthogonalOffsetDirection = -1;
        break;
      case IPolarMarkLabelPosition.arcOuterEnd:
        angle = endAngle;
        orthogonalOffsetDirection = 1;
        break;
      case IPolarMarkLabelPosition.arcInnerMiddle:
        angle = (startAngle + endAngle) / 2;
        orthogonalOffsetDirection = -1;
        break;
      case IPolarMarkLabelPosition.arcOuterMiddle:
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

  protected setLabelPos(): void {
    super.setLabelPos();
    const { label = {} } = this.attribute as PolarMarkArcLineAttrs;
    const { position = 'arcInnerMiddle', autoRotate = true } = label;
    const labelAttr = this.getPositionByDirection(position as any);
    this._label.setAttributes({
      ...labelAttr.position,
      angle: autoRotate ? labelAttr.angle - Math.PI / 2 + (label.refAngle ?? 0) : 0
    });
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