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

// When user did not provide proper x/y value, move animation will never work properly,
//  due to that, default x/y value won't be set.

export const moveIn = (
  graphic: IGraphic,
  options: IMoveAnimationOptions,
  animationParameters: IAnimationParameters
) => {
  const { offset = 0, orient, direction, point: pointOpt, excludeChannels = [], layoutRect = {} } = options ?? {};
  let changedX = 0;
  let changedY = 0;

  if (orient === 'negative') {
    changedX = (layoutRect as any).width ?? graphic.stage.viewWidth;
    changedY = (layoutRect as any).height ?? graphic.stage.viewHeight;
  }

  changedX += offset;
  changedY += offset;
  const point = isFunction(pointOpt)
    ? pointOpt.call(null, graphic.context?.data?.[0], graphic, animationParameters)
    : pointOpt;
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

  const groupBounds = animationParameters.group ? animationParameters.group.AABBBounds : null;
  const groupWidth = groupBounds.width() ?? animationParameters.width;
  const groupHeight = groupBounds.height() ?? animationParameters.height;
  const changedX = (orient === 'negative' ? groupWidth : 0) + offset;
  const changedY = (orient === 'negative' ? groupHeight : 0) + offset;
  const point = isFunction(pointOpt)
    ? pointOpt.call(null, graphic.context?.data?.[0], graphic, animationParameters)
    : pointOpt;
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
    super.onBind();
    const { from, to } = moveIn(this.target, this.params.options, this.params);
    this.props = to;
    this.propKeys = Object.keys(to).filter(key => (to as any)[key] != null);
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

export class MoveOut extends MoveBase {
  onBind(): void {
    super.onBind();
    const { from, to } = moveOut(this.target, this.params.options, this.params);
    this.props = to;
    this.propKeys = Object.keys(to).filter(key => (to as any)[key] != null);
    this.from = from;
    this.to = to;
  }
}
