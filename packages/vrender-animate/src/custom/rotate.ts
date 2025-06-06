import type { EasingType, IGraphic } from '@visactor/vrender-core';
import { isNumberClose, isValidNumber } from '@visactor/vutils';
import { ACustomAnimate } from './custom-animate';

export interface IRotateAnimationOptions {
  orient?: 'clockwise' | 'anticlockwise';
  angle?: number;
}

export const rotateIn = (graphic: IGraphic, options: IRotateAnimationOptions) => {
  const finalAttrs = graphic.getFinalAttribute();
  const attributeAngle = finalAttrs.angle ?? 0;

  let angle = 0;
  if (isNumberClose(attributeAngle / (Math.PI * 2), 0)) {
    angle = Math.round(attributeAngle / (Math.PI * 2)) * Math.PI * 2;
  } else if (isValidNumber(options?.angle)) {
    angle = options.angle;
  } else if (options?.orient === 'anticlockwise') {
    angle = Math.ceil(attributeAngle / (Math.PI * 2)) * Math.PI * 2;
  } else {
    angle = Math.floor(attributeAngle / (Math.PI * 2)) * Math.PI * 2;
  }
  return {
    from: { angle },
    to: { angle: attributeAngle }
  };
};

export const rotateOut = (graphic: IGraphic, options: IRotateAnimationOptions) => {
  const finalAttrs = graphic.getFinalAttribute();
  const finalAngle = finalAttrs.angle ?? 0;
  let angle = 0;
  if (isNumberClose(finalAngle / (Math.PI * 2), 0)) {
    angle = Math.round(finalAngle / (Math.PI * 2)) * Math.PI * 2;
  } else if (isValidNumber(options?.angle)) {
    angle = options.angle;
  } else if (options?.orient === 'anticlockwise') {
    angle = Math.ceil(finalAngle / (Math.PI * 2)) * Math.PI * 2;
  } else {
    angle = Math.floor(finalAngle / (Math.PI * 2)) * Math.PI * 2;
  }
  return {
    from: { angle: finalAngle },
    to: { angle }
  };
};

export class RotateBase extends ACustomAnimate<Record<string, number>> {
  declare valid: boolean;

  constructor(from: null, to: null, duration: number, easing: EasingType, params?: any) {
    super(from, to, duration, easing, params);
  }

  onUpdate(end: boolean, ratio: number, out: Record<string, any>): void {
    const attribute: Record<string, any> = this.target.attribute;
    this.propKeys.forEach(key => {
      attribute[key] = this.from[key] + (this.to[key] - this.from[key]) * ratio;
    });
    this.target.addUpdatePositionTag();
    this.target.addUpdateShapeAndBoundsTag();
  }
}

/**
 * 增长渐入
 */
export class RotateIn extends RotateBase {
  onBind(): void {
    super.onBind();
    // 用于入场的时候设置属性（因为有动画的时候VChart不会再设置属性了）
    const { from, to } = rotateIn(this.target, this.params.options);

    this.props = to;
    this.propKeys = ['angle'];
    this.from = from;
    this.to = to;

    // 用于入场的时候设置属性（因为有动画的时候VChart不会再设置属性了）
    const finalAttribute = this.target.getFinalAttribute();
    if (finalAttribute) {
      this.target.setAttributes(finalAttribute);
    }

    if (this.params.controlOptions?.immediatelyApply !== false) {
      this.target.setAttributes(from);
    }
  }
}

export class RotateOut extends RotateBase {
  onBind(): void {
    super.onBind();
    const { from, to } = rotateOut(this.target, this.params.options);
    this.props = to;
    this.propKeys = ['angle'];

    this.from = from;
    this.to = to;
  }
}
