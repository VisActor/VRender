import type { IAnimate, IStep } from '../intreface/animate';
import type { EasingType } from '../intreface/easing';
import { ACustomAnimate } from './custom-animate';

export interface IScaleAnimationOptions {
  direction?: 'x' | 'y' | 'xy';
}

export class ScaleIn extends ACustomAnimate<Record<string, number>> {
  declare valid: boolean;

  constructor(from: null, to: null, duration: number, easing: EasingType, params?: IScaleAnimationOptions) {
    super(from, to, duration, easing, params);
  }

  onBind(): void {
    let from: Record<string, number>;
    let to: Record<string, number>;
    const attrs = this.target.getFinalAttribute();
    const fromAttrs = this.target.context.lastAttrs ?? {};

    switch (this.params?.direction) {
      case 'x':
        from = { scaleX: fromAttrs.scaleX ?? 0 };
        to = { scaleX: attrs?.scaleX ?? 1 };
        break;
      case 'y':
        from = { scaleY: fromAttrs.scaleY ?? 0 };
        to = { scaleY: attrs?.scaleY ?? 1 };
        break;
      case 'xy':
      default:
        from = { scaleX: fromAttrs.scaleX ?? 0, scaleY: fromAttrs.scaleY ?? 0 };
        to = {
          scaleX: attrs?.scaleX ?? 1,
          scaleY: attrs?.scaleY ?? 1
        };
    }
    this.props = to;
    this.propKeys = Object.keys(to);
    this.animate.reSyncProps();
    this.from = from;
    this.to = to;
    this.target.setAttributes(from);
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

export class ScaleOut extends ACustomAnimate<Record<string, number>> {
  declare valid: boolean;

  constructor(from: null, to: null, duration: number, easing: EasingType, params?: IScaleAnimationOptions) {
    super(from, to, duration, easing, params);
  }

  onBind(): void {
    let from: Record<string, number>;
    let to: Record<string, number>;
    // 获取当前的数据
    const attrs = this.target.getFinalAttribute();
    switch (this.params?.direction) {
      case 'x':
        from = { scaleX: attrs?.scaleX ?? 1 };
        to = { scaleX: 0 };
        break;
      case 'y':
        from = { scaleY: attrs?.scaleY ?? 1 };
        to = { scaleY: 0 };
        break;
      case 'xy':
      default:
        from = { scaleX: attrs?.scaleX ?? 1, scaleY: attrs?.scaleY ?? 1 };
        to = {
          scaleX: 0,
          scaleY: 0
        };
    }
    this.props = to;
    this.propKeys = Object.keys(to);
    this.animate.reSyncProps();
    this.from = from;
    this.to = to;
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
