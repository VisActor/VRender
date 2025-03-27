import { pointInterpolation, type IGraphic, type IGroup } from '@visactor/vrender-core';
import type { IPointLike } from '@visactor/vutils';
import { isValidNumber } from '@visactor/vutils';
import type { IAnimate, IStep } from '../intreface/animate';
import type { EasingType } from '../intreface/easing';
import { ACustomAnimate } from './custom-animate';

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

export interface IGrowPointsAnimationOptions {
  orient?: 'positive' | 'negative';
}

export interface IGrowPointsOverallAnimationOptions extends IGrowPointsAnimationOptions {
  center?: IPointLike;
}

const getCenterPoints = (
  graphic: IGraphic,
  options: IGrowPointsOverallAnimationOptions,
  animationParameters: IAnimationParameters
) => {
  const attrs = graphic.getFinalAttribute();
  const points: IPointLike[] = attrs.points;
  const center: IPointLike = { x: 0, y: 0 };
  points.forEach(point => {
    center.x += point.x;
    center.y += point.y;
  });
  center.x /= points.length;
  center.y /= points.length;

  if (options && options.center) {
    if (isValidNumber(options.center.x)) {
      center.x = options.center.x;
    }
    if (isValidNumber(options.center.y)) {
      center.y = options.center.y;
    }
  }

  if (graphic.type === 'area') {
    center.x1 = center.x;
    center.y1 = center.y;
  }

  return points.map(point => Object.assign({}, point, center));
};

export const growPointsIn: TypeAnimation<IGraphic> = (
  graphic: IGraphic,
  options: IGrowPointsOverallAnimationOptions,
  animationParameters: IAnimationParameters
) => {
  const attrs = graphic.getFinalAttribute();
  return {
    from: { points: getCenterPoints(graphic, options, animationParameters) },
    to: { points: attrs.points }
  };
};

export const growPointsOut: TypeAnimation<IGraphic> = (
  graphic: IGraphic,
  options: IGrowPointsOverallAnimationOptions,
  animationParameters: IAnimationParameters
) => {
  const attrs = graphic.getFinalAttribute();
  return {
    from: { points: attrs.points },
    to: { points: getCenterPoints(graphic, options, animationParameters) }
  };
};

export class GworPointsBase extends ACustomAnimate<Record<string, number>> {
  declare valid: boolean;

  constructor(from: null, to: null, duration: number, easing: EasingType, params?: any) {
    super(from, to, duration, easing, params);
  }

  onUpdate(end: boolean, ratio: number, out: Record<string, any>): void {
    const fromPoints = this.from?.points as unknown as IPointLike[];
    const toPoints = this.to?.points as unknown as IPointLike[];
    if (!fromPoints || !toPoints) {
      return;
    }

    (this.target.attribute as any).points = fromPoints.map((point, index) => {
      const newPoint = pointInterpolation(fromPoints[index], toPoints[index], ratio);
      return newPoint;
    });
    this.target.addUpdatePositionTag();
    this.target.addUpdateShapeAndBoundsTag();
  }
}

/**
 * 增长渐入
 */
export class GrowPointsIn extends GworPointsBase {
  onBind(): void {
    if (['area', 'line', 'polygon'].includes(this.target.type)) {
      const { from, to } = growPointsIn(this.target, this.params.options, this.params);
      const fromAttrs = this.target.context.lastAttrs ?? from;
      this.props = to;
      this.propKeys = Object.keys(to).filter(key => to[key] != null);
      this.animate.reSyncProps();
      this.from = fromAttrs;
      this.to = to;
      this.target.setAttributes(fromAttrs);
    } else {
      this.valid = false;
    }
  }
}

export class GrowPointsOut extends GworPointsBase {
  onBind(): void {
    if (['area', 'line'].includes(this.target.type)) {
      const attrs = this.target.getFinalAttribute();
      const { from, to } = growPointsOut(this.target, this.params.options, this.params);
      this.props = to;
      this.propKeys = Object.keys(to).filter(key => to[key] != null);
      this.animate.reSyncProps();
      this.from = from || attrs;
      this.to = to;
    } else {
      this.valid = false;
    }
  }
}

const changePointsX = (
  graphic: IGraphic,
  options: IGrowPointsAnimationOptions,
  animationParameters: IAnimationParameters
) => {
  const attrs = graphic.getFinalAttribute();
  const points = attrs.points;
  return points.map((point: IPointLike) => {
    if (options && options.orient === 'negative') {
      let groupRight = animationParameters.width;

      if (animationParameters.group) {
        groupRight = (animationParameters as any).groupWidth ?? animationParameters.group.getBounds().width();

        (animationParameters as any).groupWidth = groupRight;
      }

      return {
        ...point,
        x: groupRight,
        y: point.y,
        x1: groupRight,
        y1: point.y1,
        defined: point.defined !== false
      } as IPointLike;
    }
    return {
      ...point,
      x: 0,
      y: point.y,
      x1: 0,
      y1: point.y1,
      defined: point.defined !== false
    } as IPointLike;
  });
};

const growPointsXIn: TypeAnimation<IGraphic> = (
  graphic: IGraphic,
  options: IGrowPointsAnimationOptions,
  animationParameters: IAnimationParameters
) => {
  const attrs = graphic.getFinalAttribute();
  return {
    from: { points: changePointsX(graphic, options, animationParameters) },
    to: { points: attrs.points }
  };
};

const growPointsXOut: TypeAnimation<IGraphic> = (
  graphic: IGraphic,
  options: IGrowPointsAnimationOptions,
  animationParameters: IAnimationParameters
) => {
  const attrs = graphic.getFinalAttribute();
  return {
    from: { points: attrs.points },
    to: { points: changePointsX(graphic, options, animationParameters) }
  };
};

export class GrowPointsXIn extends GworPointsBase {
  onBind(): void {
    if (['area', 'line', 'polygon'].includes(this.target.type)) {
      const { from, to } = growPointsXIn(this.target, this.params.options, this.params);
      const fromAttrs = this.target.context.lastAttrs ?? from;
      this.props = to;
      this.propKeys = Object.keys(to).filter(key => to[key] != null);
      this.animate.reSyncProps();
      this.from = fromAttrs;
      this.to = to;
      this.target.setAttributes(fromAttrs);
    } else {
      this.valid = false;
    }
  }
}

export class GrowPointsXOut extends GworPointsBase {
  onBind(): void {
    if (['area', 'line'].includes(this.target.type)) {
      const attrs = this.target.getFinalAttribute();
      const { from, to } = growPointsXOut(this.target, this.params.options, this.params);
      this.props = to;
      this.propKeys = Object.keys(to).filter(key => to[key] != null);
      this.animate.reSyncProps();
      this.from = from || attrs;
      this.to = to;
    } else {
      this.valid = false;
    }
  }
}

const changePointsY = (
  graphic: IGraphic,
  options: IGrowPointsAnimationOptions,
  animationParameters: IAnimationParameters
) => {
  const attrs = graphic.getFinalAttribute();
  const points = attrs.points;
  return points.map((point: IPointLike) => {
    if (options && options.orient === 'negative') {
      let groupBottom = animationParameters.height;

      if (animationParameters.group) {
        groupBottom = (animationParameters as any).groupHeight ?? animationParameters.group.getBounds().height();

        (animationParameters as any).groupHeight = groupBottom;
      }

      return {
        ...point,
        x: point.x,
        y: groupBottom,
        x1: point.x1,
        y1: groupBottom,
        defined: point.defined !== false
      } as IPointLike;
    }
    return {
      ...point,
      x: point.x,
      y: 0,
      x1: point.x1,
      y1: 0,
      defined: point.defined !== false
    } as IPointLike;
  });
};

const growPointsYIn: TypeAnimation<IGraphic> = (
  graphic: IGraphic,
  options: IGrowPointsAnimationOptions,
  animationParameters: IAnimationParameters
) => {
  const attrs = graphic.getFinalAttribute();
  return {
    from: { points: changePointsY(graphic, options, animationParameters) },
    to: { points: attrs.points }
  };
};

const growPointsYOut: TypeAnimation<IGraphic> = (
  graphic: IGraphic,
  options: IGrowPointsAnimationOptions,
  animationParameters: IAnimationParameters
) => {
  const attrs = graphic.getFinalAttribute();
  return {
    from: { points: attrs.points },
    to: { points: changePointsY(graphic, options, animationParameters) }
  };
};

export class GrowPointsYIn extends GworPointsBase {
  onBind(): void {
    // 用于入场的时候设置属性（因为有动画的时候VChart不会再设置属性了）
    if (this.params?.diffAttrs) {
      this.target.setAttributes(this.params.diffAttrs);
    }
    if (['area', 'line', 'polygon'].includes(this.target.type)) {
      const { from, to } = growPointsYIn(this.target, this.params.options, this.params);
      const fromAttrs = this.target.context.lastAttrs ?? from;
      this.props = to;
      this.propKeys = Object.keys(to).filter(key => to[key] != null);
      this.animate.reSyncProps();
      this.from = fromAttrs;
      this.to = to;
      this.target.setAttributes(fromAttrs);
    } else {
      this.valid = false;
    }
  }
}

export class GrowPointsYOut extends GworPointsBase {
  onBind(): void {
    if (['area', 'line'].includes(this.target.type)) {
      const attrs = this.target.getFinalAttribute();
      const { from, to } = growPointsYOut(this.target, this.params.options, this.params);
      this.props = to;
      this.propKeys = Object.keys(to).filter(key => to[key] != null);
      this.animate.reSyncProps();
      this.from = from || attrs;
      this.to = to;
    } else {
      this.valid = false;
    }
  }
}
