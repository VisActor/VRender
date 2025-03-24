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

const growCenterIn: TypeAnimation<IGraphic> = (
  graphic: IGraphic,
  options: IGrowCartesianAnimationOptions,
  animationParameters: IAnimationParameters
) => {
  const attrs = graphic.getFinalAttribute();
  switch (options?.direction) {
    case 'x': {
      const x = attrs.x;
      const x1 = attrs.x1;
      const width = attrs.width;

      return {
        from: isValid(width)
          ? {
              x: x + width / 2,
              x1: undefined,
              width: 0
            }
          : {
              x: (x + x1) / 2,
              x1: (x + x1) / 2,
              width: undefined
            },
        to: { x, x1, width }
      };
    }
    case 'y': {
      const y = attrs.y;
      const y1 = attrs.y1;
      const height = attrs.height;

      return {
        from: isValid(height)
          ? {
              y: y + height / 2,
              y1: undefined,
              height: 0
            }
          : {
              y: (y + y1) / 2,
              y1: (y + y1) / 2,
              height: undefined
            },
        to: { y, y1, height }
      };
    }
    case 'xy':
    default: {
      const x = attrs.x;
      const x1 = attrs.x1;
      const width = attrs.width;
      const y = attrs.y;
      const y1 = attrs.y1;
      const height = attrs.height;
      const from: any = {};

      if (isValid(width)) {
        from.x = x + width / 2;
        from.width = 0;
        from.x1 = undefined;
      } else {
        from.x = (x + x1) / 2;
        from.x1 = (x + x1) / 2;
        from.width = undefined;
      }

      if (isValid(height)) {
        from.y = y + height / 2;
        from.height = 0;
        from.y1 = undefined;
      } else {
        from.y = (y + y1) / 2;
        from.y1 = (y + y1) / 2;
        from.height = undefined;
      }

      return {
        from,
        to: { x, y, x1, y1, width, height }
      };
    }
  }
};

const growCenterOut: TypeAnimation<IGraphic> = (
  graphic: IGraphic,
  options: IGrowCartesianAnimationOptions,
  animationParameters: IAnimationParameters
) => {
  const attrs = graphic.getFinalAttribute();
  switch (options?.direction) {
    case 'x': {
      const x = attrs.x;
      const x1 = attrs.x1;
      const width = attrs.width;

      return {
        to: isValid(width)
          ? {
              x: x + width / 2,
              x1: undefined,
              width: 0
            }
          : {
              x: (x + x1) / 2,
              x1: (x + x1) / 2,
              width: undefined
            }
      };
    }
    case 'y': {
      const y = attrs.y;
      const y1 = attrs.y1;
      const height = attrs.height;

      return {
        to: isValid(height)
          ? {
              y: y + height / 2,
              y1: undefined,
              height: 0
            }
          : {
              y: (y + y1) / 2,
              y1: (y + y1) / 2,
              height: undefined
            }
      };
    }
    case 'xy':
    default: {
      const x = attrs.x;
      const y = attrs.y;
      const x1 = attrs.x1;
      const y1 = attrs.y1;
      const width = attrs.width;
      const height = attrs.height;
      const to: any = {};

      if (isValid(width)) {
        to.x = x + width / 2;
        to.width = 0;
        to.x1 = undefined;
      } else {
        to.x = (x + x1) / 2;
        to.x1 = (x + x1) / 2;
        to.width = undefined;
      }

      if (isValid(height)) {
        to.y = y + height / 2;
        to.height = 0;
        to.y1 = undefined;
      } else {
        to.y = (y + y1) / 2;
        to.y1 = (y + y1) / 2;
        to.height = undefined;
      }

      return {
        to
      };
    }
  }
};

/**
 * 增长渐入
 */
export class GrowCenterIn extends ACustomAnimate<Record<string, number>> {
  declare valid: boolean;

  constructor(from: null, to: null, duration: number, easing: EasingType, params?: any) {
    super(from, to, duration, easing, params);
  }

  onBind(): void {
    const { from, to } = growCenterIn(this.target, this.params.options, this.params);
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

export class GrowCenterOut extends ACustomAnimate<Record<string, number>> {
  declare valid: boolean;

  constructor(from: null, to: null, duration: number, easing: EasingType, params?: any) {
    super(from, to, duration, easing, params);
  }

  onBind(): void {
    const attrs = this.target.getFinalAttribute();
    const { from, to } = growCenterOut(this.target, this.params.options, this.params);
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
