import { type IGraphic, type IGroup } from '@visactor/vrender-core';
import type { EasingType } from '../intreface/easing';
import { ACustomAnimate } from './custom-animate';
import { isNumber } from '@visactor/vutils';

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

export interface IGrowAngleAnimationOptions {
  orient?: 'clockwise' | 'anticlockwise';
  overall?: boolean | number;
}

export interface IGrowRadiusAnimationOptions {
  orient?: 'inside' | 'outside';
  overall?: boolean | number;
}

const growRadiusInIndividual = (
  graphic: IGraphic,
  options: IGrowRadiusAnimationOptions,
  animationParameters: IAnimationParameters
) => {
  const attrs = graphic.getFinalAttribute();

  if (options && options.orient === 'inside') {
    return {
      from: { innerRadius: attrs?.outerRadius },
      to: { innerRadius: attrs?.innerRadius }
    };
  }
  return {
    from: { outerRadius: attrs?.innerRadius },
    to: { outerRadius: attrs?.outerRadius }
  };
};

const growRadiusInOverall = (
  graphic: IGraphic,
  options: IGrowRadiusAnimationOptions,
  animationParameters: IAnimationParameters
) => {
  const attrs = graphic.getFinalAttribute();
  const overallValue = isNumber(options?.overall) ? options.overall : 0;
  return {
    from: {
      innerRadius: overallValue,
      outerRadius: overallValue
    },
    to: {
      innerRadius: attrs?.innerRadius,
      outerRadius: attrs?.outerRadius
    }
  };
};

export const growRadiusIn: TypeAnimation<IGraphic> = (
  graphic: IGraphic,
  options: IGrowRadiusAnimationOptions,
  animationParameters: IAnimationParameters
) => {
  return (options?.overall ?? false) !== false
    ? growRadiusInOverall(graphic, options, animationParameters)
    : growRadiusInIndividual(graphic, options, animationParameters);
};

const growRadiusOutIndividual = (
  graphic: IGraphic,
  options: IGrowRadiusAnimationOptions,
  animationParameters: IAnimationParameters
) => {
  const attrs = graphic.getFinalAttribute();
  if (options && options.orient === 'inside') {
    return {
      from: { innerRadius: graphic.getGraphicAttribute('innerRadius', true) },
      to: { innerRadius: attrs?.outerRadius }
    };
  }
  return {
    from: { outerRadius: graphic.getGraphicAttribute('outerRadius', true) },
    to: { outerRadius: attrs?.innerRadius }
  };
};

const growRadiusOutOverall = (
  graphic: IGraphic,
  options: IGrowRadiusAnimationOptions,
  animationParameters: IAnimationParameters
) => {
  const overallValue = isNumber(options?.overall) ? options.overall : 0;
  return {
    from: {
      innerRadius: graphic.getGraphicAttribute('innerRadius', true),
      outerRadius: graphic.getGraphicAttribute('outerRadius', true)
    },
    to: {
      innerRadius: overallValue,
      outerRadius: overallValue
    }
  };
};

export const growRadiusOut: TypeAnimation<IGraphic> = (
  graphic: IGraphic,
  options: IGrowRadiusAnimationOptions,
  animationParameters: IAnimationParameters
) => {
  return (options?.overall ?? false) !== false
    ? growRadiusOutOverall(graphic, options, animationParameters)
    : growRadiusOutIndividual(graphic, options, animationParameters);
};

export class GworPointsBase extends ACustomAnimate<Record<string, number>> {
  declare valid: boolean;

  constructor(from: null, to: null, duration: number, easing: EasingType, params?: any) {
    super(from, to, duration, easing, params);
  }

  onUpdate(end: boolean, ratio: number, out: Record<string, any>): void {
    this.propKeys.forEach(key => {
      out[key] = this.from[key] + (this.to[key] - this.from[key]) * ratio;
    });
    this.target.setAttributes(out);
  }
}

/**
 * 增长渐入
 */
export class GrowRadiusIn extends GworPointsBase {
  onBind(): void {
    const { from, to } = growRadiusIn(this.target, this.params.options, this.params);
    const fromAttrs = this.target.context.lastAttrs ?? from;
    this.props = to;
    this.propKeys = Object.keys(to).filter(key => to[key] != null);
    this.animate.reSyncProps();
    this.from = fromAttrs;
    this.to = to;
    this.target.setAttributes(fromAttrs);
  }
}

export class GrowRadiusOut extends GworPointsBase {
  onBind(): void {
    const { from, to } = growRadiusOut(this.target, this.params.options, this.params);
    const fromAttrs = this.target.context.lastAttrs ?? from;
    this.props = to;
    this.propKeys = Object.keys(to).filter(key => to[key] != null);
    this.animate.reSyncProps();
    this.from = fromAttrs;
    this.to = to;
    this.target.setAttributes(fromAttrs);
  }
}
