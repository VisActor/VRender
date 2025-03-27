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

const growAngleInIndividual = (
  graphic: IGraphic,
  options: IGrowAngleAnimationOptions,
  animationParameters: IAnimationParameters
) => {
  const attrs = graphic.getFinalAttribute();
  if (options && options.orient === 'anticlockwise') {
    return {
      from: { startAngle: attrs?.endAngle },
      to: { startAngle: attrs?.startAngle }
    };
  }
  return {
    from: { endAngle: attrs?.startAngle },
    to: { endAngle: attrs?.endAngle }
  };
};

const growAngleInOverall = (
  graphic: IGraphic,
  options: IGrowAngleAnimationOptions,
  animationParameters: IAnimationParameters
) => {
  const attrs = graphic.getFinalAttribute();

  if (options && options.orient === 'anticlockwise') {
    const overallValue = isNumber(options.overall) ? options.overall : Math.PI * 2;
    return {
      from: {
        startAngle: overallValue,
        endAngle: overallValue
      },
      to: {
        startAngle: attrs?.startAngle,
        endAngle: attrs?.endAngle
      }
    };
  }
  const overallValue = isNumber(options?.overall) ? options.overall : 0;
  return {
    from: {
      startAngle: overallValue,
      endAngle: overallValue
    },
    to: {
      startAngle: attrs?.startAngle,
      endAngle: attrs?.endAngle
    }
  };
};

export const growAngleIn: TypeAnimation<IGraphic> = (
  graphic: IGraphic,
  options: IGrowAngleAnimationOptions,
  animationParameters: IAnimationParameters
) => {
  return (options?.overall ?? false) !== false
    ? growAngleInOverall(graphic, options, animationParameters)
    : growAngleInIndividual(graphic, options, animationParameters);
};

const growAngleOutIndividual = (
  graphic: IGraphic,
  options: IGrowAngleAnimationOptions,
  animationParameters: IAnimationParameters
) => {
  const attrs = graphic.getFinalAttribute();

  if (options && options.orient === 'anticlockwise') {
    return {
      from: { startAngle: attrs.startAngle },
      to: { startAngle: attrs?.endAngle }
    };
  }
  return {
    from: { endAngle: attrs.endAngle },
    to: { endAngle: attrs?.startAngle }
  };
};

const growAngleOutOverall = (
  graphic: IGraphic,
  options: IGrowAngleAnimationOptions,
  animationParameters: IAnimationParameters
) => {
  const attrs = graphic.getFinalAttribute();
  if (options && options.orient === 'anticlockwise') {
    const overallValue = isNumber(options.overall) ? options.overall : Math.PI * 2;
    return {
      from: {
        startAngle: attrs.startAngle,
        endAngle: attrs.endAngle
      },
      to: {
        startAngle: overallValue,
        endAngle: overallValue
      }
    };
  }
  const overallValue = isNumber(options?.overall) ? options.overall : 0;
  return {
    from: {
      startAngle: attrs.startAngle,
      endAngle: attrs.endAngle
    },
    to: {
      startAngle: overallValue,
      endAngle: overallValue
    }
  };
};

export const growAngleOut: TypeAnimation<IGraphic> = (
  graphic: IGraphic,
  options: IGrowAngleAnimationOptions,
  animationParameters: IAnimationParameters
) => {
  return (options?.overall ?? false) !== false
    ? growAngleOutOverall(graphic, options, animationParameters)
    : growAngleOutIndividual(graphic, options, animationParameters);
};

export class GrowAngleBase extends ACustomAnimate<Record<string, number>> {
  declare valid: boolean;

  declare _updateFunction: (ratio: number) => void;

  constructor(from: null, to: null, duration: number, easing: EasingType, params?: any) {
    super(from, to, duration, easing, params);
  }

  determineUpdateFunction(): void {
    if (!this.propKeys) {
      this.valid = false;
    } else if (this.propKeys && this.propKeys.length > 1) {
      this._updateFunction = this.updateAngle;
    } else if (this.propKeys[0] === 'startAngle') {
      this._updateFunction = this.updateStartAngle;
    } else if (this.propKeys[0] === 'endAngle') {
      this._updateFunction = this.updateEndAngle;
    } else {
      this.valid = false;
    }
  }

  updateStartAngle(ratio: number): void {
    (this.target.attribute as any).startAngle =
      this.from.startAngle + (this.to.startAngle - this.from.startAngle) * ratio;
  }

  updateEndAngle(ratio: number): void {
    (this.target.attribute as any).endAngle = this.from.endAngle + (this.to.endAngle - this.from.endAngle) * ratio;
  }

  updateAngle(ratio: number): void {
    this.updateStartAngle(ratio);
    this.updateEndAngle(ratio);
  }

  onUpdate(end: boolean, ratio: number, out: Record<string, any>): void {
    this._updateFunction(ratio);
    this.target.addUpdateShapeAndBoundsTag();
  }
}

/**
 * 增长渐入
 */
export class GrowAngleIn extends GrowAngleBase {
  onBind(): void {
    // 用于入场的时候设置属性（因为有动画的时候VChart不会再设置属性了）
    if (this.params?.diffAttrs) {
      Object.assign(this.target.attribute, this.params.diffAttrs);
    }
    const { from, to } = growAngleIn(this.target, this.params.options, this.params);
    const fromAttrs = this.target.context.lastAttrs ?? from;
    this.props = to;
    this.propKeys = Object.keys(to).filter(key => to[key] != null);
    this.from = fromAttrs;
    this.to = to;
    // 性能优化，不需要setAttributes
    Object.assign(this.target.attribute, fromAttrs);
    this.target.addUpdatePositionTag();
    this.target.addUpdateBoundTag();
    this.determineUpdateFunction();
  }
}

export class GrowAngleOut extends GrowAngleBase {
  onBind(): void {
    const { from, to } = growAngleOut(this.target, this.params.options, this.params);
    const fromAttrs = this.target.context.lastAttrs ?? from;
    this.props = to;
    this.propKeys = Object.keys(to).filter(key => to[key] != null);
    this.animate.reSyncProps();
    this.from = fromAttrs;
    this.to = to;
    // 性能优化，不需要setAttributes
    Object.assign(this.target.attribute, fromAttrs);
    this.target.addUpdatePositionTag();
    this.target.addUpdateBoundTag();
    this.determineUpdateFunction();
  }
}
