import { type IGraphic, type IGroup, type EasingType } from '@visactor/vrender-core';
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
      from: { innerRadius: attrs?.innerRadius },
      to: { innerRadius: attrs?.outerRadius }
    };
  }
  return {
    from: { outerRadius: attrs?.outerRadius },
    to: { outerRadius: attrs?.innerRadius }
  };
};

const growRadiusOutOverall = (
  graphic: IGraphic,
  options: IGrowRadiusAnimationOptions,
  animationParameters: IAnimationParameters
) => {
  const attrs = graphic.getFinalAttribute();
  const overallValue = isNumber(options?.overall) ? options.overall : 0;
  return {
    from: {
      innerRadius: attrs?.innerRadius,
      outerRadius: attrs?.outerRadius
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

export class GrowPointsBase extends ACustomAnimate<Record<string, number>> {
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
export class GrowRadiusIn extends GrowPointsBase {
  onBind(): void {
    super.onBind();
    const { from, to } = growRadiusIn(this.target, this.params.options, this.params);
    const fromAttrs = this.target.context?.lastAttrs ?? from;
    this.props = to;
    this.propKeys = Object.keys(to).filter(key => to[key] != null);
    this.from = fromAttrs;
    this.to = to;

    // 用于入场的时候设置属性（因为有动画的时候VChart不会再设置属性了）
    const finalAttribute = this.target.getFinalAttribute();
    if (finalAttribute) {
      Object.assign(this.target.attribute, finalAttribute);
    }
    this.target.setAttributes(fromAttrs);
  }
}

export class GrowRadiusOut extends GrowPointsBase {
  onBind(): void {
    super.onBind();
    const { to } = growRadiusOut(this.target, this.params.options, this.params);
    this.props = to;
    this.propKeys = Object.keys(to).filter(key => to[key] != null);

    this.from = this.target.attribute as any;
    this.to = to;
    // this.target.setAttributes(fromAttrs);
  }
}
