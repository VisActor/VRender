import type { EasingType, IGraphic, IGroup } from '@visactor/vrender-core';
import { isFunction, isValidNumber } from '@visactor/vutils';
import { ACustomAnimate } from './custom-animate';

export type FunctionCallback<T> = (...args: any[]) => T;

export interface IMoveAnimationOptions {
  direction?: 'x' | 'y' | 'xy';
  orient?: 'positive' | 'negative';
  offset?: number;
  point?: { x?: number; y?: number } | FunctionCallback<{ x?: number; y?: number }>;
  excludeChannels?: string[];
}

interface IAnimationParameters {
  width: number;
  height: number;
  group: IGroup;
  elementIndex: number;
  elementCount: number;
  view: any;
}

// When user did not provide proper x/y value, move animation will never work properly,
//  due to that, default x/y value won't be set.

export const moveIn = (
  graphic: IGraphic,
  options: IMoveAnimationOptions,
  animationParameters: IAnimationParameters
) => {
  const { offset = 0, orient, direction, point: pointOpt, excludeChannels = [] } = options ?? {};
  let changedX = 0;
  let changedY = 0;

  if (orient === 'negative') {
    // consider the offset of group
    if (animationParameters.group) {
      changedX = (animationParameters as any).groupWidth ?? animationParameters.group.getBounds().width();
      changedY = (animationParameters as any).groupHeight ?? animationParameters.group.getBounds().height();

      (animationParameters as any).groupWidth = changedX;
      (animationParameters as any).groupHeight = changedY;
    } else {
      changedX = animationParameters.width;
      changedY = animationParameters.height;
    }
  }

  changedX += offset;
  changedY += offset;
  const point = isFunction(pointOpt) ? pointOpt.call(null, graphic.getDatum(), graphic, animationParameters) : pointOpt;
  const fromX = point && isValidNumber(point.x) ? point.x : changedX;
  const fromY = point && isValidNumber(point.y) ? point.y : changedY;
  const finalAttrs = graphic.getFinalAttribute();
  const finalAttrsX = excludeChannels.includes('x') ? graphic.attribute.x : finalAttrs.x;
  const finalAttrsY = excludeChannels.includes('y') ? graphic.attribute.y : finalAttrs.y;

  switch (direction) {
    case 'x':
      return {
        from: { x: fromX },
        to: { x: finalAttrsX }
      };
    case 'y':
      return {
        from: { y: fromY },
        to: { y: finalAttrsY }
      };
    case 'xy':
    default:
      return {
        from: { x: fromX, y: fromY },
        to: {
          x: finalAttrsX,
          y: finalAttrsY
        }
      };
  }
};

export const moveOut = (
  graphic: IGraphic,
  options: IMoveAnimationOptions,
  animationParameters: IAnimationParameters
) => {
  const { offset = 0, orient, direction, point: pointOpt } = options ?? {};

  // consider the offset of group
  const groupBounds = animationParameters.group ? animationParameters.group.getBounds() : null;
  const groupWidth = groupBounds?.width() ?? animationParameters.width;
  const groupHeight = groupBounds?.height() ?? animationParameters.height;
  const changedX = (orient === 'negative' ? groupWidth : 0) + offset;
  const changedY = (orient === 'negative' ? groupHeight : 0) + offset;
  const point = isFunction(pointOpt) ? pointOpt.call(null, graphic.getDatum(), graphic, animationParameters) : pointOpt;
  const fromX = point && isValidNumber(point.x) ? point.x : changedX;
  const fromY = point && isValidNumber(point.y) ? point.y : changedY;

  switch (direction) {
    case 'x':
      return {
        from: { x: graphic.attribute.x },
        to: { x: fromX }
      };
    case 'y':
      return {
        from: { y: graphic.attribute.y },
        to: { y: fromY }
      };
    case 'xy':
    default:
      return {
        from: {
          x: graphic.attribute.x,
          y: graphic.attribute.y
        },
        to: { x: fromX, y: fromY }
      };
  }
};

export class MoveBase extends ACustomAnimate<Record<string, number>> {
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
export class MoveIn extends MoveBase {
  onBind(): void {
    // 用于入场的时候设置属性（因为有动画的时候VChart不会再设置属性了）
    if (this.params?.diffAttrs) {
      this.target.setAttributes(this.params.diffAttrs);
    }
    const { from, to } = moveIn(this.target, this.params.options, this.params);
    const fromAttrs = this.target.context?.lastAttrs ?? from;
    this.props = to;
    this.propKeys = Object.keys(to).filter(key => (to as any)[key] != null);
    this.animate.reSyncProps();
    this.from = fromAttrs;
    this.to = to;
    this.target.setAttributes(fromAttrs);
  }
}

export class MoveOut extends MoveBase {
  onBind(): void {
    const { from, to } = moveOut(this.target, this.params.options, this.params);
    const fromAttrs = this.target.context?.lastAttrs ?? from;
    this.props = to;
    this.propKeys = Object.keys(to).filter(key => (to as any)[key] != null);
    this.animate.reSyncProps();
    this.from = fromAttrs;
    this.to = to;
    this.target.setAttributes(fromAttrs);
  }
}
