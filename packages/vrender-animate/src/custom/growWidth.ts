import type { IGraphic, IGroup } from '@visactor/vrender-core';
import { isNil, isNumber, isValid } from '@visactor/vutils';
import type { IAnimate, IStep } from '../intreface/animate';
import type { EasingType } from '../intreface/easing';
import { ACustomAnimate } from './custom-animate';

interface IGrowCartesianAnimationOptions {
  orient?: 'positive' | 'negative';
  overall?: boolean | number;
  direction?: 'x' | 'y' | 'xy';
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

function growWidthInIndividual(
  graphic: IGraphic,
  options: IGrowCartesianAnimationOptions,
  animationParameters: IAnimationParameters
) {
  const attrs = graphic.getFinalAttribute();
  const x = attrs.x;
  const x1 = attrs.x1;
  const width = attrs.width;

  if (options && options.orient === 'negative') {
    const computedX1 = isValid(width) ? Math.max(x, x + width) : Math.max(x, x1);

    return {
      from: { x: computedX1, x1: isNil(x1) ? undefined : computedX1, width: isNil(width) ? undefined : 0 },
      to: { x: x, x1: x1, width: width }
    };
  }

  const computedX = isValid(width) ? Math.min(x, x + width) : Math.min(x, x1);
  return {
    from: { x: computedX, x1: isNil(x1) ? undefined : computedX, width: isNil(width) ? undefined : 0 },
    to: { x: x, x1: x1, width: width }
  };
}

function growWidthInOverall(
  graphic: IGraphic,
  options: IGrowCartesianAnimationOptions,
  animationParameters: IAnimationParameters
) {
  const attrs = graphic.getFinalAttribute();
  // no need to handle the situation where x > x1
  const x = attrs.x;
  const x1 = attrs.x1;
  const width = attrs.width;
  let overallValue: number;
  if (options && options.orient === 'negative') {
    if (isNumber(options.overall)) {
      overallValue = options.overall;
    } else if (animationParameters.group) {
      overallValue = (animationParameters as any).groupWidth ?? animationParameters.group.getBounds().width();

      (animationParameters as any).groupWidth = overallValue;
    } else {
      overallValue = animationParameters.width;
    }
  } else {
    overallValue = isNumber(options?.overall) ? options?.overall : 0;
  }
  return {
    from: { x: overallValue, x1: isNil(x1) ? undefined : overallValue, width: isNil(width) ? undefined : 0 },
    to: { x: x, x1: x1, width: width }
  };
}

const growWidthIn: TypeAnimation<IGraphic> = (
  graphic: IGraphic,
  options: IGrowCartesianAnimationOptions,
  animationParameters: IAnimationParameters
) => {
  return (options?.overall ?? false) !== false
    ? growWidthInOverall(graphic, options, animationParameters)
    : growWidthInIndividual(graphic, options, animationParameters);
};

function growWidthOutIndividual(
  graphic: IGraphic,
  options: IGrowCartesianAnimationOptions,
  animationParameters: IAnimationParameters
) {
  const attrs = graphic.getFinalAttribute();
  const x = attrs.x;
  const x1 = attrs.x1;
  const width = attrs.width;

  if (options && options.orient === 'negative') {
    const computedX1 = isValid(width) ? Math.max(x, x + width) : Math.max(x, x1);

    return {
      to: { x: computedX1, x1: isNil(x1) ? undefined : computedX1, width: isNil(width) ? undefined : 0 }
    };
  }

  const computedX = isValid(width) ? Math.min(x, x + width) : Math.min(x, x1);
  return {
    to: { x: computedX, x1: isNil(x1) ? undefined : computedX, width: isNil(width) ? undefined : 0 }
  };
}

function growWidthOutOverall(
  graphic: IGraphic,
  options: IGrowCartesianAnimationOptions,
  animationParameters: IAnimationParameters
) {
  const attrs = graphic.getFinalAttribute();
  const x1 = attrs.x1;
  const width = attrs.width;

  let overallValue: number;
  if (options && options.orient === 'negative') {
    if (isNumber(options.overall)) {
      overallValue = options.overall;
    } else if (animationParameters.group) {
      overallValue = (animationParameters as any).groupWidth ?? animationParameters.group.getBounds().width();

      (animationParameters as any).groupWidth = overallValue;
    } else {
      overallValue = animationParameters.width;
    }
  } else {
    overallValue = isNumber(options?.overall) ? options.overall : 0;
  }
  return {
    to: { x: overallValue, x1: isNil(x1) ? undefined : overallValue, width: isNil(width) ? undefined : 0 }
  };
}

export const growWidthOut: TypeAnimation<IGraphic> = (
  graphic: IGraphic,
  options: IGrowCartesianAnimationOptions,
  animationParameters: IAnimationParameters
) => {
  return (options?.overall ?? false) !== false
    ? growWidthOutOverall(graphic, options, animationParameters)
    : growWidthOutIndividual(graphic, options, animationParameters);
};

/**
 * 增长渐入
 */
export class GrowWidthIn extends ACustomAnimate<Record<string, number>> {
  declare valid: boolean;

  constructor(from: null, to: null, duration: number, easing: EasingType, params?: any) {
    super(from, to, duration, easing, params);
  }

  onBind(): void {
    const { from, to } = growWidthIn(this.target, this.params.options, this.params);
    const fromAttrs = this.target.context.lastAttrs ?? from;
    this.props = to;
    this.propKeys = Object.keys(to).filter(key => to[key] != null);
    this.animate.reSyncProps();
    this.from = fromAttrs;
    this.to = to;
    this.target.setAttributes(fromAttrs);
  }

  onEnd(cb?: (animate: IAnimate, step: IStep) => void): void {
    super.onEnd(cb);
  }

  onUpdate(end: boolean, ratio: number, out: Record<string, any>): void {
    this.propKeys.forEach(key => {
      out[key] = this.from[key] + (this.to[key] - this.from[key]) * ratio;
    });
    this.target.setAttributes(out);
  }
}

export class GrowWidthOut extends ACustomAnimate<Record<string, number>> {
  declare valid: boolean;

  constructor(from: null, to: null, duration: number, easing: EasingType, params?: any) {
    super(from, to, duration, easing, params);
  }

  onBind(): void {
    const attrs = this.target.getFinalAttribute();
    const { from, to } = growWidthOut(this.target, this.params.options, this.params);
    this.props = to;
    this.propKeys = Object.keys(to).filter(key => to[key] != null);
    this.animate.reSyncProps();
    this.from = from || attrs;
    this.to = to;
    // this.target.setAttributes(from);
  }

  onEnd(cb?: (animate: IAnimate, step: IStep) => void): void {
    super.onEnd(cb);
  }

  onUpdate(end: boolean, ratio: number, out: Record<string, any>): void {
    this.propKeys.forEach(key => {
      out[key] = this.from[key] + (this.to[key] - this.from[key]) * ratio;
    });
    this.target.setAttributes(out);
  }
}
