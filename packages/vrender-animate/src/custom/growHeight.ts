import type { IGraphic, IGroup, IAnimate, IStep, EasingType } from '@visactor/vrender-core';
import { isNil, isNumber, isValid } from '@visactor/vutils';
import { ACustomAnimate } from './custom-animate';

interface IGrowCartesianAnimationOptions {
  orient?: 'positive' | 'negative';
  overall?: boolean | number;
  direction?: 'x' | 'y' | 'xy';
  layoutRect?: { width: number; height: number };
}

interface IAnimationParameters {
  width: number;
  height: number;
  group: IGroup;
  elementIndex: number;
  elementCount: number;
  view: any;
}

type TypeAnimation<T extends IGraphic> = (
  graphic: T,
  options: any,
  animationParameters: IAnimationParameters
) => { from?: { [channel: string]: any }; to?: { [channel: string]: any } };

function growHeightInIndividual(
  graphic: IGraphic,
  options: IGrowCartesianAnimationOptions,
  animationParameters: IAnimationParameters
) {
  const attrs = graphic.getFinalAttribute();
  const y = attrs.y;
  const y1 = attrs.y1;
  const height = attrs.height;

  if (options && options.orient === 'negative') {
    const computedY1 = isValid(height) ? Math.max(y, y + height) : Math.max(y, y1);
    return {
      from: { y: computedY1, y1: isNil(y1) ? undefined : computedY1, height: isNil(height) ? undefined : 0 },
      to: { y: y, y1: y1, height: height }
    };
  }

  const computedY = isValid(height) ? Math.min(y, y + height) : Math.min(y, y1);
  return {
    from: { y: computedY, y1: isNil(y1) ? undefined : computedY, height: isNil(height) ? undefined : 0 },
    to: { y: y, y1: y1, height: height }
  };
}

function growHeightInOverall(
  graphic: IGraphic,
  options: IGrowCartesianAnimationOptions,
  animationParameters: IAnimationParameters
) {
  const attrs = graphic.getFinalAttribute();
  const y = attrs.y;
  const y1 = attrs.y1;
  const height = attrs.height;

  let overallValue: number;
  if (options && options.orient === 'negative') {
    if (isNumber(options.overall)) {
      overallValue = options.overall;
    } else if (animationParameters.group) {
      overallValue =
        (animationParameters as any).groupHeight ??
        options.layoutRect?.height ??
        animationParameters.group.getBounds().height();

      (animationParameters as any).groupHeight = overallValue;
    } else {
      overallValue = animationParameters.height;
    }
  } else {
    overallValue = isNumber(options?.overall) ? options.overall : 0;
  }
  return {
    from: { y: overallValue, y1: isNil(y1) ? undefined : overallValue, height: isNil(height) ? undefined : 0 },
    to: { y: y, y1: y1, height: height }
  };
}

const growHeightIn: TypeAnimation<IGraphic> = (
  graphic: IGraphic,
  options: IGrowCartesianAnimationOptions,
  animationParameters: IAnimationParameters
) => {
  return (options?.overall ?? false) !== false
    ? growHeightInOverall(graphic, options, animationParameters)
    : growHeightInIndividual(graphic, options, animationParameters);
};

/**
 * 增长渐入
 */
export class GrowHeightIn extends ACustomAnimate<Record<string, number>> {
  declare valid: boolean;

  constructor(from: null, to: null, duration: number, easing: EasingType, params?: any) {
    super(from, to, duration, easing, params);
  }

  onBind(): void {
    super.onBind();
    const { from, to } = growHeightIn(this.target, this.params.options, this.params);
    const fromAttrs = this.target.context?.lastAttrs ?? from;
    this.props = to;
    this.propKeys = Object.keys(to).filter(key => to[key] != null);
    this.from = fromAttrs;
    this.to = to;

    // 用于入场的时候设置属性（因为有动画的时候VChart不会再设置属性了）
    const finalAttribute = this.target.getFinalAttribute();
    if (finalAttribute) {
      this.target.setAttributes(finalAttribute);
    }

    this.target.setAttributes(fromAttrs);
  }

  onEnd(cb?: (animate: IAnimate, step: IStep) => void): void {
    super.onEnd(cb);
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

function growHeightOutIndividual(
  graphic: IGraphic,
  options: IGrowCartesianAnimationOptions,
  animationParameters: IAnimationParameters
) {
  const attrs = graphic.getFinalAttribute();
  const y = attrs.y;
  const y1 = attrs.y1;
  const height = attrs.height;

  if (options && options.orient === 'negative') {
    const computedY1 = isValid(height) ? Math.max(y, y + height) : Math.max(y, y1);

    return {
      to: { y: computedY1, y1: isNil(y1) ? undefined : computedY1, height: isNil(height) ? undefined : 0 }
    };
  }

  const computedY = isValid(height) ? Math.min(y, y + height) : Math.min(y, y1);
  return {
    to: { y: computedY, y1: isNil(y1) ? undefined : computedY, height: isNil(height) ? undefined : 0 }
  };
}

function growHeightOutOverall(
  graphic: IGraphic,
  options: IGrowCartesianAnimationOptions,
  animationParameters: IAnimationParameters
) {
  const attrs = graphic.getFinalAttribute();
  const y1 = attrs.y1;
  const height = attrs.height;

  let overallValue: number;
  if (options && options.orient === 'negative') {
    if (isNumber(options.overall)) {
      overallValue = options.overall;
    } else if (animationParameters.group) {
      overallValue =
        (animationParameters as any).groupHeight ??
        options.layoutRect?.height ??
        animationParameters.group.getBounds().height();

      (animationParameters as any).groupHeight = overallValue;
    } else {
      overallValue = animationParameters.height;
    }
  } else {
    overallValue = isNumber(options?.overall) ? options.overall : 0;
  }
  return {
    to: { y: overallValue, y1: isNil(y1) ? undefined : overallValue, height: isNil(height) ? undefined : 0 }
  };
}

/**
 * 增长渐出
 */
export const growHeightOut: TypeAnimation<IGraphic> = (
  graphic: IGraphic,
  options: IGrowCartesianAnimationOptions,
  animationParameters: IAnimationParameters
) => {
  return (options?.overall ?? false) !== false
    ? growHeightOutOverall(graphic, options, animationParameters)
    : growHeightOutIndividual(graphic, options, animationParameters);
};

export class GrowHeightOut extends ACustomAnimate<Record<string, number>> {
  declare valid: boolean;

  constructor(from: null, to: null, duration: number, easing: EasingType, params?: any) {
    super(from, to, duration, easing, params);
  }

  onBind(): void {
    super.onBind();
    const { from, to } = growHeightOut(this.target, this.params.options, this.params);
    this.props = to;
    this.propKeys = Object.keys(to).filter(key => to[key] != null);
    this.from = from ?? (this.target.attribute as any);
    this.to = to;
    // this.target.setAttributes(from);
  }

  onEnd(cb?: (animate: IAnimate, step: IStep) => void): void {
    super.onEnd(cb);
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
